import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { UserSchema } from "@/lib/validators";
import { hashPassword } from "@/lib/auth/hash";


// GET /api/user/[id]
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: params.id },
      include: { sessions: true },
    });

    if (!user) {
      return NextResponse.json({ 
        success : false,
        status: 404,
        message: "User not found"
      }, { status: 404 });
    }

    return NextResponse.json({ 
        success : true,
        data: user,
        message: "User fetched successfully",
        status: 200
    }, { status: 200 });
  } catch (error) {
    return NextResponse.json({ 
        success : false,
        message: "Failed to fetch user",
        status: 500
    }, { status: 500 });
  }
}

// PUT /api/user/[id]
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const body = await req.json();
    const result = UserSchema.safeParse(body); // partial for updates

    if (!result.success) {
      return NextResponse.json({ 
        success : false,
        message: result.error.format(),
        status: 400
       }, { status: 400 });
    }
    const { name, email, password, role } = result.data;

    const hashedPassword = await hashPassword(password);

    const updatedUser = await prisma.user.update({
      where: { id: params.id },
      data: {
        name,
        email,
        password: hashedPassword,
        role,
      }
    });

    return NextResponse.json({ 
        success : true,
        data: updatedUser,
        message: "User updated successfully",
        status: 200
     }, { status: 200 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ 
        success : false,
        message: "Failed to update user",
        status: 500
    }, { status: 500 });
  }
}

// DELETE /api/user/[id]
export async function DELETE(
    req: NextRequest, 
    { params }: { params: { id: string } }
) {
    try {
      const existing = await prisma.user.findUnique({ where: { id: params.id } });
  
      if (!existing) {
        return NextResponse.json({ 
            success : false,
            message: "User not found",
            status: 404
         }, { status: 404 });
      }
  
      // Delete all sessions for this user
      await prisma.session.deleteMany({
        where: { userId: params.id },
      });
  
      // Delete the user
      await prisma.user.delete({
        where: { id: params.id },
      });
  
      return NextResponse.json({ 
            success : true,
            message: "User deleted successfully",
            status: 200
       }, { status: 200 });
    } catch (error) {
      console.error(error);
      return NextResponse.json({ 
            success : false,
            message: "Failed to delete user",
            status: 500
       }, { status: 500 });
    }
  }
  