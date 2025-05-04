import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
    const parties = await prisma.party.findMany({
      include: {
        address: true,
        phone: true
      }
    });
    
    return NextResponse.json(parties);
  }