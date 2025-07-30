import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { events } from '@/lib/database/schema';
import { eq, and, sql } from 'drizzle-orm';

export async function GET(request: NextRequest) {
  try {
    // Get category counts for published events
    const categoryCounts = await db
      .select({
        category: events.category,
        count: sql<number>`count(*)`,
      })
      .from(events)
      .where(eq(events.isPublished, true))
      .groupBy(events.category)
      .orderBy(sql`count(*) desc`);

    // Define category icons
    const categoryIcons: Record<string, string> = {
      'Technology': '💻',
      'Music': '🎵',
      'Sports': '⚽',
      'Business': '💼',
      'Arts': '🎨',
      'Food': '🍽️',
      'Education': '📚',
      'Health': '🏥',
      'Other': '🎪',
    };

    // Format categories with icons
    const categories = categoryCounts.map(({ category, count }) => ({
      name: category,
      icon: categoryIcons[category] || '🎪',
      count: Number(count),
    }));

    // Add default categories if none exist
    if (categories.length === 0) {
      const defaultCategories = [
        { name: 'Technology', icon: '💻', count: 0 },
        { name: 'Music', icon: '🎵', count: 0 },
        { name: 'Sports', icon: '⚽', count: 0 },
        { name: 'Business', icon: '💼', count: 0 },
        { name: 'Arts', icon: '🎨', count: 0 },
        { name: 'Food', icon: '🍽️', count: 0 },
        { name: 'Education', icon: '📚', count: 0 },
        { name: 'Health', icon: '🏥', count: 0 },
      ];
      return NextResponse.json({ categories: defaultCategories });
    }

    return NextResponse.json({ categories });
  } catch (error) {
    console.error('Categories fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
} 