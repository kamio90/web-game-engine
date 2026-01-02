import { Vector2 } from './Vector2';

/**
 * A 2D rectangle defined by x, y position and width, height.
 *
 * Unity's Rect class represents a rectangle for UI and viewport areas.
 * This implementation provides the complete Unity Rect API.
 *
 * @example
 * ```typescript
 * // Create a viewport rect (bottom-left corner, full size)
 * const viewport = new Rect(0, 0, 1, 1);
 *
 * // Create a UI rect
 * const button = new Rect(10, 10, 100, 40);
 *
 * // Check if point is inside
 * if (rect.Contains(new Vector2(50, 25))) {
 *   console.log('Point is inside rect');
 * }
 * ```
 */
export class Rect {
  public x: number;
  public y: number;
  public width: number;
  public height: number;

  /**
   * Creates a new Rect.
   * @param x - The X coordinate of the rectangle
   * @param y - The Y coordinate of the rectangle
   * @param width - The width of the rectangle
   * @param height - The height of the rectangle
   */
  constructor(x: number = 0, y: number = 0, width: number = 0, height: number = 0) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  // ==================== Properties ====================

  /**
   * The minimum X coordinate of the rectangle.
   */
  public get xMin(): number {
    return Math.min(this.x, this.x + this.width);
  }

  public set xMin(value: number) {
    const xMax = this.xMax;
    this.x = value;
    this.width = xMax - value;
  }

  /**
   * The maximum X coordinate of the rectangle.
   */
  public get xMax(): number {
    return Math.max(this.x, this.x + this.width);
  }

  public set xMax(value: number) {
    this.width = value - this.x;
  }

  /**
   * The minimum Y coordinate of the rectangle.
   */
  public get yMin(): number {
    return Math.min(this.y, this.y + this.height);
  }

  public set yMin(value: number) {
    const yMax = this.yMax;
    this.y = value;
    this.height = yMax - value;
  }

  /**
   * The maximum Y coordinate of the rectangle.
   */
  public get yMax(): number {
    return Math.max(this.y, this.y + this.height);
  }

  public set yMax(value: number) {
    this.height = value - this.y;
  }

  /**
   * The position of the minimum corner of the rectangle.
   */
  public get min(): Vector2 {
    return new Vector2(this.xMin, this.yMin);
  }

  public set min(value: Vector2) {
    this.xMin = value.x;
    this.yMin = value.y;
  }

  /**
   * The position of the maximum corner of the rectangle.
   */
  public get max(): Vector2 {
    return new Vector2(this.xMax, this.yMax);
  }

  public set max(value: Vector2) {
    this.xMax = value.x;
    this.yMax = value.y;
  }

  /**
   * The position of the center of the rectangle.
   */
  public get center(): Vector2 {
    return new Vector2(this.x + this.width / 2, this.y + this.height / 2);
  }

  public set center(value: Vector2) {
    this.x = value.x - this.width / 2;
    this.y = value.y - this.height / 2;
  }

  /**
   * The position (x, y) of the rectangle.
   */
  public get position(): Vector2 {
    return new Vector2(this.x, this.y);
  }

  public set position(value: Vector2) {
    this.x = value.x;
    this.y = value.y;
  }

  /**
   * The size (width, height) of the rectangle.
   */
  public get size(): Vector2 {
    return new Vector2(this.width, this.height);
  }

  public set size(value: Vector2) {
    this.width = value.x;
    this.height = value.y;
  }

  // ==================== Static Methods ====================

  /**
   * Creates a rectangle from min and max points.
   * @param xmin - The minimum X coordinate
   * @param ymin - The minimum Y coordinate
   * @param xmax - The maximum X coordinate
   * @param ymax - The maximum Y coordinate
   * @returns A new Rect
   */
  public static MinMaxRect(xmin: number, ymin: number, xmax: number, ymax: number): Rect {
    return new Rect(xmin, ymin, xmax - xmin, ymax - ymin);
  }

  /**
   * Returns a point inside a rectangle, given normalized coordinates.
   * @param rectangle - The rectangle
   * @param normalizedRectCoordinates - Normalized coordinates (0-1 range)
   * @returns A point inside the rectangle
   */
  public static NormalizedToPoint(
    rectangle: Rect,
    normalizedRectCoordinates: Vector2
  ): Vector2 {
    return new Vector2(
      rectangle.x + rectangle.width * normalizedRectCoordinates.x,
      rectangle.y + rectangle.height * normalizedRectCoordinates.y
    );
  }

  /**
   * Returns the normalized coordinates corresponding to the point.
   * @param rectangle - The rectangle
   * @param point - A point within the rectangle
   * @returns Normalized coordinates (0-1 range)
   */
  public static PointToNormalized(rectangle: Rect, point: Vector2): Vector2 {
    return new Vector2(
      (point.x - rectangle.x) / rectangle.width,
      (point.y - rectangle.y) / rectangle.height
    );
  }

  // ==================== Instance Methods ====================

  /**
   * Returns true if the x and y components of point are within the rectangle.
   * @param point - Point to test
   * @returns True if the point is within the rectangle
   */
  public Contains(point: Vector2): boolean;
  public Contains(point: Vector2, allowInverse: boolean): boolean;
  public Contains(point: Vector2, allowInverse: boolean = false): boolean {
    if (!allowInverse) {
      return (
        point.x >= this.xMin &&
        point.x < this.xMax &&
        point.y >= this.yMin &&
        point.y < this.yMax
      );
    } else {
      const xMin = Math.min(this.x, this.x + this.width);
      const xMax = Math.max(this.x, this.x + this.width);
      const yMin = Math.min(this.y, this.y + this.height);
      const yMax = Math.max(this.y, this.y + this.height);

      return point.x >= xMin && point.x < xMax && point.y >= yMin && point.y < yMax;
    }
  }

  /**
   * Returns true if the other rectangle overlaps this one.
   * @param other - Other rectangle
   * @returns True if the rectangles overlap
   */
  public Overlaps(other: Rect): boolean;
  public Overlaps(other: Rect, allowInverse: boolean): boolean;
  public Overlaps(other: Rect, allowInverse: boolean = false): boolean {
    if (!allowInverse) {
      return (
        this.xMin < other.xMax &&
        this.xMax > other.xMin &&
        this.yMin < other.yMax &&
        this.yMax > other.yMin
      );
    } else {
      const thisXMin = Math.min(this.x, this.x + this.width);
      const thisXMax = Math.max(this.x, this.x + this.width);
      const thisYMin = Math.min(this.y, this.y + this.height);
      const thisYMax = Math.max(this.y, this.y + this.height);

      const otherXMin = Math.min(other.x, other.x + other.width);
      const otherXMax = Math.max(other.x, other.x + other.width);
      const otherYMin = Math.min(other.y, other.y + other.height);
      const otherYMax = Math.max(other.y, other.y + other.height);

      return (
        thisXMin < otherXMax &&
        thisXMax > otherXMin &&
        thisYMin < otherYMax &&
        thisYMax > otherYMin
      );
    }
  }

  /**
   * Sets the components of an existing Rect.
   * @param x - The X coordinate
   * @param y - The Y coordinate
   * @param width - The width
   * @param height - The height
   */
  public Set(x: number, y: number, width: number, height: number): void {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
  }

  /**
   * Returns a formatted string for this Rect.
   * @param _format - Optional format string (not implemented)
   * @returns Formatted string
   */
  public toString(_format?: string): string {
    return `(x:${this.x.toFixed(2)}, y:${this.y.toFixed(2)}, width:${this.width.toFixed(2)}, height:${this.height.toFixed(2)})`;
  }

  /**
   * Returns true if the given rect is exactly equal to this rect.
   * @param other - Other rect
   * @returns True if equal
   */
  public equals(other: Rect): boolean {
    return (
      this.x === other.x &&
      this.y === other.y &&
      this.width === other.width &&
      this.height === other.height
    );
  }
}
