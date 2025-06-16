import { GenerationUtils } from '@/lib/generationUtils';
import { NextResponse } from 'next/server';

export async function POST(req: Request) {
  try {
    const { athleteName } = await req.json();

    if (!athleteName) {
      return NextResponse.json(
        { error: 'Athlete name is required' },
        { status: 400 }
      );
    }

    const generationUtils = new GenerationUtils();
    // Generate athlete info with images
    const athleteInfo = await generationUtils.generateAthleteInfo(athleteName);
    // Generate voice from description
    const audioStream = await generationUtils.generateVoice(athleteInfo.description);

    return NextResponse.json({
      data: {
        description: athleteInfo.description,
        imageUrls: athleteInfo.imageUrls,
        audioBufferData:audioStream
      },
    });
  } catch (error) {
    console.error('Error in generate route:', error);
    return NextResponse.json(
      { error: 'Failed to generate content' },
      { status: 500 }
    );
  }
}