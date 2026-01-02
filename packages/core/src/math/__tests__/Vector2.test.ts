import { describe, it, expect } from 'vitest';
import { Vector2 } from '../Vector2';

describe('Vector2', () => {
  describe('constructor', () => {
    it('should create zero vector by default', () => {
      const v = new Vector2();
      expect(v.x).toBe(0);
      expect(v.y).toBe(0);
    });

    it('should create vector with specified values', () => {
      const v = new Vector2(1, 2);
      expect(v.x).toBe(1);
      expect(v.y).toBe(2);
    });

    it('should handle partial parameters', () => {
      const v = new Vector2(1);
      expect(v.x).toBe(1);
      expect(v.y).toBe(0);
    });
  });

  describe('Add', () => {
    it('should add two vectors', () => {
      const a = new Vector2(1, 2);
      const b = new Vector2(3, 4);
      const result = Vector2.Add(a, b);
      expect(result.x).toBe(4);
      expect(result.y).toBe(6);
    });

    it('should not modify original vectors', () => {
      const a = new Vector2(1, 2);
      const b = new Vector2(3, 4);
      Vector2.Add(a, b);
      expect(a.x).toBe(1);
      expect(b.x).toBe(3);
    });
  });

  describe('Subtract', () => {
    it('should subtract vectors', () => {
      const a = new Vector2(5, 7);
      const b = new Vector2(1, 2);
      const result = Vector2.Subtract(a, b);
      expect(result.x).toBe(4);
      expect(result.y).toBe(5);
    });
  });

  describe('Scale', () => {
    it('should scale vector by scalar', () => {
      const v = new Vector2(1, 2);
      const result = Vector2.Scale(v, 3);
      expect(result.x).toBe(3);
      expect(result.y).toBe(6);
    });

    it('should handle negative scalars', () => {
      const v = new Vector2(1, 2);
      const result = Vector2.Scale(v, -1);
      expect(result.x).toBe(-1);
      expect(result.y).toBe(-2);
    });

    it('should handle zero scalar', () => {
      const v = new Vector2(1, 2);
      const result = Vector2.Scale(v, 0);
      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
    });
  });

  describe('Multiply', () => {
    it('should multiply vectors component-wise', () => {
      const a = new Vector2(2, 3);
      const b = new Vector2(4, 5);
      const result = Vector2.Multiply(a, b);
      expect(result.x).toBe(8);
      expect(result.y).toBe(15);
    });
  });

  describe('Divide', () => {
    it('should divide vector by scalar', () => {
      const v = new Vector2(10, 20);
      const result = Vector2.Divide(v, 2);
      expect(result.x).toBe(5);
      expect(result.y).toBe(10);
    });

    it('should handle division by zero', () => {
      const v = new Vector2(1, 2);
      const result = Vector2.Divide(v, 0);
      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
    });
  });

  describe('Dot', () => {
    it('should calculate dot product', () => {
      const a = new Vector2(1, 2);
      const b = new Vector2(3, 4);
      expect(Vector2.Dot(a, b)).toBe(11); // 1*3 + 2*4 = 11
    });

    it('should return 0 for perpendicular vectors', () => {
      const a = new Vector2(1, 0);
      const b = new Vector2(0, 1);
      expect(Vector2.Dot(a, b)).toBe(0);
    });

    it('should return positive for same direction', () => {
      const a = new Vector2(1, 0);
      const b = new Vector2(2, 0);
      expect(Vector2.Dot(a, b)).toBeGreaterThan(0);
    });
  });

  describe('Distance', () => {
    it('should calculate distance between points', () => {
      const a = new Vector2(0, 0);
      const b = new Vector2(3, 4);
      expect(Vector2.Distance(a, b)).toBe(5);
    });

    it('should return 0 for same point', () => {
      const a = new Vector2(1, 2);
      const b = new Vector2(1, 2);
      expect(Vector2.Distance(a, b)).toBe(0);
    });

    it('should calculate diagonal distance', () => {
      const a = new Vector2(0, 0);
      const b = new Vector2(1, 1);
      expect(Vector2.Distance(a, b)).toBeCloseTo(Math.sqrt(2));
    });
  });

  describe('SqrDistance', () => {
    it('should calculate squared distance', () => {
      const a = new Vector2(0, 0);
      const b = new Vector2(3, 4);
      expect(Vector2.SqrDistance(a, b)).toBe(25); // 3^2 + 4^2 = 25
    });

    it('should match distance squared', () => {
      const a = new Vector2(1, 2);
      const b = new Vector2(4, 6);
      const sqrDist = Vector2.SqrDistance(a, b);
      const dist = Vector2.Distance(a, b);
      expect(sqrDist).toBeCloseTo(dist * dist);
    });
  });

  describe('Lerp', () => {
    it('should interpolate between vectors', () => {
      const a = new Vector2(0, 0);
      const b = new Vector2(10, 10);
      const result = Vector2.Lerp(a, b, 0.5);
      expect(result.x).toBe(5);
      expect(result.y).toBe(5);
    });

    it('should clamp t to [0, 1]', () => {
      const a = new Vector2(0, 0);
      const b = new Vector2(10, 10);
      const result1 = Vector2.Lerp(a, b, -0.5);
      const result2 = Vector2.Lerp(a, b, 1.5);
      expect(result1.equals(a)).toBe(true);
      expect(result2.equals(b)).toBe(true);
    });

    it('should return start at t=0', () => {
      const a = new Vector2(1, 2);
      const b = new Vector2(3, 4);
      const result = Vector2.Lerp(a, b, 0);
      expect(result.equals(a)).toBe(true);
    });

    it('should return end at t=1', () => {
      const a = new Vector2(1, 2);
      const b = new Vector2(3, 4);
      const result = Vector2.Lerp(a, b, 1);
      expect(result.equals(b)).toBe(true);
    });
  });

  describe('LerpUnclamped', () => {
    it('should interpolate without clamping', () => {
      const a = new Vector2(0, 0);
      const b = new Vector2(10, 10);
      const result = Vector2.LerpUnclamped(a, b, 1.5);
      expect(result.x).toBe(15);
      expect(result.y).toBe(15);
    });

    it('should allow negative t', () => {
      const a = new Vector2(0, 0);
      const b = new Vector2(10, 10);
      const result = Vector2.LerpUnclamped(a, b, -0.5);
      expect(result.x).toBe(-5);
      expect(result.y).toBe(-5);
    });
  });

  describe('MoveTowards', () => {
    it('should move towards target', () => {
      const current = new Vector2(0, 0);
      const target = new Vector2(10, 0);
      const result = Vector2.MoveTowards(current, target, 5);
      expect(result.x).toBe(5);
      expect(result.y).toBe(0);
    });

    it('should not overshoot target', () => {
      const current = new Vector2(0, 0);
      const target = new Vector2(5, 0);
      const result = Vector2.MoveTowards(current, target, 10);
      expect(result.equals(target)).toBe(true);
    });

    it('should handle diagonal movement', () => {
      const current = new Vector2(0, 0);
      const target = new Vector2(3, 4);
      const result = Vector2.MoveTowards(current, target, 2.5);
      expect(result.magnitude).toBeCloseTo(2.5);
    });
  });

  describe('Min', () => {
    it('should return minimum components', () => {
      const a = new Vector2(1, 5);
      const b = new Vector2(4, 2);
      const result = Vector2.Min(a, b);
      expect(result.x).toBe(1);
      expect(result.y).toBe(2);
    });
  });

  describe('Max', () => {
    it('should return maximum components', () => {
      const a = new Vector2(1, 5);
      const b = new Vector2(4, 2);
      const result = Vector2.Max(a, b);
      expect(result.x).toBe(4);
      expect(result.y).toBe(5);
    });
  });

  describe('ClampMagnitude', () => {
    it('should clamp vector magnitude', () => {
      const v = new Vector2(3, 4);
      const result = Vector2.ClampMagnitude(v, 2);
      expect(result.magnitude).toBeCloseTo(2);
    });

    it('should not clamp if magnitude is less than max', () => {
      const v = new Vector2(1, 0);
      const result = Vector2.ClampMagnitude(v, 5);
      expect(result.equals(v)).toBe(true);
    });

    it('should preserve direction', () => {
      const v = new Vector2(3, 4);
      const result = Vector2.ClampMagnitude(v, 2);
      const originalNormalized = v.normalized;
      const resultNormalized = result.normalized;
      expect(resultNormalized.approximatelyEquals(originalNormalized, 0.001)).toBe(true);
    });
  });

  describe('Angle', () => {
    it('should calculate angle between vectors', () => {
      const a = new Vector2(1, 0);
      const b = new Vector2(0, 1);
      expect(Vector2.Angle(a, b)).toBeCloseTo(90);
    });

    it('should return 0 for parallel vectors', () => {
      const a = new Vector2(1, 2);
      const b = new Vector2(2, 4);
      expect(Vector2.Angle(a, b)).toBeCloseTo(0);
    });

    it('should return 180 for opposite vectors', () => {
      const a = new Vector2(1, 0);
      const b = new Vector2(-1, 0);
      expect(Vector2.Angle(a, b)).toBeCloseTo(180);
    });

    it('should return 45 degrees for diagonal', () => {
      const a = new Vector2(1, 0);
      const b = new Vector2(1, 1);
      expect(Vector2.Angle(a, b)).toBeCloseTo(45);
    });
  });

  describe('SignedAngle', () => {
    it('should calculate signed angle', () => {
      const from = new Vector2(1, 0);
      const to = new Vector2(0, 1);
      expect(Vector2.SignedAngle(from, to)).toBeCloseTo(90);
    });

    it('should return negative angle for clockwise rotation', () => {
      const from = new Vector2(1, 0);
      const to = new Vector2(0, -1);
      expect(Vector2.SignedAngle(from, to)).toBeCloseTo(-90);
    });

    it('should distinguish between clockwise and counter-clockwise', () => {
      const from = new Vector2(1, 0);
      const toCCW = new Vector2(0, 1);
      const toCW = new Vector2(0, -1);
      expect(Vector2.SignedAngle(from, toCCW)).toBeGreaterThan(0);
      expect(Vector2.SignedAngle(from, toCW)).toBeLessThan(0);
    });
  });

  describe('Reflect', () => {
    it('should reflect vector off surface', () => {
      const inDirection = new Vector2(1, -1).normalized;
      const inNormal = new Vector2(0, 1);
      const result = Vector2.Reflect(inDirection, inNormal);
      expect(result.y).toBeGreaterThan(0); // Should bounce up
    });

    it('should preserve magnitude', () => {
      const inDirection = new Vector2(1, -1);
      const inNormal = new Vector2(0, 1);
      const result = Vector2.Reflect(inDirection, inNormal);
      expect(result.magnitude).toBeCloseTo(inDirection.magnitude);
    });

    it('should handle horizontal surface', () => {
      const inDirection = new Vector2(2, -3);
      const inNormal = new Vector2(0, 1);
      const result = Vector2.Reflect(inDirection, inNormal);
      expect(result.x).toBeCloseTo(2);
      expect(result.y).toBeCloseTo(3);
    });
  });

  describe('Perpendicular', () => {
    it('should create perpendicular vector', () => {
      const v = new Vector2(1, 0);
      const perp = Vector2.Perpendicular(v);
      expect(Vector2.Dot(v, perp)).toBeCloseTo(0);
    });

    it('should rotate 90 degrees counter-clockwise', () => {
      const v = new Vector2(1, 0);
      const perp = Vector2.Perpendicular(v);
      expect(perp.x).toBeCloseTo(0);
      expect(perp.y).toBeCloseTo(1);
    });

    it('should preserve magnitude', () => {
      const v = new Vector2(3, 4);
      const perp = Vector2.Perpendicular(v);
      expect(perp.magnitude).toBeCloseTo(v.magnitude);
    });
  });

  describe('magnitude', () => {
    it('should calculate magnitude', () => {
      const v = new Vector2(3, 4);
      expect(v.magnitude).toBe(5);
    });

    it('should return 0 for zero vector', () => {
      const v = Vector2.zero;
      expect(v.magnitude).toBe(0);
    });

    it('should calculate diagonal magnitude', () => {
      const v = new Vector2(1, 1);
      expect(v.magnitude).toBeCloseTo(Math.sqrt(2));
    });
  });

  describe('sqrMagnitude', () => {
    it('should calculate squared magnitude', () => {
      const v = new Vector2(3, 4);
      expect(v.sqrMagnitude).toBe(25);
    });

    it('should match magnitude squared', () => {
      const v = new Vector2(5, 12);
      expect(v.sqrMagnitude).toBe(v.magnitude * v.magnitude);
    });
  });

  describe('normalized', () => {
    it('should return unit vector', () => {
      const v = new Vector2(3, 4);
      const normalized = v.normalized;
      expect(normalized.magnitude).toBeCloseTo(1);
    });

    it('should preserve direction', () => {
      const v = new Vector2(5, 0);
      const normalized = v.normalized;
      expect(normalized.x).toBeCloseTo(1);
      expect(normalized.y).toBeCloseTo(0);
    });

    it('should return zero for zero vector', () => {
      const v = Vector2.zero;
      const normalized = v.normalized;
      expect(normalized.equals(Vector2.zero)).toBe(true);
    });
  });

  describe('Normalize', () => {
    it('should normalize vector in place', () => {
      const v = new Vector2(3, 4);
      v.Normalize();
      expect(v.magnitude).toBeCloseTo(1);
    });

    it('should handle zero vector', () => {
      const v = new Vector2(0, 0);
      v.Normalize();
      expect(v.equals(Vector2.zero)).toBe(true);
    });

    it('should modify original vector', () => {
      const v = new Vector2(10, 0);
      const original = v.clone();
      v.Normalize();
      expect(v.equals(original)).toBe(false);
    });
  });

  describe('Set', () => {
    it('should set vector components', () => {
      const v = new Vector2();
      v.Set(1, 2);
      expect(v.x).toBe(1);
      expect(v.y).toBe(2);
    });

    it('should overwrite existing values', () => {
      const v = new Vector2(5, 6);
      v.Set(1, 2);
      expect(v.x).toBe(1);
      expect(v.y).toBe(2);
    });
  });

  describe('Scale (instance)', () => {
    it('should scale vector in place', () => {
      const v = new Vector2(1, 2);
      v.Scale(new Vector2(3, 4));
      expect(v.x).toBe(3);
      expect(v.y).toBe(8);
    });

    it('should modify original vector', () => {
      const v = new Vector2(2, 3);
      const original = v.clone();
      v.Scale(new Vector2(2, 2));
      expect(v.equals(original)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should format vector as string', () => {
      const v = new Vector2(1.234, 2.567);
      expect(v.toString(2)).toBe('(1.23, 2.57)');
    });

    it('should use default precision', () => {
      const v = new Vector2(1, 2);
      expect(v.toString()).toContain('1.00');
    });

    it('should handle custom precision', () => {
      const v = new Vector2(Math.PI, Math.E);
      expect(v.toString(5)).toContain('3.14159');
    });
  });

  describe('clone', () => {
    it('should create copy of vector', () => {
      const v = new Vector2(1, 2);
      const copy = v.clone();
      expect(copy.equals(v)).toBe(true);
      expect(copy).not.toBe(v);
    });

    it('should not share reference', () => {
      const v = new Vector2(1, 2);
      const copy = v.clone();
      copy.x = 10;
      expect(v.x).toBe(1);
    });
  });

  describe('equals', () => {
    it('should return true for equal vectors', () => {
      const a = new Vector2(1, 2);
      const b = new Vector2(1, 2);
      expect(a.equals(b)).toBe(true);
    });

    it('should return false for different vectors', () => {
      const a = new Vector2(1, 2);
      const b = new Vector2(1, 3);
      expect(a.equals(b)).toBe(false);
    });

    it('should be exact comparison', () => {
      const a = new Vector2(1.0, 2.0);
      const b = new Vector2(1.0000001, 2.0);
      expect(a.equals(b)).toBe(false);
    });
  });

  describe('approximatelyEquals', () => {
    it('should return true for approximately equal vectors', () => {
      const a = new Vector2(1.00001, 2.00001);
      const b = new Vector2(1, 2);
      expect(a.approximatelyEquals(b, 0.001)).toBe(true);
    });

    it('should use default tolerance', () => {
      const a = new Vector2(1.000001, 2.000001);
      const b = new Vector2(1, 2);
      expect(a.approximatelyEquals(b)).toBe(true);
    });

    it('should return false if difference exceeds tolerance', () => {
      const a = new Vector2(1.1, 2);
      const b = new Vector2(1, 2);
      expect(a.approximatelyEquals(b, 0.01)).toBe(false);
    });
  });

  describe('static vector constants', () => {
    it('should provide zero vector', () => {
      const v = Vector2.zero;
      expect(v.x).toBe(0);
      expect(v.y).toBe(0);
    });

    it('should provide one vector', () => {
      const v = Vector2.one;
      expect(v.x).toBe(1);
      expect(v.y).toBe(1);
    });

    it('should provide up vector', () => {
      const v = Vector2.up;
      expect(v.x).toBe(0);
      expect(v.y).toBe(1);
    });

    it('should provide down vector', () => {
      const v = Vector2.down;
      expect(v.x).toBe(0);
      expect(v.y).toBe(-1);
    });

    it('should provide left vector', () => {
      const v = Vector2.left;
      expect(v.x).toBe(-1);
      expect(v.y).toBe(0);
    });

    it('should provide right vector', () => {
      const v = Vector2.right;
      expect(v.x).toBe(1);
      expect(v.y).toBe(0);
    });

    it('should provide positive infinity', () => {
      const v = Vector2.positiveInfinity;
      expect(v.x).toBe(Infinity);
      expect(v.y).toBe(Infinity);
    });

    it('should provide negative infinity', () => {
      const v = Vector2.negativeInfinity;
      expect(v.x).toBe(-Infinity);
      expect(v.y).toBe(-Infinity);
    });
  });

  describe('SmoothDamp', () => {
    it('should smoothly damp towards target', () => {
      const current = new Vector2(0, 0);
      const target = new Vector2(10, 0);
      const velocity = new Vector2(0, 0);
      const result = Vector2.SmoothDamp(current, target, velocity, 0.3, Infinity, 0.016);

      expect(result.x).toBeGreaterThan(0);
      expect(result.x).toBeLessThan(10);
    });

    it('should modify velocity', () => {
      const current = new Vector2(0, 0);
      const target = new Vector2(10, 0);
      const velocity = new Vector2(0, 0);
      Vector2.SmoothDamp(current, target, velocity, 0.3);

      expect(velocity.x).not.toBe(0);
    });

    it('should work in 2D', () => {
      const current = new Vector2(0, 0);
      const target = new Vector2(10, 10);
      const velocity = new Vector2(0, 0);
      const result = Vector2.SmoothDamp(current, target, velocity, 0.3);

      expect(result.x).toBeGreaterThan(0);
      expect(result.y).toBeGreaterThan(0);
    });
  });

  describe('performance tests', () => {
    it('should handle large number of operations', () => {
      const start = performance.now();
      for (let i = 0; i < 10000; i++) {
        const a = new Vector2(i, i + 1);
        const b = new Vector2(i + 2, i + 3);
        Vector2.Add(a, b);
        Vector2.Dot(a, b);
        a.magnitude;
      }
      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(100); // Should complete in <100ms
    });
  });
});
