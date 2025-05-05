import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hashPassword } from '@/lib/auth/hash';
import { createSession } from '@/lib/auth/session';

export async function POST(req: Request) {
  try {
    const { name, email, password, role = 'STAFF' } = await req.json();

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    // Validate role
    if (role !== 'ADMIN' && role !== 'STAFF') {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
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
    await createSession(user.id);

    return NextResponse.json({
      message: 'User registered successfully',
      userId: user.id,
      role: user.role
    }, { status: 201 });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Failed to register user' },
      { status: 500 }
    );
  }
}