import * as THREE from 'three';
import { Component } from '../ecs/Component';
import { Transform } from '../ecs/Transform';
import { Vector3 } from '../math/Vector3';
import { Color } from '../math/Color';
import { Rect } from '../math/Rect';
import { Ray } from '../math/Ray';

/**
 * Clear flags for camera rendering.
 */
export enum CameraClearFlags {
  /** Clear with skybox */
  Skybox = 1,
  /** Clear with solid color */
  SolidColor = 2,
  /** Clear only depth */
  Depth = 3,
  /** Don't clear */
  Nothing = 4,
}

/**
 * Camera component for rendering the scene.
 *
 * Unity's Camera class controls rendering from a particular viewpoint.
 * This implementation wraps Three.js cameras (PerspectiveCamera and OrthographicCamera)
 * to provide the Unity Camera API.
 *
 * @example
 * ```typescript
 * // Create a camera GameObject
 * const cameraObj = new GameObject('MainCamera');
 * const camera = cameraObj.AddComponent(Camera);
 *
 * // Configure camera
 * camera.fieldOfView = 60;
 * camera.nearClipPlane = 0.3;
 * camera.farClipPlane = 1000;
 * camera.backgroundColor = Color.black;
 *
 * // Set as main camera
 * Camera.main = camera;
 *
 * // Convert screen to world point
 * const worldPoint = camera.ScreenToWorldPoint(new Vector3(100, 100, 10));
 * ```
 */
export class Camera extends Component {
  // ==================== Static Properties ====================

  /**
   * The first enabled camera tagged "MainCamera" (Read Only).
   */
  public static main: Camera | null = null;

  /**
   * The camera that is currently rendering (Read Only).
   */
  public static current: Camera | null = null;

  /**
   * All enabled cameras in the scene.
   */
  private static _allCameras: Set<Camera> = new Set();

  // ==================== Instance Properties ====================

  // Projection properties
  private _fieldOfView: number = 60;
  private _nearClipPlane: number = 0.3;
  private _farClipPlane: number = 1000;
  private _orthographic: boolean = false;
  private _orthographicSize: number = 5;
  private _aspect: number = 1;

  // Rendering properties
  private _depth: number = -1;
  private _clearFlags: CameraClearFlags = CameraClearFlags.Skybox;
  private _backgroundColor: Color = new Color(0.19, 0.3, 0.47, 1); // Unity default
  private _cullingMask: number = 0xFFFFFFFF; // All layers
  private _rect: Rect = new Rect(0, 0, 1, 1); // Full viewport

  // Internal Three.js camera
  private _threeCamera: THREE.PerspectiveCamera | THREE.OrthographicCamera;
  private _projectionMatrixDirty: boolean = true;

  /**
   * Creates a new Camera component.
   * @param name - Component name
   */
  constructor(name: string = 'Camera') {
    super(name);

    // Start with perspective camera
    this._threeCamera = new THREE.PerspectiveCamera(
      this._fieldOfView,
      this._aspect,
      this._nearClipPlane,
      this._farClipPlane
    );
  }

  // ==================== Projection Properties ====================

  /**
   * The vertical field of view of the camera, in degrees.
   */
  public get fieldOfView(): number {
    return this._fieldOfView;
  }

  public set fieldOfView(value: number) {
    this._fieldOfView = value;
    this._projectionMatrixDirty = true;
  }

  /**
   * The near clipping plane distance.
   */
  public get nearClipPlane(): number {
    return this._nearClipPlane;
  }

  public set nearClipPlane(value: number) {
    this._nearClipPlane = value;
    this._projectionMatrixDirty = true;
  }

  /**
   * The far clipping plane distance.
   */
  public get farClipPlane(): number {
    return this._farClipPlane;
  }

  public set farClipPlane(value: number) {
    this._farClipPlane = value;
    this._projectionMatrixDirty = true;
  }

  /**
   * Is the camera orthographic (true) or perspective (false)?
   */
  public get orthographic(): boolean {
    return this._orthographic;
  }

  public set orthographic(value: boolean) {
    if (this._orthographic !== value) {
      this._orthographic = value;
      this._recreateThreeCamera();
    }
  }

  /**
   * Camera's half-size when in orthographic mode.
   */
  public get orthographicSize(): number {
    return this._orthographicSize;
  }

  public set orthographicSize(value: number) {
    this._orthographicSize = value;
    this._projectionMatrixDirty = true;
  }

  /**
   * The aspect ratio (width divided by height).
   */
  public get aspect(): number {
    return this._aspect;
  }

  public set aspect(value: number) {
    this._aspect = value;
    this._projectionMatrixDirty = true;
  }

  // ==================== Rendering Properties ====================

  /**
   * Camera's depth in the camera rendering order.
   */
  public get depth(): number {
    return this._depth;
  }

  public set depth(value: number) {
    this._depth = value;
  }

  /**
   * How the camera clears the background.
   */
  public get clearFlags(): CameraClearFlags {
    return this._clearFlags;
  }

  public set clearFlags(value: CameraClearFlags) {
    this._clearFlags = value;
  }

  /**
   * The color with which the screen will be cleared.
   */
  public get backgroundColor(): Color {
    return this._backgroundColor;
  }

  public set backgroundColor(value: Color) {
    this._backgroundColor = value;
  }

  /**
   * This is used to render parts of the scene selectively.
   */
  public get cullingMask(): number {
    return this._cullingMask;
  }

  public set cullingMask(value: number) {
    this._cullingMask = value;
  }

  /**
   * Where on the screen is the camera rendered in normalized coordinates.
   */
  public get rect(): Rect {
    return this._rect;
  }

  public set rect(value: Rect) {
    this._rect = value;
  }

  /**
   * The rendering path that is currently being used.
   * (Simplified for web - always returns "Forward")
   */
  public get renderingPath(): string {
    return 'Forward';
  }

  /**
   * Returns the eye that is currently rendering.
   * (Simplified for web - always returns "Mono")
   */
  public get stereoActiveEye(): string {
    return 'Mono';
  }

  // ==================== Internal Properties ====================

  /**
   * Gets the underlying Three.js camera object.
   * @internal
   */
  public get threeCamera(): THREE.PerspectiveCamera | THREE.OrthographicCamera {
    if (this._projectionMatrixDirty) {
      this._updateProjectionMatrix();
    }
    return this._threeCamera;
  }

  // ==================== World/Screen Conversion Methods ====================

  /**
   * Transforms position from world space into screen space.
   * @param position - World space position
   * @returns Screen space position (z is depth)
   */
  public WorldToScreenPoint(position: Vector3): Vector3 {
    this._syncWithTransform();

    const vector = new THREE.Vector3(position.x, position.y, position.z);
    vector.project(this.threeCamera);

    // Convert from NDC (-1 to 1) to screen space (0 to viewport size)
    // For now, assume a standard viewport size (will be updated when rendering system is added)
    const viewportWidth = 1920;
    const viewportHeight = 1080;

    return new Vector3(
      (vector.x + 1) * 0.5 * viewportWidth,
      (1 - vector.y) * 0.5 * viewportHeight, // Flip Y for Unity convention
      vector.z
    );
  }

  /**
   * Transforms position from screen space into world space.
   * @param position - Screen space position (z is depth from camera)
   * @returns World space position
   */
  public ScreenToWorldPoint(position: Vector3): Vector3 {
    this._syncWithTransform();

    // For now, assume a standard viewport size
    const viewportWidth = 1920;
    const viewportHeight = 1080;

    // Convert from screen space to NDC
    const x = (position.x / viewportWidth) * 2 - 1;
    const y = (1 - position.y / viewportHeight) * 2 - 1; // Flip Y
    const z = position.z;

    const vector = new THREE.Vector3(x, y, z);
    vector.unproject(this.threeCamera);

    return new Vector3(vector.x, vector.y, vector.z);
  }

  /**
   * Transforms position from viewport space into world space.
   * @param position - Viewport space position (0-1 range, z is depth)
   * @returns World space position
   */
  public ViewportToWorldPoint(position: Vector3): Vector3 {
    this._syncWithTransform();

    // Convert from viewport (0-1) to NDC (-1 to 1)
    const x = position.x * 2 - 1;
    const y = position.y * 2 - 1;
    const z = position.z;

    const vector = new THREE.Vector3(x, y, z);
    vector.unproject(this.threeCamera);

    return new Vector3(vector.x, vector.y, vector.z);
  }

  /**
   * Transforms position from world space into viewport space.
   * @param position - World space position
   * @returns Viewport space position (0-1 range)
   */
  public WorldToViewportPoint(position: Vector3): Vector3 {
    this._syncWithTransform();

    const vector = new THREE.Vector3(position.x, position.y, position.z);
    vector.project(this.threeCamera);

    // Convert from NDC (-1 to 1) to viewport (0 to 1)
    return new Vector3(
      (vector.x + 1) * 0.5,
      (vector.y + 1) * 0.5,
      vector.z
    );
  }

  /**
   * Transforms position from screen space into viewport space.
   * @param position - Screen space position
   * @returns Viewport space position (0-1 range)
   */
  public ScreenToViewportPoint(position: Vector3): Vector3 {
    // For now, assume a standard viewport size
    const viewportWidth = 1920;
    const viewportHeight = 1080;

    return new Vector3(
      position.x / viewportWidth,
      position.y / viewportHeight,
      position.z
    );
  }

  /**
   * Transforms position from viewport space into screen space.
   * @param position - Viewport space position (0-1 range)
   * @returns Screen space position
   */
  public ViewportToScreenPoint(position: Vector3): Vector3 {
    // For now, assume a standard viewport size
    const viewportWidth = 1920;
    const viewportHeight = 1080;

    return new Vector3(
      position.x * viewportWidth,
      position.y * viewportHeight,
      position.z
    );
  }

  // ==================== Ray Casting Methods ====================

  /**
   * Returns a ray going from camera through a screen point.
   * @param position - Screen space position
   * @returns Ray from camera
   */
  public ScreenPointToRay(position: Vector3): Ray {
    const viewport = this.ScreenToViewportPoint(position);
    return this.ViewportPointToRay(viewport);
  }

  /**
   * Returns a ray going from camera through a viewport point.
   * @param position - Viewport space position (0-1 range)
   * @returns Ray from camera
   */
  public ViewportPointToRay(position: Vector3): Ray {
    this._syncWithTransform();

    // Create ray from camera through viewport point
    const x = position.x * 2 - 1;
    const y = position.y * 2 - 1;

    const origin = (this.transform as Transform).position;

    // Get direction by unprojecting the point
    const near = new THREE.Vector3(x, y, -1);
    near.unproject(this.threeCamera);

    const direction = new Vector3(
      near.x - origin.x,
      near.y - origin.y,
      near.z - origin.z
    ).normalized;

    return new Ray(origin, direction);
  }

  // ==================== Static Methods ====================

  /**
   * Returns all enabled cameras in the scene.
   * @returns Array of cameras
   */
  public static GetAllCameras(): Camera[] {
    return Array.from(Camera._allCameras);
  }

  // ==================== Internal Methods ====================

  /**
   * Called when component is enabled.
   * @internal
   */
  protected override _onEnable(): void {
    super._onEnable();
    Camera._allCameras.add(this);

    // Set as main camera if none exists and tagged as MainCamera
    if (!Camera.main && this.gameObject.tag === 'MainCamera') {
      Camera.main = this;
    }
  }

  /**
   * Called when component is disabled.
   * @internal
   */
  protected override _onDisable(): void {
    super._onDisable();
    Camera._allCameras.delete(this);

    if (Camera.main === this) {
      Camera.main = null;
    }
    if (Camera.current === this) {
      Camera.current = null;
    }
  }

  /**
   * Recreates the Three.js camera when projection mode changes.
   * @internal
   */
  private _recreateThreeCamera(): void {
    // Sync with transform first to ensure we have the latest position/rotation
    this._syncWithTransform();

    const oldPosition = this._threeCamera.position.clone();
    const oldQuaternion = this._threeCamera.quaternion.clone();

    if (this._orthographic) {
      // Create orthographic camera
      const height = this._orthographicSize * 2;
      const width = height * this._aspect;
      this._threeCamera = new THREE.OrthographicCamera(
        -width / 2,
        width / 2,
        height / 2,
        -height / 2,
        this._nearClipPlane,
        this._farClipPlane
      );
    } else {
      // Create perspective camera
      this._threeCamera = new THREE.PerspectiveCamera(
        this._fieldOfView,
        this._aspect,
        this._nearClipPlane,
        this._farClipPlane
      );
    }

    // Restore position and rotation
    this._threeCamera.position.copy(oldPosition);
    this._threeCamera.quaternion.copy(oldQuaternion);

    this._projectionMatrixDirty = true;
  }

  /**
   * Updates the projection matrix when properties change.
   * @internal
   */
  private _updateProjectionMatrix(): void {
    if (this._orthographic && this._threeCamera instanceof THREE.OrthographicCamera) {
      const height = this._orthographicSize * 2;
      const width = height * this._aspect;
      this._threeCamera.left = -width / 2;
      this._threeCamera.right = width / 2;
      this._threeCamera.top = height / 2;
      this._threeCamera.bottom = -height / 2;
      this._threeCamera.near = this._nearClipPlane;
      this._threeCamera.far = this._farClipPlane;
      this._threeCamera.updateProjectionMatrix();
    } else if (!this._orthographic && this._threeCamera instanceof THREE.PerspectiveCamera) {
      this._threeCamera.fov = this._fieldOfView;
      this._threeCamera.aspect = this._aspect;
      this._threeCamera.near = this._nearClipPlane;
      this._threeCamera.far = this._farClipPlane;
      this._threeCamera.updateProjectionMatrix();
    }

    this._projectionMatrixDirty = false;
  }

  /**
   * Syncs the Three.js camera with the Transform component.
   * @internal
   */
  private _syncWithTransform(): void {
    if (!this.gameObject) return;

    const transform = this.gameObject.transform as Transform;
    const pos = transform.position;
    const rot = transform.rotation;

    this._threeCamera.position.set(pos.x, pos.y, pos.z);
    this._threeCamera.quaternion.set(rot.x, rot.y, rot.z, rot.w);
    this._threeCamera.updateMatrixWorld();
  }

  /**
   * Resets all cameras (for testing).
   * @internal
   */
  public static _resetAll(): void {
    Camera._allCameras.clear();
    Camera.main = null;
    Camera.current = null;
  }
}
