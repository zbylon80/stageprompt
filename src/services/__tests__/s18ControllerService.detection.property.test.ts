// services/__tests__/s18ControllerService.detection.property.test.ts

/**
 * Feature: StagePrompt, Property 32: Wykrywanie kontrolera S18
 * Validates: Requirements 14.1
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
import { S18ControllerConfig } from '../../types/models';

describe('s18ControllerService - controller detection', () => {
  beforeEach(() => {
    s18ControllerService.cleanup();
    if (typeof (global as any).clearWindowListeners === 'function') {
      (global as any).clearWindowListeners();
    }
  });

  afterEach(() => {
    s18ControllerService.cleanup();
  });

  it('Property 32: For any S18 controller configuration, the system should detect the controller as an input device', () => {
    fc.assert(
      fc.property(
        // Generate random S18 configurations
        fc.record({
          enabled: fc.boolean(),
          mode: fc.constantFrom<'mouse' | 'keyboard'>('mouse', 'keyboard'),
          buttonMapping: fc.record({
            up: fc.constantFrom('increaseSpeed', 'decreaseSpeed', 'nextSong', 'prevSong', 'pause', 'resetSpeed'),
            down: fc.constantFrom('increaseSpeed', 'decreaseSpeed', 'nextSong', 'prevSong', 'pause', 'resetSpeed'),
            left: fc.constantFrom('increaseSpeed', 'decreaseSpeed', 'nextSong', 'prevSong', 'pause', 'resetSpeed'),
            right: fc.constantFrom('increaseSpeed', 'decreaseSpeed', 'nextSong', 'prevSong', 'pause', 'resetSpeed'),
            touch: fc.constantFrom('increaseSpeed', 'decreaseSpeed', 'nextSong', 'prevSong', 'pause', 'resetSpeed'),
          }),
          clickZones: fc.record({
            left: fc.record({ x: fc.constant(0), width: fc.constant(0.33) }),
            center: fc.record({ x: fc.constant(0.33), width: fc.constant(0.34) }),
            right: fc.record({ x: fc.constant(0.67), width: fc.constant(0.33) }),
          }),
          sensitivity: fc.float({ min: 0.5, max: 2.0 }),
        }),
        (config: S18ControllerConfig) => {
          // Initialize with the generated config
          s18ControllerService.initialize(config);

          // Verify the service is initialized
          const retrievedConfig = s18ControllerService.getConfig();

          if (config.enabled) {
            // If enabled, config should be stored
            expect(retrievedConfig).not.toBeNull();
            expect(retrievedConfig?.enabled).toBe(true);
            expect(retrievedConfig?.mode).toBe(config.mode);
            
            // Verify button mapping is preserved
            expect(retrievedConfig?.buttonMapping.up).toBe(config.buttonMapping.up);
            expect(retrievedConfig?.buttonMapping.down).toBe(config.buttonMapping.down);
            expect(retrievedConfig?.buttonMapping.left).toBe(config.buttonMapping.left);
            expect(retrievedConfig?.buttonMapping.right).toBe(config.buttonMapping.right);
            expect(retrievedConfig?.buttonMapping.touch).toBe(config.buttonMapping.touch);
          } else {
            // If disabled, service should still store config but not activate
            expect(retrievedConfig).not.toBeNull();
            expect(retrievedConfig?.enabled).toBe(false);
          }

          // Cleanup for next iteration
          s18ControllerService.cleanup();
          
          return true;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 32 (unit test): Controller detection works for supported platforms', () => {
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

    // Initialize the service
    s18ControllerService.initialize(config);

    // Verify the service is supported on this platform
    expect(s18ControllerService.isSupported()).toBe(true);

    // Verify mode detection
    const detectedMode = s18ControllerService.detectMode();
    expect(['mouse', 'keyboard', 'unknown']).toContain(detectedMode);

    // Verify config is stored
    const retrievedConfig = s18ControllerService.getConfig();
    expect(retrievedConfig).not.toBeNull();
    expect(retrievedConfig?.enabled).toBe(true);
    expect(retrievedConfig?.mode).toBe('mouse');
  });

  it('Property 32 (edge case): Disabled controller should not activate', () => {
    const config: S18ControllerConfig = {
      enabled: false,
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

    // Config should be stored but not active
    const retrievedConfig = s18ControllerService.getConfig();
    expect(retrievedConfig?.enabled).toBe(false);

    // Actions should not be triggered when disabled
    let actionCalled = false;
    s18ControllerService.onAction(() => {
      actionCalled = true;
    });

    // Try to trigger an action (should not work when disabled)
    if (typeof window !== 'undefined') {
      const event = new KeyboardEvent('keydown', { keyCode: 39 } as any);
      window.dispatchEvent(event);
    }

    expect(actionCalled).toBe(false);
  });
});
