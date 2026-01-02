import { describe, it, expect } from 'vitest';
import { GUID } from '../GUID';

describe('GUID', () => {
  describe('Generate', () => {
    it('should generate a valid GUID', () => {
      const guid = GUID.Generate();
      expect(guid).toBeInstanceOf(GUID);
      expect(guid.value).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
      );
    });

    it('should generate unique GUIDs', () => {
      const guid1 = GUID.Generate();
      const guid2 = GUID.Generate();
      expect(guid1.value).not.toBe(guid2.value);
    });

    it('should generate 100 unique GUIDs', () => {
      const guids = new Set<string>();
      for (let i = 0; i < 100; i++) {
        guids.add(GUID.Generate().value);
      }
      expect(guids.size).toBe(100);
    });

    it('should use crypto.randomUUID format', () => {
      const guid = GUID.Generate();
      // UUID v4 has specific bit patterns
      expect(guid.value.length).toBe(36);
      expect(guid.value[14]).toBe('4'); // Version 4
    });
  });

  describe('Parse', () => {
    it('should parse a valid UUID string', () => {
      const uuidString = '550e8400-e29b-41d4-a716-446655440000';
      const guid = GUID.Parse(uuidString);
      expect(guid.value).toBe(uuidString);
    });

    it('should parse lowercase UUID', () => {
      const uuidString = 'abcdef00-1234-5678-9abc-def012345678';
      const guid = GUID.Parse(uuidString);
      expect(guid.value).toBe(uuidString);
    });

    it('should parse uppercase UUID', () => {
      const uuidString = 'ABCDEF00-1234-5678-9ABC-DEF012345678';
      const guid = GUID.Parse(uuidString);
      expect(guid.value).toBe(uuidString);
    });

    it('should parse mixed case UUID', () => {
      const uuidString = 'AbCdEf00-1234-5678-9AbC-dEf012345678';
      const guid = GUID.Parse(uuidString);
      expect(guid.value).toBe(uuidString);
    });

    it('should throw error for invalid UUID format', () => {
      expect(() => GUID.Parse('invalid-uuid')).toThrow('Invalid GUID format');
    });

    it('should throw error for UUID without hyphens', () => {
      expect(() =>
        GUID.Parse('550e8400e29b41d4a716446655440000')
      ).toThrow('Invalid GUID format');
    });

    it('should throw error for UUID with wrong segment lengths', () => {
      expect(() =>
        GUID.Parse('550e840-e29b-41d4-a716-446655440000')
      ).toThrow('Invalid GUID format');
    });

    it('should throw error for UUID with invalid characters', () => {
      expect(() =>
        GUID.Parse('550e8400-e29b-41d4-a716-44665544000g')
      ).toThrow('Invalid GUID format');
    });

    it('should throw error for empty string', () => {
      expect(() => GUID.Parse('')).toThrow('Invalid GUID format');
    });

    it('should throw error for null input', () => {
      expect(() => GUID.Parse(null as any)).toThrow();
    });
  });

  describe('TryParse', () => {
    it('should return GUID for valid UUID string', () => {
      const uuidString = '550e8400-e29b-41d4-a716-446655440000';
      const guid = GUID.TryParse(uuidString);
      expect(guid).not.toBeNull();
      expect(guid!.value).toBe(uuidString);
    });

    it('should return null for invalid UUID format', () => {
      const guid = GUID.TryParse('invalid-uuid');
      expect(guid).toBeNull();
    });

    it('should return null for UUID without hyphens', () => {
      const guid = GUID.TryParse('550e8400e29b41d4a716446655440000');
      expect(guid).toBeNull();
    });

    it('should return null for empty string', () => {
      const guid = GUID.TryParse('');
      expect(guid).toBeNull();
    });

    it('should return null for UUID with invalid characters', () => {
      const guid = GUID.TryParse('550e8400-e29b-41d4-a716-44665544000g');
      expect(guid).toBeNull();
    });

    it('should handle uppercase UUID', () => {
      const uuidString = 'ABCDEF00-1234-5678-9ABC-DEF012345678';
      const guid = GUID.TryParse(uuidString);
      expect(guid).not.toBeNull();
      expect(guid!.value).toBe(uuidString);
    });
  });

  describe('empty', () => {
    it('should return empty GUID', () => {
      const guid = GUID.empty;
      expect(guid.value).toBe('00000000-0000-0000-0000-000000000000');
    });

    it('should return same empty GUID instance', () => {
      const guid1 = GUID.empty;
      const guid2 = GUID.empty;
      expect(guid1.value).toBe(guid2.value);
    });

    it('should not equal a generated GUID', () => {
      const guid = GUID.Generate();
      const empty = GUID.empty;
      expect(guid.equals(empty)).toBe(false);
    });
  });

  describe('value', () => {
    it('should return the UUID string', () => {
      const uuidString = '550e8400-e29b-41d4-a716-446655440000';
      const guid = GUID.Parse(uuidString);
      expect(guid.value).toBe(uuidString);
    });

    it('should be readonly', () => {
      const guid = GUID.Generate();
      const originalValue = guid.value;
      // TypeScript prevents setting readonly properties at compile time
      // Runtime check: attempting to set should throw in strict mode
      expect(() => {
        // @ts-expect-error - value is readonly
        guid.value = '00000000-0000-0000-0000-000000000000';
      }).toThrow();
      expect(guid.value).toBe(originalValue);
    });
  });

  describe('toString', () => {
    it('should return UUID string', () => {
      const uuidString = '550e8400-e29b-41d4-a716-446655440000';
      const guid = GUID.Parse(uuidString);
      expect(guid.toString()).toBe(uuidString);
    });

    it('should match value property', () => {
      const guid = GUID.Generate();
      expect(guid.toString()).toBe(guid.value);
    });
  });

  describe('equals', () => {
    it('should return true for GUIDs with same value', () => {
      const uuidString = '550e8400-e29b-41d4-a716-446655440000';
      const guid1 = GUID.Parse(uuidString);
      const guid2 = GUID.Parse(uuidString);
      expect(guid1.equals(guid2)).toBe(true);
    });

    it('should return false for GUIDs with different values', () => {
      const guid1 = GUID.Generate();
      const guid2 = GUID.Generate();
      expect(guid1.equals(guid2)).toBe(false);
    });

    it('should return false for null', () => {
      const guid = GUID.Generate();
      expect(guid.equals(null)).toBe(false);
    });

    it('should return true for same instance', () => {
      const guid = GUID.Generate();
      expect(guid.equals(guid)).toBe(true);
    });

    it('should be case-sensitive', () => {
      const guid1 = GUID.Parse('abcdef00-1234-5678-9abc-def012345678');
      const guid2 = GUID.Parse('ABCDEF00-1234-5678-9ABC-DEF012345678');
      expect(guid1.equals(guid2)).toBe(false);
    });

    it('should work with empty GUIDs', () => {
      const empty1 = GUID.empty;
      const empty2 = GUID.Parse('00000000-0000-0000-0000-000000000000');
      expect(empty1.equals(empty2)).toBe(true);
    });
  });

  describe('clone', () => {
    it('should create a new GUID with same value', () => {
      const guid = GUID.Generate();
      const cloned = guid.clone();
      expect(cloned.value).toBe(guid.value);
    });

    it('should create a different instance', () => {
      const guid = GUID.Generate();
      const cloned = guid.clone();
      expect(cloned).not.toBe(guid);
    });

    it('should equal original GUID', () => {
      const guid = GUID.Generate();
      const cloned = guid.clone();
      expect(guid.equals(cloned)).toBe(true);
    });

    it('should work with empty GUID', () => {
      const empty = GUID.empty;
      const cloned = empty.clone();
      expect(cloned.value).toBe('00000000-0000-0000-0000-000000000000');
    });

    it('should work with parsed GUID', () => {
      const guid = GUID.Parse('550e8400-e29b-41d4-a716-446655440000');
      const cloned = guid.clone();
      expect(cloned.value).toBe('550e8400-e29b-41d4-a716-446655440000');
    });
  });

  describe('integration', () => {
    it('should work in serialization workflow', () => {
      const guid = GUID.Generate();
      const serialized = guid.toString();
      const deserialized = GUID.Parse(serialized);
      expect(deserialized.equals(guid)).toBe(true);
    });

    it('should work as map key', () => {
      const map = new Map<string, number>();
      const guid = GUID.Generate();
      map.set(guid.value, 42);
      expect(map.get(guid.value)).toBe(42);
    });

    it('should work in Set', () => {
      const set = new Set<string>();
      const guid1 = GUID.Generate();
      const guid2 = GUID.Generate();
      set.add(guid1.value);
      set.add(guid2.value);
      expect(set.size).toBe(2);
      expect(set.has(guid1.value)).toBe(true);
      expect(set.has(guid2.value)).toBe(true);
    });
  });
});
