import { prisma } from '@/lib/prisma';
import { validateBillData } from '@/lib/validators';
import { NextRequest, NextResponse } from 'next/server';
import { Prisma } from '@prisma/client';  // Import Prisma for typing

export async function POST(req: NextRequest) {
  try {
    const data = await req.json();
    const validation = validateBillData(data);
    
    if (!validation.success) {
      return NextResponse.json(
        { error: 'Validation failed', details: validation.errors },
        { status: 400 }
      );
    }
    
    const billData = validation.data;

    if (!billData) {
      return NextResponse.json(
        { error: 'No bill data provided' },
        { status: 400 }
      );
    }
    
    // Begin a transaction to handle all related operations
    const savedBill = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // Handle supplier creation if needed
      let supplierId = billData.supplierId;
      
      if (!supplierId && billData.newSupplier) {
        // Create address
        const address = await tx.address.create({
          data: billData.newSupplier.address
        });
        
        // Create phone
        const phone = await tx.phone.create({
          data: billData.newSupplier.phone
        });
        
        // Create supplier
        const supplier = await tx.supplier.create({
          data: {
            name: billData.newSupplier.name,
            gstin: billData.newSupplier.gstin,
            addressId: address.id,
            phoneId: phone.id
          }
        });
        
        supplierId = supplier.id;
      }
      
      // Handle party creation if needed
      let partyId = billData.partyId;
      
      if (!partyId && billData.newParty) {
        // Create address
        const address = await tx.address.create({
          data: billData.newParty.address
        });
        
        // Create phone
        const phone = await tx.phone.create({
          data: billData.newParty.phone
        });
        
        // Create party
        const party = await tx.party.create({
          data: {
            name: billData.newParty.name,
            gstin: billData.newParty.gstin,
            addressId: address.id,
            phoneId: phone.id
          }
        });
        
        partyId = party.id;
      }
      
      // Create bill with items
      const bill = await tx.bill.create({
        data: {
          bill_number: billData.bill_number,
          bill_date: billData.bill_date,
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
              amount: item.amount
            }))
          }
        },
        include: {
          items: true,
          supplier: {
            include: {
              address: true,
              phone: true
            }
          },
          party: {
            include: {
              address: true,
              phone: true
            }
          }
        }
      });
      
      return bill;
    });
    
    return NextResponse.json(savedBill);
  } catch (error: any) {
    console.error('Bill save error:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to save bill' },
      { status: 500 }
    );
  }
}
