"use client";

import { useState, useRef, useEffect } from 'react';
import { useInView } from 'react-intersection-observer';
import ReelCard from '@/components/reels/reel-card';
import { Loader2 } from 'lucide-react';
import { ReelType } from '@/app/types/reels';

const ReelsFeed = () => {
  const [visibleReels, setVisibleReels] = useState<ReelType[]>([]);
  const [page, setPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const { ref: loadMoreRef, inView } = useInView({
    threshold: 0.5,
    triggerOnce: false
  });

  const fetchReels = async (pageNumber: number) => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/reels?limit=2&page=${pageNumber}`);
      if (!response.ok) {
        throw new Error('Failed to fetch reels');
      }

      const responseData = await response.json();
      setVisibleReels(prev => [...prev,...responseData.data]);
      setHasMore((visibleReels.length + responseData.data.length) < responseData.pagination.totalItems);
      setPage(pageNumber);
    } catch (error) {
      console.error('Error fetching reels:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Load initial reels


  // Handle infinite scroll
  useEffect(() => {
    if (inView && hasMore && !isLoading) {
      fetchReels(page + 1);
    }
  }, [inView]);
  return (
    <div className="max-w-screen-sm mx-auto">
      <div className="flex flex-col gap-1">
        {visibleReels.map((reel) => (
          <div 
            key={reel.metadata.athletename} 
            className="h-[calc(100vh-6rem)] snap-start snap-always"
          >
            <ReelCard reel={reel} />
          </div>
        ))}
        
        {/* Intersection Observer Target */}
        {hasMore && (
          <div 
            ref={loadMoreRef}
            className="h-20 flex items-center justify-center"
          >
            {isLoading ? (
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            ) : (
              <span className="text-sm text-muted-foreground">
                Scroll for more
              </span>
            )}
          </div>
        )}
        
        {!hasMore && visibleReels.length > 0 && (
          <div className="h-20 flex items-center justify-center">
            <span className="text-sm text-muted-foreground">
              No more reels to show
            </span>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReelsFeed;