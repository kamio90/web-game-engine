import { describe, it, expect } from 'vitest';
import { Mathf } from '../Mathf';

describe('Mathf', () => {
  describe('constants', () => {
    it('should have PI constant', () => {
      expect(Mathf.PI).toBeCloseTo(3.14159265, 5);
    });

    it('should have Infinity constant', () => {
      expect(Mathf.Infinity).toBe(Infinity);
    });

    it('should have NegativeInfinity constant', () => {
      expect(Mathf.NegativeInfinity).toBe(-Infinity);
    });

    it('should have Deg2Rad constant', () => {
      expect(Mathf.Deg2Rad).toBeCloseTo(0.0174533, 5);
    });

    it('should have Rad2Deg constant', () => {
      expect(Mathf.Rad2Deg).toBeCloseTo(57.2958, 3);
    });

    it('should have Epsilon constant', () => {
      expect(Mathf.Epsilon).toBe(Number.EPSILON);
    });
  });

  describe('trigonometric functions', () => {
    it('should calculate sine', () => {
      expect(Mathf.Sin(0)).toBe(0);
      expect(Mathf.Sin(Mathf.PI / 2)).toBeCloseTo(1, 10);
      expect(Mathf.Sin(Mathf.PI)).toBeCloseTo(0, 10);
    });

    it('should calculate cosine', () => {
      expect(Mathf.Cos(0)).toBe(1);
      expect(Mathf.Cos(Mathf.PI / 2)).toBeCloseTo(0, 10);
      expect(Mathf.Cos(Mathf.PI)).toBeCloseTo(-1, 10);
    });

    it('should calculate tangent', () => {
      expect(Mathf.Tan(0)).toBe(0);
      expect(Mathf.Tan(Mathf.PI / 4)).toBeCloseTo(1, 10);
    });

    it('should calculate arc sine', () => {
      expect(Mathf.Asin(0)).toBe(0);
      expect(Mathf.Asin(1)).toBeCloseTo(Mathf.PI / 2, 10);
    });

    it('should calculate arc cosine', () => {
      expect(Mathf.Acos(1)).toBe(0);
      expect(Mathf.Acos(0)).toBeCloseTo(Mathf.PI / 2, 10);
    });

    it('should calculate arc tangent', () => {
      expect(Mathf.Atan(0)).toBe(0);
      expect(Mathf.Atan(1)).toBeCloseTo(Mathf.PI / 4, 10);
    });

    it('should calculate Atan2', () => {
      expect(Mathf.Atan2(1, 1)).toBeCloseTo(Mathf.PI / 4, 10);
      expect(Mathf.Atan2(1, 0)).toBeCloseTo(Mathf.PI / 2, 10);
      expect(Mathf.Atan2(0, 1)).toBe(0);
    });
  });

  describe('basic math functions', () => {
    it('should calculate square root', () => {
      expect(Mathf.Sqrt(4)).toBe(2);
      expect(Mathf.Sqrt(9)).toBe(3);
      expect(Mathf.Sqrt(16)).toBe(4);
    });

    it('should calculate absolute value', () => {
      expect(Mathf.Abs(-5)).toBe(5);
      expect(Mathf.Abs(5)).toBe(5);
      expect(Mathf.Abs(0)).toBe(0);
    });

    it('should calculate ceiling', () => {
      expect(Mathf.Ceil(1.1)).toBe(2);
      expect(Mathf.Ceil(1.9)).toBe(2);
      expect(Mathf.Ceil(-1.1)).toBe(-1);
    });

    it('should calculate floor', () => {
      expect(Mathf.Floor(1.1)).toBe(1);
      expect(Mathf.Floor(1.9)).toBe(1);
      expect(Mathf.Floor(-1.1)).toBe(-2);
    });

    it('should round values', () => {
      expect(Mathf.Round(1.4)).toBe(1);
      expect(Mathf.Round(1.5)).toBe(2);
      expect(Mathf.Round(1.6)).toBe(2);
    });

    it('should return sign', () => {
      expect(Mathf.Sign(5)).toBe(1);
      expect(Mathf.Sign(-5)).toBe(-1);
      expect(Mathf.Sign(0)).toBe(0);
    });

    it('should calculate power', () => {
      expect(Mathf.Pow(2, 3)).toBe(8);
      expect(Mathf.Pow(5, 2)).toBe(25);
      expect(Mathf.Pow(10, 0)).toBe(1);
    });

    it('should calculate exponential', () => {
      expect(Mathf.Exp(0)).toBe(1);
      expect(Mathf.Exp(1)).toBeCloseTo(2.71828, 4);
    });

    it('should calculate logarithm', () => {
      expect(Mathf.Log(1)).toBe(0);
      expect(Mathf.Log(Math.E)).toBeCloseTo(1, 10);
      expect(Mathf.Log(100, 10)).toBeCloseTo(2, 10);
    });

    it('should calculate log10', () => {
      expect(Mathf.Log10(1)).toBe(0);
      expect(Mathf.Log10(10)).toBe(1);
      expect(Mathf.Log10(100)).toBe(2);
    });
  });

  describe('comparison functions', () => {
    it('should find minimum', () => {
      expect(Mathf.Min(1, 2, 3)).toBe(1);
      expect(Mathf.Min(5, 3, 8, 2)).toBe(2);
      expect(Mathf.Min(-1, 0, 1)).toBe(-1);
    });

    it('should find maximum', () => {
      expect(Mathf.Max(1, 2, 3)).toBe(3);
      expect(Mathf.Max(5, 3, 8, 2)).toBe(8);
      expect(Mathf.Max(-1, 0, 1)).toBe(1);
    });

    it('should clamp values', () => {
      expect(Mathf.Clamp(5, 0, 10)).toBe(5);
      expect(Mathf.Clamp(-5, 0, 10)).toBe(0);
      expect(Mathf.Clamp(15, 0, 10)).toBe(10);
    });

    it('should clamp01', () => {
      expect(Mathf.Clamp01(0.5)).toBe(0.5);
      expect(Mathf.Clamp01(-0.5)).toBe(0);
      expect(Mathf.Clamp01(1.5)).toBe(1);
    });
  });

  describe('interpolation functions', () => {
    it('should lerp between values', () => {
      expect(Mathf.Lerp(0, 10, 0.5)).toBe(5);
      expect(Mathf.Lerp(0, 10, 0)).toBe(0);
      expect(Mathf.Lerp(0, 10, 1)).toBe(10);
    });

    it('should clamp lerp parameter', () => {
      expect(Mathf.Lerp(0, 10, -0.5)).toBe(0);
      expect(Mathf.Lerp(0, 10, 1.5)).toBe(10);
    });

    it('should lerp unclamped', () => {
      expect(Mathf.LerpUnclamped(0, 10, 1.5)).toBe(15);
      expect(Mathf.LerpUnclamped(0, 10, -0.5)).toBe(-5);
    });

    it('should lerp angles', () => {
      expect(Mathf.LerpAngle(0, 90, 0.5)).toBeCloseTo(45, 5);
      // Angle wrapping: 0 to 180 should lerp to 90
      expect(Mathf.LerpAngle(0, 180, 0.5)).toBeCloseTo(90, 5);
      // Going from 350 to 10 should take shortest path (through 0/360)
      const result = Mathf.LerpAngle(350, 10, 0.5);
      // Result should be 0 or 360 (equivalent angles)
      expect(result % 360).toBeCloseTo(0, 0);
    });

    it('should move towards value', () => {
      expect(Mathf.MoveTowards(0, 10, 5)).toBe(5);
      expect(Mathf.MoveTowards(0, 10, 15)).toBe(10); // Doesn't overshoot
      expect(Mathf.MoveTowards(10, 0, 5)).toBe(5);
    });

    it('should move towards angle', () => {
      expect(Mathf.MoveTowardsAngle(0, 90, 45)).toBeCloseTo(45, 5);
      expect(Mathf.MoveTowardsAngle(0, 90, 100)).toBeCloseTo(90, 5);
      // Moving from 350 to 10 by 15 degrees should take shortest path
      const result = Mathf.MoveTowardsAngle(350, 10, 15);
      // Result should be close to 5 (350 + 15 wraps to 5)
      expect(result % 360).toBeCloseTo(5, 0);
    });

    it('should smooth step', () => {
      expect(Mathf.SmoothStep(0, 10, 0)).toBe(0);
      expect(Mathf.SmoothStep(0, 10, 1)).toBe(10);
      const mid = Mathf.SmoothStep(0, 10, 0.5);
      expect(mid).toBeCloseTo(5, 5);
    });
  });

  describe('angle functions', () => {
    it('should calculate delta angle', () => {
      expect(Mathf.DeltaAngle(0, 90)).toBeCloseTo(90, 5);
      expect(Mathf.DeltaAngle(0, 270)).toBeCloseTo(-90, 5);
      expect(Mathf.DeltaAngle(350, 10)).toBeCloseTo(20, 5);
      expect(Mathf.DeltaAngle(10, 350)).toBeCloseTo(-20, 5);
    });

    it('should repeat values', () => {
      expect(Mathf.Repeat(5, 10)).toBe(5);
      expect(Mathf.Repeat(15, 10)).toBe(5);
      expect(Mathf.Repeat(25, 10)).toBe(5);
      expect(Mathf.Repeat(-5, 10)).toBe(5);
    });

    it('should ping pong values', () => {
      expect(Mathf.PingPong(0, 10)).toBe(0);
      expect(Mathf.PingPong(5, 10)).toBe(5);
      expect(Mathf.PingPong(10, 10)).toBe(10);
      expect(Mathf.PingPong(15, 10)).toBe(5);
      expect(Mathf.PingPong(20, 10)).toBe(0);
      expect(Mathf.PingPong(25, 10)).toBe(5);
    });
  });

  describe('utility functions', () => {
    it('should find next power of two', () => {
      expect(Mathf.NextPowerOfTwo(5)).toBe(8);
      expect(Mathf.NextPowerOfTwo(8)).toBe(8);
      expect(Mathf.NextPowerOfTwo(9)).toBe(16);
      expect(Mathf.NextPowerOfTwo(100)).toBe(128);
    });

    it('should check if power of two', () => {
      expect(Mathf.IsPowerOfTwo(1)).toBe(true);
      expect(Mathf.IsPowerOfTwo(2)).toBe(true);
      expect(Mathf.IsPowerOfTwo(4)).toBe(true);
      expect(Mathf.IsPowerOfTwo(8)).toBe(true);
      expect(Mathf.IsPowerOfTwo(16)).toBe(true);
      expect(Mathf.IsPowerOfTwo(3)).toBe(false);
      expect(Mathf.IsPowerOfTwo(5)).toBe(false);
      expect(Mathf.IsPowerOfTwo(6)).toBe(false);
      expect(Mathf.IsPowerOfTwo(0)).toBe(false);
    });

    it('should check approximately equal', () => {
      expect(Mathf.Approximately(1.0, 1.0)).toBe(true);
      expect(Mathf.Approximately(1.0, 1.0000001)).toBe(true);
      expect(Mathf.Approximately(1.0, 1.1)).toBe(false);
    });

    it('should smooth damp', () => {
      const velocity = { value: 0 };
      const result = Mathf.SmoothDamp(0, 10, velocity, 0.3, Mathf.Infinity, 0.016);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(10);
      expect(velocity.value).not.toBe(0);
    });

    it('should smooth damp angle', () => {
      const velocity = { value: 0 };
      const result = Mathf.SmoothDampAngle(0, 90, velocity, 0.3, Mathf.Infinity, 0.016);
      expect(result).toBeGreaterThan(0);
      expect(result).toBeLessThan(90);
    });

    it('should inverse lerp', () => {
      expect(Mathf.InverseLerp(0, 10, 5)).toBeCloseTo(0.5, 5);
      expect(Mathf.InverseLerp(0, 10, 0)).toBe(0);
      expect(Mathf.InverseLerp(0, 10, 10)).toBe(1);
      expect(Mathf.InverseLerp(0, 10, 2.5)).toBeCloseTo(0.25, 5);
    });

    it('should handle inverse lerp with equal values', () => {
      expect(Mathf.InverseLerp(5, 5, 5)).toBe(0);
    });

    it('should convert gamma to linear space', () => {
      expect(Mathf.GammaToLinearSpace(0)).toBe(0);
      expect(Mathf.GammaToLinearSpace(1)).toBeCloseTo(1, 5);
      const mid = Mathf.GammaToLinearSpace(0.5);
      expect(mid).toBeGreaterThan(0);
      expect(mid).toBeLessThan(1);
    });

    it('should convert linear to gamma space', () => {
      expect(Mathf.LinearToGammaSpace(0)).toBe(0);
      expect(Mathf.LinearToGammaSpace(1)).toBeCloseTo(1, 5);
      const mid = Mathf.LinearToGammaSpace(0.5);
      expect(mid).toBeGreaterThan(0);
      expect(mid).toBeLessThan(1);
    });

    it('should remap values', () => {
      expect(Mathf.Remap(5, 0, 10, 0, 100)).toBeCloseTo(50, 5);
      expect(Mathf.Remap(0, 0, 10, 0, 100)).toBe(0);
      expect(Mathf.Remap(10, 0, 10, 0, 100)).toBeCloseTo(100, 5);
      expect(Mathf.Remap(2.5, 0, 10, 0, 100)).toBeCloseTo(25, 5);
    });
  });

  describe('edge cases', () => {
    it('should handle NaN', () => {
      expect(Number.isNaN(Mathf.Sqrt(-1))).toBe(true);
      expect(Number.isNaN(Mathf.Asin(2))).toBe(true);
    });

    it('should handle very small numbers', () => {
      expect(Mathf.Approximately(0, Mathf.Epsilon)).toBe(true);
    });

    it('should handle very large numbers', () => {
      expect(Mathf.Clamp(1e100, 0, 1e50)).toBe(1e50);
    });
  });

  describe('performance tests', () => {
    it('should handle large number of operations', () => {
      const start = performance.now();
      for (let i = 0; i < 100000; i++) {
        Mathf.Lerp(0, 100, i / 100000);
        Mathf.Clamp(i, 0, 50000);
        Mathf.Sin(i * Mathf.Deg2Rad);
      }
      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(100); // Should complete in <100ms
    });
  });
});
