import { describe, it, expect } from 'vitest';
import { Quaternion } from '../Quaternion';
import { Vector3 } from '../Vector3';

describe('Quaternion', () => {
  describe('constructor', () => {
    it('should create identity quaternion by default', () => {
      const q = new Quaternion();
      expect(q.x).toBe(0);
      expect(q.y).toBe(0);
      expect(q.z).toBe(0);
      expect(q.w).toBe(1);
    });

    it('should create quaternion with specified values', () => {
      const q = new Quaternion(0.1, 0.2, 0.3, 0.4);
      expect(q.x).toBe(0.1);
      expect(q.y).toBe(0.2);
      expect(q.z).toBe(0.3);
      expect(q.w).toBe(0.4);
    });
  });

  describe('identity', () => {
    it('should return identity quaternion', () => {
      const q = Quaternion.identity;
      expect(q.x).toBe(0);
      expect(q.y).toBe(0);
      expect(q.z).toBe(0);
      expect(q.w).toBe(1);
    });

    it('should represent no rotation', () => {
      const q = Quaternion.identity;
      const v = new Vector3(1, 2, 3);
      const rotated = q.MultiplyVector(v);
      expect(rotated.approximatelyEquals(v, 0.0001)).toBe(true);
    });
  });

  describe('Euler', () => {
    it('should create rotation from euler angles', () => {
      const q = Quaternion.Euler(0, 90, 0);
      expect(q).toBeDefined();
    });

    it('should accept Vector3 parameter', () => {
      const euler = new Vector3(0, 90, 0);
      const q = Quaternion.Euler(euler);
      expect(q).toBeDefined();
    });

    it('should create 90 degree Y rotation', () => {
      const q = Quaternion.Euler(0, 90, 0);
      const forward = new Vector3(0, 0, 1);
      const rotated = q.MultiplyVector(forward);
      expect(rotated.x).toBeCloseTo(1, 3);
      expect(rotated.y).toBeCloseTo(0, 3);
      expect(rotated.z).toBeCloseTo(0, 3);
    });

    it('should create 90 degree X rotation', () => {
      const q = Quaternion.Euler(90, 0, 0);
      const up = new Vector3(0, 1, 0);
      const rotated = q.MultiplyVector(up);
      expect(rotated.x).toBeCloseTo(0, 3);
      expect(rotated.y).toBeCloseTo(0, 3);
      expect(rotated.z).toBeCloseTo(1, 3);
    });

    it('should create 90 degree Z rotation', () => {
      const q = Quaternion.Euler(0, 0, 90);
      const right = new Vector3(1, 0, 0);
      const rotated = q.MultiplyVector(right);
      expect(rotated.x).toBeCloseTo(0, 3);
      expect(rotated.y).toBeCloseTo(1, 3);
      expect(rotated.z).toBeCloseTo(0, 3);
    });

    it('should handle zero rotation', () => {
      const q = Quaternion.Euler(0, 0, 0);
      expect(q.approximatelyEquals(Quaternion.identity, 0.0001)).toBe(true);
    });
  });

  describe('AngleAxis', () => {
    it('should create rotation around axis', () => {
      const q = Quaternion.AngleAxis(90, Vector3.up);
      const forward = new Vector3(0, 0, 1);
      const rotated = q.MultiplyVector(forward);
      expect(rotated.x).toBeCloseTo(1, 3);
      expect(rotated.z).toBeCloseTo(0, 3);
    });

    it('should handle zero angle', () => {
      const q = Quaternion.AngleAxis(0, Vector3.up);
      expect(q.approximatelyEquals(Quaternion.identity, 0.0001)).toBe(true);
    });

    it('should create 180 degree rotation', () => {
      const q = Quaternion.AngleAxis(180, Vector3.up);
      const forward = new Vector3(0, 0, 1);
      const rotated = q.MultiplyVector(forward);
      expect(rotated.x).toBeCloseTo(0, 3);
      expect(rotated.z).toBeCloseTo(-1, 3);
    });
  });

  describe('Dot', () => {
    it('should calculate dot product', () => {
      const a = new Quaternion(0.1, 0.2, 0.3, 0.4);
      const b = new Quaternion(0.5, 0.6, 0.7, 0.8);
      const dot = Quaternion.Dot(a, b);
      expect(dot).toBeCloseTo(0.1 * 0.5 + 0.2 * 0.6 + 0.3 * 0.7 + 0.4 * 0.8, 5);
    });

    it('should return 1 for identical quaternions', () => {
      const q = Quaternion.Euler(45, 30, 60);
      expect(Quaternion.Dot(q, q)).toBeCloseTo(1, 5);
    });
  });

  describe('Angle', () => {
    it('should calculate angle between rotations', () => {
      const a = Quaternion.Euler(0, 0, 0);
      const b = Quaternion.Euler(0, 90, 0);
      const angle = Quaternion.Angle(a, b);
      expect(angle).toBeCloseTo(90, 1);
    });

    it('should return 0 for identical rotations', () => {
      const q = Quaternion.Euler(45, 30, 60);
      expect(Quaternion.Angle(q, q)).toBeCloseTo(0, 3);
    });

    it('should handle 180 degree difference', () => {
      const a = Quaternion.Euler(0, 0, 0);
      const b = Quaternion.Euler(0, 180, 0);
      const angle = Quaternion.Angle(a, b);
      expect(angle).toBeCloseTo(180, 1);
    });
  });

  describe('LookRotation', () => {
    it('should create rotation looking forward', () => {
      const q = Quaternion.LookRotation(Vector3.forward, Vector3.up);
      expect(q.approximatelyEquals(Quaternion.identity, 0.0001)).toBe(true);
    });

    it('should create rotation looking right', () => {
      const q = Quaternion.LookRotation(Vector3.right, Vector3.up);
      // Verify it creates a valid rotation (non-identity)
      expect(q).toBeDefined();
      expect(q.approximatelyEquals(Quaternion.identity, 0.001)).toBe(false);
    });

    it('should create rotation looking up', () => {
      const q = Quaternion.LookRotation(Vector3.up, Vector3.back);
      expect(q).toBeDefined();
    });

    it('should handle zero vector', () => {
      const q = Quaternion.LookRotation(Vector3.zero, Vector3.up);
      expect(q.equals(Quaternion.identity)).toBe(true);
    });
  });

  describe('FromToRotation', () => {
    it('should create rotation from forward to right', () => {
      const q = Quaternion.FromToRotation(Vector3.forward, Vector3.right);
      const rotated = q.MultiplyVector(Vector3.forward);
      expect(rotated.approximatelyEquals(Vector3.right, 0.001)).toBe(true);
    });

    it('should handle identical directions', () => {
      const q = Quaternion.FromToRotation(Vector3.forward, Vector3.forward);
      expect(q.approximatelyEquals(Quaternion.identity, 0.0001)).toBe(true);
    });

    it('should handle opposite directions', () => {
      const q = Quaternion.FromToRotation(Vector3.forward, Vector3.back);
      const rotated = q.MultiplyVector(Vector3.forward);
      expect(rotated.approximatelyEquals(Vector3.back, 0.001)).toBe(true);
    });

    it('should handle up to right rotation', () => {
      const q = Quaternion.FromToRotation(Vector3.up, Vector3.right);
      const rotated = q.MultiplyVector(Vector3.up);
      expect(rotated.approximatelyEquals(Vector3.right, 0.001)).toBe(true);
    });
  });

  describe('Lerp', () => {
    it('should interpolate between rotations', () => {
      const a = Quaternion.Euler(0, 0, 0);
      const b = Quaternion.Euler(0, 90, 0);
      const q = Quaternion.Lerp(a, b, 0.5);
      expect(q).toBeDefined();
    });

    it('should clamp t to [0, 1]', () => {
      const a = Quaternion.Euler(0, 0, 0);
      const b = Quaternion.Euler(0, 90, 0);
      const q1 = Quaternion.Lerp(a, b, -0.5);
      const q2 = Quaternion.Lerp(a, b, 1.5);
      expect(q1.approximatelyEquals(a, 0.0001)).toBe(true);
      expect(q2.approximatelyEquals(b, 0.0001)).toBe(true);
    });

    it('should return start at t=0', () => {
      const a = Quaternion.Euler(10, 20, 30);
      const b = Quaternion.Euler(40, 50, 60);
      const q = Quaternion.Lerp(a, b, 0);
      expect(q.approximatelyEquals(a, 0.0001)).toBe(true);
    });

    it('should return end at t=1', () => {
      const a = Quaternion.Euler(10, 20, 30);
      const b = Quaternion.Euler(40, 50, 60);
      const q = Quaternion.Lerp(a, b, 1);
      expect(q.approximatelyEquals(b, 0.0001)).toBe(true);
    });
  });

  describe('LerpUnclamped', () => {
    it('should interpolate without clamping', () => {
      const a = Quaternion.Euler(0, 0, 0);
      const b = Quaternion.Euler(0, 90, 0);
      const q = Quaternion.LerpUnclamped(a, b, 1.5);
      expect(q).toBeDefined();
    });

    it('should allow negative t', () => {
      const a = Quaternion.Euler(0, 0, 0);
      const b = Quaternion.Euler(0, 90, 0);
      const q = Quaternion.LerpUnclamped(a, b, -0.5);
      expect(q).toBeDefined();
    });
  });

  describe('Slerp', () => {
    it('should spherically interpolate between rotations', () => {
      const a = Quaternion.Euler(0, 0, 0);
      const b = Quaternion.Euler(0, 90, 0);
      const q = Quaternion.Slerp(a, b, 0.5);
      const angle = Quaternion.Angle(a, q);
      expect(angle).toBeCloseTo(45, 1);
    });

    it('should clamp t to [0, 1]', () => {
      const a = Quaternion.Euler(0, 0, 0);
      const b = Quaternion.Euler(0, 90, 0);
      const q1 = Quaternion.Slerp(a, b, -0.5);
      const q2 = Quaternion.Slerp(a, b, 1.5);
      expect(q1.approximatelyEquals(a, 0.001)).toBe(true);
      expect(q2.approximatelyEquals(b, 0.001)).toBe(true);
    });

    it('should handle very close quaternions', () => {
      const a = Quaternion.Euler(0, 0, 0);
      const b = Quaternion.Euler(0, 0.001, 0);
      const q = Quaternion.Slerp(a, b, 0.5);
      expect(q).toBeDefined();
    });
  });

  describe('SlerpUnclamped', () => {
    it('should interpolate without clamping', () => {
      const a = Quaternion.Euler(0, 0, 0);
      const b = Quaternion.Euler(0, 90, 0);
      const q = Quaternion.SlerpUnclamped(a, b, 1.5);
      expect(q).toBeDefined();
    });
  });

  describe('RotateTowards', () => {
    it('should rotate towards target', () => {
      const from = Quaternion.Euler(0, 0, 0);
      const to = Quaternion.Euler(0, 90, 0);
      const q = Quaternion.RotateTowards(from, to, 45);
      const angle = Quaternion.Angle(from, q);
      expect(angle).toBeCloseTo(45, 1);
    });

    it('should not overshoot target', () => {
      const from = Quaternion.Euler(0, 0, 0);
      const to = Quaternion.Euler(0, 45, 0);
      const q = Quaternion.RotateTowards(from, to, 90);
      expect(q.approximatelyEquals(to, 0.001)).toBe(true);
    });

    it('should handle zero angle difference', () => {
      const q = Quaternion.Euler(10, 20, 30);
      const result = Quaternion.RotateTowards(q, q, 45);
      // Should return the target quaternion
      expect(result.approximatelyEquals(q, 0.001)).toBe(true);
    });
  });

  describe('Inverse', () => {
    it('should create inverse rotation', () => {
      const q = Quaternion.Euler(45, 30, 60);
      const inv = Quaternion.Inverse(q);
      const product = Quaternion.Multiply(q, inv);
      expect(product.approximatelyEquals(Quaternion.identity, 0.001)).toBe(true);
    });

    it('should undo rotation', () => {
      const q = Quaternion.Euler(0, 90, 0);
      const inv = Quaternion.Inverse(q);
      const v = new Vector3(1, 0, 0);
      const rotated = q.MultiplyVector(v);
      const restored = inv.MultiplyVector(rotated);
      expect(restored.approximatelyEquals(v, 0.001)).toBe(true);
    });
  });

  describe('Multiply', () => {
    it('should combine rotations', () => {
      const a = Quaternion.Euler(0, 45, 0);
      const b = Quaternion.Euler(0, 45, 0);
      const combined = Quaternion.Multiply(a, b);
      const angle = Quaternion.Angle(Quaternion.identity, combined);
      expect(angle).toBeCloseTo(90, 1);
    });

    it('should apply rotations in order', () => {
      const rotY = Quaternion.Euler(0, 90, 0);
      const rotX = Quaternion.Euler(90, 0, 0);
      const combined = Quaternion.Multiply(rotY, rotX);
      const v = new Vector3(0, 0, 1);
      const result = combined.MultiplyVector(v);
      expect(result).toBeDefined();
    });
  });

  describe('normalized', () => {
    it('should return normalized quaternion', () => {
      const q = new Quaternion(1, 2, 3, 4);
      const normalized = q.normalized;
      const magnitude = Math.sqrt(
        normalized.x * normalized.x +
        normalized.y * normalized.y +
        normalized.z * normalized.z +
        normalized.w * normalized.w
      );
      expect(magnitude).toBeCloseTo(1, 5);
    });

    it('should preserve direction', () => {
      const q = Quaternion.Euler(45, 30, 60);
      const normalized = q.normalized;
      expect(normalized.approximatelyEquals(q, 0.001)).toBe(true);
    });

    it('should handle zero quaternion', () => {
      const q = new Quaternion(0, 0, 0, 0);
      const normalized = q.normalized;
      expect(normalized.equals(Quaternion.identity)).toBe(true);
    });
  });

  describe('Normalize', () => {
    it('should normalize quaternion in place', () => {
      const q = new Quaternion(1, 2, 3, 4);
      q.Normalize();
      const magnitude = Math.sqrt(q.x * q.x + q.y * q.y + q.z * q.z + q.w * q.w);
      expect(magnitude).toBeCloseTo(1, 5);
    });

    it('should handle zero quaternion', () => {
      const q = new Quaternion(0, 0, 0, 0);
      q.Normalize();
      expect(q.equals(Quaternion.identity)).toBe(true);
    });
  });

  describe('eulerAngles', () => {
    it('should convert quaternion to euler angles', () => {
      // Simple case: single axis rotation
      const q = Quaternion.Euler(0, 45, 0);
      const result = q.eulerAngles;
      expect(result.y).toBeCloseTo(45, 0);
    });

    it('should handle identity rotation', () => {
      const q = Quaternion.identity;
      const euler = q.eulerAngles;
      expect(euler.x).toBeCloseTo(0, 1);
      expect(euler.y).toBeCloseTo(0, 1);
      expect(euler.z).toBeCloseTo(0, 1);
    });

    it('should set euler angles', () => {
      const q = new Quaternion();
      q.eulerAngles = new Vector3(0, 45, 0);
      const euler = q.eulerAngles;
      // For single-axis rotations, conversion should be accurate
      expect(euler.y).toBeCloseTo(45, 0);
    });

    it('should roundtrip for simple rotations', () => {
      const original = new Vector3(0, 90, 0);
      const q = Quaternion.Euler(original);
      const result = q.eulerAngles;
      // Create new quaternion from result and compare rotations
      const q2 = Quaternion.Euler(result);
      expect(q.approximatelyEquals(q2, 0.001)).toBe(true);
    });
  });

  describe('Set', () => {
    it('should set quaternion components', () => {
      const q = new Quaternion();
      q.Set(0.1, 0.2, 0.3, 0.4);
      expect(q.x).toBe(0.1);
      expect(q.y).toBe(0.2);
      expect(q.z).toBe(0.3);
      expect(q.w).toBe(0.4);
    });
  });

  describe('SetFromToRotation', () => {
    it('should set rotation from one direction to another', () => {
      const q = new Quaternion();
      q.SetFromToRotation(Vector3.forward, Vector3.right);
      const rotated = q.MultiplyVector(Vector3.forward);
      expect(rotated.approximatelyEquals(Vector3.right, 0.001)).toBe(true);
    });
  });

  describe('SetLookRotation', () => {
    it('should set look rotation', () => {
      const q = new Quaternion();
      q.SetLookRotation(Vector3.right, Vector3.up);
      // Verify quaternion was modified from default
      expect(q.approximatelyEquals(Quaternion.identity, 0.001)).toBe(false);
    });

    it('should use default up vector', () => {
      const q = new Quaternion();
      q.SetLookRotation(Vector3.forward);
      expect(q.approximatelyEquals(Quaternion.identity, 0.001)).toBe(true);
    });
  });

  describe('MultiplyVector', () => {
    it('should rotate vector', () => {
      const q = Quaternion.Euler(0, 90, 0);
      const v = new Vector3(0, 0, 1);
      const rotated = q.MultiplyVector(v);
      expect(rotated.x).toBeCloseTo(1, 3);
      expect(rotated.z).toBeCloseTo(0, 3);
    });

    it('should preserve vector length', () => {
      const q = Quaternion.Euler(45, 30, 60);
      const v = new Vector3(1, 2, 3);
      const rotated = q.MultiplyVector(v);
      expect(rotated.magnitude).toBeCloseTo(v.magnitude, 3);
    });

    it('should handle identity rotation', () => {
      const q = Quaternion.identity;
      const v = new Vector3(1, 2, 3);
      const rotated = q.MultiplyVector(v);
      expect(rotated.approximatelyEquals(v, 0.0001)).toBe(true);
    });
  });

  describe('toString', () => {
    it('should format quaternion as string', () => {
      const q = new Quaternion(0.1234, 0.5678, 0.9012, 0.3456);
      expect(q.toString(2)).toBe('(0.12, 0.57, 0.90, 0.35)');
    });

    it('should use default precision', () => {
      const q = new Quaternion(1, 2, 3, 4);
      expect(q.toString()).toContain('1.00');
    });
  });

  describe('clone', () => {
    it('should create copy of quaternion', () => {
      const q = new Quaternion(0.1, 0.2, 0.3, 0.4);
      const copy = q.clone();
      expect(copy.equals(q)).toBe(true);
      expect(copy).not.toBe(q);
    });

    it('should not share reference', () => {
      const q = new Quaternion(0.1, 0.2, 0.3, 0.4);
      const copy = q.clone();
      copy.x = 10;
      expect(q.x).toBe(0.1);
    });
  });

  describe('equals', () => {
    it('should return true for equal quaternions', () => {
      const a = new Quaternion(0.1, 0.2, 0.3, 0.4);
      const b = new Quaternion(0.1, 0.2, 0.3, 0.4);
      expect(a.equals(b)).toBe(true);
    });

    it('should return false for different quaternions', () => {
      const a = new Quaternion(0.1, 0.2, 0.3, 0.4);
      const b = new Quaternion(0.1, 0.2, 0.3, 0.5);
      expect(a.equals(b)).toBe(false);
    });
  });

  describe('approximatelyEquals', () => {
    it('should return true for approximately equal quaternions', () => {
      const a = new Quaternion(0.100001, 0.200001, 0.300001, 0.400001);
      const b = new Quaternion(0.1, 0.2, 0.3, 0.4);
      expect(a.approximatelyEquals(b, 0.001)).toBe(true);
    });

    it('should use default tolerance', () => {
      const a = new Quaternion(0.1000001, 0.2000001, 0.3000001, 0.4000001);
      const b = new Quaternion(0.1, 0.2, 0.3, 0.4);
      expect(a.approximatelyEquals(b)).toBe(true);
    });

    it('should return false if difference exceeds tolerance', () => {
      const a = new Quaternion(0.11, 0.2, 0.3, 0.4);
      const b = new Quaternion(0.1, 0.2, 0.3, 0.4);
      expect(a.approximatelyEquals(b, 0.001)).toBe(false);
    });
  });

  describe('integration tests', () => {
    it('should chain multiple rotations correctly', () => {
      const rotX = Quaternion.Euler(90, 0, 0);
      const rotY = Quaternion.Euler(0, 90, 0);
      const rotZ = Quaternion.Euler(0, 0, 90);
      const combined = Quaternion.Multiply(Quaternion.Multiply(rotX, rotY), rotZ);
      expect(combined).toBeDefined();
    });

    it('should correctly rotate vectors in 3D space', () => {
      const q = Quaternion.Euler(45, 45, 0);
      const v = new Vector3(1, 0, 0);
      const rotated = q.MultiplyVector(v);
      expect(rotated.magnitude).toBeCloseTo(1, 3);
    });
  });

  describe('performance tests', () => {
    it('should handle large number of operations', () => {
      const start = performance.now();
      for (let i = 0; i < 10000; i++) {
        const q = Quaternion.Euler(i % 360, (i * 2) % 360, (i * 3) % 360);
        const v = new Vector3(1, 0, 0);
        q.MultiplyVector(v);
      }
      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(200); // Should complete in <200ms
    });
  });
});
