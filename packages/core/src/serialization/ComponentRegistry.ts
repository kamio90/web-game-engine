import { Component } from '../ecs/Component';
import { Transform } from '../ecs/Transform';
import { MonoBehaviour } from '../ecs/MonoBehaviour';

/**
 * Component type registry for serialization/deserialization.
 *
 * Maps component type names to their constructors, enabling deserialization
 * of custom MonoBehaviour subclasses. Built-in components (Transform,
 * MonoBehaviour) are auto-registered on module load.
 *
 * @example
 * ```typescript
 * // Define custom component
 * class HealthComponent extends MonoBehaviour {
 *   public health: number = 100;
 *   // ... toJSON/fromJSON implementation
 * }
 *
 * // Register before serialization/deserialization
 * ComponentRegistry.register('HealthComponent', HealthComponent);
 *
 * // Now HealthComponent can be serialized/deserialized
 * const scene = JSONSerializer.deserialize(sceneJson);
 * ```
 */
export class ComponentRegistry {
  private static _registry: Map<string, new (...args: any[]) => Component> =
    new Map();

  /**
   * Registers a component type with a name.
   *
   * @param name - Type name (e.g., "MyComponent")
   * @param constructor - Component constructor
   *
   * @example
   * ```typescript
   * class MyComponent extends MonoBehaviour {
   *   // ...
   * }
   * ComponentRegistry.register('MyComponent', MyComponent);
   * ```
   */
  public static register<T extends Component>(
    name: string,
    constructor: new (...args: any[]) => T
  ): void {
    this._registry.set(name, constructor);
  }

  /**
   * Gets constructor for a type name.
   *
   * @param name - Type name
   * @returns Constructor or null if not found
   *
   * @example
   * ```typescript
   * const CompClass = ComponentRegistry.get('Transform');
   * if (CompClass) {
   *   const comp = new CompClass();
   * }
   * ```
   */
  public static get(
    name: string
  ): (new (...args: any[]) => Component) | null {
    return this._registry.get(name) || null;
  }

  /**
   * Checks if a type is registered.
   *
   * @param name - Type name
   * @returns True if registered
   *
   * @example
   * ```typescript
   * if (ComponentRegistry.has('Transform')) {
   *   console.log('Transform is registered');
   * }
   * ```
   */
  public static has(name: string): boolean {
    return this._registry.has(name);
  }

  /**
   * Auto-registers built-in components.
   * Called automatically on module load.
   * @internal
   */
  public static _registerBuiltins(): void {
    this.register('Transform', Transform);
    this.register('MonoBehaviour', MonoBehaviour);
  }

  /**
   * Clears the registry.
   * Primarily for testing - use with caution.
   * @internal
   */
  public static _clear(): void {
    this._registry.clear();
    this._registerBuiltins();
  }
}

// Auto-register built-ins on module load
ComponentRegistry._registerBuiltins();
