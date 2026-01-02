import { Component } from './Component';
import { LifecycleManager } from './LifecycleManager';
import { GUID } from './GUID';
import type { GUIDResolver } from '../serialization/GUIDResolver';

/**
 * MonoBehaviour is the base class from which every Unity script derives.
 *
 * MonoBehaviour offers lifecycle hooks that are called by the Unity engine
 * at specific points during script execution. The execution order is:
 * - Awake() - Called when the script instance is being loaded
 * - OnEnable() - Called when the object becomes enabled and active
 * - Start() - Called before the first frame update (after all Awake)
 * - FixedUpdate() - Called every fixed framerate frame (for physics)
 * - Update() - Called every frame
 * - LateUpdate() - Called every frame, after all Update functions
 * - OnDisable() - Called when the object becomes disabled
 * - OnDestroy() - Called when the object is destroyed
 *
 * @example
 * ```typescript
 * class PlayerController extends MonoBehaviour {
 *   private speed: number = 5;
 *
 *   Awake(): void {
 *     console.log("Player initialized");
 *   }
 *
 *   Update(): void {
 *     // Move player based on input
 *     this.transform.Translate(Vector3.right.MultiplyScalar(this.speed * Time.deltaTime));
 *   }
 * }
 *
 * const player = new GameObject("Player");
 * const controller = player.AddComponent(PlayerController);
 * ```
 */
export class MonoBehaviour extends Component {
  private _enabled: boolean = true;
  public _started: boolean = false;
  private _awoken: boolean = false;

  /**
   * Creates a new MonoBehaviour.
   * @param name - The name of the behaviour
   */
  constructor(name: string = 'MonoBehaviour') {
    super(name);

    // Register with lifecycle manager when added to GameObject
    // This happens after _setGameObject is called
  }

  // ==================== Properties ====================

  /**
   * Enabled Behaviours are Updated, disabled Behaviours are not.
   */
  public get enabled(): boolean {
    return this._enabled;
  }

  public set enabled(value: boolean) {
    if (this._enabled === value) {
      return;
    }

    const wasEnabled = this._enabled && this.gameObject?.activeInHierarchy;
    this._enabled = value;
    const isEnabled = this._enabled && this.gameObject?.activeInHierarchy;

    // Only call OnEnable/OnDisable after Awake has been called
    if (this._awoken) {
      if (!wasEnabled && isEnabled) {
        this.OnEnable();
      } else if (wasEnabled && !isEnabled) {
        this.OnDisable();
      }
    }
  }

  // ==================== Lifecycle Hooks ====================

  /**
   * Awake is called when the script instance is being loaded.
   * Use this for initialization before Start().
   * Awake is always called before any Start functions.
   */
  protected Awake(): void {
    // Override in derived classes
  }

  /**
   * This function is called when the object becomes enabled and active.
   */
  protected OnEnable(): void {
    // Override in derived classes
  }

  /**
   * Start is called before the first frame update, but only if the script is enabled.
   * Start is called after all Awake calls.
   */
  protected Start(): void {
    // Override in derived classes
  }

  /**
   * Update is called every frame, if the MonoBehaviour is enabled.
   */
  protected Update(): void {
    // Override in derived classes
  }

  /**
   * LateUpdate is called every frame after all Update functions have been called.
   */
  protected LateUpdate(): void {
    // Override in derived classes
  }

  /**
   * FixedUpdate is called every fixed framerate frame.
   * Use this for physics updates.
   */
  protected FixedUpdate(): void {
    // Override in derived classes
  }

  /**
   * This function is called when the behaviour becomes disabled.
   */
  protected OnDisable(): void {
    // Override in derived classes
  }

  /**
   * This function is called when the MonoBehaviour will be destroyed.
   */
  protected OnDestroy(): void {
    // Override in derived classes
  }

  // ==================== Coroutines ====================

  /**
   * Starts a coroutine.
   * @param coroutine - The coroutine generator function
   * @returns The coroutine
   */
  public StartCoroutine(coroutine: Generator): Generator {
    // Basic implementation - full coroutine support would be more complex
    return coroutine;
  }

  /**
   * Stops a coroutine.
   * @param coroutine - The coroutine to stop
   */
  public StopCoroutine(_coroutine: Generator): void {
    // Basic implementation
  }

  /**
   * Stops all coroutines running on this behaviour.
   */
  public StopAllCoroutines(): void {
    // Basic implementation
  }

  // ==================== Internal Methods ====================

  /**
   * Internal method called by LifecycleManager to invoke Awake().
   * @internal
   */
  public _internalAwake(): void {
    if (this._awoken) {
      return;
    }
    this._awoken = true;
    this.Awake();

    // Call OnEnable if the behaviour is enabled and active
    if (this._enabled && this.gameObject?.activeInHierarchy) {
      this.OnEnable();
    }
  }

  /**
   * Internal method called by LifecycleManager to invoke Start().
   * @internal
   */
  public _internalStart(): void {
    if (this._started) {
      return;
    }
    this._started = true;
    this.Start();
  }

  /**
   * Internal method called by LifecycleManager to invoke Update().
   * @internal
   */
  public _internalUpdate(): void {
    // Ensure Start has been called
    if (!this._started) {
      this._internalStart();
    }
    this.Update();
  }

  /**
   * Internal method called by LifecycleManager to invoke LateUpdate().
   * @internal
   */
  public _internalLateUpdate(): void {
    this.LateUpdate();
  }

  /**
   * Internal method called by LifecycleManager to invoke FixedUpdate().
   * @internal
   */
  public _internalFixedUpdate(): void {
    this.FixedUpdate();
  }

  /**
   * Overridden to register with LifecycleManager.
   * @param gameObject - The GameObject to attach to
   * @internal
   */
  public override _setGameObject(gameObject: any): void {
    super._setGameObject(gameObject);
    LifecycleManager.instance.register(this);
  }

  // ==================== Serialization ====================

  /**
   * Serializes this MonoBehaviour to JSON.
   * @returns MonoBehaviour data including enabled state
   */
  public override toJSON(): any {
    return {
      ...super.toJSON(),
      type: 'MonoBehaviour',
      enabled: this._enabled,
    };
  }

  /**
   * Deserializes a MonoBehaviour from JSON.
   * @param json - Serialized behaviour data
   * @param resolver - GUID resolver for reference resolution
   * @returns MonoBehaviour instance
   */
  public static override fromJSON(json: any, resolver: GUIDResolver): MonoBehaviour {
    const behaviour = new MonoBehaviour(json.name);
    // Replace auto-generated GUID with deserialized one
    (behaviour as any)._guid = GUID.fromJSON(json.guid);

    resolver.register(behaviour.guid, behaviour);

    behaviour._enabled = json.enabled;

    // Queue gameObject reference for Phase 2
    resolver.addReference(behaviour, '_gameObject', json.gameObject);

    return behaviour;
  }

  /**
   * Override in derived classes to serialize custom fields.
   * @returns Object containing custom field data
   */
  protected serializeFields(): any {
    return {};
  }

  /**
   * Override in derived classes to deserialize custom fields.
   * @param json - Custom field data
   */
  protected deserializeFields(_json: any): void {
    // Override in derived classes
  }
}
