import { describe, it, expect } from 'vitest';
import { Bounds } from '../Bounds';
import { Vector3 } from '../Vector3';

describe('Bounds', () => {
  describe('constructor', () => {
    it('should create bounds with zero center and size by default', () => {
      const b = new Bounds();
      expect(b.center.approximatelyEquals(Vector3.zero, 0.001)).toBe(true);
      expect(b.size.approximatelyEquals(Vector3.zero, 0.001)).toBe(true);
    });

    it('should create bounds with specified center and size', () => {
      const center = new Vector3(1, 2, 3);
      const size = new Vector3(4, 6, 8);
      const b = new Bounds(center, size);
      expect(b.center.approximatelyEquals(center, 0.001)).toBe(true);
      expect(b.size.approximatelyEquals(size, 0.001)).toBe(true);
    });

    it('should calculate extents as half of size', () => {
      const size = new Vector3(4, 6, 8);
      const b = new Bounds(Vector3.zero, size);
      expect(b.extents.x).toBeCloseTo(2, 5);
      expect(b.extents.y).toBeCloseTo(3, 5);
      expect(b.extents.z).toBeCloseTo(4, 5);
    });
  });

  describe('center property', () => {
    it('should get center', () => {
      const center = new Vector3(5, 10, 15);
      const b = new Bounds(center, Vector3.one);
      expect(b.center.approximatelyEquals(center, 0.001)).toBe(true);
    });

    it('should set center', () => {
      const b = new Bounds();
      const newCenter = new Vector3(10, 20, 30);
      b.center = newCenter;
      expect(b.center.approximatelyEquals(newCenter, 0.001)).toBe(true);
    });
  });

  describe('size property', () => {
    it('should get size', () => {
      const size = new Vector3(2, 4, 6);
      const b = new Bounds(Vector3.zero, size);
      expect(b.size.approximatelyEquals(size, 0.001)).toBe(true);
    });

    it('should set size', () => {
      const b = new Bounds();
      const newSize = new Vector3(10, 20, 30);
      b.size = newSize;
      expect(b.size.approximatelyEquals(newSize, 0.001)).toBe(true);
      expect(b.extents.x).toBeCloseTo(5, 5);
      expect(b.extents.y).toBeCloseTo(10, 5);
      expect(b.extents.z).toBeCloseTo(15, 5);
    });

    it('should be twice the extents', () => {
      const b = new Bounds(Vector3.zero, new Vector3(4, 6, 8));
      expect(b.size.x).toBeCloseTo(b.extents.x * 2, 5);
      expect(b.size.y).toBeCloseTo(b.extents.y * 2, 5);
      expect(b.size.z).toBeCloseTo(b.extents.z * 2, 5);
    });
  });

  describe('extents property', () => {
    it('should get extents', () => {
      const size = new Vector3(4, 6, 8);
      const b = new Bounds(Vector3.zero, size);
      expect(b.extents.x).toBeCloseTo(2, 5);
      expect(b.extents.y).toBeCloseTo(3, 5);
      expect(b.extents.z).toBeCloseTo(4, 5);
    });

    it('should set extents', () => {
      const b = new Bounds();
      const newExtents = new Vector3(5, 10, 15);
      b.extents = newExtents;
      expect(b.extents.approximatelyEquals(newExtents, 0.001)).toBe(true);
    });
  });

  describe('min property', () => {
    it('should get min as center minus extents', () => {
      const center = new Vector3(5, 5, 5);
      const size = new Vector3(2, 2, 2);
      const b = new Bounds(center, size);
      const min = b.min;
      expect(min.x).toBeCloseTo(4, 5);
      expect(min.y).toBeCloseTo(4, 5);
      expect(min.z).toBeCloseTo(4, 5);
    });

    it('should set min', () => {
      const b = new Bounds(new Vector3(5, 5, 5), new Vector3(2, 2, 2));
      b.min = new Vector3(0, 0, 0);
      expect(b.min.approximatelyEquals(Vector3.zero, 0.001)).toBe(true);
    });
  });

  describe('max property', () => {
    it('should get max as center plus extents', () => {
      const center = new Vector3(5, 5, 5);
      const size = new Vector3(2, 2, 2);
      const b = new Bounds(center, size);
      const max = b.max;
      expect(max.x).toBeCloseTo(6, 5);
      expect(max.y).toBeCloseTo(6, 5);
      expect(max.z).toBeCloseTo(6, 5);
    });

    it('should set max', () => {
      const b = new Bounds(new Vector3(5, 5, 5), new Vector3(2, 2, 2));
      b.max = new Vector3(10, 10, 10);
      expect(b.max.approximatelyEquals(new Vector3(10, 10, 10), 0.001)).toBe(true);
    });
  });

  describe('SetMinMax', () => {
    it('should set bounds from min and max', () => {
      const b = new Bounds();
      const min = new Vector3(0, 0, 0);
      const max = new Vector3(10, 10, 10);
      b.SetMinMax(min, max);

      expect(b.min.approximatelyEquals(min, 0.001)).toBe(true);
      expect(b.max.approximatelyEquals(max, 0.001)).toBe(true);
      expect(b.center.approximatelyEquals(new Vector3(5, 5, 5), 0.001)).toBe(true);
      expect(b.extents.approximatelyEquals(new Vector3(5, 5, 5), 0.001)).toBe(true);
    });

    it('should handle negative coordinates', () => {
      const b = new Bounds();
      b.SetMinMax(new Vector3(-10, -10, -10), new Vector3(10, 10, 10));
      expect(b.center.approximatelyEquals(Vector3.zero, 0.001)).toBe(true);
      expect(b.extents.approximatelyEquals(new Vector3(10, 10, 10), 0.001)).toBe(true);
    });
  });

  describe('Encapsulate', () => {
    it('should encapsulate a point', () => {
      const b = new Bounds(Vector3.zero, Vector3.one);
      b.Encapsulate(new Vector3(5, 5, 5));

      expect(b.Contains(new Vector3(5, 5, 5))).toBe(true);
      expect(b.Contains(Vector3.zero)).toBe(true);
    });

    it('should grow to include point outside bounds', () => {
      const b = new Bounds(Vector3.zero, new Vector3(2, 2, 2));
      const originalSize = b.size;

      b.Encapsulate(new Vector3(10, 0, 0));

      expect(b.size.x).toBeGreaterThan(originalSize.x);
      expect(b.Contains(new Vector3(10, 0, 0))).toBe(true);
    });

    it('should not shrink when encapsulating point inside', () => {
      const b = new Bounds(Vector3.zero, new Vector3(10, 10, 10));
      const originalMin = b.min;
      const originalMax = b.max;

      b.Encapsulate(new Vector3(1, 1, 1));

      expect(b.min.approximatelyEquals(originalMin, 0.001)).toBe(true);
      expect(b.max.approximatelyEquals(originalMax, 0.001)).toBe(true);
    });

    it('should encapsulate another bounds', () => {
      const b1 = new Bounds(Vector3.zero, new Vector3(2, 2, 2));
      const b2 = new Bounds(new Vector3(5, 5, 5), new Vector3(2, 2, 2));

      b1.Encapsulate(b2);

      expect(b1.Contains(b2.min)).toBe(true);
      expect(b1.Contains(b2.max)).toBe(true);
      expect(b1.Contains(Vector3.zero)).toBe(true);
    });
  });

  describe('Expand', () => {
    it('should expand by scalar amount', () => {
      const b = new Bounds(Vector3.zero, new Vector3(2, 2, 2));
      const originalSize = b.size;

      b.Expand(2);

      expect(b.size.x).toBeCloseTo(originalSize.x + 2, 5);
      expect(b.size.y).toBeCloseTo(originalSize.y + 2, 5);
      expect(b.size.z).toBeCloseTo(originalSize.z + 2, 5);
    });

    it('should expand by vector amount', () => {
      const b = new Bounds(Vector3.zero, new Vector3(2, 2, 2));
      const originalSize = b.size;

      b.Expand(new Vector3(2, 4, 6));

      expect(b.size.x).toBeCloseTo(originalSize.x + 2, 5);
      expect(b.size.y).toBeCloseTo(originalSize.y + 4, 5);
      expect(b.size.z).toBeCloseTo(originalSize.z + 6, 5);
    });

    it('should keep center unchanged', () => {
      const b = new Bounds(new Vector3(5, 5, 5), new Vector3(2, 2, 2));
      const originalCenter = b.center;

      b.Expand(10);

      expect(b.center.approximatelyEquals(originalCenter, 0.001)).toBe(true);
    });

    it('should handle negative expansion', () => {
      const b = new Bounds(Vector3.zero, new Vector3(10, 10, 10));
      b.Expand(-2);

      expect(b.size.x).toBeCloseTo(8, 5);
      expect(b.size.y).toBeCloseTo(8, 5);
      expect(b.size.z).toBeCloseTo(8, 5);
    });
  });

  describe('Contains', () => {
    it('should contain center point', () => {
      const b = new Bounds(new Vector3(5, 5, 5), new Vector3(2, 2, 2));
      expect(b.Contains(new Vector3(5, 5, 5))).toBe(true);
    });

    it('should contain point inside bounds', () => {
      const b = new Bounds(Vector3.zero, new Vector3(10, 10, 10));
      expect(b.Contains(new Vector3(2, 2, 2))).toBe(true);
    });

    it('should contain point on boundary', () => {
      const b = new Bounds(Vector3.zero, new Vector3(2, 2, 2));
      expect(b.Contains(new Vector3(1, 1, 1))).toBe(true);
    });

    it('should not contain point outside bounds', () => {
      const b = new Bounds(Vector3.zero, new Vector3(2, 2, 2));
      expect(b.Contains(new Vector3(5, 5, 5))).toBe(false);
    });

    it('should not contain point outside on single axis', () => {
      const b = new Bounds(Vector3.zero, new Vector3(2, 2, 2));
      expect(b.Contains(new Vector3(5, 0, 0))).toBe(false);
    });
  });

  describe('Intersects', () => {
    it('should intersect with overlapping bounds', () => {
      const b1 = new Bounds(Vector3.zero, new Vector3(2, 2, 2));
      const b2 = new Bounds(new Vector3(1, 1, 1), new Vector3(2, 2, 2));
      expect(b1.Intersects(b2)).toBe(true);
    });

    it('should intersect with itself', () => {
      const b = new Bounds(Vector3.zero, new Vector3(2, 2, 2));
      expect(b.Intersects(b)).toBe(true);
    });

    it('should not intersect with separate bounds', () => {
      const b1 = new Bounds(Vector3.zero, new Vector3(1, 1, 1));
      const b2 = new Bounds(new Vector3(10, 10, 10), new Vector3(1, 1, 1));
      expect(b1.Intersects(b2)).toBe(false);
    });

    it('should intersect when touching', () => {
      const b1 = new Bounds(new Vector3(0, 0, 0), new Vector3(2, 2, 2));
      const b2 = new Bounds(new Vector3(2, 0, 0), new Vector3(2, 2, 2));
      expect(b1.Intersects(b2)).toBe(true);
    });

    it('should not intersect when separated on single axis', () => {
      const b1 = new Bounds(Vector3.zero, new Vector3(1, 1, 1));
      const b2 = new Bounds(new Vector3(5, 0, 0), new Vector3(1, 1, 1));
      expect(b1.Intersects(b2)).toBe(false);
    });
  });

  describe('IntersectRay', () => {
    it('should intersect ray through center', () => {
      const b = new Bounds(Vector3.zero, new Vector3(2, 2, 2));
      const ray = {
        origin: new Vector3(-5, 0, 0),
        direction: new Vector3(1, 0, 0),
      };
      expect(b.IntersectRay(ray)).toBe(true);
    });

    it('should intersect ray from inside', () => {
      const b = new Bounds(Vector3.zero, new Vector3(2, 2, 2));
      const ray = {
        origin: Vector3.zero,
        direction: new Vector3(1, 0, 0),
      };
      expect(b.IntersectRay(ray)).toBe(true);
    });

    it('should not intersect ray pointing away', () => {
      const b = new Bounds(Vector3.zero, new Vector3(2, 2, 2));
      const ray = {
        origin: new Vector3(-5, 0, 0),
        direction: new Vector3(-1, 0, 0),
      };
      expect(b.IntersectRay(ray)).toBe(false);
    });

    it('should not intersect ray missing bounds', () => {
      const b = new Bounds(Vector3.zero, new Vector3(1, 1, 1));
      const ray = {
        origin: new Vector3(-5, 10, 0),
        direction: new Vector3(1, 0, 0),
      };
      expect(b.IntersectRay(ray)).toBe(false);
    });

    it('should handle ray parallel to X axis', () => {
      const b = new Bounds(Vector3.zero, new Vector3(2, 2, 2));
      const ray = {
        origin: new Vector3(-5, 0, 0),
        direction: new Vector3(0, 1, 0),
      };
      expect(b.IntersectRay(ray)).toBe(false);
    });

    it('should handle ray parallel to Y axis', () => {
      const b = new Bounds(Vector3.zero, new Vector3(2, 2, 2));
      const ray = {
        origin: new Vector3(0, -5, 0),
        direction: new Vector3(0, 1, 0),
      };
      expect(b.IntersectRay(ray)).toBe(true);
    });

    it('should handle ray parallel to Z axis', () => {
      const b = new Bounds(Vector3.zero, new Vector3(2, 2, 2));
      const ray = {
        origin: new Vector3(0, 0, -5),
        direction: new Vector3(0, 0, 1),
      };
      expect(b.IntersectRay(ray)).toBe(true);
    });

    it('should handle diagonal ray', () => {
      const b = new Bounds(Vector3.zero, new Vector3(2, 2, 2));
      const ray = {
        origin: new Vector3(-5, -5, -5),
        direction: new Vector3(1, 1, 1).normalized,
      };
      expect(b.IntersectRay(ray)).toBe(true);
    });
  });

  describe('SqrDistance', () => {
    it('should return 0 for point inside bounds', () => {
      const b = new Bounds(Vector3.zero, new Vector3(2, 2, 2));
      expect(b.SqrDistance(Vector3.zero)).toBe(0);
    });

    it('should return 0 for point on boundary', () => {
      const b = new Bounds(Vector3.zero, new Vector3(2, 2, 2));
      expect(b.SqrDistance(new Vector3(1, 0, 0))).toBe(0);
    });

    it('should calculate squared distance correctly', () => {
      const b = new Bounds(Vector3.zero, new Vector3(2, 2, 2));
      const point = new Vector3(5, 0, 0);
      const dist = b.SqrDistance(point);
      expect(dist).toBeCloseTo(16, 5); // (5-1)^2 = 16
    });

    it('should work for all axes', () => {
      const b = new Bounds(Vector3.zero, new Vector3(1, 1, 1));
      const point = new Vector3(2, 3, 4);
      // dx = 1.5, dy = 2.5, dz = 3.5
      // sqr = 1.5^2 + 2.5^2 + 3.5^2 = 2.25 + 6.25 + 12.25 = 20.75
      const expected = 1.5 * 1.5 + 2.5 * 2.5 + 3.5 * 3.5;
      expect(b.SqrDistance(point)).toBeCloseTo(expected, 5);
    });

    it('should handle negative coordinates', () => {
      const b = new Bounds(Vector3.zero, new Vector3(1, 1, 1));
      const point = new Vector3(-2, 0, 0);
      const dist = b.SqrDistance(point);
      expect(dist).toBeCloseTo(1.5 * 1.5, 5);
    });
  });

  describe('ClosestPoint', () => {
    it('should return point itself if inside bounds', () => {
      const b = new Bounds(Vector3.zero, new Vector3(2, 2, 2));
      const point = new Vector3(0.5, 0.5, 0.5);
      const closest = b.ClosestPoint(point);
      expect(closest.approximatelyEquals(point, 0.001)).toBe(true);
    });

    it('should clamp to boundary', () => {
      const b = new Bounds(Vector3.zero, new Vector3(2, 2, 2));
      const point = new Vector3(5, 0, 0);
      const closest = b.ClosestPoint(point);
      expect(closest.x).toBeCloseTo(1, 5);
      expect(closest.y).toBeCloseTo(0, 5);
      expect(closest.z).toBeCloseTo(0, 5);
    });

    it('should clamp all axes', () => {
      const b = new Bounds(Vector3.zero, new Vector3(1, 1, 1));
      const point = new Vector3(2, 3, 4);
      const closest = b.ClosestPoint(point);
      expect(closest.x).toBeCloseTo(0.5, 5);
      expect(closest.y).toBeCloseTo(0.5, 5);
      expect(closest.z).toBeCloseTo(0.5, 5);
    });

    it('should handle negative coordinates', () => {
      const b = new Bounds(Vector3.zero, new Vector3(2, 2, 2));
      const point = new Vector3(-5, -5, -5);
      const closest = b.ClosestPoint(point);
      expect(closest.x).toBeCloseTo(-1, 5);
      expect(closest.y).toBeCloseTo(-1, 5);
      expect(closest.z).toBeCloseTo(-1, 5);
    });
  });

  describe('toString', () => {
    it('should format bounds as string', () => {
      const b = new Bounds(new Vector3(1, 2, 3), new Vector3(4, 6, 8));
      const str = b.toString();
      expect(str).toContain('Center');
      expect(str).toContain('Extents');
    });
  });

  describe('Equals', () => {
    it('should return true for equal bounds', () => {
      const b1 = new Bounds(new Vector3(1, 2, 3), new Vector3(4, 6, 8));
      const b2 = new Bounds(new Vector3(1, 2, 3), new Vector3(4, 6, 8));
      expect(b1.Equals(b2)).toBe(true);
    });

    it('should return false for different centers', () => {
      const b1 = new Bounds(new Vector3(1, 2, 3), new Vector3(4, 6, 8));
      const b2 = new Bounds(new Vector3(2, 3, 4), new Vector3(4, 6, 8));
      expect(b1.Equals(b2)).toBe(false);
    });

    it('should return false for different sizes', () => {
      const b1 = new Bounds(new Vector3(1, 2, 3), new Vector3(4, 6, 8));
      const b2 = new Bounds(new Vector3(1, 2, 3), new Vector3(5, 7, 9));
      expect(b1.Equals(b2)).toBe(false);
    });
  });

  describe('performance', () => {
    it('should handle many containment tests', () => {
      const start = performance.now();
      const b = new Bounds(Vector3.zero, new Vector3(10, 10, 10));

      for (let i = 0; i < 10000; i++) {
        const point = new Vector3(i % 20 - 10, i % 20 - 10, i % 20 - 10);
        b.Contains(point);
      }

      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(100); // Should complete in <100ms
    });

    it('should handle many intersection tests', () => {
      const start = performance.now();
      const b1 = new Bounds(Vector3.zero, new Vector3(5, 5, 5));

      for (let i = 0; i < 10000; i++) {
        const b2 = new Bounds(new Vector3(i % 10, 0, 0), new Vector3(2, 2, 2));
        b1.Intersects(b2);
      }

      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(100); // Should complete in <100ms
    });
  });
});
