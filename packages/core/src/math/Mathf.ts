/**
 * A collection of common math functions.
 *
 * This class provides a set of mathematical constants and functions that are commonly used in game development.
 *
 * @example
 * ```typescript
 * const angle = Mathf.Lerp(0, 90, 0.5); // 45
 * const clamped = Mathf.Clamp(150, 0, 100); // 100
 * const sine = Mathf.Sin(90 * Mathf.Deg2Rad); // 1
 * ```
 */
export class Mathf {
  // ==================== Constants ====================

  /** The infamous 3.14159265358979... value (Read Only). */
  public static readonly PI = Math.PI;

  /** A representation of positive infinity (Read Only). */
  public static readonly Infinity = Infinity;

  /** A representation of negative infinity (Read Only). */
  public static readonly NegativeInfinity = -Infinity;

  /** Degrees-to-radians conversion constant (Read Only). */
  public static readonly Deg2Rad = Math.PI / 180.0;

  /** Radians-to-degrees conversion constant (Read Only). */
  public static readonly Rad2Deg = 180.0 / Math.PI;

  /** A tiny floating point value (Read Only). */
  public static readonly Epsilon = Number.EPSILON;

  // ==================== Trigonometric Functions ====================

  /**
   * Returns the sine of angle f in radians.
   * @param f - Angle in radians
   * @returns Sine of the angle
   */
  public static Sin(f: number): number {
    return Math.sin(f);
  }

  /**
   * Returns the cosine of angle f in radians.
   * @param f - Angle in radians
   * @returns Cosine of the angle
   */
  public static Cos(f: number): number {
    return Math.cos(f);
  }

  /**
   * Returns the tangent of angle f in radians.
   * @param f - Angle in radians
   * @returns Tangent of the angle
   */
  public static Tan(f: number): number {
    return Math.tan(f);
  }

  /**
   * Returns the arc-sine of f - the angle in radians whose sine is f.
   * @param f - Input value
   * @returns Angle in radians
   */
  public static Asin(f: number): number {
    return Math.asin(f);
  }

  /**
   * Returns the arc-cosine of f - the angle in radians whose cosine is f.
   * @param f - Input value
   * @returns Angle in radians
   */
  public static Acos(f: number): number {
    return Math.acos(f);
  }

  /**
   * Returns the arc-tangent of f - the angle in radians whose tangent is f.
   * @param f - Input value
   * @returns Angle in radians
   */
  public static Atan(f: number): number {
    return Math.atan(f);
  }

  /**
   * Returns the angle in radians whose Tan is y/x.
   * @param y - Y coordinate
   * @param x - X coordinate
   * @returns Angle in radians
   */
  public static Atan2(y: number, x: number): number {
    return Math.atan2(y, x);
  }

  // ==================== Basic Math Functions ====================

  /**
   * Returns the square root of f.
   * @param f - Input value
   * @returns Square root
   */
  public static Sqrt(f: number): number {
    return Math.sqrt(f);
  }

  /**
   * Returns the absolute value of f.
   * @param f - Input value
   * @returns Absolute value
   */
  public static Abs(f: number): number {
    return Math.abs(f);
  }

  /**
   * Returns the smallest integer greater to or equal to f.
   * @param f - Input value
   * @returns Ceiling value
   */
  public static Ceil(f: number): number {
    return Math.ceil(f);
  }

  /**
   * Returns the largest integer smaller than or equal to f.
   * @param f - Input value
   * @returns Floor value
   */
  public static Floor(f: number): number {
    return Math.floor(f);
  }

  /**
   * Returns f rounded to the nearest integer.
   * @param f - Input value
   * @returns Rounded value
   */
  public static Round(f: number): number {
    return Math.round(f);
  }

  /**
   * Returns the sign of f.
   * @param f - Input value
   * @returns -1 if f is negative, 1 if f is positive, 0 if f is zero
   */
  public static Sign(f: number): number {
    if (f === 0) return 0;
    return f > 0 ? 1 : -1;
  }

  /**
   * Returns f raised to power p.
   * @param f - Base
   * @param p - Exponent
   * @returns f^p
   */
  public static Pow(f: number, p: number): number {
    return Math.pow(f, p);
  }

  /**
   * Returns e raised to the specified power.
   * @param power - Exponent
   * @returns e^power
   */
  public static Exp(power: number): number {
    return Math.exp(power);
  }

  /**
   * Returns the logarithm of a specified number.
   * @param f - Input value
   * @param p - Base (default: e)
   * @returns Logarithm
   */
  public static Log(f: number, p?: number): number {
    if (p === undefined) {
      return Math.log(f);
    }
    return Math.log(f) / Math.log(p);
  }

  /**
   * Returns the base 10 logarithm of a specified number.
   * @param f - Input value
   * @returns Base 10 logarithm
   */
  public static Log10(f: number): number {
    return Math.log10(f);
  }

  // ==================== Comparison Functions ====================

  /**
   * Returns the smallest of two or more values.
   * @param values - Values to compare
   * @returns Minimum value
   */
  public static Min(...values: number[]): number {
    return Math.min(...values);
  }

  /**
   * Returns the largest of two or more values.
   * @param values - Values to compare
   * @returns Maximum value
   */
  public static Max(...values: number[]): number {
    return Math.max(...values);
  }

  /**
   * Clamps a value between a minimum and maximum value.
   * @param value - Value to clamp
   * @param min - Minimum value
   * @param max - Maximum value
   * @returns Clamped value
   */
  public static Clamp(value: number, min: number, max: number): number {
    return Math.max(min, Math.min(max, value));
  }

  /**
   * Clamps value between 0 and 1.
   * @param value - Value to clamp
   * @returns Clamped value between 0 and 1
   */
  public static Clamp01(value: number): number {
    return Mathf.Clamp(value, 0, 1);
  }

  // ==================== Interpolation Functions ====================

  /**
   * Linearly interpolates between a and b by t.
   * @param a - Start value
   * @param b - End value
   * @param t - Interpolation parameter (clamped to 0-1)
   * @returns Interpolated value
   */
  public static Lerp(a: number, b: number, t: number): number {
    t = Mathf.Clamp01(t);
    return a + (b - a) * t;
  }

  /**
   * Linearly interpolates between a and b by t with no limit to t.
   * @param a - Start value
   * @param b - End value
   * @param t - Interpolation parameter (not clamped)
   * @returns Interpolated value
   */
  public static LerpUnclamped(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }

  /**
   * Same as Lerp but makes sure the values interpolate correctly when they wrap around 360 degrees.
   * @param a - Start angle in degrees
   * @param b - End angle in degrees
   * @param t - Interpolation parameter (clamped to 0-1)
   * @returns Interpolated angle
   */
  public static LerpAngle(a: number, b: number, t: number): number {
    let delta = Mathf.Repeat(b - a, 360);
    if (delta > 180) {
      delta -= 360;
    }
    return a + delta * Mathf.Clamp01(t);
  }

  /**
   * Moves a value current towards target.
   * @param current - Current value
   * @param target - Target value
   * @param maxDelta - Maximum change
   * @returns New value
   */
  public static MoveTowards(current: number, target: number, maxDelta: number): number {
    if (Math.abs(target - current) <= maxDelta) {
      return target;
    }
    return current + Mathf.Sign(target - current) * maxDelta;
  }

  /**
   * Same as MoveTowards but makes sure the values interpolate correctly when they wrap around 360 degrees.
   * @param current - Current angle in degrees
   * @param target - Target angle in degrees
   * @param maxDelta - Maximum change in degrees
   * @returns New angle
   */
  public static MoveTowardsAngle(current: number, target: number, maxDelta: number): number {
    const deltaAngle = Mathf.DeltaAngle(current, target);
    if (-maxDelta < deltaAngle && deltaAngle < maxDelta) {
      return target;
    }
    target = current + deltaAngle;
    return Mathf.MoveTowards(current, target, maxDelta);
  }

  /**
   * Interpolates between min and max with smoothing at the limits.
   * @param from - Start value
   * @param to - End value
   * @param t - Interpolation parameter (clamped to 0-1)
   * @returns Smoothly interpolated value
   */
  public static SmoothStep(from: number, to: number, t: number): number {
    t = Mathf.Clamp01(t);
    t = -2.0 * t * t * t + 3.0 * t * t;
    return to * t + from * (1.0 - t);
  }

  // ==================== Angle Functions ====================

  /**
   * Calculates the shortest difference between two given angles given in degrees.
   * @param current - Current angle in degrees
   * @param target - Target angle in degrees
   * @returns Shortest difference in degrees
   */
  public static DeltaAngle(current: number, target: number): number {
    let delta = Mathf.Repeat(target - current, 360.0);
    if (delta > 180.0) {
      delta -= 360.0;
    }
    return delta;
  }

  /**
   * Loops the value t, so that it is never larger than length and never smaller than 0.
   * @param t - Value to loop
   * @param length - Length of loop
   * @returns Looped value
   */
  public static Repeat(t: number, length: number): number {
    return Mathf.Clamp(t - Math.floor(t / length) * length, 0.0, length);
  }

  /**
   * PingPongs the value t, so that it is never larger than length and never smaller than 0.
   * @param t - Value to pingpong
   * @param length - Length of pingpong
   * @returns Pingponged value
   */
  public static PingPong(t: number, length: number): number {
    t = Mathf.Repeat(t, length * 2);
    return length - Math.abs(t - length);
  }

  // ==================== Utility Functions ====================

  /**
   * Returns the next power of two value.
   * @param value - Input value
   * @returns Next power of two
   */
  public static NextPowerOfTwo(value: number): number {
    value--;
    value |= value >> 1;
    value |= value >> 2;
    value |= value >> 4;
    value |= value >> 8;
    value |= value >> 16;
    value++;
    return value;
  }

  /**
   * Returns true if the value is power of two.
   * @param value - Input value
   * @returns True if power of two
   */
  public static IsPowerOfTwo(value: number): boolean {
    return (value & (value - 1)) === 0 && value !== 0;
  }

  /**
   * Compares two floating point values if they are similar.
   * @param a - First value
   * @param b - Second value
   * @returns True if approximately equal
   */
  public static Approximately(a: number, b: number): boolean {
    return Math.abs(b - a) < Math.max(0.000001 * Math.max(Math.abs(a), Math.abs(b)), Mathf.Epsilon * 8);
  }

  /**
   * Gradually changes a value towards a desired goal over time.
   * @param current - Current value
   * @param target - Target value
   * @param currentVelocity - Current velocity (will be modified)
   * @param smoothTime - Approximate time to reach target
   * @param maxSpeed - Optional maximum speed
   * @param deltaTime - Time since last call
   * @returns New value
   */
  public static SmoothDamp(
    current: number,
    target: number,
    currentVelocity: { value: number },
    smoothTime: number,
    maxSpeed: number = Mathf.Infinity,
    deltaTime: number = 0.016
  ): number {
    smoothTime = Math.max(0.0001, smoothTime);
    const omega = 2 / smoothTime;
    const x = omega * deltaTime;
    const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);

    let change = current - target;
    const originalTo = target;

    const maxChange = maxSpeed * smoothTime;
    change = Mathf.Clamp(change, -maxChange, maxChange);
    target = current - change;

    const temp = (currentVelocity.value + omega * change) * deltaTime;
    currentVelocity.value = (currentVelocity.value - omega * temp) * exp;

    let output = target + (change + temp) * exp;

    if ((originalTo - current > 0) === (output > originalTo)) {
      output = originalTo;
      currentVelocity.value = (output - originalTo) / deltaTime;
    }

    return output;
  }

  /**
   * Gradually changes an angle given in degrees towards a desired goal angle over time.
   * @param current - Current angle in degrees
   * @param target - Target angle in degrees
   * @param currentVelocity - Current velocity (will be modified)
   * @param smoothTime - Approximate time to reach target
   * @param maxSpeed - Optional maximum speed
   * @param deltaTime - Time since last call
   * @returns New angle
   */
  public static SmoothDampAngle(
    current: number,
    target: number,
    currentVelocity: { value: number },
    smoothTime: number,
    maxSpeed: number = Mathf.Infinity,
    deltaTime: number = 0.016
  ): number {
    target = current + Mathf.DeltaAngle(current, target);
    return Mathf.SmoothDamp(current, target, currentVelocity, smoothTime, maxSpeed, deltaTime);
  }

  /**
   * Inverse Lerp - calculates the linear parameter t that produces the interpolant value within the range [a, b].
   * @param a - Start value
   * @param b - End value
   * @param value - Value between a and b
   * @returns Parameter t (0 to 1)
   */
  public static InverseLerp(a: number, b: number, value: number): number {
    if (a !== b) {
      return Mathf.Clamp01((value - a) / (b - a));
    }
    return 0.0;
  }

  /**
   * Converts the given value from gamma (sRGB) to linear color space.
   * @param value - Gamma space value
   * @returns Linear space value
   */
  public static GammaToLinearSpace(value: number): number {
    if (value <= 0.04045) {
      return value / 12.92;
    }
    return Math.pow((value + 0.055) / 1.055, 2.4);
  }

  /**
   * Converts the given value from linear to gamma (sRGB) color space.
   * @param value - Linear space value
   * @returns Gamma space value
   */
  public static LinearToGammaSpace(value: number): number {
    if (value <= 0.0031308) {
      return value * 12.92;
    }
    return 1.055 * Math.pow(value, 1.0 / 2.4) - 0.055;
  }

  /**
   * Re-maps a value from one range to another.
   * @param value - Value to remap
   * @param from1 - Source range start
   * @param to1 - Source range end
   * @param from2 - Target range start
   * @param to2 - Target range end
   * @returns Remapped value
   */
  public static Remap(value: number, from1: number, to1: number, from2: number, to2: number): number {
    return from2 + ((value - from1) / (to1 - from1)) * (to2 - from2);
  }
}
