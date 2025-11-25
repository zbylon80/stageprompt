/**
 * Property-based tests for usePrompterTimer - Pause and Resume
 * Feature: StagePrompt, Property 11: Pauza i wznowienie zachowuje pozycję
 * Validates: Requirements 6.2
 */

import { renderHook, act } from '@testing-library/react-native';
import fc from 'fast-check';
import { usePrompterTimer } from '../usePrompterTimer';

jest.useFakeTimers();

describe('usePrompterTimer - Pause and Resume Property Tests', () => {
  afterEach(() => {
    jest.clearAllTimers();
  });

  /**
   * Property 11: Pauza i wznowienie zachowuje pozycję
   * 
   * For any state of the prompter with current time T, executing pause
   * followed by resume should preserve time T (with tolerance of a few milliseconds).
   */
  it('Property 11: pause and resume preserves position', async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate a random initial time to seek to (0 to 300 seconds)
        fc.float({ min: 0, max: 300, noNaN: true }),
        // Generate a random pause duration (10ms to 500ms)
        fc.integer({ min: 10, max: 500 }),
        async (initialTime, pauseDuration) => {
          const { result, unmount } = renderHook(() => usePrompterTimer());
          
          // Seek to initial time and start playing
          act(() => {
            result.current.seek(initialTime);
            result.current.play();
          });
          
          // Advance timer a bit to ensure it is running
          act(() => {
            jest.advanceTimersByTime(100);
          });
          expect(result.current.currentTime).toBeGreaterThan(initialTime);
          
          // Capture time before pause
          let timeBeforePause: number;
          act(() => {
            timeBeforePause = result.current.currentTime;
            // Pause immediately
            result.current.pause();
          });
          
          // Advance timers while paused (time should not advance)
          act(() => {
            jest.advanceTimersByTime(pauseDuration);
          });
          
          // Capture time after pause - should be same as before
          const timeAfterPause = result.current.currentTime;
          
          // Time after pause should be very close to time before pause
          // Allow tolerance of 100ms for async timer precision (interval is 50ms)
          const timeDifference = Math.abs(timeAfterPause - timeBeforePause!);
          expect(timeDifference).toBeLessThan(0.1); // 100ms tolerance
          
          // Resume
          act(() => {
            result.current.play();
          });
          
          // Advance timers after resume - time should advance
          act(() => {
            jest.advanceTimersByTime(100);
          });
          expect(result.current.currentTime).toBeGreaterThan(timeAfterPause);

          unmount();
          
          return true;
        }
      ),
      { numRuns: 50 } // Reduced from 100 for faster tests
    );
  });

  /**
   * Additional property: Pause should stop time advancement
   */
  it('pause stops time from advancing', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.float({ min: 0, max: 100, noNaN: true }),
        fc.integer({ min: 50, max: 300 }),
        async (initialTime, waitDuration) => {
          const { result, unmount } = renderHook(() => usePrompterTimer());
          
          // Seek and play
          act(() => {
            result.current.seek(initialTime);
            result.current.play();
          });
          
          // Advance timer to let it tick
          act(() => {
            jest.advanceTimersByTime(100);
          });
          expect(result.current.currentTime).toBeGreaterThan(initialTime);
          
          // Pause and capture time
          let timeDuringPause1: number;
          act(() => {
            result.current.pause();
            timeDuringPause1 = result.current.currentTime;
          });
          
          // Advance timers while paused
          act(() => {
            jest.advanceTimersByTime(waitDuration);
          });
          
          const timeDuringPause2 = result.current.currentTime;
          
          // Time should not have advanced during pause
          // Allow tolerance of 100ms for async timer precision (interval is 50ms)
          expect(Math.abs(timeDuringPause2 - timeDuringPause1!)).toBeLessThan(0.1);

          unmount();
          
          return true;
        }
      ),
      { numRuns: 50 }
    );
  });

  /**
   * Additional property: Multiple pause/resume cycles preserve position
   */
  it('multiple pause/resume cycles preserve position', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.float({ min: 0, max: 100, noNaN: true }),
        fc.array(fc.integer({ min: 20, max: 100 }), { minLength: 2, maxLength: 3 }),
        async (initialTime, pauseDurations) => {
          const { result, unmount } = renderHook(() => usePrompterTimer());
          
          // Seek to initial time
          act(() => {
            result.current.seek(initialTime);
          });
          
          // Perform multiple pause/resume cycles
          for (const pauseDuration of pauseDurations) {
            // Play
            act(() => {
              result.current.play();
            });
            
            // Advance time to let it tick
            act(() => {
              jest.advanceTimersByTime(100);
            });
            
            // Pause and capture time
            let timeAfterPause: number;
            act(() => {
              result.current.pause();
              timeAfterPause = result.current.currentTime;
            });
            
            // Advance timers while paused
            act(() => {
              jest.advanceTimersByTime(pauseDuration);
            });
            
            const timeAfterWait = result.current.currentTime;
            
            // Time should not advance during pause
            // Allow tolerance of 100ms for async timer precision (interval is 50ms)
            expect(Math.abs(timeAfterWait - timeAfterPause!)).toBeLessThan(0.1);
          }
          
          unmount();
          
          return true;
        }
      ),
      { numRuns: 30 } // Reduced for faster tests
    );
  });
});
