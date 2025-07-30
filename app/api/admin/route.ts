import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth';

export async function GET(request: NextRequest) {
  try {
    await requireAdmin();
    return NextResponse.json({ message: 'Admin access granted' });
  } catch {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }
} 