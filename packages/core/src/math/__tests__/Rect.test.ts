import { describe, it, expect } from 'vitest';
import { Rect } from '../Rect';
import { Vector2 } from '../Vector2';

describe('Rect', () => {
  describe('Constructor', () => {
    it('should create with default values', () => {
      const rect = new Rect();
      expect(rect.x).toBe(0);
      expect(rect.y).toBe(0);
      expect(rect.width).toBe(0);
      expect(rect.height).toBe(0);
    });

    it('should create with specified values', () => {
      const rect = new Rect(10, 20, 100, 50);
      expect(rect.x).toBe(10);
      expect(rect.y).toBe(20);
      expect(rect.width).toBe(100);
      expect(rect.height).toBe(50);
    });
  });

  describe('Properties - Min/Max', () => {
    it('should calculate xMin correctly', () => {
      const rect = new Rect(10, 20, 100, 50);
      expect(rect.xMin).toBe(10);
    });

    it('should calculate xMax correctly', () => {
      const rect = new Rect(10, 20, 100, 50);
      expect(rect.xMax).toBe(110);
    });

    it('should calculate yMin correctly', () => {
      const rect = new Rect(10, 20, 100, 50);
      expect(rect.yMin).toBe(20);
    });

    it('should calculate yMax correctly', () => {
      const rect = new Rect(10, 20, 100, 50);
      expect(rect.yMax).toBe(70);
    });

    it('should set xMin correctly', () => {
      const rect = new Rect(10, 20, 100, 50);
      rect.xMin = 5;
      expect(rect.x).toBe(5);
      expect(rect.width).toBe(105);
    });

    it('should set xMax correctly', () => {
      const rect = new Rect(10, 20, 100, 50);
      rect.xMax = 120;
      expect(rect.x).toBe(10);
      expect(rect.width).toBe(110);
    });

    it('should set yMin correctly', () => {
      const rect = new Rect(10, 20, 100, 50);
      rect.yMin = 15;
      expect(rect.y).toBe(15);
      expect(rect.height).toBe(55);
    });

    it('should set yMax correctly', () => {
      const rect = new Rect(10, 20, 100, 50);
      rect.yMax = 80;
      expect(rect.y).toBe(20);
      expect(rect.height).toBe(60);
    });

    it('should handle negative width', () => {
      const rect = new Rect(10, 20, -100, 50);
      expect(rect.xMin).toBe(-90);
      expect(rect.xMax).toBe(10);
    });

    it('should handle negative height', () => {
      const rect = new Rect(10, 20, 100, -50);
      expect(rect.yMin).toBe(-30);
      expect(rect.yMax).toBe(20);
    });
  });

  describe('Properties - Min/Max Vectors', () => {
    it('should get min vector', () => {
      const rect = new Rect(10, 20, 100, 50);
      const min = rect.min;
      expect(min.x).toBe(10);
      expect(min.y).toBe(20);
    });

    it('should get max vector', () => {
      const rect = new Rect(10, 20, 100, 50);
      const max = rect.max;
      expect(max.x).toBe(110);
      expect(max.y).toBe(70);
    });

    it('should set min vector', () => {
      const rect = new Rect(10, 20, 100, 50);
      rect.min = new Vector2(5, 15);
      expect(rect.x).toBe(5);
      expect(rect.y).toBe(15);
      expect(rect.width).toBe(105);
      expect(rect.height).toBe(55);
    });

    it('should set max vector', () => {
      const rect = new Rect(10, 20, 100, 50);
      rect.max = new Vector2(120, 80);
      expect(rect.x).toBe(10);
      expect(rect.y).toBe(20);
      expect(rect.width).toBe(110);
      expect(rect.height).toBe(60);
    });
  });

  describe('Properties - Center', () => {
    it('should get center', () => {
      const rect = new Rect(10, 20, 100, 50);
      const center = rect.center;
      expect(center.x).toBe(60);
      expect(center.y).toBe(45);
    });

    it('should set center', () => {
      const rect = new Rect(10, 20, 100, 50);
      rect.center = new Vector2(75, 60);
      expect(rect.x).toBe(25);
      expect(rect.y).toBe(35);
      expect(rect.width).toBe(100);
      expect(rect.height).toBe(50);
    });
  });

  describe('Properties - Position and Size', () => {
    it('should get position', () => {
      const rect = new Rect(10, 20, 100, 50);
      const pos = rect.position;
      expect(pos.x).toBe(10);
      expect(pos.y).toBe(20);
    });

    it('should set position', () => {
      const rect = new Rect(10, 20, 100, 50);
      rect.position = new Vector2(30, 40);
      expect(rect.x).toBe(30);
      expect(rect.y).toBe(40);
      expect(rect.width).toBe(100);
      expect(rect.height).toBe(50);
    });

    it('should get size', () => {
      const rect = new Rect(10, 20, 100, 50);
      const size = rect.size;
      expect(size.x).toBe(100);
      expect(size.y).toBe(50);
    });

    it('should set size', () => {
      const rect = new Rect(10, 20, 100, 50);
      rect.size = new Vector2(200, 75);
      expect(rect.x).toBe(10);
      expect(rect.y).toBe(20);
      expect(rect.width).toBe(200);
      expect(rect.height).toBe(75);
    });
  });

  describe('Static Methods', () => {
    it('should create from MinMaxRect', () => {
      const rect = Rect.MinMaxRect(10, 20, 110, 70);
      expect(rect.x).toBe(10);
      expect(rect.y).toBe(20);
      expect(rect.width).toBe(100);
      expect(rect.height).toBe(50);
    });

    it('should convert normalized to point', () => {
      const rect = new Rect(10, 20, 100, 50);
      const point = Rect.NormalizedToPoint(rect, new Vector2(0.5, 0.5));
      expect(point.x).toBe(60);
      expect(point.y).toBe(45);
    });

    it('should convert normalized to point at origin', () => {
      const rect = new Rect(10, 20, 100, 50);
      const point = Rect.NormalizedToPoint(rect, new Vector2(0, 0));
      expect(point.x).toBe(10);
      expect(point.y).toBe(20);
    });

    it('should convert normalized to point at max', () => {
      const rect = new Rect(10, 20, 100, 50);
      const point = Rect.NormalizedToPoint(rect, new Vector2(1, 1));
      expect(point.x).toBe(110);
      expect(point.y).toBe(70);
    });

    it('should convert point to normalized', () => {
      const rect = new Rect(10, 20, 100, 50);
      const normalized = Rect.PointToNormalized(rect, new Vector2(60, 45));
      expect(normalized.x).toBeCloseTo(0.5);
      expect(normalized.y).toBeCloseTo(0.5);
    });

    it('should convert point to normalized at origin', () => {
      const rect = new Rect(10, 20, 100, 50);
      const normalized = Rect.PointToNormalized(rect, new Vector2(10, 20));
      expect(normalized.x).toBe(0);
      expect(normalized.y).toBe(0);
    });

    it('should convert point to normalized at max', () => {
      const rect = new Rect(10, 20, 100, 50);
      const normalized = Rect.PointToNormalized(rect, new Vector2(110, 70));
      expect(normalized.x).toBe(1);
      expect(normalized.y).toBe(1);
    });
  });

  describe('Contains', () => {
    it('should return true for point inside', () => {
      const rect = new Rect(10, 20, 100, 50);
      expect(rect.Contains(new Vector2(50, 40))).toBe(true);
    });

    it('should return true for point at min corner', () => {
      const rect = new Rect(10, 20, 100, 50);
      expect(rect.Contains(new Vector2(10, 20))).toBe(true);
    });

    it('should return false for point at max corner', () => {
      const rect = new Rect(10, 20, 100, 50);
      expect(rect.Contains(new Vector2(110, 70))).toBe(false);
    });

    it('should return false for point outside', () => {
      const rect = new Rect(10, 20, 100, 50);
      expect(rect.Contains(new Vector2(150, 100))).toBe(false);
    });

    it('should return false for point left of rect', () => {
      const rect = new Rect(10, 20, 100, 50);
      expect(rect.Contains(new Vector2(5, 40))).toBe(false);
    });

    it('should return false for point above rect', () => {
      const rect = new Rect(10, 20, 100, 50);
      expect(rect.Contains(new Vector2(50, 80))).toBe(false);
    });

    it('should handle negative width with allowInverse', () => {
      const rect = new Rect(10, 20, -100, 50);
      expect(rect.Contains(new Vector2(0, 40), true)).toBe(true);
    });

    it('should handle negative height with allowInverse', () => {
      const rect = new Rect(10, 20, 100, -50);
      expect(rect.Contains(new Vector2(50, 0), true)).toBe(true);
    });
  });

  describe('Overlaps', () => {
    it('should return true for overlapping rects', () => {
      const rect1 = new Rect(10, 20, 100, 50);
      const rect2 = new Rect(50, 40, 100, 50);
      expect(rect1.Overlaps(rect2)).toBe(true);
    });

    it('should return true for identical rects', () => {
      const rect1 = new Rect(10, 20, 100, 50);
      const rect2 = new Rect(10, 20, 100, 50);
      expect(rect1.Overlaps(rect2)).toBe(true);
    });

    it('should return true for contained rect', () => {
      const rect1 = new Rect(10, 20, 100, 50);
      const rect2 = new Rect(30, 30, 20, 20);
      expect(rect1.Overlaps(rect2)).toBe(true);
    });

    it('should return false for non-overlapping rects', () => {
      const rect1 = new Rect(10, 20, 100, 50);
      const rect2 = new Rect(150, 100, 100, 50);
      expect(rect1.Overlaps(rect2)).toBe(false);
    });

    it('should return false for touching rects', () => {
      const rect1 = new Rect(10, 20, 100, 50);
      const rect2 = new Rect(110, 20, 100, 50);
      expect(rect1.Overlaps(rect2)).toBe(false);
    });

    it('should handle negative width with allowInverse', () => {
      const rect1 = new Rect(10, 20, -100, 50);
      const rect2 = new Rect(-50, 30, 100, 50);
      expect(rect1.Overlaps(rect2, true)).toBe(true);
    });
  });

  describe('Set', () => {
    it('should set all components', () => {
      const rect = new Rect(10, 20, 100, 50);
      rect.Set(30, 40, 200, 75);
      expect(rect.x).toBe(30);
      expect(rect.y).toBe(40);
      expect(rect.width).toBe(200);
      expect(rect.height).toBe(75);
    });
  });

  describe('toString', () => {
    it('should return formatted string', () => {
      const rect = new Rect(10, 20, 100, 50);
      const str = rect.toString();
      expect(str).toContain('10.00');
      expect(str).toContain('20.00');
      expect(str).toContain('100.00');
      expect(str).toContain('50.00');
    });
  });

  describe('equals', () => {
    it('should return true for equal rects', () => {
      const rect1 = new Rect(10, 20, 100, 50);
      const rect2 = new Rect(10, 20, 100, 50);
      expect(rect1.equals(rect2)).toBe(true);
    });

    it('should return false for different x', () => {
      const rect1 = new Rect(10, 20, 100, 50);
      const rect2 = new Rect(15, 20, 100, 50);
      expect(rect1.equals(rect2)).toBe(false);
    });

    it('should return false for different width', () => {
      const rect1 = new Rect(10, 20, 100, 50);
      const rect2 = new Rect(10, 20, 110, 50);
      expect(rect1.equals(rect2)).toBe(false);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero-size rect', () => {
      const rect = new Rect(10, 20, 0, 0);
      expect(rect.xMin).toBe(10);
      expect(rect.xMax).toBe(10);
      expect(rect.yMin).toBe(20);
      expect(rect.yMax).toBe(20);
    });

    it('should handle very large rect', () => {
      const rect = new Rect(0, 0, 1000000, 1000000);
      expect(rect.center.x).toBe(500000);
      expect(rect.center.y).toBe(500000);
    });

    it('should handle negative position', () => {
      const rect = new Rect(-100, -200, 100, 50);
      expect(rect.xMin).toBe(-100);
      expect(rect.yMin).toBe(-200);
      expect(rect.xMax).toBe(0);
      expect(rect.yMax).toBe(-150);
    });
  });
});
