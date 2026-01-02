import { describe, it, expect, beforeEach } from 'vitest';
import { ComponentRegistry } from '../ComponentRegistry';
import { Component } from '../../ecs/Component';
import { Transform } from '../../ecs/Transform';
import { MonoBehaviour } from '../../ecs/MonoBehaviour';

// Test custom component
class TestComponent extends MonoBehaviour {
  public value: number = 42;
}

class AnotherComponent extends Component {
  public name: string = 'test';
}

describe('ComponentRegistry', () => {
  beforeEach(() => {
    // Clear registry before each test
    ComponentRegistry._clear();
  });

  describe('Built-in registration', () => {
    it('should auto-register Transform', () => {
      expect(ComponentRegistry.has('Transform')).toBe(true);
      const TransformClass = ComponentRegistry.get('Transform');
      expect(TransformClass).toBe(Transform);
    });

    it('should auto-register MonoBehaviour', () => {
      expect(ComponentRegistry.has('MonoBehaviour')).toBe(true);
      const MonoBehaviourClass = ComponentRegistry.get('MonoBehaviour');
      expect(MonoBehaviourClass).toBe(MonoBehaviour);
    });

    it('should re-register built-ins after clear', () => {
      ComponentRegistry._clear();
      expect(ComponentRegistry.has('Transform')).toBe(true);
      expect(ComponentRegistry.has('MonoBehaviour')).toBe(true);
    });
  });

  describe('register', () => {
    it('should register custom component', () => {
      ComponentRegistry.register('TestComponent', TestComponent);
      expect(ComponentRegistry.has('TestComponent')).toBe(true);
    });

    it('should register multiple components', () => {
      ComponentRegistry.register('TestComponent', TestComponent);
      ComponentRegistry.register('AnotherComponent', AnotherComponent);

      expect(ComponentRegistry.has('TestComponent')).toBe(true);
      expect(ComponentRegistry.has('AnotherComponent')).toBe(true);
    });

    it('should allow overwriting existing registration', () => {
      ComponentRegistry.register('TestComponent', TestComponent);
      ComponentRegistry.register('TestComponent', AnotherComponent);

      const CompClass = ComponentRegistry.get('TestComponent');
      expect(CompClass).toBe(AnotherComponent);
    });

    it('should store constructor reference', () => {
      ComponentRegistry.register('TestComponent', TestComponent);
      const CompClass = ComponentRegistry.get('TestComponent');
      expect(CompClass).toBe(TestComponent);
    });
  });

  describe('get', () => {
    it('should retrieve registered component', () => {
      ComponentRegistry.register('TestComponent', TestComponent);
      const CompClass = ComponentRegistry.get('TestComponent');
      expect(CompClass).toBe(TestComponent);
    });

    it('should return null for unregistered component', () => {
      const CompClass = ComponentRegistry.get('NonExistent');
      expect(CompClass).toBeNull();
    });

    it('should retrieve built-in component', () => {
      const TransformClass = ComponentRegistry.get('Transform');
      expect(TransformClass).toBe(Transform);
    });

    it('should allow instantiation from retrieved constructor', () => {
      ComponentRegistry.register('TestComponent', TestComponent);
      const CompClass = ComponentRegistry.get('TestComponent');

      expect(CompClass).not.toBeNull();
      if (CompClass) {
        const instance = new CompClass();
        expect(instance).toBeInstanceOf(TestComponent);
        expect((instance as any).value).toBe(42);
      }
    });
  });

  describe('has', () => {
    it('should return true for registered component', () => {
      ComponentRegistry.register('TestComponent', TestComponent);
      expect(ComponentRegistry.has('TestComponent')).toBe(true);
    });

    it('should return false for unregistered component', () => {
      expect(ComponentRegistry.has('NonExistent')).toBe(false);
    });

    it('should return true for built-in component', () => {
      expect(ComponentRegistry.has('Transform')).toBe(true);
      expect(ComponentRegistry.has('MonoBehaviour')).toBe(true);
    });

    it('should return false after clear and re-register', () => {
      ComponentRegistry.register('TestComponent', TestComponent);
      expect(ComponentRegistry.has('TestComponent')).toBe(true);

      ComponentRegistry._clear();
      expect(ComponentRegistry.has('TestComponent')).toBe(false);

      // But built-ins should still be there
      expect(ComponentRegistry.has('Transform')).toBe(true);
    });
  });

  describe('_clear', () => {
    it('should clear all registered components', () => {
      ComponentRegistry.register('TestComponent', TestComponent);
      ComponentRegistry.register('AnotherComponent', AnotherComponent);

      expect(ComponentRegistry.has('TestComponent')).toBe(true);
      expect(ComponentRegistry.has('AnotherComponent')).toBe(true);

      ComponentRegistry._clear();

      expect(ComponentRegistry.has('TestComponent')).toBe(false);
      expect(ComponentRegistry.has('AnotherComponent')).toBe(false);
    });

    it('should preserve built-ins after clear', () => {
      ComponentRegistry.register('TestComponent', TestComponent);
      ComponentRegistry._clear();

      expect(ComponentRegistry.has('Transform')).toBe(true);
      expect(ComponentRegistry.has('MonoBehaviour')).toBe(true);
    });

    it('should allow re-registration after clear', () => {
      ComponentRegistry.register('TestComponent', TestComponent);
      ComponentRegistry._clear();
      ComponentRegistry.register('TestComponent', TestComponent);

      expect(ComponentRegistry.has('TestComponent')).toBe(true);
    });
  });

  describe('Integration', () => {
    it('should support component type registry pattern', () => {
      // Register multiple component types
      const components = [
        { name: 'TestComponent', constructor: TestComponent },
        { name: 'AnotherComponent', constructor: AnotherComponent },
      ];

      for (const { name, constructor } of components) {
        ComponentRegistry.register(name, constructor);
      }

      // Verify all registered
      for (const { name } of components) {
        expect(ComponentRegistry.has(name)).toBe(true);
      }

      // Simulate deserialization
      const typeName = 'TestComponent';
      const CompClass = ComponentRegistry.get(typeName);
      expect(CompClass).not.toBeNull();

      if (CompClass) {
        const instance = new CompClass();
        expect(instance).toBeInstanceOf(TestComponent);
      }
    });

    it('should handle case-sensitive names', () => {
      ComponentRegistry.register('TestComponent', TestComponent);
      ComponentRegistry.register('testcomponent', AnotherComponent);

      const CompClass1 = ComponentRegistry.get('TestComponent');
      const CompClass2 = ComponentRegistry.get('testcomponent');

      expect(CompClass1).toBe(TestComponent);
      expect(CompClass2).toBe(AnotherComponent);
      expect(CompClass1).not.toBe(CompClass2);
    });
  });
});
