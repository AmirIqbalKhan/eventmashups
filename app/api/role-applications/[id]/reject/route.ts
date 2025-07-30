import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { roleApplications } from '@/lib/database/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq } from 'drizzle-orm';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const user = await getCurrentUser();
    
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only admins can reject role applications
    if (!user.isAdmin) {
      return NextResponse.json({ error: 'Only admins can reject role applications' }, { status: 403 });
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

    // Update application status to rejected
    await db
      .update(roleApplications)
      .set({ 
        status: 'rejected',
        updatedAt: new Date()
      })
      .where(eq(roleApplications.id, applicationId));

    return NextResponse.json({ 
      message: 'Role application rejected successfully',
      applicationId: applicationId,
      userId: application.userId,
      role: application.requestedRole
    });
  } catch (error) {
    console.error('Role application rejection error:', error);
    return NextResponse.json(
      { error: 'An error occurred while rejecting the role application' },
      { status: 500 }
    );
  }
} 