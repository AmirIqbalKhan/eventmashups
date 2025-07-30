import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { roleApplications, users } from '@/lib/database/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can approve role applications
    if (!user.isAdmin) {
      return NextResponse.json({ error: 'Only admins can approve role applications' }, { status: 403 });
    }

    const applicationId = params.id;

    // Check if role application exists
    const existingApplication = await db
      .select()
      .from(roleApplications)
      .where(eq(roleApplications.id, applicationId))
      .limit(1);

    if (existingApplication.length === 0) {
      return NextResponse.json({ error: 'Role application not found' }, { status: 404 });
    }

    const application = existingApplication[0];

    // Check if application is still pending
    if (application.status !== 'pending') {
      return NextResponse.json({ error: 'Application has already been processed' }, { status: 400 });
    }

    // Update the user's role based on the application
    const roleUpdate: any = {};
    if (application.requestedRole === 'organizer') {
      roleUpdate.isOrganizer = true;
    } else if (application.requestedRole === 'admin') {
      roleUpdate.isAdmin = true;
    }

    // Update user role
    await db
      .update(users)
      .set(roleUpdate)
      .where(eq(users.id, application.userId));

    // Update application status to approved
    await db
      .update(roleApplications)
      .set({ 
        status: 'approved',
        updatedAt: new Date()
      })
      .where(eq(roleApplications.id, applicationId));

    return NextResponse.json({ 
      message: 'Role application approved successfully',
      applicationId: applicationId,
      userId: application.userId,
      role: application.requestedRole
    });
  } catch (error) {
    console.error('Role application approval error:', error);
    return NextResponse.json(
      { error: 'An error occurred while approving the role application' },
      { status: 500 }
    );
  }
} 