import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    req : NextRequest,
    { params } : { params: { id : string }}
){
    const billId = params.id;
    try{
        const bill = await prisma.bill.findUnique({
            where : {
                id : billId
            },
            include : {
                items : true,
                party : true,
                supplier : true,
            }
        });
        return NextResponse.json({
            success : true,
            data : bill,
            message : "Bill fetched successfully",
            status : 200
        }, {
            status : 200
        })
    } catch(error : any){
        return NextResponse.json({
            success : false,
            message : error.message,
            status : 500
        }, {
            status : 500
        })
    }
}

export async function DELETE(
    req : NextRequest,
    { params } : { params: { id : string }}
){
    const billId = params.id;
    try{

        const bill = await prisma.bill.findUnique({
            where : {
                id : billId
            }
        });

        if(!bill){
            return NextResponse.json({
                success : false,
                message : "Bill not found",
                status : 404
            }, {
                status : 404
            })
        }
        // Delete all items associated with the bill
        await prisma.billItem.deleteMany({
            where : {
                billId : billId
            }
        });
        // Delete the bill
        await prisma.bill.delete({
            where : {
                id : billId
            }
        });
        // Return success response
        return NextResponse.json({
            success : true,
            data : bill,
            message : "Bill deleted successfully",
            status : 200
        }, {
            status : 200
        })
    } catch(error : any){
        return NextResponse.json({
            success : false,
            message : error.message,
            status : 500
        }, {
            status : 500
        })
    }
}

export async function PUT(
    req : NextRequest,
    { params } : { params: { id : string }}
){
    const billId = params.id;
    const billData = await req.json();
    try{
        const bill = await prisma.bill.update({
            where : {
                id : billId
            },
            data : {
                bill_number : billData.bill_number,
                bill_date : billData.bill_date,
                location : billData.location,
                total_billed_amount : billData.total_billed_amount,
                payment_status : billData.payment_status,
                supplierId : billData.supplierId,
                partyId : billData.partyId
            }
        });
        return NextResponse.json({
            success : true,
            data : bill,
            message : "Bill updated successfully",
            status : 200
        }, {
            status : 200
        })
    } catch(error : any){
        return NextResponse.json({
            success : false,
            message : error.message,
            status : 500
        }, {
            status : 500
        })
    }
}