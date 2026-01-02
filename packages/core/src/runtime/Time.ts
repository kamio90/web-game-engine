/**
 * Time provides access to time information throughout the game.
 *
 * Unity's Time class is a static interface to the game's time-related data.
 * It provides information about the current frame time, delta time, time scale,
 * and other time-related values that are essential for game logic.
 *
 * @example
 * ```typescript
 * class Rotator extends MonoBehaviour {
 *   Update(): void {
 *     // Rotate 90 degrees per second
 *     this.transform.Rotate(new Vector3(0, 90 * Time.deltaTime, 0));
 *   }
 * }
 * ```
 */
export class Time {
  // Private state
  private static _time: number = 0;
  private static _unscaledTime: number = 0;
  private static _deltaTime: number = 0;
  private static _unscaledDeltaTime: number = 0;
  private static _fixedDeltaTime: number = 0.02; // 50 FPS default (Unity default)
  private static _timeScale: number = 1.0;
  private static _frameCount: number = 0;
  private static _realtimeSinceStartup: number = 0;
  private static _smoothDeltaTime: number = 0;
  private static _maximumDeltaTime: number = 0.333333; // 1/3 second max (Unity default)
  private static _fixedUnscaledTime: number = 0;
  private static _fixedUnscaledDeltaTime: number = 0.02;

  // Performance tracking
  private static _lastFrameTime: number = 0;
  private static _startTime: number = 0;
  private static _fixedTimeAccumulator: number = 0;
  private static _deltaTimeSamples: number[] = [];
  private static readonly MAX_DELTA_SAMPLES = 10;

  // Internal methods (called by GameLoop)

  /**
   * Initializes the Time system.
   * @internal
   */
  public static _initialize(): void {
    this._startTime = this._getPerformanceTime();
    this._lastFrameTime = this._startTime;
    this._time = 0;
    this._unscaledTime = 0;
    this._deltaTime = 0;
    this._unscaledDeltaTime = 0;
    this._frameCount = 0;
    this._realtimeSinceStartup = 0;
    this._smoothDeltaTime = 0;
    this._fixedTimeAccumulator = 0;
    this._deltaTimeSamples = [];
  }

  /**
   * Updates time values for the current frame.
   * @internal
   */
  public static _update(): void {
    const currentTime = this._getPerformanceTime();
    const rawDelta = (currentTime - this._lastFrameTime) / 1000; // Convert to seconds

    // Clamp delta time to prevent spiral of death
    this._unscaledDeltaTime = Math.min(rawDelta, this._maximumDeltaTime);
    this._deltaTime = this._unscaledDeltaTime * this._timeScale;

    // Update time values
    this._time += this._deltaTime;
    this._unscaledTime += this._unscaledDeltaTime;
    this._realtimeSinceStartup = (currentTime - this._startTime) / 1000;

    // Update smooth delta time (rolling average)
    this._deltaTimeSamples.push(this._deltaTime);
    if (this._deltaTimeSamples.length > this.MAX_DELTA_SAMPLES) {
      this._deltaTimeSamples.shift();
    }
    this._smoothDeltaTime =
      this._deltaTimeSamples.reduce((sum, dt) => sum + dt, 0) /
      this._deltaTimeSamples.length;

    this._lastFrameTime = currentTime;
    this._frameCount++;
  }

  /**
   * Checks if a fixed update should occur and updates fixed time.
   * @internal
   */
  public static _shouldFixedUpdate(): boolean {
    this._fixedTimeAccumulator += this._unscaledDeltaTime;
    return this._fixedTimeAccumulator >= this._fixedDeltaTime;
  }

  /**
   * Consumes one fixed timestep from the accumulator.
   * @internal
   */
  public static _consumeFixedUpdate(): void {
    this._fixedTimeAccumulator -= this._fixedDeltaTime;
    this._fixedUnscaledTime += this._fixedDeltaTime;
    this._fixedUnscaledDeltaTime = this._fixedDeltaTime;
  }

  /**
   * Resets the time system (for testing).
   * @internal
   */
  public static _reset(): void {
    this._initialize();
  }

  // Public API (matches Unity exactly)

  /**
   * The completion time in seconds since the last frame (scaled by timeScale).
   *
   * Use this to make your game frame rate independent. Multiply movement by
   * deltaTime to move consistently regardless of frame rate.
   */
  public static get deltaTime(): number {
    return this._deltaTime;
  }

  /**
   * The interval in seconds at which physics and other fixed frame rate updates execute.
   *
   * Unity's default is 0.02 (50 FPS). This value affects FixedUpdate() calls.
   */
  public static get fixedDeltaTime(): number {
    return this._fixedDeltaTime;
  }

  public static set fixedDeltaTime(value: number) {
    if (value <= 0) {
      console.warn('Time.fixedDeltaTime must be positive. Clamping to 0.001.');
      this._fixedDeltaTime = 0.001;
    } else {
      this._fixedDeltaTime = value;
    }
  }

  /**
   * The timeScale-independent interval in seconds from the last frame to the current one.
   */
  public static get unscaledDeltaTime(): number {
    return this._unscaledDeltaTime;
  }

  /**
   * The time at the beginning of this frame (scaled by timeScale).
   *
   * This is the time in seconds since the start of the game.
   */
  public static get time(): number {
    return this._time;
  }

  /**
   * The timeScale-independent time at the beginning of this frame.
   *
   * This is the time in seconds since the start of the game, unaffected by timeScale.
   */
  public static get unscaledTime(): number {
    return this._unscaledTime;
  }

  /**
   * The scale at which time passes.
   *
   * Default is 1.0. Use 0.5 for slow-motion, 2.0 for fast-forward, 0 to pause.
   * This affects deltaTime but not unscaledDeltaTime.
   */
  public static get timeScale(): number {
    return this._timeScale;
  }

  public static set timeScale(value: number) {
    if (value < 0) {
      console.warn('Time.timeScale cannot be negative. Clamping to 0.');
      this._timeScale = 0;
    } else {
      this._timeScale = value;
    }
  }

  /**
   * The total number of frames that have passed.
   */
  public static get frameCount(): number {
    return this._frameCount;
  }

  /**
   * The real time in seconds since the game started (unaffected by timeScale).
   *
   * This is useful for timing things that should not be affected by slow-motion.
   */
  public static get realtimeSinceStartup(): number {
    return this._realtimeSinceStartup;
  }

  /**
   * A smoothed out Time.deltaTime.
   *
   * This is a rolling average of the last several deltaTime values.
   * Useful for framerate displays or smoothing out physics calculations.
   */
  public static get smoothDeltaTime(): number {
    return this._smoothDeltaTime;
  }

  /**
   * The maximum time a frame can take.
   *
   * Used to prevent the "spiral of death" where slow frames cause more physics
   * work which causes slower frames. Default is 0.333333 (1/3 second).
   */
  public static get maximumDeltaTime(): number {
    return this._maximumDeltaTime;
  }

  public static set maximumDeltaTime(value: number) {
    if (value <= 0) {
      console.warn('Time.maximumDeltaTime must be positive. Clamping to 0.001.');
      this._maximumDeltaTime = 0.001;
    } else {
      this._maximumDeltaTime = value;
    }
  }

  /**
   * The time the latest FixedUpdate has started.
   *
   * This is the fixed timestep time, unaffected by timeScale.
   */
  public static get fixedUnscaledTime(): number {
    return this._fixedUnscaledTime;
  }

  /**
   * The timeScale-independent interval in seconds from the last FixedUpdate to the current one.
   */
  public static get fixedUnscaledDeltaTime(): number {
    return this._fixedUnscaledDeltaTime;
  }

  /**
   * Gets the current performance time in milliseconds.
   * @internal
   */
  private static _getPerformanceTime(): number {
    if (typeof performance !== 'undefined' && performance.now) {
      return performance.now();
    }
    return Date.now();
  }
}
