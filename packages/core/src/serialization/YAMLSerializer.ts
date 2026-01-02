import * as yaml from 'js-yaml';
import { Scene } from '../ecs/Scene';
import { GameObject } from '../ecs/GameObject';
import { GUIDResolver } from './GUIDResolver';

/**
 * YAMLSerializer provides utilities for serializing and deserializing
 * Scenes and GameObjects to/from YAML format.
 *
 * YAML format is more human-readable than JSON and commonly used in
 * Unity scene files (.unity files).
 *
 * @example
 * ```typescript
 * // Serialize a scene
 * const scene = SceneManager.GetActiveScene();
 * const yamlString = YAMLSerializer.serialize(scene);
 * console.log(yamlString);
 *
 * // Deserialize a scene
 * const loadedScene = YAMLSerializer.deserialize(yamlString);
 * console.log(loadedScene.name);
 * ```
 */
export class YAMLSerializer {
  private static readonly SUPPORTED_VERSION = '1.0';

  /**
   * Serializes a Scene to YAML string.
   * @param scene - The Scene to serialize
   * @returns YAML string representation of the scene
   */
  public static serialize(scene: Scene): string {
    const json = scene.toJSON();
    return yaml.dump(json, {
      indent: 2,
      lineWidth: 120,
      noRefs: true,
      sortKeys: false,
    });
  }

  /**
   * Deserializes a Scene from YAML string.
   * @param yamlStr - YAML string containing serialized scene data
   * @returns Deserialized Scene instance
   * @throws Error if YAML is invalid or version is unsupported
   */
  public static deserialize(yamlStr: string): Scene {
    let parsed: any;

    try {
      parsed = yaml.load(yamlStr);
    } catch (error) {
      throw new Error(
        `Failed to parse YAML: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Invalid YAML: expected object');
    }

    if (!parsed.version) {
      throw new Error('Invalid scene data: missing version field');
    }

    if (parsed.version !== this.SUPPORTED_VERSION) {
      throw new Error(
        `Unsupported scene version: ${parsed.version}. Expected ${this.SUPPORTED_VERSION}`
      );
    }

    return Scene.fromJSON(parsed);
  }

  /**
   * Serializes a GameObject to YAML string.
   * This serializes the GameObject and all its children in the hierarchy.
   * @param gameObject - The GameObject to serialize
   * @returns YAML string representation of the GameObject
   */
  public static serializeGameObject(gameObject: GameObject): string {
    // Collect GameObject and all children
    const allObjects: any[] = [];
    const visited = new Set<GameObject>();

    const collectObjects = (go: GameObject) => {
      if (visited.has(go)) return;
      visited.add(go);
      allObjects.push(go.toJSON());

      // Recursively collect children
      for (let i = 0; i < go.transform.childCount; i++) {
        const child = go.transform.GetChild(i).gameObject as GameObject;
        collectObjects(child);
      }
    };

    collectObjects(gameObject);

    const data = {
      version: this.SUPPORTED_VERSION,
      type: 'GameObject',
      rootObject: gameObject.guid.value,
      objects: allObjects,
    };

    return yaml.dump(data, {
      indent: 2,
      lineWidth: 120,
      noRefs: true,
      sortKeys: false,
    });
  }

  /**
   * Deserializes a GameObject from YAML string.
   * This deserializes the GameObject and all its children in the hierarchy.
   * @param yamlStr - YAML string containing serialized GameObject data
   * @returns Deserialized GameObject instance
   * @throws Error if YAML is invalid or version is unsupported
   */
  public static deserializeGameObject(yamlStr: string): GameObject {
    let parsed: any;

    try {
      parsed = yaml.load(yamlStr);
    } catch (error) {
      throw new Error(
        `Failed to parse YAML: ${error instanceof Error ? error.message : String(error)}`
      );
    }

    if (!parsed || typeof parsed !== 'object') {
      throw new Error('Invalid YAML: expected object');
    }

    if (!parsed.version) {
      throw new Error('Invalid GameObject data: missing version field');
    }

    if (parsed.version !== this.SUPPORTED_VERSION) {
      throw new Error(
        `Unsupported GameObject version: ${parsed.version}. Expected ${this.SUPPORTED_VERSION}`
      );
    }

    if (parsed.type !== 'GameObject') {
      throw new Error(
        `Invalid data type: expected 'GameObject', got '${parsed.type}'`
      );
    }

    const resolver = new GUIDResolver();

    // Phase 1: Create all objects
    for (const objJson of parsed.objects) {
      GameObject.fromJSON(objJson, resolver);
    }

    // Phase 2: Resolve all GUID references
    resolver.resolve();

    // Return the root GameObject
    const rootObject = resolver.get(parsed.rootObject) as GameObject;
    if (!rootObject) {
      throw new Error(`Root GameObject with GUID ${parsed.rootObject} not found`);
    }

    return rootObject;
  }
}
