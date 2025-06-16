"use client";

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';

export default function CreatePage() {
  const router = useRouter();
  const [athleteName, setAthleteName] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [ffmpeg, setFFmpeg] = useState<any>(null);
  const [isFFmpegLoaded, setIsFFmpegLoaded] = useState(false);

  useEffect(() => {
    const loadFFmpeg = async () => {
      try {
        const { FFmpeg } = await import('@ffmpeg/ffmpeg');
        const { toBlobURL } = await import('@ffmpeg/util');
        
        const ffmpegInstance = new FFmpeg();
        const baseURL = 'https://unpkg.com/@ffmpeg/core@0.12.6/dist/umd';
        
        await ffmpegInstance.load({
          coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
        
        setFFmpeg(ffmpegInstance);
        setIsFFmpegLoaded(true);
        console.log('FFmpeg loaded successfully');
      } catch (error) {
        console.error('Failed to load FFmpeg:', error);
      }
    };

    loadFFmpeg();
  }, []);

  const handleSave = async (combinedVideoUrl:string) => {
    try {
      const response = await fetch(combinedVideoUrl);
      const blob = await response.blob();
      
      // Convert blob to base64
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      
      // Create a promise to handle the FileReader
      const base64Promise = new Promise<string>((resolve) => {
        reader.onloadend = () => {
          const base64data = reader.result as string;
          const base64Video = base64data.split(',')[1];
          resolve(base64Video);
        };
      });

      // Wait for the base64 conversion
      const base64Video = await base64Promise;
      
      // Get video duration
      const video = document.createElement('video');
      video.src = combinedVideoUrl;
      // Make the API call with metadata
      const saveResponse = await fetch('/api/save', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          videoData: base64Video,
          contentType: 'video/mp4',
          metadata: {
            athletename:athleteName,
            dateCreated: new Date().toISOString(),
            type: 'sports-reel',
            format: 'mp4',
            resolution: '1080p',
            source: 'ai-generated'
          }
        }),
      });
      
      if (!saveResponse.ok) {
        const errorData = await saveResponse.json();
        throw new Error(errorData.error || 'Failed to save video');
      }

      // Redirect to reels page after successful save
      router.push('/reels');
      setIsLoading(false);
   
    } catch (error) {
      setIsLoading(false);
      console.error('Error saving video:', error);
    }
  }

  const generateVideo = async (imageUrls:string[],audioResult:any) => {
    if (!ffmpeg || !isFFmpegLoaded) {
      throw new Error('FFmpeg not loaded');
    }
    
    try {
      // Download and process images
      const successfulImages = [];
      for (let i = 0; i < imageUrls.length; i++) {
        try {
          console.log(`Downloading image ${i + 1}...`);
          const imageResponse = await fetch(imageUrls[i]);
          
          if (!imageResponse.ok) {
            console.warn(`Failed to download image ${i + 1}, skipping...`);
            continue;
          }
          
          const imageBlob = await imageResponse.blob();
          const imageArrayBuffer = await imageBlob.arrayBuffer();
          const imageData = new Uint8Array(imageArrayBuffer);
          await ffmpeg.writeFile(`image${i}.jpeg`, imageData);
          successfulImages.push(i);
        } catch (error) {
          console.warn(`Error processing image ${i + 1}:`, error);
          continue;
        }
      }

      if (successfulImages.length === 0) {
        throw new Error('No images were successfully processed');
      }

      // Download and process audio
      const audioData = new Uint8Array(audioResult.data);
      await ffmpeg.writeFile('audio.mp3', audioData);

      // Create a file list for FFmpeg with only successful images
      const fileList = successfulImages.map(i => `file 'image${i}.jpeg'`).join('\n');
      await ffmpeg.writeFile('filelist.txt', fileList);

      // Combine images into video with audio
      await ffmpeg.exec([
        '-f', 'concat',
        "-r","1",
        '-safe', '0',
        '-i', 'filelist.txt',
        '-i', 'audio.mp3',
        '-c:v', 'libx264',
        '-pix_fmt', 'yuv420p',
        '-c:a', 'aac',
        '-shortest',
        '-avoid_negative_ts', 'make_zero',
        '-y',
        'output.mp4'
      ]);

      // Read the output file
      const outputData = await ffmpeg.readFile('output.mp4');
      const blob = new Blob([outputData], { type: 'video/mp4' });
      const combinedUrl = URL.createObjectURL(blob);
      handleSave(combinedUrl)
      // Clean up
      for (let i = 0; i < imageUrls.length; i++) {
        await ffmpeg.deleteFile(`image${i}.jpg`);
      }
      await ffmpeg.deleteFile('audio.mp3');
      await ffmpeg.deleteFile('filelist.txt');
      await ffmpeg.deleteFile('output.mp4');

    } catch (error) {
      setIsLoading(false);
      console.error('Error generating video:', error);
    } 
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!athleteName) return;
    
    setIsLoading(true);
   
    try {
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ athleteName }),
      });

      const responseJSON = await response.json();

      if (!response.ok) {
        throw new Error(responseJSON.error || 'Failed to generate content');
      }

      generateVideo(JSON.parse(responseJSON?.data?.imageUrls), responseJSON?.data?.audioBufferData);
    } catch (error) {
      setIsLoading(false);
      console.error("🚀 ~ handleSubmit ~ error:", error);
    } 
  };

  return (
    <main className="min-h-screen bg-background pt-24">
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Create AI Sports Reel</h1>
          <p className="text-muted-foreground text-lg">
            Enter an athlete's name to generate a personalized history reel using AI
          </p>
        </div>

        <div className="space-y-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-5 w-5" />
            <Input
              type="text"
              placeholder="Enter athlete name (e.g., Michael Jordan)"
              value={athleteName}
              onChange={(e) => setAthleteName(e.target.value)}
              className="pl-10 py-6 text-lg"
              disabled={isLoading}
            />
          </div>

          <Button
            onClick={handleSubmit}
            className="w-full py-6 text-lg"
            disabled={!athleteName || isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                Generating Content...
              </>
            ) : (
              'Generate Video'
            )}
          </Button>
        </div>
      </div>
    </main>
  );
}