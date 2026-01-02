import { describe, it, expect, beforeEach } from 'vitest';
import { GUIDResolver } from '../GUIDResolver';
import { GUID } from '../../ecs/GUID';
import { Object as UnityObject } from '../../ecs/Object';

describe('GUIDResolver', () => {
  let resolver: GUIDResolver;

  beforeEach(() => {
    resolver = new GUIDResolver();
  });

  describe('constructor', () => {
    it('should create empty resolver', () => {
      expect(resolver.objectCount).toBe(0);
      expect(resolver.pendingReferenceCount).toBe(0);
    });
  });

  describe('register', () => {
    it('should register object with GUID', () => {
      const obj = new UnityObject('TestObject');
      resolver.register(obj.guid, obj);

      expect(resolver.objectCount).toBe(1);
      expect(resolver.get(obj.guid)).toBe(obj);
    });

    it('should register multiple objects', () => {
      const obj1 = new UnityObject('Object1');
      const obj2 = new UnityObject('Object2');
      const obj3 = new UnityObject('Object3');

      resolver.register(obj1.guid, obj1);
      resolver.register(obj2.guid, obj2);
      resolver.register(obj3.guid, obj3);

      expect(resolver.objectCount).toBe(3);
      expect(resolver.get(obj1.guid)).toBe(obj1);
      expect(resolver.get(obj2.guid)).toBe(obj2);
      expect(resolver.get(obj3.guid)).toBe(obj3);
    });

    it('should throw on GUID collision', () => {
      const obj1 = new UnityObject('Object1');
      const obj2 = new UnityObject('Object2');

      // Manually set same GUID
      (obj2 as any)._guid = obj1.guid;

      resolver.register(obj1.guid, obj1);

      expect(() => {
        resolver.register(obj2.guid, obj2);
      }).toThrow(/GUID collision/);
    });
  });

  describe('get', () => {
    it('should retrieve registered object by GUID instance', () => {
      const obj = new UnityObject('TestObject');
      resolver.register(obj.guid, obj);

      const retrieved = resolver.get(obj.guid);
      expect(retrieved).toBe(obj);
    });

    it('should retrieve registered object by GUID string', () => {
      const obj = new UnityObject('TestObject');
      resolver.register(obj.guid, obj);

      const retrieved = resolver.get(obj.guid.value);
      expect(retrieved).toBe(obj);
    });

    it('should return null for unregistered GUID', () => {
      const unregisteredGuid = GUID.Generate();
      const retrieved = resolver.get(unregisteredGuid);
      expect(retrieved).toBeNull();
    });

    it('should return null for unregistered GUID string', () => {
      const retrieved = resolver.get('nonexistent-guid');
      expect(retrieved).toBeNull();
    });
  });

  describe('addReference', () => {
    it('should queue single reference', () => {
      const target = { ref: null };
      const guidRef = 'some-guid';

      resolver.addReference(target, 'ref', guidRef);

      expect(resolver.pendingReferenceCount).toBe(1);
    });

    it('should queue multiple references', () => {
      const target1 = { ref: null };
      const target2 = { ref: null };

      resolver.addReference(target1, 'ref', 'guid-1');
      resolver.addReference(target2, 'ref', 'guid-2');

      expect(resolver.pendingReferenceCount).toBe(2);
    });

    it('should queue null reference', () => {
      const target = { ref: null };

      resolver.addReference(target, 'ref', null);

      expect(resolver.pendingReferenceCount).toBe(1);
    });
  });

  describe('addArrayReference', () => {
    it('should queue array reference', () => {
      const target = { refs: [] };
      const guidRefs = ['guid-1', 'guid-2', 'guid-3'];

      resolver.addArrayReference(target, 'refs', guidRefs);

      expect(resolver.pendingReferenceCount).toBe(1);
    });

    it('should queue multiple array references', () => {
      const target1 = { refs: [] };
      const target2 = { refs: [] };

      resolver.addArrayReference(target1, 'refs', ['guid-1', 'guid-2']);
      resolver.addArrayReference(target2, 'refs', ['guid-3']);

      expect(resolver.pendingReferenceCount).toBe(2);
    });

    it('should queue empty array reference', () => {
      const target = { refs: [] };

      resolver.addArrayReference(target, 'refs', []);

      expect(resolver.pendingReferenceCount).toBe(1);
    });
  });

  describe('resolve', () => {
    it('should resolve single reference', () => {
      const obj = new UnityObject('TestObject');
      const target = { ref: null };

      resolver.register(obj.guid, obj);
      resolver.addReference(target, 'ref', obj.guid.value);
      resolver.resolve();

      expect(target.ref).toBe(obj);
    });

    it('should resolve multiple references', () => {
      const obj1 = new UnityObject('Object1');
      const obj2 = new UnityObject('Object2');
      const target1 = { ref: null };
      const target2 = { ref: null };

      resolver.register(obj1.guid, obj1);
      resolver.register(obj2.guid, obj2);
      resolver.addReference(target1, 'ref', obj1.guid.value);
      resolver.addReference(target2, 'ref', obj2.guid.value);
      resolver.resolve();

      expect(target1.ref).toBe(obj1);
      expect(target2.ref).toBe(obj2);
    });

    it('should resolve null reference', () => {
      const target = { ref: 'initial-value' };

      resolver.addReference(target, 'ref', null);
      resolver.resolve();

      expect(target.ref).toBeNull();
    });

    it('should resolve array references', () => {
      const obj1 = new UnityObject('Object1');
      const obj2 = new UnityObject('Object2');
      const obj3 = new UnityObject('Object3');
      const target = { refs: [] };

      resolver.register(obj1.guid, obj1);
      resolver.register(obj2.guid, obj2);
      resolver.register(obj3.guid, obj3);
      resolver.addArrayReference(target, 'refs', [
        obj1.guid.value,
        obj2.guid.value,
        obj3.guid.value,
      ]);
      resolver.resolve();

      expect(target.refs).toEqual([obj1, obj2, obj3]);
    });

    it('should resolve empty array reference', () => {
      const target = { refs: null };

      resolver.addArrayReference(target, 'refs', []);
      resolver.resolve();

      expect(target.refs).toEqual([]);
    });

    it('should throw error for missing GUID in single reference', () => {
      const target = { ref: null };

      resolver.addReference(target, 'ref', 'nonexistent-guid');

      expect(() => {
        resolver.resolve();
      }).toThrow(/Cannot resolve reference.*nonexistent-guid/);
    });

    it('should throw error for missing GUID in array reference', () => {
      const obj1 = new UnityObject('Object1');
      const target = { refs: [] };

      resolver.register(obj1.guid, obj1);
      resolver.addArrayReference(target, 'refs', [
        obj1.guid.value,
        'nonexistent-guid',
      ]);

      expect(() => {
        resolver.resolve();
      }).toThrow(/Cannot resolve array reference.*nonexistent-guid/);
    });

    it('should clear pending queues after resolution', () => {
      const obj = new UnityObject('TestObject');
      const target = { ref: null };

      resolver.register(obj.guid, obj);
      resolver.addReference(target, 'ref', obj.guid.value);

      expect(resolver.pendingReferenceCount).toBe(1);

      resolver.resolve();

      expect(resolver.pendingReferenceCount).toBe(0);
    });

    it('should handle mixed single and array references', () => {
      const obj1 = new UnityObject('Object1');
      const obj2 = new UnityObject('Object2');
      const obj3 = new UnityObject('Object3');
      const target = { single: null, array: [] };

      resolver.register(obj1.guid, obj1);
      resolver.register(obj2.guid, obj2);
      resolver.register(obj3.guid, obj3);

      resolver.addReference(target, 'single', obj1.guid.value);
      resolver.addArrayReference(target, 'array', [
        obj2.guid.value,
        obj3.guid.value,
      ]);

      resolver.resolve();

      expect(target.single).toBe(obj1);
      expect(target.array).toEqual([obj2, obj3]);
    });
  });

  describe('clear', () => {
    it('should clear registered objects', () => {
      const obj = new UnityObject('TestObject');
      resolver.register(obj.guid, obj);

      expect(resolver.objectCount).toBe(1);

      resolver.clear();

      expect(resolver.objectCount).toBe(0);
    });

    it('should clear pending references', () => {
      const target = { ref: null };
      resolver.addReference(target, 'ref', 'some-guid');

      expect(resolver.pendingReferenceCount).toBe(1);

      resolver.clear();

      expect(resolver.pendingReferenceCount).toBe(0);
    });

    it('should clear pending array references', () => {
      const target = { refs: [] };
      resolver.addArrayReference(target, 'refs', ['guid-1', 'guid-2']);

      expect(resolver.pendingReferenceCount).toBe(1);

      resolver.clear();

      expect(resolver.pendingReferenceCount).toBe(0);
    });

    it('should allow reuse after clear', () => {
      const obj1 = new UnityObject('Object1');
      resolver.register(obj1.guid, obj1);
      resolver.clear();

      const obj2 = new UnityObject('Object2');
      resolver.register(obj2.guid, obj2);

      expect(resolver.objectCount).toBe(1);
      expect(resolver.get(obj2.guid)).toBe(obj2);
      expect(resolver.get(obj1.guid)).toBeNull();
    });
  });

  describe('Integration - Circular References', () => {
    it('should handle parent-child circular reference', () => {
      // Simulate parent-child relationship
      const parent = { name: 'Parent', child: null, guid: GUID.Generate() };
      const child = { name: 'Child', parent: null, guid: GUID.Generate() };

      // Phase 1: Register and queue
      resolver.register(parent.guid, parent as any);
      resolver.register(child.guid, child as any);
      resolver.addReference(parent, 'child', child.guid.value);
      resolver.addReference(child, 'parent', parent.guid.value);

      // Phase 2: Resolve
      resolver.resolve();

      // Verify circular reference
      expect(parent.child).toBe(child);
      expect(child.parent).toBe(parent);
    });

    it('should handle deep hierarchy', () => {
      // Create 5-level hierarchy
      const root = { guid: GUID.Generate(), children: [] };
      const level1 = { guid: GUID.Generate(), parent: null, children: [] };
      const level2 = { guid: GUID.Generate(), parent: null, children: [] };
      const level3 = { guid: GUID.Generate(), parent: null, children: [] };
      const leaf = { guid: GUID.Generate(), parent: null };

      // Register all
      resolver.register(root.guid, root as any);
      resolver.register(level1.guid, level1 as any);
      resolver.register(level2.guid, level2 as any);
      resolver.register(level3.guid, level3 as any);
      resolver.register(leaf.guid, leaf as any);

      // Queue references
      resolver.addArrayReference(root, 'children', [level1.guid.value]);
      resolver.addReference(level1, 'parent', root.guid.value);
      resolver.addArrayReference(level1, 'children', [level2.guid.value]);
      resolver.addReference(level2, 'parent', level1.guid.value);
      resolver.addArrayReference(level2, 'children', [level3.guid.value]);
      resolver.addReference(level3, 'parent', level2.guid.value);
      resolver.addArrayReference(level3, 'children', [leaf.guid.value]);
      resolver.addReference(leaf, 'parent', level3.guid.value);

      // Resolve
      resolver.resolve();

      // Verify hierarchy
      expect(root.children).toEqual([level1]);
      expect(level1.parent).toBe(root);
      expect(level1.children).toEqual([level2]);
      expect(level2.parent).toBe(level1);
      expect(level2.children).toEqual([level3]);
      expect(level3.parent).toBe(level2);
      expect(level3.children).toEqual([leaf]);
      expect(leaf.parent).toBe(level3);
    });

    it('should handle multiple children references', () => {
      const parent = { guid: GUID.Generate(), children: [] };
      const child1 = { guid: GUID.Generate(), parent: null };
      const child2 = { guid: GUID.Generate(), parent: null };
      const child3 = { guid: GUID.Generate(), parent: null };

      resolver.register(parent.guid, parent as any);
      resolver.register(child1.guid, child1 as any);
      resolver.register(child2.guid, child2 as any);
      resolver.register(child3.guid, child3 as any);

      resolver.addArrayReference(parent, 'children', [
        child1.guid.value,
        child2.guid.value,
        child3.guid.value,
      ]);
      resolver.addReference(child1, 'parent', parent.guid.value);
      resolver.addReference(child2, 'parent', parent.guid.value);
      resolver.addReference(child3, 'parent', parent.guid.value);

      resolver.resolve();

      expect(parent.children).toEqual([child1, child2, child3]);
      expect(child1.parent).toBe(parent);
      expect(child2.parent).toBe(parent);
      expect(child3.parent).toBe(parent);
    });
  });
});
