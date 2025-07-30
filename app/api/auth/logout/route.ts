import { NextRequest, NextResponse } from 'next/server';
import { removeAuthToken } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Remove the auth token from cookies
    await removeAuthToken();
    
    return NextResponse.json({
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Logout error:', error);
    return NextResponse.json(
      { error: 'An error occurred during logout' },
      { status: 500 }
    );
  }
} 