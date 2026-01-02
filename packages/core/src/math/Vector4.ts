/**
 * Representation of 4D vectors and points.
 *
 * This structure is used to represent 4D vectors and points. It's also used in Unity to pass
 * four values together (like RGBA colors).
 *
 * @example
 * ```typescript
 * const a = new Vector4(1, 2, 3, 4);
 * const b = new Vector4(5, 6, 7, 8);
 * const c = Vector4.Add(a, b); // (6, 8, 10, 12)
 * ```
 */
export class Vector4 {
  public x: number;
  public y: number;
  public z: number;
  public w: number;

  /**
   * Creates a new Vector4.
   * @param x - X component
   * @param y - Y component
   * @param z - Z component
   * @param w - W component
   */
  constructor(x: number = 0, y: number = 0, z: number = 0, w: number = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }

  // ==================== Static Properties ====================

  /** Shorthand for writing Vector4(0, 0, 0, 0). */
  public static get zero(): Vector4 {
    return new Vector4(0, 0, 0, 0);
  }

  /** Shorthand for writing Vector4(1, 1, 1, 1). */
  public static get one(): Vector4 {
    return new Vector4(1, 1, 1, 1);
  }

  /** Shorthand for writing Vector4(Infinity, Infinity, Infinity, Infinity). */
  public static get positiveInfinity(): Vector4 {
    return new Vector4(Infinity, Infinity, Infinity, Infinity);
  }

  /** Shorthand for writing Vector4(-Infinity, -Infinity, -Infinity, -Infinity). */
  public static get negativeInfinity(): Vector4 {
    return new Vector4(-Infinity, -Infinity, -Infinity, -Infinity);
  }

  // ==================== Instance Properties ====================

  /** Returns the length of this vector (Read Only). */
  public get magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
  }

  /** Returns the squared length of this vector (Read Only). */
  public get sqrMagnitude(): number {
    return this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w;
  }

  /** Returns this vector with a magnitude of 1 (Read Only). */
  public get normalized(): Vector4 {
    const mag = this.magnitude;
    if (mag > 1e-5) {
      return new Vector4(this.x / mag, this.y / mag, this.z / mag, this.w / mag);
    }
    return Vector4.zero;
  }

  // ==================== Static Methods ====================

  /**
   * Linearly interpolates between two vectors.
   * @param a - Start value
   * @param b - End value
   * @param t - Interpolation parameter (clamped to 0-1)
   * @returns Interpolated vector
   */
  public static Lerp(a: Vector4, b: Vector4, t: number): Vector4 {
    t = Math.max(0, Math.min(1, t));
    return new Vector4(
      a.x + (b.x - a.x) * t,
      a.y + (b.y - a.y) * t,
      a.z + (b.z - a.z) * t,
      a.w + (b.w - a.w) * t
    );
  }

  /**
   * Linearly interpolates between two vectors without clamping.
   * @param a - Start value
   * @param b - End value
   * @param t - Interpolation parameter
   * @returns Interpolated vector
   */
  public static LerpUnclamped(a: Vector4, b: Vector4, t: number): Vector4 {
    return new Vector4(
      a.x + (b.x - a.x) * t,
      a.y + (b.y - a.y) * t,
      a.z + (b.z - a.z) * t,
      a.w + (b.w - a.w) * t
    );
  }

  /**
   * Moves a point current towards target.
   * @param current - Current value
   * @param target - Target value
   * @param maxDistanceDelta - Maximum distance to move
   * @returns New value
   */
  public static MoveTowards(current: Vector4, target: Vector4, maxDistanceDelta: number): Vector4 {
    const diff = Vector4.Subtract(target, current);
    const magnitude = diff.magnitude;
    if (magnitude <= maxDistanceDelta || magnitude < 1e-5) {
      return target;
    }
    return Vector4.Add(current, Vector4.Scale(diff, maxDistanceDelta / magnitude));
  }

  /**
   * Multiplies two vectors component-wise.
   * @param a - First vector
   * @param b - Second vector
   * @returns Scaled vector
   */
  public static Scale(a: Vector4, scale: number): Vector4;
  public static Scale(a: Vector4, b: Vector4): Vector4;
  public static Scale(a: Vector4, scaleOrB: number | Vector4): Vector4 {
    if (typeof scaleOrB === 'number') {
      return new Vector4(a.x * scaleOrB, a.y * scaleOrB, a.z * scaleOrB, a.w * scaleOrB);
    }
    return new Vector4(a.x * scaleOrB.x, a.y * scaleOrB.y, a.z * scaleOrB.z, a.w * scaleOrB.w);
  }

  /**
   * Adds two vectors.
   * @param a - First vector
   * @param b - Second vector
   * @returns Sum vector
   */
  public static Add(a: Vector4, b: Vector4): Vector4 {
    return new Vector4(a.x + b.x, a.y + b.y, a.z + b.z, a.w + b.w);
  }

  /**
   * Subtracts one vector from another.
   * @param a - First vector
   * @param b - Second vector
   * @returns Difference vector
   */
  public static Subtract(a: Vector4, b: Vector4): Vector4 {
    return new Vector4(a.x - b.x, a.y - b.y, a.z - b.z, a.w - b.w);
  }

  /**
   * Dot Product of two vectors.
   * @param a - First vector
   * @param b - Second vector
   * @returns Dot product
   */
  public static Dot(a: Vector4, b: Vector4): number {
    return a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w;
  }

  /**
   * Returns a vector that is made from the smallest components of two vectors.
   * @param lhs - First vector
   * @param rhs - Second vector
   * @returns Component-wise minimum
   */
  public static Min(lhs: Vector4, rhs: Vector4): Vector4 {
    return new Vector4(
      Math.min(lhs.x, rhs.x),
      Math.min(lhs.y, rhs.y),
      Math.min(lhs.z, rhs.z),
      Math.min(lhs.w, rhs.w)
    );
  }

  /**
   * Returns a vector that is made from the largest components of two vectors.
   * @param lhs - First vector
   * @param rhs - Second vector
   * @returns Component-wise maximum
   */
  public static Max(lhs: Vector4, rhs: Vector4): Vector4 {
    return new Vector4(
      Math.max(lhs.x, rhs.x),
      Math.max(lhs.y, rhs.y),
      Math.max(lhs.z, rhs.z),
      Math.max(lhs.w, rhs.w)
    );
  }

  /**
   * Returns the distance between a and b.
   * @param a - First vector
   * @param b - Second vector
   * @returns Distance
   */
  public static Distance(a: Vector4, b: Vector4): number {
    return Vector4.Subtract(a, b).magnitude;
  }

  /**
   * Normalizes a vector.
   * @param value - Vector to normalize
   * @returns Normalized vector
   */
  public static Normalize(value: Vector4): Vector4 {
    return value.normalized;
  }

  /**
   * Projects a vector onto another vector.
   * @param vector - Vector to project
   * @param onNormal - Vector to project onto
   * @returns Projected vector
   */
  public static Project(vector: Vector4, onNormal: Vector4): Vector4 {
    const sqrMag = onNormal.sqrMagnitude;
    if (sqrMag < 1e-10) {
      return Vector4.zero;
    }
    const dot = Vector4.Dot(vector, onNormal);
    return Vector4.Scale(onNormal, dot / sqrMag);
  }

  // ==================== Instance Methods ====================

  /**
   * Normalizes this vector.
   */
  public Normalize(): void {
    const mag = this.magnitude;
    if (mag > 1e-5) {
      this.x /= mag;
      this.y /= mag;
      this.z /= mag;
      this.w /= mag;
    } else {
      this.x = 0;
      this.y = 0;
      this.z = 0;
      this.w = 0;
    }
  }

  /**
   * Set x, y, z and w components of an existing Vector4.
   * @param newX - New x value
   * @param newY - New y value
   * @param newZ - New z value
   * @param newW - New w value
   */
  public Set(newX: number, newY: number, newZ: number, newW: number): void {
    this.x = newX;
    this.y = newY;
    this.z = newZ;
    this.w = newW;
  }

  /**
   * Returns true if two vectors are approximately equal.
   * @param other - Other vector
   * @param epsilon - Comparison tolerance
   * @returns True if approximately equal
   */
  public approximatelyEquals(other: Vector4, epsilon: number = 1e-5): boolean {
    return (
      Math.abs(this.x - other.x) < epsilon &&
      Math.abs(this.y - other.y) < epsilon &&
      Math.abs(this.z - other.z) < epsilon &&
      Math.abs(this.w - other.w) < epsilon
    );
  }

  /**
   * Returns a formatted string for this vector.
   * @param format - Optional format string (not implemented)
   * @returns Formatted string
   */
  public toString(_format?: string): string {
    return `(${this.x.toFixed(2)}, ${this.y.toFixed(2)}, ${this.z.toFixed(2)}, ${this.w.toFixed(2)})`;
  }

  /**
   * Returns true if the given vector is exactly equal to this vector.
   * @param other - Other vector
   * @returns True if equal
   */
  public Equals(other: Vector4): boolean {
    return this.x === other.x && this.y === other.y && this.z === other.z && this.w === other.w;
  }
}
