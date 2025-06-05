import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function GET(
    req : NextRequest,
    { params }: { params: { id: string } }
){
    const supplierId = params.id;
    try {
        const supplier = await prisma.supplier.findUnique({
            where: { id: supplierId },
            include: {
                address: true,
                phone: true
            }
        });

        if (!supplier) {
            return NextResponse.json({
                success: false,
                message: "Supplier not found",
                status: 404
            }, { status: 404 });
        }

        return NextResponse.json({
            success: true,
            data: supplier,
            message: "Supplier fetched successfully",
            status: 200
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            message: error.message,
            status: 500
        }, { status: 500 });
    }
}

export async function DELETE(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const supplierId = params.id;

    // Check if the supplier ID is valid
    if (!supplierId) {
        return NextResponse.json({
            success: false,
            message: "Supplier ID is required",
            status: 400
        }, { status: 400 });
    }
    // Before deleting supplier, check if there are any bills associated with the supplier
    const bills = await prisma.bill.findMany({
        where: { supplierId: supplierId }
    });
    if (bills.length > 0) {
        return NextResponse.json({
            success: false,
            message: "Cannot delete supplier with associated bills",
            status: 400
        }, { status: 400 });
    }
    try {
        const supplier = await prisma.supplier.findUnique({
            where: { id: supplierId },
            include: {
                address: true,
                phone: true
            }
        });

        if (!supplier) {
            return NextResponse.json({
                success: false,
                message: "Supplier not found",
                status: 404
            }, { status: 404 });
        }

        await prisma.supplier.delete({
            where: { id: supplierId }
        });

        await prisma.address.delete({
            where: { id: supplier.addressId }
        });

        await prisma.phone.delete({
            where: { id: supplier.phoneId }
        });

        return NextResponse.json({
            success: true,
            message: "Supplier and related data deleted successfully",
            status: 200
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            message: error.message,
            status: 500
        }, { status: 500 });
    }
}


export async function PUT(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const supplierId = params.id;
    try {
        const body = await req.json();
        const {
            name,
            gstin,
            address: { street, city, post, district, state, pincode, st_code },
            phone: { office, mobile }
        } = body;

        const supplier = await prisma.supplier.findUnique({
            where: { id: supplierId },
            include: { address: true, phone: true }
        });

        if (!supplier) {
            return NextResponse.json({
                success: false,
                message: "Supplier not found",
                status: 404
            }, { status: 404 });
        }

        const updatedAddress = await prisma.address.update({
            where: { id: supplier.addressId },
            data: { street, city, post, district, state, pincode, st_code }
        });

        const updatedPhone = await prisma.phone.update({
            where: { id: supplier.phoneId },
            data: { office, mobile }
        });

        const updatedSupplier = await prisma.supplier.update({
            where: { id: supplierId },
            data: {
                name,
                gstin,
                addressId: updatedAddress.id,
                phoneId: updatedPhone.id
            }
        });

        return NextResponse.json({
            success: true,
            data: updatedSupplier,
            message: "Supplier updated successfully",
            status: 200
        }, { status: 200 });

    } catch (error: any) {
        return NextResponse.json({
            success: false,
            message: error.message,
            status: 500
        }, { status: 500 });
    }
}
