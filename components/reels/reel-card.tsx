"use client";

import { useState, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import Image from 'next/image';
import { Play, Pause, Volume2, VolumeX, Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ReelType } from '@/app/types/reels';

interface ReelCardProps {
  reel: ReelType;
}

const ReelCard = ({ reel }: ReelCardProps) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [isLiked, setIsLiked] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [showControls, setShowControls] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const controlsTimeoutRef = useRef<NodeJS.Timeout>();
  const { ref: inViewRef, inView } = useInView({
    threshold: 0.7,
  });

  // Handle auto-hide controls
  const handleShowControls = () => {
    setShowControls(true);
    if (controlsTimeoutRef.current) {
      clearTimeout(controlsTimeoutRef.current);
    }
    controlsTimeoutRef.current = setTimeout(() => {
      setShowControls(false);
    }, 2000);
  };

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (controlsTimeoutRef.current) {
        clearTimeout(controlsTimeoutRef.current);
      }
    };
  }, []);

  // Handle touch events for mobile
  const handleTouchStart = () => {
    handleShowControls();
  };

  // Handle click events for desktop
  const handleClick = () => {
    handleShowControls();
    togglePlay();
  };

  // Handle auto-play when reel comes into view
  useEffect(() => {
    if (videoRef.current) {
      if (inView) {
        videoRef.current.play()
          .then(() => setIsPlaying(true))
          .catch((error) => {
            console.error('Video playback failed:', error);
            setIsPlaying(false);
          });
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [inView]);

  // Update time and duration
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const handleTimeUpdate = () => {
      if (video.readyState >= 2) { // HAVE_CURRENT_DATA or higher
        setCurrentTime(video.currentTime);
      }
    };

    const handleLoadedMetadata = () => {
      setDuration(video.duration);
    };

    const handlePlay = () => {
      setIsPlaying(true);
    };

    const handlePause = () => {
      setIsPlaying(false);
    };

    const handleSeeking = () => {
      setCurrentTime(video.currentTime);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('loadedmetadata', handleLoadedMetadata);
    video.addEventListener('play', handlePlay);
    video.addEventListener('pause', handlePause);
    video.addEventListener('seeking', handleSeeking);

    // Initial setup
    if (video.readyState >= 2) {
      setDuration(video.duration);
      setCurrentTime(video.currentTime);
    }

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('loadedmetadata', handleLoadedMetadata);
      video.removeEventListener('play', handlePlay);
      video.removeEventListener('pause', handlePause);
      video.removeEventListener('seeking', handleSeeking);
    };
  }, []);
  
  const formatTime = (time: number) => {
    if (isNaN(time)) return '0:00';
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    return `${minutes}:${seconds.toString().padStart(2, '0')}`;
  };

  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !video.duration) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const pos = (e.clientX - rect.left) / rect.width;
    const newTime = pos * video.duration;
    
    video.currentTime = newTime;
    setCurrentTime(newTime);
  };
  
  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };
  
  const toggleMute = () => {
    if (videoRef.current) {
      videoRef.current.muted = !isMuted;
      setIsMuted(!isMuted);
    }
  };
  
  const toggleLike = () => {
    setIsLiked(!isLiked);
  };

  return (
    <motion.div
      ref={inViewRef}
      className="relative rounded-xl overflow-hidden bg-card group h-full w-full"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      onTouchStart={handleTouchStart}
    >
      
      <div className="relative h-full w-full">
        <video
          ref={videoRef}
          className="absolute inset-0 w-full h-full object-contain bg-black"
          muted={isMuted}
          playsInline
          onClick={handleClick}
        >
          <source src={reel.videoUrl} type="video/mp4" />
          Your browser does not support the video tag.
        </video>

        {/* Video Progress Bar */}
        <div 
          className={cn(
            "absolute bottom-0 left-0 right-0 h-1 bg-black/30 cursor-pointer z-30 transition-opacity duration-300",
            "md:opacity-0 md:group-hover:opacity-100",
            showControls ? "opacity-100" : "opacity-0"
          )}
          onClick={handleProgressClick}
        >
          <div 
            className="h-full bg-primary transition-all duration-100"
            style={{ 
              width: `${duration > 0 ? Math.min(100, Math.max(0, (currentTime / duration) * 100)) : 0}%`,
              minWidth: '0%',
              maxWidth: '100%'
            }}
          />
        </div>

        {/* Time Display */}
        <div className={cn(
          "absolute bottom-2 right-4 text-white text-xs z-30 transition-opacity duration-300",
          "md:opacity-0 md:group-hover:opacity-100",
          showControls ? "opacity-100" : "opacity-0"
        )}>
          {formatTime(currentTime)} / {formatTime(duration)}
        </div>
      </div>
      
      {/* Play/Pause Button */}
      <div 
        className={cn(
          "absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-20 transition-opacity duration-300",
          "md:opacity-0 md:group-hover:opacity-100",
          (!isPlaying || showControls) ? "opacity-100" : "opacity-0"
        )}
      >
        <Button 
          variant="default" 
          size="icon" 
          className="h-16 w-16 rounded-full bg-primary/80 hover:bg-primary/90" 
          onClick={togglePlay}
        >
          {isPlaying ? (
            <Pause className="h-8 w-8" />
          ) : (
            <Play className="h-8 w-8" fill="white" />
          )}
        </Button>
      </div>
      
      {/* Controls overlay */}
      <div className={cn(
        "absolute bottom-0 left-0 right-0 p-4 z-20 bg-gradient-to-t from-black/80 via-black/40 to-transparent transition-all duration-300",
        "md:opacity-0 md:group-hover:opacity-100",
        showControls ? "opacity-100" : "opacity-0"
      )}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg md:text-xl font-semibold text-white">{reel.metadata.athletename}</h3>
          
          <div className="flex items-center space-x-2">
            <Button 
              variant="ghost" 
              size="icon" 
              className="h-8 w-8 rounded-full bg-black/30 hover:bg-black/50 transition-colors" 
              onClick={toggleMute}
            >
              {isMuted ? (
                <VolumeX className="h-4 w-4 text-white" />
              ) : (
                <Volume2 className="h-4 w-4 text-white" />
              )}
            </Button>
          </div>
        </div>
      
      </div>
      
      {/* Side action buttons */}
      <div className={cn(
        "absolute right-4 bottom-20 z-20 flex flex-col space-y-4 transition-all duration-300",
        "md:opacity-0 md:group-hover:opacity-100 md:transform md:translate-x-4 md:group-hover:translate-x-0",
        showControls ? "opacity-100" : "opacity-0"
      )}>
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-10 w-10 rounded-full bg-black/30 hover:bg-black/50 transition-colors" 
          onClick={toggleLike}
        >
          <Heart 
            className={cn(
              "h-5 w-5 transition-colors", 
              isLiked ? "text-red-500 fill-red-500" : "text-white"
            )} 
          />
        </Button>
      
      </div>
      
     
    </motion.div>
  );
};

export default ReelCard;