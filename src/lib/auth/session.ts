import { cookies } from 'next/headers';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '@/lib/prisma';

const SESSION_COOKIE = 'bill_session';

export const createSession = async (userId: string) => {
  const cookieStore = cookies(); // ✅ Don't use await
  const sessionId = uuidv4();
  const expires = new Date(Date.now() + 1000 * 60 * 60 * 24 * 7); // 7 days

  await prisma.session.create({
    data: {
      userId,
      sessionId,
      expires
    }
  });

  cookieStore.set(SESSION_COOKIE, sessionId, {
    httpOnly: true,
    path: '/',
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    expires
  });
};

export const getSessionUser = async () => {
  const cookieStore = cookies(); // ✅ Don't use await
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (!sessionId) return null;

  const session = await prisma.session.findUnique({
    where: { sessionId },
    include: { user: true }
  });

  if (!session || session.expires < new Date()) {
    return null;
  }

  return session.user;
};

export const deleteSession = async () => {
  const cookieStore = cookies(); // ✅ Don't use await
  const sessionId = cookieStore.get(SESSION_COOKIE)?.value;
  if (sessionId) {
    await prisma.session.deleteMany({ where: { sessionId } });
    cookieStore.delete(SESSION_COOKIE);
  }
};
