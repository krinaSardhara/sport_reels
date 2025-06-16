import { NextResponse } from 'next/server';
import { S3Utils } from '@/lib/s3Utils';

const s3Utils = new S3Utils({
  bucket: process.env.AWS_S3_BUCKET!,
  region: process.env.AWS_REGION!,
  accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!
});

export async function POST(req: Request) {
  try {
    const { videoData, metadata } = await req.json();
    
    if (!metadata.athletename) {
      return NextResponse.json(
        { error: 'Athlete name is required' },
        { status: 400 }
      );
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(videoData, 'base64');
    
    // Generate a unique filename with athlete name in the path
    const athletePath = metadata.athletename.toLowerCase().replace(/\s+/g, '-');
    const filename = `${athletePath}-${Date.now()}.mp4`;
    
    // Upload to S3 with metadata
    const videoKey = await s3Utils.uploadVideo(buffer, filename, {
      ...metadata,
      dateCreated: new Date().toISOString(),
      contentType: 'video/mp4',
      athletePath // Store the normalized athlete path in metadata
    });

    // Get a signed URL for immediate access
    const signedUrl = await s3Utils.getSignedUrl(videoKey);
    
    return NextResponse.json({ 
      data: { 
        videoId: videoKey,
        videoUrl: signedUrl,
        metadata,
        athletePath
      }
    });
  } catch (error) {
    console.error('Error in save route:', error);
    return NextResponse.json(
      { error: 'Failed to save video' },
      { status: 500 }
    );
  }
} 