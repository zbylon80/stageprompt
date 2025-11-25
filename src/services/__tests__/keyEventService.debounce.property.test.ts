// services/__tests__/keyEventService.debounce.property.test.ts

/**
 * Feature: StagePrompt, Property 16: Debounce zapobiega wielokrotnym akcjom
 * Validates: Requirements 6.5
 */

import './setup'; // Import test setup
import fc from 'fast-check';

jest.mock('../../utils/platform', () => ({
  isWeb: true,
  isAndroid: false,
  isIOS: false,
  isMobile: false,
  supportsKeyEvents: true,
  supportsBluetooth: false,
  isEditingEnvironment: true,
  isPerformanceEnvironment: false,
}));

import { keyEventService } from '../keyEventService';
import { KeyMapping } from '../../types/models';

jest.useFakeTimers();

// Helper to advance fake timers
const advance = (ms: number) => {
  jest.advanceTimersByTime(ms);
};

describe('keyEventService - debounce prevents multiple actions', () => {
  beforeEach(() => {
    keyEventService.cleanup();
    if (typeof (global as any).clearWindowListeners === 'function') {
      (global as any).clearWindowListeners();
    }
    jest.clearAllTimers();
  });

  afterEach(() => {
    keyEventService.cleanup();
    jest.clearAllTimers();
  });

  it('Property 16: For any sequence of key events with the same keyCode arriving < 300ms apart, only the first event should trigger an action', async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 8, max: 222 }),
        fc.integer({ min: 2, max: 5 }), // Number of rapid key presses
        async (keyCode, numPresses) => {
          keyEventService.cleanup();
          if (typeof (global as any).clearWindowListeners === 'function') {
            (global as any).clearWindowListeners();
          }

          // Set up key mapping
          const mapping: KeyMapping = {
            nextSong: keyCode,
          };

          keyEventService.setKeyMapping(mapping);

          // Track action calls
          let actionCount = 0;
          keyEventService.onAction(() => {
            actionCount++;
          });

          keyEventService.initialize();

          if (typeof window !== 'undefined') {
            // Simulate rapid key presses (within debounce window)
            for (let i = 0; i < numPresses; i++) {
              const event = new KeyboardEvent('keydown', { keyCode } as any);
              window.dispatchEvent(event);
              advance(50); // Wait 50ms between presses (< 300ms debounce)
            }

            // Only the first press should have triggered an action
            expect(actionCount).toBe(1);
            return actionCount === 1;
          } else {
            // For non-web platforms, we can't easily test timing
            // Just verify the mapping is correct
            return true;
          }
        }
      ),
      { numRuns: 50 } // Fewer runs because of async timing
    );
  });

  it('Property 16 (unit test variant): Debounce prevents rapid key presses', async () => {
    const mapping: KeyMapping = {
      nextSong: 39, // Right arrow
    };

    keyEventService.setKeyMapping(mapping);

    let actionCount = 0;
    keyEventService.onAction(() => {
      actionCount++;
    });

    keyEventService.initialize();

    if (typeof window !== 'undefined') {
      // First press - should trigger
      window.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 39 } as any));
      expect(actionCount).toBe(1);

      // Second press immediately - should be debounced
      advance(50);
      window.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 39 } as any));
      expect(actionCount).toBe(1);

      // Third press after 100ms - should still be debounced
      advance(100);
      window.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 39 } as any));
      expect(actionCount).toBe(1);

      // Fourth press after 300ms total - should trigger
      advance(200); // Total 350ms from first press
      window.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 39 } as any));
      expect(actionCount).toBe(2);
    }
  });

  it('Property 16 (edge case): Different keys are not debounced together', async () => {
    const mapping: KeyMapping = {
      nextSong: 39, // Right arrow
      prevSong: 37, // Left arrow
    };

    keyEventService.setKeyMapping(mapping);

    const actions: string[] = [];
    keyEventService.onAction((action) => {
      actions.push(action);
    });

    keyEventService.initialize();

    if (typeof window !== 'undefined') {
      // Press nextSong
      window.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 39 } as any));
      
      // Immediately press prevSong - should not be debounced
      advance(50);
      window.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 37 } as any));

      // Both actions should have been triggered
      expect(actions.length).toBe(2);
      expect(actions[0]).toBe('nextSong');
      expect(actions[1]).toBe('prevSong');
    }
  });
});
