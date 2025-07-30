import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { roleApplications, users } from '@/lib/database/schema';
import { getCurrentUser, requireAdmin } from '@/lib/auth';
import { eq, and } from 'drizzle-orm';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const admin = await requireAdmin();
    if (!admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { action } = await request.json();

    if (!action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json(
        { error: 'Action must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    // Get the application
    const [application] = await db
      .select()
      .from(roleApplications)
      .where(eq(roleApplications.id, params.id))
      .limit(1);

    if (!application) {
      return NextResponse.json(
        { error: 'Application not found' },
        { status: 404 }
      );
    }

    if (application.status !== 'pending') {
      return NextResponse.json(
        { error: 'Application has already been reviewed' },
        { status: 400 }
      );
    }

    // Update application status
    await db
      .update(roleApplications)
      .set({
        status: action,
        reviewedBy: admin.id,
        reviewedAt: new Date()
      })
      .where(eq(roleApplications.id, params.id));

    if (action === 'approve') {
      // Update user role - ensure they only have one role
      const updateData: any = {
        isAdmin: false,
        isOrganizer: false
      };

      if (application.requestedRole === 'admin') {
        updateData.isAdmin = true;
        updateData.isOrganizer = false;
      } else if (application.requestedRole === 'organizer') {
        updateData.isOrganizer = true;
        updateData.isAdmin = false;
      }

      await db
        .update(users)
        .set(updateData)
        .where(eq(users.id, application.userId));
    }

    return NextResponse.json({
      message: `Application ${action}ed successfully. User now has only one role.`
    });
  } catch (error) {
    console.error('Role application review error:', error);
    return NextResponse.json(
      { error: 'An error occurred while reviewing the application' },
      { status: 500 }
    );
  }
} 