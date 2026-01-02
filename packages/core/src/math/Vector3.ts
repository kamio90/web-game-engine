/**
 * Representation of 3D vectors and points.
 *
 * This structure is used throughout Unity to pass 3D positions and directions around.
 * It also contains functions for doing common vector operations.
 *
 * @example
 * ```typescript
 * const a = new Vector3(1, 2, 3);
 * const b = new Vector3(4, 5, 6);
 * const result = Vector3.Add(a, b); // (5, 7, 9)
 * ```
 */
export class Vector3 {
  public x: number;
  public y: number;
  public z: number;

  /**
   * Creates a new Vector3.
   * @param x - X component of the vector (default: 0)
   * @param y - Y component of the vector (default: 0)
   * @param z - Z component of the vector (default: 0)
   */
  constructor(x: number = 0, y: number = 0, z: number = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  // ==================== Static Operations (Immutable) ====================

  /**
   * Adds two vectors.
   * @param a - First vector
   * @param b - Second vector
   * @returns New vector (a + b)
   */
  public static Add(a: Vector3, b: Vector3): Vector3 {
    return new Vector3(a.x + b.x, a.y + b.y, a.z + b.z);
  }

  /**
   * Subtracts one vector from another.
   * @param a - First vector
   * @param b - Second vector
   * @returns New vector (a - b)
   */
  public static Subtract(a: Vector3, b: Vector3): Vector3 {
    return new Vector3(a.x - b.x, a.y - b.y, a.z - b.z);
  }

  /**
   * Multiplies a vector by a scalar.
   * @param a - Vector to scale
   * @param scalar - Scalar value
   * @returns New scaled vector
   */
  public static Scale(a: Vector3, scalar: number): Vector3 {
    return new Vector3(a.x * scalar, a.y * scalar, a.z * scalar);
  }

  /**
   * Multiplies two vectors component-wise.
   * @param a - First vector
   * @param b - Second vector
   * @returns New vector with component-wise multiplication
   */
  public static Multiply(a: Vector3, b: Vector3): Vector3 {
    return new Vector3(a.x * b.x, a.y * b.y, a.z * b.z);
  }

  /**
   * Divides a vector by a scalar.
   * @param a - Vector to divide
   * @param scalar - Divisor
   * @returns New divided vector
   */
  public static Divide(a: Vector3, scalar: number): Vector3 {
    if (scalar === 0) {
      console.warn('Vector3.Divide: Division by zero, returning zero vector');
      return Vector3.zero;
    }
    return new Vector3(a.x / scalar, a.y / scalar, a.z / scalar);
  }

  /**
   * Dot Product of two vectors.
   * @param a - First vector
   * @param b - Second vector
   * @returns The dot product (scalar)
   */
  public static Dot(a: Vector3, b: Vector3): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
  }

  /**
   * Cross Product of two vectors.
   * @param a - First vector
   * @param b - Second vector
   * @returns The cross product vector (perpendicular to both)
   */
  public static Cross(a: Vector3, b: Vector3): Vector3 {
    return new Vector3(
      a.y * b.z - a.z * b.y,
      a.z * b.x - a.x * b.z,
      a.x * b.y - a.y * b.x
    );
  }

  /**
   * Returns the distance between a and b.
   * @param a - First point
   * @param b - Second point
   * @returns Distance between the points
   */
  public static Distance(a: Vector3, b: Vector3): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dz = a.z - b.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Returns the squared distance between a and b.
   * Faster than Distance as it avoids the square root.
   * @param a - First point
   * @param b - Second point
   * @returns Squared distance between the points
   */
  public static SqrDistance(a: Vector3, b: Vector3): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dz = a.z - b.z;
    return dx * dx + dy * dy + dz * dz;
  }

  /**
   * Linearly interpolates between two vectors.
   * @param a - Start value
   * @param b - End value
   * @param t - Interpolation parameter (clamped to 0-1)
   * @returns Interpolated vector
   */
  public static Lerp(a: Vector3, b: Vector3, t: number): Vector3 {
    t = Math.max(0, Math.min(1, t)); // Clamp t to [0, 1]
    return new Vector3(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, a.z + (b.z - a.z) * t);
  }

  /**
   * Linearly interpolates between two vectors without clamping t.
   * @param a - Start value
   * @param b - End value
   * @param t - Interpolation parameter (not clamped)
   * @returns Interpolated vector
   */
  public static LerpUnclamped(a: Vector3, b: Vector3, t: number): Vector3 {
    return new Vector3(a.x + (b.x - a.x) * t, a.y + (b.y - a.y) * t, a.z + (b.z - a.z) * t);
  }

  /**
   * Moves a point current towards target.
   * @param current - Current position
   * @param target - Target position
   * @param maxDistanceDelta - Maximum distance to move
   * @returns New position
   */
  public static MoveTowards(
    current: Vector3,
    target: Vector3,
    maxDistanceDelta: number
  ): Vector3 {
    const diff = Vector3.Subtract(target, current);
    const sqrDistance = diff.sqrMagnitude;

    if (sqrDistance === 0 || (maxDistanceDelta >= 0 && sqrDistance <= maxDistanceDelta * maxDistanceDelta)) {
      return target.clone();
    }

    const distance = Math.sqrt(sqrDistance);
    return new Vector3(
      current.x + (diff.x / distance) * maxDistanceDelta,
      current.y + (diff.y / distance) * maxDistanceDelta,
      current.z + (diff.z / distance) * maxDistanceDelta
    );
  }

  /**
   * Returns a vector that is made from the smallest components of two vectors.
   * @param a - First vector
   * @param b - Second vector
   * @returns Vector with minimum components
   */
  public static Min(a: Vector3, b: Vector3): Vector3 {
    return new Vector3(Math.min(a.x, b.x), Math.min(a.y, b.y), Math.min(a.z, b.z));
  }

  /**
   * Returns a vector that is made from the largest components of two vectors.
   * @param a - First vector
   * @param b - Second vector
   * @returns Vector with maximum components
   */
  public static Max(a: Vector3, b: Vector3): Vector3 {
    return new Vector3(Math.max(a.x, b.x), Math.max(a.y, b.y), Math.max(a.z, b.z));
  }

  /**
   * Returns a copy of vector with its magnitude clamped to maxLength.
   * @param vector - Vector to clamp
   * @param maxLength - Maximum length
   * @returns Clamped vector
   */
  public static ClampMagnitude(vector: Vector3, maxLength: number): Vector3 {
    const sqrMagnitude = vector.sqrMagnitude;
    if (sqrMagnitude > maxLength * maxLength) {
      const magnitude = Math.sqrt(sqrMagnitude);
      const normalized = new Vector3(
        vector.x / magnitude,
        vector.y / magnitude,
        vector.z / magnitude
      );
      return Vector3.Scale(normalized, maxLength);
    }
    return vector.clone();
  }

  /**
   * Returns the angle in degrees between from and to.
   * @param from - Start vector
   * @param to - End vector
   * @returns Angle in degrees
   */
  public static Angle(from: Vector3, to: Vector3): number {
    const denominator = Math.sqrt(from.sqrMagnitude * to.sqrMagnitude);
    if (denominator < 1e-15) {
      return 0;
    }

    const dot = Math.max(-1, Math.min(1, Vector3.Dot(from, to) / denominator));
    return Math.acos(dot) * (180 / Math.PI); // Radians to degrees
  }

  /**
   * Returns the signed angle in degrees between from and to.
   * @param from - Start vector
   * @param to - End vector
   * @param axis - Axis around which to measure the angle
   * @returns Signed angle in degrees
   */
  public static SignedAngle(from: Vector3, to: Vector3, axis: Vector3): number {
    const unsignedAngle = Vector3.Angle(from, to);
    const cross = Vector3.Cross(from, to);
    const sign = Math.sign(Vector3.Dot(axis, cross));
    return unsignedAngle * sign;
  }

  /**
   * Projects a vector onto another vector.
   * @param vector - Vector to project
   * @param onNormal - Vector to project onto (should be normalized)
   * @returns Projected vector
   */
  public static Project(vector: Vector3, onNormal: Vector3): Vector3 {
    const sqrMag = Vector3.Dot(onNormal, onNormal);
    if (sqrMag < Number.EPSILON) {
      return Vector3.zero;
    }
    const dot = Vector3.Dot(vector, onNormal);
    return Vector3.Scale(onNormal, dot / sqrMag);
  }

  /**
   * Projects a vector onto a plane defined by a normal orthogonal to the plane.
   * @param vector - Vector to project
   * @param planeNormal - Normal of the plane (should be normalized)
   * @returns Projected vector
   */
  public static ProjectOnPlane(vector: Vector3, planeNormal: Vector3): Vector3 {
    const sqrMag = Vector3.Dot(planeNormal, planeNormal);
    if (sqrMag < Number.EPSILON) {
      return vector.clone();
    }
    const dot = Vector3.Dot(vector, planeNormal);
    return Vector3.Subtract(vector, Vector3.Scale(planeNormal, dot / sqrMag));
  }

  /**
   * Reflects a vector off the plane defined by a normal.
   * @param inDirection - Direction vector
   * @param inNormal - Normal of the surface (should be normalized)
   * @returns Reflected vector
   */
  public static Reflect(inDirection: Vector3, inNormal: Vector3): Vector3 {
    const factor = -2 * Vector3.Dot(inNormal, inDirection);
    return new Vector3(
      factor * inNormal.x + inDirection.x,
      factor * inNormal.y + inDirection.y,
      factor * inNormal.z + inDirection.z
    );
  }

  /**
   * Makes vectors normalized and orthogonal to each other.
   * @param normal - First vector (will be normalized)
   * @param tangent - Second vector (will be made orthogonal to normal)
   */
  public static OrthoNormalize(normal: Vector3, tangent: Vector3): void {
    normal.Normalize();
    const proj = Vector3.Project(tangent, normal);
    tangent.Set(tangent.x - proj.x, tangent.y - proj.y, tangent.z - proj.z);
    tangent.Normalize();
  }

  /**
   * Spherically interpolates between two vectors.
   * @param a - Start vector
   * @param b - End vector
   * @param t - Interpolation parameter (clamped to 0-1)
   * @returns Spherically interpolated vector
   */
  public static Slerp(a: Vector3, b: Vector3, t: number): Vector3 {
    t = Math.max(0, Math.min(1, t));

    const dot = Math.max(-1, Math.min(1, Vector3.Dot(a.normalized, b.normalized)));
    const theta = Math.acos(dot) * t;
    const relativeVec = Vector3.Subtract(b, Vector3.Scale(a, dot)).normalized;

    return Vector3.Add(
      Vector3.Scale(a, Math.cos(theta)),
      Vector3.Scale(relativeVec, Math.sin(theta))
    );
  }

  /**
   * Spherically interpolates between two vectors without clamping t.
   * @param a - Start vector
   * @param b - End vector
   * @param t - Interpolation parameter (not clamped)
   * @returns Spherically interpolated vector
   */
  public static SlerpUnclamped(a: Vector3, b: Vector3, t: number): Vector3 {
    const dot = Math.max(-1, Math.min(1, Vector3.Dot(a.normalized, b.normalized)));
    const theta = Math.acos(dot) * t;
    const relativeVec = Vector3.Subtract(b, Vector3.Scale(a, dot)).normalized;

    return Vector3.Add(
      Vector3.Scale(a, Math.cos(theta)),
      Vector3.Scale(relativeVec, Math.sin(theta))
    );
  }

  /**
   * Gradually changes a vector towards a desired goal over time.
   * @param current - Current position
   * @param target - Target position
   * @param currentVelocity - Current velocity (will be modified)
   * @param smoothTime - Approximate time to reach target
   * @param maxSpeed - Optional maximum speed (default: Infinity)
   * @param deltaTime - Time since last call (default: Time.deltaTime)
   * @returns New position
   */
  public static SmoothDamp(
    current: Vector3,
    target: Vector3,
    currentVelocity: Vector3,
    smoothTime: number,
    maxSpeed: number = Infinity,
    deltaTime: number = 0.016
  ): Vector3 {
    smoothTime = Math.max(0.0001, smoothTime);
    const omega = 2 / smoothTime;
    const x = omega * deltaTime;
    const exp = 1 / (1 + x + 0.48 * x * x + 0.235 * x * x * x);

    let changeX = current.x - target.x;
    let changeY = current.y - target.y;
    let changeZ = current.z - target.z;

    const maxChange = maxSpeed * smoothTime;
    const maxChangeSq = maxChange * maxChange;
    const sqrMag = changeX * changeX + changeY * changeY + changeZ * changeZ;

    if (sqrMag > maxChangeSq) {
      const mag = Math.sqrt(sqrMag);
      changeX = (changeX / mag) * maxChange;
      changeY = (changeY / mag) * maxChange;
      changeZ = (changeZ / mag) * maxChange;
    }

    const tempX = (currentVelocity.x + omega * changeX) * deltaTime;
    const tempY = (currentVelocity.y + omega * changeY) * deltaTime;
    const tempZ = (currentVelocity.z + omega * changeZ) * deltaTime;

    currentVelocity.x = (currentVelocity.x - omega * tempX) * exp;
    currentVelocity.y = (currentVelocity.y - omega * tempY) * exp;
    currentVelocity.z = (currentVelocity.z - omega * tempZ) * exp;

    let outputX = target.x + (changeX + tempX) * exp;
    let outputY = target.y + (changeY + tempY) * exp;
    let outputZ = target.z + (changeZ + tempZ) * exp;

    // Prevent overshooting
    const origMinusCurrentX = target.x - current.x;
    const origMinusCurrentY = target.y - current.y;
    const origMinusCurrentZ = target.z - current.z;
    const outMinusOrigX = outputX - target.x;
    const outMinusOrigY = outputY - target.y;
    const outMinusOrigZ = outputZ - target.z;

    if (
      origMinusCurrentX * outMinusOrigX +
        origMinusCurrentY * outMinusOrigY +
        origMinusCurrentZ * outMinusOrigZ >
      0
    ) {
      outputX = target.x;
      outputY = target.y;
      outputZ = target.z;
      currentVelocity.x = (outputX - target.x) / deltaTime;
      currentVelocity.y = (outputY - target.y) / deltaTime;
      currentVelocity.z = (outputZ - target.z) / deltaTime;
    }

    return new Vector3(outputX, outputY, outputZ);
  }

  // ==================== Instance Properties ====================

  /**
   * Returns the length of this vector (Read Only).
   */
  public get magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  /**
   * Returns the squared length of this vector (Read Only).
   * Faster than magnitude as it avoids the square root.
   */
  public get sqrMagnitude(): number {
    return this.x * this.x + this.y * this.y + this.z * this.z;
  }

  /**
   * Returns this vector with a magnitude of 1 (Read Only).
   */
  public get normalized(): Vector3 {
    const mag = this.magnitude;
    if (mag > 1e-5) {
      return new Vector3(this.x / mag, this.y / mag, this.z / mag);
    }
    return Vector3.zero;
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
      this.z /= mag;
    } else {
      this.x = 0;
      this.y = 0;
      this.z = 0;
    }
  }

  /**
   * Set x, y and z components of an existing Vector3.
   * @param x - New X component
   * @param y - New Y component
   * @param z - New Z component
   */
  public Set(x: number, y: number, z: number): void {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  /**
   * Multiplies every component of this vector by the same component of scale.
   * @param scale - Vector to scale by
   */
  public Scale(scale: Vector3): void {
    this.x *= scale.x;
    this.y *= scale.y;
    this.z *= scale.z;
  }

  // ==================== Utility Methods ====================

  /**
   * Returns a formatted string for this vector.
   * @param format - Optional number of decimal places (default: 2)
   * @returns String representation
   */
  public toString(format: number = 2): string {
    return `(${this.x.toFixed(format)}, ${this.y.toFixed(format)}, ${this.z.toFixed(format)})`;
  }

  /**
   * Creates a copy of this vector.
   * @returns New vector with same components
   */
  public clone(): Vector3 {
    return new Vector3(this.x, this.y, this.z);
  }

  /**
   * Returns true if the given vector is exactly equal to this vector.
   * @param other - Vector to compare
   * @returns True if vectors are equal
   */
  public equals(other: Vector3): boolean {
    return this.x === other.x && this.y === other.y && this.z === other.z;
  }

  /**
   * Returns true if vectors are approximately equal within tolerance.
   * @param other - Vector to compare
   * @param tolerance - Maximum difference (default: 0.00001)
   * @returns True if vectors are approximately equal
   */
  public approximatelyEquals(other: Vector3, tolerance: number = 1e-5): boolean {
    return (
      Math.abs(this.x - other.x) < tolerance &&
      Math.abs(this.y - other.y) < tolerance &&
      Math.abs(this.z - other.z) < tolerance
    );
  }

  // ==================== Static Vector Constants ====================

  /** Shorthand for writing Vector3(0, 0, 0) */
  public static get zero(): Vector3 {
    return new Vector3(0, 0, 0);
  }

  /** Shorthand for writing Vector3(1, 1, 1) */
  public static get one(): Vector3 {
    return new Vector3(1, 1, 1);
  }

  /** Shorthand for writing Vector3(0, 1, 0) */
  public static get up(): Vector3 {
    return new Vector3(0, 1, 0);
  }

  /** Shorthand for writing Vector3(0, -1, 0) */
  public static get down(): Vector3 {
    return new Vector3(0, -1, 0);
  }

  /** Shorthand for writing Vector3(-1, 0, 0) */
  public static get left(): Vector3 {
    return new Vector3(-1, 0, 0);
  }

  /** Shorthand for writing Vector3(1, 0, 0) */
  public static get right(): Vector3 {
    return new Vector3(1, 0, 0);
  }

  /** Shorthand for writing Vector3(0, 0, 1) */
  public static get forward(): Vector3 {
    return new Vector3(0, 0, 1);
  }

  /** Shorthand for writing Vector3(0, 0, -1) */
  public static get back(): Vector3 {
    return new Vector3(0, 0, -1);
  }

  /** Shorthand for writing Vector3(Infinity, Infinity, Infinity) */
  public static get positiveInfinity(): Vector3 {
    return new Vector3(Infinity, Infinity, Infinity);
  }

  /** Shorthand for writing Vector3(-Infinity, -Infinity, -Infinity) */
  public static get negativeInfinity(): Vector3 {
    return new Vector3(-Infinity, -Infinity, -Infinity);
  }

  // ==================== Serialization ====================

  /**
   * Serializes this Vector3 to JSON.
   * @returns Object with x, y, z components
   */
  public toJSON(): { x: number; y: number; z: number } {
    return { x: this.x, y: this.y, z: this.z };
  }

  /**
   * Deserializes a Vector3 from JSON.
   * @param json - Object with x, y, z components
   * @returns Vector3 instance
   */
  public static fromJSON(json: { x: number; y: number; z: number }): Vector3 {
    return new Vector3(json.x, json.y, json.z);
  }
}
