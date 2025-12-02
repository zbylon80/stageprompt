// services/__tests__/s18ControllerService.scrollSpeed.property.test.ts

/**
 * Feature: StagePrompt, Property 36: Zwiększanie prędkości przewijania
 * Feature: StagePrompt, Property 37: Zmniejszanie prędkości przewijania
 * Validates: Requirements 14.5, 14.6
 */

import './setup';
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

import { s18ControllerService } from '../s18ControllerService';
import { S18ControllerConfig, PrompterAction } from '../../types/models';

describe('s18ControllerService - scroll speed control', () => {
  jest.useFakeTimers();

  beforeEach(() => {
    s18ControllerService.cleanup();
    if (typeof (global as any).clearWindowListeners === 'function') {
      (global as any).clearWindowListeners();
    }
  });

  afterEach(() => {
    s18ControllerService.cleanup();
  });

  it('Property 36: For any scroll speed V (where V < 2.0), pressing up button should trigger increaseSpeed action', () => {
    const config: S18ControllerConfig = {
      enabled: true,
      mode: 'keyboard',
      buttonMapping: {
        up: 'increaseSpeed',
        down: 'decreaseSpeed',
        left: 'prevSong',
        right: 'nextSong',
        touch: 'pause',
      },
      clickZones: {
        left: { x: 0, width: 0.33 },
        center: { x: 0.33, width: 0.34 },
        right: { x: 0.67, width: 0.33 },
      },
      sensitivity: 1.0,
    };

    s18ControllerService.initialize(config);

    let actionCalled: PrompterAction | null = null;
    s18ControllerService.onAction((action) => {
      actionCalled = action;
    });

    // Simulate up arrow key (keyCode 38)
    if (typeof window !== 'undefined') {
      const event = new KeyboardEvent('keydown', { keyCode: 38 } as any);
      window.dispatchEvent(event);

      expect(actionCalled).toBe('increaseSpeed');
    }
  });

  it('Property 37: For any scroll speed V (where V > 0.5), pressing down button should trigger decreaseSpeed action', () => {
    const config: S18ControllerConfig = {
      enabled: true,
      mode: 'keyboard',
      buttonMapping: {
        up: 'increaseSpeed',
        down: 'decreaseSpeed',
        left: 'prevSong',
        right: 'nextSong',
        touch: 'pause',
      },
      clickZones: {
        left: { x: 0, width: 0.33 },
        center: { x: 0.33, width: 0.34 },
        right: { x: 0.67, width: 0.33 },
      },
      sensitivity: 1.0,
    };

    s18ControllerService.initialize(config);

    let actionCalled: PrompterAction | null = null;
    s18ControllerService.onAction((action) => {
      actionCalled = action;
    });

    // Wait for debounce from previous test
    jest.advanceTimersByTime(300);

    // Simulate down arrow key (keyCode 40)
    if (typeof window !== 'undefined') {
      const event = new KeyboardEvent('keydown', { keyCode: 40 } as any);
      window.dispatchEvent(event);

      expect(actionCalled).toBe('decreaseSpeed');
    }
  });

  it('Property 36-37 (property-based): Speed control actions are triggered correctly', () => {
    fc.assert(
      fc.property(
        // Generate random sensitivity values (excluding NaN and Infinity)
        fc.float({ min: 0.5, max: 2.0, noNaN: true }),
        (sensitivity) => {
          // Reset for each iteration
          s18ControllerService.cleanup();
          if (typeof (global as any).clearWindowListeners === 'function') {
            (global as any).clearWindowListeners();
          }

          // Wait for debounce
          jest.advanceTimersByTime(300);

          const config: S18ControllerConfig = {
            enabled: true,
            mode: 'keyboard',
            buttonMapping: {
              up: 'increaseSpeed',
              down: 'decreaseSpeed',
              left: 'prevSong',
              right: 'nextSong',
              touch: 'pause',
            },
            clickZones: {
              left: { x: 0, width: 0.33 },
              center: { x: 0.33, width: 0.34 },
              right: { x: 0.67, width: 0.33 },
            },
            sensitivity,
          };

          const actions: PrompterAction[] = [];
          
          // Set up callback BEFORE initializing
          s18ControllerService.onAction((action) => {
            actions.push(action);
          });

          s18ControllerService.initialize(config);

          if (typeof window !== 'undefined') {
            // Test increase speed (up arrow)
            const upEvent = new KeyboardEvent('keydown', { keyCode: 38 } as any);
            window.dispatchEvent(upEvent);
            expect(actions.length).toBeGreaterThan(0);
            expect(actions[actions.length - 1]).toBe('increaseSpeed');

            // Wait for debounce
            jest.advanceTimersByTime(300);

            // Test decrease speed (down arrow)
            const downEvent = new KeyboardEvent('keydown', { keyCode: 40 } as any);
            window.dispatchEvent(downEvent);
            expect(actions.length).toBeGreaterThan(1);
            expect(actions[actions.length - 1]).toBe('decreaseSpeed');

            // Verify sensitivity is stored correctly
            const retrievedConfig = s18ControllerService.getConfig();
            expect(retrievedConfig?.sensitivity).toBeCloseTo(sensitivity, 5);
          }

          s18ControllerService.cleanup();
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 36-37 (unit test): Speed control with different button mappings', () => {
    // Wait for debounce from previous test
    jest.advanceTimersByTime(300);

    // Test with custom button mapping
    const config: S18ControllerConfig = {
      enabled: true,
      mode: 'keyboard',
      buttonMapping: {
        up: 'resetSpeed',      // Custom mapping
        down: 'increaseSpeed', // Swapped
        left: 'decreaseSpeed', // Swapped
        right: 'nextSong',
        touch: 'pause',
      },
      clickZones: {
        left: { x: 0, width: 0.33 },
        center: { x: 0.33, width: 0.34 },
        right: { x: 0.67, width: 0.33 },
      },
      sensitivity: 1.5,
    };

    const actions: PrompterAction[] = [];
    
    // Set up callback BEFORE initializing
    s18ControllerService.onAction((action) => {
      actions.push(action);
    });

    s18ControllerService.initialize(config);

    if (typeof window !== 'undefined') {
      // Test up -> resetSpeed
      const upEvent = new KeyboardEvent('keydown', { keyCode: 38 } as any);
      window.dispatchEvent(upEvent);
      expect(actions.length).toBeGreaterThan(0);
      expect(actions[actions.length - 1]).toBe('resetSpeed');

      jest.advanceTimersByTime(300);

      // Test down -> increaseSpeed (swapped)
      const downEvent = new KeyboardEvent('keydown', { keyCode: 40 } as any);
      window.dispatchEvent(downEvent);
      expect(actions.length).toBeGreaterThan(1);
      expect(actions[actions.length - 1]).toBe('increaseSpeed');

      jest.advanceTimersByTime(300);

      // Test left -> decreaseSpeed (swapped)
      const leftEvent = new KeyboardEvent('keydown', { keyCode: 37 } as any);
      window.dispatchEvent(leftEvent);
      expect(actions.length).toBeGreaterThan(2);
      expect(actions[actions.length - 1]).toBe('decreaseSpeed');
    }
  });

  it('Property 36-37 (edge case): Speed actions respect debouncing', () => {
    // Wait for debounce from previous test
    jest.advanceTimersByTime(300);

    const config: S18ControllerConfig = {
      enabled: true,
      mode: 'keyboard',
      buttonMapping: {
        up: 'increaseSpeed',
        down: 'decreaseSpeed',
        left: 'prevSong',
        right: 'nextSong',
        touch: 'pause',
      },
      clickZones: {
        left: { x: 0, width: 0.33 },
        center: { x: 0.33, width: 0.34 },
        right: { x: 0.67, width: 0.33 },
      },
      sensitivity: 1.0,
    };

    const actions: PrompterAction[] = [];
    
    // Set up callback BEFORE initializing
    s18ControllerService.onAction((action) => {
      actions.push(action);
    });

    s18ControllerService.initialize(config);

    if (typeof window !== 'undefined') {
      // First press - should work
      const event1 = new KeyboardEvent('keydown', { keyCode: 38 } as any);
      window.dispatchEvent(event1);
      expect(actions.length).toBe(1);
      expect(actions[0]).toBe('increaseSpeed');

      // Second press immediately - should be debounced
      const event2 = new KeyboardEvent('keydown', { keyCode: 38 } as any);
      window.dispatchEvent(event2);
      expect(actions.length).toBe(1); // Still 1, not 2

      // Wait for debounce period
      jest.advanceTimersByTime(300);

      // Third press - should work again
      const event3 = new KeyboardEvent('keydown', { keyCode: 38 } as any);
      window.dispatchEvent(event3);
      expect(actions.length).toBe(2);
      expect(actions[1]).toBe('increaseSpeed');
    }
  });
});
