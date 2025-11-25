// services/__tests__/setup.ts
// Setup file for keyEventService tests

// Mock KeyboardEvent for Jest environment
if (typeof KeyboardEvent === 'undefined') {
  (global as any).KeyboardEvent = class KeyboardEvent extends Event {
    keyCode: number;
    which: number;
    cancelable: boolean;
    constructor(type: string, options: any = {}) {
      super(type, options);
      this.keyCode = options.keyCode || 0;
      this.which = options.which || this.keyCode;
      this.cancelable = options.cancelable !== false;
    }
  };
}

// Setup window event system if not available
if (typeof window !== 'undefined') {
  const listeners: { [key: string]: Set<(event: Event) => void> } = {};
  
  const originalAddEventListener = window.addEventListener;
  const originalRemoveEventListener = window.removeEventListener;
  const originalDispatchEvent = window.dispatchEvent;
  
  (window as any).addEventListener = function(type: string, listener: (event: Event) => void) {
    if (!listeners[type]) listeners[type] = new Set();
    listeners[type].add(listener);
    if (originalAddEventListener) {
      originalAddEventListener.call(window, type, listener);
    }
  };
  
  (window as any).removeEventListener = function(type: string, listener: (event: Event) => void) {
    if (listeners[type]) {
      listeners[type].delete(listener);
    }
    if (originalRemoveEventListener) {
      originalRemoveEventListener.call(window, type, listener);
    }
  };
  
  (window as any).dispatchEvent = function(event: Event) {
    const eventListeners = listeners[event.type];
    if (eventListeners) {
      eventListeners.forEach(listener => {
        try {
          listener(event);
        } catch (error) {
          console.error('Error in event listener:', error);
        }
      });
    }
    if (originalDispatchEvent) {
      return originalDispatchEvent.call(window, event);
    }
    return true;
  };
  
  // Clear listeners between tests
  (global as any).clearWindowListeners = () => {
    Object.keys(listeners).forEach(key => {
      listeners[key].clear();
    });
  };
}
