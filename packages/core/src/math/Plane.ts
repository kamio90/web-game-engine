import { Vector3 } from './Vector3';
import { Ray } from './Ray';

/**
 * Representation of a plane in 3D space.
 *
 * A plane is defined by a normal vector and a distance from the origin.
 * The plane equation is: normal.x * x + normal.y * y + normal.z * z + distance = 0
 *
 * @example
 * ```typescript
 * const plane = new Plane(Vector3.up, 0); // XZ plane at origin
 * const distance = plane.GetDistanceToPoint(new Vector3(0, 5, 0)); // 5
 * ```
 */
export class Plane {
  private _normal: Vector3;
  private _distance: number;

  /**
   * Creates a new plane.
   * @param inNormal - Normal vector of the plane
   * @param inPoint - A point that lies on the plane
   */
  constructor(inNormal: Vector3, inPoint: Vector3);
  /**
   * Creates a new plane.
   * @param inNormal - Normal vector of the plane
   * @param d - Distance from origin along the normal
   */
  constructor(inNormal: Vector3, d: number);
  /**
   * Creates a new plane.
   * @param a - First point on the plane
   * @param b - Second point on the plane
   * @param c - Third point on the plane
   */
  constructor(a: Vector3, b: Vector3, c: Vector3);
  constructor(
    inNormalOrA: Vector3 = Vector3.up,
    inPointOrDOrB: Vector3 | number = 0,
    c?: Vector3
  ) {
    // Initialize with defaults to satisfy TypeScript
    this._normal = Vector3.up;
    this._distance = 0;

    if (c !== undefined) {
      // Three-point constructor
      this.Set3Points(inNormalOrA, inPointOrDOrB as Vector3, c);
    } else if (typeof inPointOrDOrB === 'number') {
      // Normal and distance constructor
      this._normal = inNormalOrA.normalized;
      this._distance = inPointOrDOrB;
    } else {
      // Normal and point constructor
      this._normal = inNormalOrA.normalized;
      this._distance = -Vector3.Dot(this._normal, inPointOrDOrB);
    }
  }

  // ==================== Properties ====================

  /**
   * Normal vector of the plane.
   */
  public get normal(): Vector3 {
    return this._normal;
  }

  public set normal(value: Vector3) {
    this._normal = value.normalized;
  }

  /**
   * Distance from the origin to the plane along the normal.
   */
  public get distance(): number {
    return this._distance;
  }

  public set distance(value: number) {
    this._distance = value;
  }

  /**
   * Returns a copy of the plane that faces in the opposite direction.
   */
  public get flipped(): Plane {
    return new Plane(Vector3.Scale(this._normal, -1), -this._distance);
  }

  // ==================== Methods ====================

  /**
   * Sets a plane using three points that lie within it.
   * @param a - First point
   * @param b - Second point
   * @param c - Third point
   */
  public Set3Points(a: Vector3, b: Vector3, c: Vector3): void {
    // Calculate normal from cross product (order matters for direction)
    const ab = Vector3.Subtract(b, a);
    const ac = Vector3.Subtract(c, a);
    this._normal = Vector3.Cross(ac, ab).normalized;
    this._distance = -Vector3.Dot(this._normal, a);
  }

  /**
   * Sets a plane using a normal and a point that lies on the plane.
   * @param inNormal - Normal vector
   * @param inPoint - Point on the plane
   */
  public SetNormalAndPosition(inNormal: Vector3, inPoint: Vector3): void {
    this._normal = inNormal.normalized;
    this._distance = -Vector3.Dot(this._normal, inPoint);
  }

  /**
   * Makes the plane face in the opposite direction.
   */
  public Flip(): void {
    this._normal = Vector3.Scale(this._normal, -1);
    this._distance = -this._distance;
  }

  /**
   * Translates the plane into a given direction.
   * @param translation - Translation vector
   */
  public Translate(translation: Vector3): void {
    this._distance -= Vector3.Dot(this._normal, translation);
  }

  /**
   * Returns a copy of the given plane that is moved in a given direction.
   * @param plane - Plane to translate
   * @param translation - Translation vector
   * @returns Translated plane
   */
  public static Translate(plane: Plane, translation: Vector3): Plane {
    const newPlane = new Plane(plane.normal, plane.distance);
    newPlane.Translate(translation);
    return newPlane;
  }

  /**
   * Returns the closest point on the plane to a given point.
   * @param point - Point in space
   * @returns Closest point on plane
   */
  public ClosestPointOnPlane(point: Vector3): Vector3 {
    const pointToPlaneDistance = Vector3.Dot(this._normal, point) + this._distance;
    return Vector3.Subtract(point, Vector3.Scale(this._normal, pointToPlaneDistance));
  }

  /**
   * Returns a signed distance from plane to point.
   * @param point - Point in space
   * @returns Signed distance (positive if on normal side, negative if opposite)
   */
  public GetDistanceToPoint(point: Vector3): number {
    return Vector3.Dot(this._normal, point) + this._distance;
  }

  /**
   * Is a point on the positive side of the plane?
   * @param point - Point to test
   * @returns True if on positive side (same side as normal)
   */
  public GetSide(point: Vector3): boolean {
    return this.GetDistanceToPoint(point) > 0;
  }

  /**
   * Are two points on the same side of the plane?
   * @param inPt0 - First point
   * @param inPt1 - Second point
   * @returns True if both points are on the same side
   */
  public SameSide(inPt0: Vector3, inPt1: Vector3): boolean {
    const d0 = this.GetDistanceToPoint(inPt0);
    const d1 = this.GetDistanceToPoint(inPt1);
    return (d0 > 0 && d1 > 0) || (d0 <= 0 && d1 <= 0);
  }

  /**
   * Casts a ray against the plane.
   * @param ray - Ray to test
   * @returns Distance along ray to intersection, or undefined if no intersection
   */
  public Raycast(ray: Ray): number | undefined {
    const vdot = Vector3.Dot(ray.direction, this._normal);

    // Ray is parallel to plane
    if (Math.abs(vdot) < 1e-10) {
      return undefined;
    }

    const ndot = -Vector3.Dot(ray.origin, this._normal) - this._distance;
    const distance = ndot / vdot;

    // Intersection is behind ray origin
    if (distance < 0) {
      return undefined;
    }

    return distance;
  }

  /**
   * Returns a formatted string for this plane.
   * @param format - Optional format string (not implemented)
   * @returns Formatted string
   */
  public toString(_format?: string): string {
    return `(normal:${this._normal.toString()}, distance:${this._distance.toFixed(5)})`;
  }
}
