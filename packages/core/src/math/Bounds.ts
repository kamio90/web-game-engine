import { Vector3 } from './Vector3';

/**
 * Represents an axis-aligned bounding box (AABB).
 *
 * An axis-aligned bounding box, or AABB for short, is a box aligned with coordinate axes and
 * fully enclosing some object. Because the box is never rotated with respect to the axes, it can
 * be defined by just its center and extents, or alternatively by min and max points.
 *
 * @example
 * ```typescript
 * const bounds = new Bounds(new Vector3(0, 0, 0), new Vector3(1, 1, 1));
 * const contains = bounds.Contains(new Vector3(0.5, 0.5, 0.5)); // true
 * ```
 */
export class Bounds {
  private _center: Vector3;
  private _extents: Vector3;

  /**
   * Creates a new Bounds.
   * @param center - The center of the bounding box
   * @param size - The size of the bounding box (full width, height, depth)
   */
  constructor(center: Vector3 = Vector3.zero, size: Vector3 = Vector3.zero) {
    this._center = center;
    this._extents = Vector3.Scale(size, 0.5);
  }

  // ==================== Properties ====================

  /**
   * The center of the bounding box.
   */
  public get center(): Vector3 {
    return this._center;
  }

  public set center(value: Vector3) {
    this._center = value;
  }

  /**
   * The total size of the box. This is always twice as large as the extents.
   */
  public get size(): Vector3 {
    return Vector3.Scale(this._extents, 2);
  }

  public set size(value: Vector3) {
    this._extents = Vector3.Scale(value, 0.5);
  }

  /**
   * The extents of the Bounding Box. This is always half of the size of the Bounds.
   */
  public get extents(): Vector3 {
    return this._extents;
  }

  public set extents(value: Vector3) {
    this._extents = value;
  }

  /**
   * The minimal point of the box. This is always equal to center-extents.
   */
  public get min(): Vector3 {
    return Vector3.Subtract(this._center, this._extents);
  }

  public set min(value: Vector3) {
    this.SetMinMax(value, this.max);
  }

  /**
   * The maximal point of the box. This is always equal to center+extents.
   */
  public get max(): Vector3 {
    return Vector3.Add(this._center, this._extents);
  }

  public set max(value: Vector3) {
    this.SetMinMax(this.min, value);
  }

  // ==================== Methods ====================

  /**
   * Sets the bounds to the min and max value of the box.
   * @param min - The minimum point of the box
   * @param max - The maximum point of the box
   */
  public SetMinMax(min: Vector3, max: Vector3): void {
    this._extents = Vector3.Scale(Vector3.Subtract(max, min), 0.5);
    this._center = Vector3.Add(min, this._extents);
  }

  /**
   * Grows the Bounds to include the point.
   * @param point - Point to include
   */
  public Encapsulate(point: Vector3): void;
  /**
   * Grows the Bounds to include the Bounds.
   * @param bounds - Bounds to include
   */
  public Encapsulate(bounds: Bounds): void;
  public Encapsulate(pointOrBounds: Vector3 | Bounds): void {
    if (pointOrBounds instanceof Bounds) {
      this.Encapsulate(pointOrBounds.min);
      this.Encapsulate(pointOrBounds.max);
    } else {
      this.SetMinMax(Vector3.Min(this.min, pointOrBounds), Vector3.Max(this.max, pointOrBounds));
    }
  }

  /**
   * Expand the bounds by increasing its size by amount along each side.
   * @param amount - Amount to expand by
   */
  public Expand(amount: number): void;
  /**
   * Expand the bounds by increasing its size by amount along each side.
   * @param amount - Vector amount to expand by
   */
  public Expand(amount: Vector3): void;
  public Expand(amount: number | Vector3): void {
    if (typeof amount === 'number') {
      this._extents = Vector3.Add(this._extents, new Vector3(amount * 0.5, amount * 0.5, amount * 0.5));
    } else {
      this._extents = Vector3.Add(this._extents, Vector3.Scale(amount, 0.5));
    }
  }

  /**
   * Does the bounding box contain the point?
   * @param point - Point to test
   * @returns True if point is contained
   */
  public Contains(point: Vector3): boolean {
    const min = this.min;
    const max = this.max;
    return (
      point.x >= min.x &&
      point.x <= max.x &&
      point.y >= min.y &&
      point.y <= max.y &&
      point.z >= min.z &&
      point.z <= max.z
    );
  }

  /**
   * Does the bounding box intersect with another bounding box?
   * @param bounds - Bounds to test
   * @returns True if bounds intersect
   */
  public Intersects(bounds: Bounds): boolean {
    const min = this.min;
    const max = this.max;
    const otherMin = bounds.min;
    const otherMax = bounds.max;

    return (
      min.x <= otherMax.x &&
      max.x >= otherMin.x &&
      min.y <= otherMax.y &&
      max.y >= otherMin.y &&
      min.z <= otherMax.z &&
      max.z >= otherMin.z
    );
  }

  /**
   * Does ray intersect this bounding box?
   * @param ray - Ray to test
   * @returns True if ray intersects
   */
  public IntersectRay(ray: { origin: Vector3; direction: Vector3 }): boolean {
    const min = this.min;
    const max = this.max;
    const origin = ray.origin;
    const direction = ray.direction;

    let tmin = -Infinity;
    let tmax = Infinity;

    // Check X slab
    if (Math.abs(direction.x) > 1e-10) {
      const tx1 = (min.x - origin.x) / direction.x;
      const tx2 = (max.x - origin.x) / direction.x;
      tmin = Math.max(tmin, Math.min(tx1, tx2));
      tmax = Math.min(tmax, Math.max(tx1, tx2));
    } else if (origin.x < min.x || origin.x > max.x) {
      return false;
    }

    // Check Y slab
    if (Math.abs(direction.y) > 1e-10) {
      const ty1 = (min.y - origin.y) / direction.y;
      const ty2 = (max.y - origin.y) / direction.y;
      tmin = Math.max(tmin, Math.min(ty1, ty2));
      tmax = Math.min(tmax, Math.max(ty1, ty2));
    } else if (origin.y < min.y || origin.y > max.y) {
      return false;
    }

    // Check Z slab
    if (Math.abs(direction.z) > 1e-10) {
      const tz1 = (min.z - origin.z) / direction.z;
      const tz2 = (max.z - origin.z) / direction.z;
      tmin = Math.max(tmin, Math.min(tz1, tz2));
      tmax = Math.min(tmax, Math.max(tz1, tz2));
    } else if (origin.z < min.z || origin.z > max.z) {
      return false;
    }

    return tmax >= tmin && tmax >= 0;
  }

  /**
   * The smallest squared distance between the point and this bounding box.
   * @param point - Point to measure distance to
   * @returns Squared distance
   */
  public SqrDistance(point: Vector3): number {
    const min = this.min;
    const max = this.max;
    let sqrDistance = 0;

    // Calculate squared distance on each axis
    if (point.x < min.x) {
      const dx = min.x - point.x;
      sqrDistance += dx * dx;
    } else if (point.x > max.x) {
      const dx = point.x - max.x;
      sqrDistance += dx * dx;
    }

    if (point.y < min.y) {
      const dy = min.y - point.y;
      sqrDistance += dy * dy;
    } else if (point.y > max.y) {
      const dy = point.y - max.y;
      sqrDistance += dy * dy;
    }

    if (point.z < min.z) {
      const dz = min.z - point.z;
      sqrDistance += dz * dz;
    } else if (point.z > max.z) {
      const dz = point.z - max.z;
      sqrDistance += dz * dz;
    }

    return sqrDistance;
  }

  /**
   * The closest point on the bounding box.
   * @param point - Point to find closest point to
   * @returns Closest point
   */
  public ClosestPoint(point: Vector3): Vector3 {
    const min = this.min;
    const max = this.max;

    return new Vector3(
      Math.max(min.x, Math.min(max.x, point.x)),
      Math.max(min.y, Math.min(max.y, point.y)),
      Math.max(min.z, Math.min(max.z, point.z))
    );
  }

  /**
   * Returns a formatted string for the bounds.
   * @param format - Optional format string (not implemented)
   * @returns Formatted string
   */
  public toString(_format?: string): string {
    return `Center: ${this.center.toString()}, Extents: ${this.extents.toString()}`;
  }

  /**
   * Returns true if the bounds are equal.
   * @param other - Other bounds
   * @returns True if equal
   */
  public Equals(other: Bounds): boolean {
    return (
      this.center.approximatelyEquals(other.center, 1e-10) &&
      this.extents.approximatelyEquals(other.extents, 1e-10)
    );
  }
}
