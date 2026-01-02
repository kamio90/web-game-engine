import { describe, it, expect } from 'vitest';
import { Ray } from '../Ray';
import { Vector3 } from '../Vector3';

describe('Ray', () => {
  describe('constructor', () => {
    it('should create ray with zero origin and forward direction by default', () => {
      const r = new Ray();
      expect(r.origin.approximatelyEquals(Vector3.zero, 0.001)).toBe(true);
      expect(r.direction.approximatelyEquals(Vector3.forward, 0.001)).toBe(true);
    });

    it('should create ray with specified origin and direction', () => {
      const origin = new Vector3(1, 2, 3);
      const direction = new Vector3(0, 1, 0);
      const r = new Ray(origin, direction);
      expect(r.origin.approximatelyEquals(origin, 0.001)).toBe(true);
      expect(r.direction.approximatelyEquals(direction, 0.001)).toBe(true);
    });

    it('should normalize direction on construction', () => {
      const direction = new Vector3(10, 0, 0);
      const r = new Ray(Vector3.zero, direction);
      expect(r.direction.magnitude).toBeCloseTo(1, 5);
      expect(r.direction.approximatelyEquals(Vector3.right, 0.001)).toBe(true);
    });

    it('should handle non-normalized directions', () => {
      const direction = new Vector3(3, 4, 0);
      const r = new Ray(Vector3.zero, direction);
      expect(r.direction.magnitude).toBeCloseTo(1, 5);
    });
  });

  describe('origin property', () => {
    it('should get origin', () => {
      const origin = new Vector3(5, 10, 15);
      const r = new Ray(origin, Vector3.forward);
      expect(r.origin.approximatelyEquals(origin, 0.001)).toBe(true);
    });

    it('should set origin', () => {
      const r = new Ray();
      const newOrigin = new Vector3(10, 20, 30);
      r.origin = newOrigin;
      expect(r.origin.approximatelyEquals(newOrigin, 0.001)).toBe(true);
    });

    it('should not affect direction when setting origin', () => {
      const r = new Ray(Vector3.zero, Vector3.up);
      const originalDirection = r.direction;
      r.origin = new Vector3(5, 5, 5);
      expect(r.direction.approximatelyEquals(originalDirection, 0.001)).toBe(true);
    });
  });

  describe('direction property', () => {
    it('should get direction', () => {
      const direction = Vector3.up;
      const r = new Ray(Vector3.zero, direction);
      expect(r.direction.approximatelyEquals(direction, 0.001)).toBe(true);
    });

    it('should set direction', () => {
      const r = new Ray();
      const newDirection = Vector3.right;
      r.direction = newDirection;
      expect(r.direction.approximatelyEquals(newDirection, 0.001)).toBe(true);
    });

    it('should normalize direction when setting', () => {
      const r = new Ray();
      r.direction = new Vector3(10, 0, 0);
      expect(r.direction.magnitude).toBeCloseTo(1, 5);
    });

    it('should not affect origin when setting direction', () => {
      const r = new Ray(new Vector3(5, 5, 5), Vector3.forward);
      const originalOrigin = r.origin;
      r.direction = Vector3.up;
      expect(r.origin.approximatelyEquals(originalOrigin, 0.001)).toBe(true);
    });
  });

  describe('GetPoint', () => {
    it('should return origin at distance 0', () => {
      const origin = new Vector3(1, 2, 3);
      const r = new Ray(origin, Vector3.forward);
      const point = r.GetPoint(0);
      expect(point.approximatelyEquals(origin, 0.001)).toBe(true);
    });

    it('should return point along positive direction', () => {
      const r = new Ray(Vector3.zero, Vector3.forward);
      const point = r.GetPoint(10);
      expect(point.approximatelyEquals(new Vector3(0, 0, 10), 0.001)).toBe(true);
    });

    it('should return point along negative direction', () => {
      const r = new Ray(Vector3.zero, Vector3.forward);
      const point = r.GetPoint(-5);
      expect(point.approximatelyEquals(new Vector3(0, 0, -5), 0.001)).toBe(true);
    });

    it('should work with non-axis-aligned directions', () => {
      const r = new Ray(Vector3.zero, new Vector3(1, 1, 0).normalized);
      const point = r.GetPoint(Math.sqrt(2));
      expect(point.x).toBeCloseTo(1, 3);
      expect(point.y).toBeCloseTo(1, 3);
      expect(point.z).toBeCloseTo(0, 3);
    });

    it('should work with offset origin', () => {
      const origin = new Vector3(5, 5, 5);
      const r = new Ray(origin, Vector3.up);
      const point = r.GetPoint(10);
      expect(point.approximatelyEquals(new Vector3(5, 15, 5), 0.001)).toBe(true);
    });

    it('should handle fractional distances', () => {
      const r = new Ray(Vector3.zero, Vector3.right);
      const point = r.GetPoint(0.5);
      expect(point.approximatelyEquals(new Vector3(0.5, 0, 0), 0.001)).toBe(true);
    });

    it('should handle very large distances', () => {
      const r = new Ray(Vector3.zero, Vector3.forward);
      const point = r.GetPoint(1000);
      expect(point.z).toBeCloseTo(1000, 3);
    });

    it('should maintain direction proportions', () => {
      const direction = new Vector3(3, 4, 0).normalized;
      const r = new Ray(Vector3.zero, direction);
      const point = r.GetPoint(5);

      // Point should be 5 units along the normalized direction
      const expected = Vector3.Scale(direction, 5);
      expect(point.approximatelyEquals(expected, 0.001)).toBe(true);
    });
  });

  describe('toString', () => {
    it('should format ray as string', () => {
      const r = new Ray(new Vector3(1, 2, 3), new Vector3(0, 1, 0));
      const str = r.toString();
      expect(str).toContain('Origin');
      expect(str).toContain('Dir');
    });

    it('should include origin values', () => {
      const r = new Ray(new Vector3(5, 10, 15), Vector3.forward);
      const str = r.toString();
      expect(str).toContain('5');
      expect(str).toContain('10');
      expect(str).toContain('15');
    });

    it('should include direction values', () => {
      const r = new Ray(Vector3.zero, Vector3.up);
      const str = r.toString();
      expect(str).toContain('1'); // Up direction has y=1
    });
  });

  describe('integration tests', () => {
    it('should work with all axis-aligned directions', () => {
      const directions = [
        Vector3.forward,
        Vector3.back,
        Vector3.up,
        Vector3.down,
        Vector3.left,
        Vector3.right,
      ];

      directions.forEach((dir) => {
        const r = new Ray(Vector3.zero, dir);
        const point = r.GetPoint(5);
        expect(point.magnitude).toBeCloseTo(5, 3);
      });
    });

    it('should trace a path through 3D space', () => {
      const start = new Vector3(0, 0, 0);
      const end = new Vector3(10, 5, 3);
      const direction = Vector3.Subtract(end, start).normalized;
      const r = new Ray(start, direction);

      const distance = Vector3.Distance(start, end);
      const point = r.GetPoint(distance);

      expect(point.approximatelyEquals(end, 0.01)).toBe(true);
    });

    it('should handle ray from arbitrary position', () => {
      const origin = new Vector3(100, 200, 300);
      const direction = new Vector3(1, -1, 1).normalized;
      const r = new Ray(origin, direction);

      const point = r.GetPoint(10);
      const distanceFromOrigin = Vector3.Distance(origin, point);
      expect(distanceFromOrigin).toBeCloseTo(10, 3);
    });
  });

  describe('edge cases', () => {
    it('should handle zero-length direction by normalizing', () => {
      // This might create a degenerate ray, but normalized should handle it
      const r = new Ray(Vector3.zero, Vector3.zero);
      // Zero vector normalized returns zero
      expect(r.direction.approximatelyEquals(Vector3.zero, 0.001)).toBe(true);
    });

    it('should handle very small direction vectors', () => {
      const r = new Ray(Vector3.zero, new Vector3(0.0001, 0, 0));
      expect(r.direction.magnitude).toBeCloseTo(1, 5);
    });

    it('should handle diagonal directions', () => {
      const r = new Ray(Vector3.zero, Vector3.one);
      expect(r.direction.magnitude).toBeCloseTo(1, 5);

      // Direction should be normalized (1,1,1)
      const expected = Vector3.one.normalized;
      expect(r.direction.approximatelyEquals(expected, 0.001)).toBe(true);
    });
  });

  describe('performance', () => {
    it('should handle many GetPoint calls efficiently', () => {
      const start = performance.now();
      const r = new Ray(Vector3.zero, Vector3.forward);

      for (let i = 0; i < 10000; i++) {
        r.GetPoint(i * 0.1);
      }

      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(100); // Should complete in <100ms
    });

    it('should handle many ray constructions', () => {
      const start = performance.now();

      for (let i = 0; i < 10000; i++) {
        new Ray(
          new Vector3(i, i, i),
          new Vector3(Math.sin(i), Math.cos(i), 0)
        );
      }

      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(100); // Should complete in <100ms
    });
  });
});
