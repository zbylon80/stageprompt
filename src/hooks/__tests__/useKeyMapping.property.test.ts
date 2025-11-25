// hooks/__tests__/useKeyMapping.property.test.ts

import { renderHook, act, waitFor } from '@testing-library/react-native';
import fc from 'fast-check';
import { useKeyMapping } from '../useKeyMapping';
import { storageService } from '../../services/storageService';
import { KeyMapping } from '../../types/models';

// Mock the storage service
jest.mock('../../services/storageService');

describe('useKeyMapping - Property-Based Tests', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  /**
   * Feature: StagePrompt, Property 17: Mapowanie klawisza tworzy powiązanie
   * Validates: Requirements 7.2
   */
  describe('Property 17: Mapowanie klawisza tworzy powiązanie', () => {
    it('should create a binding when mapping a key to an action', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            nextSong: fc.option(fc.integer({ min: 0, max: 255 })),
            prevSong: fc.option(fc.integer({ min: 0, max: 255 })),
            pause: fc.option(fc.integer({ min: 0, max: 255 })),
          }),
          async (mapping: KeyMapping) => {
            // Mock storage to return empty mapping initially
            (storageService.loadKeyMapping as jest.Mock).mockResolvedValue({});
            (storageService.saveKeyMapping as jest.Mock).mockResolvedValue(undefined);

            const { result } = renderHook(() => useKeyMapping());

            // Wait for initial load
            await waitFor(() => {
              expect(result.current.loading).toBe(false);
            }, { timeout: 1000 });

            // Save the mapping
            await act(async () => {
              await result.current.saveKeyMapping(mapping);
            });

            // Verify the mapping was saved
            expect(storageService.saveKeyMapping).toHaveBeenCalledWith(mapping);

            // Verify the local state was updated
            expect(result.current.keyMapping).toEqual(mapping);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    }, 30000); // 30 second timeout for property test
  });

  /**
   * Feature: StagePrompt, Property 18: Round-trip persystencji mapowań klawiszy
   * Validates: Requirements 7.3, 7.5
   */
  describe('Property 18: Round-trip persystencji mapowań klawiszy', () => {
    it('should preserve key mapping through save/load cycle', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            nextSong: fc.option(fc.integer({ min: 0, max: 255 })),
            prevSong: fc.option(fc.integer({ min: 0, max: 255 })),
            pause: fc.option(fc.integer({ min: 0, max: 255 })),
          }),
          async (mapping: KeyMapping) => {
            // Mock storage to simulate round-trip
            (storageService.loadKeyMapping as jest.Mock).mockResolvedValue(mapping);
            (storageService.saveKeyMapping as jest.Mock).mockResolvedValue(undefined);

            const { result } = renderHook(() => useKeyMapping());

            // Wait for initial load
            await waitFor(() => {
              expect(result.current.loading).toBe(false);
            }, { timeout: 1000 });

            // Verify loaded mapping matches
            expect(result.current.keyMapping).toEqual(mapping);

            // Save the mapping
            await act(async () => {
              await result.current.saveKeyMapping(mapping);
            });

            // Reload
            (storageService.loadKeyMapping as jest.Mock).mockResolvedValue(mapping);
            await act(async () => {
              await result.current.reload();
            });

            // Wait for reload to complete
            await waitFor(() => {
              expect(result.current.loading).toBe(false);
            }, { timeout: 1000 });

            // Verify mapping is still the same
            expect(result.current.keyMapping).toEqual(mapping);

            return true;
          }
        ),
        { numRuns: 100 }
      );
    }, 30000); // 30 second timeout for property test
  });

  /**
   * Feature: StagePrompt, Property 19: Czyszczenie mapowania usuwa powiązanie
   * Validates: Requirements 7.4
   */
  describe('Property 19: Czyszczenie mapowania usuwa powiązanie', () => {
    it('should remove binding when clearing a key mapping', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            nextSong: fc.option(fc.integer({ min: 0, max: 255 })),
            prevSong: fc.option(fc.integer({ min: 0, max: 255 })),
            pause: fc.option(fc.integer({ min: 0, max: 255 })),
          }),
          fc.constantFrom('nextSong', 'prevSong', 'pause'),
          async (mapping: KeyMapping, actionToClear: keyof KeyMapping) => {
            // Skip if the action is already undefined
            if (mapping[actionToClear] === undefined) {
              return true;
            }

            // Mock storage
            (storageService.loadKeyMapping as jest.Mock).mockResolvedValue(mapping);
            (storageService.saveKeyMapping as jest.Mock).mockResolvedValue(undefined);

            const { result } = renderHook(() => useKeyMapping());

            // Wait for initial load
            await waitFor(() => {
              expect(result.current.loading).toBe(false);
            }, { timeout: 1000 });

            // Verify initial mapping has the key
            expect(result.current.keyMapping?.[actionToClear]).toBeDefined();

            // Clear the mapping for this action
            const clearedMapping: KeyMapping = {
              ...mapping,
              [actionToClear]: undefined,
            };

            await act(async () => {
              await result.current.saveKeyMapping(clearedMapping);
            });

            // Verify the mapping was saved without the cleared action
            expect(storageService.saveKeyMapping).toHaveBeenCalledWith(clearedMapping);

            // Verify the local state was updated
            expect(result.current.keyMapping?.[actionToClear]).toBeUndefined();

            return true;
          }
        ),
        { numRuns: 100 }
      );
    }, 30000); // 30 second timeout for property test

    it('should handle clearing all mappings', async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            nextSong: fc.option(fc.integer({ min: 0, max: 255 })),
            prevSong: fc.option(fc.integer({ min: 0, max: 255 })),
            pause: fc.option(fc.integer({ min: 0, max: 255 })),
          }),
          async (mapping: KeyMapping) => {
            // Mock storage
            (storageService.loadKeyMapping as jest.Mock).mockResolvedValue(mapping);
            (storageService.saveKeyMapping as jest.Mock).mockResolvedValue(undefined);

            const { result } = renderHook(() => useKeyMapping());

            // Wait for initial load
            await waitFor(() => {
              expect(result.current.loading).toBe(false);
            }, { timeout: 1000 });

            // Clear all mappings
            const emptyMapping: KeyMapping = {};

            await act(async () => {
              await result.current.saveKeyMapping(emptyMapping);
            });

            // Verify all mappings are cleared
            expect(result.current.keyMapping).toEqual(emptyMapping);
            expect(result.current.keyMapping?.nextSong).toBeUndefined();
            expect(result.current.keyMapping?.prevSong).toBeUndefined();
            expect(result.current.keyMapping?.pause).toBeUndefined();

            return true;
          }
        ),
        { numRuns: 100 }
      );
    }, 30000); // 30 second timeout for property test
  });
});
