import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';
import { PrismaClientKnownRequestError } from '@prisma/client/runtime/library';
import { validateBillData } from '@/lib/validators';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    // Step 1: Get and validate the data from the request
    const data = await req.json();
    const validation = validateBillData(data);
    
    if (!validation.success) {
      return NextResponse.json({
        success: false,
        message: validation.errors,
        status: 400
      }, {
        status: 400
      });
    }

    const billData = validation.data;

    if (!billData) {
      return NextResponse.json({ 
        success: false,
        message: 'Invalid bill data',
        status: 400
      }, { 
        status: 400 
      });
    }
    
    // Step 2: Begin a transaction to handle all related operations
    const savedBill = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Check if the bill already exists with the same bill_number and bill_date
      const existingBill = await tx.bill.findFirst({
        where: {
          bill_number: billData.bill_number,
          bill_date: new Date(billData.bill_date),
        },
      });

      if (existingBill) {
        throw new Error('Bill with the same bill number and date already exists');
      }

      // Handle supplier
      let supplierId = billData.supplierId;
      
      if (!supplierId && billData.newSupplier) {
        // Check if supplier with the same GSTIN already exists
        if (billData.newSupplier.gstin) {
          const existingSupplier = await tx.supplier.findUnique({
            where: {
              gstin: billData.newSupplier.gstin,
            },
          });

          if (existingSupplier) {
            throw new Error('Supplier with the same GSTIN already exists');
          }
        }

        // Validate required fields for address
        if (!billData.newSupplier.address?.state || !billData.newSupplier.address?.pincode) {
          throw new Error('Supplier address must include state and pincode');
        }

        // Validate required fields for phone
        if (!billData.newSupplier.phone?.mobile || billData.newSupplier.phone.mobile.length === 0) {
          throw new Error('Supplier must have at least one mobile number');
        }
        
        // Create address
        const address = await tx.address.create({
          data: {
            street: billData.newSupplier.address.street || null,
            city: billData.newSupplier.address.city || null,
            post: billData.newSupplier.address.post || null,
            district: billData.newSupplier.address.district || null,
            state: billData.newSupplier.address.state,
            pincode: billData.newSupplier.address.pincode,
            st_code: billData.newSupplier.address.st_code || null,
          },
        });
        
        // Create phone
        const phone = await tx.phone.create({
          data: {
            office: billData.newSupplier.phone.office || [],
            mobile: billData.newSupplier.phone.mobile,
          },
        });
        
        // Create supplier
        const supplier = await tx.supplier.create({
          data: {
            name: billData.newSupplier.name,
            gstin: billData.newSupplier.gstin,
            addressId: address.id,
            phoneId: phone.id,
          },
        });

        supplierId = supplier.id;
      } else if (!supplierId) {
        throw new Error('Either supplier ID or new supplier details must be provided');
      } else {
        // Verify that the supplier exists if supplierID is provided
        const existingSupplier = await tx.supplier.findUnique({
          where: { id: supplierId }
        });
        
        if (!existingSupplier) {
          throw new Error('Supplier with the provided ID does not exist');
        }
      }
      
      // Handle party
      let partyId = billData.partyId;
      
      if (!partyId && billData.newParty) {
        // Check if party with the same GSTIN already exists
        if (billData.newParty.gstin) {
          const existingParty = await tx.party.findUnique({
            where: {
              gstin: billData.newParty.gstin,
            },
          });

          if (existingParty) {
            throw new Error('Party with the same GSTIN already exists');
          }
        }

        // Validate required fields for address
        if (!billData.newParty.address?.state || !billData.newParty.address?.pincode) {
          throw new Error('Party address must include state and pincode');
        }

        // Validate required fields for phone
        if (!billData.newParty.phone?.mobile || billData.newParty.phone.mobile.length === 0) {
          throw new Error('Party must have at least one mobile number');
        }
        
        // Create address
        const address = await tx.address.create({
          data: {
            street: billData.newParty.address.street || null,
            city: billData.newParty.address.city || null,
            post: billData.newParty.address.post || null,
            district: billData.newParty.address.district || null,
            state: billData.newParty.address.state,
            pincode: billData.newParty.address.pincode,
            st_code: billData.newParty.address.st_code || null,
          },
        });
        
        // Create phone
        const phone = await tx.phone.create({
          data: {
            office: billData.newParty.phone.office || [],
            mobile: billData.newParty.phone.mobile,
          },
        });
        
        // Create party
        const party = await tx.party.create({
          data: {
            name: billData.newParty.name,
            gstin: billData.newParty.gstin,
            addressId: address.id,
            phoneId: phone.id,
          },
        });

        partyId = party.id;
      } else if (!partyId) {
        throw new Error('Either party ID or new party details must be provided');
      } else {
        // Verify that the party exists if partyId is provided
        const existingParty = await tx.party.findUnique({
          where: { id: partyId }
        });
        
        if (!existingParty) {
          throw new Error('Party with the provided ID does not exist');
        }
      }
      
      // We're not validating bill items or total calculation as per your request
      // The validation for items will be handled by the schema validator

      // Validate payment status
      if (!['paid', 'unpaid'].includes(billData.payment_status.toLowerCase())) {
        throw new Error('Payment status must be either "paid" or "unpaid"');
      }
      
      // Step 3: Create the bill and its items
      const bill = await tx.bill.create({
        data: {
          bill_number: billData.bill_number,
          bill_date: new Date(billData.bill_date),
          location: billData.location,
          total_billed_amount: billData.total_billed_amount,
          payment_status: billData.payment_status.toLowerCase(),
          supplierId: supplierId,
          partyId: partyId,
          items: {
            create: billData.items.map((item: any) => ({
              name: item.name,
              hsn: item.hsn,
              quantity: item.quantity,
              rate: item.rate,
              amount: item.amount,
            })),
          },
        },
        include: {
          items: true,
          supplier: {
            include: {
              address: true,
              phone: true,
            },
          },
          party: {
            include: {
              address: true,
              phone: true,
            },
          },
        },
      });
      
      return bill;
    }, {
      // Set transaction isolation level for better consistency
      isolationLevel: "Serializable",
      maxWait: 5000, // 5 seconds max wait time
      timeout: 10000, // 10 seconds timeout
    });

    // Return the created bill
    return NextResponse.json({
      success: true,
      data: savedBill,
      message: 'Bill saved successfully',
      status: 201,
    }, {
      status: 201
    });
  } catch (error: any) {
    console.error('Bill save error:', error);
    
    // Handle specific error types with appropriate status codes
    if (error.message.includes('already exists') || 
        error.message.includes('must include') || 
        error.message.includes('must have') ||
        error.message.includes('does not match') ||
        error.message.includes('does not exist') ||
        error.message.includes('must be either')) {
      return NextResponse.json({
        success: false,
        message: error.message,
        status: 400
      }, {
        status: 400
      });
    }
    // Handle Prisma specific errors
    if (error instanceof PrismaClientKnownRequestError) {
      if (error.code === 'P2002') {
        return NextResponse.json({
          success: false,
          message: 'A unique constraint was violated. This record already exists.',
          status: 409
        }, {
          status: 409
        });
      }
      return NextResponse.json({
        success: false,
        message: 'An unexpected error occurred while processing your request',
        error: error.message,
        status: 500
      }, {
        status: 500
      });
    }
  }
}