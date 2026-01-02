import { GUID } from '../ecs/GUID';
import { Object as UnityObject } from '../ecs/Object';

/**
 * Resolves GUID references during deserialization.
 *
 * Uses a two-phase approach to handle circular references:
 * - Phase 1: Create all objects and register them with their GUIDs
 * - Phase 2: Resolve all GUID string references to actual object references
 *
 * This pattern is essential for handling parent-child relationships
 * where objects reference each other circularly.
 *
 * @example
 * ```typescript
 * const resolver = new GUIDResolver();
 *
 * // Phase 1: Create objects and queue references
 * const parent = new GameObject('Parent');
 * const child = new GameObject('Child');
 *
 * resolver.register(parent.guid, parent);
 * resolver.register(child.guid, child);
 *
 * // Queue references (stored as GUID strings)
 * resolver.addReference(child.transform, '_parent', parentGuidString);
 * resolver.addArrayReference(parent.transform, '_children', [childGuidString]);
 *
 * // Phase 2: Resolve all references
 * resolver.resolve();
 *
 * // Now references are connected:
 * // child.transform._parent === parent.transform
 * // parent.transform._children[0] === child.transform
 * ```
 */
export class GUIDResolver {
  private _objects: Map<string, UnityObject> = new Map();
  private _pendingReferences: Array<{
    target: any;
    property: string;
    guidRef: string | null;
  }> = [];
  private _pendingArrayReferences: Array<{
    target: any;
    property: string;
    guidRefs: string[];
  }> = [];

  /**
   * Registers an object with its GUID (Phase 1).
   *
   * @param guid - Object's GUID
   * @param obj - Object instance
   *
   * @example
   * ```typescript
   * const go = new GameObject('Player');
   * resolver.register(go.guid, go);
   * ```
   */
  public register(guid: GUID, obj: UnityObject): void {
    const guidStr = guid.value;

    if (this._objects.has(guidStr)) {
      throw new Error(
        `GUID collision: Object with GUID ${guidStr} already registered`
      );
    }

    this._objects.set(guidStr, obj);
  }

  /**
   * Queues a single reference to resolve later (Phase 1).
   *
   * @param target - Object containing the reference
   * @param property - Property name to set
   * @param guidRef - GUID string to resolve (or null)
   *
   * @example
   * ```typescript
   * // Queue parent reference
   * resolver.addReference(transform, '_parent', parentGuidString);
   *
   * // Queue null reference
   * resolver.addReference(transform, '_parent', null);
   * ```
   */
  public addReference(
    target: any,
    property: string,
    guidRef: string | null
  ): void {
    this._pendingReferences.push({
      target,
      property,
      guidRef,
    });
  }

  /**
   * Queues an array of references to resolve later (Phase 1).
   *
   * @param target - Object containing the reference array
   * @param property - Property name to set
   * @param guidRefs - Array of GUID strings to resolve
   *
   * @example
   * ```typescript
   * // Queue children references
   * resolver.addArrayReference(
   *   transform,
   *   '_children',
   *   ['child-guid-1', 'child-guid-2']
   * );
   * ```
   */
  public addArrayReference(
    target: any,
    property: string,
    guidRefs: string[]
  ): void {
    this._pendingArrayReferences.push({
      target,
      property,
      guidRefs,
    });
  }

  /**
   * Resolves all pending references (Phase 2).
   *
   * Converts GUID strings to actual object references.
   * Throws error if any GUID cannot be resolved.
   *
   * @throws Error if any GUID is not found
   *
   * @example
   * ```typescript
   * // After all objects are created and registered
   * resolver.resolve();
   * // Now all references are connected
   * ```
   */
  public resolve(): void {
    // Resolve single references
    for (const { target, property, guidRef } of this._pendingReferences) {
      if (guidRef === null) {
        target[property] = null;
      } else {
        const obj = this._objects.get(guidRef);
        if (obj === undefined) {
          throw new Error(
            `Cannot resolve reference: GUID ${guidRef} not found`
          );
        }
        target[property] = obj;
      }
    }

    // Resolve array references
    for (const { target, property, guidRefs } of this
      ._pendingArrayReferences) {
      const resolvedArray: UnityObject[] = [];

      for (const guidRef of guidRefs) {
        const obj = this._objects.get(guidRef);
        if (obj === undefined) {
          throw new Error(
            `Cannot resolve array reference: GUID ${guidRef} not found`
          );
        }
        resolvedArray.push(obj);
      }

      target[property] = resolvedArray;
    }

    // Clear pending queues after resolution
    this._pendingReferences = [];
    this._pendingArrayReferences = [];
  }

  /**
   * Gets object by GUID.
   *
   * @param guid - GUID string or GUID instance
   * @returns Object or null if not found
   *
   * @example
   * ```typescript
   * const obj = resolver.get('some-guid-string');
   * if (obj) {
   *   console.log('Found:', obj.name);
   * }
   * ```
   */
  public get(guid: string | GUID): UnityObject | null {
    const guidStr = typeof guid === 'string' ? guid : guid.value;
    return this._objects.get(guidStr) || null;
  }

  /**
   * Clears the resolver for reuse.
   *
   * @example
   * ```typescript
   * resolver.clear();
   * // Ready to deserialize another scene
   * ```
   */
  public clear(): void {
    this._objects.clear();
    this._pendingReferences = [];
    this._pendingArrayReferences = [];
  }

  /**
   * Gets number of registered objects.
   * @internal
   */
  public get objectCount(): number {
    return this._objects.size;
  }

  /**
   * Gets number of pending references.
   * @internal
   */
  public get pendingReferenceCount(): number {
    return this._pendingReferences.length + this._pendingArrayReferences.length;
  }
}
