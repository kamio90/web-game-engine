import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Transform, Space } from '../Transform';
import { Component, IGameObject } from '../Component';
import { Object as UnityObject } from '../Object';
import { Vector3 } from '../../math/Vector3';
import { Quaternion } from '../../math/Quaternion';

// Mock GameObject for testing
class MockGameObject extends UnityObject implements IGameObject {
  private _transform: Transform;
  public tag: string = 'Untagged';

  constructor(name: string = 'GameObject') {
    super(name);
    this._transform = new Transform();
    this._transform._setGameObject(this);
  }

  get transform(): Transform {
    return this._transform;
  }

  GetComponent<T extends Component>(type: new (...args: any[]) => T): T | null {
    return null;
  }

  GetComponents<T extends Component>(type: new (...args: any[]) => T): T[] {
    return [];
  }

  GetComponentInChildren<T extends Component>(
    type: new (...args: any[]) => T,
    includeInactive?: boolean
  ): T | null {
    return null;
  }

  GetComponentsInChildren<T extends Component>(
    type: new (...args: any[]) => T,
    includeInactive?: boolean
  ): T[] {
    return [];
  }

  GetComponentInParent<T extends Component>(
    type: new (...args: any[]) => T
  ): T | null {
    return null;
  }

  GetComponentsInParent<T extends Component>(
    type: new (...args: any[]) => T
  ): T[] {
    return [];
  }
}

describe('Transform', () => {
  afterEach(() => {
    (UnityObject as any)._clearAllObjects();
  });

  describe('constructor', () => {
    it('should create transform with default values', () => {
      const go = new MockGameObject();
      const t = go.transform;
      expect(t.localPosition.approximatelyEquals(Vector3.zero, 0.001)).toBe(true);
      expect(t.localRotation.approximatelyEquals(Quaternion.identity, 0.001)).toBe(
        true
      );
      expect(t.localScale.approximatelyEquals(Vector3.one, 0.001)).toBe(true);
    });

    it('should extend Component', () => {
      const go = new MockGameObject();
      expect(go.transform).toBeInstanceOf(Component);
    });
  });

  describe('localPosition', () => {
    it('should get local position', () => {
      const go = new MockGameObject();
      const t = go.transform;
      expect(t.localPosition.approximatelyEquals(Vector3.zero, 0.001)).toBe(true);
    });

    it('should set local position', () => {
      const go = new MockGameObject();
      const t = go.transform;
      t.localPosition = new Vector3(1, 2, 3);
      expect(t.localPosition.approximatelyEquals(new Vector3(1, 2, 3), 0.001)).toBe(
        true
      );
    });

    it('should affect world position when no parent', () => {
      const go = new MockGameObject();
      const t = go.transform;
      t.localPosition = new Vector3(5, 10, 15);
      expect(t.position.approximatelyEquals(new Vector3(5, 10, 15), 0.001)).toBe(true);
    });
  });

  describe('localRotation', () => {
    it('should get local rotation', () => {
      const go = new MockGameObject();
      const t = go.transform;
      expect(t.localRotation.approximatelyEquals(Quaternion.identity, 0.001)).toBe(
        true
      );
    });

    it('should set local rotation', () => {
      const go = new MockGameObject();
      const t = go.transform;
      const rotation = Quaternion.Euler(45, 0, 0);
      t.localRotation = rotation;
      expect(t.localRotation.approximatelyEquals(rotation, 0.001)).toBe(true);
    });
  });

  describe('localEulerAngles', () => {
    it('should get Euler angles', () => {
      const go = new MockGameObject();
      const t = go.transform;
      const euler = t.localEulerAngles;
      expect(euler.approximatelyEquals(Vector3.zero, 0.1)).toBe(true);
    });

    it('should set rotation via Euler angles', () => {
      const go = new MockGameObject();
      const t = go.transform;
      t.localEulerAngles = new Vector3(0, 90, 0);
      const euler = t.localEulerAngles;
      // Euler angles can have multiple representations, so just check it's close
      expect(euler.y).toBeCloseTo(90, 0);
    });
  });

  describe('localScale', () => {
    it('should get local scale', () => {
      const go = new MockGameObject();
      const t = go.transform;
      expect(t.localScale.approximatelyEquals(Vector3.one, 0.001)).toBe(true);
    });

    it('should set local scale', () => {
      const go = new MockGameObject();
      const t = go.transform;
      t.localScale = new Vector3(2, 3, 4);
      expect(t.localScale.approximatelyEquals(new Vector3(2, 3, 4), 0.001)).toBe(
        true
      );
    });
  });

  describe('position (world space)', () => {
    it('should equal localPosition when no parent', () => {
      const go = new MockGameObject();
      const t = go.transform;
      t.localPosition = new Vector3(1, 2, 3);
      expect(t.position.approximatelyEquals(new Vector3(1, 2, 3), 0.001)).toBe(true);
    });

    it('should calculate world position with parent', () => {
      const parent = new MockGameObject('Parent').transform;
      const child = new MockGameObject('Child').transform;

      parent.position = new Vector3(10, 0, 0);
      child.SetParent(parent);
      child.localPosition = new Vector3(5, 0, 0);

      expect(child.position.approximatelyEquals(new Vector3(15, 0, 0), 0.001)).toBe(
        true
      );
    });

    it('should set world position correctly with parent', () => {
      const parent = new MockGameObject('Parent').transform;
      const child = new MockGameObject('Child').transform;

      parent.position = new Vector3(10, 0, 0);
      child.SetParent(parent);
      child.position = new Vector3(15, 0, 0);

      expect(child.localPosition.approximatelyEquals(new Vector3(5, 0, 0), 0.001)).toBe(
        true
      );
    });
  });

  describe('rotation (world space)', () => {
    it('should equal localRotation when no parent', () => {
      const go = new MockGameObject();
      const t = go.transform;
      const rot = Quaternion.Euler(45, 0, 0);
      t.localRotation = rot;
      expect(t.rotation.approximatelyEquals(rot, 0.001)).toBe(true);
    });

    it('should combine rotations with parent', () => {
      const parent = new MockGameObject('Parent').transform;
      const child = new MockGameObject('Child').transform;

      parent.localEulerAngles = new Vector3(0, 90, 0);
      child.SetParent(parent);
      child.localEulerAngles = new Vector3(0, 90, 0);

      // After two 90° rotations around Y, forward should point backward (-Z)
      expect(child.forward.approximatelyEquals(Vector3.back, 0.01)).toBe(true);
    });
  });

  describe('lossyScale', () => {
    it('should equal localScale when no parent', () => {
      const go = new MockGameObject();
      const t = go.transform;
      t.localScale = new Vector3(2, 3, 4);
      expect(t.lossyScale.approximatelyEquals(new Vector3(2, 3, 4), 0.001)).toBe(
        true
      );
    });

    it('should multiply parent scale', () => {
      const parent = new MockGameObject('Parent').transform;
      const child = new MockGameObject('Child').transform;

      parent.localScale = new Vector3(2, 2, 2);
      child.SetParent(parent);
      child.localScale = new Vector3(3, 3, 3);

      expect(child.lossyScale.approximatelyEquals(new Vector3(6, 6, 6), 0.001)).toBe(
        true
      );
    });

    it('should work with deep hierarchy', () => {
      const grandparent = new MockGameObject('GP').transform;
      const parent = new MockGameObject('Parent').transform;
      const child = new MockGameObject('Child').transform;

      grandparent.localScale = new Vector3(2, 2, 2);
      parent.SetParent(grandparent);
      parent.localScale = new Vector3(2, 2, 2);
      child.SetParent(parent);
      child.localScale = new Vector3(2, 2, 2);

      expect(child.lossyScale.approximatelyEquals(new Vector3(8, 8, 8), 0.001)).toBe(
        true
      );
    });
  });

  describe('direction vectors', () => {
    it('should return forward direction', () => {
      const go = new MockGameObject();
      const t = go.transform;
      expect(t.forward.approximatelyEquals(Vector3.forward, 0.001)).toBe(true);
    });

    it('should return right direction', () => {
      const go = new MockGameObject();
      const t = go.transform;
      expect(t.right.approximatelyEquals(Vector3.right, 0.001)).toBe(true);
    });

    it('should return up direction', () => {
      const go = new MockGameObject();
      const t = go.transform;
      expect(t.up.approximatelyEquals(Vector3.up, 0.001)).toBe(true);
    });

    it('should update when rotated', () => {
      const go = new MockGameObject();
      const t = go.transform;
      t.localEulerAngles = new Vector3(0, 90, 0);
      // After 90° rotation around Y, forward becomes -right
      expect(t.forward.approximatelyEquals(Vector3.right, 0.01)).toBe(true);
    });
  });

  describe('parent hierarchy', () => {
    it('should have no parent by default', () => {
      const go = new MockGameObject();
      expect(go.transform.parent).toBeNull();
    });

    it('should set parent', () => {
      const parent = new MockGameObject('Parent').transform;
      const child = new MockGameObject('Child').transform;
      child.SetParent(parent);
      expect(child.parent).toBe(parent);
    });

    it('should add child to parent children list', () => {
      const parent = new MockGameObject('Parent').transform;
      const child = new MockGameObject('Child').transform;
      child.SetParent(parent);
      expect(parent.childCount).toBe(1);
      expect(parent.GetChild(0)).toBe(child);
    });

    it('should remove from old parent when reparenting', () => {
      const parent1 = new MockGameObject('Parent1').transform;
      const parent2 = new MockGameObject('Parent2').transform;
      const child = new MockGameObject('Child').transform;

      child.SetParent(parent1);
      expect(parent1.childCount).toBe(1);

      child.SetParent(parent2);
      expect(parent1.childCount).toBe(0);
      expect(parent2.childCount).toBe(1);
    });

    it('should preserve world position by default', () => {
      const parent = new MockGameObject('Parent').transform;
      const child = new MockGameObject('Child').transform;

      parent.position = new Vector3(10, 0, 0);
      child.position = new Vector3(15, 5, 0);

      child.SetParent(parent, true);

      expect(child.position.approximatelyEquals(new Vector3(15, 5, 0), 0.001)).toBe(
        true
      );
      expect(child.localPosition.approximatelyEquals(new Vector3(5, 5, 0), 0.001)).toBe(
        true
      );
    });

    it('should not preserve world position when worldPositionStays=false', () => {
      const parent = new MockGameObject('Parent').transform;
      const child = new MockGameObject('Child').transform;

      parent.position = new Vector3(10, 0, 0);
      child.localPosition = new Vector3(5, 0, 0);

      child.SetParent(parent, false);

      expect(child.localPosition.approximatelyEquals(new Vector3(5, 0, 0), 0.001)).toBe(
        true
      );
    });
  });

  describe('root', () => {
    it('should return self when no parent', () => {
      const go = new MockGameObject();
      expect(go.transform.root).toBe(go.transform);
    });

    it('should return parent when one level deep', () => {
      const parent = new MockGameObject('Parent').transform;
      const child = new MockGameObject('Child').transform;
      child.SetParent(parent);
      expect(child.root).toBe(parent);
    });

    it('should return topmost parent in deep hierarchy', () => {
      const grandparent = new MockGameObject('GP').transform;
      const parent = new MockGameObject('Parent').transform;
      const child = new MockGameObject('Child').transform;

      parent.SetParent(grandparent);
      child.SetParent(parent);

      expect(child.root).toBe(grandparent);
      expect(parent.root).toBe(grandparent);
    });
  });

  describe('childCount and GetChild', () => {
    it('should return 0 children initially', () => {
      const go = new MockGameObject();
      expect(go.transform.childCount).toBe(0);
    });

    it('should return correct child count', () => {
      const parent = new MockGameObject('Parent').transform;
      const child1 = new MockGameObject('Child1').transform;
      const child2 = new MockGameObject('Child2').transform;

      child1.SetParent(parent);
      child2.SetParent(parent);

      expect(parent.childCount).toBe(2);
    });

    it('should get child by index', () => {
      const parent = new MockGameObject('Parent').transform;
      const child1 = new MockGameObject('Child1').transform;
      const child2 = new MockGameObject('Child2').transform;

      child1.SetParent(parent);
      child2.SetParent(parent);

      expect(parent.GetChild(0)).toBe(child1);
      expect(parent.GetChild(1)).toBe(child2);
    });

    it('should throw error for invalid index', () => {
      const parent = new MockGameObject('Parent').transform;
      expect(() => parent.GetChild(0)).toThrow();
      expect(() => parent.GetChild(-1)).toThrow();
    });
  });

  describe('Find', () => {
    it('should find direct child', () => {
      const parent = new MockGameObject('Parent').transform;
      const child = new MockGameObject('Child').transform;
      child.SetParent(parent);

      expect(parent.Find('Child')).toBe(child);
    });

    it('should find nested child', () => {
      const parent = new MockGameObject('Parent').transform;
      const child = new MockGameObject('Child').transform;
      const grandchild = new MockGameObject('Grandchild').transform;

      child.SetParent(parent);
      grandchild.SetParent(child);

      expect(parent.Find('Grandchild')).toBe(grandchild);
    });

    it('should return null if not found', () => {
      const parent = new MockGameObject('Parent').transform;
      expect(parent.Find('Nonexistent')).toBeNull();
    });

    it('should not find self', () => {
      const go = new MockGameObject('Test').transform;
      expect(go.Find('Test')).toBeNull();
    });
  });

  describe('Translate', () => {
    it('should translate in world space', () => {
      const go = new MockGameObject();
      const t = go.transform;
      t.Translate(new Vector3(1, 2, 3), Space.World);
      expect(t.position.approximatelyEquals(new Vector3(1, 2, 3), 0.001)).toBe(true);
    });

    it('should translate in local space', () => {
      const go = new MockGameObject();
      const t = go.transform;
      t.Translate(new Vector3(1, 0, 0), Space.Self);
      expect(t.localPosition.approximatelyEquals(new Vector3(1, 0, 0), 0.001)).toBe(
        true
      );
    });

    it('should respect rotation in local space', () => {
      const go = new MockGameObject();
      const t = go.transform;
      t.localEulerAngles = new Vector3(0, 90, 0);
      t.Translate(new Vector3(1, 0, 0), Space.Self);
      // Local X after 90° Y rotation points in world -Z direction
      expect(t.position.z).toBeCloseTo(-1, 1);
    });
  });

  describe('Rotate', () => {
    it('should rotate in world space', () => {
      const go = new MockGameObject();
      const t = go.transform;
      t.Rotate(new Vector3(0, 90, 0), Space.World);
      expect(t.eulerAngles.y).toBeCloseTo(90, 0);
    });

    it('should rotate in local space', () => {
      const go = new MockGameObject();
      const t = go.transform;
      t.Rotate(new Vector3(45, 0, 0), Space.Self);
      expect(t.localEulerAngles.x).toBeCloseTo(45, 0);
    });

    it('should accumulate rotations', () => {
      const go = new MockGameObject();
      const t = go.transform;
      t.Rotate(new Vector3(0, 45, 0), Space.Self);
      t.Rotate(new Vector3(0, 45, 0), Space.Self);
      expect(t.localEulerAngles.y).toBeCloseTo(90, 0);
    });
  });

  describe('RotateAround', () => {
    it('should rotate around a point', () => {
      const go = new MockGameObject();
      const t = go.transform;
      t.position = new Vector3(5, 0, 0);
      t.RotateAround(Vector3.zero, Vector3.up, 90);

      expect(t.position.x).toBeCloseTo(0, 1);
      expect(t.position.z).toBeCloseTo(-5, 1);
    });

    it('should also rotate the transform itself', () => {
      const go = new MockGameObject();
      const t = go.transform;
      t.position = new Vector3(5, 0, 0);
      const initialRotation = t.rotation;

      t.RotateAround(Vector3.zero, Vector3.up, 90);

      expect(t.eulerAngles.y).toBeCloseTo(90, 0);
    });
  });

  describe('LookAt', () => {
    it('should look at a position', () => {
      const go = new MockGameObject();
      const t = go.transform;
      t.position = Vector3.zero;
      t.LookAt(new Vector3(0, 0, 10));

      expect(t.forward.approximatelyEquals(Vector3.forward, 0.01)).toBe(true);
    });

    it('should look at another transform', () => {
      const go = new MockGameObject();
      const target = new MockGameObject('Target');

      go.transform.position = Vector3.zero;
      target.transform.position = new Vector3(0, 0, 10);

      go.transform.LookAt(target.transform);

      expect(go.transform.forward.approximatelyEquals(Vector3.forward, 0.01)).toBe(
        true
      );
    });

    it('should ignore when target is same position', () => {
      const go = new MockGameObject();
      const t = go.transform;
      const originalRotation = t.rotation;

      t.LookAt(t.position);

      expect(t.rotation.approximatelyEquals(originalRotation, 0.001)).toBe(true);
    });
  });

  describe('TransformPoint', () => {
    it('should transform point from local to world', () => {
      const go = new MockGameObject();
      const t = go.transform;
      t.position = new Vector3(10, 0, 0);

      const localPoint = new Vector3(5, 0, 0);
      const worldPoint = t.TransformPoint(localPoint);

      expect(worldPoint.approximatelyEquals(new Vector3(15, 0, 0), 0.001)).toBe(true);
    });

    it('should respect rotation', () => {
      const go = new MockGameObject();
      const t = go.transform;
      t.localEulerAngles = new Vector3(0, 90, 0);

      const localPoint = new Vector3(1, 0, 0);
      const worldPoint = t.TransformPoint(localPoint);

      expect(worldPoint.z).toBeCloseTo(-1, 1);
    });

    it('should respect scale', () => {
      const go = new MockGameObject();
      const t = go.transform;
      t.localScale = new Vector3(2, 2, 2);

      const localPoint = new Vector3(1, 0, 0);
      const worldPoint = t.TransformPoint(localPoint);

      expect(worldPoint.x).toBeCloseTo(2, 1);
    });
  });

  describe('InverseTransformPoint', () => {
    it('should transform point from world to local', () => {
      const go = new MockGameObject();
      const t = go.transform;
      t.position = new Vector3(10, 0, 0);

      const worldPoint = new Vector3(15, 0, 0);
      const localPoint = t.InverseTransformPoint(worldPoint);

      expect(localPoint.approximatelyEquals(new Vector3(5, 0, 0), 0.001)).toBe(true);
    });

    it('should be inverse of TransformPoint', () => {
      const go = new MockGameObject();
      const t = go.transform;
      t.position = new Vector3(5, 10, 15);
      t.localEulerAngles = new Vector3(45, 90, 0);
      t.localScale = new Vector3(2, 2, 2);

      const localPoint = new Vector3(3, 7, 2);
      const worldPoint = t.TransformPoint(localPoint);
      const backToLocal = t.InverseTransformPoint(worldPoint);

      expect(backToLocal.approximatelyEquals(localPoint, 0.01)).toBe(true);
    });
  });

  describe('TransformDirection', () => {
    it('should transform direction', () => {
      const go = new MockGameObject();
      const t = go.transform;
      t.localEulerAngles = new Vector3(0, 90, 0);

      const localDir = new Vector3(1, 0, 0);
      const worldDir = t.TransformDirection(localDir);

      expect(worldDir.z).toBeCloseTo(-1, 1);
    });

    it('should not be affected by position', () => {
      const go = new MockGameObject();
      const t = go.transform;
      t.position = new Vector3(100, 200, 300);

      const localDir = Vector3.forward;
      const worldDir = t.TransformDirection(localDir);

      expect(worldDir.approximatelyEquals(Vector3.forward, 0.001)).toBe(true);
    });
  });

  describe('InverseTransformDirection', () => {
    it('should transform direction from world to local', () => {
      const go = new MockGameObject();
      const t = go.transform;
      t.localEulerAngles = new Vector3(0, 90, 0);

      const worldDir = new Vector3(0, 0, -1);
      const localDir = t.InverseTransformDirection(worldDir);

      expect(localDir.x).toBeCloseTo(1, 1);
    });
  });

  describe('TransformVector', () => {
    it('should transform vector with scale', () => {
      const go = new MockGameObject();
      const t = go.transform;
      t.localScale = new Vector3(2, 3, 4);

      const localVec = new Vector3(1, 1, 1);
      const worldVec = t.TransformVector(localVec);

      expect(worldVec.approximatelyEquals(new Vector3(2, 3, 4), 0.001)).toBe(true);
    });
  });

  describe('InverseTransformVector', () => {
    it('should be inverse of TransformVector', () => {
      const go = new MockGameObject();
      const t = go.transform;
      t.localScale = new Vector3(2, 3, 4);
      t.localEulerAngles = new Vector3(45, 0, 0);

      const localVec = new Vector3(1, 2, 3);
      const worldVec = t.TransformVector(localVec);
      const backToLocal = t.InverseTransformVector(worldVec);

      expect(backToLocal.approximatelyEquals(localVec, 0.01)).toBe(true);
    });
  });

  describe('matrix caching (dirty flag)', () => {
    it('should not recalculate matrices when not dirty', () => {
      const go = new MockGameObject();
      const t = go.transform;

      const matrix1 = t.localToWorldMatrix;
      const matrix2 = t.localToWorldMatrix;

      expect(matrix1).toBe(matrix2);
    });

    it('should mark dirty when position changes', () => {
      const go = new MockGameObject();
      const t = go.transform;

      const matrix1 = t.localToWorldMatrix;
      t.localPosition = new Vector3(1, 0, 0);
      const matrix2 = t.localToWorldMatrix;

      expect(matrix1).not.toBe(matrix2);
    });

    it('should propagate dirty flag to children', () => {
      const parent = new MockGameObject('Parent').transform;
      const child = new MockGameObject('Child').transform;
      child.SetParent(parent);

      // Access to clear dirty flag
      child.localToWorldMatrix;

      // Change parent
      parent.position = new Vector3(10, 0, 0);

      // Child should recalculate
      const childWorldPos = child.position;
      expect(childWorldPos.x).toBeCloseTo(10, 1);
    });
  });

  describe('deep hierarchy', () => {
    it('should handle 5-level hierarchy', () => {
      const levels: Transform[] = [];
      for (let i = 0; i < 5; i++) {
        const go = new MockGameObject(`Level${i}`);
        levels.push(go.transform);
        if (i > 0) {
          levels[i].SetParent(levels[i - 1]);
        }
        levels[i].localPosition = new Vector3(1, 0, 0);
      }

      const deepest = levels[4];
      expect(deepest.position.x).toBeCloseTo(5, 1);
    });

    it('should maintain correct world transforms in deep hierarchy', () => {
      const root = new MockGameObject('Root').transform;
      const child1 = new MockGameObject('Child1').transform;
      const child2 = new MockGameObject('Child2').transform;
      const child3 = new MockGameObject('Child3').transform;

      child1.SetParent(root);
      child2.SetParent(child1);
      child3.SetParent(child2);

      root.position = new Vector3(10, 0, 0);
      child1.localPosition = new Vector3(5, 0, 0);
      child2.localPosition = new Vector3(3, 0, 0);
      child3.localPosition = new Vector3(2, 0, 0);

      expect(child3.position.x).toBeCloseTo(20, 1);
    });
  });

  describe('performance', () => {
    it('should handle 100 transforms efficiently', () => {
      const start = performance.now();

      for (let i = 0; i < 100; i++) {
        const go = new MockGameObject(`GO${i}`);
        go.transform.position = new Vector3(i, i, i);
        go.transform.rotation = Quaternion.Euler(i, i, i);
      }

      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(100);
    });
  });
});
