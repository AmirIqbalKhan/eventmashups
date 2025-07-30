import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { users } from '@/lib/database/schema';
import { eq } from 'drizzle-orm';
import { verifyPassword, generateToken, setAuthToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Find user by email
    const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (user.length === 0) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    const userData = user[0];

    // Verify password
    const isValidPassword = await verifyPassword(password, userData.password);
    
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Invalid email or password' },
        { status: 401 }
      );
    }

    // Generate JWT token
    const token = generateToken({
      userId: userData.id,
      email: userData.email,
      isOrganizer: userData.isOrganizer || false,
      isAdmin: userData.isAdmin || false
    });

    // Set auth token in cookie
    await setAuthToken(token);

    // Return user data (without password)
    const { password: _, ...userWithoutPassword } = userData;
    
    return NextResponse.json({
      message: 'Login successful',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Login error:', error);
    return NextResponse.json(
      { error: 'An error occurred during login' },
      { status: 500 }
    );
  }
} 