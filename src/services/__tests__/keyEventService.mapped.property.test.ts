// services/__tests__/keyEventService.mapped.property.test.ts

/**
 * Feature: StagePrompt, Property 14: Zmapowany klawisz wykonuje akcję
 * Validates: Requirements 6.2
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
import { KeyMapping, PrompterAction } from '../../types/models';

describe('keyEventService - mapped keys execute actions', () => {
  jest.useFakeTimers();

  beforeEach(() => {
    // Clean up before each test
    keyEventService.cleanup();
    if (typeof (global as any).clearWindowListeners === 'function') {
      (global as any).clearWindowListeners();
    }
  });

  afterEach(() => {
    keyEventService.cleanup();
  });

  it('Property 14: For any keyCode mapped to an action, pressing that key should execute the corresponding action', () => {
    fc.assert(
      fc.property(
        // Generate random keyCodes (typical range for keyboard keys)
        fc.integer({ min: 8, max: 222 }),
        fc.integer({ min: 8, max: 222 }),
        fc.integer({ min: 8, max: 222 }),
        // Generate random action to test
        fc.constantFrom<PrompterAction>('nextSong', 'prevSong', 'pause'),
        (nextKey, prevKey, pauseKey, actionToTest) => {
          // Reset state for every generated case
          keyEventService.cleanup();
          if (typeof (global as any).clearWindowListeners === 'function') {
            (global as any).clearWindowListeners();
          }

          // Ensure keys are unique
          if (nextKey === prevKey || nextKey === pauseKey || prevKey === pauseKey) {
            return true; // Skip this test case
          }

          // Set up key mapping
          const mapping: KeyMapping = {
            nextSong: nextKey,
            prevSong: prevKey,
            pause: pauseKey,
          };

          keyEventService.setKeyMapping(mapping);

          // Track which action was called
          let calledAction: PrompterAction | null = null;
          keyEventService.onAction((action) => {
            calledAction = action;
          });

          // Simulate key press for the action we're testing
          let keyToPress: number;
          switch (actionToTest) {
            case 'nextSong':
              keyToPress = nextKey;
              break;
            case 'prevSong':
              keyToPress = prevKey;
              break;
            case 'pause':
              keyToPress = pauseKey;
              break;
          }

          // Simulate the key event by calling the private method through the public interface
          // We'll use a workaround: trigger through web keyboard event if on web
          if (typeof window !== 'undefined') {
            keyEventService.initialize();
            const event = new KeyboardEvent('keydown', { keyCode: keyToPress } as any);
            window.dispatchEvent(event);
          } else {
            // For non-web platforms, we need to test the logic directly
            // Since we can't easily trigger Android events in tests, we'll verify the mapping
            const retrievedMapping = keyEventService.getKeyMapping();
            expect(retrievedMapping[actionToTest]).toBe(keyToPress);
            return true;
          }

          // Verify the correct action was called
          expect(calledAction).toBe(actionToTest);
          return calledAction === actionToTest;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 14 (unit test variant): Mapped keys trigger correct actions', () => {
    const mapping: KeyMapping = {
      nextSong: 39, // Right arrow
      prevSong: 37, // Left arrow
      pause: 32,    // Space
    };

    keyEventService.setKeyMapping(mapping);

    const actions: PrompterAction[] = [];
    keyEventService.onAction((action) => {
      actions.push(action);
    });

    keyEventService.initialize();

    if (typeof window !== 'undefined') {
      // Test nextSong
      window.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 39 } as any));
      expect(actions[actions.length - 1]).toBe('nextSong');

      // Test prevSong
      window.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 37 } as any));
      expect(actions[actions.length - 1]).toBe('prevSong');

      // Test pause
      window.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 32 } as any));
      expect(actions[actions.length - 1]).toBe('pause');

      expect(actions.length).toBe(3);
    } else {
      // For non-web, just verify mapping is set correctly
      const retrievedMapping = keyEventService.getKeyMapping();
      expect(retrievedMapping.nextSong).toBe(39);
      expect(retrievedMapping.prevSong).toBe(37);
      expect(retrievedMapping.pause).toBe(32);
    }
  });
});
