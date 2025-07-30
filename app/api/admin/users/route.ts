import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { users } from '@/lib/database/schema';
import { getCurrentUser, requireAdmin } from '@/lib/auth';
import { desc, eq } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    const user = await requireAdmin();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allUsers = await db
      .select({
        id: users.id,
        firstName: users.firstName,
        lastName: users.lastName,
        email: users.email,
        isOrganizer: users.isOrganizer,
        isAdmin: users.isAdmin,
        createdAt: users.createdAt
      })
      .from(users)
      .orderBy(desc(users.createdAt));

    return NextResponse.json(allUsers);
  } catch (error) {
    console.error('Admin users error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching users' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const user = await requireAdmin();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { userId, role, action } = await request.json();

    if (!userId || !role || !action) {
      return NextResponse.json(
        { error: 'User ID, role, and action are required' },
        { status: 400 }
      );
    }

    if (!['organizer', 'admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be "organizer" or "admin"' },
        { status: 400 }
      );
    }

    if (!['grant', 'revoke'].includes(action)) {
      return NextResponse.json(
        { error: 'Invalid action. Must be "grant" or "revoke"' },
        { status: 400 }
      );
    }

    // Ensure users can only have one role at a time
    const updateData: any = {
      isAdmin: false,
      isOrganizer: false
    };
    
    if (action === 'grant') {
      // Grant the requested role and remove all other roles
      if (role === 'organizer') {
        updateData.isOrganizer = true;
        updateData.isAdmin = false;
      } else if (role === 'admin') {
        updateData.isAdmin = true;
        updateData.isOrganizer = false;
      }
    } else {
      // Revoke the requested role (user becomes regular user)
      if (role === 'organizer') {
        updateData.isOrganizer = false;
      } else if (role === 'admin') {
        updateData.isAdmin = false;
      }
    }

    await db
      .update(users)
      .set(updateData)
      .where(eq(users.id, userId));

    return NextResponse.json({ 
      message: `${role} role ${action === 'grant' ? 'granted' : 'revoked'} successfully. User now has only one role.` 
    });
  } catch (error) {
    console.error('Admin user update error:', error);
    return NextResponse.json(
      { error: 'An error occurred while updating user' },
      { status: 500 }
    );
  }
} 