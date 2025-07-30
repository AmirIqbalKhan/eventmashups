import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { users } from '@/lib/database/schema';
import { eq } from 'drizzle-orm';
import { hashPassword, generateToken, setAuthToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const { firstName, lastName, email, password } = await request.json();

    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters long' },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    
    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'An account with this email already exists' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await hashPassword(password);

    // Create new user
    const newUser = await db.insert(users).values({
      firstName,
      lastName,
      email,
      password: hashedPassword,
      isOrganizer: false,
      isAdmin: false
    }).returning();

    const userData = newUser[0];

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
      message: 'Account created successfully',
      user: userWithoutPassword
    });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'An error occurred during signup' },
      { status: 500 }
    );
  }
} 