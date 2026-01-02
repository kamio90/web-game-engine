import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GameObject } from '../GameObject';
import { Component } from '../Component';
import { Transform } from '../Transform';
import { Object as UnityObject } from '../Object';
import { Vector3 } from '../../math/Vector3';

// Test components
class TestComponent extends Component {
  public testValue: number = 42;

  constructor() {
    super('TestComponent');
  }
}

class AnotherComponent extends Component {
  public anotherValue: string = 'test';

  constructor() {
    super('AnotherComponent');
  }
}

class DerivedComponent extends TestComponent {
  public derivedValue: boolean = true;

  constructor() {
    super();
    this.name = 'DerivedComponent';
  }
}

describe('GameObject', () => {
  afterEach(() => {
    (UnityObject as any)._clearAllObjects();
    (GameObject as any)._clearAllGameObjects();
  });

  describe('constructor', () => {
    it('should create GameObject with default name', () => {
      const go = new GameObject();
      expect(go.name).toBe('GameObject');
    });

    it('should create GameObject with custom name', () => {
      const go = new GameObject('Player');
      expect(go.name).toBe('Player');
    });

    it('should extend UnityObject', () => {
      const go = new GameObject();
      expect(go).toBeInstanceOf(UnityObject);
    });

    it('should have unique instance ID', () => {
      const go1 = new GameObject();
      const go2 = new GameObject();
      expect(go1.GetInstanceID()).not.toBe(go2.GetInstanceID());
    });

    it('should automatically create Transform component', () => {
      const go = new GameObject();
      expect(go.transform).toBeInstanceOf(Transform);
    });

    it('should be active by default', () => {
      const go = new GameObject();
      expect(go.activeSelf).toBe(true);
      expect(go.activeInHierarchy).toBe(true);
    });

    it('should have default tag Untagged', () => {
      const go = new GameObject();
      expect(go.tag).toBe('Untagged');
    });
  });

  describe('transform property', () => {
    it('should return Transform component', () => {
      const go = new GameObject();
      expect(go.transform).toBeInstanceOf(Transform);
    });

    it('should return same transform instance', () => {
      const go = new GameObject();
      const t1 = go.transform;
      const t2 = go.transform;
      expect(t1).toBe(t2);
    });

    it('should allow transform manipulation', () => {
      const go = new GameObject();
      go.transform.position = new Vector3(1, 2, 3);
      expect(go.transform.position.approximatelyEquals(new Vector3(1, 2, 3), 0.001)).toBe(
        true
      );
    });
  });

  describe('activeSelf', () => {
    it('should return local active state', () => {
      const go = new GameObject();
      expect(go.activeSelf).toBe(true);
    });

    it('should not consider parent when getting activeSelf', () => {
      const parent = new GameObject('Parent');
      const child = new GameObject('Child');
      child.transform.SetParent(parent.transform);

      parent.SetActive(false);
      expect(child.activeSelf).toBe(true); // Still true locally
    });
  });

  describe('activeInHierarchy', () => {
    it('should match activeSelf when no parent', () => {
      const go = new GameObject();
      expect(go.activeInHierarchy).toBe(go.activeSelf);
    });

    it('should be false when parent is inactive', () => {
      const parent = new GameObject('Parent');
      const child = new GameObject('Child');
      child.transform.SetParent(parent.transform);

      parent.SetActive(false);
      expect(child.activeInHierarchy).toBe(false);
    });

    it('should be true when all parents are active', () => {
      const grandparent = new GameObject('GP');
      const parent = new GameObject('Parent');
      const child = new GameObject('Child');

      parent.transform.SetParent(grandparent.transform);
      child.transform.SetParent(parent.transform);

      expect(child.activeInHierarchy).toBe(true);
    });

    it('should be false when any ancestor is inactive', () => {
      const grandparent = new GameObject('GP');
      const parent = new GameObject('Parent');
      const child = new GameObject('Child');

      parent.transform.SetParent(grandparent.transform);
      child.transform.SetParent(parent.transform);

      grandparent.SetActive(false);
      expect(child.activeInHierarchy).toBe(false);
    });
  });

  describe('SetActive', () => {
    it('should activate GameObject', () => {
      const go = new GameObject();
      go.SetActive(false);
      expect(go.activeSelf).toBe(false);
      go.SetActive(true);
      expect(go.activeSelf).toBe(true);
    });

    it('should deactivate GameObject', () => {
      const go = new GameObject();
      go.SetActive(false);
      expect(go.activeSelf).toBe(false);
    });

    it('should do nothing if already in desired state', () => {
      const go = new GameObject();
      const initialState = go.activeSelf;
      go.SetActive(true); // Already true
      expect(go.activeSelf).toBe(initialState);
    });

    it('should not affect parent', () => {
      const parent = new GameObject('Parent');
      const child = new GameObject('Child');
      child.transform.SetParent(parent.transform);

      child.SetActive(false);
      expect(parent.activeSelf).toBe(true);
    });
  });

  describe('tag', () => {
    it('should get tag', () => {
      const go = new GameObject();
      expect(go.tag).toBe('Untagged');
    });

    it('should set tag', () => {
      const go = new GameObject();
      go.tag = 'Player';
      expect(go.tag).toBe('Player');
    });

    it('should update tag', () => {
      const go = new GameObject();
      go.tag = 'Enemy';
      expect(go.tag).toBe('Enemy');
      go.tag = 'Ally';
      expect(go.tag).toBe('Ally');
    });
  });

  describe('CompareTag', () => {
    it('should return true for matching tag', () => {
      const go = new GameObject();
      go.tag = 'Player';
      expect(go.CompareTag('Player')).toBe(true);
    });

    it('should return false for non-matching tag', () => {
      const go = new GameObject();
      go.tag = 'Player';
      expect(go.CompareTag('Enemy')).toBe(false);
    });

    it('should be case-sensitive', () => {
      const go = new GameObject();
      go.tag = 'Player';
      expect(go.CompareTag('player')).toBe(false);
    });
  });

  describe('AddComponent', () => {
    it('should add component to GameObject', () => {
      const go = new GameObject();
      const comp = go.AddComponent(TestComponent);
      expect(comp).toBeInstanceOf(TestComponent);
      expect(comp.gameObject).toBe(go);
    });

    it('should return new component instance', () => {
      const go = new GameObject();
      const comp = go.AddComponent(TestComponent);
      expect(comp.testValue).toBe(42);
    });

    it('should allow multiple components of same type', () => {
      const go = new GameObject();
      const comp1 = go.AddComponent(TestComponent);
      const comp2 = go.AddComponent(TestComponent);
      expect(comp1).not.toBe(comp2);
      expect(comp1).toBeInstanceOf(TestComponent);
      expect(comp2).toBeInstanceOf(TestComponent);
    });

    it('should set component gameObject reference', () => {
      const go = new GameObject('Test');
      const comp = go.AddComponent(TestComponent);
      expect(comp.gameObject).toBe(go);
      expect(comp.gameObject.name).toBe('Test');
    });
  });

  describe('GetComponent', () => {
    it('should get component of specified type', () => {
      const go = new GameObject();
      const added = go.AddComponent(TestComponent);
      const retrieved = go.GetComponent(TestComponent);
      expect(retrieved).toBe(added);
    });

    it('should return null if component not found', () => {
      const go = new GameObject();
      const comp = go.GetComponent(TestComponent);
      expect(comp).toBeNull();
    });

    it('should return first component if multiple exist', () => {
      const go = new GameObject();
      const comp1 = go.AddComponent(TestComponent);
      const comp2 = go.AddComponent(TestComponent);
      const retrieved = go.GetComponent(TestComponent);
      expect(retrieved).toBe(comp1);
    });

    it('should get Transform component', () => {
      const go = new GameObject();
      const transform = go.GetComponent(Transform);
      expect(transform).toBe(go.transform);
    });

    it('should distinguish between different component types', () => {
      const go = new GameObject();
      const test = go.AddComponent(TestComponent);
      const another = go.AddComponent(AnotherComponent);
      expect(go.GetComponent(TestComponent)).toBe(test);
      expect(go.GetComponent(AnotherComponent)).toBe(another);
    });
  });

  describe('GetComponents', () => {
    it('should get all components of type', () => {
      const go = new GameObject();
      const comp1 = go.AddComponent(TestComponent);
      const comp2 = go.AddComponent(TestComponent);
      const components = go.GetComponents(TestComponent);
      expect(components).toHaveLength(2);
      expect(components).toContain(comp1);
      expect(components).toContain(comp2);
    });

    it('should return empty array if none found', () => {
      const go = new GameObject();
      const components = go.GetComponents(TestComponent);
      expect(components).toHaveLength(0);
    });

    it('should only return components of specified type', () => {
      const go = new GameObject();
      go.AddComponent(TestComponent);
      go.AddComponent(AnotherComponent);
      go.AddComponent(TestComponent);
      const components = go.GetComponents(TestComponent);
      expect(components).toHaveLength(2);
      components.forEach((c) => expect(c).toBeInstanceOf(TestComponent));
    });
  });

  describe('GetComponentInChildren', () => {
    it('should get component from same GameObject', () => {
      const go = new GameObject();
      const comp = go.AddComponent(TestComponent);
      const found = go.GetComponentInChildren(TestComponent);
      expect(found).toBe(comp);
    });

    it('should get component from child', () => {
      const parent = new GameObject('Parent');
      const child = new GameObject('Child');
      child.transform.SetParent(parent.transform);

      const comp = child.AddComponent(TestComponent);
      const found = parent.GetComponentInChildren(TestComponent);
      expect(found).toBe(comp);
    });

    it('should get component from nested child', () => {
      const parent = new GameObject('Parent');
      const child = new GameObject('Child');
      const grandchild = new GameObject('Grandchild');

      child.transform.SetParent(parent.transform);
      grandchild.transform.SetParent(child.transform);

      const comp = grandchild.AddComponent(TestComponent);
      const found = parent.GetComponentInChildren(TestComponent);
      expect(found).toBe(comp);
    });

    it('should return null if not found', () => {
      const go = new GameObject();
      const found = go.GetComponentInChildren(TestComponent);
      expect(found).toBeNull();
    });

    it('should skip inactive children by default', () => {
      const parent = new GameObject('Parent');
      const child = new GameObject('Child');
      child.transform.SetParent(parent.transform);
      child.SetActive(false);

      const comp = child.AddComponent(TestComponent);
      const found = parent.GetComponentInChildren(TestComponent);
      expect(found).toBeNull();
    });

    it('should include inactive children when specified', () => {
      const parent = new GameObject('Parent');
      const child = new GameObject('Child');
      child.transform.SetParent(parent.transform);
      child.SetActive(false);

      const comp = child.AddComponent(TestComponent);
      const found = parent.GetComponentInChildren(TestComponent, true);
      expect(found).toBe(comp);
    });
  });

  describe('GetComponentsInChildren', () => {
    it('should get all components in hierarchy', () => {
      const parent = new GameObject('Parent');
      const child1 = new GameObject('Child1');
      const child2 = new GameObject('Child2');

      child1.transform.SetParent(parent.transform);
      child2.transform.SetParent(parent.transform);

      const comp1 = parent.AddComponent(TestComponent);
      const comp2 = child1.AddComponent(TestComponent);
      const comp3 = child2.AddComponent(TestComponent);

      const components = parent.GetComponentsInChildren(TestComponent);
      expect(components).toHaveLength(3);
      expect(components).toContain(comp1);
      expect(components).toContain(comp2);
      expect(components).toContain(comp3);
    });

    it('should return empty array if none found', () => {
      const go = new GameObject();
      const components = go.GetComponentsInChildren(TestComponent);
      expect(components).toHaveLength(0);
    });

    it('should skip inactive children by default', () => {
      const parent = new GameObject('Parent');
      const child = new GameObject('Child');
      child.transform.SetParent(parent.transform);
      child.SetActive(false);

      child.AddComponent(TestComponent);
      const components = parent.GetComponentsInChildren(TestComponent);
      expect(components).toHaveLength(0);
    });

    it('should include inactive children when specified', () => {
      const parent = new GameObject('Parent');
      const child = new GameObject('Child');
      child.transform.SetParent(parent.transform);
      child.SetActive(false);

      const comp = child.AddComponent(TestComponent);
      const components = parent.GetComponentsInChildren(TestComponent, true);
      expect(components).toHaveLength(1);
      expect(components[0]).toBe(comp);
    });
  });

  describe('GetComponentInParent', () => {
    it('should get component from same GameObject', () => {
      const go = new GameObject();
      const comp = go.AddComponent(TestComponent);
      const found = go.GetComponentInParent(TestComponent);
      expect(found).toBe(comp);
    });

    it('should get component from parent', () => {
      const parent = new GameObject('Parent');
      const child = new GameObject('Child');
      child.transform.SetParent(parent.transform);

      const comp = parent.AddComponent(TestComponent);
      const found = child.GetComponentInParent(TestComponent);
      expect(found).toBe(comp);
    });

    it('should get component from grandparent', () => {
      const grandparent = new GameObject('GP');
      const parent = new GameObject('Parent');
      const child = new GameObject('Child');

      parent.transform.SetParent(grandparent.transform);
      child.transform.SetParent(parent.transform);

      const comp = grandparent.AddComponent(TestComponent);
      const found = child.GetComponentInParent(TestComponent);
      expect(found).toBe(comp);
    });

    it('should return null if not found', () => {
      const go = new GameObject();
      const found = go.GetComponentInParent(TestComponent);
      expect(found).toBeNull();
    });

    it('should prioritize self over parent', () => {
      const parent = new GameObject('Parent');
      const child = new GameObject('Child');
      child.transform.SetParent(parent.transform);

      const parentComp = parent.AddComponent(TestComponent);
      const childComp = child.AddComponent(TestComponent);

      const found = child.GetComponentInParent(TestComponent);
      expect(found).toBe(childComp);
    });
  });

  describe('GetComponentsInParent', () => {
    it('should get all components up the hierarchy', () => {
      const grandparent = new GameObject('GP');
      const parent = new GameObject('Parent');
      const child = new GameObject('Child');

      parent.transform.SetParent(grandparent.transform);
      child.transform.SetParent(parent.transform);

      const comp1 = child.AddComponent(TestComponent);
      const comp2 = parent.AddComponent(TestComponent);
      const comp3 = grandparent.AddComponent(TestComponent);

      const components = child.GetComponentsInParent(TestComponent);
      expect(components).toHaveLength(3);
      expect(components).toContain(comp1);
      expect(components).toContain(comp2);
      expect(components).toContain(comp3);
    });

    it('should return empty array if none found', () => {
      const go = new GameObject();
      const components = go.GetComponentsInParent(TestComponent);
      expect(components).toHaveLength(0);
    });
  });

  describe('Find', () => {
    it('should find GameObject by name', () => {
      const go = new GameObject('Player');
      const found = GameObject.Find('Player');
      expect(found).toBe(go);
    });

    it('should return null if not found', () => {
      const found = GameObject.Find('Nonexistent');
      expect(found).toBeNull();
    });

    it('should find first GameObject with matching name', () => {
      const go1 = new GameObject('Enemy');
      const go2 = new GameObject('Enemy');
      const found = GameObject.Find('Enemy');
      expect(found).toBe(go1);
    });

    it('should not find destroyed GameObjects', () => {
      const go = new GameObject('Test');
      UnityObject.Destroy(go);
      const found = GameObject.Find('Test');
      expect(found).toBeNull();
    });
  });

  describe('FindWithTag', () => {
    it('should find GameObject by tag', () => {
      const go = new GameObject('Player');
      go.tag = 'Player';
      const found = GameObject.FindWithTag('Player');
      expect(found).toBe(go);
    });

    it('should return null if not found', () => {
      const found = GameObject.FindWithTag('Nonexistent');
      expect(found).toBeNull();
    });

    it('should only find active GameObjects', () => {
      const go = new GameObject('Player');
      go.tag = 'Player';
      go.SetActive(false);
      const found = GameObject.FindWithTag('Player');
      expect(found).toBeNull();
    });

    it('should consider hierarchy when checking active state', () => {
      const parent = new GameObject('Parent');
      const child = new GameObject('Child');
      child.tag = 'Player';
      child.transform.SetParent(parent.transform);

      parent.SetActive(false);
      const found = GameObject.FindWithTag('Player');
      expect(found).toBeNull();
    });
  });

  describe('FindGameObjectsWithTag', () => {
    it('should find all GameObjects with tag', () => {
      const go1 = new GameObject('Enemy1');
      const go2 = new GameObject('Enemy2');
      const go3 = new GameObject('Enemy3');
      go1.tag = 'Enemy';
      go2.tag = 'Enemy';
      go3.tag = 'Enemy';

      const found = GameObject.FindGameObjectsWithTag('Enemy');
      expect(found).toHaveLength(3);
      expect(found).toContain(go1);
      expect(found).toContain(go2);
      expect(found).toContain(go3);
    });

    it('should return empty array if none found', () => {
      const found = GameObject.FindGameObjectsWithTag('Nonexistent');
      expect(found).toHaveLength(0);
    });

    it('should only find active GameObjects', () => {
      const go1 = new GameObject('Enemy1');
      const go2 = new GameObject('Enemy2');
      go1.tag = 'Enemy';
      go2.tag = 'Enemy';
      go2.SetActive(false);

      const found = GameObject.FindGameObjectsWithTag('Enemy');
      expect(found).toHaveLength(1);
      expect(found[0]).toBe(go1);
    });

    it('should not include GameObjects with different tags', () => {
      const enemy = new GameObject('Enemy');
      const player = new GameObject('Player');
      enemy.tag = 'Enemy';
      player.tag = 'Player';

      const found = GameObject.FindGameObjectsWithTag('Enemy');
      expect(found).toHaveLength(1);
      expect(found[0]).toBe(enemy);
    });
  });

  describe('integration', () => {
    it('should support full GameObject workflow', () => {
      const player = new GameObject('Player');
      player.tag = 'Player';
      player.transform.position = new Vector3(10, 0, 0);

      const health = player.AddComponent(TestComponent);
      expect(player.CompareTag('Player')).toBe(true);
      expect(player.GetComponent(TestComponent)).toBe(health);
      expect(health.gameObject.name).toBe('Player');
      expect(health.transform.position.x).toBe(10);
    });

    it('should support hierarchy with components', () => {
      const parent = new GameObject('Parent');
      const child = new GameObject('Child');
      child.transform.SetParent(parent.transform);

      const parentComp = parent.AddComponent(TestComponent);
      const childComp = child.AddComponent(AnotherComponent);

      expect(child.GetComponentInParent(TestComponent)).toBe(parentComp);
      expect(parent.GetComponentInChildren(AnotherComponent)).toBe(childComp);
    });

    it('should handle active state in hierarchy', () => {
      const parent = new GameObject('Parent');
      const child = new GameObject('Child');
      child.transform.SetParent(parent.transform);

      expect(child.activeInHierarchy).toBe(true);
      parent.SetActive(false);
      expect(parent.activeInHierarchy).toBe(false);
      expect(child.activeInHierarchy).toBe(false);
      expect(child.activeSelf).toBe(true);
    });
  });
});
