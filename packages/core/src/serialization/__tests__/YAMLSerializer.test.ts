import { describe, it, expect, beforeEach } from 'vitest';
import { YAMLSerializer } from '../YAMLSerializer';
import { JSONSerializer } from '../JSONSerializer';
import { Scene } from '../../ecs/Scene';
import { GameObject } from '../../ecs/GameObject';
import { MonoBehaviour } from '../../ecs/MonoBehaviour';
import { Vector3 } from '../../math/Vector3';
import { ComponentRegistry } from '../ComponentRegistry';
import type { GUIDResolver } from '../GUIDResolver';
import { GUID } from '../../ecs/GUID';

// Custom test component for serialization tests
class HealthComponent extends MonoBehaviour {
  public health: number = 100;
  public maxHealth: number = 100;

  protected override serializeFields(): any {
    return {
      health: this.health,
      maxHealth: this.maxHealth,
    };
  }

  protected override deserializeFields(json: any): void {
    this.health = json.health;
    this.maxHealth = json.maxHealth;
  }

  public override toJSON(): any {
    return {
      ...super.toJSON(),
      type: 'HealthComponent',
      ...this.serializeFields(),
    };
  }

  public static override fromJSON(json: any, resolver: GUIDResolver): HealthComponent {
    const comp = new HealthComponent();
    (comp as any)._guid = GUID.fromJSON(json.guid);
    resolver.register(comp.guid, comp);

    (comp as any)._enabled = json.enabled;
    comp.deserializeFields(json);

    resolver.addReference(comp, '_gameObject', json.gameObject);
    return comp;
  }
}

describe('YAMLSerializer', () => {
  beforeEach(() => {
    // Clear GameObject registry for clean tests
    (GameObject as any)._clearAllGameObjects();
    // Register custom component
    ComponentRegistry.register('HealthComponent', HealthComponent);
  });

  describe('Scene Serialization', () => {
    it('should serialize an empty scene', () => {
      const scene = new Scene('EmptyScene', 'Assets/Scenes/Empty.unity', 0);
      const yaml = YAMLSerializer.serialize(scene);

      expect(yaml).toBeDefined();
      expect(yaml).toContain('name: EmptyScene');
      expect(yaml).toContain('version: ');
      expect(yaml).toContain('rootGameObjects: []');
      expect(yaml).toContain('objects: []');
    });

    it('should serialize a scene with one GameObject', () => {
      const scene = new Scene('SimpleScene', 'Assets/Scenes/Simple.unity', 0);
      const go = new GameObject('Player');
      scene._addRootGameObject(go);
      scene._setLoaded(true);

      const yaml = YAMLSerializer.serialize(scene);

      expect(yaml).toContain('name: SimpleScene');
      expect(yaml).toContain('Player');
      expect(yaml).toContain('Transform');
    });

    it('should serialize a scene with hierarchy', () => {
      const scene = new Scene('HierarchyScene', 'Assets/Scenes/Hierarchy.unity', 1);
      const parent = new GameObject('Parent');
      const child1 = new GameObject('Child1');
      const child2 = new GameObject('Child2');

      child1.transform.SetParent(parent.transform);
      child2.transform.SetParent(parent.transform);

      scene._addRootGameObject(parent);
      scene._setLoaded(true);

      const yaml = YAMLSerializer.serialize(scene);

      expect(yaml).toContain('Parent');
      expect(yaml).toContain('Child1');
      expect(yaml).toContain('Child2');
    });

    it('should use YAML format with proper structure', () => {
      const scene = new Scene('YAMLScene');
      const go = new GameObject('TestGO');
      scene._addRootGameObject(go);
      const yaml = YAMLSerializer.serialize(scene);

      // YAML has key: value pairs
      expect(yaml).toMatch(/\w+:\s+/);
      // YAML has newlines
      expect(yaml).toContain('\n');
      // YAML structure includes objects array
      expect(yaml).toContain('objects:');
    });

    it('should not have JSON-style braces', () => {
      const scene = new Scene('NoJSON');
      const yaml = YAMLSerializer.serialize(scene);

      // YAML doesn't use { } for objects (except in flow style which we disable)
      const braceCount = (yaml.match(/{/g) || []).length;
      expect(braceCount).toBe(0);
    });
  });

  describe('Scene Deserialization', () => {
    it('should deserialize an empty scene', () => {
      const original = new Scene('EmptyScene', 'Assets/Scenes/Empty.unity', 0);
      const yaml = YAMLSerializer.serialize(original);
      const deserialized = YAMLSerializer.deserialize(yaml);

      expect(deserialized.name).toBe('EmptyScene');
      expect(deserialized.path).toBe('Assets/Scenes/Empty.unity');
      expect(deserialized.buildIndex).toBe(0);
      expect(deserialized.rootCount).toBe(0);
      expect(deserialized.isLoaded).toBe(true);
    });

    it('should deserialize a scene with one GameObject', () => {
      const original = new Scene('SimpleScene');
      const go = new GameObject('Player');
      go.tag = 'Player';
      original._addRootGameObject(go);

      const yaml = YAMLSerializer.serialize(original);
      const deserialized = YAMLSerializer.deserialize(yaml);

      expect(deserialized.rootCount).toBe(1);
      const roots = deserialized.GetRootGameObjects();
      expect(roots[0].name).toBe('Player');
      expect(roots[0].tag).toBe('Player');
    });

    it('should deserialize GameObject hierarchy', () => {
      const original = new Scene('HierarchyScene');
      const parent = new GameObject('Parent');
      const child1 = new GameObject('Child1');
      const child2 = new GameObject('Child2');

      child1.transform.SetParent(parent.transform);
      child2.transform.SetParent(parent.transform);

      original._addRootGameObject(parent);

      const yaml = YAMLSerializer.serialize(original);
      const deserialized = YAMLSerializer.deserialize(yaml);

      const roots = deserialized.GetRootGameObjects();
      expect(roots.length).toBe(1);
      expect(roots[0].name).toBe('Parent');
      expect(roots[0].transform.childCount).toBe(2);
      expect(roots[0].transform.GetChild(0).gameObject.name).toBe('Child1');
      expect(roots[0].transform.GetChild(1).gameObject.name).toBe('Child2');
    });

    it('should preserve Transform positions', () => {
      const original = new Scene('TransformScene');
      const go = new GameObject('Positioned');
      go.transform.position = new Vector3(5, 10, 15);
      go.transform.localScale = new Vector3(2, 2, 2);
      original._addRootGameObject(go);

      const yaml = YAMLSerializer.serialize(original);
      const deserialized = YAMLSerializer.deserialize(yaml);

      const roots = deserialized.GetRootGameObjects();
      expect(roots[0].transform.position.x).toBeCloseTo(5);
      expect(roots[0].transform.position.y).toBeCloseTo(10);
      expect(roots[0].transform.position.z).toBeCloseTo(15);
      expect(roots[0].transform.localScale.x).toBeCloseTo(2);
      expect(roots[0].transform.localScale.y).toBeCloseTo(2);
      expect(roots[0].transform.localScale.z).toBeCloseTo(2);
    });

    it('should preserve active states', () => {
      const original = new Scene('ActiveScene');
      const active = new GameObject('Active');
      const inactive = new GameObject('Inactive');
      inactive.SetActive(false);
      original._addRootGameObject(active);
      original._addRootGameObject(inactive);

      const yaml = YAMLSerializer.serialize(original);
      const deserialized = YAMLSerializer.deserialize(yaml);

      const roots = deserialized.GetRootGameObjects();
      const activeGo = roots.find((go) => go.name === 'Active');
      const inactiveGo = roots.find((go) => go.name === 'Inactive');

      expect(activeGo?.activeSelf).toBe(true);
      expect(inactiveGo?.activeSelf).toBe(false);
    });

    it('should throw error for invalid YAML', () => {
      expect(() => {
        YAMLSerializer.deserialize('invalid: yaml: [unclosed');
      }).toThrow('Failed to parse YAML');
    });

    it('should throw error for non-object YAML', () => {
      expect(() => {
        YAMLSerializer.deserialize('just a string');
      }).toThrow('Invalid YAML: expected object');
    });

    it('should throw error for missing version', () => {
      const invalidYaml = 'name: Test';
      expect(() => {
        YAMLSerializer.deserialize(invalidYaml);
      }).toThrow('missing version field');
    });

    it('should throw error for unsupported version', () => {
      const invalidYaml = 'version: "2.0"\nname: Test';
      expect(() => {
        YAMLSerializer.deserialize(invalidYaml);
      }).toThrow('Unsupported scene version: 2.0');
    });
  });

  describe('GameObject Serialization', () => {
    it('should serialize a single GameObject', () => {
      const go = new GameObject('TestObject');
      const yaml = YAMLSerializer.serializeGameObject(go);

      expect(yaml).toContain('TestObject');
      expect(yaml).toContain('Transform');
      expect(yaml).toContain('version: ');
      expect(yaml).toContain('type: GameObject');
    });

    it('should serialize GameObject with children', () => {
      const parent = new GameObject('Parent');
      const child = new GameObject('Child');
      child.transform.SetParent(parent.transform);

      const yaml = YAMLSerializer.serializeGameObject(parent);

      expect(yaml).toContain('Parent');
      expect(yaml).toContain('Child');
    });

    it('should serialize with custom component', () => {
      const go = new GameObject('Player');
      const health = go.AddComponent(HealthComponent);
      health.health = 75;
      health.maxHealth = 100;

      const yaml = YAMLSerializer.serializeGameObject(go);

      expect(yaml).toContain('HealthComponent');
      expect(yaml).toContain('health: 75');
      expect(yaml).toContain('maxHealth: 100');
    });
  });

  describe('GameObject Deserialization', () => {
    it('should deserialize a single GameObject', () => {
      const original = new GameObject('TestObject');
      original.tag = 'Enemy';
      const yaml = YAMLSerializer.serializeGameObject(original);
      const deserialized = YAMLSerializer.deserializeGameObject(yaml);

      expect(deserialized.name).toBe('TestObject');
      expect(deserialized.tag).toBe('Enemy');
    });

    it('should deserialize GameObject with children', () => {
      const parent = new GameObject('Parent');
      const child1 = new GameObject('Child1');
      const child2 = new GameObject('Child2');
      child1.transform.SetParent(parent.transform);
      child2.transform.SetParent(parent.transform);

      const yaml = YAMLSerializer.serializeGameObject(parent);
      const deserialized = YAMLSerializer.deserializeGameObject(yaml);

      expect(deserialized.name).toBe('Parent');
      expect(deserialized.transform.childCount).toBe(2);
      expect(deserialized.transform.GetChild(0).gameObject.name).toBe('Child1');
      expect(deserialized.transform.GetChild(1).gameObject.name).toBe('Child2');
    });

    it('should deserialize custom component', () => {
      const original = new GameObject('Player');
      const health = original.AddComponent(HealthComponent);
      health.health = 75;
      health.maxHealth = 100;

      const yaml = YAMLSerializer.serializeGameObject(original);
      const deserialized = YAMLSerializer.deserializeGameObject(yaml);

      const deserializedHealth = deserialized.GetComponent(HealthComponent);
      expect(deserializedHealth).not.toBeNull();
      expect(deserializedHealth?.health).toBe(75);
      expect(deserializedHealth?.maxHealth).toBe(100);
    });

    it('should throw error for invalid YAML', () => {
      expect(() => {
        YAMLSerializer.deserializeGameObject('invalid: yaml: [unclosed');
      }).toThrow('Failed to parse YAML');
    });

    it('should throw error for missing version', () => {
      const invalidYaml = 'type: GameObject';
      expect(() => {
        YAMLSerializer.deserializeGameObject(invalidYaml);
      }).toThrow('missing version field');
    });

    it('should throw error for unsupported version', () => {
      const invalidYaml = 'version: "2.0"\ntype: GameObject';
      expect(() => {
        YAMLSerializer.deserializeGameObject(invalidYaml);
      }).toThrow('Unsupported GameObject version: 2.0');
    });

    it('should throw error for wrong data type', () => {
      const invalidYaml = 'version: "1.0"\ntype: Scene';
      expect(() => {
        YAMLSerializer.deserializeGameObject(invalidYaml);
      }).toThrow("Invalid data type: expected 'GameObject', got 'Scene'");
    });
  });

  describe('Format Equivalence', () => {
    it('should produce equivalent scenes when using JSON or YAML', () => {
      const original = new Scene('CrossFormat');
      const go = new GameObject('TestGO');
      go.tag = 'Test';
      go.transform.position = new Vector3(1, 2, 3);
      original._addRootGameObject(go);

      // Serialize and deserialize with JSON
      const json = JSONSerializer.serialize(original);
      const jsonDeserialized = JSONSerializer.deserialize(json);

      // Serialize and deserialize with YAML
      const yaml = YAMLSerializer.serialize(original);
      const yamlDeserialized = YAMLSerializer.deserialize(yaml);

      // Both should produce equivalent results
      expect(yamlDeserialized.name).toBe(jsonDeserialized.name);
      expect(yamlDeserialized.rootCount).toBe(jsonDeserialized.rootCount);
      expect(yamlDeserialized.path).toBe(jsonDeserialized.path);
      expect(yamlDeserialized.buildIndex).toBe(jsonDeserialized.buildIndex);

      const yamlRoots = yamlDeserialized.GetRootGameObjects();
      const jsonRoots = jsonDeserialized.GetRootGameObjects();
      expect(yamlRoots[0].name).toBe(jsonRoots[0].name);
      expect(yamlRoots[0].tag).toBe(jsonRoots[0].tag);
    });

    it('should produce equivalent GameObjects when using JSON or YAML', () => {
      const original = new GameObject('CrossGO');
      original.tag = 'Player';
      original.transform.position = new Vector3(5, 10, 15);
      const child = new GameObject('Child');
      child.transform.SetParent(original.transform);

      // Serialize and deserialize with JSON
      const json = JSONSerializer.serializeGameObject(original);
      const jsonDeserialized = JSONSerializer.deserializeGameObject(json);

      // Serialize and deserialize with YAML
      const yaml = YAMLSerializer.serializeGameObject(original);
      const yamlDeserialized = YAMLSerializer.deserializeGameObject(yaml);

      // Both should produce equivalent results
      expect(yamlDeserialized.name).toBe(jsonDeserialized.name);
      expect(yamlDeserialized.tag).toBe(jsonDeserialized.tag);
      expect(yamlDeserialized.transform.childCount).toBe(
        jsonDeserialized.transform.childCount
      );
      expect(yamlDeserialized.transform.position.x).toBeCloseTo(
        jsonDeserialized.transform.position.x
      );
    });
  });

  describe('Round-trip Tests', () => {
    it('should maintain scene fidelity through round-trip', () => {
      const original = new Scene('RoundTripScene', 'Assets/Test.unity', 5);
      const parent = new GameObject('Parent');
      const child = new GameObject('Child');
      child.transform.SetParent(parent.transform);
      child.transform.localPosition = new Vector3(1, 2, 3);
      parent.tag = 'Important';
      original._addRootGameObject(parent);

      const yaml = YAMLSerializer.serialize(original);
      const deserialized = YAMLSerializer.deserialize(yaml);

      expect(deserialized.name).toBe(original.name);
      expect(deserialized.path).toBe(original.path);
      expect(deserialized.buildIndex).toBe(original.buildIndex);
      expect(deserialized.rootCount).toBe(original.rootCount);

      const roots = deserialized.GetRootGameObjects();
      expect(roots[0].tag).toBe('Important');
      expect(roots[0].transform.childCount).toBe(1);
      expect(roots[0].transform.GetChild(0).localPosition.x).toBeCloseTo(1);
      expect(roots[0].transform.GetChild(0).localPosition.y).toBeCloseTo(2);
      expect(roots[0].transform.GetChild(0).localPosition.z).toBeCloseTo(3);
    });

    it('should maintain GameObject fidelity through round-trip', () => {
      const original = new GameObject('RoundTrip');
      original.tag = 'Player';
      original.transform.position = new Vector3(10, 20, 30);
      const child = new GameObject('Weapon');
      child.transform.SetParent(original.transform);

      const yaml = YAMLSerializer.serializeGameObject(original);
      const deserialized = YAMLSerializer.deserializeGameObject(yaml);

      expect(deserialized.name).toBe(original.name);
      expect(deserialized.tag).toBe(original.tag);
      expect(deserialized.transform.position.x).toBeCloseTo(10);
      expect(deserialized.transform.position.y).toBeCloseTo(20);
      expect(deserialized.transform.position.z).toBeCloseTo(30);
      expect(deserialized.transform.childCount).toBe(1);
      expect(deserialized.transform.GetChild(0).gameObject.name).toBe('Weapon');
    });

    it('should maintain deep hierarchy through round-trip', () => {
      const root = new GameObject('Root');
      const level1 = new GameObject('Level1');
      const level2 = new GameObject('Level2');
      const level3 = new GameObject('Level3');

      level1.transform.SetParent(root.transform);
      level2.transform.SetParent(level1.transform);
      level3.transform.SetParent(level2.transform);

      const yaml = YAMLSerializer.serializeGameObject(root);
      const deserialized = YAMLSerializer.deserializeGameObject(yaml);

      expect(deserialized.transform.childCount).toBe(1);
      const l1 = deserialized.transform.GetChild(0);
      expect(l1.gameObject.name).toBe('Level1');
      expect(l1.childCount).toBe(1);
      const l2 = l1.GetChild(0);
      expect(l2.gameObject.name).toBe('Level2');
      expect(l2.childCount).toBe(1);
      const l3 = l2.GetChild(0);
      expect(l3.gameObject.name).toBe('Level3');
      expect(l3.childCount).toBe(0);
    });
  });
});
