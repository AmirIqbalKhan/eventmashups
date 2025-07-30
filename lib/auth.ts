import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { cookies } from 'next/headers';
import { db } from './database';
import { users } from './database/schema';
import { eq } from 'drizzle-orm';

export interface JWTPayload {
  userId: string;
  email: string;
  isOrganizer: boolean;
  isAdmin: boolean;
}

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 12);
}

export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '7d' });
}

export function verifyToken(token: string): JWTPayload | null {
  try {
    return jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
  } catch {
    return null;
  }
}

export async function getAuthToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get('auth-token')?.value || null;
}

export async function setAuthToken(token: string): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.set('auth-token', token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
  });
}

export async function removeAuthToken(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete('auth-token');
}

export async function getCurrentUser(): Promise<any | null> {
  const token = await getAuthToken();
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload) return null;

  const user = await db.select().from(users).where(eq(users.id, payload.userId)).limit(1);
  return user[0] || null;
}

export async function requireAdmin(): Promise<any> {
  const user = await getCurrentUser();
  if (!user || !user.isAdmin) {
    throw new Error('Forbidden: Admins only');
  }
  return user;
}

export async function requireOrganizer(): Promise<any> {
  const user = await getCurrentUser();
  if (!user || !user.isOrganizer) {
    throw new Error('Forbidden: Organizers only');
  }
  return user;
} 