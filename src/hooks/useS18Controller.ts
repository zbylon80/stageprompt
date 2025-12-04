// hooks/useS18Controller.ts

import { useState, useEffect } from 'react';
import { S18ControllerConfig, S18ButtonType, PrompterAction } from '../types/models';
import { s18ControllerService } from '../services/s18ControllerService';
import { storageService } from '../services/storageService';

interface UseS18ControllerReturn {
  config: S18ControllerConfig;
  isEnabled: boolean;
  updateConfig: (config: Partial<S18ControllerConfig>) => Promise<void>;
  testButton: (button: S18ButtonType) => Promise<boolean>;
  detectMode: () => 'mouse' | 'keyboard' | 'unknown';
  resetToDefaults: () => Promise<void>;
}

/**
 * Default S18 controller configuration
 */
function getDefaultS18Config(): S18ControllerConfig {
  return {
    enabled: false,
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
}

/**
 * Hook for managing S18 controller configuration and state
 * 
 * Features:
 * - Loads configuration from storage on mount
 * - Initializes s18ControllerService when config changes
 * - Provides methods to update, test, and reset configuration
 * - Handles cleanup on unmount
 * 
 * @returns {UseS18ControllerReturn} Controller state and methods
 */
export function useS18Controller(): UseS18ControllerReturn {
  const [config, setConfig] = useState<S18ControllerConfig>(getDefaultS18Config());
  const [isEnabled, setIsEnabled] = useState(false);

  // Load config from storage on mount
  useEffect(() => {
    loadS18Config();
  }, []);

  // Initialize service when config changes
  useEffect(() => {
    if (config.enabled) {
      s18ControllerService.initialize(config);
    } else {
      s18ControllerService.cleanup();
    }
    
    // Cleanup on unmount
    return () => {
      s18ControllerService.cleanup();
    };
  }, [config]);

  /**
   * Load S18 configuration from storage
   */
  const loadS18Config = async () => {
    try {
      const saved = await storageService.loadS18Config();
      if (saved) {
        setConfig(saved);
        setIsEnabled(saved.enabled);
      }
    } catch (error) {
      console.error('Failed to load S18 config:', error);
      // Keep default config on error
    }
  };

  /**
   * Update S18 configuration (partial update)
   * Merges with existing config and saves to storage
   * 
   * @param partial - Partial configuration to update
   */
  const updateConfig = async (partial: Partial<S18ControllerConfig>) => {
    const newConfig = { ...config, ...partial };
    setConfig(newConfig);
    setIsEnabled(newConfig.enabled);
    
    try {
      await storageService.saveS18Config(newConfig);
    } catch (error) {
      console.error('Failed to save S18 config:', error);
      throw error;
    }
  };

  /**
   * Test a specific button on the S18 controller
   * Waits for button press or times out after 5 seconds
   * 
   * @param button - Button type to test
   * @returns Promise that resolves to true if button was pressed, false if timeout
   */
  const testButton = async (button: S18ButtonType): Promise<boolean> => {
    return await s18ControllerService.testButton(button);
  };

  /**
   * Detect the controller mode (mouse or keyboard)
   * 
   * @returns Detected mode or 'unknown'
   */
  const detectMode = (): 'mouse' | 'keyboard' | 'unknown' => {
    return s18ControllerService.detectMode();
  };

  /**
   * Reset configuration to default values
   * Saves defaults to storage
   */
  const resetToDefaults = async () => {
    const defaults = getDefaultS18Config();
    await updateConfig(defaults);
  };

  return {
    config,
    isEnabled,
    updateConfig,
    testButton,
    detectMode,
    resetToDefaults,
  };
}
