// services/s18ControllerService.ts

import { S18ControllerConfig, S18ButtonType, PrompterAction } from '../types/models';
import { isWeb, isAndroid, supportsKeyEvents } from '../utils/platform';

type ActionCallback = (action: PrompterAction) => void;

/**
 * Service for handling S18 Bluetooth controller
 * Supports both mouse mode (click zones) and keyboard mode (key events)
 */
class S18ControllerService {
  private config: S18ControllerConfig | null = null;
  private actionCallback: ActionCallback | null = null;
  private lastActionTime: number = 0;
  private debounceMs = 300;
  private keyEventListener: any = null;
  private webKeyListener: ((event: KeyboardEvent) => void) | null = null;
  private mouseListener: ((event: MouseEvent) => void) | null = null;
  private testButtonCallback: ((button: S18ButtonType) => void) | null = null;

  /**
   * Initialize the S18 controller service with configuration
   */
  initialize(config: S18ControllerConfig): void {
    this.config = config;

    if (!config.enabled) {
      console.log('S18 Controller is disabled');
      return;
    }

    if (config.mode === 'mouse') {
      this.initializeMouseMode();
    } else if (config.mode === 'keyboard') {
      this.initializeKeyboardMode();
    }
  }

  /**
   * Initialize mouse mode - detects clicks in screen zones
   */
  private initializeMouseMode(): void {
    if (!isWeb) {
      console.warn('Mouse mode only supported on web platform');
      return;
    }

    if (typeof window === 'undefined') return;

    this.mouseListener = (event: MouseEvent) => {
      this.handleMouseClick(event);
    };

    window.addEventListener('click', this.mouseListener);
    console.log('S18 Controller initialized in mouse mode');
  }

  /**
   * Initialize keyboard mode - maps key codes to actions
   */
  private initializeKeyboardMode(): void {
    if (!supportsKeyEvents) {
      console.warn('Keyboard mode not supported on this platform');
      return;
    }

    if (isAndroid) {
      this.initializeAndroidKeyboard();
    } else if (isWeb) {
      this.initializeWebKeyboard();
    }
  }

  /**
   * Initialize Android keyboard handling
   */
  private initializeAndroidKeyboard(): void {
    try {
      const KeyEvent = require('react-native-keyevent');
      
      this.keyEventListener = (keyEvent: any) => {
        this.handleKeyEvent(keyEvent.keyCode);
      };

      KeyEvent.onKeyDownListener(this.keyEventListener);
      console.log('S18 Controller initialized in keyboard mode (Android)');
    } catch (error) {
      console.warn('react-native-keyevent not available:', error);
    }
  }

  /**
   * Initialize web keyboard handling
   */
  private initializeWebKeyboard(): void {
    if (typeof window === 'undefined') return;

    this.webKeyListener = (event: KeyboardEvent) => {
      const keyCode = event.keyCode || event.which;
      this.handleKeyEvent(keyCode);
    };

    window.addEventListener('keydown', this.webKeyListener);
    console.log('S18 Controller initialized in keyboard mode (Web)');
  }

  /**
   * Handle mouse click and determine which zone was clicked
   */
  private handleMouseClick(event: MouseEvent): void {
    if (!this.config) return;

    // Check if click is debounced
    if (this.isDebounced()) return;

    const screenWidth = window.innerWidth;
    const clickX = event.clientX;
    const relativeX = clickX / screenWidth;

    // Determine which zone was clicked
    const { clickZones, buttonMapping } = this.config;
    
    let action: PrompterAction | null = null;

    if (relativeX >= clickZones.left.x && relativeX < clickZones.left.x + clickZones.left.width) {
      action = buttonMapping.left;
    } else if (relativeX >= clickZones.center.x && relativeX < clickZones.center.x + clickZones.center.width) {
      action = buttonMapping.touch;
    } else if (relativeX >= clickZones.right.x && relativeX < clickZones.right.x + clickZones.right.width) {
      action = buttonMapping.right;
    }

    if (action && this.actionCallback) {
      this.lastActionTime = Date.now();
      this.actionCallback(action);
    }
  }

  /**
   * Handle keyboard event and map to S18 button
   */
  private handleKeyEvent(keyCode: number): void {
    if (!this.config) return;

    // Check if action is debounced
    if (this.isDebounced()) return;

    // Map keyCode to S18 button type
    const button = this.mapKeyCodeToButton(keyCode);
    
    if (button) {
      // Notify test button callback if active
      if (this.testButtonCallback) {
        this.testButtonCallback(button);
      }

      const action = this.config.buttonMapping[button];
      if (action && this.actionCallback) {
        this.lastActionTime = Date.now();
        this.actionCallback(action);
      }
    }
  }

  /**
   * Map keyCode to S18 button type
   * Based on common S18 controller key codes
   */
  private mapKeyCodeToButton(keyCode: number): S18ButtonType | null {
    // Common key codes for S18 controller
    // These may need adjustment based on actual S18 behavior
    const keyMap: Record<number, S18ButtonType> = {
      38: 'up',      // Arrow Up or KEYCODE_DPAD_UP (19)
      40: 'down',    // Arrow Down or KEYCODE_DPAD_DOWN (20)
      37: 'left',    // Arrow Left or KEYCODE_DPAD_LEFT (21)
      39: 'right',   // Arrow Right or KEYCODE_DPAD_RIGHT (22)
      13: 'touch',   // Enter or KEYCODE_ENTER (66)
      32: 'touch',   // Space (alternative)
      // Android key codes
      19: 'up',
      20: 'down',
      21: 'left',
      22: 'right',
      66: 'touch',
    };

    return keyMap[keyCode] || null;
  }

  /**
   * Check if action should be debounced
   */
  private isDebounced(): boolean {
    const timeSinceLastAction = Date.now() - this.lastActionTime;
    return timeSinceLastAction < this.debounceMs;
  }

  /**
   * Register callback for actions
   */
  onAction(callback: ActionCallback): void {
    this.actionCallback = callback;
  }

  /**
   * Update configuration
   */
  setConfig(config: S18ControllerConfig): void {
    this.cleanup();
    this.initialize(config);
  }

  /**
   * Detect controller mode (mouse or keyboard)
   * Returns the detected mode or 'unknown'
   */
  detectMode(): 'mouse' | 'keyboard' | 'unknown' {
    // For S18, default to mouse mode on web, keyboard on Android
    if (isWeb) {
      return 'mouse';
    } else if (isAndroid && supportsKeyEvents) {
      return 'keyboard';
    }
    return 'unknown';
  }

  /**
   * Test a specific button
   * Returns a promise that resolves when the button is pressed
   * or rejects after timeout
   */
  async testButton(button: S18ButtonType): Promise<boolean> {
    return new Promise((resolve) => {
      const timeout = setTimeout(() => {
        this.testButtonCallback = null;
        resolve(false);
      }, 5000);

      this.testButtonCallback = (detectedButton: S18ButtonType) => {
        if (detectedButton === button) {
          clearTimeout(timeout);
          this.testButtonCallback = null;
          resolve(true);
        }
      };
    });
  }

  /**
   * Clean up event listeners
   */
  cleanup(): void {
    // Clean up keyboard listeners
    if (isAndroid && this.keyEventListener) {
      try {
        const KeyEvent = require('react-native-keyevent');
        KeyEvent.removeKeyDownListener();
      } catch (error) {
        console.warn('Error cleaning up Android key events:', error);
      }
    } else if (isWeb && this.webKeyListener) {
      if (typeof window !== 'undefined') {
        window.removeEventListener('keydown', this.webKeyListener);
      }
    }

    // Clean up mouse listener
    if (this.mouseListener && typeof window !== 'undefined') {
      window.removeEventListener('click', this.mouseListener);
    }

    this.keyEventListener = null;
    this.webKeyListener = null;
    this.mouseListener = null;
    this.actionCallback = null;
    this.testButtonCallback = null;
    this.config = null;
  }

  /**
   * Check if S18 controller is supported on this platform
   */
  isSupported(): boolean {
    return isWeb || (isAndroid && supportsKeyEvents);
  }

  /**
   * Get current configuration
   */
  getConfig(): S18ControllerConfig | null {
    return this.config ? { ...this.config } : null;
  }
}

// Export singleton instance
export const s18ControllerService = new S18ControllerService();
