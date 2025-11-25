// services/keyEventService.ts

import { KeyMapping, PrompterAction } from '../types/models';
import { isWeb, isAndroid, supportsKeyEvents } from '../utils/platform';

type ActionCallback = (action: PrompterAction) => void;

class KeyEventService {
  private keyMapping: KeyMapping = {};
  private actionCallback: ActionCallback | null = null;
  private lastKeyTime: { [keyCode: number]: number } = {};
  private debounceMs = 300;
  private keyEventListener: any = null;
  private webKeyListener: ((event: KeyboardEvent) => void) | null = null;

  /**
   * Initialize the key event service
   * Sets up platform-specific event listeners
   */
  initialize(): void {
    if (!supportsKeyEvents) {
      console.warn('Key events not supported on this platform');
      return;
    }

    if (isAndroid) {
      this.initializeAndroid();
    } else if (isWeb) {
      this.initializeWeb();
    }
  }

  /**
   * Initialize Android key event handling using react-native-keyevent
   */
  private initializeAndroid(): void {
    try {
      // Dynamic import to avoid errors on web
      const KeyEvent = require('react-native-keyevent');
      
      this.keyEventListener = (keyEvent: any) => {
        this.handleKeyEvent(keyEvent.keyCode);
      };

      KeyEvent.onKeyDownListener(this.keyEventListener);
    } catch (error) {
      console.warn('react-native-keyevent not available:', error);
    }
  }

  /**
   * Initialize web keyboard event handling
   */
  private initializeWeb(): void {
    if (typeof window === 'undefined') return;

    this.webKeyListener = (event: KeyboardEvent) => {
      // Prevent default behavior for mapped keys
      const keyCode = event.keyCode || event.which;
      if (this.isMappedKey(keyCode)) {
        event.preventDefault();
      }
      this.handleKeyEvent(keyCode);
    };

    window.addEventListener('keydown', this.webKeyListener);
  }

  /**
   * Clean up event listeners
   */
  cleanup(): void {
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

    this.keyEventListener = null;
    this.webKeyListener = null;
    this.actionCallback = null;
    this.lastKeyTime = {};
  }

  /**
   * Set the key mapping configuration
   */
  setKeyMapping(mapping: KeyMapping): void {
    this.keyMapping = mapping;
  }

  /**
   * Register a callback for when actions are triggered
   */
  onAction(callback: ActionCallback): void {
    this.actionCallback = callback;
  }

  /**
   * Handle a key event with debouncing
   */
  private handleKeyEvent(keyCode: number): void {
    // Check if key is debounced
    if (this.isDebounced(keyCode)) {
      return;
    }

    // Update last key time
    this.lastKeyTime[keyCode] = Date.now();

    // Find action for this keyCode
    const action = this.getActionForKey(keyCode);
    
    if (action && this.actionCallback) {
      this.actionCallback(action);
    }
  }

  /**
   * Check if a key press should be debounced
   */
  private isDebounced(keyCode: number): boolean {
    const lastTime = this.lastKeyTime[keyCode];
    if (!lastTime) return false;

    const timeSinceLastPress = Date.now() - lastTime;
    return timeSinceLastPress < this.debounceMs;
  }

  /**
   * Get the action mapped to a specific keyCode
   */
  private getActionForKey(keyCode: number): PrompterAction | null {
    if (this.keyMapping.nextSong === keyCode) return 'nextSong';
    if (this.keyMapping.prevSong === keyCode) return 'prevSong';
    if (this.keyMapping.pause === keyCode) return 'pause';
    return null;
  }

  /**
   * Check if a keyCode is mapped to any action
   */
  private isMappedKey(keyCode: number): boolean {
    return this.getActionForKey(keyCode) !== null;
  }

  /**
   * Get current key mapping
   */
  getKeyMapping(): KeyMapping {
    return { ...this.keyMapping };
  }

  /**
   * Check if key events are supported on this platform
   */
  isSupported(): boolean {
    return supportsKeyEvents;
  }
}

// Export singleton instance
export const keyEventService = new KeyEventService();
