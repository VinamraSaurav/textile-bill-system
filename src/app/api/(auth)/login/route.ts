import { NextResponse, NextRequest } from 'next/server';
import { prisma } from '@/lib/prisma';
import { comparePassword } from '@/lib/auth/hash';
import { createSession } from '@/lib/auth/session';

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json();

    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email }
    });

    if (!user) {
      return NextResponse.json({
        success : false,
        message : "User not found",
        status : 404
        }, {
        status : 404
      }
      );
    }

    // Compare password
    const isPasswordValid = await comparePassword(password, user.password);
    if (!isPasswordValid) {
      return NextResponse.json({
        success : false,
        message : "Invalid password",
        status : 401
      }, {
        status : 401
      });
    }

    // Create session
    await createSession(user.id);

    return NextResponse.json({
        success : true,
        message : 'Login successful',
        userId: user.id,
        role: user.role,
        name: user.name,
        email: user.email,
        status : 200
        }, {
        status: 200
    }
    );
  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json({
        success : false,
        message : 'Failed to login',
        status : 500
        }, {
        status: 500
    }
    );
  }
}