import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";


export async function GET(
    req : NextRequest,
    { params }: { params: { id: string } }
){
    const supplierId = params.id;
    const bills = await prisma.bill.findMany({
        where : {
            supplierId : supplierId
        },
        include : {
            items : true,
            party : true,
        }
    })
}