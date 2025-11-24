import { renderHook, act, waitFor } from '@testing-library/react-native';
import { usePrompterTimer } from '../usePrompterTimer';

// Mock timers
jest.useFakeTimers();

describe('usePrompterTimer', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  describe('play/pause/reset functionality', () => {
    it('should start at 0 and not be playing', () => {
      const { result } = renderHook(() => usePrompterTimer());
      
      expect(result.current.currentTime).toBe(0);
      expect(result.current.isPlaying).toBe(false);
    });

    it('should start playing when play is called', () => {
      const { result } = renderHook(() => usePrompterTimer());
      
      act(() => {
        result.current.play();
      });
      
      expect(result.current.isPlaying).toBe(true);
    });

    it('should increment time when playing', async () => {
      const { result } = renderHook(() => usePrompterTimer());
      
      act(() => {
        result.current.play();
      });
      
      // Advance time by 100ms (2 ticks of 50ms)
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      // Time should have increased (approximately 0.1 seconds)
      expect(result.current.currentTime).toBeGreaterThan(0);
      expect(result.current.currentTime).toBeCloseTo(0.1, 1);
    });

    it('should pause and stop incrementing time', async () => {
      const { result } = renderHook(() => usePrompterTimer());
      
      // Start playing
      act(() => {
        result.current.play();
      });
      
      // Advance time
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      const timeAfterPlaying = result.current.currentTime;
      
      // Pause
      act(() => {
        result.current.pause();
      });
      
      expect(result.current.isPlaying).toBe(false);
      
      // Advance time more
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      // Time should not have changed after pause
      expect(result.current.currentTime).toBe(timeAfterPlaying);
    });

    it('should reset time to 0 and pause', () => {
      const { result } = renderHook(() => usePrompterTimer());
      
      // Start playing and advance time
      act(() => {
        result.current.play();
      });
      
      act(() => {
        jest.advanceTimersByTime(200);
      });
      
      expect(result.current.currentTime).toBeGreaterThan(0);
      
      // Reset
      act(() => {
        result.current.reset();
      });
      
      expect(result.current.currentTime).toBe(0);
      expect(result.current.isPlaying).toBe(false);
    });

    it('should resume from paused position when play is called again', () => {
      const { result } = renderHook(() => usePrompterTimer());
      
      // Play and advance
      act(() => {
        result.current.play();
      });
      
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      const timeBeforePause = result.current.currentTime;
      
      // Pause
      act(() => {
        result.current.pause();
      });
      
      // Resume
      act(() => {
        result.current.play();
      });
      
      // Advance more time
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      // Time should have continued from where it paused
      expect(result.current.currentTime).toBeGreaterThan(timeBeforePause);
      expect(result.current.currentTime).toBeCloseTo(timeBeforePause + 0.1, 1);
    });
  });

  describe('seek functionality', () => {
    it('should seek to a specific time', () => {
      const { result } = renderHook(() => usePrompterTimer());
      
      act(() => {
        result.current.seek(5.5);
      });
      
      expect(result.current.currentTime).toBe(5.5);
    });

    it('should not allow seeking to negative time', () => {
      const { result } = renderHook(() => usePrompterTimer());
      
      act(() => {
        result.current.seek(-5);
      });
      
      expect(result.current.currentTime).toBe(0);
    });

    it('should allow seeking while playing', () => {
      const { result } = renderHook(() => usePrompterTimer());
      
      // Start playing
      act(() => {
        result.current.play();
      });
      
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      // Seek to a different time
      act(() => {
        result.current.seek(10);
      });
      
      expect(result.current.currentTime).toBe(10);
      expect(result.current.isPlaying).toBe(true);
      
      // Continue playing from new position
      act(() => {
        jest.advanceTimersByTime(100);
      });
      
      expect(result.current.currentTime).toBeGreaterThan(10);
    });
  });

  describe('cleanup', () => {
    it('should cleanup interval on unmount', () => {
      const { result, unmount } = renderHook(() => usePrompterTimer());
      
      act(() => {
        result.current.play();
      });
      
      expect(result.current.isPlaying).toBe(true);
      
      const timerCountBefore = jest.getTimerCount();
      expect(timerCountBefore).toBeGreaterThan(0);
      
      // Unmount the hook
      unmount();
      
      // Timer should be cleaned up after unmount
      const timerCountAfter = jest.getTimerCount();
      expect(timerCountAfter).toBeLessThan(timerCountBefore);
    });
  });
});
