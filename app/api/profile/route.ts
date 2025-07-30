import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { users } from '@/lib/database/schema';
import { verifyToken } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value || '';
    const payload = verifyToken(token);
    
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const user = await db
      .select()
      .from(users)
      .where(eq(users.id, payload.userId))
      .limit(1);
    if (!user[0]) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const { password, ...userData } = user[0];
    return NextResponse.json(userData);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const token = request.cookies.get('auth-token')?.value || '';
    const payload = verifyToken(token);
    if (!payload) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await request.json();
    const { firstName, lastName, bio, avatar, interests } = body;
    const [updatedUser] = await db
      .update(users)
      .set({
        firstName,
        lastName,
        bio,
        avatar,
        interests,
        updatedAt: new Date(),
      })
      .where(eq(users.id, payload.userId))
      .returning();
    if (!updatedUser) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    const { password, ...userData } = updatedUser;
    return NextResponse.json(userData);
  } catch (error) {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
} 