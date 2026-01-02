import { describe, it, expect, beforeEach } from 'vitest';
import { Vector3 } from '../Vector3';

describe('Vector3', () => {
  describe('constructor', () => {
    it('should create zero vector by default', () => {
      const v = new Vector3();
      expect(v.x).toBe(0);
      expect(v.y).toBe(0);
      expect(v.z).toBe(0);
    });

    it('should create vector with specified values', () => {
      const v = new Vector3(1, 2, 3);
      expect(v.x).toBe(1);
      expect(v.y).toBe(2);
      expect(v.z).toBe(3);
    });

    it('should handle partial parameters', () => {
      const v = new Vector3(1, 2);
      expect(v.x).toBe(1);
      expect(v.y).toBe(2);
      expect(v.z).toBe(0);
    });
  });

  describe('Add', () => {
    it('should add two vectors', () => {
      const a = new Vector3(1, 2, 3);
      const b = new Vector3(4, 5, 6);
      const result = Vector3.Add(a, b);
      expect(result.x).toBe(5);
      expect(result.y).toBe(7);
      expect(result.z).toBe(9);
    });

    it('should not modify original vectors', () => {
      const a = new Vector3(1, 2, 3);
      const b = new Vector3(4, 5, 6);
      Vector3.Add(a, b);
      expect(a.x).toBe(1);
      expect(b.x).toBe(4);
    });
  });

  describe('Subtract', () => {
    it('should subtract vectors', () => {
      const a = new Vector3(5, 7, 9);
      const b = new Vector3(1, 2, 3);
      const result = Vector3.Subtract(a, b);
      expect(result.x).toBe(4);
      expect(result.y).toBe(5);
      expect(result.z).toBe(6);
    });
  });

  describe('Scale', () => {
    it('should scale vector by scalar', () => {
      const v = new Vector3(1, 2, 3);
      const result = Vector3.Scale(v, 2);
      expect(result.x).toBe(2);
      expect(result.y).toBe(4);
      expect(result.z).toBe(6);
    });

    it('should handle negative scalars', () => {
      const v = new Vector3(1, 2, 3);
      const result = Vector3.Scale(v, -1);
      expect(result.x).toBe(-1);
      expect(result.y).toBe(-2);
      expect(result.z).toBe(-3);
    });

    it('should handle zero scalar', () => {
      const v = new Vector3(1, 2, 3);
      const result = Vector3.Scale(v, 0);
      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
      expect(result.z).toBe(0);
    });
  });

  describe('Multiply', () => {
    it('should multiply vectors component-wise', () => {
      const a = new Vector3(2, 3, 4);
      const b = new Vector3(5, 6, 7);
      const result = Vector3.Multiply(a, b);
      expect(result.x).toBe(10);
      expect(result.y).toBe(18);
      expect(result.z).toBe(28);
    });
  });

  describe('Divide', () => {
    it('should divide vector by scalar', () => {
      const v = new Vector3(10, 20, 30);
      const result = Vector3.Divide(v, 2);
      expect(result.x).toBe(5);
      expect(result.y).toBe(10);
      expect(result.z).toBe(15);
    });

    it('should handle division by zero', () => {
      const v = new Vector3(1, 2, 3);
      const result = Vector3.Divide(v, 0);
      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
      expect(result.z).toBe(0);
    });
  });

  describe('Dot', () => {
    it('should calculate dot product', () => {
      const a = new Vector3(1, 2, 3);
      const b = new Vector3(4, 5, 6);
      expect(Vector3.Dot(a, b)).toBe(32); // 1*4 + 2*5 + 3*6 = 32
    });

    it('should return 0 for perpendicular vectors', () => {
      const a = new Vector3(1, 0, 0);
      const b = new Vector3(0, 1, 0);
      expect(Vector3.Dot(a, b)).toBe(0);
    });

    it('should return positive for same direction', () => {
      const a = new Vector3(1, 0, 0);
      const b = new Vector3(2, 0, 0);
      expect(Vector3.Dot(a, b)).toBeGreaterThan(0);
    });
  });

  describe('Cross', () => {
    it('should calculate cross product', () => {
      const a = new Vector3(1, 0, 0);
      const b = new Vector3(0, 1, 0);
      const result = Vector3.Cross(a, b);
      expect(result.x).toBe(0);
      expect(result.y).toBe(0);
      expect(result.z).toBe(1);
    });

    it('should produce perpendicular vector', () => {
      const a = new Vector3(1, 2, 3);
      const b = new Vector3(4, 5, 6);
      const result = Vector3.Cross(a, b);
      expect(Vector3.Dot(result, a)).toBeCloseTo(0);
      expect(Vector3.Dot(result, b)).toBeCloseTo(0);
    });
  });

  describe('Distance', () => {
    it('should calculate distance between points', () => {
      const a = new Vector3(0, 0, 0);
      const b = new Vector3(3, 4, 0);
      expect(Vector3.Distance(a, b)).toBe(5);
    });

    it('should return 0 for same point', () => {
      const a = new Vector3(1, 2, 3);
      const b = new Vector3(1, 2, 3);
      expect(Vector3.Distance(a, b)).toBe(0);
    });

    it('should calculate 3D distance', () => {
      const a = new Vector3(1, 2, 2);
      const b = new Vector3(2, 3, 3);
      expect(Vector3.Distance(a, b)).toBeCloseTo(Math.sqrt(3));
    });
  });

  describe('SqrDistance', () => {
    it('should calculate squared distance', () => {
      const a = new Vector3(0, 0, 0);
      const b = new Vector3(3, 4, 0);
      expect(Vector3.SqrDistance(a, b)).toBe(25); // 3^2 + 4^2 = 25
    });

    it('should be faster than Distance', () => {
      const a = new Vector3(1, 2, 3);
      const b = new Vector3(4, 5, 6);
      const sqrDist = Vector3.SqrDistance(a, b);
      const dist = Vector3.Distance(a, b);
      expect(sqrDist).toBe(dist * dist);
    });
  });

  describe('Lerp', () => {
    it('should interpolate between vectors', () => {
      const a = new Vector3(0, 0, 0);
      const b = new Vector3(10, 10, 10);
      const result = Vector3.Lerp(a, b, 0.5);
      expect(result.x).toBe(5);
      expect(result.y).toBe(5);
      expect(result.z).toBe(5);
    });

    it('should clamp t to [0, 1]', () => {
      const a = new Vector3(0, 0, 0);
      const b = new Vector3(10, 10, 10);
      const result1 = Vector3.Lerp(a, b, -0.5);
      const result2 = Vector3.Lerp(a, b, 1.5);
      expect(result1.equals(a)).toBe(true);
      expect(result2.equals(b)).toBe(true);
    });

    it('should return start at t=0', () => {
      const a = new Vector3(1, 2, 3);
      const b = new Vector3(4, 5, 6);
      const result = Vector3.Lerp(a, b, 0);
      expect(result.equals(a)).toBe(true);
    });

    it('should return end at t=1', () => {
      const a = new Vector3(1, 2, 3);
      const b = new Vector3(4, 5, 6);
      const result = Vector3.Lerp(a, b, 1);
      expect(result.equals(b)).toBe(true);
    });
  });

  describe('LerpUnclamped', () => {
    it('should interpolate without clamping', () => {
      const a = new Vector3(0, 0, 0);
      const b = new Vector3(10, 10, 10);
      const result = Vector3.LerpUnclamped(a, b, 1.5);
      expect(result.x).toBe(15);
      expect(result.y).toBe(15);
      expect(result.z).toBe(15);
    });

    it('should allow negative t', () => {
      const a = new Vector3(0, 0, 0);
      const b = new Vector3(10, 10, 10);
      const result = Vector3.LerpUnclamped(a, b, -0.5);
      expect(result.x).toBe(-5);
      expect(result.y).toBe(-5);
      expect(result.z).toBe(-5);
    });
  });

  describe('MoveTowards', () => {
    it('should move towards target', () => {
      const current = new Vector3(0, 0, 0);
      const target = new Vector3(10, 0, 0);
      const result = Vector3.MoveTowards(current, target, 5);
      expect(result.x).toBe(5);
      expect(result.y).toBe(0);
      expect(result.z).toBe(0);
    });

    it('should not overshoot target', () => {
      const current = new Vector3(0, 0, 0);
      const target = new Vector3(5, 0, 0);
      const result = Vector3.MoveTowards(current, target, 10);
      expect(result.equals(target)).toBe(true);
    });
  });

  describe('Min', () => {
    it('should return minimum components', () => {
      const a = new Vector3(1, 5, 3);
      const b = new Vector3(4, 2, 6);
      const result = Vector3.Min(a, b);
      expect(result.x).toBe(1);
      expect(result.y).toBe(2);
      expect(result.z).toBe(3);
    });
  });

  describe('Max', () => {
    it('should return maximum components', () => {
      const a = new Vector3(1, 5, 3);
      const b = new Vector3(4, 2, 6);
      const result = Vector3.Max(a, b);
      expect(result.x).toBe(4);
      expect(result.y).toBe(5);
      expect(result.z).toBe(6);
    });
  });

  describe('ClampMagnitude', () => {
    it('should clamp vector magnitude', () => {
      const v = new Vector3(3, 4, 0);
      const result = Vector3.ClampMagnitude(v, 2);
      expect(result.magnitude).toBeCloseTo(2);
    });

    it('should not clamp if magnitude is less than max', () => {
      const v = new Vector3(1, 0, 0);
      const result = Vector3.ClampMagnitude(v, 5);
      expect(result.equals(v)).toBe(true);
    });
  });

  describe('Angle', () => {
    it('should calculate angle between vectors', () => {
      const a = new Vector3(1, 0, 0);
      const b = new Vector3(0, 1, 0);
      expect(Vector3.Angle(a, b)).toBeCloseTo(90);
    });

    it('should return 0 for parallel vectors', () => {
      const a = new Vector3(1, 2, 3);
      const b = new Vector3(2, 4, 6);
      expect(Vector3.Angle(a, b)).toBeCloseTo(0);
    });

    it('should return 180 for opposite vectors', () => {
      const a = new Vector3(1, 0, 0);
      const b = new Vector3(-1, 0, 0);
      expect(Vector3.Angle(a, b)).toBeCloseTo(180);
    });
  });

  describe('SignedAngle', () => {
    it('should calculate signed angle', () => {
      const from = new Vector3(1, 0, 0);
      const to = new Vector3(0, 1, 0);
      const axis = new Vector3(0, 0, 1);
      expect(Vector3.SignedAngle(from, to, axis)).toBeCloseTo(90);
    });

    it('should return negative angle for opposite direction', () => {
      const from = new Vector3(1, 0, 0);
      const to = new Vector3(0, -1, 0);
      const axis = new Vector3(0, 0, 1);
      expect(Vector3.SignedAngle(from, to, axis)).toBeCloseTo(-90);
    });
  });

  describe('Project', () => {
    it('should project vector onto normal', () => {
      const v = new Vector3(1, 1, 0);
      const onNormal = new Vector3(1, 0, 0);
      const result = Vector3.Project(v, onNormal);
      expect(result.x).toBeCloseTo(1);
      expect(result.y).toBeCloseTo(0);
      expect(result.z).toBeCloseTo(0);
    });
  });

  describe('ProjectOnPlane', () => {
    it('should project vector onto plane', () => {
      const v = new Vector3(1, 1, 0);
      const planeNormal = new Vector3(0, 1, 0);
      const result = Vector3.ProjectOnPlane(v, planeNormal);
      expect(result.x).toBeCloseTo(1);
      expect(result.y).toBeCloseTo(0);
      expect(result.z).toBeCloseTo(0);
    });
  });

  describe('Reflect', () => {
    it('should reflect vector off surface', () => {
      const inDirection = new Vector3(1, -1, 0).normalized;
      const inNormal = new Vector3(0, 1, 0);
      const result = Vector3.Reflect(inDirection, inNormal);
      expect(result.y).toBeGreaterThan(0); // Should bounce up
    });
  });

  describe('magnitude', () => {
    it('should calculate magnitude', () => {
      const v = new Vector3(3, 4, 0);
      expect(v.magnitude).toBe(5);
    });

    it('should return 0 for zero vector', () => {
      const v = Vector3.zero;
      expect(v.magnitude).toBe(0);
    });

    it('should handle 3D magnitude', () => {
      const v = new Vector3(1, 1, 1);
      expect(v.magnitude).toBeCloseTo(Math.sqrt(3));
    });
  });

  describe('sqrMagnitude', () => {
    it('should calculate squared magnitude', () => {
      const v = new Vector3(3, 4, 0);
      expect(v.sqrMagnitude).toBe(25);
    });

    it('should be faster than magnitude', () => {
      const v = new Vector3(1, 2, 3);
      expect(v.sqrMagnitude).toBe(v.magnitude * v.magnitude);
    });
  });

  describe('normalized', () => {
    it('should return unit vector', () => {
      const v = new Vector3(3, 4, 0);
      const normalized = v.normalized;
      expect(normalized.magnitude).toBeCloseTo(1);
    });

    it('should preserve direction', () => {
      const v = new Vector3(5, 0, 0);
      const normalized = v.normalized;
      expect(normalized.x).toBeCloseTo(1);
      expect(normalized.y).toBeCloseTo(0);
      expect(normalized.z).toBeCloseTo(0);
    });

    it('should return zero for zero vector', () => {
      const v = Vector3.zero;
      const normalized = v.normalized;
      expect(normalized.equals(Vector3.zero)).toBe(true);
    });
  });

  describe('Normalize', () => {
    it('should normalize vector in place', () => {
      const v = new Vector3(3, 4, 0);
      v.Normalize();
      expect(v.magnitude).toBeCloseTo(1);
    });

    it('should handle zero vector', () => {
      const v = new Vector3(0, 0, 0);
      v.Normalize();
      expect(v.equals(Vector3.zero)).toBe(true);
    });
  });

  describe('Set', () => {
    it('should set vector components', () => {
      const v = new Vector3();
      v.Set(1, 2, 3);
      expect(v.x).toBe(1);
      expect(v.y).toBe(2);
      expect(v.z).toBe(3);
    });
  });

  describe('Scale (instance)', () => {
    it('should scale vector in place', () => {
      const v = new Vector3(1, 2, 3);
      v.Scale(new Vector3(2, 3, 4));
      expect(v.x).toBe(2);
      expect(v.y).toBe(6);
      expect(v.z).toBe(12);
    });
  });

  describe('toString', () => {
    it('should format vector as string', () => {
      const v = new Vector3(1.234, 2.567, 3.891);
      expect(v.toString(2)).toBe('(1.23, 2.57, 3.89)');
    });

    it('should use default precision', () => {
      const v = new Vector3(1, 2, 3);
      expect(v.toString()).toContain('1.00');
    });
  });

  describe('clone', () => {
    it('should create copy of vector', () => {
      const v = new Vector3(1, 2, 3);
      const copy = v.clone();
      expect(copy.equals(v)).toBe(true);
      expect(copy).not.toBe(v);
    });

    it('should not share reference', () => {
      const v = new Vector3(1, 2, 3);
      const copy = v.clone();
      copy.x = 10;
      expect(v.x).toBe(1);
    });
  });

  describe('equals', () => {
    it('should return true for equal vectors', () => {
      const a = new Vector3(1, 2, 3);
      const b = new Vector3(1, 2, 3);
      expect(a.equals(b)).toBe(true);
    });

    it('should return false for different vectors', () => {
      const a = new Vector3(1, 2, 3);
      const b = new Vector3(1, 2, 4);
      expect(a.equals(b)).toBe(false);
    });
  });

  describe('approximatelyEquals', () => {
    it('should return true for approximately equal vectors', () => {
      const a = new Vector3(1.00001, 2.00001, 3.00001);
      const b = new Vector3(1, 2, 3);
      expect(a.approximatelyEquals(b, 0.001)).toBe(true);
    });

    it('should use default tolerance', () => {
      const a = new Vector3(1.000001, 2.000001, 3.000001);
      const b = new Vector3(1, 2, 3);
      expect(a.approximatelyEquals(b)).toBe(true);
    });
  });

  describe('static vector constants', () => {
    it('should provide zero vector', () => {
      const v = Vector3.zero;
      expect(v.x).toBe(0);
      expect(v.y).toBe(0);
      expect(v.z).toBe(0);
    });

    it('should provide one vector', () => {
      const v = Vector3.one;
      expect(v.x).toBe(1);
      expect(v.y).toBe(1);
      expect(v.z).toBe(1);
    });

    it('should provide up vector', () => {
      const v = Vector3.up;
      expect(v.x).toBe(0);
      expect(v.y).toBe(1);
      expect(v.z).toBe(0);
    });

    it('should provide down vector', () => {
      const v = Vector3.down;
      expect(v.x).toBe(0);
      expect(v.y).toBe(-1);
      expect(v.z).toBe(0);
    });

    it('should provide left vector', () => {
      const v = Vector3.left;
      expect(v.x).toBe(-1);
      expect(v.y).toBe(0);
      expect(v.z).toBe(0);
    });

    it('should provide right vector', () => {
      const v = Vector3.right;
      expect(v.x).toBe(1);
      expect(v.y).toBe(0);
      expect(v.z).toBe(0);
    });

    it('should provide forward vector', () => {
      const v = Vector3.forward;
      expect(v.x).toBe(0);
      expect(v.y).toBe(0);
      expect(v.z).toBe(1);
    });

    it('should provide back vector', () => {
      const v = Vector3.back;
      expect(v.x).toBe(0);
      expect(v.y).toBe(0);
      expect(v.z).toBe(-1);
    });

    it('should provide positive infinity', () => {
      const v = Vector3.positiveInfinity;
      expect(v.x).toBe(Infinity);
      expect(v.y).toBe(Infinity);
      expect(v.z).toBe(Infinity);
    });

    it('should provide negative infinity', () => {
      const v = Vector3.negativeInfinity;
      expect(v.x).toBe(-Infinity);
      expect(v.y).toBe(-Infinity);
      expect(v.z).toBe(-Infinity);
    });
  });

  describe('OrthoNormalize', () => {
    it('should make vectors orthonormal', () => {
      const normal = new Vector3(1, 1, 0);
      const tangent = new Vector3(1, 0, 0);
      Vector3.OrthoNormalize(normal, tangent);

      expect(normal.magnitude).toBeCloseTo(1);
      expect(tangent.magnitude).toBeCloseTo(1);
      expect(Math.abs(Vector3.Dot(normal, tangent))).toBeLessThan(1e-5);
    });
  });

  describe('Slerp', () => {
    it('should spherically interpolate', () => {
      const a = new Vector3(1, 0, 0);
      const b = new Vector3(0, 1, 0);
      const result = Vector3.Slerp(a, b, 0.5);
      expect(result.magnitude).toBeCloseTo(1);
    });

    it('should clamp t', () => {
      const a = new Vector3(1, 0, 0);
      const b = new Vector3(0, 1, 0);
      const result1 = Vector3.Slerp(a, b, -0.5);
      const result2 = Vector3.Slerp(a, b, 1.5);
      expect(result1.approximatelyEquals(a.normalized, 0.01)).toBe(true);
      expect(result2.approximatelyEquals(b.normalized, 0.01)).toBe(true);
    });
  });

  describe('SlerpUnclamped', () => {
    it('should interpolate without clamping', () => {
      const a = new Vector3(1, 0, 0);
      const b = new Vector3(0, 1, 0);
      const result = Vector3.SlerpUnclamped(a, b, 1.5);
      expect(result).toBeDefined();
    });
  });

  describe('SmoothDamp', () => {
    it('should smoothly damp towards target', () => {
      const current = new Vector3(0, 0, 0);
      const target = new Vector3(10, 0, 0);
      const velocity = new Vector3(0, 0, 0);
      const result = Vector3.SmoothDamp(current, target, velocity, 0.3, Infinity, 0.016);

      expect(result.x).toBeGreaterThan(0);
      expect(result.x).toBeLessThan(10);
    });

    it('should modify velocity', () => {
      const current = new Vector3(0, 0, 0);
      const target = new Vector3(10, 0, 0);
      const velocity = new Vector3(0, 0, 0);
      Vector3.SmoothDamp(current, target, velocity, 0.3);

      expect(velocity.x).not.toBe(0);
    });
  });

  describe('performance tests', () => {
    it('should handle large number of operations', () => {
      const start = performance.now();
      for (let i = 0; i < 10000; i++) {
        const a = new Vector3(i, i + 1, i + 2);
        const b = new Vector3(i + 3, i + 4, i + 5);
        Vector3.Add(a, b);
        Vector3.Dot(a, b);
        a.magnitude;
      }
      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(100); // Should complete in <100ms
    });
  });
});
