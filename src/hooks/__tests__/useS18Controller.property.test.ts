// hooks/__tests__/useS18Controller.property.test.ts

import fc from 'fast-check';
import { storageService } from '../../services/storageService';
import { S18ControllerConfig, PrompterAction, S18ButtonType } from '../../types/models';

/**
 * Feature: StagePrompt, Property 38: Round-trip persystencji konfiguracji S18
 * Validates: Requirements 14.9
 * 
 * For any S18ControllerConfig, saving it to storage and then loading
 * should return an equivalent configuration.
 */
describe('S18 Controller Config Persistence - Property Tests', () => {
  beforeEach(async () => {
    // Clear storage before each test
    await storageService.clearAll();
  });

  afterEach(async () => {
    // Clean up after each test
    await storageService.clearAll();
  });

  describe('Property 38: Round-trip persystencji konfiguracji S18', () => {
    it('should preserve S18 config through save/load cycle', async () => {
      await fc.assert(
        fc.asyncProperty(
          s18ConfigGenerator(),
          async (config) => {
            // Save config
            await storageService.saveS18Config(config);

            // Load config
            const loaded = await storageService.loadS18Config();

            // Verify round-trip
            expect(loaded).toEqual(config);
            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should handle multiple save/load cycles', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(s18ConfigGenerator(), { minLength: 1, maxLength: 5 }),
          async (configs) => {
            // Save and load each config in sequence
            for (const config of configs) {
              await storageService.saveS18Config(config);
              const loaded = await storageService.loadS18Config();
              expect(loaded).toEqual(config);
            }
            return true;
          }
        ),
        { numRuns: 50 }
      );
    });

    it('should preserve all button mappings', async () => {
      await fc.assert(
        fc.asyncProperty(
          s18ConfigGenerator(),
          async (config) => {
            await storageService.saveS18Config(config);
            const loaded = await storageService.loadS18Config();

            // Verify each button mapping is preserved
            expect(loaded?.buttonMapping.up).toBe(config.buttonMapping.up);
            expect(loaded?.buttonMapping.down).toBe(config.buttonMapping.down);
            expect(loaded?.buttonMapping.left).toBe(config.buttonMapping.left);
            expect(loaded?.buttonMapping.right).toBe(config.buttonMapping.right);
            expect(loaded?.buttonMapping.touch).toBe(config.buttonMapping.touch);
            
            if (config.buttonMapping.auxiliary) {
              expect(loaded?.buttonMapping.auxiliary).toBe(config.buttonMapping.auxiliary);
            }

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve click zones configuration', async () => {
      await fc.assert(
        fc.asyncProperty(
          s18ConfigGenerator(),
          async (config) => {
            await storageService.saveS18Config(config);
            const loaded = await storageService.loadS18Config();

            // Verify click zones are preserved
            expect(loaded?.clickZones.left).toEqual(config.clickZones.left);
            expect(loaded?.clickZones.center).toEqual(config.clickZones.center);
            expect(loaded?.clickZones.right).toEqual(config.clickZones.right);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should preserve enabled state and mode', async () => {
      await fc.assert(
        fc.asyncProperty(
          s18ConfigGenerator(),
          async (config) => {
            await storageService.saveS18Config(config);
            const loaded = await storageService.loadS18Config();

            expect(loaded?.enabled).toBe(config.enabled);
            expect(loaded?.mode).toBe(config.mode);
            expect(loaded?.sensitivity).toBe(config.sensitivity);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    });

    it('should return null when no config is saved', async () => {
      const loaded = await storageService.loadS18Config();
      expect(loaded).toBeNull();
    });

    it('should overwrite previous config on save', async () => {
      await fc.assert(
        fc.asyncProperty(
          s18ConfigGenerator(),
          s18ConfigGenerator(),
          async (config1, config2) => {
            // Skip if configs are identical (rare but possible)
            if (JSON.stringify(config1) === JSON.stringify(config2)) {
              return true;
            }

            // Save first config
            await storageService.saveS18Config(config1);
            
            // Save second config (should overwrite)
            await storageService.saveS18Config(config2);
            
            // Load should return second config
            const loaded = await storageService.loadS18Config();
            expect(loaded).toEqual(config2);
            expect(loaded).not.toEqual(config1);

            return true;
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});

/**
 * Generator for valid PrompterAction values
 */
function prompterActionGenerator(): fc.Arbitrary<PrompterAction> {
  return fc.constantFrom(
    'nextSong',
    'prevSong',
    'pause',
    'increaseSpeed',
    'decreaseSpeed',
    'resetSpeed'
  );
}

/**
 * Generator for S18ButtonMapping
 */
function s18ButtonMappingGenerator(): fc.Arbitrary<any> {
  return fc.record({
    up: prompterActionGenerator(),
    down: prompterActionGenerator(),
    left: prompterActionGenerator(),
    right: prompterActionGenerator(),
    touch: prompterActionGenerator(),
    auxiliary: fc.option(prompterActionGenerator()),
  });
}

/**
 * Generator for click zone configuration
 * Ensures zones are valid (x and width between 0 and 1, sum <= 1)
 */
function clickZonesGenerator(): fc.Arbitrary<any> {
  // Generate valid zone configurations
  // For simplicity, we use a few predefined valid configurations
  return fc.constantFrom(
    // Default configuration
    {
      left: { x: 0, width: 0.33 },
      center: { x: 0.33, width: 0.34 },
      right: { x: 0.67, width: 0.33 },
    },
    // Equal thirds
    {
      left: { x: 0, width: 0.333 },
      center: { x: 0.333, width: 0.334 },
      right: { x: 0.667, width: 0.333 },
    },
    // Larger center zone
    {
      left: { x: 0, width: 0.25 },
      center: { x: 0.25, width: 0.5 },
      right: { x: 0.75, width: 0.25 },
    },
    // Larger side zones
    {
      left: { x: 0, width: 0.4 },
      center: { x: 0.4, width: 0.2 },
      right: { x: 0.6, width: 0.4 },
    }
  );
}

/**
 * Generator for valid S18ControllerConfig
 */
function s18ConfigGenerator(): fc.Arbitrary<S18ControllerConfig> {
  return fc.record({
    enabled: fc.boolean(),
    mode: fc.constantFrom('mouse', 'keyboard'),
    buttonMapping: s18ButtonMappingGenerator(),
    clickZones: clickZonesGenerator(),
    sensitivity: fc.float({ min: Math.fround(0.5), max: Math.fround(2.0), noNaN: true }),
  });
}
