// services/__tests__/keyEventService.crossplatform.property.test.ts

/**
 * Feature: StagePrompt, Property 26: Klawiatura działa jak kontroler na web/desktop
 * Feature: StagePrompt, Property 27: Graceful degradation bez Bluetooth
 * Validates: Requirements 10.3, 10.4
 */

import './setup'; // Import test setup
import fc from 'fast-check';
import { keyEventService } from '../keyEventService';
import { KeyMapping, PrompterAction } from '../../types/models';
import { isWeb, supportsKeyEvents } from '../../utils/platform';

describe('keyEventService - cross-platform support', () => {
  beforeEach(() => {
    keyEventService.cleanup();
    if (typeof (global as any).clearWindowListeners === 'function') {
      (global as any).clearWindowListeners();
    }
  });

  afterEach(() => {
    keyEventService.cleanup();
  });

  it('Property 26: On web/desktop, keyboard events should work the same as external controller events', () => {
    if (!isWeb) {
      // Skip this test on non-web platforms
      return;
    }

    fc.assert(
      fc.property(
        fc.integer({ min: 8, max: 222 }),
        fc.constantFrom<PrompterAction>('nextSong', 'prevSong', 'pause'),
        (keyCode, expectedAction) => {
          // Set up mapping
          const mapping: KeyMapping = {
            [expectedAction]: keyCode,
          };

          keyEventService.setKeyMapping(mapping);

          let triggeredAction: PrompterAction | null = null;
          keyEventService.onAction((action) => {
            triggeredAction = action;
          });

          keyEventService.initialize();

          // Simulate keyboard event (as if from external controller)
          const event = new KeyboardEvent('keydown', { keyCode } as any);
          window.dispatchEvent(event);

          // Verify the action was triggered correctly
          expect(triggeredAction).toBe(expectedAction);
          return triggeredAction === expectedAction;
        }
      ),
      { numRuns: 100 }
    );
  });

  it('Property 27: When Bluetooth is unavailable, the application should continue functioning with touch controls', () => {
    // This property tests graceful degradation
    
    // Test 1: Service should report support status correctly
    const isSupported = keyEventService.isSupported();
    expect(typeof isSupported).toBe('boolean');
    expect(isSupported).toBe(supportsKeyEvents);

    // Test 2: Initialize should not throw even if key events are not supported
    expect(() => {
      keyEventService.initialize();
    }).not.toThrow();

    // Test 3: Cleanup should not throw
    expect(() => {
      keyEventService.cleanup();
    }).not.toThrow();

    // Test 4: Setting key mapping should work regardless of platform
    const mapping: KeyMapping = {
      nextSong: 39,
      prevSong: 37,
      pause: 32,
    };

    expect(() => {
      keyEventService.setKeyMapping(mapping);
    }).not.toThrow();

    const retrievedMapping = keyEventService.getKeyMapping();
    expect(retrievedMapping).toEqual(mapping);
  });

  it('Property 27 (unit test): Service degrades gracefully on unsupported platforms', () => {
    // Test that the service can be used even if key events are not supported
    
    const mapping: KeyMapping = {
      nextSong: 39,
      prevSong: 37,
      pause: 32,
    };

    // These operations should all work without throwing
    keyEventService.setKeyMapping(mapping);
    
    let actionCalled = false;
    keyEventService.onAction(() => {
      actionCalled = true;
    });

    keyEventService.initialize();
    
    // On web, we can test that events work
    if (isWeb && typeof window !== 'undefined') {
      window.dispatchEvent(new KeyboardEvent('keydown', { keyCode: 39 } as any));
      expect(actionCalled).toBe(true);
    }

    // Cleanup should work
    keyEventService.cleanup();
  });

  it('Property 26 (edge case): Web keyboard events should prevent default for mapped keys', () => {
    if (!isWeb || typeof window === 'undefined') {
      return;
    }

    const mapping: KeyMapping = {
      nextSong: 39, // Right arrow
      prevSong: 37, // Left arrow
      pause: 32,    // Space
    };

    keyEventService.setKeyMapping(mapping);
    keyEventService.onAction(() => {});
    keyEventService.initialize();

    // Create a keyboard event and check if preventDefault is called
    const event = new KeyboardEvent('keydown', { keyCode: 39, cancelable: true } as any);
    const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
    
    window.dispatchEvent(event);

    // For mapped keys, preventDefault should be called
    expect(preventDefaultSpy).toHaveBeenCalled();
  });

  it('Property 26 (edge case): Web keyboard events should NOT prevent default for unmapped keys', () => {
    if (!isWeb || typeof window === 'undefined') {
      return;
    }

    const mapping: KeyMapping = {
      nextSong: 39, // Right arrow
    };

    keyEventService.setKeyMapping(mapping);
    keyEventService.onAction(() => {});
    keyEventService.initialize();

    // Create a keyboard event for an unmapped key
    const event = new KeyboardEvent('keydown', { keyCode: 65, cancelable: true } as any); // A key
    const preventDefaultSpy = jest.spyOn(event, 'preventDefault');
    
    window.dispatchEvent(event);

    // For unmapped keys, preventDefault should NOT be called
    expect(preventDefaultSpy).not.toHaveBeenCalled();
  });
});
