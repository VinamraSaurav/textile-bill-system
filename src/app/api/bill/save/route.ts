import { prisma } from '@/lib/prisma';
import { validateBillData } from '@/lib/validators';
import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';  

export async function POST(req: NextRequest) {
  try {
    // Step 1: Get and validate the data from the request
    const data = await req.json();
    const validation = validateBillData(data);
    
    if (!validation.success) {
      return NextResponse.json({
        success : false,
        message : validation.errors,
        status : 400
      }, {
        status : 400
      });
    }

    const billData = validation.data;

    if (!billData) {
      return NextResponse.json(
        { 
          success : false,
          message : 'Invalid bill data',
          status : 400
        },
        { status: 400 }
      );
    }
    
    // Step 2: Begin a transaction to handle all related operations
    const savedBill = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      let supplierId = billData.supplierId;
      
      // Check if supplier exists or create a new one
      if (!supplierId && billData.newSupplier) {
        // Create address
        const address = await tx.address.create({
          data: billData.newSupplier.address,
        });
        
        // Create phone
        const phone = await tx.phone.create({
          data: billData.newSupplier.phone,
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
      }
      
      // Check if party exists or create a new one
      let partyId = billData.partyId;
      
      if (!partyId && billData.newParty) {
        // Create address
        const address = await tx.address.create({
          data: billData.newParty.address,
        });
        
        // Create phone
        const phone = await tx.phone.create({
          data: billData.newParty.phone,
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
      }
      
      // Step 3: Create the bill and its items
      const bill = await tx.bill.create({
        data: {
          bill_number: billData.bill_number,
          bill_date: new Date(billData.bill_date),
          location: billData.location,
          total_billed_amount: billData.total_billed_amount,
          payment_status: billData.payment_status,
          supplierId: supplierId!,
          partyId: partyId!,
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
    return NextResponse.json(
      {
        success: false,
        message: error.message,
        status: 500
      },
      { status: 500 }
    );
  }
}
