import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/auth/hash";
import { createSession } from "@/lib/auth/session";
import { UserSchema } from "@/lib/validators";

export async function GET(){
    try {
        const users = await prisma.user.findMany({
            include: {
                sessions: true
            },
        });
        return NextResponse.json({
            success: true,
            data: users,
            message: "Users fetched successfully",
            status: 200,
        }, {
            status: 200,
        });
    } catch (error: any) {
        return NextResponse.json({
            success: false,
            message: error.message,
            status: 500,
        }, {
            status: 500,
        });
    }
}

export async function POST(
    req: NextRequest
){
    try {
        const { name, email, password, role } = await req.json();

        // Validate input
        const result = UserSchema.safeParse({ name, email, password, role });
        if (!result.success) {
            return NextResponse.json({
                success : false,
                message : result.error.format(),
                status : 400,
            }, {
                status : 400,   
            });
        }

        // Check if email already exists
        const existingUser = await prisma.user.findUnique({ where: { email } });
        if (existingUser) {
            return NextResponse.json({
                error: 'Email already registered',
                status: 400
            }, { 
                status: 400
            });
        }

        // Hash password
        const hashedPassword = await hashPassword(password);

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role as 'ADMIN' | 'STAFF'
            }
        });

        // Create session (auto login)
        // await createSession(user.id);

        return NextResponse.json({
            success: true,
            data: user,
            message: 'User registered successfully',
            status: 201,
        }, { status: 201 });
    } catch (error) {
        console.error('Registration error:', error);
        return NextResponse.json({
            success: false,
            error: 'Failed to register user',
            status: 500
        }, { 
            status: 500
        });
    }
}