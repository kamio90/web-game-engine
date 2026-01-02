import { Object as UnityObject } from './Object';
import { Component } from './Component';
import { Transform } from './Transform';
import { GUID } from './GUID';
import { ComponentRegistry } from '../serialization/ComponentRegistry';
import type { GUIDResolver } from '../serialization/GUIDResolver';

/**
 * Base class for all entities in scenes.
 *
 * GameObject is the fundamental object in Unity scenes, representing entities.
 * Every GameObject has a Transform component and can have additional components
 * attached to add functionality.
 *
 * @example
 * ```typescript
 * const player = new GameObject("Player");
 * player.tag = "Player";
 *
 * // Every GameObject has a transform
 * player.transform.position = new Vector3(0, 1, 0);
 *
 * // Add components
 * const health = player.AddComponent(HealthComponent);
 * const renderer = player.AddComponent(MeshRenderer);
 * ```
 */
export class GameObject extends UnityObject {
  private static _allGameObjects: Set<GameObject> = new Set();

  private _components: Map<Function, Component[]> = new Map();
  private _transform!: Transform;
  private _activeSelf: boolean = true;
  private _tag: string = 'Untagged';

  /**
   * Creates a new GameObject.
   * @param name - The name of the GameObject
   */
  constructor(name: string = 'GameObject') {
    super(name);
    const ObjectClass = this.constructor as typeof GameObject;
    ObjectClass._allGameObjects.add(this);

    // Every GameObject must have a Transform
    this._transform = this.AddComponent(Transform);
  }

  // ==================== Properties ====================

  /**
   * The Transform attached to this GameObject.
   * Every GameObject has exactly one Transform.
   */
  public get transform(): Transform {
    return this._transform;
  }

  /**
   * The local active state of this GameObject.
   * This does not consider parent hierarchy.
   */
  public get activeSelf(): boolean {
    return this._activeSelf;
  }

  /**
   * The active state of this GameObject considering parent hierarchy.
   * A GameObject is only active in hierarchy if both it and all its parents are active.
   */
  public get activeInHierarchy(): boolean {
    if (!this._activeSelf) {
      return false;
    }

    // Check parent hierarchy (only if transform is initialized)
    if (!this._transform) {
      return this._activeSelf;
    }

    let current = this._transform.parent;
    while (current !== null) {
      if (!current.gameObject.activeSelf) {
        return false;
      }
      current = current.parent;
    }

    return true;
  }

  /**
   * The tag of this GameObject.
   */
  public get tag(): string {
    return this._tag;
  }

  public set tag(value: string) {
    this._tag = value;
  }

  // ==================== Activation ====================

  /**
   * Activates or deactivates the GameObject.
   * @param value - True to activate, false to deactivate
   */
  public SetActive(value: boolean): void {
    if (this._activeSelf === value) {
      return;
    }

    this._activeSelf = value;
    this._onActiveChanged();
  }

  /**
   * Called when the active state changes.
   * Notifies all children of the change.
   * @internal
   */
  public _onActiveChanged(): void {
    // Propagate to children
    for (let i = 0; i < this._transform.childCount; i++) {
      const child = this._transform.GetChild(i);
      child.gameObject._onActiveChanged();
    }

    // Notify components (OnEnable/OnDisable would be called here in full implementation)
  }

  // ==================== Component System ====================

  /**
   * Adds a component of the specified type to the GameObject.
   * @param type - The type of component to add
   * @returns The newly added component
   */
  public AddComponent<T extends Component>(type: new (...args: any[]) => T): T {
    const component = new type();
    component._setGameObject(this);

    if (!this._components.has(type)) {
      this._components.set(type, []);
    }
    this._components.get(type)!.push(component);

    // Call lifecycle hook if GameObject is active
    if (this.activeInHierarchy) {
      (component as any)._onEnable();
    }

    return component;
  }

  /**
   * Gets the first component of the specified type.
   * @param type - The type of component to retrieve
   * @returns The component if found, null otherwise
   */
  public GetComponent<T extends Component>(
    type: new (...args: any[]) => T
  ): T | null {
    const components = this._components.get(type);
    return (components?.[0] as T) ?? null;
  }

  /**
   * Gets all components of the specified type.
   * @param type - The type of components to retrieve
   * @returns Array of components of the specified type
   */
  public GetComponents<T extends Component>(
    type: new (...args: any[]) => T
  ): T[] {
    return (this._components.get(type) as T[]) ?? [];
  }

  /**
   * Gets the first component of the specified type in this GameObject or any of its children.
   * @param type - The type of component to retrieve
   * @param includeInactive - Should inactive GameObjects be included?
   * @returns The component if found, null otherwise
   */
  public GetComponentInChildren<T extends Component>(
    type: new (...args: any[]) => T,
    includeInactive: boolean = false
  ): T | null {
    // Check self first
    if (includeInactive || this.activeInHierarchy) {
      const component = this.GetComponent(type);
      if (component !== null) {
        return component;
      }
    }

    // Check children recursively
    for (let i = 0; i < this._transform.childCount; i++) {
      const child = this._transform.GetChild(i);
      const component = child.gameObject.GetComponentInChildren(
        type,
        includeInactive
      );
      if (component !== null) {
        return component;
      }
    }

    return null;
  }

  /**
   * Gets all components of the specified type in this GameObject or any of its children.
   * @param type - The type of components to retrieve
   * @param includeInactive - Should inactive GameObjects be included?
   * @returns Array of components found
   */
  public GetComponentsInChildren<T extends Component>(
    type: new (...args: any[]) => T,
    includeInactive: boolean = false
  ): T[] {
    const results: T[] = [];

    // Add from self
    if (includeInactive || this.activeInHierarchy) {
      results.push(...this.GetComponents(type));
    }

    // Add from children recursively
    for (let i = 0; i < this._transform.childCount; i++) {
      const child = this._transform.GetChild(i);
      results.push(
        ...child.gameObject.GetComponentsInChildren(type, includeInactive)
      );
    }

    return results;
  }

  /**
   * Gets the first component of the specified type in this GameObject or any of its parents.
   * @param type - The type of component to retrieve
   * @returns The component if found, null otherwise
   */
  public GetComponentInParent<T extends Component>(
    type: new (...args: any[]) => T
  ): T | null {
    // Check self first
    const component = this.GetComponent(type);
    if (component !== null) {
      return component;
    }

    // Check parent
    if (this._transform.parent !== null) {
      return this._transform.parent.gameObject.GetComponentInParent(type);
    }

    return null;
  }

  /**
   * Gets all components of the specified type in this GameObject or any of its parents.
   * @param type - The type of components to retrieve
   * @returns Array of components found
   */
  public GetComponentsInParent<T extends Component>(
    type: new (...args: any[]) => T
  ): T[] {
    const results: T[] = [];

    // Add from self
    results.push(...this.GetComponents(type));

    // Add from parent
    if (this._transform.parent !== null) {
      results.push(
        ...this._transform.parent.gameObject.GetComponentsInParent(type)
      );
    }

    return results;
  }

  // ==================== Tag System ====================

  /**
   * Checks if the GameObject has the specified tag.
   * @param tag - The tag to compare
   * @returns True if the GameObject has this tag
   */
  public CompareTag(tag: string): boolean {
    return this._tag === tag;
  }

  // ==================== Static Methods ====================

  /**
   * Finds a GameObject by name.
   * @param name - Name of the GameObject to find
   * @returns The GameObject if found, null otherwise
   */
  public static Find(name: string): GameObject | null {
    for (const go of this._allGameObjects) {
      if (go.name === name && !go.isDestroyed) {
        return go;
      }
    }
    return null;
  }

  /**
   * Returns the first active GameObject tagged with the specified tag.
   * @param tag - Tag to search for
   * @returns The GameObject if found, null otherwise
   */
  public static FindWithTag(tag: string): GameObject | null {
    for (const go of this._allGameObjects) {
      if (go._tag === tag && go.activeInHierarchy && !go.isDestroyed) {
        return go;
      }
    }
    return null;
  }

  /**
   * Returns an array of active GameObjects tagged with the specified tag.
   * @param tag - Tag to search for
   * @returns Array of GameObjects with the specified tag
   */
  public static FindGameObjectsWithTag(tag: string): GameObject[] {
    const results: GameObject[] = [];
    for (const go of this._allGameObjects) {
      if (go._tag === tag && go.activeInHierarchy && !go.isDestroyed) {
        results.push(go);
      }
    }
    return results;
  }

  // ==================== Internal Methods ====================

  /**
   * Called when the GameObject is about to be destroyed.
   * Disables all components before destruction.
   * @internal
   */
  protected override _onDestroy(): void {
    super._onDestroy();

    // Call _onDisable on all components
    for (const compArray of this._components.values()) {
      for (const comp of compArray) {
        (comp as any)._onDisable();
      }
    }
  }

  /**
   * Clears all GameObjects from the registry.
   * Warning: Only use this for testing purposes.
   * @internal
   */
  protected static _clearAllGameObjects(): void {
    this._allGameObjects.clear();
  }

  /**
   * Returns the total number of active GameObjects.
   * @internal
   */
  protected static _getGameObjectCount(): number {
    return this._allGameObjects.size;
  }

  // ==================== Serialization ====================

  /**
   * Serializes this GameObject to JSON.
   * @returns GameObject data including all components
   */
  public override toJSON(): any {
    // Serialize all components
    const components: any[] = [];
    for (const [_type, compArray] of this._components.entries()) {
      for (const comp of compArray) {
        components.push(comp.toJSON());
      }
    }

    return {
      type: 'GameObject',
      guid: this.guid.toJSON(),
      name: this.name,
      activeSelf: this._activeSelf,
      tag: this._tag,
      components,
    };
  }

  /**
   * Deserializes a GameObject from JSON.
   * @param json - Serialized GameObject data
   * @param resolver - GUID resolver for reference resolution
   * @returns GameObject instance
   */
  public static override fromJSON(json: any, resolver: GUIDResolver): GameObject {
    const go = new GameObject(json.name);
    // Replace auto-generated GUID with deserialized one
    (go as any)._guid = GUID.fromJSON(json.guid);

    resolver.register(go.guid, go);

    go._activeSelf = json.activeSelf;
    go._tag = json.tag;

    // Clear auto-created Transform
    go._components.clear();

    // Deserialize components
    for (const compJson of json.components) {
      const typeName = compJson.type;
      const CompClass = ComponentRegistry.get(typeName);

      if (!CompClass) {
        console.warn(`Unknown component type: ${typeName}`);
        continue;
      }

      // Create component using its fromJSON
      const comp = (CompClass as any).fromJSON(compJson, resolver);

      // Add to component map
      if (!go._components.has(CompClass)) {
        go._components.set(CompClass, []);
      }
      go._components.get(CompClass)!.push(comp);

      // Set GameObject reference
      (comp as any)._gameObject = go;

      // Cache transform
      if (comp instanceof Transform) {
        (go as any)._transform = comp;
      }
    }

    return go;
  }
}
