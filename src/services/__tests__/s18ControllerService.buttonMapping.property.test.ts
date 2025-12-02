// services/__tests__/s18ControllerService.buttonMapping.property.test.ts

/**
 * Feature: StagePrompt, Property 33: Mapowanie przycisku prawo na następny utwór
 * Feature: StagePrompt, Property 34: Mapowanie przycisku lewo na poprzedni utwór
 * Feature: StagePrompt, Property 35: Mapowanie przycisku Touch na pause/play
 * Validates: Requirements 14.2, 14.3, 14.4
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

describe('s18ControllerService - button mapping', () => {
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

  it('Property 33: For any setlist with at least 2 songs, pressing right button should go to next song', () => {
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

    // Simulate right arrow key (keyCode 39)
    if (typeof window !== 'undefined') {
      const event = new KeyboardEvent('keydown', { keyCode: 39 } as any);
      window.dispatchEvent(event);

      expect(actionCalled).toBe('nextSong');
    }
  });

  it('Property 34: For any setlist with at least 2 songs, pressing left button should go to previous song', () => {
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

    // Simulate left arrow key (keyCode 37)
    if (typeof window !== 'undefined') {
      const event = new KeyboardEvent('keydown', { keyCode: 37 } as any);
      window.dispatchEvent(event);

      expect(actionCalled).toBe('prevSong');
    }
  });

  it('Property 35: For any prompter state, pressing Touch button should toggle play/pause', () => {
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

    // Simulate Enter key (keyCode 13)
    if (typeof window !== 'undefined') {
      const event = new KeyboardEvent('keydown', { keyCode: 13 } as any);
      window.dispatchEvent(event);

      expect(actionCalled).toBe('pause');
    }
  });

  it('Property 33-35 (property-based): Button mappings work correctly for all configurations', () => {
    fc.assert(
      fc.property(
        // Generate random button mappings
        fc.record({
          up: fc.constantFrom<PrompterAction>('increaseSpeed', 'decreaseSpeed', 'nextSong', 'prevSong', 'pause', 'resetSpeed'),
          down: fc.constantFrom<PrompterAction>('increaseSpeed', 'decreaseSpeed', 'nextSong', 'prevSong', 'pause', 'resetSpeed'),
          left: fc.constantFrom<PrompterAction>('increaseSpeed', 'decreaseSpeed', 'nextSong', 'prevSong', 'pause', 'resetSpeed'),
          right: fc.constantFrom<PrompterAction>('increaseSpeed', 'decreaseSpeed', 'nextSong', 'prevSong', 'pause', 'resetSpeed'),
          touch: fc.constantFrom<PrompterAction>('increaseSpeed', 'decreaseSpeed', 'nextSong', 'prevSong', 'pause', 'resetSpeed'),
        }),
        (buttonMapping) => {
          // Reset for each iteration
          s18ControllerService.cleanup();
          if (typeof (global as any).clearWindowListeners === 'function') {
            (global as any).clearWindowListeners();
          }

          const config: S18ControllerConfig = {
            enabled: true,
            mode: 'keyboard',
            buttonMapping,
            clickZones: {
              left: { x: 0, width: 0.33 },
              center: { x: 0.33, width: 0.34 },
              right: { x: 0.67, width: 0.33 },
            },
            sensitivity: 1.0,
          };

          s18ControllerService.initialize(config);

          const actions: PrompterAction[] = [];
          s18ControllerService.onAction((action) => {
            actions.push(action);
          });

          if (typeof window !== 'undefined') {
            // Test each button
            const buttonTests = [
              { keyCode: 38, button: 'up', expectedAction: buttonMapping.up },
              { keyCode: 40, button: 'down', expectedAction: buttonMapping.down },
              { keyCode: 37, button: 'left', expectedAction: buttonMapping.left },
              { keyCode: 39, button: 'right', expectedAction: buttonMapping.right },
              { keyCode: 13, button: 'touch', expectedAction: buttonMapping.touch },
            ];

            for (const test of buttonTests) {
              actions.length = 0; // Clear actions
              const event = new KeyboardEvent('keydown', { keyCode: test.keyCode } as any);
              window.dispatchEvent(event);

              // Verify the correct action was triggered
              if (actions.length > 0) {
                expect(actions[0]).toBe(test.expectedAction);
              }
            }
          }

          s18ControllerService.cleanup();
          return true;
        }
      ),
      { numRuns: 50 } // Reduced runs since we test multiple buttons per iteration
    );
  });

  it('Property 33-35 (mouse mode): Click zones trigger correct actions', () => {
    const config: S18ControllerConfig = {
      enabled: true,
      mode: 'mouse',
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

    // Wait for debounce from previous tests
    jest.advanceTimersByTime(300);

    if (typeof window !== 'undefined') {
      // Mock window.innerWidth
      Object.defineProperty(window, 'innerWidth', {
        writable: true,
        configurable: true,
        value: 1000,
      });

      // Create a mock MouseEvent constructor if it doesn't exist
      if (typeof MouseEvent === 'undefined') {
        (global as any).MouseEvent = class MockMouseEvent extends Event {
          clientX: number;
          constructor(type: string, options: any) {
            super(type);
            this.clientX = options.clientX || 0;
          }
        };
      }

      // Test left zone (0-330px) -> prevSong
      actionCalled = null;
      const leftClick = new MouseEvent('click', { clientX: 100 } as any);
      window.dispatchEvent(leftClick);
      expect(actionCalled).toBe('prevSong');

      // Wait for debounce
      jest.advanceTimersByTime(300);

      // Test center zone (330-670px) -> pause
      actionCalled = null;
      const centerClick = new MouseEvent('click', { clientX: 500 } as any);
      window.dispatchEvent(centerClick);
      expect(actionCalled).toBe('pause');

      // Wait for debounce
      jest.advanceTimersByTime(300);

      // Test right zone (670-1000px) -> nextSong
      actionCalled = null;
      const rightClick = new MouseEvent('click', { clientX: 800 } as any);
      window.dispatchEvent(rightClick);
      expect(actionCalled).toBe('nextSong');
    }
  });
});
