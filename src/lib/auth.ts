import { SignJWT, jwtVerify } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import bcrypt from 'bcryptjs';
import { db } from './db';
import type { Role } from '@/generated/prisma/client';

const COOKIE = 'ks_session';
const secret = () => new TextEncoder().encode(process.env.AUTH_SECRET || 'dev-secret-change-me');

export type Session = { userId: string; role: Role; name: string; email: string };

export async function createSession(s: Session) {
  const token = await new SignJWT(s).setProtectedHeader({ alg: 'HS256' }).setIssuedAt().setExpirationTime('30d').sign(secret());
  cookies().set(COOKIE, token, { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production', path: '/', maxAge: 60 * 60 * 24 * 30 });
}

export function clearSession() {
  cookies().delete(COOKIE);
}

export async function getSession(): Promise<Session | null> {
  const token = cookies().get(COOKIE)?.value;
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, secret());
    return payload as unknown as Session;
  } catch {
    return null;
  }
}

export async function requireUser(next?: string) {
  const s = await getSession();
  if (!s) redirect(`/signin${next ? `?next=${encodeURIComponent(next)}` : ''}`);
  return s;
}

export async function requireSeller() {
  const s = await requireUser('/seller');
  const seller = await db.seller.findUnique({ where: { userId: s.userId } });
  if (!seller) redirect('/seller/register');
  return { session: s, seller };
}

export async function requireApprovedSeller() {
  const r = await requireSeller();
  if (r.seller.status !== 'APPROVED') redirect('/seller/pending');
  return r;
}

export async function requireAdmin() {
  const s = await requireUser('/admin');
  if (s.role !== 'ADMIN') redirect('/');
  return s;
}

export const hashPassword = (p: string) => bcrypt.hash(p, 10);
export const verifyPassword = (p: string, h: string) => bcrypt.compare(p, h);
