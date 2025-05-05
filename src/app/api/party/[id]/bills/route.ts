import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    req : NextRequest,
    { params } : { params: { id : string }}
){
    const partyId = params.id;
    try{
        const bills = await prisma.bill.findMany({
            where : {
                partyId : partyId
            },
            include : {
                items : true,
                party : true,
                supplier : true,
            }
        });
        return NextResponse.json({
            success : true,
            data : bills,
            message : "Bills fetched successfully",
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