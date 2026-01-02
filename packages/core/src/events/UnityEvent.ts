/**
 * Unity-style event callback type.
 * @template T - The type of argument passed to the callback
 */
export type UnityAction<T = void> = T extends void ? () => void : (arg: T) => void;

/**
 * Unity-style serializable event.
 *
 * UnityEvent provides a way to define callbacks that can be serialized
 * and configured in the editor. Similar to Unity's UnityEvent system.
 *
 * @template T - The type of argument passed to listeners (void for no argument)
 *
 * @example
 * ```typescript
 * class Button extends MonoBehaviour {
 *   public onClick: UnityEvent<void> = new UnityEvent();
 *
 *   private OnMouseDown(): void {
 *     this.onClick.Invoke();
 *   }
 * }
 *
 * // Usage
 * const button = gameObject.AddComponent(Button);
 * button.onClick.AddListener(() => console.log('Button clicked!'));
 * ```
 *
 * @example
 * ```typescript
 * class Slider extends MonoBehaviour {
 *   public onValueChanged: UnityEvent<number> = new UnityEvent();
 *
 *   private SetValue(value: number): void {
 *     this.onValueChanged.Invoke(value);
 *   }
 * }
 *
 * // Usage
 * const slider = gameObject.AddComponent(Slider);
 * slider.onValueChanged.AddListener((value) => console.log('Value:', value));
 * ```
 */
export class UnityEvent<T = void> {
  private _listeners: UnityAction<T>[] = [];

  /**
   * Creates a new UnityEvent.
   */
  constructor() {}

  /**
   * Adds a listener to the event.
   * @param listener - The callback to add
   */
  public AddListener(listener: UnityAction<T>): void {
    if (!this._listeners.includes(listener)) {
      this._listeners.push(listener);
    }
  }

  /**
   * Removes a listener from the event.
   * @param listener - The callback to remove
   */
  public RemoveListener(listener: UnityAction<T>): void {
    const index = this._listeners.indexOf(listener);
    if (index !== -1) {
      this._listeners.splice(index, 1);
    }
  }

  /**
   * Removes all listeners from the event.
   */
  public RemoveAllListeners(): void {
    this._listeners = [];
  }

  /**
   * Invokes all registered listeners.
   * @param arg - The argument to pass to listeners (if any)
   */
  public Invoke(arg?: T): void {
    // Create a copy to avoid issues if listeners modify the array
    const listeners = [...this._listeners];

    for (const listener of listeners) {
      try {
        if (arg === undefined) {
          (listener as () => void)();
        } else {
          (listener as (arg: T) => void)(arg);
        }
      } catch (error) {
        console.error('Error invoking UnityEvent listener:', error);
      }
    }
  }

  /**
   * Gets the number of listeners.
   * @returns The listener count
   */
  public GetPersistentEventCount(): number {
    return this._listeners.length;
  }
}
