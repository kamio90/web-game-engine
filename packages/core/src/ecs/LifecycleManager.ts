import { MonoBehaviour } from './MonoBehaviour';

/**
 * Singleton manager for MonoBehaviour lifecycle execution.
 *
 * The LifecycleManager handles the execution order of lifecycle methods
 * across all MonoBehaviours in the scene. It ensures correct order:
 * - All Awake() before any Start()
 * - All Start() before first Update()
 * - Update/LateUpdate/FixedUpdate in proper order
 *
 * @internal
 */
export class LifecycleManager {
  private static _instance: LifecycleManager | null = null;

  private _behaviours: Set<MonoBehaviour> = new Set();
  private _newBehaviours: MonoBehaviour[] = [];

  /**
   * Private constructor for singleton pattern.
   * @private
   */
  private constructor() {}

  /**
   * Gets the singleton instance of the LifecycleManager.
   * @returns The LifecycleManager instance
   */
  public static get instance(): LifecycleManager {
    if (this._instance === null) {
      this._instance = new LifecycleManager();
    }
    return this._instance;
  }

  /**
   * Registers a MonoBehaviour with the lifecycle manager.
   * New behaviours are added to a queue and will have Awake() called
   * during the next processAwake() call.
   * @param behaviour - The MonoBehaviour to register
   */
  public register(behaviour: MonoBehaviour): void {
    this._newBehaviours.push(behaviour);
  }

  /**
   * Unregisters a MonoBehaviour from the lifecycle manager.
   * @param behaviour - The MonoBehaviour to unregister
   */
  public unregister(behaviour: MonoBehaviour): void {
    this._behaviours.delete(behaviour);

    // Also remove from new behaviours if it hasn't been awakened yet
    const index = this._newBehaviours.indexOf(behaviour);
    if (index !== -1) {
      this._newBehaviours.splice(index, 1);
    }
  }

  /**
   * Processes Awake() for all newly registered behaviours.
   * This should be called before processStart().
   */
  public processAwake(): void {
    if (this._newBehaviours.length === 0) {
      return;
    }

    // Copy array to avoid issues if behaviours are added during Awake
    const toAwaken = [...this._newBehaviours];
    this._newBehaviours = [];

    for (const behaviour of toAwaken) {
      behaviour._internalAwake();
      this._behaviours.add(behaviour);
    }
  }

  /**
   * Processes Start() for all behaviours that haven't started yet.
   * This should be called after processAwake() and before the first Update().
   */
  public processStart(): void {
    for (const behaviour of this._behaviours) {
      if (!behaviour._started && behaviour.enabled && behaviour.gameObject.activeInHierarchy) {
        behaviour._internalStart();
      }
    }
  }

  /**
   * Processes Update() for all enabled behaviours.
   * Should be called once per frame.
   */
  public processUpdate(): void {
    for (const behaviour of this._behaviours) {
      if (behaviour.enabled && behaviour.gameObject.activeInHierarchy) {
        behaviour._internalUpdate();
      }
    }
  }

  /**
   * Processes LateUpdate() for all enabled behaviours.
   * Should be called after processUpdate() each frame.
   */
  public processLateUpdate(): void {
    for (const behaviour of this._behaviours) {
      if (behaviour.enabled && behaviour.gameObject.activeInHierarchy) {
        behaviour._internalLateUpdate();
      }
    }
  }

  /**
   * Processes FixedUpdate() for all enabled behaviours.
   * Should be called at fixed time intervals for physics.
   */
  public processFixedUpdate(): void {
    for (const behaviour of this._behaviours) {
      if (behaviour.enabled && behaviour.gameObject.activeInHierarchy) {
        behaviour._internalFixedUpdate();
      }
    }
  }

  /**
   * Clears all registered behaviours.
   * Warning: Only use this for testing purposes.
   * @internal
   */
  public _clearAll(): void {
    this._behaviours.clear();
    this._newBehaviours = [];
  }

  /**
   * Gets the count of registered behaviours.
   * @internal
   */
  public _getBehaviourCount(): number {
    return this._behaviours.size;
  }

  /**
   * Gets the count of new behaviours pending Awake.
   * @internal
   */
  public _getNewBehaviourCount(): number {
    return this._newBehaviours.length;
  }

  /**
   * Resets the singleton instance.
   * Warning: Only use this for testing purposes.
   * @internal
   */
  public static _resetInstance(): void {
    this._instance = null;
  }
}
