/**
 * Representation of 2D vectors and points.
 *
 * This structure is used to pass 2D positions and directions around.
 * It also contains functions for doing common vector operations.
 *
 * @example
 * ```typescript
 * const a = new Vector2(1, 2);
 * const b = new Vector2(3, 4);
 * const result = Vector2.Add(a, b); // (4, 6)
 * ```
 */
export class Vector2 {
  public x: number;
  public y: number;

  /**
   * Creates a new Vector2.
   * @param x - X component of the vector (default: 0)
   * @param y - Y component of the vector (default: 0)
   */
  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  // ==================== Static Operations (Immutable) ====================

  /**
   * Adds two vectors.
   * @param a - First vector
   * @param b - Second vector
   * @returns New vector (a + b)
   */
  public static Add(a: Vector2, b: Vector2): Vector2 {
    return new Vector2(a.x + b.x, a.y + b.y);
  }

  /**
   * Subtracts one vector from another.
   * @param a - First vector
   * @param b - Second vector
   * @returns New vector (a - b)
   */
  public static Subtract(a: Vector2, b: Vector2): Vector2 {
    return new Vector2(a.x - b.x, a.y - b.y);
  }

  /**
   * Multiplies a vector by a scalar.
   * @param a - Vector to scale
   * @param scalar - Scalar value
   * @returns New scaled vector
   */
  public static Scale(a: Vector2, scalar: number): Vector2 {
    return new Vector2(a.x * scalar, a.y * scalar);
  }

  /**
   * Multiplies two vectors component-wise.
   * @param a - First vector
   * @param b - Second vector
   * @returns New vector with component-wise multiplication
   */
  public static Multiply(a: Vector2, b: Vector2): Vector2 {
    return new Vector2(a.x * b.x, a.y * b.y);
  }

  /**
   * Divides a vector by a scalar.
   * @param a - Vector to divide
   * @param scalar - Divisor
   * @returns New divided vector
   */
  public static Divide(a: Vector2, scalar: number): Vector2 {
    if (scalar === 0) {
      console.warn('Vector2.Divide: Division by zero, returning zero vector');
      return Vector2.zero;
    }
    return new Vector2(a.x / scalar, a.y / scalar);
  }

  /**
   * Dot Product of two vectors.
   * @param a - First vector
   * @param b - Second vector
   * @returns The dot product (scalar)
   */
  public static Dot(a: Vector2, b: Vector2): number {
    return a.x * b.x + a.y * b.y;
  }

  /**
   * Returns the distance between a and b.
   * @param a - First point
   * @param b - Second point
   * @returns Distance between the points
   */
  public static Distance(a: Vector2, b: Vector2): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return Math.sqrt(dx * dx + dy * dy);
  }

  /**
   * Returns the squared distance between a and b.
   * Faster than Distance as it avoids the square root.
   * @param a - First point
   * @param b - Second point
   * @returns Squared distance between the points
   */
  public static SqrDistance(a: Vector2, b: Vector2): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    return dx * dx + dy * dy;
  }

  /**
   * Linearly interpolates between two vectors.
   * @param a - Start value
   * @param b - End value
   * @param t - Interpolation parameter (clamped to 0-1)
   * @returns Interpolated vector
   */
  public static Lerp(a: Vector2, b: Vector2, t: number): Vector2 {
    t = Math.max(0, Math.min(1, t)); // Clamp t to [0, 1]
    return new Vector2(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
  }

  /**
   * Linearly interpolates between two vectors without clamping t.
   * @param a - Start value
   * @param b - End value
   * @param t - Interpolation parameter (not clamped)
   * @returns Interpolated vector
   */
  public static LerpUnclamped(a: Vector2, b: Vector2, t: number): Vector2 {
    return new Vector2(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t);
  }

  /**
   * Moves a point current towards target.
   * @param current - Current position
   * @param target - Target position
   * @param maxDistanceDelta - Maximum distance to move
   * @returns New position
   */
  public static MoveTowards(
    current: Vector2,
    target: Vector2,
    maxDistanceDelta: number
  ): Vector2 {
    const diff = Vector2.Subtract(target, current);
    const sqrDistance = diff.sqrMagnitude;

    if (
      sqrDistance === 0 ||
      (maxDistanceDelta >= 0 && sqrDistance <= maxDistanceDelta * maxDistanceDelta)
    ) {
      return target.clone();
    }

    const distance = Math.sqrt(sqrDistance);
    return new Vector2(
      current.x + (diff.x / distance) * maxDistanceDelta,
      current.y + (diff.y / distance) * maxDistanceDelta
    );
  }

  /**
   * Returns a vector that is made from the smallest components of two vectors.
   * @param a - First vector
   * @param b - Second vector
   * @returns Vector with minimum components
   */
  public static Min(a: Vector2, b: Vector2): Vector2 {
    return new Vector2(Math.min(a.x, b.x), Math.min(a.y, b.y));
  }

  /**
   * Returns a vector that is made from the largest components of two vectors.
   * @param a - First vector
   * @param b - Second vector
   * @returns Vector with maximum components
   */
  public static Max(a: Vector2, b: Vector2): Vector2 {
    return new Vector2(Math.max(a.x, b.x), Math.max(a.y, b.y));
  }

  /**
   * Returns a copy of vector with its magnitude clamped to maxLength.
   * @param vector - Vector to clamp
   * @param maxLength - Maximum length
   * @returns Clamped vector
   */
  public static ClampMagnitude(vector: Vector2, maxLength: number): Vector2 {
    const sqrMagnitude = vector.sqrMagnitude;
    if (sqrMagnitude > maxLength * maxLength) {
      const magnitude = Math.sqrt(sqrMagnitude);
      const normalized = new Vector2(vector.x / magnitude, vector.y / magnitude);
      return Vector2.Scale(normalized, maxLength);
    }
    return vector.clone();
  }

  /**
   * Returns the angle in degrees between from and to.
   * @param from - Start vector
   * @param to - End vector
   * @returns Angle in degrees (0 to 180)
   */
  public static Angle(from: Vector2, to: Vector2): number {
    const denominator = Math.sqrt(from.sqrMagnitude * to.sqrMagnitude);
    if (denominator < 1e-15) {
      return 0;
    }

    const dot = Math.max(-1, Math.min(1, Vector2.Dot(from, to) / denominator));
    return Math.acos(dot) * (180 / Math.PI); // Radians to degrees
  }

  /**
   * Returns the signed angle in degrees between from and to.
   * @param from - Start vector
   * @param to - End vector
   * @returns Signed angle in degrees (-180 to 180)
   */
  public static SignedAngle(from: Vector2, to: Vector2): number {
    const unsignedAngle = Vector2.Angle(from, to);
    const sign = Math.sign(from.x * to.y - from.y * to.x);
    return unsignedAngle * sign;
  }

  /**
   * Reflects a vector off the vector defined by a normal.
   * @param inDirection - Direction vector
   * @param inNormal - Normal of the surface (should be normalized)
   * @returns Reflected vector
   */
  public static Reflect(inDirection: Vector2, inNormal: Vector2): Vector2 {
    const factor = -2 * Vector2.Dot(inNormal, inDirection);
    return new Vector2(factor * inNormal.x + inDirection.x, factor * inNormal.y + inDirection.y);
  }

  /**
   * Returns the 2D vector perpendicular to this 2D vector.
   * The result is always rotated 90-degrees in a counter-clockwise direction for a 2D coordinate system where the positive Y axis goes up.
   * @param inDirection - Input direction
   * @returns Perpendicular vector
   */
  public static Perpendicular(inDirection: Vector2): Vector2 {
    return new Vector2(-inDirection.y, inDirection.x);
  }

  /**
   * Gradually changes a vector towards a desired goal over time.
   * @param current - Current position
   * @param target - Target position
   * @param currentVelocity - Current velocity (will be modified)
   * @param smoothTime - Approximate time to reach target
   * @param maxSpeed - Optional maximum speed (default: Infinity)
   * @param deltaTime - Time since last call (default: 0.016)
   * @returns New position
   */
  public static SmoothDamp(
    current: Vector2,
    target: Vector2,
    currentVelocity: Vector2,
    smoothTime: number,
    maxSpeed: number = Infinity,
    deltaTime: number = 0.016
  ): Vector2 {
    smoothTime = Math.max(0.0001, smoothTime);
    const omega = 2 / smoothTime;
    const x = omega * deltaTime;
    const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);

    let changeX = current.x - target.x;
    let changeY = current.y - target.y;

    const maxChange = maxSpeed * smoothTime;
    const maxChangeSq = maxChange * maxChange;
    const sqrMag = changeX * changeX + changeY * changeY;

    if (sqrMag > maxChangeSq) {
      const mag = Math.sqrt(sqrMag);
      changeX = (changeX / mag) * maxChange;
      changeY = (changeY / mag) * maxChange;
    }

    const tempX = (currentVelocity.x + omega * changeX) * deltaTime;
    const tempY = (currentVelocity.y + omega * changeY) * deltaTime;

    currentVelocity.x = (currentVelocity.x - omega * tempX) * exp;
    currentVelocity.y = (currentVelocity.y - omega * tempY) * exp;

    let outputX = target.x + (changeX + tempX) * exp;
    let outputY = target.y + (changeY + tempY) * exp;

    // Prevent overshooting
    const origMinusCurrentX = target.x - current.x;
    const origMinusCurrentY = target.y - current.y;
    const outMinusOrigX = outputX - target.x;
    const outMinusOrigY = outputY - target.y;

    if (origMinusCurrentX * outMinusOrigX + origMinusCurrentY * outMinusOrigY > 0) {
      outputX = target.x;
      outputY = target.y;
      currentVelocity.x = (outputX - target.x) / deltaTime;
      currentVelocity.y = (outputY - target.y) / deltaTime;
    }

    return new Vector2(outputX, outputY);
  }

  // ==================== Instance Properties ====================

  /**
   * Returns the length of this vector (Read Only).
   */
  public get magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  /**
   * Returns the squared length of this vector (Read Only).
   * Faster than magnitude as it avoids the square root.
   */
  public get sqrMagnitude(): number {
    return this.x * this.x + this.y * this.y;
  }

  /**
   * Returns this vector with a magnitude of 1 (Read Only).
   */
  public get normalized(): Vector2 {
    const mag = this.magnitude;
    if (mag > 1e-5) {
      return new Vector2(this.x / mag, this.y / mag);
    }
    return Vector2.zero;
  }

  // ==================== Instance Methods (Mutable) ====================

  /**
   * Makes this vector have a magnitude of 1.
   * When normalized, a vector keeps the same direction but its length is 1.0.
   */
  public Normalize(): void {
    const mag = this.magnitude;
    if (mag > 1e-5) {
      this.x /= mag;
      this.y /= mag;
    } else {
      this.x = 0;
      this.y = 0;
    }
  }

  /**
   * Set x and y components of an existing Vector2.
   * @param x - New X component
   * @param y - New Y component
   */
  public Set(x: number, y: number): void {
    this.x = x;
    this.y = y;
  }

  /**
   * Multiplies every component of this vector by the same component of scale.
   * @param scale - Vector to scale by
   */
  public Scale(scale: Vector2): void {
    this.x *= scale.x;
    this.y *= scale.y;
  }

  // ==================== Utility Methods ====================

  /**
   * Returns a formatted string for this vector.
   * @param format - Optional number of decimal places (default: 2)
   * @returns String representation
   */
  public toString(format: number = 2): string {
    return `(${this.x.toFixed(format)}, ${this.y.toFixed(format)})`;
  }

  /**
   * Creates a copy of this vector.
   * @returns New vector with same components
   */
  public clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }

  /**
   * Returns true if the given vector is exactly equal to this vector.
   * @param other - Vector to compare
   * @returns True if vectors are equal
   */
  public equals(other: Vector2): boolean {
    return this.x === other.x && this.y === other.y;
  }

  /**
   * Returns true if vectors are approximately equal within tolerance.
   * @param other - Vector to compare
   * @param tolerance - Maximum difference (default: 0.00001)
   * @returns True if vectors are approximately equal
   */
  public approximatelyEquals(other: Vector2, tolerance: number = 1e-5): boolean {
    return Math.abs(this.x - other.x) < tolerance && Math.abs(this.y - other.y) < tolerance;
  }

  // ==================== Static Vector Constants ====================

  /** Shorthand for writing Vector2(0, 0) */
  public static get zero(): Vector2 {
    return new Vector2(0, 0);
  }

  /** Shorthand for writing Vector2(1, 1) */
  public static get one(): Vector2 {
    return new Vector2(1, 1);
  }

  /** Shorthand for writing Vector2(0, 1) */
  public static get up(): Vector2 {
    return new Vector2(0, 1);
  }

  /** Shorthand for writing Vector2(0, -1) */
  public static get down(): Vector2 {
    return new Vector2(0, -1);
  }

  /** Shorthand for writing Vector2(-1, 0) */
  public static get left(): Vector2 {
    return new Vector2(-1, 0);
  }

  /** Shorthand for writing Vector2(1, 0) */
  public static get right(): Vector2 {
    return new Vector2(1, 0);
  }

  /** Shorthand for writing Vector2(Infinity, Infinity) */
  public static get positiveInfinity(): Vector2 {
    return new Vector2(Infinity, Infinity);
  }

  /** Shorthand for writing Vector2(-Infinity, -Infinity) */
  public static get negativeInfinity(): Vector2 {
    return new Vector2(-Infinity, -Infinity);
  }
}
