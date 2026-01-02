# Web Game Engine - Complete Component Reference

> This document lists ALL built-in Unity components with their complete API surface. Use this as the authoritative reference when implementing components.

## 📋 Component Categories

### Core Components
- [Transform](#transform)
- [MonoBehaviour](#monobehaviour)
- [Camera](#camera)
- [Light](#light)

### Rendering Components
- [MeshRenderer](#meshrenderer)
- [SkinnedMeshRenderer](#skinnedmeshrenderer)
- [MeshFilter](#meshfilter)
- [Material](#material)
- [Texture](#texture)
- [Shader](#shader)
- [SpriteRenderer](#spriterenderer)
- [LineRenderer](#linerenderer)
- [TrailRenderer](#trailrenderer)

### Physics Components
- [Rigidbody](#rigidbody)
- [Collider](#collider) (Box, Sphere, Capsule, Mesh, Terrain)
- [CharacterController](#charactercontroller)
- [Joint](#joint) (Hinge, Spring, Fixed, Configurable)
- [PhysicMaterial](#physicmaterial)

### Animation Components
- [Animator](#animator)
- [Animation](#animation)
- [AnimatorController](#animatorcontroller)
- [AnimationClip](#animationclip)

### Audio Components
- [AudioSource](#audiosource)
- [AudioListener](#audiolistener)
- [AudioClip](#audioclip)
- [AudioMixer](#audiomixer)
- [AudioReverbZone](#audioreverbzone)

### UI Components
- [Canvas](#canvas)
- [RectTransform](#recttransform)
- [Image](#image)
- [Text](#text)
- [Button](#button)
- [Slider](#slider)
- [InputField](#inputfield)
- [ScrollRect](#scrollrect)

### Particle System
- [ParticleSystem](#particlesystem)
- [ParticleSystemRenderer](#particlesystemrenderer)

### Terrain
- [Terrain](#terrain)
- [TerrainCollider](#terraincollider)
- [TerrainData](#terraindata)

### Navigation
- [NavMeshAgent](#navmeshagent)
- [NavMeshObstacle](#navmeshobstacle)
- [NavMeshSurface](#navmeshsurface)
- [OffMeshLink](#offmeshlink)

### Networking
- [NetworkIdentity](#networkidentity)
- [NetworkTransform](#networktransform)
- [NetworkBehaviour](#networkbehaviour)

### XR
- [XRController](#xrcontroller)
- [XRCamera](#xrcamera)
- [XRRayInteractor](#xrrayinteractor)

---

## Transform

The Transform component determines the Position, Rotation, and Scale of each object in the scene. Every GameObject has a Transform.

### Properties

```typescript
class Transform extends Component {
  // World space position
  position: Vector3;
  
  // World space rotation (Quaternion)
  rotation: Quaternion;
  
  // World space rotation (Euler angles in degrees)
  eulerAngles: Vector3;
  
  // Local space position relative to the parent
  localPosition: Vector3;
  
  // Local space rotation relative to the parent (Quaternion)
  localRotation: Quaternion;
  
  // Local space rotation relative to the parent (Euler angles)
  localEulerAngles: Vector3;
  
  // The scale of the transform relative to the GameObjects parent
  localScale: Vector3;
  
  // The world space scale (Read Only)
  lossyScale: Vector3;
  
  // The parent of the transform
  parent: Transform | null;
  
  // The number of children the Transform has
  readonly childCount: number;
  
  // The red axis of the transform in world space
  readonly right: Vector3;
  
  // The green axis of the transform in world space
  readonly up: Vector3;
  
  // The blue axis of the transform in world space (z-axis)
  readonly forward: Vector3;
  
  // The Transform's position in world space
  readonly worldToLocalMatrix: Matrix4x4;
  
  // Matrix that transforms a point from local space into world space
  readonly localToWorldMatrix: Matrix4x4;
  
  // The root transform at the top of the transform hierarchy
  readonly root: Transform;
  
  // Hierarchy capacity for pre-allocation (performance)
  hierarchyCapacity: number;
}
```

### Methods

```typescript
class Transform extends Component {
  /**
   * Set the parent of the transform.
   * @param parent - The parent Transform to use
   * @param worldPositionStays - If true, the parent-relative position, scale and rotation are modified such that the object keeps the same world space position, rotation and scale as before
   */
  SetParent(parent: Transform | null, worldPositionStays: boolean = true): void;
  
  /**
   * Returns a transform child by index.
   * @param index - Index of the child transform to return. Must be smaller than Transform.childCount
   */
  GetChild(index: number): Transform;
  
  /**
   * Finds a child by name and returns it.
   * @param name - Name of child to be found. Can include a hierarchy path with '/' separators
   * @returns The returned child transform or null if no child is found
   */
  Find(name: string): Transform | null;
  
  /**
   * Is this transform a child of parent?
   */
  IsChildOf(parent: Transform): boolean;
  
  /**
   * Transforms position from local space to world space.
   */
  TransformPoint(position: Vector3): Vector3;
  
  /**
   * Transforms position from world space to local space.
   */
  InverseTransformPoint(position: Vector3): Vector3;
  
  /**
   * Transforms direction from local space to world space.
   */
  TransformDirection(direction: Vector3): Vector3;
  
  /**
   * Transforms direction from world space to local space.
   */
  InverseTransformDirection(direction: Vector3): Vector3;
  
  /**
   * Transforms vector from local space to world space.
   */
  TransformVector(vector: Vector3): Vector3;
  
  /**
   * Transforms vector from world space to local space.
   */
  InverseTransformVector(vector: Vector3): Vector3;
  
  /**
   * Rotates the transform so the forward vector points at target's current position.
   * @param target - Object to point towards
   * @param worldUp - Vector specifying the upward direction
   */
  LookAt(target: Transform | Vector3, worldUp?: Vector3): void;
  
  /**
   * Applies a rotation of eulerAngles.z degrees around the z axis, eulerAngles.x degrees around the x axis, and eulerAngles.y degrees around the y axis (in that order).
   * @param eulers - The rotation to apply in euler angles
   * @param relativeTo - Determines whether to rotate the GameObject either locally to the GameObject or relative to the Scene in world space
   */
  Rotate(eulers: Vector3, relativeTo?: Space): void;
  Rotate(xAngle: number, yAngle: number, zAngle: number, relativeTo?: Space): void;
  Rotate(axis: Vector3, angle: number, relativeTo?: Space): void;
  
  /**
   * Rotates the transform about axis passing through point in world coordinates by angle degrees.
   */
  RotateAround(point: Vector3, axis: Vector3, angle: number): void;
  
  /**
   * Moves the transform in the direction and distance of translation.
   * @param translation - The direction and distance of movement
   * @param relativeTo - Determines whether to move relative to local or world space
   */
  Translate(translation: Vector3, relativeTo?: Space): void;
  Translate(x: number, y: number, z: number, relativeTo?: Space): void;
  
  /**
   * Unparents all children.
   */
  DetachChildren(): void;
  
  /**
   * Move the transform to the start of the local transform list.
   */
  SetAsFirstSibling(): void;
  
  /**
   * Move the transform to the end of the local transform list.
   */
  SetAsLastSibling(): void;
  
  /**
   * Sets the sibling index.
   * @param index - Index to set
   */
  SetSiblingIndex(index: number): void;
  
  /**
   * Gets the sibling index.
   */
  GetSiblingIndex(): number;
}

enum Space {
  World = 0,
  Self = 1,
}
```

---

## MonoBehaviour

MonoBehaviour is the base class from which every script derives. It offers lifecycle methods and access to the GameObject.

### Properties

```typescript
class MonoBehaviour extends Behaviour {
  // The game object this component is attached to
  readonly gameObject: GameObject;
  
  // The Transform attached to this GameObject
  readonly transform: Transform;
  
  // The tag of this game object
  tag: string;
  
  // Enabled Behaviours are Updated, disabled Behaviours are not
  enabled: boolean;
  
  // Has the Behaviour had active and enabled called?
  readonly isActiveAndEnabled: boolean;
  
  // Coroutines are paused when this is false
  useGUILayout: boolean;
}
```

### Lifecycle Methods

```typescript
class MonoBehaviour extends Behaviour {
  /**
   * Awake is called when the script instance is being loaded.
   * Called once per component instance, before any Start method.
   */
  protected Awake(): void {}
  
  /**
   * This function is called when the object becomes enabled and active.
   * Called every time the component is enabled (SetActive(true) or component.enabled = true).
   */
  protected OnEnable(): void {}
  
  /**
   * Start is called on the frame when a script is enabled just before any of the Update methods are called the first time.
   * Called once per component, after all Awake methods have been called.
   */
  protected Start(): void {}
  
  /**
   * Update is called every frame, if the MonoBehaviour is enabled.
   * Variable delta time - depends on frame rate.
   */
  protected Update(): void {}
  
  /**
   * This function is called every fixed framerate frame, if the MonoBehaviour is enabled.
   * Fixed delta time - typically 50Hz (0.02s).
   * Use for physics calculations.
   */
  protected FixedUpdate(): void {}
  
  /**
   * LateUpdate is called every frame, if the Behaviour is enabled.
   * Called after all Update functions have been called.
   * Use for camera follow scripts.
   */
  protected LateUpdate(): void {}
  
  /**
   * This function is called when the behaviour becomes disabled or inactive.
   * Called when SetActive(false) or component.enabled = false.
   */
  protected OnDisable(): void {}
  
  /**
   * Destroying the attached Behaviour will result in the game or Scene receiving OnDestroy.
   * Called when GameObject.Destroy() is called.
   */
  protected OnDestroy(): void {}
}
```

### Physics Callbacks

```typescript
class MonoBehaviour extends Behaviour {
  /**
   * OnCollisionEnter is called when this collider/rigidbody has begun touching another rigidbody/collider.
   */
  protected OnCollisionEnter(collision: Collision): void {}
  
  /**
   * OnCollisionStay is called once per frame for every Collider or Rigidbody that touches another Collider or Rigidbody.
   */
  protected OnCollisionStay(collision: Collision): void {}
  
  /**
   * OnCollisionExit is called when this collider/rigidbody has stopped touching another rigidbody/collider.
   */
  protected OnCollisionExit(collision: Collision): void {}
  
  /**
   * OnTriggerEnter is called when the Collider other enters the trigger.
   */
  protected OnTriggerEnter(other: Collider): void {}
  
  /**
   * OnTriggerStay is called almost all the frames for every Collider other that is touching the trigger.
   */
  protected OnTriggerStay(other: Collider): void {}
  
  /**
   * OnTriggerExit is called when the Collider other has stopped touching the trigger.
   */
  protected OnTriggerExit(other: Collider): void {}
}
```

### Coroutine Methods

```typescript
class MonoBehaviour extends Behaviour {
  /**
   * Starts a Coroutine.
   * @param routine - Generator function implementing the coroutine
   * @returns Coroutine that can be passed to StopCoroutine
   */
  StartCoroutine(routine: Generator<YieldInstruction | null>): Coroutine;
  StartCoroutine(methodName: string): Coroutine;
  
  /**
   * Stops a coroutine.
   */
  StopCoroutine(routine: Coroutine): void;
  StopCoroutine(methodName: string): void;
  
  /**
   * Stops all coroutines running on this behaviour.
   */
  StopAllCoroutines(): void;
}

// Yield instructions
class WaitForSeconds {
  constructor(seconds: number);
}

class WaitForFixedUpdate {}

class WaitForEndOfFrame {}

class WaitUntil {
  constructor(predicate: () => boolean);
}

class WaitWhile {
  constructor(predicate: () => boolean);
}

// Example coroutine usage
class MyScript extends MonoBehaviour {
  Start() {
    this.StartCoroutine(this.FadeOut());
  }
  
  *FadeOut(): Generator<YieldInstruction | null> {
    let alpha = 1.0;
    while (alpha > 0) {
      alpha -= 0.1;
      this.SetAlpha(alpha);
      yield new WaitForSeconds(0.1);
    }
  }
}
```

### Messaging Methods

```typescript
class MonoBehaviour extends Behaviour {
  /**
   * Calls the method named methodName on every MonoBehaviour in this game object.
   * @param methodName - The name of the method to call
   * @param value - An optional parameter value to pass to the called method
   * @param options - Should an error be raised if the method doesn't exist on the target object?
   */
  SendMessage(methodName: string, value?: any, options?: SendMessageOptions): void;
  
  /**
   * Calls the method named methodName on every MonoBehaviour in this game object and on every ancestor of the behaviour.
   */
  SendMessageUpwards(methodName: string, value?: any, options?: SendMessageOptions): void;
  
  /**
   * Calls the method named methodName on every MonoBehaviour in this game object or any of its children.
   */
  BroadcastMessage(methodName: string, value?: any, options?: SendMessageOptions): void;
  
  /**
   * Invokes the method methodName in time seconds.
   * @param methodName - The name of the method to invoke
   * @param time - Time in seconds before the method is invoked
   */
  Invoke(methodName: string, time: number): void;
  
  /**
   * Invokes the method methodName in time seconds, then repeatedly every repeatRate seconds.
   */
  InvokeRepeating(methodName: string, time: number, repeatRate: number): void;
  
  /**
   * Cancels all Invoke calls on this MonoBehaviour.
   */
  CancelInvoke(): void;
  CancelInvoke(methodName: string): void;
  
  /**
   * Is any invoke on methodName pending?
   */
  IsInvoking(methodName: string): boolean;
}

enum SendMessageOptions {
  RequireReceiver = 0,
  DontRequireReceiver = 1,
}
```

---

## Camera

A Camera is a device through which the player views the world.

### Properties

```typescript
class Camera extends Behaviour {
  // The field of view of the camera in degrees
  fieldOfView: number;
  
  // The near clipping plane distance
  nearClipPlane: number;
  
  // The far clipping plane distance
  farClipPlane: number;
  
  // The aspect ratio (width divided by height)
  aspect: number;
  
  // How the camera clears the background
  clearFlags: CameraClearFlags;
  
  // The color with which the screen will be cleared
  backgroundColor: Color;
  
  // The rendering path that should be used for this camera
  renderingPath: RenderingPath;
  
  // Camera's depth in the camera rendering order
  depth: number;
  
  // Destination render texture (null for screen)
  targetTexture: RenderTexture | null;
  
  // Is the camera orthographic (true) or perspective (false)?
  orthographic: boolean;
  
  // Camera's half-size when in orthographic mode
  orthographicSize: number;
  
  // The camera we are currently rendering with (Read Only)
  static readonly current: Camera;
  
  // The first enabled camera tagged "MainCamera" (Read Only)
  static readonly main: Camera;
  
  // Matrix that transforms from world to camera space
  readonly worldToCameraMatrix: Matrix4x4;
  
  // The projection matrix
  projectionMatrix: Matrix4x4;
  
  // Where on the screen is the camera rendered in normalized coordinates
  rect: Rect;
  
  // Where on the screen is the camera rendered in pixel coordinates
  pixelRect: Rect;
  
  // The rendering LayerMask
  cullingMask: number;
  
  // The camera's view direction in world space
  readonly forward: Vector3;
  
  // Event mask for selective rendering per-camera
  eventMask: number;
  
  // Stereoscopic rendering
  stereoTargetEye: StereoTargetEyeMask;
}
```

### Methods

```typescript
class Camera extends Behaviour {
  /**
   * Returns a ray going from camera through a screen point.
   * @param pos - A 3D point in screen coordinates (pixel coordinates)
   * @returns Ray from camera origin through screen position
   */
  ScreenPointToRay(pos: Vector3): Ray;
  
  /**
   * Transforms position from screen space into world space.
   */
  ScreenToWorldPoint(position: Vector3): Vector3;
  
  /**
   * Transforms position from world space into screen space.
   */
  WorldToScreenPoint(position: Vector3): Vector3;
  
  /**
   * Transforms position from screen space into viewport space.
   */
  ScreenToViewportPoint(position: Vector3): Vector3;
  
  /**
   * Transforms position from viewport space into screen space.
   */
  ViewportToScreenPoint(position: Vector3): Vector3;
  
  /**
   * Transforms position from viewport space into world space.
   */
  ViewportToWorldPoint(position: Vector3): Vector3;
  
  /**
   * Transforms position from world space into viewport space.
   */
  WorldToViewportPoint(position: Vector3): Vector3;
  
  /**
   * Returns a ray going from camera through a viewport point.
   * @param pos - Viewport position in normalized coordinates (0 to 1)
   */
  ViewportPointToRay(pos: Vector3): Ray;
  
  /**
   * Render the camera manually.
   */
  Render(): void;
  
  /**
   * Render into a cubemap from this camera.
   */
  RenderToCubemap(cubemap: Cubemap): boolean;
  RenderToCubemap(cubemap: RenderTexture): boolean;
  
  /**
   * Make the camera render with shader replacement.
   */
  RenderWithShader(shader: Shader, replacementTag: string): void;
  
  /**
   * Revert the aspect ratio to the screen's aspect ratio.
   */
  ResetAspect(): void;
  
  /**
   * Revert the projection matrix to the default projection matrix.
   */
  ResetProjectionMatrix(): void;
  
  /**
   * Revert the worldToCameraMatrix to the default matrix.
   */
  ResetWorldToCameraMatrix(): void;
  
  /**
   * Fills an array of Camera with the current cameras in the Scene, without allocating a new array.
   */
  static GetAllCameras(cameras: Camera[]): number;
}

enum CameraClearFlags {
  Skybox = 1,
  SolidColor = 2,
  Depth = 3,
  Nothing = 4,
}

enum RenderingPath {
  UsePlayerSettings = -1,
  Forward = 1,
  Deferred = 2,
}

enum StereoTargetEyeMask {
  None = 0,
  Left = 1,
  Right = 2,
  Both = 3,
}
```

---

## Rigidbody

Control of an object's position through physics simulation.

### Properties

```typescript
class Rigidbody extends Component {
  // The velocity vector of the rigidbody in world space
  velocity: Vector3;
  
  // The angular velocity vector of the rigidbody in world space (radians per second)
  angularVelocity: Vector3;
  
  // The drag of the object (air resistance)
  drag: number;
  
  // The angular drag of the object
  angularDrag: number;
  
  // The mass of the rigidbody
  mass: number;
  
  // Controls whether gravity affects this rigidbody
  useGravity: boolean;
  
  // Maximum velocity of a rigidbody when moving out of penetrating state
  maxDepenetrationVelocity: number;
  
  // Controls whether physics affects the rigidbody
  isKinematic: boolean;
  
  // Controls whether physics will change the rotation of the object
  freezeRotation: boolean;
  
  // Controls which degrees of freedom are allowed for the simulation of this Rigidbody
  constraints: RigidbodyConstraints;
  
  // The Rigidbody's collision detection mode
  collisionDetectionMode: CollisionDetectionMode;
  
  // The center of mass relative to the transform's origin
  centerOfMass: Vector3;
  
  // The center of mass in world space (Read Only)
  readonly worldCenterOfMass: Vector3;
  
  // The diagonal inertia tensor of mass relative to the center of mass
  inertiaTensor: Vector3;
  
  // The rotation of the inertia tensor
  inertiaTensorRotation: Quaternion;
  
  // Interpolation allows you to smooth out the effect of running physics at a fixed frame rate
  interpolation: RigidbodyInterpolation;
  
  // The solverIterations determines how accurately Rigidbody joints and collision contacts are resolved
  solverIterations: number;
  
  // The solverVelocityIterations affects how accurately Rigidbody joints and collision contacts are resolved during the physics simulation
  solverVelocityIterations: number;
  
  // The maxAngularVelocity is the maximum angular velocity of the rigidbody
  maxAngularVelocity: number;
  
  // The position of the rigidbody
  position: Vector3;
  
  // The rotation of the Rigidbody
  rotation: Quaternion;
}
```

### Methods

```typescript
class Rigidbody extends Component {
  /**
   * Adds a force to the Rigidbody.
   * @param force - Force vector in world coordinates
   * @param mode - Type of force to apply
   */
  AddForce(force: Vector3, mode?: ForceMode): void;
  AddForce(x: number, y: number, z: number, mode?: ForceMode): void;
  
  /**
   * Adds a force to the Rigidbody relative to its coordinate system.
   */
  AddRelativeForce(force: Vector3, mode?: ForceMode): void;
  AddRelativeForce(x: number, y: number, z: number, mode?: ForceMode): void;
  
  /**
   * Adds a torque to the rigidbody.
   * @param torque - Torque vector in world coordinates
   */
  AddTorque(torque: Vector3, mode?: ForceMode): void;
  AddTorque(x: number, y: number, z: number, mode?: ForceMode): void;
  
  /**
   * Adds a torque to the rigidbody relative to its coordinate system.
   */
  AddRelativeTorque(torque: Vector3, mode?: ForceMode): void;
  AddRelativeTorque(x: number, y: number, z: number, mode?: ForceMode): void;
  
  /**
   * Applies force at position. This will result in a torque and force applied to the object.
   */
  AddForceAtPosition(force: Vector3, position: Vector3, mode?: ForceMode): void;
  
  /**
   * Adds an explosion force to the rigidbody.
   * @param explosionForce - The force of the explosion
   * @param explosionPosition - The centre of the sphere within which the explosion has its effect
   * @param explosionRadius - The radius of the sphere within which the explosion has its effect
   * @param upwardsModifier - Adjustment to the apparent position of the explosion to make it seem to lift objects
   */
  AddExplosionForce(
    explosionForce: number,
    explosionPosition: Vector3,
    explosionRadius: number,
    upwardsModifier?: number,
    mode?: ForceMode
  ): void;
  
  /**
   * The closest point to the bounding box of the attached colliders.
   */
  ClosestPointOnBounds(position: Vector3): Vector3;
  
  /**
   * The velocity of the rigidbody at the point worldPoint in global space.
   */
  GetPointVelocity(worldPoint: Vector3): Vector3;
  
  /**
   * The velocity relative to the rigidbody at the point relativePoint.
   */
  GetRelativePointVelocity(relativePoint: Vector3): Vector3;
  
  /**
   * Tests if a rigidbody would collide with anything, if it was moved through the Scene.
   */
  SweepTest(direction: Vector3, hitInfo: RaycastHit[], maxDistance?: number): boolean;
  
  /**
   * Like Rigidbody.SweepTest, but returns all hits.
   */
  SweepTestAll(direction: Vector3, maxDistance?: number): RaycastHit[];
  
  /**
   * Moves the kinematic Rigidbody towards position.
   * @param position - Target position for the Rigidbody
   */
  MovePosition(position: Vector3): void;
  
  /**
   * Rotates the rigidbody to rotation.
   */
  MoveRotation(rot: Quaternion): void;
  
  /**
   * Forces a rigidbody to sleep at least one frame.
   */
  Sleep(): void;
  
  /**
   * Is the rigidbody sleeping?
   */
  IsSleeping(): boolean;
  
  /**
   * Forces a rigidbody to wake up.
   */
  WakeUp(): void;
  
  /**
   * Reset the center of mass of the rigidbody.
   */
  ResetCenterOfMass(): void;
  
  /**
   * Reset the inertia tensor value and rotation.
   */
  ResetInertiaTensor(): void;
}

enum ForceMode {
  Force = 0,          // Add continuous force using mass (F = ma)
  Acceleration = 5,   // Add continuous acceleration (F = a), ignoring mass
  Impulse = 1,        // Add instant force impulse using mass (F = m*Δv)
  VelocityChange = 2, // Add instant velocity change (F = Δv), ignoring mass
}

enum CollisionDetectionMode {
  Discrete = 0,
  Continuous = 1,
  ContinuousDynamic = 2,
  ContinuousSpeculative = 3,
}

enum RigidbodyInterpolation {
  None = 0,
  Interpolate = 1,
  Extrapolate = 2,
}

enum RigidbodyConstraints {
  None = 0,
  FreezePositionX = 2,
  FreezePositionY = 4,
  FreezePositionZ = 8,
  FreezeRotationX = 16,
  FreezeRotationY = 32,
  FreezeRotationZ = 64,
  FreezePosition = 14,  // X | Y | Z
  FreezeRotation = 112, // X | Y | Z
  FreezeAll = 126,      // Position | Rotation
}
```

---

## AudioSource

A representation of audio sources in 3D space.

### Properties

```typescript
class AudioSource extends Behaviour {
  // The default AudioClip to play
  clip: AudioClip | null;
  
  // The volume of the audio source (0.0 to 1.0)
  volume: number;
  
  // The pitch of the audio source (-3 to 3, 1 is normal)
  pitch: number;
  
  // Playback position in seconds
  time: number;
  
  // Playback position in PCM samples
  timeSamples: number;
  
  // Is the clip playing right now? (Read Only)
  readonly isPlaying: boolean;
  
  // Is the audio clip looping?
  loop: boolean;
  
  // This makes the audio source not take into account the volume of the audio listener
  ignoreListenerVolume: boolean;
  
  // If set to true, the audio source will automatically start playing on awake
  playOnAwake: boolean;
  
  // Allows AudioSource to play even though AudioListener.pause is set to true
  ignoreListenerPause: boolean;
  
  // Un- / Mutes the AudioSource
  mute: boolean;
  
  // Bypass effects (Applied from filter components or global listener filters)
  bypassEffects: boolean;
  
  // Bypass the listener effects
  bypassListenerEffects: boolean;
  
  // Bypass the reverb zones
  bypassReverbZones: boolean;
  
  // The priority of the audio source among all the ones that coexist in the scene
  priority: number;
  
  // Pan stereophonic sounds (-1.0 to 1.0, 0 is center)
  panStereo: number;
  
  // Sets how much this AudioSource is affected by 3D space calculations (0.0 to 1.0)
  spatialBlend: number;
  
  // The amount by which the signal from the AudioSource will be mixed into the global reverb (0 to 1.1)
  reverbZoneMix: number;
  
  // Sets the Doppler scale for this AudioSource
  dopplerLevel: number;
  
  // The spread angle (in degrees) of a 3d stereo or multichannel sound in speaker space
  spread: number;
  
  // Sets/Gets how the AudioSource attenuates over distance
  rolloffMode: AudioRolloffMode;
  
  // Within the MinDistance, the volume will stay at the loudest possible
  minDistance: number;
  
  // MaxDistance is the distance a sound stops attenuating at
  maxDistance: number;
  
  // The target group to which the AudioSource should route its signal
  outputAudioMixerGroup: AudioMixerGroup | null;
}
```

### Methods

```typescript
class AudioSource extends Behaviour {
  /**
   * Plays the clip.
   * @param delay - Delay in seconds before playing
   */
  Play(delay?: number): void;
  
  /**
   * Plays the clip with a delay specified in seconds
   */
  PlayDelayed(delay: number): void;
  
  /**
   * Plays the clip at a specific time on the absolute time-line
   */
  PlayScheduled(time: number): void;
  
  /**
   * Plays an AudioClip, and scales the AudioSource volume by volumeScale.
   * @param clip - The AudioClip to play
   * @param volumeScale - The scale of the volume (0-1)
   */
  PlayOneShot(clip: AudioClip, volumeScale?: number): void;
  
  /**
   * Changes the time at which a sound that has already been scheduled to play will start.
   */
  SetScheduledStartTime(time: number): void;
  
  /**
   * Changes the time at which a sound that has already been scheduled to play will end.
   */
  SetScheduledEndTime(time: number): void;
  
  /**
   * Stops playing the clip.
   */
  Stop(): void;
  
  /**
   * Pauses playing the clip.
   */
  Pause(): void;
  
  /**
   * Unpause the paused playback of this AudioSource.
   */
  UnPause(): void;
  
  /**
   * Plays an AudioClip at a given position in world space.
   */
  static PlayClipAtPoint(clip: AudioClip, position: Vector3, volume?: number): void;
}

enum AudioRolloffMode {
  Logarithmic = 0,
  Linear = 1,
  Custom = 2,
}
```

---

## ParticleSystem

Script interface for the Particle System component.

### Properties

```typescript
class ParticleSystem extends Component {
  // Determines whether the Particle System is playing
  readonly isPlaying: boolean;
  
  // Determines whether the Particle System is emitting particles
  readonly isEmitting: boolean;
  
  // Determines whether the Particle System is in the stopped state
  readonly isStopped: boolean;
  
  // Determines whether the Particle System is paused
  readonly isPaused: boolean;
  
  // The current number of particles (Read Only)
  readonly particleCount: number;
  
  // Playback position in seconds
  time: number;
  
  // Random seed used for the Particle System emission
  randomSeed: number;
  
  // Override the random seed used for the Particle System emission
  useAutoRandomSeed: boolean;
  
  // Main module
  readonly main: MainModule;
  
  // Emission module
  readonly emission: EmissionModule;
  
  // Shape module
  readonly shape: ShapeModule;
  
  // Velocity over lifetime module
  readonly velocityOverLifetime: VelocityOverLifetimeModule;
  
  // Limit velocity over lifetime module
  readonly limitVelocityOverLifetime: LimitVelocityOverLifetimeModule;
  
  // Inherit velocity module
  readonly inheritVelocity: InheritVelocityModule;
  
  // Force over lifetime module
  readonly forceOverLifetime: ForceOverLifetimeModule;
  
  // Color over lifetime module
  readonly colorOverLifetime: ColorOverLifetimeModule;
  
  // Color by speed module
  readonly colorBySpeed: ColorBySpeedModule;
  
  // Size over lifetime module
  readonly sizeOverLifetime: SizeOverLifetimeModule;
  
  // Size by speed module
  readonly sizeBySpeed: SizeBySpeedModule;
  
  // Rotation over lifetime module
  readonly rotationOverLifetime: RotationOverLifetimeModule;
  
  // Rotation by speed module
  readonly rotationBySpeed: RotationBySpeedModule;
  
  // External forces module
  readonly externalForces: ExternalForcesModule;
  
  // Noise module
  readonly noise: NoiseModule;
  
  // Collision module
  readonly collision: CollisionModule;
  
  // Trigger module
  readonly trigger: TriggerModule;
  
  // Sub emitters module
  readonly subEmitters: SubEmittersModule;
  
  // Texture sheet animation module
  readonly textureSheetAnimation: TextureSheetAnimationModule;
  
  // Lights module
  readonly lights: LightsModule;
  
  // Trails module
  readonly trails: TrailsModule;
  
  // Custom data module
  readonly customData: CustomDataModule;
}
```

### Methods

```typescript
class ParticleSystem extends Component {
  /**
   * Starts the Particle System.
   * @param withChildren - Play all child particle systems as well
   */
  Play(withChildren?: boolean): void;
  
  /**
   * Pauses the system so no new particles are emitted and the existing particles are not updated.
   * @param withChildren - Pause all child particle systems as well
   */
  Pause(withChildren?: boolean): void;
  
  /**
   * Stops playing the Particle System using the supplied stop behaviour.
   * @param withChildren - Stop all child particle systems as well
   * @param stopBehavior - Stop emitting or stop emitting and clear the system
   */
  Stop(withChildren?: boolean, stopBehavior?: ParticleSystemStopBehavior): void;
  
  /**
   * Removes all particles in the Particle System.
   * @param withChildren - Clear all child particle systems as well
   */
  Clear(withChildren?: boolean): void;
  
  /**
   * Does the Particle System contain any live particles, or will it produce more?
   * @param withChildren - Check all child particle systems as well
   */
  IsAlive(withChildren?: boolean): boolean;
  
  /**
   * Emit count particles immediately.
   * @param count - Number of particles to emit
   */
  Emit(count: number): void;
  Emit(emitParams: EmitParams, count: number): void;
  
  /**
   * Fast-forwards the Particle System by simulating particles over the given period of time, then pauses it.
   * @param t - Time to advance the ParticleSystem simulation by (in seconds)
   * @param withChildren - Fast-forward all child particle systems as well
   * @param restart - Restart and start from the beginning
   * @param fixedTimeStep - Only update the system at fixed intervals
   */
  Simulate(t: number, withChildren?: boolean, restart?: boolean, fixedTimeStep?: boolean): void;
  
  /**
   * Triggers the specified sub emitter on all particles of the Particle System.
   */
  TriggerSubEmitter(subEmitterIndex: number): void;
  
  /**
   * Get the particles of this Particle System.
   * @param particles - Output array of particles
   * @returns The number of particles written to the input array
   */
  GetParticles(particles: Particle[]): number;
  
  /**
   * Sets the particles of this Particle System.
   * @param particles - Input array of particles
   * @param size - The number of elements in the particles array that is written to the Particle System
   */
  SetParticles(particles: Particle[], size: number): void;
}

enum ParticleSystemStopBehavior {
  StopEmittingAndClear = 0,
  StopEmitting = 1,
}

// Main module interface
interface MainModule {
  duration: number;
  loop: boolean;
  prewarm: boolean;
  startDelay: MinMaxCurve;
  startLifetime: MinMaxCurve;
  startSpeed: MinMaxCurve;
  startSize3D: boolean;
  startSize: MinMaxCurve;
  startSizeX: MinMaxCurve;
  startSizeY: MinMaxCurve;
  startSizeZ: MinMaxCurve;
  startRotation3D: boolean;
  startRotation: MinMaxCurve;
  startRotationX: MinMaxCurve;
  startRotationY: MinMaxCurve;
  startRotationZ: MinMaxCurve;
  startColor: MinMaxGradient;
  gravityModifier: MinMaxCurve;
  simulationSpace: ParticleSystemSimulationSpace;
  simulationSpeed: number;
  scalingMode: ParticleSystemScalingMode;
  playOnAwake: boolean;
  maxParticles: number;
}

// Emission module interface
interface EmissionModule {
  enabled: boolean;
  rateOverTime: MinMaxCurve;
  rateOverDistance: MinMaxCurve;
  bursts: Burst[];
  burstCount: number;
  
  SetBurst(index: number, burst: Burst): void;
  GetBurst(index: number): Burst;
}

// Shape module interface
interface ShapeModule {
  enabled: boolean;
  shapeType: ParticleSystemShapeType;
  angle: number;
  radius: number;
  radiusThickness: number;
  arc: number;
  arcMode: ParticleSystemShapeMultiModeValue;
  arcSpread: number;
  arcSpeed: MinMaxCurve;
  length: number;
  boxThickness: Vector3;
  mesh: Mesh | null;
  meshRenderer: MeshRenderer | null;
  skinnedMeshRenderer: SkinnedMeshRenderer | null;
  sprite: Sprite | null;
  spriteRenderer: SpriteRenderer | null;
  position: Vector3;
  rotation: Vector3;
  scale: Vector3;
  alignToDirection: boolean;
  randomDirectionAmount: number;
  sphericalDirectionAmount: number;
  randomPositionAmount: number;
}

enum ParticleSystemShapeType {
  Sphere = 0,
  SphereShell = 1,
  Hemisphere = 2,
  HemisphereShell = 3,
  Cone = 4,
  Box = 5,
  Mesh = 6,
  ConeShell = 7,
  ConeVolume = 8,
  ConeVolumeShell = 9,
  Circle = 10,
  CircleEdge = 11,
  SingleSidedEdge = 12,
  MeshRenderer = 13,
  SkinnedMeshRenderer = 14,
  BoxShell = 15,
  BoxEdge = 16,
  Donut = 17,
  Rectangle = 18,
  Sprite = 19,
  SpriteRenderer = 20,
}
```

---

_[This document continues with complete API references for all other Unity components. Each component should have similar level of detail with all properties, methods, events, and enums clearly documented.]_

**Total components to document:** 150+ core Unity components

**Implementation note for Claude Code:**
- Always refer to this document when implementing any component
- The API surface must EXACTLY match Unity's API (same method names, parameters, return types)
- Add TSDoc comments to all public methods and properties
- Include usage examples in comments
- Write comprehensive tests for each component (>80% coverage)
