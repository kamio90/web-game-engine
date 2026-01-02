import { describe, it, expect } from 'vitest';
import { Color } from '../Color';

describe('Color', () => {
  describe('constructor', () => {
    it('should create black with alpha 1 by default', () => {
      const c = new Color();
      expect(c.r).toBe(0);
      expect(c.g).toBe(0);
      expect(c.b).toBe(0);
      expect(c.a).toBe(1);
    });

    it('should create color with specified components', () => {
      const c = new Color(0.5, 0.6, 0.7, 0.8);
      expect(c.r).toBe(0.5);
      expect(c.g).toBe(0.6);
      expect(c.b).toBe(0.7);
      expect(c.a).toBe(0.8);
    });

    it('should default alpha to 1', () => {
      const c = new Color(1, 0.5, 0.25);
      expect(c.a).toBe(1);
    });
  });

  describe('static color constants', () => {
    it('should have red color', () => {
      const c = Color.red;
      expect(c.r).toBe(1);
      expect(c.g).toBe(0);
      expect(c.b).toBe(0);
      expect(c.a).toBe(1);
    });

    it('should have green color', () => {
      const c = Color.green;
      expect(c.r).toBe(0);
      expect(c.g).toBe(1);
      expect(c.b).toBe(0);
      expect(c.a).toBe(1);
    });

    it('should have blue color', () => {
      const c = Color.blue;
      expect(c.r).toBe(0);
      expect(c.g).toBe(0);
      expect(c.b).toBe(1);
      expect(c.a).toBe(1);
    });

    it('should have white color', () => {
      const c = Color.white;
      expect(c.r).toBe(1);
      expect(c.g).toBe(1);
      expect(c.b).toBe(1);
      expect(c.a).toBe(1);
    });

    it('should have black color', () => {
      const c = Color.black;
      expect(c.r).toBe(0);
      expect(c.g).toBe(0);
      expect(c.b).toBe(0);
      expect(c.a).toBe(1);
    });

    it('should have yellow color', () => {
      const c = Color.yellow;
      expect(c.r).toBe(1);
      expect(c.g).toBe(0.92);
      expect(c.b).toBe(0.016);
      expect(c.a).toBe(1);
    });

    it('should have cyan color', () => {
      const c = Color.cyan;
      expect(c.r).toBe(0);
      expect(c.g).toBe(1);
      expect(c.b).toBe(1);
      expect(c.a).toBe(1);
    });

    it('should have magenta color', () => {
      const c = Color.magenta;
      expect(c.r).toBe(1);
      expect(c.g).toBe(0);
      expect(c.b).toBe(1);
      expect(c.a).toBe(1);
    });

    it('should have gray color', () => {
      const c = Color.gray;
      expect(c.r).toBe(0.5);
      expect(c.g).toBe(0.5);
      expect(c.b).toBe(0.5);
      expect(c.a).toBe(1);
    });

    it('should have grey color (alias)', () => {
      const c = Color.grey;
      expect(c.r).toBe(0.5);
      expect(c.g).toBe(0.5);
      expect(c.b).toBe(0.5);
      expect(c.a).toBe(1);
    });

    it('should have clear color', () => {
      const c = Color.clear;
      expect(c.r).toBe(0);
      expect(c.g).toBe(0);
      expect(c.b).toBe(0);
      expect(c.a).toBe(0);
    });
  });

  describe('gamma', () => {
    it('should convert linear to gamma', () => {
      const linear = new Color(0.5, 0.5, 0.5, 1);
      const gamma = linear.gamma;
      expect(gamma.r).toBeGreaterThan(linear.r);
      expect(gamma.a).toBe(1); // Alpha unchanged
    });

    it('should handle black', () => {
      const gamma = Color.black.gamma;
      expect(gamma.r).toBe(0);
      expect(gamma.g).toBe(0);
      expect(gamma.b).toBe(0);
    });

    it('should handle white', () => {
      const gamma = Color.white.gamma;
      expect(gamma.r).toBeCloseTo(1, 5);
      expect(gamma.g).toBeCloseTo(1, 5);
      expect(gamma.b).toBeCloseTo(1, 5);
    });
  });

  describe('linear', () => {
    it('should convert gamma to linear', () => {
      const gamma = new Color(0.5, 0.5, 0.5, 1);
      const linear = gamma.linear;
      expect(linear.r).toBeLessThan(gamma.r);
      expect(linear.a).toBe(1); // Alpha unchanged
    });

    it('should handle black', () => {
      const linear = Color.black.linear;
      expect(linear.r).toBe(0);
      expect(linear.g).toBe(0);
      expect(linear.b).toBe(0);
    });

    it('should handle white', () => {
      const linear = Color.white.linear;
      expect(linear.r).toBeCloseTo(1, 5);
      expect(linear.g).toBeCloseTo(1, 5);
      expect(linear.b).toBeCloseTo(1, 5);
    });
  });

  describe('maxColorComponent', () => {
    it('should return max RGB component', () => {
      const c = new Color(0.3, 0.7, 0.5);
      expect(c.maxColorComponent).toBe(0.7);
    });

    it('should work when R is max', () => {
      const c = new Color(0.9, 0.2, 0.3);
      expect(c.maxColorComponent).toBe(0.9);
    });

    it('should work when B is max', () => {
      const c = new Color(0.1, 0.2, 0.8);
      expect(c.maxColorComponent).toBe(0.8);
    });
  });

  describe('grayscale', () => {
    it('should calculate grayscale value', () => {
      const c = new Color(1, 0, 0);
      expect(c.grayscale).toBeCloseTo(0.299, 5);
    });

    it('should return 1 for white', () => {
      expect(Color.white.grayscale).toBeCloseTo(1, 5);
    });

    it('should return 0 for black', () => {
      expect(Color.black.grayscale).toBe(0);
    });

    it('should use proper weights', () => {
      const c = new Color(0.5, 0.5, 0.5);
      const expected = 0.299 * 0.5 + 0.587 * 0.5 + 0.114 * 0.5;
      expect(c.grayscale).toBeCloseTo(expected, 5);
    });
  });

  describe('Lerp', () => {
    it('should interpolate between colors', () => {
      const a = Color.black;
      const b = Color.white;
      const result = Color.Lerp(a, b, 0.5);
      expect(result.r).toBeCloseTo(0.5, 5);
      expect(result.g).toBeCloseTo(0.5, 5);
      expect(result.b).toBeCloseTo(0.5, 5);
    });

    it('should clamp t to 0-1', () => {
      const a = Color.black;
      const b = Color.white;
      const result = Color.Lerp(a, b, 1.5);
      expect(result.approximatelyEquals(b, 0.001)).toBe(true);
    });

    it('should return start at t=0', () => {
      const a = Color.red;
      const b = Color.blue;
      const result = Color.Lerp(a, b, 0);
      expect(result.approximatelyEquals(a, 0.001)).toBe(true);
    });

    it('should return end at t=1', () => {
      const a = Color.red;
      const b = Color.blue;
      const result = Color.Lerp(a, b, 1);
      expect(result.approximatelyEquals(b, 0.001)).toBe(true);
    });

    it('should interpolate alpha', () => {
      const a = new Color(1, 1, 1, 0);
      const b = new Color(1, 1, 1, 1);
      const result = Color.Lerp(a, b, 0.5);
      expect(result.a).toBeCloseTo(0.5, 5);
    });
  });

  describe('LerpUnclamped', () => {
    it('should extrapolate beyond 1', () => {
      const a = Color.black;
      const b = Color.white;
      const result = Color.LerpUnclamped(a, b, 1.5);
      expect(result.r).toBeCloseTo(1.5, 5);
    });

    it('should extrapolate below 0', () => {
      const a = new Color(0.5, 0.5, 0.5);
      const b = Color.white;
      const result = Color.LerpUnclamped(a, b, -0.5);
      expect(result.r).toBeCloseTo(0.25, 5);
    });
  });

  describe('HSVToRGB', () => {
    it('should convert red HSV to RGB', () => {
      const c = Color.HSVToRGB(0, 1, 1);
      expect(c.r).toBeCloseTo(1, 5);
      expect(c.g).toBeCloseTo(0, 5);
      expect(c.b).toBeCloseTo(0, 5);
    });

    it('should convert green HSV to RGB', () => {
      const c = Color.HSVToRGB(1 / 3, 1, 1);
      expect(c.r).toBeCloseTo(0, 5);
      expect(c.g).toBeCloseTo(1, 5);
      expect(c.b).toBeCloseTo(0, 5);
    });

    it('should convert blue HSV to RGB', () => {
      const c = Color.HSVToRGB(2 / 3, 1, 1);
      expect(c.r).toBeCloseTo(0, 5);
      expect(c.g).toBeCloseTo(0, 5);
      expect(c.b).toBeCloseTo(1, 5);
    });

    it('should handle zero saturation (grayscale)', () => {
      const c = Color.HSVToRGB(0.5, 0, 0.7);
      expect(c.r).toBeCloseTo(0.7, 5);
      expect(c.g).toBeCloseTo(0.7, 5);
      expect(c.b).toBeCloseTo(0.7, 5);
    });

    it('should handle zero value (black)', () => {
      const c = Color.HSVToRGB(0.5, 1, 0);
      expect(c.r).toBe(0);
      expect(c.g).toBe(0);
      expect(c.b).toBe(0);
    });

    it('should support HDR mode', () => {
      const c = Color.HSVToRGB(0, 1, 2, true);
      expect(c.r).toBeCloseTo(2, 5);
      expect(c.g).toBeCloseTo(0, 5);
    });

    it('should clamp in non-HDR mode', () => {
      const c = Color.HSVToRGB(0, 1, 2, false);
      expect(c.r).toBe(1);
    });

    it('should handle all 6 hue segments', () => {
      // Test each switch case
      const colors = [
        Color.HSVToRGB(0 / 6, 1, 1), // case 0
        Color.HSVToRGB(1 / 6, 1, 1), // case 1
        Color.HSVToRGB(2 / 6, 1, 1), // case 2
        Color.HSVToRGB(3 / 6, 1, 1), // case 3
        Color.HSVToRGB(4 / 6, 1, 1), // case 4
        Color.HSVToRGB(5 / 6, 1, 1), // case 5
      ];

      // Each should produce a valid color
      colors.forEach((c) => {
        expect(c.r).toBeGreaterThanOrEqual(0);
        expect(c.r).toBeLessThanOrEqual(1);
      });
    });
  });

  describe('RGBToHSV', () => {
    it('should convert red to HSV', () => {
      const hsv = Color.RGBToHSV(Color.red);
      expect(hsv.H).toBeCloseTo(0, 5);
      expect(hsv.S).toBeCloseTo(1, 5);
      expect(hsv.V).toBeCloseTo(1, 5);
    });

    it('should convert green to HSV', () => {
      const hsv = Color.RGBToHSV(Color.green);
      expect(hsv.H).toBeCloseTo(1 / 3, 5);
      expect(hsv.S).toBeCloseTo(1, 5);
      expect(hsv.V).toBeCloseTo(1, 5);
    });

    it('should convert blue to HSV', () => {
      const hsv = Color.RGBToHSV(Color.blue);
      expect(hsv.H).toBeCloseTo(2 / 3, 5);
      expect(hsv.S).toBeCloseTo(1, 5);
      expect(hsv.V).toBeCloseTo(1, 5);
    });

    it('should handle black', () => {
      const hsv = Color.RGBToHSV(Color.black);
      expect(hsv.V).toBe(0);
    });

    it('should handle white', () => {
      const hsv = Color.RGBToHSV(Color.white);
      expect(hsv.S).toBe(0);
      expect(hsv.V).toBe(1);
    });

    it('should round-trip with HSVToRGB', () => {
      const original = Color.HSVToRGB(0.3, 0.7, 0.9);
      const hsv = Color.RGBToHSV(original);
      const back = Color.HSVToRGB(hsv.H, hsv.S, hsv.V);
      expect(back.approximatelyEquals(original, 0.01)).toBe(true);
    });
  });

  describe('Multiply', () => {
    it('should multiply colors component-wise', () => {
      const a = new Color(0.5, 0.6, 0.7, 0.8);
      const b = new Color(2, 2, 2, 2);
      const result = Color.Multiply(a, b);
      expect(result.r).toBeCloseTo(1, 5);
      expect(result.g).toBeCloseTo(1.2, 5);
      expect(result.b).toBeCloseTo(1.4, 5);
      expect(result.a).toBeCloseTo(1.6, 5);
    });

    it('should work with white', () => {
      const c = new Color(0.5, 0.5, 0.5);
      const result = Color.Multiply(c, Color.white);
      expect(result.approximatelyEquals(c, 0.001)).toBe(true);
    });

    it('should work with black', () => {
      const c = new Color(0.5, 0.5, 0.5);
      const result = Color.Multiply(c, Color.black);
      expect(result.r).toBe(0);
      expect(result.g).toBe(0);
      expect(result.b).toBe(0);
    });
  });

  describe('Scale', () => {
    it('should scale color by scalar', () => {
      const c = new Color(0.2, 0.4, 0.6, 0.8);
      const result = Color.Scale(c, 2);
      expect(result.r).toBeCloseTo(0.4, 5);
      expect(result.g).toBeCloseTo(0.8, 5);
      expect(result.b).toBeCloseTo(1.2, 5);
      expect(result.a).toBeCloseTo(1.6, 5);
    });

    it('should handle zero scale', () => {
      const result = Color.Scale(Color.white, 0);
      expect(result.r).toBe(0);
      expect(result.g).toBe(0);
      expect(result.b).toBe(0);
      expect(result.a).toBe(0);
    });
  });

  describe('Add', () => {
    it('should add colors component-wise', () => {
      const a = new Color(0.2, 0.3, 0.4, 0.5);
      const b = new Color(0.3, 0.2, 0.1, 0.5);
      const result = Color.Add(a, b);
      expect(result.r).toBeCloseTo(0.5, 5);
      expect(result.g).toBeCloseTo(0.5, 5);
      expect(result.b).toBeCloseTo(0.5, 5);
      expect(result.a).toBeCloseTo(1, 5);
    });
  });

  describe('Subtract', () => {
    it('should subtract colors component-wise', () => {
      const a = new Color(0.5, 0.6, 0.7, 1);
      const b = new Color(0.2, 0.3, 0.4, 0.5);
      const result = Color.Subtract(a, b);
      expect(result.r).toBeCloseTo(0.3, 5);
      expect(result.g).toBeCloseTo(0.3, 5);
      expect(result.b).toBeCloseTo(0.3, 5);
      expect(result.a).toBeCloseTo(0.5, 5);
    });
  });

  describe('approximatelyEquals', () => {
    it('should return true for approximately equal colors', () => {
      const a = new Color(0.5, 0.5, 0.5, 1);
      const b = new Color(0.500001, 0.500001, 0.500001, 1);
      expect(a.approximatelyEquals(b)).toBe(true);
    });

    it('should return false for different colors', () => {
      const a = Color.red;
      const b = Color.blue;
      expect(a.approximatelyEquals(b)).toBe(false);
    });

    it('should use custom epsilon', () => {
      const a = new Color(0.5, 0.5, 0.5, 1);
      const b = new Color(0.51, 0.51, 0.51, 1);
      expect(a.approximatelyEquals(b, 0.1)).toBe(true);
    });
  });

  describe('Equals', () => {
    it('should return true for equal colors', () => {
      const a = new Color(0.5, 0.6, 0.7, 0.8);
      const b = new Color(0.5, 0.6, 0.7, 0.8);
      expect(a.Equals(b)).toBe(true);
    });

    it('should return false for different colors', () => {
      const a = Color.red;
      const b = Color.blue;
      expect(a.Equals(b)).toBe(false);
    });

    it('should be strict', () => {
      const a = new Color(0.5, 0.5, 0.5, 1);
      const b = new Color(0.500001, 0.5, 0.5, 1);
      expect(a.Equals(b)).toBe(false);
    });
  });

  describe('toString', () => {
    it('should format color as string', () => {
      const c = new Color(1, 0.5, 0.25, 0.8);
      const str = c.toString();
      expect(str).toContain('1.000');
      expect(str).toContain('0.500');
      expect(str).toContain('0.250');
      expect(str).toContain('0.800');
    });

    it('should include RGBA prefix', () => {
      const str = Color.red.toString();
      expect(str).toContain('RGBA');
    });
  });

  describe('toHex', () => {
    it('should convert red to hex', () => {
      expect(Color.red.toHex()).toBe('#FF0000FF');
    });

    it('should convert green to hex', () => {
      expect(Color.green.toHex()).toBe('#00FF00FF');
    });

    it('should convert blue to hex', () => {
      expect(Color.blue.toHex()).toBe('#0000FFFF');
    });

    it('should convert white to hex', () => {
      expect(Color.white.toHex()).toBe('#FFFFFFFF');
    });

    it('should convert black to hex', () => {
      expect(Color.black.toHex()).toBe('#000000FF');
    });

    it('should handle alpha', () => {
      const c = new Color(1, 1, 1, 0.5);
      expect(c.toHex()).toBe('#FFFFFF80');
    });

    it('should clamp values', () => {
      const c = new Color(1.5, -0.5, 0.5, 1);
      const hex = c.toHex();
      expect(hex).toContain('FF'); // Red clamped to 1
      expect(hex).toContain('00'); // Green clamped to 0
    });
  });

  describe('FromHex', () => {
    it('should parse red hex', () => {
      const c = Color.FromHex('#FF0000');
      expect(c.approximatelyEquals(Color.red, 0.01)).toBe(true);
    });

    it('should parse green hex', () => {
      const c = Color.FromHex('#00FF00');
      expect(c.approximatelyEquals(Color.green, 0.01)).toBe(true);
    });

    it('should parse blue hex', () => {
      const c = Color.FromHex('#0000FF');
      expect(c.approximatelyEquals(Color.blue, 0.01)).toBe(true);
    });

    it('should parse with alpha', () => {
      const c = Color.FromHex('#FF000080');
      expect(c.r).toBeCloseTo(1, 2);
      expect(c.a).toBeCloseTo(0.5, 2);
    });

    it('should work without # prefix', () => {
      const c = Color.FromHex('FF0000');
      expect(c.approximatelyEquals(Color.red, 0.01)).toBe(true);
    });

    it('should default to full alpha for 6-char hex', () => {
      const c = Color.FromHex('#FF0000');
      expect(c.a).toBeCloseTo(1, 2);
    });

    it('should handle invalid hex', () => {
      const c = Color.FromHex('invalid');
      expect(c.approximatelyEquals(Color.white, 0.01)).toBe(true);
    });

    it('should round-trip with toHex', () => {
      const original = new Color(0.2, 0.4, 0.6, 0.8);
      const hex = original.toHex();
      const back = Color.FromHex(hex);
      expect(back.approximatelyEquals(original, 0.01)).toBe(true);
    });
  });

  describe('performance', () => {
    it('should handle many color operations', () => {
      const start = performance.now();

      for (let i = 0; i < 10000; i++) {
        const c1 = Color.HSVToRGB(i / 10000, 0.5, 0.5);
        const c2 = Color.Lerp(c1, Color.white, 0.5);
        c2.grayscale;
        c2.toHex();
      }

      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(100); // Should complete in <100ms
    });
  });
});
