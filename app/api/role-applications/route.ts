import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { roleApplications, users } from '@/lib/database/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, and, desc } from 'drizzle-orm';

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { requestedRole, reason } = await request.json();

    if (!requestedRole || !reason) {
      return NextResponse.json(
        { error: 'Requested role and reason are required' },
        { status: 400 }
      );
    }

    if (!['admin', 'organizer'].includes(requestedRole)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be "admin" or "organizer"' },
        { status: 400 }
      );
    }

    // Check if user already has a role
    if (user.isAdmin && requestedRole === 'organizer') {
      return NextResponse.json(
        { error: 'Admins cannot apply for organizer roles' },
        { status: 400 }
      );
    }

    if (user.isOrganizer && requestedRole === 'admin') {
      return NextResponse.json(
        { error: 'Organizers cannot apply for admin roles' },
        { status: 400 }
      );
    }

    // Check if user already has an application pending
    const existingApplication = await db
      .select()
      .from(roleApplications)
      .where(and(
        eq(roleApplications.userId, user.id),
        eq(roleApplications.status, 'pending')
      ));

    if (existingApplication.length > 0) {
      return NextResponse.json(
        { error: 'You already have a pending role application' },
        { status: 400 }
      );
    }

    // Create new application
    await db.insert(roleApplications).values({
      userId: user.id,
      requestedRole,
      reason,
      status: 'pending'
    });

    return NextResponse.json({
      message: 'Role application submitted successfully'
    });
  } catch (error) {
    console.error('Role application error:', error);
    return NextResponse.json(
      { error: 'An error occurred while submitting application' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    let applications;
    
    if (user.isAdmin) {
      // Admins can see all pending applications
      applications = await db
        .select({
          id: roleApplications.id,
          userId: roleApplications.userId,
          requestedRole: roleApplications.requestedRole,
          reason: roleApplications.reason,
          status: roleApplications.status,
          createdAt: roleApplications.createdAt,
          reviewedBy: roleApplications.reviewedBy,
          reviewedAt: roleApplications.reviewedAt,
          user: {
            firstName: users.firstName,
            lastName: users.lastName,
            email: users.email
          }
        })
        .from(roleApplications)
        .leftJoin(users, eq(roleApplications.userId, users.id))
        .orderBy(desc(roleApplications.createdAt));
    } else {
      // Regular users can only see their own applications
      applications = await db
        .select({
          id: roleApplications.id,
          userId: roleApplications.userId,
          requestedRole: roleApplications.requestedRole,
          reason: roleApplications.reason,
          status: roleApplications.status,
          createdAt: roleApplications.createdAt,
          reviewedBy: roleApplications.reviewedBy,
          reviewedAt: roleApplications.reviewedAt
        })
        .from(roleApplications)
        .where(eq(roleApplications.userId, user.id))
        .orderBy(desc(roleApplications.createdAt));
    }

    return NextResponse.json(applications);
  } catch (error) {
    console.error('Role applications fetch error:', error);
    return NextResponse.json(
      { error: 'An error occurred while fetching applications' },
      { status: 500 }
    );
  }
} 