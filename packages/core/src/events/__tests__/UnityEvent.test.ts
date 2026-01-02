import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UnityEvent } from '../UnityEvent';

describe('UnityEvent', () => {
  describe('constructor', () => {
    it('should create empty event', () => {
      const event = new UnityEvent();
      expect(event.GetPersistentEventCount()).toBe(0);
    });
  });

  describe('AddListener (no args)', () => {
    it('should add listener', () => {
      const event = new UnityEvent();
      const listener = vi.fn();
      event.AddListener(listener);
      expect(event.GetPersistentEventCount()).toBe(1);
    });

    it('should invoke listener when event fires', () => {
      const event = new UnityEvent();
      const listener = vi.fn();
      event.AddListener(listener);
      event.Invoke();
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('should invoke listener multiple times', () => {
      const event = new UnityEvent();
      const listener = vi.fn();
      event.AddListener(listener);
      event.Invoke();
      event.Invoke();
      event.Invoke();
      expect(listener).toHaveBeenCalledTimes(3);
    });

    it('should add multiple listeners', () => {
      const event = new UnityEvent();
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      event.AddListener(listener1);
      event.AddListener(listener2);
      expect(event.GetPersistentEventCount()).toBe(2);
    });

    it('should invoke all listeners', () => {
      const event = new UnityEvent();
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      const listener3 = vi.fn();
      event.AddListener(listener1);
      event.AddListener(listener2);
      event.AddListener(listener3);
      event.Invoke();
      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);
      expect(listener3).toHaveBeenCalledTimes(1);
    });

    it('should not add duplicate listeners', () => {
      const event = new UnityEvent();
      const listener = vi.fn();
      event.AddListener(listener);
      event.AddListener(listener);
      event.AddListener(listener);
      expect(event.GetPersistentEventCount()).toBe(1);
    });

    it('should invoke duplicate listener only once', () => {
      const event = new UnityEvent();
      const listener = vi.fn();
      event.AddListener(listener);
      event.AddListener(listener);
      event.Invoke();
      expect(listener).toHaveBeenCalledTimes(1);
    });
  });

  describe('AddListener (with args)', () => {
    it('should add listener with argument', () => {
      const event = new UnityEvent<number>();
      const listener = vi.fn();
      event.AddListener(listener);
      expect(event.GetPersistentEventCount()).toBe(1);
    });

    it('should invoke listener with argument', () => {
      const event = new UnityEvent<number>();
      const listener = vi.fn();
      event.AddListener(listener);
      event.Invoke(42);
      expect(listener).toHaveBeenCalledWith(42);
    });

    it('should pass correct argument to each invocation', () => {
      const event = new UnityEvent<string>();
      const listener = vi.fn();
      event.AddListener(listener);
      event.Invoke('first');
      event.Invoke('second');
      event.Invoke('third');
      expect(listener).toHaveBeenNthCalledWith(1, 'first');
      expect(listener).toHaveBeenNthCalledWith(2, 'second');
      expect(listener).toHaveBeenNthCalledWith(3, 'third');
    });

    it('should pass argument to all listeners', () => {
      const event = new UnityEvent<number>();
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      event.AddListener(listener1);
      event.AddListener(listener2);
      event.Invoke(123);
      expect(listener1).toHaveBeenCalledWith(123);
      expect(listener2).toHaveBeenCalledWith(123);
    });

    it('should support object arguments', () => {
      interface TestData {
        x: number;
        y: number;
      }
      const event = new UnityEvent<TestData>();
      const listener = vi.fn();
      const data = { x: 10, y: 20 };
      event.AddListener(listener);
      event.Invoke(data);
      expect(listener).toHaveBeenCalledWith(data);
    });
  });

  describe('RemoveListener', () => {
    it('should remove listener', () => {
      const event = new UnityEvent();
      const listener = vi.fn();
      event.AddListener(listener);
      event.RemoveListener(listener);
      expect(event.GetPersistentEventCount()).toBe(0);
    });

    it('should not invoke removed listener', () => {
      const event = new UnityEvent();
      const listener = vi.fn();
      event.AddListener(listener);
      event.RemoveListener(listener);
      event.Invoke();
      expect(listener).not.toHaveBeenCalled();
    });

    it('should not affect other listeners', () => {
      const event = new UnityEvent();
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      event.AddListener(listener1);
      event.AddListener(listener2);
      event.RemoveListener(listener1);
      event.Invoke();
      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).toHaveBeenCalledTimes(1);
    });

    it('should do nothing if listener not found', () => {
      const event = new UnityEvent();
      const listener = vi.fn();
      expect(() => event.RemoveListener(listener)).not.toThrow();
    });

    it('should handle removing listener multiple times', () => {
      const event = new UnityEvent();
      const listener = vi.fn();
      event.AddListener(listener);
      event.RemoveListener(listener);
      event.RemoveListener(listener);
      expect(event.GetPersistentEventCount()).toBe(0);
    });
  });

  describe('RemoveAllListeners', () => {
    it('should remove all listeners', () => {
      const event = new UnityEvent();
      event.AddListener(vi.fn());
      event.AddListener(vi.fn());
      event.AddListener(vi.fn());
      event.RemoveAllListeners();
      expect(event.GetPersistentEventCount()).toBe(0);
    });

    it('should not invoke listeners after removal', () => {
      const event = new UnityEvent();
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      event.AddListener(listener1);
      event.AddListener(listener2);
      event.RemoveAllListeners();
      event.Invoke();
      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
    });

    it('should work when no listeners', () => {
      const event = new UnityEvent();
      expect(() => event.RemoveAllListeners()).not.toThrow();
    });
  });

  describe('Invoke', () => {
    it('should do nothing when no listeners', () => {
      const event = new UnityEvent();
      expect(() => event.Invoke()).not.toThrow();
    });

    it('should invoke listeners in order', () => {
      const event = new UnityEvent();
      const callOrder: number[] = [];
      const listener1 = vi.fn(() => callOrder.push(1));
      const listener2 = vi.fn(() => callOrder.push(2));
      const listener3 = vi.fn(() => callOrder.push(3));
      event.AddListener(listener1);
      event.AddListener(listener2);
      event.AddListener(listener3);
      event.Invoke();
      expect(callOrder).toEqual([1, 2, 3]);
    });

    it('should catch errors in listeners', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const event = new UnityEvent();
      const errorListener = vi.fn(() => {
        throw new Error('Test error');
      });
      const normalListener = vi.fn();

      event.AddListener(errorListener);
      event.AddListener(normalListener);

      event.Invoke();

      expect(errorListener).toHaveBeenCalledTimes(1);
      expect(normalListener).toHaveBeenCalledTimes(1);
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
    });

    it('should handle listeners added during invocation', () => {
      const event = new UnityEvent();
      const lateListener = vi.fn();
      const listener = vi.fn(() => {
        event.AddListener(lateListener);
      });

      event.AddListener(listener);
      event.Invoke();

      // Late listener should not be called in first invocation
      expect(listener).toHaveBeenCalledTimes(1);
      expect(lateListener).not.toHaveBeenCalled();

      // But should be called in second invocation
      event.Invoke();
      expect(lateListener).toHaveBeenCalledTimes(1);
    });

    it('should handle listeners removed during invocation', () => {
      const event = new UnityEvent();
      const listener2 = vi.fn();
      const listener1 = vi.fn(() => {
        event.RemoveListener(listener2);
      });

      event.AddListener(listener1);
      event.AddListener(listener2);

      event.Invoke();

      // Both should be called (removal happens after snapshot)
      expect(listener1).toHaveBeenCalledTimes(1);
      expect(listener2).toHaveBeenCalledTimes(1);

      // Second invocation should not call listener2
      event.Invoke();
      expect(listener1).toHaveBeenCalledTimes(2);
      expect(listener2).toHaveBeenCalledTimes(1);
    });
  });

  describe('GetPersistentEventCount', () => {
    it('should return 0 initially', () => {
      const event = new UnityEvent();
      expect(event.GetPersistentEventCount()).toBe(0);
    });

    it('should return correct count', () => {
      const event = new UnityEvent();
      event.AddListener(vi.fn());
      expect(event.GetPersistentEventCount()).toBe(1);
      event.AddListener(vi.fn());
      expect(event.GetPersistentEventCount()).toBe(2);
      event.AddListener(vi.fn());
      expect(event.GetPersistentEventCount()).toBe(3);
    });

    it('should update when listeners removed', () => {
      const event = new UnityEvent();
      const listener = vi.fn();
      event.AddListener(listener);
      event.AddListener(vi.fn());
      expect(event.GetPersistentEventCount()).toBe(2);
      event.RemoveListener(listener);
      expect(event.GetPersistentEventCount()).toBe(1);
    });

    it('should return 0 after RemoveAllListeners', () => {
      const event = new UnityEvent();
      event.AddListener(vi.fn());
      event.AddListener(vi.fn());
      event.RemoveAllListeners();
      expect(event.GetPersistentEventCount()).toBe(0);
    });
  });

  describe('type safety', () => {
    it('should support void events', () => {
      const event = new UnityEvent<void>();
      const listener = vi.fn();
      event.AddListener(listener);
      event.Invoke();
      expect(listener).toHaveBeenCalledTimes(1);
    });

    it('should support number events', () => {
      const event = new UnityEvent<number>();
      const listener = vi.fn();
      event.AddListener(listener);
      event.Invoke(42);
      expect(listener).toHaveBeenCalledWith(42);
    });

    it('should support string events', () => {
      const event = new UnityEvent<string>();
      const listener = vi.fn();
      event.AddListener(listener);
      event.Invoke('test');
      expect(listener).toHaveBeenCalledWith('test');
    });

    it('should support boolean events', () => {
      const event = new UnityEvent<boolean>();
      const listener = vi.fn();
      event.AddListener(listener);
      event.Invoke(true);
      expect(listener).toHaveBeenCalledWith(true);
    });

    it('should support complex type events', () => {
      interface Position {
        x: number;
        y: number;
        z: number;
      }
      const event = new UnityEvent<Position>();
      const listener = vi.fn();
      const pos = { x: 1, y: 2, z: 3 };
      event.AddListener(listener);
      event.Invoke(pos);
      expect(listener).toHaveBeenCalledWith(pos);
    });
  });

  describe('integration', () => {
    it('should work in component-like scenario', () => {
      class Button {
        public onClick: UnityEvent<void> = new UnityEvent();

        public Click(): void {
          this.onClick.Invoke();
        }
      }

      const button = new Button();
      const clickHandler = vi.fn();
      button.onClick.AddListener(clickHandler);

      button.Click();
      expect(clickHandler).toHaveBeenCalledTimes(1);

      button.Click();
      expect(clickHandler).toHaveBeenCalledTimes(2);
    });

    it('should work with multiple buttons', () => {
      class Button {
        public onClick: UnityEvent<void> = new UnityEvent();

        public Click(): void {
          this.onClick.Invoke();
        }
      }

      const button1 = new Button();
      const button2 = new Button();
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      button1.onClick.AddListener(handler1);
      button2.onClick.AddListener(handler2);

      button1.Click();
      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).not.toHaveBeenCalled();

      button2.Click();
      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
    });

    it('should work with parameterized events', () => {
      class Slider {
        public onValueChanged: UnityEvent<number> = new UnityEvent();

        public SetValue(value: number): void {
          this.onValueChanged.Invoke(value);
        }
      }

      const slider = new Slider();
      const values: number[] = [];
      slider.onValueChanged.AddListener((value) => values.push(value));

      slider.SetValue(0.5);
      slider.SetValue(0.75);
      slider.SetValue(1.0);

      expect(values).toEqual([0.5, 0.75, 1.0]);
    });
  });
});
