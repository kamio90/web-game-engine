import { describe, it, expect } from 'vitest';
import { Vector4 } from '../Vector4';

describe('Vector4', () => {
  describe('constructor', () => {
    it('should create zero vector by default', () => {
      const v = new Vector4();
      expect(v.x).toBe(0);
      expect(v.y).toBe(0);
      expect(v.z).toBe(0);
      expect(v.w).toBe(0);
    });

    it('should create vector with specified components', () => {
      const v = new Vector4(1, 2, 3, 4);
      expect(v.x).toBe(1);
      expect(v.y).toBe(2);
      expect(v.z).toBe(3);
      expect(v.w).toBe(4);
    });
  });

  describe('static properties', () => {
    it('should have zero vector', () => {
      const v = Vector4.zero;
      expect(v.x).toBe(0);
      expect(v.y).toBe(0);
      expect(v.z).toBe(0);
      expect(v.w).toBe(0);
    });

    it('should have one vector', () => {
      const v = Vector4.one;
      expect(v.x).toBe(1);
      expect(v.y).toBe(1);
      expect(v.z).toBe(1);
      expect(v.w).toBe(1);
    });

    it('should have positive infinity vector', () => {
      const v = Vector4.positiveInfinity;
      expect(v.x).toBe(Infinity);
      expect(v.y).toBe(Infinity);
      expect(v.z).toBe(Infinity);
      expect(v.w).toBe(Infinity);
    });

    it('should have negative infinity vector', () => {
      const v = Vector4.negativeInfinity;
      expect(v.x).toBe(-Infinity);
      expect(v.y).toBe(-Infinity);
      expect(v.z).toBe(-Infinity);
      expect(v.w).toBe(-Infinity);
    });
  });

  describe('magnitude', () => {
    it('should calculate magnitude', () => {
      const v = new Vector4(3, 4, 0, 0);
      expect(v.magnitude).toBe(5);
    });

    it('should calculate magnitude for 4D vector', () => {
      const v = new Vector4(1, 2, 2, 0);
      expect(v.magnitude).toBe(3);
    });

    it('should return 0 for zero vector', () => {
      const v = Vector4.zero;
      expect(v.magnitude).toBe(0);
    });
  });

  describe('sqrMagnitude', () => {
    it('should calculate squared magnitude', () => {
      const v = new Vector4(3, 4, 0, 0);
      expect(v.sqrMagnitude).toBe(25);
    });

    it('should calculate squared magnitude for 4D vector', () => {
      const v = new Vector4(1, 2, 2, 0);
      expect(v.sqrMagnitude).toBe(9);
    });

    it('should be faster than magnitude', () => {
      const v = new Vector4(1, 2, 3, 4);
      const start1 = performance.now();
      for (let i = 0; i < 10000; i++) {
        v.sqrMagnitude;
      }
      const time1 = performance.now() - start1;

      const start2 = performance.now();
      for (let i = 0; i < 10000; i++) {
        v.magnitude;
      }
      const time2 = performance.now() - start2;

      expect(time1).toBeLessThan(time2 * 1.5);
    });
  });

  describe('normalized', () => {
    it('should normalize vector', () => {
      const v = new Vector4(3, 4, 0, 0);
      const n = v.normalized;
      expect(n.x).toBeCloseTo(0.6, 5);
      expect(n.y).toBeCloseTo(0.8, 5);
      expect(n.magnitude).toBeCloseTo(1, 5);
    });

    it('should handle zero vector', () => {
      const v = Vector4.zero;
      const n = v.normalized;
      expect(n.approximatelyEquals(Vector4.zero, 0.001)).toBe(true);
    });

    it('should preserve direction', () => {
      const v = new Vector4(5, 10, 15, 20);
      const n = v.normalized;
      expect(n.x / n.y).toBeCloseTo(v.x / v.y, 5);
    });
  });

  describe('Lerp', () => {
    it('should interpolate between two vectors', () => {
      const a = new Vector4(0, 0, 0, 0);
      const b = new Vector4(10, 10, 10, 10);
      const result = Vector4.Lerp(a, b, 0.5);
      expect(result.approximatelyEquals(new Vector4(5, 5, 5, 5), 0.001)).toBe(true);
    });

    it('should clamp t to 0-1', () => {
      const a = new Vector4(0, 0, 0, 0);
      const b = new Vector4(10, 10, 10, 10);
      const result = Vector4.Lerp(a, b, 1.5);
      expect(result.approximatelyEquals(b, 0.001)).toBe(true);
    });

    it('should return start at t=0', () => {
      const a = new Vector4(1, 2, 3, 4);
      const b = new Vector4(10, 20, 30, 40);
      const result = Vector4.Lerp(a, b, 0);
      expect(result.approximatelyEquals(a, 0.001)).toBe(true);
    });

    it('should return end at t=1', () => {
      const a = new Vector4(1, 2, 3, 4);
      const b = new Vector4(10, 20, 30, 40);
      const result = Vector4.Lerp(a, b, 1);
      expect(result.approximatelyEquals(b, 0.001)).toBe(true);
    });
  });

  describe('LerpUnclamped', () => {
    it('should extrapolate beyond 1', () => {
      const a = new Vector4(0, 0, 0, 0);
      const b = new Vector4(10, 10, 10, 10);
      const result = Vector4.LerpUnclamped(a, b, 1.5);
      expect(result.approximatelyEquals(new Vector4(15, 15, 15, 15), 0.001)).toBe(true);
    });

    it('should extrapolate below 0', () => {
      const a = new Vector4(0, 0, 0, 0);
      const b = new Vector4(10, 10, 10, 10);
      const result = Vector4.LerpUnclamped(a, b, -0.5);
      expect(result.approximatelyEquals(new Vector4(-5, -5, -5, -5), 0.001)).toBe(true);
    });
  });

  describe('MoveTowards', () => {
    it('should move towards target', () => {
      const current = new Vector4(0, 0, 0, 0);
      const target = new Vector4(10, 0, 0, 0);
      const result = Vector4.MoveTowards(current, target, 5);
      expect(result.approximatelyEquals(new Vector4(5, 0, 0, 0), 0.001)).toBe(true);
    });

    it('should not overshoot target', () => {
      const current = new Vector4(0, 0, 0, 0);
      const target = new Vector4(10, 0, 0, 0);
      const result = Vector4.MoveTowards(current, target, 15);
      expect(result.approximatelyEquals(target, 0.001)).toBe(true);
    });

    it('should handle very small distances', () => {
      const current = new Vector4(0, 0, 0, 0);
      const target = new Vector4(0.0001, 0, 0, 0);
      const result = Vector4.MoveTowards(current, target, 10);
      expect(result.approximatelyEquals(target, 0.001)).toBe(true);
    });
  });

  describe('Scale', () => {
    it('should scale by number', () => {
      const v = new Vector4(1, 2, 3, 4);
      const result = Vector4.Scale(v, 2);
      expect(result.approximatelyEquals(new Vector4(2, 4, 6, 8), 0.001)).toBe(true);
    });

    it('should scale component-wise', () => {
      const a = new Vector4(1, 2, 3, 4);
      const b = new Vector4(2, 3, 4, 5);
      const result = Vector4.Scale(a, b);
      expect(result.approximatelyEquals(new Vector4(2, 6, 12, 20), 0.001)).toBe(true);
    });
  });

  describe('Add', () => {
    it('should add two vectors', () => {
      const a = new Vector4(1, 2, 3, 4);
      const b = new Vector4(5, 6, 7, 8);
      const result = Vector4.Add(a, b);
      expect(result.approximatelyEquals(new Vector4(6, 8, 10, 12), 0.001)).toBe(true);
    });

    it('should handle zero vector', () => {
      const a = new Vector4(1, 2, 3, 4);
      const result = Vector4.Add(a, Vector4.zero);
      expect(result.approximatelyEquals(a, 0.001)).toBe(true);
    });
  });

  describe('Subtract', () => {
    it('should subtract two vectors', () => {
      const a = new Vector4(5, 6, 7, 8);
      const b = new Vector4(1, 2, 3, 4);
      const result = Vector4.Subtract(a, b);
      expect(result.approximatelyEquals(new Vector4(4, 4, 4, 4), 0.001)).toBe(true);
    });

    it('should handle zero vector', () => {
      const a = new Vector4(1, 2, 3, 4);
      const result = Vector4.Subtract(a, Vector4.zero);
      expect(result.approximatelyEquals(a, 0.001)).toBe(true);
    });
  });

  describe('Dot', () => {
    it('should calculate dot product', () => {
      const a = new Vector4(1, 2, 3, 4);
      const b = new Vector4(5, 6, 7, 8);
      const result = Vector4.Dot(a, b);
      expect(result).toBe(70); // 1*5 + 2*6 + 3*7 + 4*8 = 5+12+21+32 = 70
    });

    it('should return 0 for perpendicular vectors', () => {
      const a = new Vector4(1, 0, 0, 0);
      const b = new Vector4(0, 1, 0, 0);
      const result = Vector4.Dot(a, b);
      expect(result).toBe(0);
    });

    it('should return squared magnitude when dotting with itself', () => {
      const v = new Vector4(3, 4, 0, 0);
      const result = Vector4.Dot(v, v);
      expect(result).toBe(v.sqrMagnitude);
    });
  });

  describe('Min', () => {
    it('should return component-wise minimum', () => {
      const a = new Vector4(1, 5, 3, 7);
      const b = new Vector4(2, 3, 4, 6);
      const result = Vector4.Min(a, b);
      expect(result.approximatelyEquals(new Vector4(1, 3, 3, 6), 0.001)).toBe(true);
    });
  });

  describe('Max', () => {
    it('should return component-wise maximum', () => {
      const a = new Vector4(1, 5, 3, 7);
      const b = new Vector4(2, 3, 4, 6);
      const result = Vector4.Max(a, b);
      expect(result.approximatelyEquals(new Vector4(2, 5, 4, 7), 0.001)).toBe(true);
    });
  });

  describe('Distance', () => {
    it('should calculate distance between vectors', () => {
      const a = new Vector4(0, 0, 0, 0);
      const b = new Vector4(3, 4, 0, 0);
      const result = Vector4.Distance(a, b);
      expect(result).toBe(5);
    });

    it('should be symmetric', () => {
      const a = new Vector4(1, 2, 3, 4);
      const b = new Vector4(5, 6, 7, 8);
      expect(Vector4.Distance(a, b)).toBe(Vector4.Distance(b, a));
    });
  });

  describe('Normalize', () => {
    it('should normalize static method', () => {
      const v = new Vector4(3, 4, 0, 0);
      const n = Vector4.Normalize(v);
      expect(n.magnitude).toBeCloseTo(1, 5);
    });

    it('should handle zero vector', () => {
      const n = Vector4.Normalize(Vector4.zero);
      expect(n.approximatelyEquals(Vector4.zero, 0.001)).toBe(true);
    });
  });

  describe('Project', () => {
    it('should project vector onto another', () => {
      const vector = new Vector4(1, 1, 0, 0);
      const onNormal = new Vector4(1, 0, 0, 0);
      const result = Vector4.Project(vector, onNormal);
      expect(result.approximatelyEquals(new Vector4(1, 0, 0, 0), 0.001)).toBe(true);
    });

    it('should handle zero normal', () => {
      const vector = new Vector4(1, 2, 3, 4);
      const onNormal = Vector4.zero;
      const result = Vector4.Project(vector, onNormal);
      expect(result.approximatelyEquals(Vector4.zero, 0.001)).toBe(true);
    });

    it('should return zero when projecting zero vector', () => {
      const vector = Vector4.zero;
      const onNormal = new Vector4(1, 0, 0, 0);
      const result = Vector4.Project(vector, onNormal);
      expect(result.approximatelyEquals(Vector4.zero, 0.001)).toBe(true);
    });
  });

  describe('Normalize (instance)', () => {
    it('should normalize vector in place', () => {
      const v = new Vector4(3, 4, 0, 0);
      v.Normalize();
      expect(v.magnitude).toBeCloseTo(1, 5);
    });

    it('should handle zero vector', () => {
      const v = new Vector4(0, 0, 0, 0);
      v.Normalize();
      expect(v.approximatelyEquals(Vector4.zero, 0.001)).toBe(true);
    });
  });

  describe('Set', () => {
    it('should set all components', () => {
      const v = new Vector4();
      v.Set(1, 2, 3, 4);
      expect(v.x).toBe(1);
      expect(v.y).toBe(2);
      expect(v.z).toBe(3);
      expect(v.w).toBe(4);
    });
  });

  describe('approximatelyEquals', () => {
    it('should return true for approximately equal vectors', () => {
      const a = new Vector4(1.0, 2.0, 3.0, 4.0);
      const b = new Vector4(1.0000001, 2.0000001, 3.0000001, 4.0000001);
      expect(a.approximatelyEquals(b, 0.001)).toBe(true);
    });

    it('should return false for different vectors', () => {
      const a = new Vector4(1, 2, 3, 4);
      const b = new Vector4(1, 2, 3.1, 4);
      expect(a.approximatelyEquals(b, 0.001)).toBe(false);
    });

    it('should use default epsilon', () => {
      const a = new Vector4(1.0, 2.0, 3.0, 4.0);
      const b = new Vector4(1.000001, 2.000001, 3.000001, 4.000001);
      expect(a.approximatelyEquals(b)).toBe(true);
    });
  });

  describe('toString', () => {
    it('should format vector as string', () => {
      const v = new Vector4(1.234, 2.345, 3.456, 4.567);
      const str = v.toString();
      expect(str).toContain('1.23');
      expect(str).toContain('2.35');
      expect(str).toContain('3.46');
      expect(str).toContain('4.57');
    });

    it('should handle zero vector', () => {
      const v = Vector4.zero;
      const str = v.toString();
      expect(str).toContain('0.00');
    });
  });

  describe('Equals', () => {
    it('should return true for equal vectors', () => {
      const a = new Vector4(1, 2, 3, 4);
      const b = new Vector4(1, 2, 3, 4);
      expect(a.Equals(b)).toBe(true);
    });

    it('should return false for different vectors', () => {
      const a = new Vector4(1, 2, 3, 4);
      const b = new Vector4(1, 2, 3, 5);
      expect(a.Equals(b)).toBe(false);
    });

    it('should be strict comparison', () => {
      const a = new Vector4(1.0, 2.0, 3.0, 4.0);
      const b = new Vector4(1.0000001, 2.0, 3.0, 4.0);
      expect(a.Equals(b)).toBe(false);
    });
  });

  describe('performance', () => {
    it('should handle many operations', () => {
      const start = performance.now();

      for (let i = 0; i < 10000; i++) {
        const a = new Vector4(i, i + 1, i + 2, i + 3);
        const b = new Vector4(i * 2, i * 2 + 1, i * 2 + 2, i * 2 + 3);
        Vector4.Add(a, b);
        Vector4.Dot(a, b);
        a.magnitude;
      }

      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(100); // Should complete in <100ms
    });
  });
});
