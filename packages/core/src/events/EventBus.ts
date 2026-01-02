/**
 * Event listener function type.
 * @template T - The type of data passed to the event
 */
export type EventListener<T = any> = (data: T) => void;

/**
 * Event subscription interface.
 */
interface EventSubscription<T = any> {
  listener: EventListener<T>;
  priority: number;
  once: boolean;
}

/**
 * Global event bus for decoupled component communication.
 *
 * The EventBus provides a centralized pub-sub system for loosely coupled
 * communication between components. Events can carry typed data and support
 * priority ordering and one-time subscriptions.
 *
 * @example
 * ```typescript
 * // Subscribe to event
 * EventBus.on('player-died', (data) => {
 *   console.log('Player died at position:', data.position);
 * });
 *
 * // Emit event
 * EventBus.emit('player-died', { position: new Vector3(10, 0, 5) });
 *
 * // One-time subscription
 * EventBus.once('level-loaded', () => {
 *   console.log('Level loaded!');
 * });
 *
 * // Unsubscribe
 * const handler = (data) => console.log(data);
 * EventBus.on('test-event', handler);
 * EventBus.off('test-event', handler);
 * ```
 */
export class EventBus {
  private static _events: Map<string, EventSubscription[]> = new Map();

  /**
   * Subscribes to an event.
   * @param eventName - Name of the event to listen for
   * @param listener - Callback function to invoke when event is emitted
   * @param priority - Priority for listener ordering (higher = earlier, default: 0)
   */
  public static on<T = any>(
    eventName: string,
    listener: EventListener<T>,
    priority: number = 0
  ): void {
    if (!this._events.has(eventName)) {
      this._events.set(eventName, []);
    }

    const subscriptions = this._events.get(eventName)!;
    subscriptions.push({ listener, priority, once: false });

    // Sort by priority (higher first)
    subscriptions.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Subscribes to an event for one-time execution.
   * The listener is automatically removed after being invoked once.
   * @param eventName - Name of the event to listen for
   * @param listener - Callback function to invoke when event is emitted
   * @param priority - Priority for listener ordering (higher = earlier, default: 0)
   */
  public static once<T = any>(
    eventName: string,
    listener: EventListener<T>,
    priority: number = 0
  ): void {
    if (!this._events.has(eventName)) {
      this._events.set(eventName, []);
    }

    const subscriptions = this._events.get(eventName)!;
    subscriptions.push({ listener, priority, once: true });

    // Sort by priority (higher first)
    subscriptions.sort((a, b) => b.priority - a.priority);
  }

  /**
   * Unsubscribes from an event.
   * @param eventName - Name of the event
   * @param listener - The listener function to remove
   */
  public static off<T = any>(eventName: string, listener: EventListener<T>): void {
    const subscriptions = this._events.get(eventName);
    if (!subscriptions) {
      return;
    }

    const index = subscriptions.findIndex((sub) => sub.listener === listener);
    if (index !== -1) {
      subscriptions.splice(index, 1);
    }

    // Clean up empty event arrays
    if (subscriptions.length === 0) {
      this._events.delete(eventName);
    }
  }

  /**
   * Emits an event, invoking all subscribed listeners.
   * @param eventName - Name of the event to emit
   * @param data - Optional data to pass to listeners
   */
  public static emit<T = any>(eventName: string, data?: T): void {
    const subscriptions = this._events.get(eventName);
    if (!subscriptions) {
      return;
    }

    // Create a copy to avoid issues if listeners modify the array
    const toInvoke = [...subscriptions];

    // Remove one-time listeners before invoking
    const oneTimeListeners = toInvoke.filter((sub) => sub.once);
    for (const sub of oneTimeListeners) {
      this.off(eventName, sub.listener);
    }

    // Invoke all listeners
    for (const sub of toInvoke) {
      try {
        sub.listener(data as T);
      } catch (error) {
        console.error(`Error in event listener for "${eventName}":`, error);
      }
    }
  }

  /**
   * Removes all listeners for a specific event.
   * @param eventName - Name of the event
   */
  public static removeAllListeners(eventName: string): void {
    this._events.delete(eventName);
  }

  /**
   * Removes all listeners for all events.
   */
  public static clear(): void {
    this._events.clear();
  }

  /**
   * Checks if an event has any listeners.
   * @param eventName - Name of the event
   * @returns True if the event has listeners
   */
  public static hasListeners(eventName: string): boolean {
    const subscriptions = this._events.get(eventName);
    return subscriptions !== undefined && subscriptions.length > 0;
  }

  /**
   * Gets the number of listeners for an event.
   * @param eventName - Name of the event
   * @returns Number of listeners
   */
  public static listenerCount(eventName: string): number {
    const subscriptions = this._events.get(eventName);
    return subscriptions ? subscriptions.length : 0;
  }

  /**
   * Gets all event names that have listeners.
   * @returns Array of event names
   */
  public static eventNames(): string[] {
    return Array.from(this._events.keys());
  }
}
