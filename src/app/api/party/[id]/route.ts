import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
    req : NextRequest,
    { params } : { params: { id : string }}
){
    const partyId = params.id;
    try{
        const party = await prisma.party.findUnique({
            where : {
                id : partyId,
            },
            include : {
                address : true,
                phone : true
            }
        });
        return NextResponse.json({
            success : true,
            data : party,
            message : "Party fetched successfully",
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
    const partyId = params.id;
    // Check if the party ID is valid
    if(!partyId){
        return NextResponse.json({
            success : false,
            message : "Party ID is required",
            status : 400
        }, {
            status : 400
        })
    }
    // Before deleting party, check if there are any bills associated with the party
    const bills = await prisma.bill.findMany({
        where : {
            partyId : partyId
        }
    });
    if(bills.length > 0){
        return NextResponse.json({
            success : false,
            message : "Cannot delete party with associated bills",
            status : 400
        }, {
            status : 400    
        })
    }
    
    try{
        const party = await prisma.party.findUnique({
            where : {
                id : partyId,
            }
        })

        if(!party){
            return NextResponse.json({
                success : false,
                message : "Party not found",
                status : 404
            }, {
                status : 404
            })
        }

        await prisma.party.delete({
            where : {
                id : partyId,
            },
            include : {
                address : true,
                phone : true
            }
        });

        await prisma.address.delete({
            where : {
                id : party.addressId,
            }
        });
        await prisma.phone.delete({
            where : {
                id : party.phoneId,
            }
        });
        return NextResponse.json({
            success : true,
            data : party,
            message : "Party deleted successfully",
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
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    const partyId = params.id;
    try {
        const body = await req.json();
        const {
            name,
            gstin,
            address: { street, city, post, district, state, pincode, st_code },
            phone: { office, mobile }
        } = body;

        const party = await prisma.party.findUnique({
            where: { id: partyId },
            include: { address: true, phone: true }
        });

        if (!party) {
            return NextResponse.json({
                success: false,
                message: "party not found",
                status: 404
            }, { status: 404 });
        }

        const updatedAddress = await prisma.address.update({
            where: { id: party.addressId },
            data: { street, city, post, district, state, pincode, st_code }
        });

        const updatedPhone = await prisma.phone.update({
            where: { id: party.phoneId },
            data: { office, mobile }
        });

        const updatedparty = await prisma.party.update({
            where: { id: partyId },
            data: {
                name,
                gstin,
                addressId: updatedAddress.id,
                phoneId: updatedPhone.id
            }
        });

        return NextResponse.json({
            success: true,
            data: updatedparty,
            message: "party updated successfully",
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
