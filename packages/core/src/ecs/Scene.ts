import { GameObject } from './GameObject';
import { GUIDResolver } from '../serialization/GUIDResolver';

/**
 * Runtime representation of a scene.
 *
 * A scene contains GameObjects that form the environment and gameplay.
 * Scenes can be loaded and unloaded at runtime.
 *
 * @example
 * ```typescript
 * const scene = SceneManager.GetActiveScene();
 * console.log(`Current scene: ${scene.name}`);
 * console.log(`Root GameObjects: ${scene.rootCount}`);
 * ```
 */
export class Scene {
  private _name: string;
  private _path: string;
  private _buildIndex: number;
  private _isLoaded: boolean;
  private _rootGameObjects: GameObject[] = [];

  /**
   * Creates a new Scene.
   * @param name - The name of the scene
   * @param path - The path to the scene file
   * @param buildIndex - The index of the scene in build settings
   * @internal
   */
  constructor(name: string, path: string = '', buildIndex: number = -1) {
    this._name = name;
    this._path = path;
    this._buildIndex = buildIndex;
    this._isLoaded = false;
  }

  // ==================== Properties ====================

  /**
   * The name of the scene.
   */
  public get name(): string {
    return this._name;
  }

  /**
   * The path to the scene file.
   */
  public get path(): string {
    return this._path;
  }

  /**
   * The index of the scene in build settings.
   * Returns -1 if the scene was not in build settings.
   */
  public get buildIndex(): number {
    return this._buildIndex;
  }

  /**
   * Whether the scene is loaded.
   */
  public get isLoaded(): boolean {
    return this._isLoaded;
  }

  /**
   * The number of root GameObjects in the scene.
   */
  public get rootCount(): number {
    return this._rootGameObjects.length;
  }

  // ==================== Methods ====================

  /**
   * Returns all root GameObjects in the scene.
   * @returns Array of root GameObjects
   */
  public GetRootGameObjects(): GameObject[] {
    return [...this._rootGameObjects];
  }

  // ==================== Internal Methods ====================

  /**
   * Marks the scene as loaded.
   * @internal
   */
  public _setLoaded(loaded: boolean): void {
    this._isLoaded = loaded;
  }

  /**
   * Adds a root GameObject to the scene.
   * @param gameObject - The GameObject to add
   * @internal
   */
  public _addRootGameObject(gameObject: GameObject): void {
    if (!this._rootGameObjects.includes(gameObject)) {
      this._rootGameObjects.push(gameObject);
    }
  }

  /**
   * Removes a root GameObject from the scene.
   * @param gameObject - The GameObject to remove
   * @internal
   */
  public _removeRootGameObject(gameObject: GameObject): void {
    const index = this._rootGameObjects.indexOf(gameObject);
    if (index !== -1) {
      this._rootGameObjects.splice(index, 1);
    }
  }

  /**
   * Clears all root GameObjects from the scene.
   * @internal
   */
  public _clearRootGameObjects(): void {
    this._rootGameObjects = [];
  }

  // ==================== Serialization ====================

  /**
   * Serializes this Scene to JSON.
   * @returns Scene data including all GameObjects in hierarchy
   */
  public toJSON(): any {
    // Collect all objects in hierarchy
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

    for (const root of this._rootGameObjects) {
      collectObjects(root);
    }

    return {
      version: '1.0',
      name: this._name,
      path: this._path,
      buildIndex: this._buildIndex,
      rootGameObjects: this._rootGameObjects.map((go) => go.guid.value),
      objects: allObjects,
    };
  }

  /**
   * Deserializes a Scene from JSON.
   * @param json - Serialized scene data
   * @returns Scene instance
   */
  public static fromJSON(json: any): Scene {
    const scene = new Scene(json.name, json.path, json.buildIndex);
    const resolver = new GUIDResolver();

    // Phase 1: Create all objects
    for (const objJson of json.objects) {
      GameObject.fromJSON(objJson, resolver);
    }

    // Phase 2: Resolve all GUID references
    resolver.resolve();

    // Restore root GameObjects
    for (const guidStr of json.rootGameObjects) {
      const go = resolver.get(guidStr) as GameObject;
      if (go) {
        scene._addRootGameObject(go);
      }
    }

    scene._setLoaded(true);
    return scene;
  }
}
