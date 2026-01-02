import { Time } from './Time';
import { LifecycleManager } from '../ecs/LifecycleManager';

/**
 * The main game loop that drives the engine's update cycle.
 *
 * GameLoop manages the execution of Update, FixedUpdate, and LateUpdate
 * lifecycle methods using requestAnimationFrame. It integrates with the
 * Time system to provide accurate delta time and fixed timestep updates.
 *
 * @example
 * ```typescript
 * // Start the game loop
 * GameLoop.start();
 *
 * // Pause the game
 * GameLoop.pause();
 *
 * // Resume the game
 * GameLoop.resume();
 *
 * // Stop the game loop
 * GameLoop.stop();
 * ```
 */
export class GameLoop {
  private static _isRunning: boolean = false;
  private static _isPaused: boolean = false;
  private static _animationFrameId: number | null = null;
  private static _targetFrameRate: number = -1; // -1 = unlimited (use requestAnimationFrame)
  private static _lastFrameTime: number = 0;
  private static _frameInterval: number = 0;

  // Callbacks for custom logic
  private static _onUpdate: (() => void) | null = null;
  private static _onLateUpdate: (() => void) | null = null;
  private static _onFixedUpdate: (() => void) | null = null;

  /**
   * Starts the game loop.
   * Initializes the Time system and begins the update cycle.
   */
  public static start(): void {
    if (this._isRunning) {
      console.warn('GameLoop.start: Game loop is already running');
      return;
    }

    Time._initialize();
    this._isRunning = true;
    this._isPaused = false;
    this._lastFrameTime = performance.now();
    this._updateFrameInterval();

    console.log('GameLoop started');
    this._loop();
  }

  /**
   * Stops the game loop.
   * Cancels the animation frame and resets the loop state.
   */
  public static stop(): void {
    if (!this._isRunning) {
      console.warn('GameLoop.stop: Game loop is not running');
      return;
    }

    if (this._animationFrameId !== null) {
      cancelAnimationFrame(this._animationFrameId);
      this._animationFrameId = null;
    }

    this._isRunning = false;
    this._isPaused = false;

    console.log('GameLoop stopped');
  }

  /**
   * Pauses the game loop.
   * The loop continues running but Update methods are not called.
   * Time is frozen (timeScale = 0).
   */
  public static pause(): void {
    if (!this._isRunning) {
      console.warn('GameLoop.pause: Game loop is not running');
      return;
    }

    if (this._isPaused) {
      console.warn('GameLoop.pause: Game loop is already paused');
      return;
    }

    this._isPaused = true;
    Time.timeScale = 0;
    console.log('GameLoop paused');
  }

  /**
   * Resumes the game loop from a paused state.
   * Restores timeScale to 1.0.
   */
  public static resume(): void {
    if (!this._isRunning) {
      console.warn('GameLoop.resume: Game loop is not running');
      return;
    }

    if (!this._isPaused) {
      console.warn('GameLoop.resume: Game loop is not paused');
      return;
    }

    this._isPaused = false;
    Time.timeScale = 1.0;
    console.log('GameLoop resumed');
  }

  /**
   * Whether the game loop is currently running.
   */
  public static get isRunning(): boolean {
    return this._isRunning;
  }

  /**
   * Whether the game loop is currently paused.
   */
  public static get isPaused(): boolean {
    return this._isPaused;
  }

  /**
   * The target frame rate for the game loop.
   *
   * Set to -1 (default) to use requestAnimationFrame's native timing.
   * Set to a specific value (e.g., 60) to cap the frame rate.
   */
  public static get targetFrameRate(): number {
    return this._targetFrameRate;
  }

  public static set targetFrameRate(value: number) {
    if (value < -1) {
      console.warn('GameLoop.targetFrameRate must be -1 or positive. Clamping to -1.');
      this._targetFrameRate = -1;
    } else {
      this._targetFrameRate = value;
    }
    this._updateFrameInterval();
  }

  /**
   * Sets a callback to be invoked during the Update phase.
   * @param callback - Function to call each frame during Update
   */
  public static setOnUpdate(callback: (() => void) | null): void {
    this._onUpdate = callback;
  }

  /**
   * Sets a callback to be invoked during the LateUpdate phase.
   * @param callback - Function to call each frame during LateUpdate
   */
  public static setOnLateUpdate(callback: (() => void) | null): void {
    this._onLateUpdate = callback;
  }

  /**
   * Sets a callback to be invoked during the FixedUpdate phase.
   * @param callback - Function to call each fixed timestep during FixedUpdate
   */
  public static setOnFixedUpdate(callback: (() => void) | null): void {
    this._onFixedUpdate = callback;
  }

  // Internal methods

  /**
   * Updates the frame interval based on target frame rate.
   * @internal
   */
  private static _updateFrameInterval(): void {
    if (this._targetFrameRate > 0) {
      this._frameInterval = 1000 / this._targetFrameRate;
    } else {
      this._frameInterval = 0;
    }
  }

  /**
   * The main loop function.
   * @internal
   */
  private static _loop = (): void => {
    if (!this._isRunning) {
      return;
    }

    // Schedule next frame
    this._animationFrameId = requestAnimationFrame(this._loop);

    // Frame rate limiting
    if (this._targetFrameRate > 0) {
      const now = performance.now();
      const elapsed = now - this._lastFrameTime;

      if (elapsed < this._frameInterval) {
        // Not enough time has passed, skip this frame
        return;
      }

      // Adjust for frame drift
      this._lastFrameTime = now - (elapsed % this._frameInterval);
    }

    // Update Time
    Time._update();

    // Skip game logic if paused
    if (this._isPaused) {
      return;
    }

    // FixedUpdate (physics timestep)
    // May run multiple times per frame or not at all
    while (Time._shouldFixedUpdate()) {
      this._fixedUpdate();
      Time._consumeFixedUpdate();
    }

    // Update (once per frame)
    this._update();

    // LateUpdate (once per frame, after Update)
    this._lateUpdate();
  };

  /**
   * Executes the Update phase.
   * @internal
   */
  private static _update(): void {
    // Call custom callback
    if (this._onUpdate) {
      this._onUpdate();
    }

    // Call LifecycleManager to execute all MonoBehaviour Update methods
    LifecycleManager.instance.processUpdate();
  }

  /**
   * Executes the LateUpdate phase.
   * @internal
   */
  private static _lateUpdate(): void {
    // Call custom callback
    if (this._onLateUpdate) {
      this._onLateUpdate();
    }

    // Call LifecycleManager to execute all MonoBehaviour LateUpdate methods
    LifecycleManager.instance.processLateUpdate();
  }

  /**
   * Executes the FixedUpdate phase.
   * @internal
   */
  private static _fixedUpdate(): void {
    // Call custom callback
    if (this._onFixedUpdate) {
      this._onFixedUpdate();
    }

    // Call LifecycleManager to execute all MonoBehaviour FixedUpdate methods
    LifecycleManager.instance.processFixedUpdate();
  }

  /**
   * Resets the game loop (for testing).
   * @internal
   */
  public static _reset(): void {
    this.stop();
    this._targetFrameRate = -1;
    this._frameInterval = 0;
    this._onUpdate = null;
    this._onLateUpdate = null;
    this._onFixedUpdate = null;
  }
}
