import { GUID } from './GUID';
import type { GUIDResolver } from '../serialization/GUIDResolver';

/**
 * Base class for all Unity engine objects.
 *
 * Object is the base class for all objects that Unity can reference in the editor.
 * Every object has an instance ID (runtime-only) and a GUID (persistent across sessions).
 *
 * @example
 * ```typescript
 * class MyObject extends Object {
 *   constructor() {
 *     super("MyObject");
 *   }
 * }
 *
 * const obj = new MyObject();
 * console.log(obj.name); // "MyObject"
 * console.log(obj.GetInstanceID()); // Unique runtime ID
 *
 * Object.Destroy(obj); // Mark for destruction
 * ```
 */
class UnityObject {
  private static _nextInstanceId: number = 1;
  private static _instances: Map<number, UnityObject> = new Map();
  private static _destroyQueue: Array<{ obj: UnityObject; time: number }> = [];

  private readonly _instanceId: number;
  private readonly _guid: GUID;
  private _name: string;
  private _destroyed: boolean = false;

  /**
   * Creates a new Object.
   * @param name - The name of the object
   */
  constructor(name: string = 'Object') {
    const ObjectClass = this.constructor as typeof UnityObject;
    this._instanceId = ObjectClass._nextInstanceId++;
    this._guid = GUID.Generate();
    this._name = name;
    ObjectClass._instances.set(this._instanceId, this);
  }

  // ==================== Properties ====================

  /**
   * The name of the object.
   */
  public get name(): string {
    return this._name;
  }

  public set name(value: string) {
    this._name = value;
  }

  /**
   * Whether this object has been destroyed.
   */
  protected get isDestroyed(): boolean {
    return this._destroyed;
  }

  /**
   * The persistent GUID of this object.
   * GUIDs are stable across sessions and used for serialization.
   */
  public get guid(): GUID {
    return this._guid;
  }

  // ==================== Instance Methods ====================

  /**
   * Returns the instance ID of the object.
   * Instance IDs are unique within a session but not persistent across sessions.
   * @returns The instance ID
   */
  public GetInstanceID(): number {
    return this._instanceId;
  }

  /**
   * Returns a string representation of the object.
   * @returns String in format "Name (InstanceID)"
   */
  public toString(): string {
    return `${this._name} (${this._instanceId})`;
  }

  /**
   * Compares this object with another for equality.
   * @param other - Object to compare with
   * @returns True if both objects have the same instance ID
   */
  public equals(other: UnityObject | null): boolean {
    if (other === null) {
      return this._destroyed;
    }
    return this._instanceId === other._instanceId;
  }

  // ==================== Static Methods ====================

  /**
   * Removes an object from the game.
   * The object will be destroyed at the end of the current frame.
   * @param obj - The object to destroy
   * @param t - Optional delay in seconds before destroying the object
   */
  public static Destroy(obj: UnityObject | null, t: number = 0): void {
    if (obj === null || obj._destroyed) {
      return;
    }

    if (t > 0) {
      this._destroyQueue.push({ obj, time: t * 1000 });
      setTimeout(() => {
        this.DestroyImmediate(obj);
      }, t * 1000);
    } else {
      obj._destroyed = true;
    }
  }

  /**
   * Destroys an object immediately.
   * Warning: This can cause issues if other objects still reference this object.
   * Prefer using Destroy() which defers destruction to end of frame.
   * @param obj - The object to destroy
   */
  public static DestroyImmediate(obj: UnityObject | null): void {
    if (obj === null || obj._destroyed) {
      return;
    }

    // Call cleanup hook before destroying
    obj._onDestroy();

    obj._destroyed = true;
    this._instances.delete(obj._instanceId);
  }

  /**
   * Called when the object is about to be destroyed.
   * Override this method in derived classes to add custom cleanup behavior.
   * @internal
   */
  protected _onDestroy(): void {
    // Override in derived classes
  }

  /**
   * Returns the first active loaded object of the specified type.
   * @param type - The type of object to find
   * @returns The object if found, null otherwise
   */
  public static FindObjectOfType<T extends UnityObject>(
    type: new (...args: any[]) => T
  ): T | null {
    for (const obj of this._instances.values()) {
      if (obj instanceof type && !obj._destroyed) {
        return obj as T;
      }
    }
    return null;
  }

  /**
   * Returns all active loaded objects of the specified type.
   * @param type - The type of objects to find
   * @returns Array of objects of the specified type
   */
  public static FindObjectsOfType<T extends UnityObject>(
    type: new (...args: any[]) => T
  ): T[] {
    const results: T[] = [];
    for (const obj of this._instances.values()) {
      if (obj instanceof type && !obj._destroyed) {
        results.push(obj as T);
      }
    }
    return results;
  }

  /**
   * Cleans up all destroyed objects.
   * This is called internally at the end of each frame.
   * @internal
   */
  protected static _cleanupDestroyedObjects(): void {
    const toDelete: number[] = [];
    for (const [id, obj] of this._instances.entries()) {
      if (obj._destroyed) {
        toDelete.push(id);
      }
    }
    for (const id of toDelete) {
      this._instances.delete(id);
    }
  }

  /**
   * Returns the total number of active objects.
   * @internal
   */
  protected static _getObjectCount(): number {
    return this._instances.size;
  }

  /**
   * Clears all objects from the instance registry.
   * Warning: Only use this for testing purposes.
   * @internal
   */
  protected static _clearAllObjects(): void {
    this._instances.clear();
    this._nextInstanceId = 1;
    this._destroyQueue = [];
  }

  // ==================== Serialization ====================

  /**
   * Serializes this Object to JSON.
   * @returns Object data including GUID and name
   */
  public toJSON(): any {
    return {
      type: 'Object',
      guid: this._guid.toJSON(),
      name: this._name,
    };
  }

  /**
   * Deserializes an Object from JSON.
   * @param json - Serialized object data
   * @param resolver - GUID resolver for reference resolution
   * @returns Object instance
   */
  public static fromJSON(json: any, resolver: GUIDResolver): UnityObject {
    const obj = new UnityObject(json.name);
    // Replace auto-generated GUID with deserialized one
    (obj as any)._guid = GUID.fromJSON(json.guid);
    resolver.register(obj._guid, obj);
    return obj;
  }
}

// Export as "Object" to match Unity API
export { UnityObject as Object };
