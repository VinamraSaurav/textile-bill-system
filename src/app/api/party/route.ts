import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
    try {
        const parties = await prisma.party.findMany({
            include: {
                address: true,
                phone: true,
                bills: true
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

        // Validate required fields
        if (!name || !gstin || !street || !state || !pincode || !mobile) {
            return NextResponse.json({
                success: false,
                message: 'All fields are required',
                status: 400
            }, {
                status: 400
            });
        }
        // Validate GSTIN format
        const gstinRegex = /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z][1-9A-Z][Z][0-9A-Z]$/;
        if (!gstinRegex.test(gstin)) {
            return NextResponse.json({
                success: false,
                message: 'Invalid GSTIN format',
                status: 400
            }, {
                status: 400
            });
        }
        // Validate phone number format
        const phoneRegex = /^[0-9]{10}$/;
        if (!phoneRegex.test(mobile)) {
            return NextResponse.json({
                success: false,
                message: 'Invalid mobile number format',
                status: 400
            }, {
                status: 400
            });
        }
        // Check if party with the same GSTIN already exists
        const existingParty = await prisma.party.findFirst({
            where: {
                gstin
            }
        });
        if (existingParty) {
            return NextResponse.json({
                success: false,
                message: 'Party with the same GSTIN already exists',
                status: 400
            }, {
                status: 400
            });
        }

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