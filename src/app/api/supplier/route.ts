import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma'; // Adjust the import based on your project structure

export async function GET(req: NextRequest) {
    const suppliers = await prisma.supplier.findMany({
      include: {
        address: true,
        phone: true
      }
    });
    
    return NextResponse.json(suppliers);
  }