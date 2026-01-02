import { describe, it, expect } from 'vitest';
import { Matrix4x4 } from '../Matrix4x4';
import { Vector3 } from '../Vector3';
import { Vector4 } from '../Vector4';
import { Quaternion } from '../Quaternion';

describe('Matrix4x4', () => {
  describe('constructors', () => {
    it('should create identity matrix by default', () => {
      const m = new Matrix4x4();
      expect(m.m00).toBe(1);
      expect(m.m11).toBe(1);
      expect(m.m22).toBe(1);
      expect(m.m33).toBe(1);
      expect(m.m01).toBe(0);
      expect(m.m10).toBe(0);
    });

    it('should create identity matrix from static property', () => {
      const m = Matrix4x4.identity;
      expect(m.m00).toBe(1);
      expect(m.m11).toBe(1);
      expect(m.m22).toBe(1);
      expect(m.m33).toBe(1);
    });

    it('should create zero matrix', () => {
      const m = Matrix4x4.zero;
      expect(m.m00).toBe(0);
      expect(m.m11).toBe(0);
      expect(m.m22).toBe(0);
      expect(m.m33).toBe(0);
    });
  });

  describe('Translate', () => {
    it('should create translation matrix', () => {
      const m = Matrix4x4.Translate(new Vector3(1, 2, 3));
      expect(m.m03).toBe(1);
      expect(m.m13).toBe(2);
      expect(m.m23).toBe(3);
      expect(m.m00).toBe(1);
      expect(m.m11).toBe(1);
      expect(m.m22).toBe(1);
    });

    it('should transform point correctly', () => {
      const m = Matrix4x4.Translate(new Vector3(5, 10, 15));
      const p = new Vector3(1, 1, 1);
      const result = m.MultiplyPoint3x4(p);
      expect(result.x).toBeCloseTo(6, 5);
      expect(result.y).toBeCloseTo(11, 5);
      expect(result.z).toBeCloseTo(16, 5);
    });
  });

  describe('Rotate', () => {
    it('should create rotation matrix from quaternion', () => {
      const q = Quaternion.Euler(0, 90, 0);
      const m = Matrix4x4.Rotate(q);

      // Should be non-identity
      expect(m.m00).not.toBe(1);
    });

    it('should rotate vector around Y axis', () => {
      const q = Quaternion.Euler(0, 90, 0);
      const m = Matrix4x4.Rotate(q);
      const v = new Vector3(1, 0, 0);
      const result = m.MultiplyVector(v);

      expect(result.x).toBeCloseTo(0, 5);
      expect(result.y).toBeCloseTo(0, 5);
      expect(result.z).toBeCloseTo(-1, 5);
    });

    it('should handle identity rotation', () => {
      const m = Matrix4x4.Rotate(Quaternion.identity);
      const v = new Vector3(1, 2, 3);
      const result = m.MultiplyVector(v);

      expect(result.x).toBeCloseTo(1, 5);
      expect(result.y).toBeCloseTo(2, 5);
      expect(result.z).toBeCloseTo(3, 5);
    });
  });

  describe('Scale', () => {
    it('should create scale matrix', () => {
      const m = Matrix4x4.Scale(new Vector3(2, 3, 4));
      expect(m.m00).toBe(2);
      expect(m.m11).toBe(3);
      expect(m.m22).toBe(4);
      expect(m.m33).toBe(1);
    });

    it('should scale vector correctly', () => {
      const m = Matrix4x4.Scale(new Vector3(2, 3, 4));
      const v = new Vector3(1, 1, 1);
      const result = m.MultiplyVector(v);

      expect(result.x).toBeCloseTo(2, 5);
      expect(result.y).toBeCloseTo(3, 5);
      expect(result.z).toBeCloseTo(4, 5);
    });

    it('should handle uniform scale', () => {
      const m = Matrix4x4.Scale(Vector3.one);
      const v = new Vector3(5, 10, 15);
      const result = m.MultiplyVector(v);

      expect(result.approximatelyEquals(v, 0.001)).toBe(true);
    });
  });

  describe('TRS', () => {
    it('should combine translation, rotation, and scale', () => {
      const t = new Vector3(1, 2, 3);
      const r = Quaternion.identity;
      const s = new Vector3(2, 2, 2);
      const m = Matrix4x4.TRS(t, r, s);

      expect(m.m03).toBe(1);
      expect(m.m13).toBe(2);
      expect(m.m23).toBe(3);
      expect(m.m00).toBe(2);
      expect(m.m11).toBe(2);
      expect(m.m22).toBe(2);
    });

    it('should apply transformations in correct order', () => {
      const t = new Vector3(10, 0, 0);
      const r = Quaternion.Euler(0, 90, 0);
      const s = new Vector3(2, 1, 1);
      const m = Matrix4x4.TRS(t, r, s);

      const p = new Vector3(1, 0, 0);
      const result = m.MultiplyPoint3x4(p);

      // Scale first (2x), rotate 90 degrees, then translate
      expect(result.x).toBeCloseTo(10, 5);
      expect(result.y).toBeCloseTo(0, 5);
      expect(result.z).toBeCloseTo(-2, 5);
    });

    it('should handle identity transformation', () => {
      const m = Matrix4x4.TRS(Vector3.zero, Quaternion.identity, Vector3.one);
      const p = new Vector3(5, 10, 15);
      const result = m.MultiplyPoint3x4(p);

      expect(result.approximatelyEquals(p, 0.001)).toBe(true);
    });
  });

  describe('Multiply', () => {
    it('should multiply two matrices', () => {
      const m1 = Matrix4x4.Translate(new Vector3(1, 0, 0));
      const m2 = Matrix4x4.Translate(new Vector3(0, 1, 0));
      const result = Matrix4x4.Multiply(m1, m2);

      const p = Vector3.zero;
      const transformed = result.MultiplyPoint3x4(p);

      expect(transformed.x).toBeCloseTo(1, 5);
      expect(transformed.y).toBeCloseTo(1, 5);
    });

    it('should multiply translation and rotation', () => {
      const t = Matrix4x4.Translate(new Vector3(10, 0, 0));
      const r = Matrix4x4.Rotate(Quaternion.Euler(0, 90, 0));
      const result = Matrix4x4.Multiply(t, r);

      const v = new Vector3(1, 0, 0);
      const transformed = result.MultiplyPoint3x4(v);

      expect(transformed.x).toBeCloseTo(10, 4);
      expect(transformed.z).toBeCloseTo(-1, 4);
    });

    it('should handle identity multiplication', () => {
      const m = Matrix4x4.Translate(new Vector3(5, 10, 15));
      const result = Matrix4x4.Multiply(m, Matrix4x4.identity);

      expect(result.m03).toBeCloseTo(5, 5);
      expect(result.m13).toBeCloseTo(10, 5);
      expect(result.m23).toBeCloseTo(15, 5);
    });
  });

  describe('transpose', () => {
    it('should transpose matrix', () => {
      const m = new Matrix4x4();
      m.m01 = 5;
      m.m10 = 3;
      m.m23 = 7;
      m.m32 = 9;

      const t = m.transpose;

      expect(t.m01).toBe(3);
      expect(t.m10).toBe(5);
      expect(t.m23).toBe(9);
      expect(t.m32).toBe(7);
    });

    it('should handle identity transpose', () => {
      const m = Matrix4x4.identity;
      const t = m.transpose;

      expect(t.m00).toBe(1);
      expect(t.m11).toBe(1);
      expect(t.m22).toBe(1);
      expect(t.m33).toBe(1);
    });
  });

  describe('determinant', () => {
    it('should calculate determinant of identity', () => {
      const m = Matrix4x4.identity;
      expect(m.determinant).toBeCloseTo(1, 5);
    });

    it('should calculate determinant of scale matrix', () => {
      const m = Matrix4x4.Scale(new Vector3(2, 3, 4));
      expect(m.determinant).toBeCloseTo(24, 5);
    });

    it('should return 0 for zero matrix', () => {
      const m = Matrix4x4.zero;
      expect(m.determinant).toBe(0);
    });

    it('should calculate determinant of rotation matrix', () => {
      const m = Matrix4x4.Rotate(Quaternion.Euler(45, 30, 60));
      // Rotation matrices should have determinant of 1
      expect(Math.abs(m.determinant)).toBeCloseTo(1, 5);
    });
  });

  describe('inverse', () => {
    it('should invert identity matrix', () => {
      const m = Matrix4x4.identity;
      const inv = m.inverse;

      expect(inv.m00).toBeCloseTo(1, 5);
      expect(inv.m11).toBeCloseTo(1, 5);
      expect(inv.m22).toBeCloseTo(1, 5);
      expect(inv.m33).toBeCloseTo(1, 5);
    });

    it('should invert translation matrix', () => {
      const m = Matrix4x4.Translate(new Vector3(5, 10, 15));
      const inv = m.inverse;

      expect(inv.m03).toBeCloseTo(-5, 5);
      expect(inv.m13).toBeCloseTo(-10, 5);
      expect(inv.m23).toBeCloseTo(-15, 5);
    });

    it('should invert scale matrix', () => {
      const m = Matrix4x4.Scale(new Vector3(2, 4, 8));
      const inv = m.inverse;

      expect(inv.m00).toBeCloseTo(0.5, 5);
      expect(inv.m11).toBeCloseTo(0.25, 5);
      expect(inv.m22).toBeCloseTo(0.125, 5);
    });

    it('should return zero matrix for singular matrix', () => {
      const m = Matrix4x4.zero;
      const inv = m.inverse;

      expect(inv.m00).toBe(0);
      expect(inv.m11).toBe(0);
    });

    it('should satisfy M * M^-1 = I', () => {
      const m = Matrix4x4.TRS(
        new Vector3(5, 10, 15),
        Quaternion.Euler(30, 45, 60),
        new Vector3(2, 3, 4)
      );
      const inv = m.inverse;
      const result = Matrix4x4.Multiply(m, inv);

      expect(result.m00).toBeCloseTo(1, 4);
      expect(result.m11).toBeCloseTo(1, 4);
      expect(result.m22).toBeCloseTo(1, 4);
      expect(result.m33).toBeCloseTo(1, 4);
      expect(result.m01).toBeCloseTo(0, 4);
      expect(result.m10).toBeCloseTo(0, 4);
    });
  });

  describe('MultiplyPoint', () => {
    it('should transform point with perspective divide', () => {
      const m = Matrix4x4.identity;
      const p = new Vector3(1, 2, 3);
      const result = m.MultiplyPoint(p);

      expect(result.x).toBeCloseTo(1, 5);
      expect(result.y).toBeCloseTo(2, 5);
      expect(result.z).toBeCloseTo(3, 5);
    });

    it('should apply translation to point', () => {
      const m = Matrix4x4.Translate(new Vector3(10, 20, 30));
      const p = new Vector3(1, 2, 3);
      const result = m.MultiplyPoint(p);

      expect(result.x).toBeCloseTo(11, 5);
      expect(result.y).toBeCloseTo(22, 5);
      expect(result.z).toBeCloseTo(33, 5);
    });
  });

  describe('MultiplyPoint3x4', () => {
    it('should transform point without perspective divide', () => {
      const m = Matrix4x4.TRS(
        new Vector3(1, 2, 3),
        Quaternion.identity,
        Vector3.one
      );
      const p = new Vector3(5, 10, 15);
      const result = m.MultiplyPoint3x4(p);

      expect(result.x).toBeCloseTo(6, 5);
      expect(result.y).toBeCloseTo(12, 5);
      expect(result.z).toBeCloseTo(18, 5);
    });
  });

  describe('MultiplyVector', () => {
    it('should transform direction without translation', () => {
      const m = Matrix4x4.Translate(new Vector3(100, 200, 300));
      const v = new Vector3(1, 0, 0);
      const result = m.MultiplyVector(v);

      // Translation should not affect direction
      expect(result.x).toBeCloseTo(1, 5);
      expect(result.y).toBeCloseTo(0, 5);
      expect(result.z).toBeCloseTo(0, 5);
    });

    it('should apply rotation to direction', () => {
      const m = Matrix4x4.Rotate(Quaternion.Euler(0, 90, 0));
      const v = new Vector3(1, 0, 0);
      const result = m.MultiplyVector(v);

      expect(result.x).toBeCloseTo(0, 5);
      expect(result.z).toBeCloseTo(-1, 5);
    });

    it('should apply scale to direction', () => {
      const m = Matrix4x4.Scale(new Vector3(2, 3, 4));
      const v = new Vector3(1, 1, 1);
      const result = m.MultiplyVector(v);

      expect(result.x).toBeCloseTo(2, 5);
      expect(result.y).toBeCloseTo(3, 5);
      expect(result.z).toBeCloseTo(4, 5);
    });
  });

  describe('Ortho', () => {
    it('should create orthographic projection matrix', () => {
      const m = Matrix4x4.Ortho(-10, 10, -5, 5, 0.1, 100);

      expect(m.m00).toBeCloseTo(2 / 20, 5);
      expect(m.m11).toBeCloseTo(2 / 10, 5);
      expect(m.m22).toBeCloseTo(-2 / 99.9, 5);
    });

    it('should map center to origin', () => {
      const m = Matrix4x4.Ortho(-1, 1, -1, 1, -1, 1);
      const center = new Vector3(0, 0, 0);
      const result = m.MultiplyPoint(center);

      expect(result.x).toBeCloseTo(0, 5);
      expect(result.y).toBeCloseTo(0, 5);
      expect(result.z).toBeCloseTo(0, 5);
    });
  });

  describe('Perspective', () => {
    it('should create perspective projection matrix', () => {
      const m = Matrix4x4.Perspective(60, 16 / 9, 0.1, 100);

      // Should have non-zero perspective components
      expect(m.m32).toBe(-1);
      expect(m.m33).toBe(0);
    });

    it('should handle different aspect ratios', () => {
      const m1 = Matrix4x4.Perspective(60, 1, 0.1, 100);
      const m2 = Matrix4x4.Perspective(60, 2, 0.1, 100);

      // Wider aspect should have smaller x scale
      expect(m2.m00).toBeLessThan(m1.m00);
    });
  });

  describe('LookAt', () => {
    it('should create look-at matrix', () => {
      const from = new Vector3(0, 0, 10);
      const to = Vector3.zero;
      const up = Vector3.up;
      const m = Matrix4x4.LookAt(from, to, up);

      expect(m.m03).toBe(0);
      expect(m.m13).toBe(0);
      expect(m.m23).toBe(10);
    });

    it('should handle looking forward', () => {
      const from = new Vector3(0, 0, 0);
      const to = new Vector3(0, 0, -1);
      const up = Vector3.up;
      const m = Matrix4x4.LookAt(from, to, up);

      // Forward direction (z-axis) should be (0,0,1) when looking toward -Z
      // z = from - to = (0,0,0) - (0,0,-1) = (0,0,1)
      expect(m.m22).toBeCloseTo(1, 5);
    });
  });

  describe('GetColumn', () => {
    it('should get column 0', () => {
      const m = Matrix4x4.identity;
      const col = m.GetColumn(0);

      expect(col.x).toBe(1);
      expect(col.y).toBe(0);
      expect(col.z).toBe(0);
      expect(col.w).toBe(0);
    });

    it('should get translation column', () => {
      const m = Matrix4x4.Translate(new Vector3(5, 10, 15));
      const col = m.GetColumn(3);

      expect(col.x).toBe(5);
      expect(col.y).toBe(10);
      expect(col.z).toBe(15);
      expect(col.w).toBe(1);
    });

    it('should throw for invalid index', () => {
      const m = Matrix4x4.identity;
      expect(() => m.GetColumn(4)).toThrow();
      expect(() => m.GetColumn(-1)).toThrow();
    });
  });

  describe('GetRow', () => {
    it('should get row 0', () => {
      const m = Matrix4x4.identity;
      const row = m.GetRow(0);

      expect(row.x).toBe(1);
      expect(row.y).toBe(0);
      expect(row.z).toBe(0);
      expect(row.w).toBe(0);
    });

    it('should get custom row', () => {
      const m = new Matrix4x4();
      m.m10 = 5;
      m.m11 = 6;
      m.m12 = 7;
      m.m13 = 8;
      const row = m.GetRow(1);

      expect(row.x).toBe(5);
      expect(row.y).toBe(6);
      expect(row.z).toBe(7);
      expect(row.w).toBe(8);
    });

    it('should throw for invalid index', () => {
      const m = Matrix4x4.identity;
      expect(() => m.GetRow(4)).toThrow();
      expect(() => m.GetRow(-1)).toThrow();
    });
  });

  describe('toString', () => {
    it('should format matrix as string', () => {
      const m = Matrix4x4.identity;
      const str = m.toString();

      expect(str).toContain('1.00000');
      expect(str).toContain('0.00000');
      expect(str.split('\n')).toHaveLength(4);
    });

    it('should format custom matrix', () => {
      const m = Matrix4x4.Translate(new Vector3(1.23456, 2.34567, 3.45678));
      const str = m.toString();

      expect(str).toContain('1.23456');
      expect(str).toContain('2.34567');
      expect(str).toContain('3.45678');
    });
  });

  describe('performance', () => {
    it('should handle many matrix multiplications', () => {
      const start = performance.now();

      const m1 = Matrix4x4.TRS(
        new Vector3(1, 2, 3),
        Quaternion.Euler(30, 45, 60),
        new Vector3(2, 2, 2)
      );

      let result = m1;
      for (let i = 0; i < 1000; i++) {
        result = Matrix4x4.Multiply(result, m1);
      }

      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(100); // Should complete in <100ms
    });

    it('should handle many point transformations', () => {
      const start = performance.now();

      const m = Matrix4x4.TRS(
        new Vector3(1, 2, 3),
        Quaternion.Euler(30, 45, 60),
        new Vector3(2, 2, 2)
      );

      const points = [];
      for (let i = 0; i < 10000; i++) {
        points.push(m.MultiplyPoint3x4(new Vector3(i, i, i)));
      }

      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(100); // Should complete in <100ms
      expect(points).toHaveLength(10000);
    });
  });
});
