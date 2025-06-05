import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@/lib/prisma';

const SESSION_COOKIE = 'bill_session';

export const createSession = async (userId: string) => {
  const sessionId = uuidv4();
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

  // Create session in database
  await prisma.session.create({
    data: {
      userId,
      sessionId,
      expires
    }
  });

  // Set cookie
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    expires
  });

  return sessionId;
};

export const getSessionUser = async () => {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
    
    if (!sessionId) {
      return null;
    }

    const session = await prisma.session.findUnique({
      where: { sessionId },
      include: { user: true }
    });

    // Check if session exists and hasn't expired
    if (!session || session.expires < new Date()) {
      // Clean up expired session
      if (session) {
        await prisma.session.delete({ where: { id: session.id } });
      }
      return null;
    }

    return session.user;
  } catch (error) {
    console.error('Error getting session user:', error);
    return null;
  }
};

export const deleteSession = async () => {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
    
    if (sessionId) {
      // Delete session from database
      await prisma.session.deleteMany({ where: { sessionId } });
      
      // Delete cookie
      cookieStore.delete(SESSION_COOKIE);
    }
  } catch (error) {
    console.error('Error deleting session:', error);
  }
};

export const validateSession = async () => {
  const user = await getSessionUser();
  return user !== null;
};

// Utility function to clean up expired sessions (optional - can be called periodically)
export const cleanupExpiredSessions = async () => {
  try {
    await prisma.session.deleteMany({
      where: {
        expires: {
          lt: new Date()
        }
      }
    });
  } catch (error) {
    console.error('Error cleaning up expired sessions:', error);
  }
};