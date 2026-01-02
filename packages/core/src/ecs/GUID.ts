/**
 * Globally unique identifier (GUID) for persistent object identification.
 *
 * GUIDs are 128-bit universally unique identifiers that remain stable across
 * sessions, making them suitable for serialization and save systems.
 *
 * @example
 * ```typescript
 * const guid = GUID.Generate();
 * console.log(guid.toString()); // "550e8400-e29b-41d4-a716-446655440000"
 *
 * const parsed = GUID.Parse("550e8400-e29b-41d4-a716-446655440000");
 * console.log(guid.equals(parsed)); // true
 * ```
 */
export class GUID {
  private readonly _value: string;

  /**
   * Creates a GUID from a UUID string.
   * @param value - UUID string in format "xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx"
   */
  private constructor(value: string) {
    this._value = value;
  }

  // ==================== Properties ====================

  /**
   * The string value of this GUID.
   */
  public get value(): string {
    return this._value;
  }

  // ==================== Static Methods ====================

  /**
   * Generates a new random GUID using UUID v4.
   * @returns A new GUID instance
   */
  public static Generate(): GUID {
    return new GUID(crypto.randomUUID());
  }

  /**
   * Parses a GUID from a string.
   * @param value - UUID string to parse
   * @returns A GUID instance
   * @throws Error if the string is not a valid UUID format
   */
  public static Parse(value: string): GUID {
    if (!GUID.isValidUUID(value)) {
      throw new Error(`Invalid GUID format: ${value}`);
    }
    return new GUID(value);
  }

  /**
   * Attempts to parse a GUID from a string.
   * @param value - UUID string to parse
   * @returns A GUID instance if valid, null otherwise
   */
  public static TryParse(value: string): GUID | null {
    if (!GUID.isValidUUID(value)) {
      return null;
    }
    return new GUID(value);
  }

  /**
   * Validates if a string is a valid UUID format.
   * @param value - String to validate
   * @returns True if valid UUID format
   */
  private static isValidUUID(value: string): boolean {
    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    return uuidRegex.test(value);
  }

  // ==================== Static Constants ====================

  /**
   * Returns an empty GUID (all zeros).
   */
  public static get empty(): GUID {
    return new GUID('00000000-0000-0000-0000-000000000000');
  }

  // ==================== Instance Methods ====================

  /**
   * Returns the string representation of this GUID.
   * @returns UUID string
   */
  public toString(): string {
    return this._value;
  }

  /**
   * Compares this GUID with another for equality.
   * @param other - GUID to compare with
   * @returns True if both GUIDs have the same value
   */
  public equals(other: GUID | null): boolean {
    if (other === null) {
      return false;
    }
    return this._value === other._value;
  }

  /**
   * Creates a copy of this GUID.
   * @returns A new GUID instance with the same value
   */
  public clone(): GUID {
    return new GUID(this._value);
  }

  // ==================== Serialization ====================

  /**
   * Serializes this GUID to JSON.
   * @returns UUID string
   */
  public toJSON(): string {
    return this._value;
  }

  /**
   * Deserializes a GUID from JSON.
   * @param json - UUID string
   * @returns GUID instance
   */
  public static fromJSON(json: string): GUID {
    return GUID.Parse(json);
  }
}
