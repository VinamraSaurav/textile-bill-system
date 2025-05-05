import { NextResponse } from 'next/server';
import { deleteSession } from '@/lib/auth/session';

export async function POST() {
    try {
        // Delete session
        await deleteSession();
    
        return NextResponse.json({
        success: true,
        message: 'Logout successful',
        status: 200
        }, { status: 200 });
    } catch (error) {
        console.error('Logout error:', error);
        return NextResponse.json({
        success: false,
        message: 'Failed to logout',
        status: 500
        }, { status: 500 });
    }
}