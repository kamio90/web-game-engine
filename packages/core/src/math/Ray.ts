import { Vector3 } from './Vector3';

/**
 * Representation of rays.
 *
 * A ray is an infinite line starting at origin and going in some direction.
 *
 * @example
 * ```typescript
 * const ray = new Ray(new Vector3(0, 0, 0), new Vector3(0, 0, 1));
 * const point = ray.GetPoint(10); // Point 10 units along the ray
 * ```
 */
export class Ray {
  private _origin: Vector3;
  private _direction: Vector3;

  /**
   * Creates a new ray.
   * @param origin - The origin point of the ray
   * @param direction - The direction of the ray
   */
  constructor(origin: Vector3 = Vector3.zero, direction: Vector3 = Vector3.forward) {
    this._origin = origin;
    this._direction = direction.normalized;
  }

  // ==================== Properties ====================

  /**
   * The origin point of the ray.
   */
  public get origin(): Vector3 {
    return this._origin;
  }

  public set origin(value: Vector3) {
    this._origin = value;
  }

  /**
   * The direction of the ray.
   */
  public get direction(): Vector3 {
    return this._direction;
  }

  public set direction(value: Vector3) {
    this._direction = value.normalized;
  }

  // ==================== Methods ====================

  /**
   * Returns a point at distance units along the ray.
   * @param distance - Distance along the ray
   * @returns Point at distance
   */
  public GetPoint(distance: number): Vector3 {
    return Vector3.Add(this._origin, Vector3.Scale(this._direction, distance));
  }

  /**
   * Returns a formatted string for this ray.
   * @param format - Optional format string (not implemented)
   * @returns Formatted string
   */
  public toString(_format?: string): string {
    return `Origin: ${this._origin.toString()}, Dir: ${this._direction.toString()}`;
  }
}
