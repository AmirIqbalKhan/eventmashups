import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/database';
import { events } from '@/lib/database/schema';
import { getCurrentUser } from '@/lib/auth';
import { eq } from 'drizzle-orm';

// Function to generate a reliable image URL based on category
function generateEventImage(category: string) {
  const categoryImages = {
    'music': 'https://picsum.photos/1600/900?random=1',
    'technology': 'https://picsum.photos/1600/900?random=2',
    'business': 'https://picsum.photos/1600/900?random=3',
    'sports': 'https://picsum.photos/1600/900?random=4',
    'arts': 'https://picsum.photos/1600/900?random=5',
    'food': 'https://picsum.photos/1600/900?random=6',
    'education': 'https://picsum.photos/1600/900?random=7',
    'health': 'https://picsum.photos/1600/900?random=8',
    'entertainment': 'https://picsum.photos/1600/900?random=9',
    'other': 'https://picsum.photos/1600/900?random=10'
  };
  
  return categoryImages[category as keyof typeof categoryImages] || categoryImages['other'];
}

// Function to check if an image URL is broken
function isBrokenImageUrl(url: string | null) {
  if (!url) return true;
  
  // Check for old Unsplash format that might be broken
  if (url.includes('source.unsplash.com')) return true;
  
  // Check for malformed URLs
  if (!url.startsWith('http')) return true;
  
  return false;
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    console.log('Starting to fix broken images...');
    
    // Get all events
    const allEvents = await db.select().from(events);
    
    console.log(`Found ${allEvents.length} events to check`);
    
    let fixedCount = 0;
    const fixedEvents = [];
    
    for (const event of allEvents) {
      if (isBrokenImageUrl(event.image)) {
        console.log(`Fixing broken image for event: ${event.title}`);
        
        const newImageUrl = generateEventImage(event.category);
        
        await db
          .update(events)
          .set({ 
            image: newImageUrl,
            updatedAt: new Date()
          })
          .where(eq(events.id, event.id));
        
        fixedCount++;
        fixedEvents.push({
          id: event.id,
          title: event.title,
          oldImage: event.image,
          newImage: newImageUrl
        });
        
        console.log(`Fixed image for: ${event.title} -> ${newImageUrl}`);
      }
    }
    
    console.log(`\n✅ Fixed ${fixedCount} broken images out of ${allEvents.length} events`);
    
    return NextResponse.json({
      message: `Fixed ${fixedCount} broken images out of ${allEvents.length} events`,
      fixedCount,
      totalEvents: allEvents.length,
      fixedEvents
    });
    
  } catch (error) {
    console.error('Error fixing broken images:', error);
    return NextResponse.json(
      { error: 'Failed to fix broken images' },
      { status: 500 }
    );
  }
} 