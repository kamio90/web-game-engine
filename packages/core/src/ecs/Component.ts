import { Object as UnityObject } from './Object';
import { GUID } from './GUID';
import type { GUIDResolver } from '../serialization/GUIDResolver';

/**
 * Forward declaration interface for GameObject to avoid circular dependencies.
 * The actual GameObject class will implement this interface.
 * @internal
 */
export interface IGameObject extends UnityObject {
  GetComponent<T extends Component>(type: new (...args: any[]) => T): T | null;
  GetComponents<T extends Component>(type: new (...args: any[]) => T): T[];
  GetComponentInChildren<T extends Component>(
    type: new (...args: any[]) => T,
    includeInactive?: boolean
  ): T | null;
  GetComponentsInChildren<T extends Component>(
    type: new (...args: any[]) => T,
    includeInactive?: boolean
  ): T[];
  GetComponentInParent<T extends Component>(
    type: new (...args: any[]) => T
  ): T | null;
  GetComponentsInParent<T extends Component>(
    type: new (...args: any[]) => T
  ): T[];
  transform: ITransform;
  tag: string;
  activeSelf: boolean;
  activeInHierarchy: boolean;
  _onActiveChanged(): void;
}

/**
 * Forward declaration interface for Transform to avoid circular dependencies.
 * @internal
 */
export interface ITransform extends Component {
  // Transform properties will be defined in Transform.ts
}

/**
 * Base class for everything attached to a GameObject.
 *
 * Components are attached to GameObjects and provide functionality.
 * Every component must be attached to exactly one GameObject.
 *
 * @example
 * ```typescript
 * class HealthComponent extends Component {
 *   private health: number = 100;
 *
 *   TakeDamage(amount: number): void {
 *     this.health -= amount;
 *     console.log(`${this.gameObject.name} took ${amount} damage`);
 *   }
 * }
 *
 * const go = new GameObject("Player");
 * const health = go.AddComponent(HealthComponent);
 * health.TakeDamage(10);
 * ```
 */
export class Component extends UnityObject {
  private _gameObject!: IGameObject;
  private _transform!: ITransform;

  /**
   * Creates a new Component.
   * Note: Components should not be created directly.
   * Use GameObject.AddComponent() instead.
   * @param name - The name of the component
   */
  constructor(name: string = 'Component') {
    super(name);
  }

  // ==================== Properties ====================

  /**
   * The GameObject this component is attached to.
   * A component is always attached to exactly one GameObject.
   */
  public get gameObject(): IGameObject {
    return this._gameObject;
  }

  /**
   * The Transform attached to the GameObject.
   * This is a shortcut for gameObject.transform.
   */
  public get transform(): ITransform {
    if (!this._transform) {
      this._transform = this._gameObject.transform;
    }
    return this._transform;
  }

  /**
   * The tag of the GameObject.
   * This is a shortcut for gameObject.tag.
   */
  public get tag(): string {
    return this._gameObject.tag;
  }

  public set tag(value: string) {
    this._gameObject.tag = value;
  }

  // ==================== Component Queries ====================

  /**
   * Gets the component of the specified type, if it exists.
   * @param type - The type of component to retrieve
   * @returns The component if found, null otherwise
   */
  public GetComponent<T extends Component>(
    type: new (...args: any[]) => T
  ): T | null {
    return this._gameObject.GetComponent(type);
  }

  /**
   * Gets all components of the specified type.
   * @param type - The type of components to retrieve
   * @returns Array of components of the specified type
   */
  public GetComponents<T extends Component>(
    type: new (...args: any[]) => T
  ): T[] {
    return this._gameObject.GetComponents(type);
  }

  /**
   * Gets the component of the specified type in the GameObject or any of its children.
   * @param type - The type of component to retrieve
   * @param includeInactive - Should inactive GameObjects be included?
   * @returns The component if found, null otherwise
   */
  public GetComponentInChildren<T extends Component>(
    type: new (...args: any[]) => T,
    includeInactive: boolean = false
  ): T | null {
    return this._gameObject.GetComponentInChildren(type, includeInactive);
  }

  /**
   * Gets all components of the specified type in the GameObject or any of its children.
   * @param type - The type of components to retrieve
   * @param includeInactive - Should inactive GameObjects be included?
   * @returns Array of components found
   */
  public GetComponentsInChildren<T extends Component>(
    type: new (...args: any[]) => T,
    includeInactive: boolean = false
  ): T[] {
    return this._gameObject.GetComponentsInChildren(type, includeInactive);
  }

  /**
   * Gets the component of the specified type in the GameObject or any of its parents.
   * @param type - The type of component to retrieve
   * @returns The component if found, null otherwise
   */
  public GetComponentInParent<T extends Component>(
    type: new (...args: any[]) => T
  ): T | null {
    return this._gameObject.GetComponentInParent(type);
  }

  /**
   * Gets all components of the specified type in the GameObject or any of its parents.
   * @param type - The type of components to retrieve
   * @returns Array of components found
   */
  public GetComponentsInParent<T extends Component>(
    type: new (...args: any[]) => T
  ): T[] {
    return this._gameObject.GetComponentsInParent(type);
  }

  // ==================== Tag System ====================

  /**
   * Checks if the GameObject has the specified tag.
   * @param tag - The tag to compare
   * @returns True if the GameObject has this tag
   */
  public CompareTag(tag: string): boolean {
    return this._gameObject.tag === tag;
  }

  // ==================== Internal Methods ====================

  /**
   * Sets the GameObject this component is attached to.
   * This is called internally by GameObject.AddComponent().
   * @param gameObject - The GameObject to attach to
   * @internal
   */
  public _setGameObject(gameObject: IGameObject): void {
    this._gameObject = gameObject;
    this._transform = gameObject.transform;
  }

  // ==================== Serialization ====================

  /**
   * Serializes this Component to JSON.
   * @returns Component data including GameObject reference
   */
  public toJSON(): any {
    return {
      type: 'Component',
      guid: this.guid.toJSON(),
      name: this.name,
      gameObject: this._gameObject?.guid.value || null,
    };
  }

  /**
   * Deserializes a Component from JSON.
   * @param json - Serialized component data
   * @param resolver - GUID resolver for reference resolution
   * @returns Component instance
   */
  public static fromJSON(json: any, resolver: GUIDResolver): Component {
    const component = new Component(json.name);
    // Replace auto-generated GUID with deserialized one
    (component as any)._guid = GUID.fromJSON(json.guid);

    resolver.register(component.guid, component);

    // Queue gameObject reference for Phase 2
    resolver.addReference(component, '_gameObject', json.gameObject);

    return component;
  }

  // ==================== Lifecycle Hooks ====================

  /**
   * Called when the component becomes enabled and active.
   * Override this method in derived classes to add custom behavior.
   * @internal
   */
  protected _onEnable(): void {
    // Override in derived classes
  }

  /**
   * Called when the component becomes disabled.
   * Override this method in derived classes to add custom behavior.
   * @internal
   */
  protected _onDisable(): void {
    // Override in derived classes
  }
}
