import { describe, it, expect } from 'vitest';
import { Plane } from '../Plane';
import { Vector3 } from '../Vector3';
import { Ray } from '../Ray';

describe('Plane', () => {
  describe('constructor', () => {
    it('should create plane with up normal and zero distance by default', () => {
      const p = new Plane(Vector3.up, 0);
      expect(p.normal.approximatelyEquals(Vector3.up, 0.001)).toBe(true);
      expect(p.distance).toBe(0);
    });

    it('should create plane from normal and distance', () => {
      const p = new Plane(Vector3.up, 5);
      expect(p.normal.approximatelyEquals(Vector3.up, 0.001)).toBe(true);
      expect(p.distance).toBe(5);
    });

    it('should create plane from normal and point', () => {
      const normal = Vector3.up;
      const point = new Vector3(0, 5, 0);
      const p = new Plane(normal, point);
      expect(p.normal.approximatelyEquals(Vector3.up, 0.001)).toBe(true);
      expect(p.distance).toBeCloseTo(-5, 5);
    });

    it('should create plane from three points', () => {
      const a = new Vector3(0, 0, 0);
      const b = new Vector3(1, 0, 0);
      const c = new Vector3(0, 0, 1);
      const p = new Plane(a, b, c);

      // Normal should point up (cross product of (1,0,0) and (0,0,1))
      expect(p.normal.approximatelyEquals(Vector3.up, 0.001)).toBe(true);
    });

    it('should normalize normal on construction', () => {
      const p = new Plane(new Vector3(10, 0, 0), 0);
      expect(p.normal.magnitude).toBeCloseTo(1, 5);
    });
  });

  describe('normal property', () => {
    it('should get normal', () => {
      const normal = Vector3.right;
      const p = new Plane(normal, 0);
      expect(p.normal.approximatelyEquals(normal, 0.001)).toBe(true);
    });

    it('should set normal', () => {
      const p = new Plane(Vector3.up, 0);
      p.normal = Vector3.forward;
      expect(p.normal.approximatelyEquals(Vector3.forward, 0.001)).toBe(true);
    });

    it('should normalize when setting normal', () => {
      const p = new Plane(Vector3.up, 0);
      p.normal = new Vector3(5, 0, 0);
      expect(p.normal.magnitude).toBeCloseTo(1, 5);
    });
  });

  describe('distance property', () => {
    it('should get distance', () => {
      const p = new Plane(Vector3.up, 7);
      expect(p.distance).toBe(7);
    });

    it('should set distance', () => {
      const p = new Plane(Vector3.up, 0);
      p.distance = 10;
      expect(p.distance).toBe(10);
    });
  });

  describe('flipped', () => {
    it('should return plane facing opposite direction', () => {
      const p = new Plane(Vector3.up, 5);
      const flipped = p.flipped;

      expect(flipped.normal.approximatelyEquals(Vector3.down, 0.001)).toBe(true);
      expect(flipped.distance).toBeCloseTo(-5, 5);
    });

    it('should not modify original plane', () => {
      const p = new Plane(Vector3.up, 5);
      const originalNormal = p.normal;
      const originalDistance = p.distance;

      p.flipped;

      expect(p.normal.approximatelyEquals(originalNormal, 0.001)).toBe(true);
      expect(p.distance).toBe(originalDistance);
    });
  });

  describe('Set3Points', () => {
    it('should set plane from three points', () => {
      const p = new Plane(Vector3.up, 0);
      const a = new Vector3(0, 5, 0);
      const b = new Vector3(1, 5, 0);
      const c = new Vector3(0, 5, 1);

      p.Set3Points(a, b, c);

      // All three points should be on the plane
      expect(Math.abs(p.GetDistanceToPoint(a))).toBeLessThan(0.001);
      expect(Math.abs(p.GetDistanceToPoint(b))).toBeLessThan(0.001);
      expect(Math.abs(p.GetDistanceToPoint(c))).toBeLessThan(0.001);
    });

    it('should calculate correct normal', () => {
      const p = new Plane(Vector3.up, 0);
      const a = new Vector3(0, 0, 0);
      const b = new Vector3(1, 0, 0);
      const c = new Vector3(0, 0, 1);

      p.Set3Points(a, b, c);

      expect(p.normal.approximatelyEquals(Vector3.up, 0.001)).toBe(true);
    });
  });

  describe('SetNormalAndPosition', () => {
    it('should set plane from normal and position', () => {
      const p = new Plane(Vector3.up, 0);
      const normal = Vector3.forward;
      const point = new Vector3(0, 0, 10);

      p.SetNormalAndPosition(normal, point);

      expect(p.normal.approximatelyEquals(normal, 0.001)).toBe(true);
      expect(Math.abs(p.GetDistanceToPoint(point))).toBeLessThan(0.001);
    });
  });

  describe('Flip', () => {
    it('should flip plane direction', () => {
      const p = new Plane(Vector3.up, 5);
      p.Flip();

      expect(p.normal.approximatelyEquals(Vector3.down, 0.001)).toBe(true);
      expect(p.distance).toBeCloseTo(-5, 5);
    });

    it('should flip twice to return to original', () => {
      const p = new Plane(Vector3.up, 5);
      const originalNormal = p.normal;
      const originalDistance = p.distance;

      p.Flip();
      p.Flip();

      expect(p.normal.approximatelyEquals(originalNormal, 0.001)).toBe(true);
      expect(p.distance).toBeCloseTo(originalDistance, 5);
    });
  });

  describe('Translate (instance)', () => {
    it('should translate plane along normal', () => {
      const p = new Plane(Vector3.up, -5);
      p.Translate(new Vector3(0, 3, 0));

      // Plane should move 3 units up
      expect(p.distance).toBeCloseTo(-8, 5);
    });

    it('should not affect normal', () => {
      const p = new Plane(Vector3.up, 0);
      const originalNormal = p.normal;

      p.Translate(new Vector3(5, 5, 5));

      expect(p.normal.approximatelyEquals(originalNormal, 0.001)).toBe(true);
    });

    it('should handle translation perpendicular to normal', () => {
      const p = new Plane(Vector3.up, -5);
      const originalDistance = p.distance;

      p.Translate(new Vector3(10, 0, 10)); // Perpendicular to normal

      expect(p.distance).toBeCloseTo(originalDistance, 5);
    });
  });

  describe('Translate (static)', () => {
    it('should return translated plane', () => {
      const p = new Plane(Vector3.up, -5);
      const translated = Plane.Translate(p, new Vector3(0, 3, 0));

      expect(translated.distance).toBeCloseTo(-8, 5);
    });

    it('should not modify original plane', () => {
      const p = new Plane(Vector3.up, -5);
      const originalDistance = p.distance;

      Plane.Translate(p, new Vector3(0, 3, 0));

      expect(p.distance).toBe(originalDistance);
    });
  });

  describe('ClosestPointOnPlane', () => {
    it('should return point itself if on plane', () => {
      const p = new Plane(Vector3.up, 0);
      const point = new Vector3(5, 0, 5);
      const closest = p.ClosestPointOnPlane(point);

      expect(closest.approximatelyEquals(point, 0.001)).toBe(true);
    });

    it('should project point onto plane', () => {
      const p = new Plane(Vector3.up, 0);
      const point = new Vector3(5, 10, 5);
      const closest = p.ClosestPointOnPlane(point);

      expect(closest.approximatelyEquals(new Vector3(5, 0, 5), 0.001)).toBe(true);
    });

    it('should work with offset planes', () => {
      const p = new Plane(Vector3.up, -5); // Plane at y=5
      const point = new Vector3(0, 10, 0);
      const closest = p.ClosestPointOnPlane(point);

      expect(closest.y).toBeCloseTo(5, 5);
    });

    it('should handle points below plane', () => {
      const p = new Plane(Vector3.up, 0);
      const point = new Vector3(0, -5, 0);
      const closest = p.ClosestPointOnPlane(point);

      expect(closest.approximatelyEquals(new Vector3(0, 0, 0), 0.001)).toBe(true);
    });
  });

  describe('GetDistanceToPoint', () => {
    it('should return 0 for point on plane', () => {
      const p = new Plane(Vector3.up, 0);
      const point = new Vector3(5, 0, 5);
      expect(Math.abs(p.GetDistanceToPoint(point))).toBeLessThan(0.001);
    });

    it('should return positive distance for point on normal side', () => {
      const p = new Plane(Vector3.up, 0);
      const point = new Vector3(0, 5, 0);
      expect(p.GetDistanceToPoint(point)).toBeCloseTo(5, 5);
    });

    it('should return negative distance for point on opposite side', () => {
      const p = new Plane(Vector3.up, 0);
      const point = new Vector3(0, -5, 0);
      expect(p.GetDistanceToPoint(point)).toBeCloseTo(-5, 5);
    });

    it('should work with offset planes', () => {
      const p = new Plane(Vector3.up, -5); // Plane at y=5
      const point = new Vector3(0, 10, 0);
      expect(p.GetDistanceToPoint(point)).toBeCloseTo(5, 5);
    });
  });

  describe('GetSide', () => {
    it('should return true for point on positive side', () => {
      const p = new Plane(Vector3.up, 0);
      const point = new Vector3(0, 5, 0);
      expect(p.GetSide(point)).toBe(true);
    });

    it('should return false for point on negative side', () => {
      const p = new Plane(Vector3.up, 0);
      const point = new Vector3(0, -5, 0);
      expect(p.GetSide(point)).toBe(false);
    });

    it('should return false for point on plane', () => {
      const p = new Plane(Vector3.up, 0);
      const point = new Vector3(0, 0, 0);
      expect(p.GetSide(point)).toBe(false);
    });
  });

  describe('SameSide', () => {
    it('should return true for points on same positive side', () => {
      const p = new Plane(Vector3.up, 0);
      const pt0 = new Vector3(0, 5, 0);
      const pt1 = new Vector3(0, 10, 0);
      expect(p.SameSide(pt0, pt1)).toBe(true);
    });

    it('should return true for points on same negative side', () => {
      const p = new Plane(Vector3.up, 0);
      const pt0 = new Vector3(0, -5, 0);
      const pt1 = new Vector3(0, -10, 0);
      expect(p.SameSide(pt0, pt1)).toBe(true);
    });

    it('should return false for points on opposite sides', () => {
      const p = new Plane(Vector3.up, 0);
      const pt0 = new Vector3(0, 5, 0);
      const pt1 = new Vector3(0, -5, 0);
      expect(p.SameSide(pt0, pt1)).toBe(false);
    });

    it('should return true for both points on plane', () => {
      const p = new Plane(Vector3.up, 0);
      const pt0 = new Vector3(5, 0, 0);
      const pt1 = new Vector3(-5, 0, 0);
      expect(p.SameSide(pt0, pt1)).toBe(true);
    });
  });

  describe('Raycast', () => {
    it('should return distance to intersection', () => {
      const p = new Plane(Vector3.up, 0);
      const ray = new Ray(new Vector3(0, 5, 0), Vector3.down);
      const distance = p.Raycast(ray);

      expect(distance).toBeCloseTo(5, 5);
    });

    it('should return undefined for parallel ray', () => {
      const p = new Plane(Vector3.up, 0);
      const ray = new Ray(new Vector3(0, 5, 0), Vector3.right);
      const distance = p.Raycast(ray);

      expect(distance).toBeUndefined();
    });

    it('should return undefined for ray pointing away', () => {
      const p = new Plane(Vector3.up, 0);
      const ray = new Ray(new Vector3(0, 5, 0), Vector3.up);
      const distance = p.Raycast(ray);

      expect(distance).toBeUndefined();
    });

    it('should work with ray from below plane', () => {
      const p = new Plane(Vector3.up, 0);
      const ray = new Ray(new Vector3(0, -5, 0), Vector3.up);
      const distance = p.Raycast(ray);

      expect(distance).toBeCloseTo(5, 5);
    });

    it('should work with diagonal rays', () => {
      const p = new Plane(Vector3.up, 0);
      const ray = new Ray(new Vector3(0, 5, 0), new Vector3(1, -1, 0).normalized);
      const distance = p.Raycast(ray);

      expect(distance).toBeDefined();
      expect(distance!).toBeGreaterThan(0);

      // Verify intersection point is on plane
      const intersection = ray.GetPoint(distance!);
      expect(Math.abs(p.GetDistanceToPoint(intersection))).toBeLessThan(0.01);
    });

    it('should handle ray starting on plane', () => {
      const p = new Plane(Vector3.up, 0);
      const ray = new Ray(new Vector3(0, 0, 0), Vector3.down);
      const distance = p.Raycast(ray);

      // Ray starting on plane intersects at distance 0
      expect(distance).toBeDefined();
      expect(distance).toBeCloseTo(0, 5);
    });
  });

  describe('toString', () => {
    it('should format plane as string', () => {
      const p = new Plane(Vector3.up, 5);
      const str = p.toString();
      expect(str).toContain('normal');
      expect(str).toContain('distance');
    });

    it('should include normal values', () => {
      const p = new Plane(Vector3.right, 3);
      const str = p.toString();
      expect(str).toContain('1'); // Right has x=1
    });

    it('should include distance value', () => {
      const p = new Plane(Vector3.up, 7.5);
      const str = p.toString();
      expect(str).toContain('7.5');
    });
  });

  describe('integration tests', () => {
    it('should work with XY plane', () => {
      const p = new Plane(Vector3.forward, 0);
      expect(p.GetDistanceToPoint(new Vector3(0, 0, 5))).toBeCloseTo(5, 5);
      expect(p.GetDistanceToPoint(new Vector3(5, 5, 0))).toBeCloseTo(0, 5);
    });

    it('should work with YZ plane', () => {
      const p = new Plane(Vector3.right, 0);
      expect(p.GetDistanceToPoint(new Vector3(5, 0, 0))).toBeCloseTo(5, 5);
      expect(p.GetDistanceToPoint(new Vector3(0, 5, 5))).toBeCloseTo(0, 5);
    });

    it('should work with arbitrary plane', () => {
      const normal = new Vector3(1, 1, 1).normalized;
      const p = new Plane(normal, 0);

      const pointOnPlane = new Vector3(1, 0, -1);
      expect(Math.abs(p.GetDistanceToPoint(pointOnPlane))).toBeLessThan(0.01);
    });
  });

  describe('performance', () => {
    it('should handle many distance calculations', () => {
      const start = performance.now();
      const p = new Plane(Vector3.up, 0);

      for (let i = 0; i < 10000; i++) {
        p.GetDistanceToPoint(new Vector3(i, i, i));
      }

      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(100); // Should complete in <100ms
    });

    it('should handle many raycast operations', () => {
      const start = performance.now();
      const p = new Plane(Vector3.up, 0);

      for (let i = 0; i < 10000; i++) {
        const ray = new Ray(new Vector3(0, i, 0), Vector3.down);
        p.Raycast(ray);
      }

      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(100); // Should complete in <100ms
    });
  });
});
