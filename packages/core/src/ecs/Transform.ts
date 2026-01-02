import { Component } from './Component';
import { Vector3 } from '../math/Vector3';
import { Quaternion } from '../math/Quaternion';
import { Matrix4x4 } from '../math/Matrix4x4';
import { GUID } from './GUID';
import type { GUIDResolver } from '../serialization/GUIDResolver';

/**
 * Space to perform transformation operations in.
 */
export enum Space {
  /** World space (relative to the world origin) */
  World = 0,
  /** Local space (relative to the parent) */
  Self = 1,
}

/**
 * Position, rotation and scale of an object.
 *
 * Every GameObject has a Transform component that stores and manipulates
 * the position, rotation and scale. Transforms can have parent-child
 * relationships, allowing complex hierarchies.
 *
 * @example
 * ```typescript
 * const go = new GameObject("Player");
 * const transform = go.transform;
 *
 * transform.position = new Vector3(0, 5, 0);
 * transform.rotation = Quaternion.Euler(0, 45, 0);
 * transform.localScale = Vector3.one;
 *
 * // Set parent
 * const parent = new GameObject("Parent").transform;
 * transform.SetParent(parent);
 * ```
 */
export class Transform extends Component {
  // Local space (authoritative)
  private _localPosition: Vector3 = Vector3.zero;
  private _localRotation: Quaternion = Quaternion.identity;
  private _localScale: Vector3 = Vector3.one;

  // Hierarchy
  private _parent: Transform | null = null;
  private _children: Transform[] = [];

  // Cached matrices (dirty flag pattern)
  private _localToWorldMatrix: Matrix4x4 = Matrix4x4.identity;
  private _worldToLocalMatrix: Matrix4x4 = Matrix4x4.identity;
  private _isDirty: boolean = true;

  /**
   * Creates a new Transform.
   * @param name - The name of the transform
   */
  constructor(name: string = 'Transform') {
    super(name);
  }

  // ==================== Local Space Properties ====================

  /**
   * Position of the transform relative to the parent.
   */
  public get localPosition(): Vector3 {
    return this._localPosition;
  }

  public set localPosition(value: Vector3) {
    this._localPosition = value;
    this._markDirty();
  }

  /**
   * Rotation of the transform relative to the parent (as Quaternion).
   */
  public get localRotation(): Quaternion {
    return this._localRotation;
  }

  public set localRotation(value: Quaternion) {
    this._localRotation = value;
    this._markDirty();
  }

  /**
   * Rotation of the transform relative to the parent (as Euler angles in degrees).
   */
  public get localEulerAngles(): Vector3 {
    return this._localRotation.eulerAngles;
  }

  public set localEulerAngles(value: Vector3) {
    this._localRotation = Quaternion.Euler(value.x, value.y, value.z);
    this._markDirty();
  }

  /**
   * Scale of the transform relative to the parent.
   */
  public get localScale(): Vector3 {
    return this._localScale;
  }

  public set localScale(value: Vector3) {
    this._localScale = value;
    this._markDirty();
  }

  // ==================== World Space Properties ====================

  /**
   * World space position of the transform.
   */
  public get position(): Vector3 {
    if (this._parent === null) {
      return this._localPosition;
    }
    this._updateMatrices();
    return new Vector3(
      this._localToWorldMatrix.m03,
      this._localToWorldMatrix.m13,
      this._localToWorldMatrix.m23
    );
  }

  public set position(value: Vector3) {
    if (this._parent === null) {
      this._localPosition = value;
    } else {
      this._localPosition = this._parent.InverseTransformPoint(value);
    }
    this._markDirty();
  }

  /**
   * World space rotation of the transform (as Quaternion).
   */
  public get rotation(): Quaternion {
    if (this._parent === null) {
      return this._localRotation;
    }
    return Quaternion.Multiply(this._parent.rotation, this._localRotation);
  }

  public set rotation(value: Quaternion) {
    if (this._parent === null) {
      this._localRotation = value;
    } else {
      this._localRotation = Quaternion.Multiply(
        Quaternion.Inverse(this._parent.rotation),
        value
      );
    }
    this._markDirty();
  }

  /**
   * World space rotation of the transform (as Euler angles in degrees).
   */
  public get eulerAngles(): Vector3 {
    return this.rotation.eulerAngles;
  }

  public set eulerAngles(value: Vector3) {
    this.rotation = Quaternion.Euler(value.x, value.y, value.z);
  }

  /**
   * Global scale of the transform (read-only).
   * This is affected by parent scales.
   */
  public get lossyScale(): Vector3 {
    if (this._parent === null) {
      return this._localScale;
    }
    const parentScale = this._parent.lossyScale;
    return new Vector3(
      this._localScale.x * parentScale.x,
      this._localScale.y * parentScale.y,
      this._localScale.z * parentScale.z
    );
  }

  // ==================== Direction Vectors ====================

  /**
   * Forward direction (blue axis) in world space.
   */
  public get forward(): Vector3 {
    return this.rotation.MultiplyVector(Vector3.forward);
  }

  /**
   * Right direction (red axis) in world space.
   */
  public get right(): Vector3 {
    return this.rotation.MultiplyVector(Vector3.right);
  }

  /**
   * Up direction (green axis) in world space.
   */
  public get up(): Vector3 {
    return this.rotation.MultiplyVector(Vector3.up);
  }

  // ==================== Hierarchy ====================

  /**
   * The parent of this transform.
   */
  public get parent(): Transform | null {
    return this._parent;
  }

  /**
   * Sets the parent of this transform.
   * @param parent - The parent transform, or null to remove parent
   * @param worldPositionStays - If true, the world position stays the same
   */
  public SetParent(parent: Transform | null, worldPositionStays: boolean = true): void {
    if (this._parent === parent) {
      return;
    }

    // Store world transform if we need to preserve it
    const worldPos = worldPositionStays ? this.position : null;
    const worldRot = worldPositionStays ? this.rotation : null;
    const worldScale = worldPositionStays ? this.lossyScale : null;

    // Remove from old parent
    if (this._parent !== null) {
      this._parent._removeChild(this);
    }

    // Set new parent
    this._parent = parent;

    // Add to new parent
    if (this._parent !== null) {
      this._parent._addChild(this);
    }

    // Restore world transform if needed
    if (worldPositionStays && worldPos && worldRot && worldScale) {
      this.position = worldPos;
      this.rotation = worldRot;
      // Note: Scale is more complex in Unity (non-uniform scaling)
      // For now we keep local scale
    }

    this._markDirty();
  }

  /**
   * The root transform in the hierarchy.
   */
  public get root(): Transform {
    let current: Transform = this;
    while (current._parent !== null) {
      current = current._parent;
    }
    return current;
  }

  /**
   * Number of children this transform has.
   */
  public get childCount(): number {
    return this._children.length;
  }

  /**
   * Gets a child by index.
   * @param index - Index of the child
   * @returns The child transform
   */
  public GetChild(index: number): Transform {
    if (index < 0 || index >= this._children.length) {
      throw new Error(`Child index out of range: ${index}`);
    }
    return this._children[index];
  }

  /**
   * Finds a child by name (recursive).
   * @param name - Name of the child to find
   * @returns The child transform if found, null otherwise
   */
  public Find(name: string): Transform | null {
    // Check direct children first
    for (const child of this._children) {
      if (child.gameObject.name === name) {
        return child;
      }
    }

    // Recursive search
    for (const child of this._children) {
      const found = child.Find(name);
      if (found !== null) {
        return found;
      }
    }

    return null;
  }

  // ==================== Matrices ====================

  /**
   * Matrix that transforms from local space to world space.
   */
  public get localToWorldMatrix(): Matrix4x4 {
    this._updateMatrices();
    return this._localToWorldMatrix;
  }

  /**
   * Matrix that transforms from world space to local space.
   */
  public get worldToLocalMatrix(): Matrix4x4 {
    this._updateMatrices();
    return this._worldToLocalMatrix;
  }

  // ==================== Transformations ====================

  /**
   * Moves the transform in the direction and distance of translation.
   * @param translation - Movement vector
   * @param relativeTo - Space to perform translation in
   */
  public Translate(translation: Vector3, relativeTo: Space = Space.Self): void {
    if (relativeTo === Space.World) {
      this.position = Vector3.Add(this.position, translation);
    } else {
      this.localPosition = Vector3.Add(
        this.localPosition,
        this._localRotation.MultiplyVector(translation)
      );
    }
  }

  /**
   * Rotates the transform by the given Euler angles.
   * @param eulerAngles - Euler angles in degrees
   * @param relativeTo - Space to perform rotation in
   */
  public Rotate(eulerAngles: Vector3, relativeTo: Space = Space.Self): void {
    const rotation = Quaternion.Euler(eulerAngles.x, eulerAngles.y, eulerAngles.z);
    if (relativeTo === Space.World) {
      this.rotation = Quaternion.Multiply(rotation, this.rotation);
    } else {
      this.localRotation = Quaternion.Multiply(this.localRotation, rotation);
    }
  }

  /**
   * Rotates the transform around a point in space.
   * @param point - Point to rotate around
   * @param axis - Axis to rotate around
   * @param angle - Angle to rotate in degrees
   */
  public RotateAround(point: Vector3, axis: Vector3, angle: number): void {
    const currentPos = this.position;
    const rotation = Quaternion.AngleAxis(angle, axis);

    // Rotate position around point
    const direction = Vector3.Subtract(currentPos, point);
    const rotatedDirection = rotation.MultiplyVector(direction);
    this.position = Vector3.Add(point, rotatedDirection);

    // Rotate the transform itself
    this.rotation = Quaternion.Multiply(rotation, this.rotation);
  }

  /**
   * Rotates the transform to look at a target.
   * @param target - Target position or Transform to look at
   * @param worldUp - Up direction (defaults to Vector3.up)
   */
  public LookAt(target: Vector3 | Transform, worldUp: Vector3 = Vector3.up): void {
    const targetPos = target instanceof Transform ? target.position : target;
    const direction = Vector3.Subtract(targetPos, this.position);

    if (direction.sqrMagnitude < 0.0001) {
      return; // Target too close, avoid division by zero
    }

    this.rotation = Quaternion.LookRotation(direction, worldUp);
  }

  // ==================== Point Transformations ====================

  /**
   * Transforms a point from local space to world space.
   * @param point - Point in local space
   * @returns Point in world space
   */
  public TransformPoint(point: Vector3): Vector3 {
    this._updateMatrices();
    return this._localToWorldMatrix.MultiplyPoint(point);
  }

  /**
   * Transforms a point from world space to local space.
   * @param point - Point in world space
   * @returns Point in local space
   */
  public InverseTransformPoint(point: Vector3): Vector3 {
    this._updateMatrices();
    return this._worldToLocalMatrix.MultiplyPoint(point);
  }

  /**
   * Transforms a direction from local space to world space.
   * @param direction - Direction in local space
   * @returns Direction in world space
   */
  public TransformDirection(direction: Vector3): Vector3 {
    return this.rotation.MultiplyVector(direction);
  }

  /**
   * Transforms a direction from world space to local space.
   * @param direction - Direction in world space
   * @returns Direction in local space
   */
  public InverseTransformDirection(direction: Vector3): Vector3 {
    return Quaternion.Inverse(this.rotation).MultiplyVector(direction);
  }

  /**
   * Transforms a vector from local space to world space.
   * This operation is affected by scale.
   * @param vector - Vector in local space
   * @returns Vector in world space
   */
  public TransformVector(vector: Vector3): Vector3 {
    this._updateMatrices();
    return this._localToWorldMatrix.MultiplyVector(vector);
  }

  /**
   * Transforms a vector from world space to local space.
   * This operation is affected by scale.
   * @param vector - Vector in world space
   * @returns Vector in local space
   */
  public InverseTransformVector(vector: Vector3): Vector3 {
    this._updateMatrices();
    return this._worldToLocalMatrix.MultiplyVector(vector);
  }

  // ==================== Internal Methods ====================

  /**
   * Updates the cached local-to-world and world-to-local matrices.
   * @internal
   */
  private _updateMatrices(): void {
    if (!this._isDirty) {
      return;
    }

    // Build local TRS matrix
    const localMatrix = Matrix4x4.TRS(
      this._localPosition,
      this._localRotation,
      this._localScale
    );

    // Calculate world matrix
    if (this._parent === null) {
      this._localToWorldMatrix = localMatrix;
    } else {
      this._parent._updateMatrices();
      this._localToWorldMatrix = Matrix4x4.Multiply(
        this._parent._localToWorldMatrix,
        localMatrix
      );
    }

    // Calculate inverse
    this._worldToLocalMatrix = this._localToWorldMatrix.inverse;

    this._isDirty = false;
  }

  /**
   * Marks this transform and all children as dirty.
   * @internal
   */
  private _markDirty(): void {
    if (this._isDirty) {
      return; // Already dirty
    }

    this._isDirty = true;

    // Propagate to children
    for (const child of this._children) {
      child._markDirty();
    }
  }

  /**
   * Adds a child to this transform.
   * @internal
   */
  private _addChild(child: Transform): void {
    if (!this._children.includes(child)) {
      this._children.push(child);
    }
  }

  /**
   * Removes a child from this transform.
   * @internal
   */
  private _removeChild(child: Transform): void {
    const index = this._children.indexOf(child);
    if (index !== -1) {
      this._children.splice(index, 1);
    }
  }

  // ==================== Serialization ====================

  /**
   * Serializes this Transform to JSON.
   * @returns Transform data including local space values and hierarchy references
   */
  public toJSON(): any {
    return {
      type: 'Transform',
      guid: this.guid.toJSON(),
      name: this.name,
      gameObject: (this as any)._gameObject?.guid.value || null,
      localPosition: this._localPosition.toJSON(),
      localRotation: this._localRotation.toJSON(),
      localScale: this._localScale.toJSON(),
      parent: this._parent?.guid.value || null,
      children: this._children.map((c) => c.guid.value),
    };
  }

  /**
   * Deserializes a Transform from JSON.
   * @param json - Serialized transform data
   * @param resolver - GUID resolver for reference resolution
   * @returns Transform instance
   */
  public static fromJSON(json: any, resolver: GUIDResolver): Transform {
    const transform = new Transform(json.name);
    // Replace auto-generated GUID with deserialized one
    (transform as any)._guid = GUID.fromJSON(json.guid);

    resolver.register(transform.guid, transform);

    // Restore local space (authoritative)
    transform._localPosition = Vector3.fromJSON(json.localPosition);
    transform._localRotation = Quaternion.fromJSON(json.localRotation);
    transform._localScale = Vector3.fromJSON(json.localScale);

    // Queue references for Phase 2
    resolver.addReference(transform, '_gameObject', json.gameObject);
    resolver.addReference(transform, '_parent', json.parent);
    resolver.addArrayReference(transform, '_children', json.children);

    // Mark dirty to recompute matrices
    (transform as any)._markDirty();

    return transform;
  }
}
