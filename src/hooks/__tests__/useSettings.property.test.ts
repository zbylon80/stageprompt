/**
 * Feature: StagePrompt, Property 20: Zmiana ustawień aktualizuje konfigurację
 * Feature: StagePrompt, Property 21: Round-trip persystencji ustawień
 * Validates: Requirements 8.1, 8.2, 8.3, 8.4, 8.5
 */

import { renderHook, act, waitFor } from '@testing-library/react-native';
import fc from 'fast-check';
import { useSettings } from '../useSettings';
import { storageService } from '../../services/storageService';
import { AppSettings } from '../../types/models';

// Mock storage service
jest.mock('../../services/storageService');

describe('useSettings - Property-Based Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    jest.resetModules();
  });

  /**
   * Property 20: Zmiana ustawień aktualizuje konfigurację
   * For any valid AppSettings object, changing a setting should update the configuration
   */
  describe('Property 20: Settings update configuration', () => {
    it('should update configuration for any valid settings change', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generator for valid AppSettings
          fc.record({
            fontSize: fc.integer({ min: 24, max: 72 }),
            anchorYPercent: fc.float({ min: 0.0, max: 1.0, noNaN: true }),
            textColor: fc.integer({ min: 0, max: 0xFFFFFF }).map(n => `#${n.toString(16).padStart(6, '0')}`),
            backgroundColor: fc.integer({ min: 0, max: 0xFFFFFF }).map(n => `#${n.toString(16).padStart(6, '0')}`),
            marginHorizontal: fc.integer({ min: 0, max: 100 }),
            lineHeight: fc.integer({ min: 40, max: 120 }),
          }),
          async (newSettings: AppSettings) => {
            // Setup mock
            const mockSaveSettings = jest.fn().mockResolvedValue(undefined);
            const mockLoadSettings = jest.fn().mockResolvedValue(newSettings);
            (storageService.saveSettings as jest.Mock) = mockSaveSettings;
            (storageService.loadSettings as jest.Mock) = mockLoadSettings;

            // Render hook
            const { result } = renderHook(() => useSettings());

            // Wait for initial load
            await waitFor(() => {
              expect(result.current.loading).toBe(false);
            });

            // Save new settings
            await act(async () => {
              await result.current.saveSettings(newSettings);
            });

            // Verify settings were saved
            expect(mockSaveSettings).toHaveBeenCalledWith(newSettings);

            // Verify local state was updated
            expect(result.current.settings).toEqual(newSettings);
          }
        ),
        { numRuns: 100 }
      );
    }, 30000); // 30 second timeout for property test

    it('should update individual settings properties correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Initial settings
          fc.record({
            fontSize: fc.integer({ min: 24, max: 72 }),
            anchorYPercent: fc.float({ min: 0.0, max: 1.0, noNaN: true }),
            textColor: fc.integer({ min: 0, max: 0xFFFFFF }).map(n => `#${n.toString(16).padStart(6, '0')}`),
            backgroundColor: fc.integer({ min: 0, max: 0xFFFFFF }).map(n => `#${n.toString(16).padStart(6, '0')}`),
            marginHorizontal: fc.integer({ min: 0, max: 100 }),
            lineHeight: fc.integer({ min: 40, max: 120 }),
          }),
          // Property to change
          fc.constantFrom('fontSize', 'anchorYPercent', 'textColor', 'backgroundColor', 'marginHorizontal', 'lineHeight'),
          // New value (we'll generate appropriate value based on property)
          fc.anything(),
          async (initialSettings: AppSettings, propertyToChange: keyof AppSettings, _newValue: any) => {
            // Generate appropriate new value based on property type
            let newValue: any;
            switch (propertyToChange) {
              case 'fontSize':
                newValue = fc.sample(fc.integer({ min: 24, max: 72 }), 1)[0];
                break;
              case 'anchorYPercent':
                newValue = fc.sample(fc.float({ min: 0.0, max: 1.0, noNaN: true }), 1)[0];
                break;
              case 'textColor':
              case 'backgroundColor':
                newValue = `#${fc.sample(fc.integer({ min: 0, max: 0xFFFFFF }), 1)[0].toString(16).padStart(6, '0')}`;
                break;
              case 'marginHorizontal':
                newValue = fc.sample(fc.integer({ min: 0, max: 100 }), 1)[0];
                break;
              case 'lineHeight':
                newValue = fc.sample(fc.integer({ min: 40, max: 120 }), 1)[0];
                break;
            }

            const updatedSettings = { ...initialSettings, [propertyToChange]: newValue };

            // Setup mocks
            const mockSaveSettings = jest.fn().mockResolvedValue(undefined);
            const mockLoadSettings = jest.fn().mockResolvedValue(initialSettings);
            (storageService.saveSettings as jest.Mock) = mockSaveSettings;
            (storageService.loadSettings as jest.Mock) = mockLoadSettings;

            // Render hook
            const { result } = renderHook(() => useSettings());

            // Wait for initial load
            await waitFor(() => {
              expect(result.current.loading).toBe(false);
            });

            // Update settings
            await act(async () => {
              await result.current.saveSettings(updatedSettings);
            });

            // Verify the specific property was updated
            expect(result.current.settings?.[propertyToChange]).toBe(newValue);

            // Verify other properties remain unchanged
            const otherProperties = Object.keys(initialSettings).filter(k => k !== propertyToChange) as (keyof AppSettings)[];
            otherProperties.forEach(prop => {
              expect(result.current.settings?.[prop]).toBe(initialSettings[prop]);
            });
          }
        ),
        { numRuns: 100 }
      );
    }, 30000); // 30 second timeout for property test
  });

  /**
   * Property 21: Round-trip persystencji ustawień
   * For any AppSettings object, saving and then loading should return equivalent object
   */
  describe('Property 21: Settings persistence round-trip', () => {
    it('should preserve settings through save/load cycle', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            fontSize: fc.integer({ min: 24, max: 72 }),
            anchorYPercent: fc.float({ min: 0.0, max: 1.0, noNaN: true }),
            textColor: fc.integer({ min: 0, max: 0xFFFFFF }).map(n => `#${n.toString(16).padStart(6, '0')}`),
            backgroundColor: fc.integer({ min: 0, max: 0xFFFFFF }).map(n => `#${n.toString(16).padStart(6, '0')}`),
            marginHorizontal: fc.integer({ min: 0, max: 100 }),
            lineHeight: fc.integer({ min: 40, max: 120 }),
          }),
          async (originalSettings: AppSettings) => {
            // Setup mocks for round-trip - use a closure to maintain state
            let savedSettings: AppSettings = originalSettings;
            
            const mockSaveSettings = jest.fn().mockImplementation(async (settings: AppSettings) => {
              savedSettings = JSON.parse(JSON.stringify(settings)); // Deep copy
              return Promise.resolve();
            });
            
            const mockLoadSettings = jest.fn().mockImplementation(async () => {
              return Promise.resolve(JSON.parse(JSON.stringify(savedSettings))); // Deep copy
            });
            
            (storageService.saveSettings as jest.Mock) = mockSaveSettings;
            (storageService.loadSettings as jest.Mock) = mockLoadSettings;

            // First render - save settings
            const { result: result1, unmount: unmount1 } = renderHook(() => useSettings());

            // Wait for initial load
            await waitFor(() => {
              expect(result1.current.loading).toBe(false);
            });

            await act(async () => {
              await result1.current.saveSettings(originalSettings);
            });

            // Verify settings were saved
            expect(mockSaveSettings).toHaveBeenCalledWith(originalSettings);
            
            // Clean up first render
            unmount1();

            // Second render - load settings (simulating app restart)
            const { result: result2 } = renderHook(() => useSettings());

            // Wait for load to complete
            await waitFor(() => {
              expect(result2.current.loading).toBe(false);
            });

            // Verify loaded settings match original
            expect(result2.current.settings).toEqual(originalSettings);

            // Verify all properties are preserved
            if (result2.current.settings) {
              expect(result2.current.settings.fontSize).toBe(originalSettings.fontSize);
              expect(result2.current.settings.anchorYPercent).toBe(originalSettings.anchorYPercent);
              expect(result2.current.settings.textColor).toBe(originalSettings.textColor);
              expect(result2.current.settings.backgroundColor).toBe(originalSettings.backgroundColor);
              expect(result2.current.settings.marginHorizontal).toBe(originalSettings.marginHorizontal);
              expect(result2.current.settings.lineHeight).toBe(originalSettings.lineHeight);
            }
          }
        ),
        { numRuns: 100 }
      );
    }, 30000); // 30 second timeout for property test

    it('should handle multiple save/load cycles correctly', async () => {
      await fc.assert(
        fc.asyncProperty(
          // Generate array of settings to save in sequence
          fc.array(
            fc.record({
              fontSize: fc.integer({ min: 24, max: 72 }),
              anchorYPercent: fc.float({ min: 0.0, max: 1.0, noNaN: true }),
              textColor: fc.integer({ min: 0, max: 0xFFFFFF }).map(n => `#${n.toString(16).padStart(6, '0')}`),
              backgroundColor: fc.integer({ min: 0, max: 0xFFFFFF }).map(n => `#${n.toString(16).padStart(6, '0')}`),
              marginHorizontal: fc.integer({ min: 0, max: 100 }),
              lineHeight: fc.integer({ min: 40, max: 120 }),
            }),
            { minLength: 2, maxLength: 5 }
          ),
          async (settingsSequence: AppSettings[]) => {
            let currentSettings: AppSettings | null = null;
            
            const mockSaveSettings = jest.fn().mockImplementation(async (settings: AppSettings) => {
              currentSettings = JSON.parse(JSON.stringify(settings)); // Deep copy
              return Promise.resolve();
            });
            
            const mockLoadSettings = jest.fn().mockImplementation(async () => {
              return Promise.resolve(currentSettings ? JSON.parse(JSON.stringify(currentSettings)) : null);
            });
            
            (storageService.saveSettings as jest.Mock) = mockSaveSettings;
            (storageService.loadSettings as jest.Mock) = mockLoadSettings;

            const { result } = renderHook(() => useSettings());

            // Wait for initial load
            await waitFor(() => {
              expect(result.current.loading).toBe(false);
            });

            // Save each settings object in sequence
            for (const settings of settingsSequence) {
              await act(async () => {
                await result.current.saveSettings(settings);
              });

              // Reload to verify persistence
              await act(async () => {
                await result.current.reload();
              });

              await waitFor(() => {
                expect(result.current.loading).toBe(false);
              });

              // Verify current settings match what we just saved
              expect(result.current.settings).toEqual(settings);
            }

            // Final verification: last settings should be persisted
            const lastSettings = settingsSequence[settingsSequence.length - 1];
            expect(result.current.settings).toEqual(lastSettings);
          }
        ),
        { numRuns: 50 } // Fewer runs since this is more complex
      );
    }, 30000); // 30 second timeout for property test
  });
});
