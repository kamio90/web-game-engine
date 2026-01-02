import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { Object as UnityObject } from '../Object';

// Test subclass
class TestObject extends UnityObject {
  constructor(name: string = 'TestObject') {
    super(name);
  }
}

class AnotherTestObject extends UnityObject {
  constructor(name: string = 'AnotherTestObject') {
    super(name);
  }
}

describe('Object', () => {
  afterEach(() => {
    // Clean up all objects after each test
    (UnityObject as any)._clearAllObjects();
  });

  describe('constructor', () => {
    it('should create object with default name', () => {
      const obj = new UnityObject();
      expect(obj.name).toBe('Object');
    });

    it('should create object with custom name', () => {
      const obj = new UnityObject('MyObject');
      expect(obj.name).toBe('MyObject');
    });

    it('should assign unique instance IDs', () => {
      const obj1 = new UnityObject();
      const obj2 = new UnityObject();
      expect(obj1.GetInstanceID()).not.toBe(obj2.GetInstanceID());
    });

    it('should assign sequential instance IDs', () => {
      (UnityObject as any)._clearAllObjects();
      const obj1 = new UnityObject();
      const obj2 = new UnityObject();
      const obj3 = new UnityObject();
      expect(obj1.GetInstanceID()).toBe(1);
      expect(obj2.GetInstanceID()).toBe(2);
      expect(obj3.GetInstanceID()).toBe(3);
    });

    it('should register object in instances map', () => {
      const obj = new UnityObject();
      const count = (UnityObject as any)._getObjectCount();
      expect(count).toBeGreaterThan(0);
    });
  });

  describe('name property', () => {
    it('should get name', () => {
      const obj = new UnityObject('TestName');
      expect(obj.name).toBe('TestName');
    });

    it('should set name', () => {
      const obj = new UnityObject();
      obj.name = 'NewName';
      expect(obj.name).toBe('NewName');
    });

    it('should allow empty name', () => {
      const obj = new UnityObject('');
      expect(obj.name).toBe('');
    });

    it('should handle special characters in name', () => {
      const obj = new UnityObject('Object-123_Test!');
      expect(obj.name).toBe('Object-123_Test!');
    });
  });

  describe('GetInstanceID', () => {
    it('should return instance ID', () => {
      const obj = new UnityObject();
      const id = obj.GetInstanceID();
      expect(typeof id).toBe('number');
      expect(id).toBeGreaterThan(0);
    });

    it('should return consistent ID', () => {
      const obj = new UnityObject();
      const id1 = obj.GetInstanceID();
      const id2 = obj.GetInstanceID();
      expect(id1).toBe(id2);
    });

    it('should return different IDs for different objects', () => {
      const obj1 = new UnityObject();
      const obj2 = new UnityObject();
      expect(obj1.GetInstanceID()).not.toBe(obj2.GetInstanceID());
    });
  });

  describe('toString', () => {
    it('should return formatted string', () => {
      const obj = new UnityObject('MyObject');
      const str = obj.toString();
      expect(str).toContain('MyObject');
      expect(str).toContain(obj.GetInstanceID().toString());
    });

    it('should include instance ID', () => {
      const obj = new UnityObject('Test');
      const str = obj.toString();
      expect(str).toMatch(/Test \(\d+\)/);
    });

    it('should handle objects with empty names', () => {
      const obj = new UnityObject('');
      const str = obj.toString();
      expect(str).toContain(obj.GetInstanceID().toString());
    });
  });

  describe('equals', () => {
    it('should return true for same instance', () => {
      const obj = new UnityObject();
      expect(obj.equals(obj)).toBe(true);
    });

    it('should return false for different instances', () => {
      const obj1 = new UnityObject();
      const obj2 = new UnityObject();
      expect(obj1.equals(obj2)).toBe(false);
    });

    it('should return false for null', () => {
      const obj = new UnityObject();
      expect(obj.equals(null)).toBe(false);
    });

    it('should return true for destroyed object compared to null', () => {
      const obj = new UnityObject();
      UnityObject.Destroy(obj);
      expect(obj.equals(null)).toBe(true);
    });

    it('should work with subclasses', () => {
      const obj1 = new TestObject();
      const obj2 = new TestObject();
      expect(obj1.equals(obj2)).toBe(false);
      expect(obj1.equals(obj1)).toBe(true);
    });
  });

  describe('Destroy', () => {
    it('should mark object as destroyed', () => {
      const obj = new UnityObject();
      UnityObject.Destroy(obj);
      expect((obj as any).isDestroyed).toBe(true);
    });

    it('should handle null object', () => {
      expect(() => UnityObject.Destroy(null)).not.toThrow();
    });

    it('should not throw when destroying already destroyed object', () => {
      const obj = new UnityObject();
      UnityObject.Destroy(obj);
      expect(() => UnityObject.Destroy(obj)).not.toThrow();
    });

    it('should work with delayed destruction', (done) => {
      const obj = new UnityObject();
      UnityObject.Destroy(obj, 0.05); // 50ms
      expect((obj as any).isDestroyed).toBe(false);

      setTimeout(() => {
        expect((obj as any).isDestroyed).toBe(true);
        done();
      }, 60);
    }, 100);

    it('should remove from instances after delay', (done) => {
      const obj = new UnityObject();
      const id = obj.GetInstanceID();
      UnityObject.Destroy(obj, 0.05); // 50ms

      setTimeout(() => {
        const instances = (UnityObject as any)._instances;
        expect(instances.has(id)).toBe(false);
        done();
      }, 60);
    }, 100);
  });

  describe('DestroyImmediate', () => {
    it('should destroy object immediately', () => {
      const obj = new UnityObject();
      UnityObject.DestroyImmediate(obj);
      expect((obj as any).isDestroyed).toBe(true);
    });

    it('should remove from instances map', () => {
      const obj = new UnityObject();
      const id = obj.GetInstanceID();
      UnityObject.DestroyImmediate(obj);
      const instances = (UnityObject as any)._instances;
      expect(instances.has(id)).toBe(false);
    });

    it('should handle null object', () => {
      expect(() => UnityObject.DestroyImmediate(null)).not.toThrow();
    });

    it('should not throw when destroying already destroyed object', () => {
      const obj = new UnityObject();
      UnityObject.DestroyImmediate(obj);
      expect(() => UnityObject.DestroyImmediate(obj)).not.toThrow();
    });

    it('should reduce object count', () => {
      const obj = new UnityObject();
      const countBefore = (UnityObject as any)._getObjectCount();
      UnityObject.DestroyImmediate(obj);
      const countAfter = (UnityObject as any)._getObjectCount();
      expect(countAfter).toBe(countBefore - 1);
    });
  });

  describe('FindObjectOfType', () => {
    it('should find object of specific type', () => {
      const obj = new TestObject('Test1');
      const found = UnityObject.FindObjectOfType(TestObject);
      expect(found).toBe(obj);
    });

    it('should return null if no object of type exists', () => {
      const found = UnityObject.FindObjectOfType(TestObject);
      expect(found).toBeNull();
    });

    it('should not find destroyed objects', () => {
      const obj = new TestObject();
      UnityObject.Destroy(obj);
      const found = UnityObject.FindObjectOfType(TestObject);
      expect(found).toBeNull();
    });

    it('should find first object when multiple exist', () => {
      const obj1 = new TestObject('First');
      const obj2 = new TestObject('Second');
      const found = UnityObject.FindObjectOfType(TestObject);
      expect(found).toBe(obj1);
    });

    it('should distinguish between types', () => {
      const testObj = new TestObject();
      const anotherObj = new AnotherTestObject();
      const found = UnityObject.FindObjectOfType(AnotherTestObject);
      expect(found).toBe(anotherObj);
    });

    it('should work with base Object type', () => {
      const obj = new UnityObject();
      const found = UnityObject.FindObjectOfType(UnityObject);
      expect(found).toBe(obj);
    });
  });

  describe('FindObjectsOfType', () => {
    it('should find all objects of specific type', () => {
      const obj1 = new TestObject('Test1');
      const obj2 = new TestObject('Test2');
      const found = UnityObject.FindObjectsOfType(TestObject);
      expect(found).toHaveLength(2);
      expect(found).toContain(obj1);
      expect(found).toContain(obj2);
    });

    it('should return empty array if no objects exist', () => {
      const found = UnityObject.FindObjectsOfType(TestObject);
      expect(found).toHaveLength(0);
    });

    it('should not include destroyed objects', () => {
      const obj1 = new TestObject('Test1');
      const obj2 = new TestObject('Test2');
      UnityObject.Destroy(obj1);
      const found = UnityObject.FindObjectsOfType(TestObject);
      expect(found).toHaveLength(1);
      expect(found).toContain(obj2);
    });

    it('should distinguish between types', () => {
      const testObj1 = new TestObject();
      const testObj2 = new TestObject();
      const anotherObj = new AnotherTestObject();
      const found = UnityObject.FindObjectsOfType(TestObject);
      expect(found).toHaveLength(2);
      expect(found).not.toContain(anotherObj);
    });

    it('should find all objects with base type', () => {
      const obj1 = new UnityObject();
      const obj2 = new TestObject();
      const obj3 = new AnotherTestObject();
      const found = UnityObject.FindObjectsOfType(UnityObject);
      expect(found.length).toBeGreaterThanOrEqual(3);
    });
  });

  describe('_cleanupDestroyedObjects', () => {
    it('should remove destroyed objects from instances', () => {
      const obj1 = new UnityObject();
      const obj2 = new UnityObject();
      const obj3 = new UnityObject();

      UnityObject.Destroy(obj1);
      UnityObject.Destroy(obj2);

      (UnityObject as any)._cleanupDestroyedObjects();

      const count = (UnityObject as any)._getObjectCount();
      expect(count).toBe(1);
    });

    it('should not affect non-destroyed objects', () => {
      const obj = new UnityObject();
      const id = obj.GetInstanceID();

      (UnityObject as any)._cleanupDestroyedObjects();

      const instances = (UnityObject as any)._instances;
      expect(instances.has(id)).toBe(true);
    });

    it('should handle empty instances', () => {
      (UnityObject as any)._clearAllObjects();
      expect(() => (UnityObject as any)._cleanupDestroyedObjects()).not.toThrow();
    });
  });

  describe('integration', () => {
    it('should support object lifecycle', () => {
      const obj = new TestObject('Lifecycle');
      expect(obj.GetInstanceID()).toBeGreaterThan(0);
      expect(obj.name).toBe('Lifecycle');

      obj.name = 'Modified';
      expect(obj.name).toBe('Modified');

      UnityObject.DestroyImmediate(obj);
      expect((obj as any).isDestroyed).toBe(true);
    });

    it('should handle multiple object types simultaneously', () => {
      const test1 = new TestObject('T1');
      const test2 = new TestObject('T2');
      const another1 = new AnotherTestObject('A1');
      const base = new UnityObject('Base');

      expect(UnityObject.FindObjectsOfType(TestObject)).toHaveLength(2);
      expect(UnityObject.FindObjectsOfType(AnotherTestObject)).toHaveLength(1);
      expect(UnityObject.FindObjectsOfType(UnityObject).length).toBeGreaterThanOrEqual(4);
    });

    it('should properly cleanup after destruction workflow', () => {
      const objects = [
        new TestObject('1'),
        new TestObject('2'),
        new AnotherTestObject('3'),
      ];

      UnityObject.Destroy(objects[0]);
      UnityObject.DestroyImmediate(objects[1]);

      (UnityObject as any)._cleanupDestroyedObjects();

      const remaining = UnityObject.FindObjectsOfType(UnityObject);
      expect(remaining).toHaveLength(1);
      expect(remaining[0]).toBe(objects[2]);
    });
  });
});
