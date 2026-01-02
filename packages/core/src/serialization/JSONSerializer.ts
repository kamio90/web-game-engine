import { Scene } from '../ecs/Scene';
import { GameObject } from '../ecs/GameObject';
import { GUIDResolver } from './GUIDResolver';

/**
 * JSONSerializer provides utilities for serializing and deserializing
 * Scenes and GameObjects to/from JSON format.
 *
 * @example
 * ```typescript
 * // Serialize a scene
 * const scene = SceneManager.GetActiveScene();
 * const json = JSONSerializer.serialize(scene, true); // pretty-print
 * console.log(json);
 *
 * // Deserialize a scene
 * const loadedScene = JSONSerializer.deserialize(json);
 * console.log(loadedScene.name);
 * ```
 */
export class JSONSerializer {
  private static readonly SUPPORTED_VERSION = '1.0';

  /**
   * Serializes a Scene to JSON string.
   * @param scene - The Scene to serialize
   * @param pretty - If true, output will be formatted with indentation
   * @returns JSON string representation of the scene
   */
  public static serialize(scene: Scene, pretty: boolean = false): string {
    const json = scene.toJSON();
    return pretty ? JSON.stringify(json, null, 2) : JSON.stringify(json);
  }

  /**
   * Deserializes a Scene from JSON string.
   * @param json - JSON string containing serialized scene data
   * @returns Deserialized Scene instance
   * @throws Error if JSON is invalid or version is unsupported
   */
  public static deserialize(json: string): Scene {
    let parsed: any;

    try {
      parsed = JSON.parse(json);
    } catch (error) {
      throw new Error(
        `Failed to parse JSON: ${error instanceof Error ? error.message : String(error)}`
      );
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
   * Serializes a GameObject to JSON string.
   * This serializes the GameObject and all its children in the hierarchy.
   * @param gameObject - The GameObject to serialize
   * @param pretty - If true, output will be formatted with indentation
   * @returns JSON string representation of the GameObject
   */
  public static serializeGameObject(
    gameObject: GameObject,
    pretty: boolean = false
  ): string {
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

    return pretty ? JSON.stringify(data, null, 2) : JSON.stringify(data);
  }

  /**
   * Deserializes a GameObject from JSON string.
   * This deserializes the GameObject and all its children in the hierarchy.
   * @param json - JSON string containing serialized GameObject data
   * @returns Deserialized GameObject instance
   * @throws Error if JSON is invalid or version is unsupported
   */
  public static deserializeGameObject(json: string): GameObject {
    let parsed: any;

    try {
      parsed = JSON.parse(json);
    } catch (error) {
      throw new Error(
        `Failed to parse JSON: ${error instanceof Error ? error.message : String(error)}`
      );
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
