import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const parties = await prisma.party.findMany({
            include: {
                address: true,
                phone: true
            }
        });
        return NextResponse.json({
            success: true,
            data: parties,
            message: 'Parties fetched successfully',
            status: 200
        }, {
            status: 200
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            message: error.message,
            status: 500
        }, {
            status: 500
        });
    }
}

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();

        const {
            name,
            gstin,
            address: {
                street,
                city,
                post,
                district,
                state,
                pincode,
                st_code
            },
            phone: {
                office,
                mobile
            }
        } = body;

        // Step 1: Create Address
        const address = await prisma.address.create({
            data: {
                street,
                city,
                post,
                district,
                state,
                pincode,
                st_code
            }
        });

        // Step 2: Create Phone
        const phone = await prisma.phone.create({
            data: {
                office,
                mobile
            }
        });

        // Step 3: Create Party
        const party = await prisma.party.create({
            data: {
                name,
                gstin,
                addressId: address.id,
                phoneId: phone.id
            }
        });

        return NextResponse.json({
            success: true,
            data: party,
            message: 'Party created successfully',
            status: 201
        }, {
            status: 201
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            message: error.message,
            status: 500
        }, {
            status: 500
        });
    }
}