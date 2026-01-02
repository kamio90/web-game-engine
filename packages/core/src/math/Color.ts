import { Mathf } from './Mathf';

/**
 * Representation of RGBA colors.
 *
 * This structure is used throughout Unity to pass colors around. Each color component is a
 * floating point value with a range from 0 to 1.
 *
 * @example
 * ```typescript
 * const red = new Color(1, 0, 0);
 * const halfAlpha = new Color(1, 1, 1, 0.5);
 * const lerped = Color.Lerp(Color.red, Color.blue, 0.5);
 * ```
 */
export class Color {
  public r: number;
  public g: number;
  public b: number;
  public a: number;

  /**
   * Constructs a new Color with given r, g, b, a components.
   * @param r - Red component (0-1)
   * @param g - Green component (0-1)
   * @param b - Blue component (0-1)
   * @param a - Alpha component (0-1), defaults to 1
   */
  constructor(r: number = 0, g: number = 0, b: number = 0, a: number = 1) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  // ==================== Static Color Constants ====================

  /** Solid red. RGBA is (1, 0, 0, 1). */
  public static get red(): Color {
    return new Color(1, 0, 0, 1);
  }

  /** Solid green. RGBA is (0, 1, 0, 1). */
  public static get green(): Color {
    return new Color(0, 1, 0, 1);
  }

  /** Solid blue. RGBA is (0, 0, 1, 1). */
  public static get blue(): Color {
    return new Color(0, 0, 1, 1);
  }

  /** Solid white. RGBA is (1, 1, 1, 1). */
  public static get white(): Color {
    return new Color(1, 1, 1, 1);
  }

  /** Solid black. RGBA is (0, 0, 0, 1). */
  public static get black(): Color {
    return new Color(0, 0, 0, 1);
  }

  /** Yellow. RGBA is (1, 0.92, 0.016, 1), but the color is nice to look at! */
  public static get yellow(): Color {
    return new Color(1, 0.92, 0.016, 1);
  }

  /** Cyan. RGBA is (0, 1, 1, 1). */
  public static get cyan(): Color {
    return new Color(0, 1, 1, 1);
  }

  /** Magenta. RGBA is (1, 0, 1, 1). */
  public static get magenta(): Color {
    return new Color(1, 0, 1, 1);
  }

  /** Gray. RGBA is (0.5, 0.5, 0.5, 1). */
  public static get gray(): Color {
    return new Color(0.5, 0.5, 0.5, 1);
  }

  /** English spelling for gray. RGBA is (0.5, 0.5, 0.5, 1). */
  public static get grey(): Color {
    return new Color(0.5, 0.5, 0.5, 1);
  }

  /** Completely transparent. RGBA is (0, 0, 0, 0). */
  public static get clear(): Color {
    return new Color(0, 0, 0, 0);
  }

  // ==================== Instance Properties ====================

  /**
   * A version of the color that has had the gamma curve applied.
   */
  public get gamma(): Color {
    return new Color(
      Mathf.LinearToGammaSpace(this.r),
      Mathf.LinearToGammaSpace(this.g),
      Mathf.LinearToGammaSpace(this.b),
      this.a
    );
  }

  /**
   * A linear value of an sRGB color.
   */
  public get linear(): Color {
    return new Color(
      Mathf.GammaToLinearSpace(this.r),
      Mathf.GammaToLinearSpace(this.g),
      Mathf.GammaToLinearSpace(this.b),
      this.a
    );
  }

  /**
   * Returns the maximum color component value: Max(r,g,b).
   */
  public get maxColorComponent(): number {
    return Math.max(this.r, this.g, this.b);
  }

  /**
   * The grayscale value of the color (Read Only).
   */
  public get grayscale(): number {
    return 0.299 * this.r + 0.587 * this.g + 0.114 * this.b;
  }

  // ==================== Static Methods ====================

  /**
   * Linearly interpolates between colors a and b by t.
   * @param a - Start color
   * @param b - End color
   * @param t - Interpolation parameter (clamped to 0-1)
   * @returns Interpolated color
   */
  public static Lerp(a: Color, b: Color, t: number): Color {
    t = Mathf.Clamp01(t);
    return new Color(
      a.r + (b.r - a.r) * t,
      a.g + (b.g - a.g) * t,
      a.b + (b.b - a.b) * t,
      a.a + (b.a - a.a) * t
    );
  }

  /**
   * Linearly interpolates between colors a and b by t (unclamped).
   * @param a - Start color
   * @param b - End color
   * @param t - Interpolation parameter
   * @returns Interpolated color
   */
  public static LerpUnclamped(a: Color, b: Color, t: number): Color {
    return new Color(
      a.r + (b.r - a.r) * t,
      a.g + (b.g - a.g) * t,
      a.b + (b.b - a.b) * t,
      a.a + (b.a - a.a) * t
    );
  }

  /**
   * Creates an RGB color from HSV input.
   * @param H - Hue [0..1]
   * @param S - Saturation [0..1]
   * @param V - Value [0..1]
   * @param hdr - Output HDR colors. If true, the returned color is not clamped
   * @returns RGB color
   */
  public static HSVToRGB(H: number, S: number, V: number, hdr: boolean = false): Color {
    if (S === 0) {
      return new Color(V, V, V, 1);
    }

    if (V === 0) {
      return new Color(0, 0, 0, 1);
    }

    const c = new Color(0, 0, 0, 1);
    const h = H * 6;
    const i = Math.floor(h);
    const f = h - i;
    const p = V * (1 - S);
    const q = V * (1 - S * f);
    const t = V * (1 - S * (1 - f));

    switch (i % 6) {
      case 0:
        c.r = V;
        c.g = t;
        c.b = p;
        break;
      case 1:
        c.r = q;
        c.g = V;
        c.b = p;
        break;
      case 2:
        c.r = p;
        c.g = V;
        c.b = t;
        break;
      case 3:
        c.r = p;
        c.g = q;
        c.b = V;
        break;
      case 4:
        c.r = t;
        c.g = p;
        c.b = V;
        break;
      case 5:
        c.r = V;
        c.g = p;
        c.b = q;
        break;
    }

    if (!hdr) {
      c.r = Mathf.Clamp01(c.r);
      c.g = Mathf.Clamp01(c.g);
      c.b = Mathf.Clamp01(c.b);
    }

    return c;
  }

  /**
   * Calculates the hue, saturation and value of an RGB color.
   * @param rgbColor - RGB color
   * @returns Object with H, S, V values (all in range 0-1)
   */
  public static RGBToHSV(rgbColor: Color): { H: number; S: number; V: number } {
    if (rgbColor.b > rgbColor.g && rgbColor.b > rgbColor.r) {
      return Color.RGBToHSVHelper(4, rgbColor.b, rgbColor.r, rgbColor.g);
    } else if (rgbColor.g > rgbColor.r) {
      return Color.RGBToHSVHelper(2, rgbColor.g, rgbColor.b, rgbColor.r);
    } else {
      return Color.RGBToHSVHelper(0, rgbColor.r, rgbColor.g, rgbColor.b);
    }
  }

  private static RGBToHSVHelper(
    offset: number,
    dominantcolor: number,
    colorone: number,
    colortwo: number
  ): { H: number; S: number; V: number } {
    const V = dominantcolor;
    if (V !== 0) {
      const delta = V - Math.min(colorone, colortwo);
      const S = delta / V;
      const H = offset + (colorone - colortwo) / delta;
      return {
        H: H / 6,
        S: S,
        V: V,
      };
    } else {
      return { H: 0, S: 0, V: 0 };
    }
  }

  /**
   * Multiplies two colors together. Each component is multiplied separately.
   * @param a - First color
   * @param b - Second color
   * @returns Multiplied color
   */
  public static Multiply(a: Color, b: Color): Color {
    return new Color(a.r * b.r, a.g * b.g, a.b * b.b, a.a * b.a);
  }

  /**
   * Multiplies color by scalar.
   * @param color - Color to multiply
   * @param scalar - Scalar value
   * @returns Scaled color
   */
  public static Scale(color: Color, scalar: number): Color {
    return new Color(color.r * scalar, color.g * scalar, color.b * scalar, color.a * scalar);
  }

  /**
   * Adds two colors together. Each component is added separately.
   * @param a - First color
   * @param b - Second color
   * @returns Sum color
   */
  public static Add(a: Color, b: Color): Color {
    return new Color(a.r + b.r, a.g + b.g, a.b + b.b, a.a + b.a);
  }

  /**
   * Subtracts color b from color a. Each component is subtracted separately.
   * @param a - First color
   * @param b - Second color
   * @returns Difference color
   */
  public static Subtract(a: Color, b: Color): Color {
    return new Color(a.r - b.r, a.g - b.g, a.b - b.b, a.a - b.a);
  }

  // ==================== Instance Methods ====================

  /**
   * Returns true if two colors are approximately equal.
   * @param other - Other color
   * @param epsilon - Comparison tolerance
   * @returns True if approximately equal
   */
  public approximatelyEquals(other: Color, epsilon: number = 1e-5): boolean {
    return (
      Math.abs(this.r - other.r) < epsilon &&
      Math.abs(this.g - other.g) < epsilon &&
      Math.abs(this.b - other.b) < epsilon &&
      Math.abs(this.a - other.a) < epsilon
    );
  }

  /**
   * Returns true if the given color is exactly equal to this color.
   * @param other - Other color
   * @returns True if equal
   */
  public Equals(other: Color): boolean {
    return this.r === other.r && this.g === other.g && this.b === other.b && this.a === other.a;
  }

  /**
   * Returns a formatted string for this color.
   * @param format - Optional format string (not implemented)
   * @returns Formatted string
   */
  public toString(_format?: string): string {
    return `RGBA(${this.r.toFixed(3)}, ${this.g.toFixed(3)}, ${this.b.toFixed(3)}, ${this.a.toFixed(3)})`;
  }

  /**
   * Returns hex representation of the color.
   * @returns Hex string (e.g., "#FF0000FF")
   */
  public toHex(): string {
    const toHexByte = (value: number) => {
      const clamped = Math.round(Mathf.Clamp01(value) * 255);
      return clamped.toString(16).padStart(2, '0').toUpperCase();
    };

    return `#${toHexByte(this.r)}${toHexByte(this.g)}${toHexByte(this.b)}${toHexByte(this.a)}`;
  }

  /**
   * Compares two colors for equality.
   * @param other - The color to compare with
   * @returns True if the colors are equal
   */
  public equals(other: Color): boolean {
    return (
      this.r === other.r &&
      this.g === other.g &&
      this.b === other.b &&
      this.a === other.a
    );
  }

  /**
   * Creates a color from a hex string.
   * @param hex - Hex string (e.g., "#FF0000" or "#FF0000FF")
   * @returns Color instance
   */
  public static FromHex(hex: string): Color {
    // Remove # if present
    hex = hex.replace('#', '');

    // Parse RGB or RGBA
    if (hex.length === 6) {
      hex += 'FF'; // Add full alpha if not specified
    }

    if (hex.length !== 8) {
      console.warn('Invalid hex color format. Using white.');
      return Color.white;
    }

    const r = parseInt(hex.substring(0, 2), 16) / 255;
    const g = parseInt(hex.substring(2, 4), 16) / 255;
    const b = parseInt(hex.substring(4, 6), 16) / 255;
    const a = parseInt(hex.substring(6, 8), 16) / 255;

    return new Color(r, g, b, a);
  }
}
