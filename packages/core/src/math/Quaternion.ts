import { Vector3 } from './Vector3';

/**
 * Quaternions are used to represent rotations.
 *
 * They are compact, don't suffer from gimbal lock and can easily be interpolated.
 * Unity internally uses Quaternions to represent all rotations.
 *
 * @example
 * ```typescript
 * // Create a rotation of 45 degrees around the Y axis
 * const rotation = Quaternion.Euler(0, 45, 0);
 *
 * // Rotate a vector
 * const forward = new Vector3(0, 0, 1);
 * const rotated = rotation.MultiplyVector(forward);
 * ```
 */
export class Quaternion {
  public x: number;
  public y: number;
  public z: number;
  public w: number;

  /**
   * Creates a new Quaternion.
   * @param x - X component (default: 0)
   * @param y - Y component (default: 0)
   * @param z - Z component (default: 0)
   * @param w - W component (default: 1)
   */
  constructor(x: number = 0, y: number = 0, z: number = 0, w: number = 1) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }

  // ==================== Static Operations ====================

  /**
   * Returns the angle in degrees between two rotations a and b.
   * @param a - First rotation
   * @param b - Second rotation
   * @returns Angle in degrees
   */
  public static Angle(a: Quaternion, b: Quaternion): number {
    const dot = Math.min(Math.abs(Quaternion.Dot(a, b)), 1.0);
    return Math.acos(dot) * 2.0 * (180.0 / Math.PI);
  }

  /**
   * Creates a rotation which rotates angle degrees around axis.
   * @param angle - Rotation angle in degrees
   * @param axis - Rotation axis (should be normalized)
   * @returns Rotation quaternion
   */
  public static AngleAxis(angle: number, axis: Vector3): Quaternion {
    const halfAngle = (angle * Math.PI) / 360.0; // angle/2 in radians
    const s = Math.sin(halfAngle);
    const c = Math.cos(halfAngle);

    return new Quaternion(axis.x * s, axis.y * s, axis.z * s, c);
  }

  /**
   * The dot product between two rotations.
   * @param a - First quaternion
   * @param b - Second quaternion
   * @returns Dot product
   */
  public static Dot(a: Quaternion, b: Quaternion): number {
    return a.x * b.x + a.y * b.y + a.z * b.z + a.w * b.w;
  }

  /**
   * Returns a rotation that rotates z degrees around the z axis, x degrees around the x axis, and y degrees around the y axis.
   * @param x - Rotation around X axis in degrees
   * @param y - Rotation around Y axis in degrees
   * @param z - Rotation around Z axis in degrees
   * @returns Rotation quaternion
   */
  public static Euler(x: number, y: number, z: number): Quaternion;
  public static Euler(euler: Vector3): Quaternion;
  public static Euler(xOrEuler: number | Vector3, y?: number, z?: number): Quaternion {
    let ex: number, ey: number, ez: number;

    if (xOrEuler instanceof Vector3) {
      ex = xOrEuler.x;
      ey = xOrEuler.y;
      ez = xOrEuler.z;
    } else {
      ex = xOrEuler;
      ey = y!;
      ez = z!;
    }

    // Convert to radians and half angles
    const xRad = (ex * Math.PI) / 360.0;
    const yRad = (ey * Math.PI) / 360.0;
    const zRad = (ez * Math.PI) / 360.0;

    const sinX = Math.sin(xRad);
    const cosX = Math.cos(xRad);
    const sinY = Math.sin(yRad);
    const cosY = Math.cos(yRad);
    const sinZ = Math.sin(zRad);
    const cosZ = Math.cos(zRad);

    // ZXY rotation order (Unity's default)
    return new Quaternion(
      cosY * sinX * cosZ + sinY * cosX * sinZ,
      sinY * cosX * cosZ - cosY * sinX * sinZ,
      cosY * cosX * sinZ - sinY * sinX * cosZ,
      cosY * cosX * cosZ + sinY * sinX * sinZ
    );
  }

  /**
   * Creates a rotation with the specified forward and upwards directions.
   * @param forward - The direction to look in
   * @param upwards - The vector that defines which direction is up (default: Vector3.up)
   * @returns Rotation quaternion
   */
  public static LookRotation(forward: Vector3, upwards: Vector3 = Vector3.up): Quaternion {
    // Normalize forward
    const f = forward.normalized;
    if (f.sqrMagnitude < 0.000001) {
      return Quaternion.identity;
    }

    // Calculate right
    const r = Vector3.Cross(upwards, f).normalized;
    if (r.sqrMagnitude < 0.000001) {
      // Forward and up are parallel, choose arbitrary perpendicular
      return Quaternion.identity;
    }

    // Recalculate up
    const u = Vector3.Cross(f, r);

    // Build rotation matrix and convert to quaternion
    const m00 = r.x;
    const m01 = r.y;
    const m02 = r.z;
    const m10 = u.x;
    const m11 = u.y;
    const m12 = u.z;
    const m20 = f.x;
    const m21 = f.y;
    const m22 = f.z;

    const trace = m00 + m11 + m22;
    let qx: number, qy: number, qz: number, qw: number;

    if (trace > 0) {
      const s = Math.sqrt(trace + 1.0) * 2;
      qw = 0.25 * s;
      qx = (m21 - m12) / s;
      qy = (m02 - m20) / s;
      qz = (m10 - m01) / s;
    } else if (m00 > m11 && m00 > m22) {
      const s = Math.sqrt(1.0 + m00 - m11 - m22) * 2;
      qw = (m21 - m12) / s;
      qx = 0.25 * s;
      qy = (m01 + m10) / s;
      qz = (m02 + m20) / s;
    } else if (m11 > m22) {
      const s = Math.sqrt(1.0 + m11 - m00 - m22) * 2;
      qw = (m02 - m20) / s;
      qx = (m01 + m10) / s;
      qy = 0.25 * s;
      qz = (m12 + m21) / s;
    } else {
      const s = Math.sqrt(1.0 + m22 - m00 - m11) * 2;
      qw = (m10 - m01) / s;
      qx = (m02 + m20) / s;
      qy = (m12 + m21) / s;
      qz = 0.25 * s;
    }

    return new Quaternion(qx, qy, qz, qw);
  }

  /**
   * Interpolates between a and b by t and normalizes the result afterwards.
   * @param a - Start rotation
   * @param b - End rotation
   * @param t - Interpolation parameter (clamped to 0-1)
   * @returns Interpolated rotation
   */
  public static Lerp(a: Quaternion, b: Quaternion, t: number): Quaternion {
    t = Math.max(0, Math.min(1, t));
    return Quaternion.LerpUnclamped(a, b, t);
  }

  /**
   * Interpolates between a and b by t without clamping and normalizes the result.
   * @param a - Start rotation
   * @param b - End rotation
   * @param t - Interpolation parameter (not clamped)
   * @returns Interpolated rotation
   */
  public static LerpUnclamped(a: Quaternion, b: Quaternion, t: number): Quaternion {
    let dot = Quaternion.Dot(a, b);
    let bCopy = b.clone();

    // Ensure we take the shortest path
    if (dot < 0) {
      bCopy = new Quaternion(-b.x, -b.y, -b.z, -b.w);
      dot = -dot;
    }

    const result = new Quaternion(
      a.x + t * (bCopy.x - a.x),
      a.y + t * (bCopy.y - a.y),
      a.z + t * (bCopy.z - a.z),
      a.w + t * (bCopy.w - a.w)
    );

    return result.normalized;
  }

  /**
   * Spherically interpolates between a and b by t.
   * @param a - Start rotation
   * @param b - End rotation
   * @param t - Interpolation parameter (clamped to 0-1)
   * @returns Interpolated rotation
   */
  public static Slerp(a: Quaternion, b: Quaternion, t: number): Quaternion {
    t = Math.max(0, Math.min(1, t));
    return Quaternion.SlerpUnclamped(a, b, t);
  }

  /**
   * Spherically interpolates between a and b by t without clamping.
   * @param a - Start rotation
   * @param b - End rotation
   * @param t - Interpolation parameter (not clamped)
   * @returns Interpolated rotation
   */
  public static SlerpUnclamped(a: Quaternion, b: Quaternion, t: number): Quaternion {
    let dot = Quaternion.Dot(a, b);
    let bCopy = b.clone();

    // Ensure we take the shortest path
    if (dot < 0) {
      bCopy = new Quaternion(-b.x, -b.y, -b.z, -b.w);
      dot = -dot;
    }

    // Clamp dot to avoid numerical errors
    dot = Math.min(1, dot);

    const theta = Math.acos(dot);
    const sinTheta = Math.sin(theta);

    if (sinTheta < 0.001) {
      // Quaternions are very close, use linear interpolation
      return Quaternion.LerpUnclamped(a, b, t);
    }

    const wa = Math.sin((1 - t) * theta) / sinTheta;
    const wb = Math.sin(t * theta) / sinTheta;

    return new Quaternion(
      wa * a.x + wb * bCopy.x,
      wa * a.y + wb * bCopy.y,
      wa * a.z + wb * bCopy.z,
      wa * a.w + wb * bCopy.w
    );
  }

  /**
   * Rotates a rotation from towards to by maxDegreesDelta.
   * @param from - Start rotation
   * @param to - Target rotation
   * @param maxDegreesDelta - Maximum rotation in degrees
   * @returns Rotated quaternion
   */
  public static RotateTowards(
    from: Quaternion,
    to: Quaternion,
    maxDegreesDelta: number
  ): Quaternion {
    const angle = Quaternion.Angle(from, to);
    if (angle === 0) {
      return to;
    }
    const t = Math.min(1, maxDegreesDelta / angle);
    return Quaternion.SlerpUnclamped(from, to, t);
  }

  /**
   * Returns the Inverse of rotation.
   * @param rotation - Rotation to invert
   * @returns Inverted rotation
   */
  public static Inverse(rotation: Quaternion): Quaternion {
    const normSq = rotation.x * rotation.x + rotation.y * rotation.y +
                   rotation.z * rotation.z + rotation.w * rotation.w;
    if (normSq < 0.000001) {
      return Quaternion.identity;
    }
    const invNormSq = 1.0 / normSq;
    return new Quaternion(
      -rotation.x * invNormSq,
      -rotation.y * invNormSq,
      -rotation.z * invNormSq,
      rotation.w * invNormSq
    );
  }

  /**
   * Creates a rotation from one direction to another.
   * @param fromDirection - Source direction
   * @param toDirection - Target direction
   * @returns Rotation quaternion
   */
  public static FromToRotation(fromDirection: Vector3, toDirection: Vector3): Quaternion {
    const from = fromDirection.normalized;
    const to = toDirection.normalized;

    const dot = Vector3.Dot(from, to);

    // Vectors are parallel
    if (dot >= 0.999999) {
      return Quaternion.identity;
    }

    // Vectors are opposite
    if (dot <= -0.999999) {
      // Find perpendicular axis
      let axis = Vector3.Cross(Vector3.right, from);
      if (axis.sqrMagnitude < 0.000001) {
        axis = Vector3.Cross(Vector3.up, from);
      }
      axis.Normalize();
      return Quaternion.AngleAxis(180, axis);
    }

    const axis = Vector3.Cross(from, to);
    const s = Math.sqrt((1 + dot) * 2);
    const invS = 1 / s;

    return new Quaternion(axis.x * invS, axis.y * invS, axis.z * invS, s * 0.5);
  }

  /**
   * Combines rotations lhs and rhs.
   * @param lhs - Left rotation
   * @param rhs - Right rotation
   * @returns Combined rotation (lhs * rhs)
   */
  public static Multiply(lhs: Quaternion, rhs: Quaternion): Quaternion {
    return new Quaternion(
      lhs.w * rhs.x + lhs.x * rhs.w + lhs.y * rhs.z - lhs.z * rhs.y,
      lhs.w * rhs.y + lhs.y * rhs.w + lhs.z * rhs.x - lhs.x * rhs.z,
      lhs.w * rhs.z + lhs.z * rhs.w + lhs.x * rhs.y - lhs.y * rhs.x,
      lhs.w * rhs.w - lhs.x * rhs.x - lhs.y * rhs.y - lhs.z * rhs.z
    );
  }

  // ==================== Instance Properties ====================

  /**
   * Returns the euler angle representation of the rotation in degrees.
   */
  public get eulerAngles(): Vector3 {
    // Convert quaternion to Euler angles (ZXY order)
    const sinrCosp = 2 * (this.w * this.x + this.y * this.z);
    const cosrCosp = 1 - 2 * (this.x * this.x + this.y * this.y);
    const roll = Math.atan2(sinrCosp, cosrCosp);

    const sinp = 2 * (this.w * this.y - this.z * this.x);
    let pitch: number;
    if (Math.abs(sinp) >= 1) {
      pitch = (Math.PI / 2) * Math.sign(sinp);
    } else {
      pitch = Math.asin(sinp);
    }

    const sinyCosp = 2 * (this.w * this.z + this.x * this.y);
    const cosyCosp = 1 - 2 * (this.y * this.y + this.z * this.z);
    const yaw = Math.atan2(sinyCosp, cosyCosp);

    // Convert to degrees
    return new Vector3(
      (roll * 180) / Math.PI,
      (pitch * 180) / Math.PI,
      (yaw * 180) / Math.PI
    );
  }

  /**
   * Set euler angles in degrees.
   */
  public set eulerAngles(value: Vector3) {
    const q = Quaternion.Euler(value);
    this.x = q.x;
    this.y = q.y;
    this.z = q.z;
    this.w = q.w;
  }

  /**
   * Returns this quaternion with a magnitude of 1 (Read Only).
   */
  public get normalized(): Quaternion {
    const mag = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
    if (mag < 0.000001) {
      return Quaternion.identity;
    }
    return new Quaternion(this.x / mag, this.y / mag, this.z / mag, this.w / mag);
  }

  // ==================== Instance Methods ====================

  /**
   * Set x, y, z and w components of an existing Quaternion.
   */
  public Set(x: number, y: number, z: number, w: number): void {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }

  /**
   * Set the quaternion to the angle-axis representation of a rotation.
   * @param angle - Rotation angle in degrees
   * @param axis - Rotation axis
   */
  public SetFromToRotation(fromDirection: Vector3, toDirection: Vector3): void {
    const q = Quaternion.FromToRotation(fromDirection, toDirection);
    this.x = q.x;
    this.y = q.y;
    this.z = q.z;
    this.w = q.w;
  }

  /**
   * Creates a rotation with the specified forward and upwards directions.
   */
  public SetLookRotation(view: Vector3, up: Vector3 = Vector3.up): void {
    const q = Quaternion.LookRotation(view, up);
    this.x = q.x;
    this.y = q.y;
    this.z = q.z;
    this.w = q.w;
  }

  /**
   * Converts this quaternion to one with the same orientation but with a magnitude of 1.
   */
  public Normalize(): void {
    const mag = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
    if (mag < 0.000001) {
      this.Set(0, 0, 0, 1);
    } else {
      this.x /= mag;
      this.y /= mag;
      this.z /= mag;
      this.w /= mag;
    }
  }

  /**
   * Rotates a vector by this rotation.
   * @param vector - Vector to rotate
   * @returns Rotated vector
   */
  public MultiplyVector(vector: Vector3): Vector3 {
    const num = this.x * 2;
    const num2 = this.y * 2;
    const num3 = this.z * 2;
    const num4 = this.x * num;
    const num5 = this.y * num2;
    const num6 = this.z * num3;
    const num7 = this.x * num2;
    const num8 = this.x * num3;
    const num9 = this.y * num3;
    const num10 = this.w * num;
    const num11 = this.w * num2;
    const num12 = this.w * num3;

    return new Vector3(
      (1 - (num5 + num6)) * vector.x + (num7 - num12) * vector.y + (num8 + num11) * vector.z,
      (num7 + num12) * vector.x + (1 - (num4 + num6)) * vector.y + (num9 - num10) * vector.z,
      (num8 - num11) * vector.x + (num9 + num10) * vector.y + (1 - (num4 + num5)) * vector.z
    );
  }

  // ==================== Utility Methods ====================

  /**
   * Returns a formatted string for this quaternion.
   * @param format - Optional number of decimal places (default: 2)
   */
  public toString(format: number = 2): string {
    return `(${this.x.toFixed(format)}, ${this.y.toFixed(format)}, ${this.z.toFixed(format)}, ${this.w.toFixed(format)})`;
  }

  /**
   * Creates a copy of this quaternion.
   */
  public clone(): Quaternion {
    return new Quaternion(this.x, this.y, this.z, this.w);
  }

  /**
   * Returns true if the quaternions are equal.
   */
  public equals(other: Quaternion): boolean {
    return this.x === other.x && this.y === other.y && this.z === other.z && this.w === other.w;
  }

  /**
   * Returns true if quaternions are approximately equal.
   */
  public approximatelyEquals(other: Quaternion, tolerance: number = 1e-5): boolean {
    return (
      Math.abs(this.x - other.x) < tolerance &&
      Math.abs(this.y - other.y) < tolerance &&
      Math.abs(this.z - other.z) < tolerance &&
      Math.abs(this.w - other.w) < tolerance
    );
  }

  // ==================== Static Constants ====================

  /**
   * The identity rotation (Read Only).
   */
  public static get identity(): Quaternion {
    return new Quaternion(0, 0, 0, 1);
  }

  // ==================== Serialization ====================

  /**
   * Serializes this Quaternion to JSON.
   * @returns Object with x, y, z, w components
   */
  public toJSON(): { x: number; y: number; z: number; w: number } {
    return { x: this.x, y: this.y, z: this.z, w: this.w };
  }

  /**
   * Deserializes a Quaternion from JSON.
   * @param json - Object with x, y, z, w components
   * @returns Quaternion instance
   */
  public static fromJSON(json: {
    x: number;
    y: number;
    z: number;
    w: number;
  }): Quaternion {
    return new Quaternion(json.x, json.y, json.z, json.w);
  }
}
