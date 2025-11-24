import { useState, useEffect, useRef, useCallback } from 'react';

export interface UsePrompterTimerReturn {
  currentTime: number;
  isPlaying: boolean;
  play: () => void;
  pause: () => void;
  reset: () => void;
  seek: (time: number) => void;
}

/**
 * Custom hook for managing the prompter timer.
 * Provides play, pause, reset, and seek functionality with a timer loop.
 * 
 * @returns Timer state and control functions
 */
export function usePrompterTimer(): UsePrompterTimerReturn {
  const [currentTime, setCurrentTime] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const lastTickRef = useRef<number>(Date.now());

  // Play function - starts the timer
  const play = useCallback(() => {
    setIsPlaying(true);
    lastTickRef.current = Date.now();
  }, []);

  // Pause function - stops the timer
  const pause = useCallback(() => {
    setIsPlaying(false);
  }, []);

  // Reset function - resets timer to 0 and pauses
  const reset = useCallback(() => {
    setCurrentTime(0);
    setIsPlaying(false);
  }, []);

  // Seek function - jumps to a specific time
  const seek = useCallback((time: number) => {
    setCurrentTime(Math.max(0, time));
    lastTickRef.current = Date.now();
  }, []);

  // Timer loop effect
  useEffect(() => {
    if (isPlaying) {
      // Create interval that runs every 50ms for smooth updates
      intervalRef.current = setInterval(() => {
        const now = Date.now();
        const deltaMs = now - lastTickRef.current;
        lastTickRef.current = now;
        
        setCurrentTime(prevTime => prevTime + deltaMs / 1000);
      }, 50);
    } else {
      // Clear interval when paused
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    // Cleanup on unmount or when isPlaying changes
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [isPlaying]);

  return {
    currentTime,
    isPlaying,
    play,
    pause,
    reset,
    seek,
  };
}
