import { NextResponse } from 'next/server';
import { S3Utils } from '@/lib/s3Utils';

const s3Utils = new S3Utils({
  bucket: process.env.AWS_S3_BUCKET!,
  region: process.env.AWS_REGION!,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
});

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '2');
    const page = parseInt(searchParams.get('page') || '1');

    const reels = await s3Utils.getReels();
  
    
    // Calculate pagination
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedReels = reels.slice(startIndex, endIndex);
    
    return NextResponse.json({
      data: paginatedReels,
      pagination: {
        currentPage: page,
        totalItems: reels.length,
        itemsPerPage: limit
      }
    });
  } catch (error) {
    console.error('Error fetching reels:', error);
    return NextResponse.json(
      { error: 'Failed to fetch reels' },
      { status: 500 }
    );
  }
}