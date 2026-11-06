'use server';
import { z } from 'zod';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { createSession, clearSession, hashPassword, verifyPassword, getSession } from '@/lib/auth';

const signupSchema = z.object({ name: z.string().min(2), email: z.string().email(), password: z.string().min(6), phone: z.string().optional() });

export async function signup(prev: any, form: FormData) {
  const parsed = signupSchema.safeParse(Object.fromEntries(form));
  if (!parsed.success) return { error: 'Please check your details — name, valid email and a 6+ character password.' };
  const { name, email, password, phone } = parsed.data;
  const exists = await db.user.findUnique({ where: { email: email.toLowerCase() } });
  if (exists) return { error: 'An account with this email already exists. Try signing in.' };
  const user = await db.user.create({ data: { name, email: email.toLowerCase(), phone, passwordHash: await hashPassword(password) } });
  await createSession({ userId: user.id, role: user.role, name: user.name, email: user.email });
  redirect(String(form.get('next') || '/'));
}

export async function signin(prev: any, form: FormData) {
  const email = String(form.get('email') || '').toLowerCase();
  const password = String(form.get('password') || '');
  const user = await db.user.findUnique({ where: { email } });
  if (!user || !(await verifyPassword(password, user.passwordHash))) return { error: 'Incorrect email or password.' };
  await createSession({ userId: user.id, role: user.role, name: user.name, email: user.email });
  redirect(String(form.get('next') || '/'));
}

export async function signout() {
  clearSession();
  redirect('/');
}

export async function updateProfile(prev: any, form: FormData) {
  const s = await getSession();
  if (!s) return { error: 'Not signed in' };
  const name = String(form.get('name') || '').trim();
  const phone = String(form.get('phone') || '').trim();
  if (name.length < 2) return { error: 'Name is too short' };
  await db.user.update({ where: { id: s.userId }, data: { name, phone } });
  await createSession({ ...s, name });
  return { success: 'Profile updated' };
}

export async function changePassword(prev: any, form: FormData) {
  const s = await getSession();
  if (!s) return { error: 'Not signed in' };
  const user = await db.user.findUnique({ where: { id: s.userId } });
  if (!user || !(await verifyPassword(String(form.get('current')), user.passwordHash))) return { error: 'Current password is incorrect' };
  const next = String(form.get('password') || '');
  if (next.length < 6) return { error: 'New password must be at least 6 characters' };
  await db.user.update({ where: { id: s.userId }, data: { passwordHash: await hashPassword(next) } });
  return { success: 'Password changed' };
}
