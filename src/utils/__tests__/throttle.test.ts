import { throttle } from '../throttle';

describe('throttle utility', () => {
  beforeEach(() => {
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('should call function immediately on first invocation', () => {
    const mockFn = jest.fn();
    const throttled = throttle(mockFn, 100);

    throttled('test');
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('test');
  });

  it('should throttle subsequent calls within time limit', () => {
    const mockFn = jest.fn();
    const throttled = throttle(mockFn, 100);

    // First call - should execute
    throttled('call1');
    expect(mockFn).toHaveBeenCalledTimes(1);

    // Second call within throttle period - should not execute
    throttled('call2');
    expect(mockFn).toHaveBeenCalledTimes(1);

    // Third call within throttle period - should not execute
    throttled('call3');
    expect(mockFn).toHaveBeenCalledTimes(1);
  });

  it('should allow calls after throttle period expires', () => {
    const mockFn = jest.fn();
    const throttled = throttle(mockFn, 100);

    // First call
    throttled('call1');
    expect(mockFn).toHaveBeenCalledTimes(1);

    // Advance time past throttle period
    jest.advanceTimersByTime(101);

    // Second call after throttle period - should execute
    throttled('call2');
    expect(mockFn).toHaveBeenCalledTimes(2);
  });

  it('should handle multiple arguments', () => {
    const mockFn = jest.fn();
    const throttled = throttle(mockFn, 100);

    throttled('arg1', 'arg2', 'arg3');
    expect(mockFn).toHaveBeenCalledWith('arg1', 'arg2', 'arg3');
  });

  it('should preserve this context', () => {
    const obj = {
      value: 42,
      method: jest.fn(function(this: any) {
        return this.value;
      }),
    };

    const throttled = throttle(obj.method, 100);
    throttled.call(obj);

    expect(obj.method).toHaveBeenCalled();
  });

  it('should handle rapid successive calls correctly', () => {
    const mockFn = jest.fn();
    const throttled = throttle(mockFn, 100);

    // Rapid calls
    for (let i = 0; i < 10; i++) {
      throttled(`call${i}`);
    }

    // Only first call should execute
    expect(mockFn).toHaveBeenCalledTimes(1);
    expect(mockFn).toHaveBeenCalledWith('call0');

    // Advance time and make more calls
    jest.advanceTimersByTime(101);
    
    for (let i = 10; i < 20; i++) {
      throttled(`call${i}`);
    }

    // Second batch should execute once
    expect(mockFn).toHaveBeenCalledTimes(2);
    expect(mockFn).toHaveBeenLastCalledWith('call10');
  });
});
