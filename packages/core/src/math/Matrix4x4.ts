import { Vector3 } from './Vector3';
import { Vector4 } from './Vector4';
import { Quaternion } from './Quaternion';

/**
 * A standard 4x4 transformation matrix.
 *
 * In Unity, several Transform, Camera, Material, Graphics and GL functions use Matrix4x4.
 * Matrices in Unity are column major; i.e. the position of a transformation matrix is in the last column,
 * and the first three columns contain x, y, and z-axes.
 *
 * @example
 * ```typescript
 * const m = Matrix4x4.TRS(
 *   new Vector3(0, 3, 0),
 *   Quaternion.identity,
 *   Vector3.one
 * );
 * ```
 */
export class Matrix4x4 {
  // Matrix elements (column-major order)
  public m00: number; public m01: number; public m02: number; public m03: number;
  public m10: number; public m11: number; public m12: number; public m13: number;
  public m20: number; public m21: number; public m22: number; public m23: number;
  public m30: number; public m31: number; public m32: number; public m33: number;

  /**
   * Creates a new identity matrix.
   */
  constructor() {
    this.m00 = 1; this.m01 = 0; this.m02 = 0; this.m03 = 0;
    this.m10 = 0; this.m11 = 1; this.m12 = 0; this.m13 = 0;
    this.m20 = 0; this.m21 = 0; this.m22 = 1; this.m23 = 0;
    this.m30 = 0; this.m31 = 0; this.m32 = 0; this.m33 = 1;
  }

  // ==================== Static Constructors ====================

  /**
   * Returns the identity matrix (Read Only).
   */
  public static get identity(): Matrix4x4 {
    return new Matrix4x4();
  }

  /**
   * Returns a matrix with all elements set to zero (Read Only).
   */
  public static get zero(): Matrix4x4 {
    const m = new Matrix4x4();
    m.m00 = 0; m.m11 = 0; m.m22 = 0; m.m33 = 0;
    return m;
  }

  /**
   * Creates a translation matrix.
   * @param vector - Translation vector
   * @returns Translation matrix
   */
  public static Translate(vector: Vector3): Matrix4x4 {
    const m = Matrix4x4.identity;
    m.m03 = vector.x;
    m.m13 = vector.y;
    m.m23 = vector.z;
    return m;
  }

  /**
   * Creates a rotation matrix.
   * @param q - Rotation quaternion
   * @returns Rotation matrix
   */
  public static Rotate(q: Quaternion): Matrix4x4 {
    const m = new Matrix4x4();

    const xx = q.x * q.x;
    const yy = q.y * q.y;
    const zz = q.z * q.z;
    const xy = q.x * q.y;
    const xz = q.x * q.z;
    const yz = q.y * q.z;
    const wx = q.w * q.x;
    const wy = q.w * q.y;
    const wz = q.w * q.z;

    m.m00 = 1 - 2 * (yy + zz);
    m.m10 = 2 * (xy + wz);
    m.m20 = 2 * (xz - wy);

    m.m01 = 2 * (xy - wz);
    m.m11 = 1 - 2 * (xx + zz);
    m.m21 = 2 * (yz + wx);

    m.m02 = 2 * (xz + wy);
    m.m12 = 2 * (yz - wx);
    m.m22 = 1 - 2 * (xx + yy);

    m.m03 = 0;
    m.m13 = 0;
    m.m23 = 0;
    m.m30 = 0;
    m.m31 = 0;
    m.m32 = 0;
    m.m33 = 1;

    return m;
  }

  /**
   * Creates a scaling matrix.
   * @param vector - Scale vector
   * @returns Scaling matrix
   */
  public static Scale(vector: Vector3): Matrix4x4 {
    const m = new Matrix4x4();
    m.m00 = vector.x;
    m.m11 = vector.y;
    m.m22 = vector.z;
    return m;
  }

  /**
   * Creates a translation, rotation and scaling matrix.
   * @param pos - Translation
   * @param q - Rotation
   * @param s - Scale
   * @returns TRS matrix
   */
  public static TRS(pos: Vector3, q: Quaternion, s: Vector3): Matrix4x4 {
    const m = Matrix4x4.Rotate(q);

    // Apply scale
    m.m00 *= s.x; m.m01 *= s.y; m.m02 *= s.z;
    m.m10 *= s.x; m.m11 *= s.y; m.m12 *= s.z;
    m.m20 *= s.x; m.m21 *= s.y; m.m22 *= s.z;

    // Apply translation
    m.m03 = pos.x;
    m.m13 = pos.y;
    m.m23 = pos.z;

    return m;
  }

  /**
   * Creates an orthogonal projection matrix.
   * @param left - Left plane
   * @param right - Right plane
   * @param bottom - Bottom plane
   * @param top - Top plane
   * @param zNear - Near plane
   * @param zFar - Far plane
   * @returns Orthogonal projection matrix
   */
  public static Ortho(
    left: number,
    right: number,
    bottom: number,
    top: number,
    zNear: number,
    zFar: number
  ): Matrix4x4 {
    const m = new Matrix4x4();

    m.m00 = 2 / (right - left);
    m.m11 = 2 / (top - bottom);
    m.m22 = -2 / (zFar - zNear);
    m.m03 = -(right + left) / (right - left);
    m.m13 = -(top + bottom) / (top - bottom);
    m.m23 = -(zFar + zNear) / (zFar - zNear);

    return m;
  }

  /**
   * Creates a perspective projection matrix.
   * @param fov - Field of view in degrees
   * @param aspect - Aspect ratio
   * @param zNear - Near plane
   * @param zFar - Far plane
   * @returns Perspective projection matrix
   */
  public static Perspective(fov: number, aspect: number, zNear: number, zFar: number): Matrix4x4 {
    const m = new Matrix4x4();

    const yScale = 1.0 / Math.tan((fov * Math.PI) / 360.0);
    const xScale = yScale / aspect;

    m.m00 = xScale;
    m.m11 = yScale;
    m.m22 = -(zFar + zNear) / (zFar - zNear);
    m.m23 = -(2 * zFar * zNear) / (zFar - zNear);
    m.m32 = -1;
    m.m33 = 0;

    return m;
  }

  /**
   * Creates a "look at" matrix.
   * @param from - Camera position
   * @param to - Target position
   * @param up - Up vector
   * @returns Look at matrix
   */
  public static LookAt(from: Vector3, to: Vector3, up: Vector3): Matrix4x4 {
    const z = Vector3.Subtract(from, to).normalized;
    const x = Vector3.Cross(up, z).normalized;
    const y = Vector3.Cross(z, x);

    const m = new Matrix4x4();
    m.m00 = x.x; m.m01 = y.x; m.m02 = z.x; m.m03 = from.x;
    m.m10 = x.y; m.m11 = y.y; m.m12 = z.y; m.m13 = from.y;
    m.m20 = x.z; m.m21 = y.z; m.m22 = z.z; m.m23 = from.z;
    m.m30 = 0;   m.m31 = 0;   m.m32 = 0;   m.m33 = 1;

    return m;
  }

  // ==================== Matrix Operations ====================

  /**
   * Multiplies two matrices.
   * @param lhs - Left matrix
   * @param rhs - Right matrix
   * @returns Product matrix
   */
  public static Multiply(lhs: Matrix4x4, rhs: Matrix4x4): Matrix4x4 {
    const m = new Matrix4x4();

    m.m00 = lhs.m00 * rhs.m00 + lhs.m01 * rhs.m10 + lhs.m02 * rhs.m20 + lhs.m03 * rhs.m30;
    m.m01 = lhs.m00 * rhs.m01 + lhs.m01 * rhs.m11 + lhs.m02 * rhs.m21 + lhs.m03 * rhs.m31;
    m.m02 = lhs.m00 * rhs.m02 + lhs.m01 * rhs.m12 + lhs.m02 * rhs.m22 + lhs.m03 * rhs.m32;
    m.m03 = lhs.m00 * rhs.m03 + lhs.m01 * rhs.m13 + lhs.m02 * rhs.m23 + lhs.m03 * rhs.m33;

    m.m10 = lhs.m10 * rhs.m00 + lhs.m11 * rhs.m10 + lhs.m12 * rhs.m20 + lhs.m13 * rhs.m30;
    m.m11 = lhs.m10 * rhs.m01 + lhs.m11 * rhs.m11 + lhs.m12 * rhs.m21 + lhs.m13 * rhs.m31;
    m.m12 = lhs.m10 * rhs.m02 + lhs.m11 * rhs.m12 + lhs.m12 * rhs.m22 + lhs.m13 * rhs.m32;
    m.m13 = lhs.m10 * rhs.m03 + lhs.m11 * rhs.m13 + lhs.m12 * rhs.m23 + lhs.m13 * rhs.m33;

    m.m20 = lhs.m20 * rhs.m00 + lhs.m21 * rhs.m10 + lhs.m22 * rhs.m20 + lhs.m23 * rhs.m30;
    m.m21 = lhs.m20 * rhs.m01 + lhs.m21 * rhs.m11 + lhs.m22 * rhs.m21 + lhs.m23 * rhs.m31;
    m.m22 = lhs.m20 * rhs.m02 + lhs.m21 * rhs.m12 + lhs.m22 * rhs.m22 + lhs.m23 * rhs.m32;
    m.m23 = lhs.m20 * rhs.m03 + lhs.m21 * rhs.m13 + lhs.m22 * rhs.m23 + lhs.m23 * rhs.m33;

    m.m30 = lhs.m30 * rhs.m00 + lhs.m31 * rhs.m10 + lhs.m32 * rhs.m20 + lhs.m33 * rhs.m30;
    m.m31 = lhs.m30 * rhs.m01 + lhs.m31 * rhs.m11 + lhs.m32 * rhs.m21 + lhs.m33 * rhs.m31;
    m.m32 = lhs.m30 * rhs.m02 + lhs.m31 * rhs.m12 + lhs.m32 * rhs.m22 + lhs.m33 * rhs.m32;
    m.m33 = lhs.m30 * rhs.m03 + lhs.m31 * rhs.m13 + lhs.m32 * rhs.m23 + lhs.m33 * rhs.m33;

    return m;
  }

  /**
   * Returns the transpose of this matrix.
   */
  public get transpose(): Matrix4x4 {
    const m = new Matrix4x4();
    m.m00 = this.m00; m.m01 = this.m10; m.m02 = this.m20; m.m03 = this.m30;
    m.m10 = this.m01; m.m11 = this.m11; m.m12 = this.m21; m.m13 = this.m31;
    m.m20 = this.m02; m.m21 = this.m12; m.m22 = this.m22; m.m23 = this.m32;
    m.m30 = this.m03; m.m31 = this.m13; m.m32 = this.m23; m.m33 = this.m33;
    return m;
  }

  /**
   * The determinant of the matrix.
   */
  public get determinant(): number {
    // Calculate 2x2 subdeterminants
    const a = this.m00 * this.m11 - this.m01 * this.m10;
    const b = this.m00 * this.m12 - this.m02 * this.m10;
    const c = this.m00 * this.m13 - this.m03 * this.m10;
    const d = this.m01 * this.m12 - this.m02 * this.m11;
    const e = this.m01 * this.m13 - this.m03 * this.m11;
    const f = this.m02 * this.m13 - this.m03 * this.m12;
    const g = this.m20 * this.m31 - this.m21 * this.m30;
    const h = this.m20 * this.m32 - this.m22 * this.m30;
    const i = this.m20 * this.m33 - this.m23 * this.m30;
    const j = this.m21 * this.m32 - this.m22 * this.m31;
    const k = this.m21 * this.m33 - this.m23 * this.m31;
    const l = this.m22 * this.m33 - this.m23 * this.m32;

    return a * l - b * k + c * j + d * i - e * h + f * g;
  }

  /**
   * The inverse of this matrix (Read Only).
   */
  public get inverse(): Matrix4x4 {
    const det = this.determinant;
    if (Math.abs(det) < 1e-10) {
      return Matrix4x4.zero;
    }

    const m = new Matrix4x4();
    const invDet = 1.0 / det;

    m.m00 = (this.m11 * this.m22 * this.m33 - this.m11 * this.m23 * this.m32 - this.m21 * this.m12 * this.m33 + this.m21 * this.m13 * this.m32 + this.m31 * this.m12 * this.m23 - this.m31 * this.m13 * this.m22) * invDet;
    m.m01 = (-this.m01 * this.m22 * this.m33 + this.m01 * this.m23 * this.m32 + this.m21 * this.m02 * this.m33 - this.m21 * this.m03 * this.m32 - this.m31 * this.m02 * this.m23 + this.m31 * this.m03 * this.m22) * invDet;
    m.m02 = (this.m01 * this.m12 * this.m33 - this.m01 * this.m13 * this.m32 - this.m11 * this.m02 * this.m33 + this.m11 * this.m03 * this.m32 + this.m31 * this.m02 * this.m13 - this.m31 * this.m03 * this.m12) * invDet;
    m.m03 = (-this.m01 * this.m12 * this.m23 + this.m01 * this.m13 * this.m22 + this.m11 * this.m02 * this.m23 - this.m11 * this.m03 * this.m22 - this.m21 * this.m02 * this.m13 + this.m21 * this.m03 * this.m12) * invDet;

    m.m10 = (-this.m10 * this.m22 * this.m33 + this.m10 * this.m23 * this.m32 + this.m20 * this.m12 * this.m33 - this.m20 * this.m13 * this.m32 - this.m30 * this.m12 * this.m23 + this.m30 * this.m13 * this.m22) * invDet;
    m.m11 = (this.m00 * this.m22 * this.m33 - this.m00 * this.m23 * this.m32 - this.m20 * this.m02 * this.m33 + this.m20 * this.m03 * this.m32 + this.m30 * this.m02 * this.m23 - this.m30 * this.m03 * this.m22) * invDet;
    m.m12 = (-this.m00 * this.m12 * this.m33 + this.m00 * this.m13 * this.m32 + this.m10 * this.m02 * this.m33 - this.m10 * this.m03 * this.m32 - this.m30 * this.m02 * this.m13 + this.m30 * this.m03 * this.m12) * invDet;
    m.m13 = (this.m00 * this.m12 * this.m23 - this.m00 * this.m13 * this.m22 - this.m10 * this.m02 * this.m23 + this.m10 * this.m03 * this.m22 + this.m20 * this.m02 * this.m13 - this.m20 * this.m03 * this.m12) * invDet;

    m.m20 = (this.m10 * this.m21 * this.m33 - this.m10 * this.m23 * this.m31 - this.m20 * this.m11 * this.m33 + this.m20 * this.m13 * this.m31 + this.m30 * this.m11 * this.m23 - this.m30 * this.m13 * this.m21) * invDet;
    m.m21 = (-this.m00 * this.m21 * this.m33 + this.m00 * this.m23 * this.m31 + this.m20 * this.m01 * this.m33 - this.m20 * this.m03 * this.m31 - this.m30 * this.m01 * this.m23 + this.m30 * this.m03 * this.m21) * invDet;
    m.m22 = (this.m00 * this.m11 * this.m33 - this.m00 * this.m13 * this.m31 - this.m10 * this.m01 * this.m33 + this.m10 * this.m03 * this.m31 + this.m30 * this.m01 * this.m13 - this.m30 * this.m03 * this.m11) * invDet;
    m.m23 = (-this.m00 * this.m11 * this.m23 + this.m00 * this.m13 * this.m21 + this.m10 * this.m01 * this.m23 - this.m10 * this.m03 * this.m21 - this.m20 * this.m01 * this.m13 + this.m20 * this.m03 * this.m11) * invDet;

    m.m30 = (-this.m10 * this.m21 * this.m32 + this.m10 * this.m22 * this.m31 + this.m20 * this.m11 * this.m32 - this.m20 * this.m12 * this.m31 - this.m30 * this.m11 * this.m22 + this.m30 * this.m12 * this.m21) * invDet;
    m.m31 = (this.m00 * this.m21 * this.m32 - this.m00 * this.m22 * this.m31 - this.m20 * this.m01 * this.m32 + this.m20 * this.m02 * this.m31 + this.m30 * this.m01 * this.m22 - this.m30 * this.m02 * this.m21) * invDet;
    m.m32 = (-this.m00 * this.m11 * this.m32 + this.m00 * this.m12 * this.m31 + this.m10 * this.m01 * this.m32 - this.m10 * this.m02 * this.m31 - this.m30 * this.m01 * this.m12 + this.m30 * this.m02 * this.m11) * invDet;
    m.m33 = (this.m00 * this.m11 * this.m22 - this.m00 * this.m12 * this.m21 - this.m10 * this.m01 * this.m22 + this.m10 * this.m02 * this.m21 + this.m20 * this.m01 * this.m12 - this.m20 * this.m02 * this.m11) * invDet;

    return m;
  }

  // ==================== Vector Transformation ====================

  /**
   * Transforms a position by this matrix (generic point).
   * @param point - Point to transform
   * @returns Transformed point
   */
  public MultiplyPoint(point: Vector3): Vector3 {
    const x = this.m00 * point.x + this.m01 * point.y + this.m02 * point.z + this.m03;
    const y = this.m10 * point.x + this.m11 * point.y + this.m12 * point.z + this.m13;
    const z = this.m20 * point.x + this.m21 * point.y + this.m22 * point.z + this.m23;
    const w = this.m30 * point.x + this.m31 * point.y + this.m32 * point.z + this.m33;

    // Perspective divide
    if (w !== 1 && w !== 0) {
      return new Vector3(x / w, y / w, z / w);
    }
    return new Vector3(x, y, z);
  }

  /**
   * Transforms a position by this matrix (fast).
   * @param point - Point to transform
   * @returns Transformed point
   */
  public MultiplyPoint3x4(point: Vector3): Vector3 {
    return new Vector3(
      this.m00 * point.x + this.m01 * point.y + this.m02 * point.z + this.m03,
      this.m10 * point.x + this.m11 * point.y + this.m12 * point.z + this.m13,
      this.m20 * point.x + this.m21 * point.y + this.m22 * point.z + this.m23
    );
  }

  /**
   * Transforms a direction by this matrix.
   * @param vector - Direction to transform
   * @returns Transformed direction
   */
  public MultiplyVector(vector: Vector3): Vector3 {
    return new Vector3(
      this.m00 * vector.x + this.m01 * vector.y + this.m02 * vector.z,
      this.m10 * vector.x + this.m11 * vector.y + this.m12 * vector.z,
      this.m20 * vector.x + this.m21 * vector.y + this.m22 * vector.z
    );
  }

  // ==================== Utility Methods ====================

  /**
   * Get a column of the matrix.
   * @param index - Column index (0-3)
   * @returns Column as Vector4
   */
  public GetColumn(index: number): Vector4 {
    switch (index) {
      case 0: return new Vector4(this.m00, this.m10, this.m20, this.m30);
      case 1: return new Vector4(this.m01, this.m11, this.m21, this.m31);
      case 2: return new Vector4(this.m02, this.m12, this.m22, this.m32);
      case 3: return new Vector4(this.m03, this.m13, this.m23, this.m33);
      default: throw new Error('Index out of range');
    }
  }

  /**
   * Get a row of the matrix.
   * @param index - Row index (0-3)
   * @returns Row as Vector4
   */
  public GetRow(index: number): Vector4 {
    switch (index) {
      case 0: return new Vector4(this.m00, this.m01, this.m02, this.m03);
      case 1: return new Vector4(this.m10, this.m11, this.m12, this.m13);
      case 2: return new Vector4(this.m20, this.m21, this.m22, this.m23);
      case 3: return new Vector4(this.m30, this.m31, this.m32, this.m33);
      default: throw new Error('Index out of range');
    }
  }

  /**
   * Returns a formatted string for this matrix.
   */
  public toString(): string {
    return `${this.m00.toFixed(5)}\t${this.m01.toFixed(5)}\t${this.m02.toFixed(5)}\t${this.m03.toFixed(5)}\n` +
           `${this.m10.toFixed(5)}\t${this.m11.toFixed(5)}\t${this.m12.toFixed(5)}\t${this.m13.toFixed(5)}\n` +
           `${this.m20.toFixed(5)}\t${this.m21.toFixed(5)}\t${this.m22.toFixed(5)}\t${this.m23.toFixed(5)}\n` +
           `${this.m30.toFixed(5)}\t${this.m31.toFixed(5)}\t${this.m32.toFixed(5)}\t${this.m33.toFixed(5)}`;
  }
}
