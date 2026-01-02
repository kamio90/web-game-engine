import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { MonoBehaviour } from '../MonoBehaviour';
import { GameObject } from '../GameObject';
import { LifecycleManager } from '../LifecycleManager';
import { Object as UnityObject } from '../Object';

// Test behaviour with tracking
class TestBehaviour extends MonoBehaviour {
  public awakeCount: number = 0;
  public enableCount: number = 0;
  public startCount: number = 0;
  public updateCount: number = 0;
  public lateUpdateCount: number = 0;
  public fixedUpdateCount: number = 0;
  public disableCount: number = 0;
  public destroyCount: number = 0;
  public executionOrder: string[] = [];

  constructor() {
    super('TestBehaviour');
  }

  protected override Awake(): void {
    this.awakeCount++;
    this.executionOrder.push('Awake');
  }

  protected override OnEnable(): void {
    this.enableCount++;
    this.executionOrder.push('OnEnable');
  }

  protected override Start(): void {
    this.startCount++;
    this.executionOrder.push('Start');
  }

  protected override Update(): void {
    this.updateCount++;
    this.executionOrder.push('Update');
  }

  protected override LateUpdate(): void {
    this.lateUpdateCount++;
    this.executionOrder.push('LateUpdate');
  }

  protected override FixedUpdate(): void {
    this.fixedUpdateCount++;
    this.executionOrder.push('FixedUpdate');
  }

  protected override OnDisable(): void {
    this.disableCount++;
    this.executionOrder.push('OnDisable');
  }

  protected override OnDestroy(): void {
    this.destroyCount++;
    this.executionOrder.push('OnDestroy');
  }
}

class AnotherBehaviour extends MonoBehaviour {
  public executionOrder: string[] = [];

  constructor() {
    super('AnotherBehaviour');
  }

  protected override Awake(): void {
    this.executionOrder.push('Awake');
  }

  protected override Start(): void {
    this.executionOrder.push('Start');
  }

  protected override Update(): void {
    this.executionOrder.push('Update');
  }
}

describe('MonoBehaviour', () => {
  let manager: LifecycleManager;

  beforeEach(() => {
    manager = LifecycleManager.instance;
  });

  afterEach(() => {
    (UnityObject as any)._clearAllObjects();
    (GameObject as any)._clearAllGameObjects();
    manager._clearAll();
    (LifecycleManager as any)._resetInstance();
  });

  describe('constructor', () => {
    it('should create MonoBehaviour with default name', () => {
      const go = new GameObject();
      const behaviour = go.AddComponent(MonoBehaviour);
      expect(behaviour.name).toBe('MonoBehaviour');
    });

    it('should be enabled by default', () => {
      const go = new GameObject();
      const behaviour = go.AddComponent(TestBehaviour);
      expect(behaviour.enabled).toBe(true);
    });

    it('should register with LifecycleManager', () => {
      const go = new GameObject();
      const behaviour = go.AddComponent(TestBehaviour);
      expect(manager._getNewBehaviourCount()).toBe(1);
    });
  });

  describe('enabled property', () => {
    it('should get enabled state', () => {
      const go = new GameObject();
      const behaviour = go.AddComponent(TestBehaviour);
      expect(behaviour.enabled).toBe(true);
    });

    it('should set enabled state', () => {
      const go = new GameObject();
      const behaviour = go.AddComponent(TestBehaviour);
      behaviour.enabled = false;
      expect(behaviour.enabled).toBe(false);
    });

    it('should not call OnEnable/OnDisable before Awake', () => {
      const go = new GameObject();
      const behaviour = go.AddComponent(TestBehaviour);
      behaviour.enabled = false;
      expect(behaviour.disableCount).toBe(0);
      behaviour.enabled = true;
      expect(behaviour.enableCount).toBe(0);
    });

    it('should call OnDisable when disabled after Awake', () => {
      const go = new GameObject();
      const behaviour = go.AddComponent(TestBehaviour);
      manager.processAwake();

      behaviour.enabled = false;
      expect(behaviour.disableCount).toBe(1);
    });

    it('should call OnEnable when re-enabled after Awake', () => {
      const go = new GameObject();
      const behaviour = go.AddComponent(TestBehaviour);
      manager.processAwake();

      behaviour.enabled = false;
      behaviour.enabled = true;
      expect(behaviour.enableCount).toBe(2); // Once in Awake, once when re-enabled
    });

    it('should not call OnEnable/OnDisable if already in desired state', () => {
      const go = new GameObject();
      const behaviour = go.AddComponent(TestBehaviour);
      manager.processAwake();

      const initialCount = behaviour.enableCount;
      behaviour.enabled = true; // Already true
      expect(behaviour.enableCount).toBe(initialCount);
    });
  });

  describe('Awake', () => {
    it('should call Awake when processAwake is called', () => {
      const go = new GameObject();
      const behaviour = go.AddComponent(TestBehaviour);
      expect(behaviour.awakeCount).toBe(0);

      manager.processAwake();
      expect(behaviour.awakeCount).toBe(1);
    });

    it('should call Awake only once', () => {
      const go = new GameObject();
      const behaviour = go.AddComponent(TestBehaviour);

      manager.processAwake();
      manager.processAwake();
      expect(behaviour.awakeCount).toBe(1);
    });

    it('should call OnEnable after Awake if enabled', () => {
      const go = new GameObject();
      const behaviour = go.AddComponent(TestBehaviour);

      manager.processAwake();
      expect(behaviour.executionOrder).toEqual(['Awake', 'OnEnable']);
    });

    it('should not call OnEnable if disabled', () => {
      const go = new GameObject();
      const behaviour = go.AddComponent(TestBehaviour);
      behaviour.enabled = false;

      manager.processAwake();
      expect(behaviour.enableCount).toBe(0);
      expect(behaviour.executionOrder).toEqual(['Awake']);
    });

    it('should call Awake for all behaviours before any Start', () => {
      const go1 = new GameObject();
      const go2 = new GameObject();
      const b1 = go1.AddComponent(TestBehaviour);
      const b2 = go2.AddComponent(TestBehaviour);

      manager.processAwake();
      manager.processStart();

      expect(b1.awakeCount).toBe(1);
      expect(b2.awakeCount).toBe(1);
      expect(b1.startCount).toBe(1);
      expect(b2.startCount).toBe(1);
    });
  });

  describe('Start', () => {
    it('should call Start when processStart is called', () => {
      const go = new GameObject();
      const behaviour = go.AddComponent(TestBehaviour);

      manager.processAwake();
      manager.processStart();
      expect(behaviour.startCount).toBe(1);
    });

    it('should call Start only once', () => {
      const go = new GameObject();
      const behaviour = go.AddComponent(TestBehaviour);

      manager.processAwake();
      manager.processStart();
      manager.processStart();
      expect(behaviour.startCount).toBe(1);
    });

    it('should not call Start if disabled', () => {
      const go = new GameObject();
      const behaviour = go.AddComponent(TestBehaviour);
      behaviour.enabled = false;

      manager.processAwake();
      manager.processStart();
      expect(behaviour.startCount).toBe(0);
    });

    it('should not call Start if GameObject is inactive', () => {
      const go = new GameObject();
      const behaviour = go.AddComponent(TestBehaviour);
      go.SetActive(false);

      manager.processAwake();
      manager.processStart();
      expect(behaviour.startCount).toBe(0);
    });

    it('should call Start after being enabled', () => {
      const go = new GameObject();
      const behaviour = go.AddComponent(TestBehaviour);
      behaviour.enabled = false;

      manager.processAwake();
      manager.processStart();
      expect(behaviour.startCount).toBe(0);

      behaviour.enabled = true;
      manager.processStart();
      expect(behaviour.startCount).toBe(1);
    });
  });

  describe('Update', () => {
    it('should call Update when processUpdate is called', () => {
      const go = new GameObject();
      const behaviour = go.AddComponent(TestBehaviour);

      manager.processAwake();
      manager.processUpdate();
      expect(behaviour.updateCount).toBe(1);
    });

    it('should call Update every frame', () => {
      const go = new GameObject();
      const behaviour = go.AddComponent(TestBehaviour);

      manager.processAwake();
      manager.processUpdate();
      manager.processUpdate();
      manager.processUpdate();
      expect(behaviour.updateCount).toBe(3);
    });

    it('should not call Update if disabled', () => {
      const go = new GameObject();
      const behaviour = go.AddComponent(TestBehaviour);
      behaviour.enabled = false;

      manager.processAwake();
      manager.processUpdate();
      expect(behaviour.updateCount).toBe(0);
    });

    it('should not call Update if GameObject is inactive', () => {
      const go = new GameObject();
      const behaviour = go.AddComponent(TestBehaviour);
      go.SetActive(false);

      manager.processAwake();
      manager.processUpdate();
      expect(behaviour.updateCount).toBe(0);
    });

    it('should call Start before first Update', () => {
      const go = new GameObject();
      const behaviour = go.AddComponent(TestBehaviour);

      manager.processAwake();
      manager.processUpdate();

      const startIndex = behaviour.executionOrder.indexOf('Start');
      const updateIndex = behaviour.executionOrder.indexOf('Update');
      expect(startIndex).toBeLessThan(updateIndex);
    });
  });

  describe('LateUpdate', () => {
    it('should call LateUpdate when processLateUpdate is called', () => {
      const go = new GameObject();
      const behaviour = go.AddComponent(TestBehaviour);

      manager.processAwake();
      manager.processLateUpdate();
      expect(behaviour.lateUpdateCount).toBe(1);
    });

    it('should call LateUpdate every frame', () => {
      const go = new GameObject();
      const behaviour = go.AddComponent(TestBehaviour);

      manager.processAwake();
      manager.processLateUpdate();
      manager.processLateUpdate();
      expect(behaviour.lateUpdateCount).toBe(2);
    });

    it('should not call LateUpdate if disabled', () => {
      const go = new GameObject();
      const behaviour = go.AddComponent(TestBehaviour);
      behaviour.enabled = false;

      manager.processAwake();
      manager.processLateUpdate();
      expect(behaviour.lateUpdateCount).toBe(0);
    });
  });

  describe('FixedUpdate', () => {
    it('should call FixedUpdate when processFixedUpdate is called', () => {
      const go = new GameObject();
      const behaviour = go.AddComponent(TestBehaviour);

      manager.processAwake();
      manager.processFixedUpdate();
      expect(behaviour.fixedUpdateCount).toBe(1);
    });

    it('should call FixedUpdate every fixed frame', () => {
      const go = new GameObject();
      const behaviour = go.AddComponent(TestBehaviour);

      manager.processAwake();
      manager.processFixedUpdate();
      manager.processFixedUpdate();
      expect(behaviour.fixedUpdateCount).toBe(2);
    });

    it('should not call FixedUpdate if disabled', () => {
      const go = new GameObject();
      const behaviour = go.AddComponent(TestBehaviour);
      behaviour.enabled = false;

      manager.processAwake();
      manager.processFixedUpdate();
      expect(behaviour.fixedUpdateCount).toBe(0);
    });
  });

  describe('OnEnable/OnDisable', () => {
    it('should call OnEnable after Awake', () => {
      const go = new GameObject();
      const behaviour = go.AddComponent(TestBehaviour);

      manager.processAwake();
      expect(behaviour.enableCount).toBe(1);
    });

    it('should call OnDisable when disabled', () => {
      const go = new GameObject();
      const behaviour = go.AddComponent(TestBehaviour);

      manager.processAwake();
      behaviour.enabled = false;
      expect(behaviour.disableCount).toBe(1);
    });

    it('should call OnEnable when re-enabled', () => {
      const go = new GameObject();
      const behaviour = go.AddComponent(TestBehaviour);

      manager.processAwake();
      behaviour.enabled = false;
      behaviour.enabled = true;
      expect(behaviour.enableCount).toBe(2);
    });

    it('should toggle OnEnable/OnDisable correctly', () => {
      const go = new GameObject();
      const behaviour = go.AddComponent(TestBehaviour);

      manager.processAwake();
      behaviour.enabled = false;
      behaviour.enabled = true;
      behaviour.enabled = false;

      expect(behaviour.enableCount).toBe(2);
      expect(behaviour.disableCount).toBe(2);
    });
  });

  describe('lifecycle order', () => {
    it('should execute lifecycle methods in correct order', () => {
      const go = new GameObject();
      const behaviour = go.AddComponent(TestBehaviour);

      manager.processAwake();
      manager.processStart();
      manager.processUpdate();
      manager.processLateUpdate();

      expect(behaviour.executionOrder).toEqual([
        'Awake',
        'OnEnable',
        'Start',
        'Update',
        'LateUpdate',
      ]);
    });

    it('should call all Awake before any Start', () => {
      const go1 = new GameObject();
      const go2 = new GameObject();
      const b1 = go1.AddComponent(TestBehaviour);
      const b2 = go2.AddComponent(AnotherBehaviour);

      manager.processAwake();
      manager.processStart();

      // Both should have Awake called before any Start
      expect(b1.executionOrder[0]).toBe('Awake');
      expect(b2.executionOrder[0]).toBe('Awake');
      expect(b1.executionOrder.indexOf('Start')).toBeGreaterThan(0);
      expect(b2.executionOrder.indexOf('Start')).toBeGreaterThan(0);
    });

    it('should execute Update before LateUpdate', () => {
      const go = new GameObject();
      const behaviour = go.AddComponent(TestBehaviour);

      manager.processAwake();
      manager.processUpdate();
      manager.processLateUpdate();

      const updateIndex = behaviour.executionOrder.indexOf('Update');
      const lateUpdateIndex = behaviour.executionOrder.indexOf('LateUpdate');
      expect(updateIndex).toBeLessThan(lateUpdateIndex);
    });
  });

  describe('multiple behaviours', () => {
    it('should handle multiple behaviours on same GameObject', () => {
      const go = new GameObject();
      const b1 = go.AddComponent(TestBehaviour);
      const b2 = go.AddComponent(AnotherBehaviour);

      manager.processAwake();
      manager.processUpdate();

      expect(b1.awakeCount).toBe(1);
      expect(b2.executionOrder).toContain('Awake');
      expect(b1.updateCount).toBe(1);
      expect(b2.executionOrder).toContain('Update');
    });

    it('should handle multiple GameObjects with behaviours', () => {
      const go1 = new GameObject();
      const go2 = new GameObject();
      const b1 = go1.AddComponent(TestBehaviour);
      const b2 = go2.AddComponent(TestBehaviour);

      manager.processAwake();
      manager.processUpdate();

      expect(b1.awakeCount).toBe(1);
      expect(b2.awakeCount).toBe(1);
      expect(b1.updateCount).toBe(1);
      expect(b2.updateCount).toBe(1);
    });

    it('should respect enabled state for each behaviour independently', () => {
      const go = new GameObject();
      const b1 = go.AddComponent(TestBehaviour);
      const b2 = go.AddComponent(AnotherBehaviour);

      manager.processAwake();
      b1.enabled = false;
      manager.processUpdate();

      expect(b1.updateCount).toBe(0);
      expect(b2.executionOrder).toContain('Update');
    });
  });

  describe('coroutines', () => {
    it('should have StartCoroutine method', () => {
      const go = new GameObject();
      const behaviour = go.AddComponent(TestBehaviour);
      expect(typeof behaviour.StartCoroutine).toBe('function');
    });

    it('should have StopCoroutine method', () => {
      const go = new GameObject();
      const behaviour = go.AddComponent(TestBehaviour);
      expect(typeof behaviour.StopCoroutine).toBe('function');
    });

    it('should have StopAllCoroutines method', () => {
      const go = new GameObject();
      const behaviour = go.AddComponent(TestBehaviour);
      expect(typeof behaviour.StopAllCoroutines).toBe('function');
    });
  });

  describe('LifecycleManager integration', () => {
    it('should register behaviour when added to GameObject', () => {
      const initialCount = manager._getNewBehaviourCount();
      const go = new GameObject();
      go.AddComponent(TestBehaviour);
      expect(manager._getNewBehaviourCount()).toBe(initialCount + 1);
    });

    it('should move from new to active after Awake', () => {
      const go = new GameObject();
      go.AddComponent(TestBehaviour);
      expect(manager._getNewBehaviourCount()).toBe(1);
      expect(manager._getBehaviourCount()).toBe(0);

      manager.processAwake();
      expect(manager._getNewBehaviourCount()).toBe(0);
      expect(manager._getBehaviourCount()).toBe(1);
    });

    it('should handle behaviours added during Awake', () => {
      class SpawnerBehaviour extends TestBehaviour {
        protected override Awake(): void {
          super.Awake();
          // Add another behaviour during Awake
          this.gameObject.AddComponent(AnotherBehaviour);
        }
      }

      const go = new GameObject();
      go.AddComponent(SpawnerBehaviour);

      manager.processAwake();
      // The new behaviour should be in the new list
      expect(manager._getNewBehaviourCount()).toBe(1);
    });
  });

  describe('edge cases', () => {
    it('should handle GameObject deactivation', () => {
      const go = new GameObject();
      const behaviour = go.AddComponent(TestBehaviour);

      manager.processAwake();
      go.SetActive(false);
      manager.processUpdate();

      expect(behaviour.updateCount).toBe(0);
    });

    it('should handle behaviour being disabled during Update', () => {
      class DisablerBehaviour extends TestBehaviour {
        protected override Update(): void {
          super.Update();
          if (this.updateCount === 1) {
            this.enabled = false;
          }
        }
      }

      const go = new GameObject();
      const behaviour = go.AddComponent(DisablerBehaviour);

      manager.processAwake();
      manager.processUpdate();
      manager.processUpdate();

      expect(behaviour.updateCount).toBe(1);
    });

    it('should not crash if behaviour has no lifecycle methods', () => {
      class EmptyBehaviour extends MonoBehaviour {}

      const go = new GameObject();
      go.AddComponent(EmptyBehaviour);

      expect(() => {
        manager.processAwake();
        manager.processStart();
        manager.processUpdate();
        manager.processLateUpdate();
        manager.processFixedUpdate();
      }).not.toThrow();
    });
  });
});
