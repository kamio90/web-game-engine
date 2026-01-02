import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Component, IGameObject, ITransform } from '../Component';
import { Object as UnityObject } from '../Object';

// Mock Transform for testing
class MockTransform extends Component implements ITransform {
  constructor() {
    super('MockTransform');
  }
}

// Mock GameObject for testing
class MockGameObject extends UnityObject implements IGameObject {
  private _components: Map<Function, Component[]> = new Map();
  private _transform: MockTransform;
  public tag: string = 'Untagged';

  constructor(name: string = 'GameObject') {
    super(name);
    this._transform = new MockTransform();
    this._transform._setGameObject(this);
  }

  get transform(): ITransform {
    return this._transform;
  }

  AddComponent<T extends Component>(type: new (...args: any[]) => T): T {
    const component = new type();
    component._setGameObject(this);

    if (!this._components.has(type)) {
      this._components.set(type, []);
    }
    this._components.get(type)!.push(component);
    return component;
  }

  GetComponent<T extends Component>(
    type: new (...args: any[]) => T
  ): T | null {
    const components = this._components.get(type);
    return (components?.[0] as T) ?? null;
  }

  GetComponents<T extends Component>(type: new (...args: any[]) => T): T[] {
    return (this._components.get(type) as T[]) ?? [];
  }

  GetComponentInChildren<T extends Component>(
    type: new (...args: any[]) => T,
    includeInactive?: boolean
  ): T | null {
    return this.GetComponent(type);
  }

  GetComponentsInChildren<T extends Component>(
    type: new (...args: any[]) => T,
    includeInactive?: boolean
  ): T[] {
    return this.GetComponents(type);
  }

  GetComponentInParent<T extends Component>(
    type: new (...args: any[]) => T
  ): T | null {
    return this.GetComponent(type);
  }

  GetComponentsInParent<T extends Component>(
    type: new (...args: any[]) => T
  ): T[] {
    return this.GetComponents(type);
  }
}

// Test components
class TestComponent extends Component {
  public testValue: number = 42;

  constructor() {
    super('TestComponent');
  }
}

class AnotherTestComponent extends Component {
  constructor() {
    super('AnotherTestComponent');
  }
}

describe('Component', () => {
  afterEach(() => {
    (UnityObject as any)._clearAllObjects();
  });

  describe('constructor', () => {
    it('should create component with default name', () => {
      const comp = new Component();
      expect(comp.name).toBe('Component');
    });

    it('should create component with custom name', () => {
      const comp = new Component('CustomComponent');
      expect(comp.name).toBe('CustomComponent');
    });

    it('should extend UnityObject', () => {
      const comp = new Component();
      expect(comp).toBeInstanceOf(UnityObject);
    });

    it('should have unique instance ID', () => {
      const comp1 = new Component();
      const comp2 = new Component();
      expect(comp1.GetInstanceID()).not.toBe(comp2.GetInstanceID());
    });
  });

  describe('gameObject property', () => {
    it('should return attached GameObject', () => {
      const go = new MockGameObject('TestGO');
      const comp = go.AddComponent(TestComponent);
      expect(comp.gameObject).toBe(go);
    });

    it('should maintain reference after creation', () => {
      const go = new MockGameObject();
      const comp = go.AddComponent(TestComponent);
      const ref1 = comp.gameObject;
      const ref2 = comp.gameObject;
      expect(ref1).toBe(ref2);
    });
  });

  describe('transform property', () => {
    it('should return GameObject transform', () => {
      const go = new MockGameObject();
      const comp = go.AddComponent(TestComponent);
      expect(comp.transform).toBe(go.transform);
    });

    it('should cache transform reference', () => {
      const go = new MockGameObject();
      const comp = go.AddComponent(TestComponent);
      const transform1 = comp.transform;
      const transform2 = comp.transform;
      expect(transform1).toBe(transform2);
    });

    it('should be a Component', () => {
      const go = new MockGameObject();
      const comp = go.AddComponent(TestComponent);
      expect(comp.transform).toBeInstanceOf(Component);
    });
  });

  describe('tag property', () => {
    it('should get tag from GameObject', () => {
      const go = new MockGameObject();
      go.tag = 'Player';
      const comp = go.AddComponent(TestComponent);
      expect(comp.tag).toBe('Player');
    });

    it('should set tag on GameObject', () => {
      const go = new MockGameObject();
      const comp = go.AddComponent(TestComponent);
      comp.tag = 'Enemy';
      expect(go.tag).toBe('Enemy');
    });

    it('should default to Untagged', () => {
      const go = new MockGameObject();
      const comp = go.AddComponent(TestComponent);
      expect(comp.tag).toBe('Untagged');
    });

    it('should update when changed', () => {
      const go = new MockGameObject();
      const comp = go.AddComponent(TestComponent);
      comp.tag = 'First';
      expect(comp.tag).toBe('First');
      comp.tag = 'Second';
      expect(comp.tag).toBe('Second');
    });
  });

  describe('GetComponent', () => {
    it('should get component from same GameObject', () => {
      const go = new MockGameObject();
      const test = go.AddComponent(TestComponent);
      const another = go.AddComponent(AnotherTestComponent);

      expect(test.GetComponent(AnotherTestComponent)).toBe(another);
    });

    it('should return null if component not found', () => {
      const go = new MockGameObject();
      const comp = go.AddComponent(TestComponent);
      expect(comp.GetComponent(AnotherTestComponent)).toBeNull();
    });

    it('should get component of specific type', () => {
      const go = new MockGameObject();
      const test = go.AddComponent(TestComponent);
      const found = test.GetComponent(TestComponent);
      expect(found).toBe(test);
      expect(found?.testValue).toBe(42);
    });

    it('should return first component if multiple exist', () => {
      const go = new MockGameObject();
      const comp1 = go.AddComponent(TestComponent);
      const comp2 = go.AddComponent(TestComponent);
      const found = comp1.GetComponent(TestComponent);
      expect(found).toBe(comp1);
    });
  });

  describe('GetComponents', () => {
    it('should get all components of type', () => {
      const go = new MockGameObject();
      const comp1 = go.AddComponent(TestComponent);
      const comp2 = go.AddComponent(TestComponent);
      const components = comp1.GetComponents(TestComponent);
      expect(components).toHaveLength(2);
      expect(components).toContain(comp1);
      expect(components).toContain(comp2);
    });

    it('should return empty array if none found', () => {
      const go = new MockGameObject();
      const comp = go.AddComponent(TestComponent);
      const components = comp.GetComponents(AnotherTestComponent);
      expect(components).toHaveLength(0);
    });

    it('should only return components of specified type', () => {
      const go = new MockGameObject();
      go.AddComponent(TestComponent);
      go.AddComponent(AnotherTestComponent);
      const comp = go.AddComponent(TestComponent);
      const components = comp.GetComponents(TestComponent);
      expect(components).toHaveLength(2);
      components.forEach((c) => expect(c).toBeInstanceOf(TestComponent));
    });
  });

  describe('GetComponentInChildren', () => {
    it('should get component from same GameObject', () => {
      const go = new MockGameObject();
      const comp = go.AddComponent(TestComponent);
      const another = go.AddComponent(AnotherTestComponent);
      expect(comp.GetComponentInChildren(AnotherTestComponent)).toBe(another);
    });

    it('should return null if not found', () => {
      const go = new MockGameObject();
      const comp = go.AddComponent(TestComponent);
      expect(comp.GetComponentInChildren(AnotherTestComponent)).toBeNull();
    });

    it('should accept includeInactive parameter', () => {
      const go = new MockGameObject();
      const comp = go.AddComponent(TestComponent);
      const found = comp.GetComponentInChildren(TestComponent, true);
      expect(found).toBe(comp);
    });
  });

  describe('GetComponentsInChildren', () => {
    it('should get all components of type', () => {
      const go = new MockGameObject();
      const comp1 = go.AddComponent(TestComponent);
      const comp2 = go.AddComponent(TestComponent);
      const components = comp1.GetComponentsInChildren(TestComponent);
      expect(components).toHaveLength(2);
    });

    it('should return empty array if none found', () => {
      const go = new MockGameObject();
      const comp = go.AddComponent(TestComponent);
      const components = comp.GetComponentsInChildren(AnotherTestComponent);
      expect(components).toHaveLength(0);
    });

    it('should accept includeInactive parameter', () => {
      const go = new MockGameObject();
      const comp = go.AddComponent(TestComponent);
      const components = comp.GetComponentsInChildren(TestComponent, false);
      expect(components).toHaveLength(1);
    });
  });

  describe('GetComponentInParent', () => {
    it('should get component from same GameObject', () => {
      const go = new MockGameObject();
      const comp = go.AddComponent(TestComponent);
      const another = go.AddComponent(AnotherTestComponent);
      expect(comp.GetComponentInParent(AnotherTestComponent)).toBe(another);
    });

    it('should return null if not found', () => {
      const go = new MockGameObject();
      const comp = go.AddComponent(TestComponent);
      expect(comp.GetComponentInParent(AnotherTestComponent)).toBeNull();
    });
  });

  describe('GetComponentsInParent', () => {
    it('should get all components of type', () => {
      const go = new MockGameObject();
      const comp1 = go.AddComponent(TestComponent);
      const comp2 = go.AddComponent(TestComponent);
      const components = comp1.GetComponentsInParent(TestComponent);
      expect(components).toHaveLength(2);
    });

    it('should return empty array if none found', () => {
      const go = new MockGameObject();
      const comp = go.AddComponent(TestComponent);
      const components = comp.GetComponentsInParent(AnotherTestComponent);
      expect(components).toHaveLength(0);
    });
  });

  describe('CompareTag', () => {
    it('should return true for matching tag', () => {
      const go = new MockGameObject();
      go.tag = 'Player';
      const comp = go.AddComponent(TestComponent);
      expect(comp.CompareTag('Player')).toBe(true);
    });

    it('should return false for non-matching tag', () => {
      const go = new MockGameObject();
      go.tag = 'Player';
      const comp = go.AddComponent(TestComponent);
      expect(comp.CompareTag('Enemy')).toBe(false);
    });

    it('should be case-sensitive', () => {
      const go = new MockGameObject();
      go.tag = 'Player';
      const comp = go.AddComponent(TestComponent);
      expect(comp.CompareTag('player')).toBe(false);
    });

    it('should work with Untagged', () => {
      const go = new MockGameObject();
      const comp = go.AddComponent(TestComponent);
      expect(comp.CompareTag('Untagged')).toBe(true);
    });
  });

  describe('_setGameObject', () => {
    it('should set gameObject reference', () => {
      const go = new MockGameObject('TestGO');
      const comp = new TestComponent();
      comp._setGameObject(go);
      expect(comp.gameObject).toBe(go);
    });

    it('should set transform reference', () => {
      const go = new MockGameObject();
      const comp = new TestComponent();
      comp._setGameObject(go);
      expect(comp.transform).toBe(go.transform);
    });

    it('should cache transform on set', () => {
      const go = new MockGameObject();
      const comp = new TestComponent();
      comp._setGameObject(go);
      const transform = comp.transform;
      expect(transform).toBe(go.transform);
    });
  });

  describe('integration', () => {
    it('should support full component workflow', () => {
      const go = new MockGameObject('Player');
      go.tag = 'Player';

      const comp1 = go.AddComponent(TestComponent);
      const comp2 = go.AddComponent(AnotherTestComponent);

      expect(comp1.gameObject.name).toBe('Player');
      expect(comp1.tag).toBe('Player');
      expect(comp1.CompareTag('Player')).toBe(true);
      expect(comp1.GetComponent(AnotherTestComponent)).toBe(comp2);
      expect(comp1.transform).toBe(go.transform);
    });

    it('should work with multiple GameObjects', () => {
      const go1 = new MockGameObject('GO1');
      const go2 = new MockGameObject('GO2');

      const comp1 = go1.AddComponent(TestComponent);
      const comp2 = go2.AddComponent(TestComponent);

      expect(comp1.gameObject).toBe(go1);
      expect(comp2.gameObject).toBe(go2);
      expect(comp1.gameObject).not.toBe(comp2.gameObject);
    });

    it('should support component inheritance', () => {
      class DerivedComponent extends TestComponent {
        public derivedValue: string = 'derived';
      }

      const go = new MockGameObject();
      const comp = go.AddComponent(DerivedComponent);

      expect(comp).toBeInstanceOf(TestComponent);
      expect(comp).toBeInstanceOf(Component);
      expect(comp.testValue).toBe(42);
      expect(comp.derivedValue).toBe('derived');
    });
  });
});
