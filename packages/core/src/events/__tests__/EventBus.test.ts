import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { EventBus } from '../EventBus';

describe('EventBus', () => {
  beforeEach(() => {
    EventBus.clear();
  });

  afterEach(() => {
    EventBus.clear();
  });

  describe('on', () => {
    it('should register event listener', () => {
      const listener = vi.fn();
      EventBus.on('test-event', listener);
      expect(EventBus.hasListeners('test-event')).toBe(true);
    });

    it('should invoke listener when event is emitted', () => {
      const listener = vi.fn();
      EventBus.on('test-event', listener);
      EventBus.emit('test-event');
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('should pass data to listener', () => {
      const listener = vi.fn();
      const data = { value: 42 };
      EventBus.on('test-event', listener);
      EventBus.emit('test-event', data);
      expect(listener).toHaveBeenCalledWith(data);
    });

    it('should support multiple listeners for same event', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      EventBus.on('test-event', listener1);
      EventBus.on('test-event', listener2);
      EventBus.emit('test-event');
      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
    });

    it('should invoke listener multiple times', () => {
      const listener = vi.fn();
      EventBus.on('test-event', listener);
      EventBus.emit('test-event');
      EventBus.emit('test-event');
      EventBus.emit('test-event');
      expect(listener).toHaveBeenCalledTimes(3);
    });

    it('should support priority ordering', () => {
      const callOrder: number[] = [];
      const listener1 = vi.fn(() => callOrder.push(1));
      const listener2 = vi.fn(() => callOrder.push(2));
      const listener3 = vi.fn(() => callOrder.push(3));

      EventBus.on('test-event', listener1, 0);
      EventBus.on('test-event', listener2, 10);
      EventBus.on('test-event', listener3, 5);

      EventBus.emit('test-event');
      expect(callOrder).toEqual([2, 3, 1]); // Higher priority first
    });

    it('should handle listeners with same priority', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      EventBus.on('test-event', listener1, 5);
      EventBus.on('test-event', listener2, 5);
      EventBus.emit('test-event');
      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
    });
  });

  describe('once', () => {
    it('should register one-time listener', () => {
      const listener = vi.fn();
      EventBus.once('test-event', listener);
      expect(EventBus.hasListeners('test-event')).toBe(true);
    });

    it('should invoke listener only once', () => {
      const listener = vi.fn();
      EventBus.once('test-event', listener);
      EventBus.emit('test-event');
      EventBus.emit('test-event');
      EventBus.emit('test-event');
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('should automatically remove listener after invocation', () => {
      const listener = vi.fn();
      EventBus.once('test-event', listener);
      EventBus.emit('test-event');
      expect(EventBus.hasListeners('test-event')).toBe(false);
    });

    it('should pass data to listener', () => {
      const listener = vi.fn();
      const data = { value: 42 };
      EventBus.once('test-event', listener);
      EventBus.emit('test-event', data);
      expect(listener).toHaveBeenCalledWith(data);
    });

    it('should support priority ordering with once listeners', () => {
      const callOrder: number[] = [];
      const listener1 = vi.fn(() => callOrder.push(1));
      const listener2 = vi.fn(() => callOrder.push(2));

      EventBus.once('test-event', listener1, 0);
      EventBus.once('test-event', listener2, 10);

      EventBus.emit('test-event');
      expect(callOrder).toEqual([2, 1]);
    });

    it('should work alongside regular listeners', () => {
      const regularListener = vi.fn();
      const onceListener = vi.fn();

      EventBus.on('test-event', regularListener);
      EventBus.once('test-event', onceListener);

      EventBus.emit('test-event');
      expect(regularListener).toHaveBeenCalledTimes(1);
      expect(onceListener).toHaveBeenCalledTimes(1);

      EventBus.emit('test-event');
      expect(regularListener).toHaveBeenCalledTimes(2);
      expect(onceListener).toHaveBeenCalledTimes(1); // Still 1
    });
  });

  describe('off', () => {
    it('should remove specific listener', () => {
      const listener = vi.fn();
      EventBus.on('test-event', listener);
      EventBus.off('test-event', listener);
      EventBus.emit('test-event');
      expect(listener).not.toHaveBeenCalled();
    });

    it('should not affect other listeners', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      EventBus.on('test-event', listener1);
      EventBus.on('test-event', listener2);
      EventBus.off('test-event', listener1);
      EventBus.emit('test-event');
      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).toHaveBeenCalledTimes(1);
    });

    it('should clean up event when last listener removed', () => {
      const listener = vi.fn();
      EventBus.on('test-event', listener);
      EventBus.off('test-event', listener);
      expect(EventBus.hasListeners('test-event')).toBe(false);
    });

    it('should do nothing if listener not found', () => {
      const listener = vi.fn();
      expect(() => EventBus.off('test-event', listener)).not.toThrow();
    });

    it('should do nothing if event not found', () => {
      const listener = vi.fn();
      expect(() => EventBus.off('nonexistent', listener)).not.toThrow();
    });
  });

  describe('emit', () => {
    it('should do nothing if no listeners', () => {
      expect(() => EventBus.emit('nonexistent')).not.toThrow();
    });

    it('should emit event without data', () => {
      const listener = vi.fn();
      EventBus.on('test-event', listener);
      EventBus.emit('test-event');
      expect(listener).toHaveBeenCalledWith(undefined);
    });

    it('should emit event with primitive data', () => {
      const listener = vi.fn();
      EventBus.on('test-event', listener);
      EventBus.emit('test-event', 42);
      expect(listener).toHaveBeenCalledWith(42);
    });

    it('should emit event with object data', () => {
      const listener = vi.fn();
      const data = { x: 1, y: 2 };
      EventBus.on('test-event', listener);
      EventBus.emit('test-event', data);
      expect(listener).toHaveBeenCalledWith(data);
    });

    it('should emit event with array data', () => {
      const listener = vi.fn();
      const data = [1, 2, 3];
      EventBus.on('test-event', listener);
      EventBus.emit('test-event', data);
      expect(listener).toHaveBeenCalledWith(data);
    });

    it('should catch errors in listeners', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const errorListener = vi.fn(() => {
        throw new Error('Test error');
      });
      const normalListener = vi.fn();

      EventBus.on('test-event', errorListener);
      EventBus.on('test-event', normalListener);

      EventBus.emit('test-event');

      expect(errorListener).toHaveBeenCalledTimes(1);
      expect(normalListener).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should not affect listeners array during emission', () => {
      const listener1 = vi.fn(() => {
        // Try to add listener during emission
        EventBus.on('test-event', vi.fn());
      });
      const listener2 = vi.fn();

      EventBus.on('test-event', listener1);
      EventBus.on('test-event', listener2);

      EventBus.emit('test-event');

      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
    });
  });

  describe('removeAllListeners', () => {
    it('should remove all listeners for event', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      EventBus.on('test-event', listener1);
      EventBus.on('test-event', listener2);

      EventBus.removeAllListeners('test-event');

      EventBus.emit('test-event');
      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
      expect(EventBus.hasListeners('test-event')).toBe(false);
    });

    it('should not affect other events', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      EventBus.on('event1', listener1);
      EventBus.on('event2', listener2);

      EventBus.removeAllListeners('event1');

      EventBus.emit('event1');
      EventBus.emit('event2');
      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).toHaveBeenCalledTimes(1);
    });

    it('should do nothing if event not found', () => {
      expect(() => EventBus.removeAllListeners('nonexistent')).not.toThrow();
    });
  });

  describe('clear', () => {
    it('should remove all listeners for all events', () => {
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      EventBus.on('event1', listener1);
      EventBus.on('event2', listener2);

      EventBus.clear();

      EventBus.emit('event1');
      EventBus.emit('event2');
      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
      expect(EventBus.hasListeners('event1')).toBe(false);
      expect(EventBus.hasListeners('event2')).toBe(false);
    });

    it('should work when no events registered', () => {
      expect(() => EventBus.clear()).not.toThrow();
    });
  });

  describe('hasListeners', () => {
    it('should return true when event has listeners', () => {
      const listener = vi.fn();
      EventBus.on('test-event', listener);
      expect(EventBus.hasListeners('test-event')).toBe(true);
    });

    it('should return false when event has no listeners', () => {
      expect(EventBus.hasListeners('test-event')).toBe(false);
    });

    it('should return false after all listeners removed', () => {
      const listener = vi.fn();
      EventBus.on('test-event', listener);
      EventBus.off('test-event', listener);
      expect(EventBus.hasListeners('test-event')).toBe(false);
    });
  });

  describe('listenerCount', () => {
    it('should return 0 when no listeners', () => {
      expect(EventBus.listenerCount('test-event')).toBe(0);
    });

    it('should return correct count', () => {
      EventBus.on('test-event', vi.fn());
      EventBus.on('test-event', vi.fn());
      EventBus.on('test-event', vi.fn());
      expect(EventBus.listenerCount('test-event')).toBe(3);
    });

    it('should update when listeners removed', () => {
      const listener = vi.fn();
      EventBus.on('test-event', listener);
      EventBus.on('test-event', vi.fn());
      expect(EventBus.listenerCount('test-event')).toBe(2);
      EventBus.off('test-event', listener);
      expect(EventBus.listenerCount('test-event')).toBe(1);
    });

    it('should include once listeners', () => {
      EventBus.on('test-event', vi.fn());
      EventBus.once('test-event', vi.fn());
      expect(EventBus.listenerCount('test-event')).toBe(2);
    });
  });

  describe('eventNames', () => {
    it('should return empty array when no events', () => {
      expect(EventBus.eventNames()).toEqual([]);
    });

    it('should return all event names', () => {
      EventBus.on('event1', vi.fn());
      EventBus.on('event2', vi.fn());
      EventBus.on('event3', vi.fn());
      const names = EventBus.eventNames();
      expect(names).toHaveLength(3);
      expect(names).toContain('event1');
      expect(names).toContain('event2');
      expect(names).toContain('event3');
    });

    it('should not include events with no listeners', () => {
      EventBus.on('event1', vi.fn());
      const listener = vi.fn();
      EventBus.on('event2', listener);
      EventBus.off('event2', listener);
      expect(EventBus.eventNames()).toEqual(['event1']);
    });
  });

  describe('type safety', () => {
    it('should support typed events', () => {
      interface PlayerData {
        id: number;
        name: string;
      }

      const listener = vi.fn((data: PlayerData) => {
        expect(data.id).toBe(1);
        expect(data.name).toBe('Player1');
      });

      EventBus.on<PlayerData>('player-joined', listener);
      EventBus.emit<PlayerData>('player-joined', { id: 1, name: 'Player1' });

      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe('integration', () => {
    it('should handle complex event flow', () => {
      const events: string[] = [];

      EventBus.on('start', () => events.push('start'), 100);
      EventBus.once('init', () => events.push('init'), 50);
      EventBus.on('update', () => events.push('update'));

      EventBus.emit('init');
      EventBus.emit('start');
      EventBus.emit('update');
      EventBus.emit('init'); // Should not trigger (once)
      EventBus.emit('update');

      expect(events).toEqual(['init', 'start', 'update', 'update']);
    });

    it('should support event chaining', () => {
      const events: string[] = [];

      EventBus.on('a', () => {
        events.push('a');
        EventBus.emit('b');
      });

      EventBus.on('b', () => {
        events.push('b');
        EventBus.emit('c');
      });

      EventBus.on('c', () => {
        events.push('c');
      });

      EventBus.emit('a');
      expect(events).toEqual(['a', 'b', 'c']);
    });
  });
});
