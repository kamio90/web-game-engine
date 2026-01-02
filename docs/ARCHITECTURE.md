# Web Game Engine - Architecture Overview

## 🏗️ System Architecture

Web Game Engine follows a **modular, layered architecture** inspired by Unity's design but optimized for web platform constraints and modern TypeScript development.

## 📐 Core Architectural Principles

### 1. Entity Component System (ECS)
- **GameObject** - Base entity class (like Unity's GameObject)
- **Component** - Modular behavior units attached to GameObjects
- **Transform** - Hierarchical scene graph with parent-child relationships
- **MonoBehaviour** - Scriptable component with lifecycle methods

### 2. Data-Oriented Design
- **Cache-Friendly Data Layout** - Components stored in contiguous arrays when possible
- **Job System** - Parallel processing using Web Workers
- **Burst Compilation** - Critical paths compiled to WebAssembly for performance
- **Chunk Iteration** - Process similar components in batches

### 3. Separation of Concerns
- **Core**: Engine fundamentals (ECS, scene graph, serialization)
- **Runtime**: Execution loop, time management, lifecycle
- **Subsystems**: Physics, rendering, audio, networking (loosely coupled)
- **Editor**: Separate from runtime, can run without runtime overhead
- **Build**: Compile-time tree-shaking, dead code elimination

### 4. Web-First Design
- **Zero Native Dependencies** - Pure web APIs (WebGL, WebAudio, WebRTC)
- **Progressive Enhancement** - WebGPU when available, fallback to WebGL 2.0
- **Streaming-First** - Async loading, lazy evaluation, no blocking operations
- **Memory Conscious** - Explicit disposal, weak references, garbage collection optimization

## 🧱 Layer Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                        Editor Layer                          │
│  (React UI, Inspector, Hierarchy, Scene View, Asset DB)     │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                     Application Layer                        │
│   (Scene Management, Prefab System, Asset Loading)          │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      Runtime Layer                           │
│  (Game Loop, Time, Input, Lifecycle Management)             │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌──────────────────┬────────────────┬──────────────────────────┐
│  Rendering       │    Physics     │      Audio               │
│  (Three.js)      │  (Rapier.js)   │  (Web Audio API)         │
├──────────────────┼────────────────┼──────────────────────────┤
│  Animation       │   Particles    │      UI                  │
│  (Timeline)      │   (Shuriken)   │   (UI Toolkit)           │
├──────────────────┼────────────────┼──────────────────────────┤
│  AI/Navigation   │   Networking   │      XR                  │
│  (NavMesh)       │ (WebRTC/WS)    │   (WebXR)                │
└──────────────────┴────────────────┴──────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                        Core Layer                            │
│      (ECS, GameObject, Component, Transform, Events)         │
└─────────────────────────────────────────────────────────────┘
                              ↓
┌─────────────────────────────────────────────────────────────┐
│                      Platform Layer                          │
│    (Web APIs: Canvas, WebGL, WebAudio, WebRTC, WebXR)       │
└─────────────────────────────────────────────────────────────┘
```

## 🔄 Execution Flow

### Engine Boot Sequence
```
1. Platform Detection
   ├─ Check WebGL 2.0 / WebGPU support
   ├─ Detect audio context availability
   ├─ Initialize input system
   └─ Setup worker threads

2. Core Initialization
   ├─ Create ECS world
   ├─ Initialize GameObject registry
   ├─ Setup component factories
   └─ Load core systems

3. Subsystem Startup
   ├─ Initialize renderer (Three.js scene)
   ├─ Initialize physics world (Rapier)
   ├─ Initialize audio context
   ├─ Initialize networking layer
   └─ Initialize XR session (if available)

4. Scene Loading
   ├─ Deserialize scene from JSON/YAML
   ├─ Instantiate GameObjects
   ├─ Resolve references (GUIDs)
   ├─ Call Awake() on all components
   └─ Call OnEnable() on enabled components

5. First Frame
   ├─ Call Start() on new components
   ├─ Begin game loop (requestAnimationFrame)
   └─ Ready to receive input
```

### Frame Loop (60 FPS target)
```
┌─ requestAnimationFrame ──────────────────────────────────┐
│                                                           │
│  1. Time Management                                       │
│     ├─ Calculate deltaTime                               │
│     ├─ Update Time.time, Time.unscaledTime              │
│     └─ Check FixedUpdate accumulator                     │
│                                                           │
│  2. Input Processing                                      │
│     ├─ Poll keyboard/mouse/gamepad state                 │
│     ├─ Process touch events                              │
│     └─ Dispatch Input System events                      │
│                                                           │
│  3. FixedUpdate Loop (Physics Tick - usually 50Hz)       │
│     ├─ While (timeAccumulator >= fixedDeltaTime):        │
│     │   ├─ Call FixedUpdate() on all MonoBehaviours      │
│     │   ├─ Step physics simulation (Rapier.step)         │
│     │   ├─ Process physics callbacks (collisions)        │
│     │   └─ Decrement accumulator                         │
│     └─ Interpolate physics state for rendering           │
│                                                           │
│  4. Update Loop                                           │
│     ├─ Call Update() on all MonoBehaviours               │
│     ├─ Process coroutines (yield returns)                │
│     ├─ Update animation state machines                   │
│     ├─ Update particle systems                           │
│     └─ Process AI/navigation                             │
│                                                           │
│  5. Animation Update                                      │
│     ├─ Sample animation clips                            │
│     ├─ Blend animation states                            │
│     ├─ Apply IK constraints                              │
│     └─ Write to Transform hierarchy                      │
│                                                           │
│  6. LateUpdate Loop                                       │
│     ├─ Call LateUpdate() on all MonoBehaviours           │
│     └─ Update camera position (follow scripts)           │
│                                                           │
│  7. Rendering                                             │
│     ├─ Culling (frustum, occlusion)                      │
│     ├─ Sort render queue (opaque → transparent)          │
│     ├─ Update shader uniforms (time, lights, camera)     │
│     ├─ Shadow map passes                                 │
│     ├─ Main render pass                                  │
│     ├─ Post-processing stack                             │
│     └─ UI rendering (Canvas, UI Toolkit)                 │
│                                                           │
│  8. Audio Update                                          │
│     ├─ Update 3D audio source positions                  │
│     ├─ Process audio mixer snapshots                     │
│     └─ Stream audio chunks (if needed)                   │
│                                                           │
│  9. Networking                                            │
│     ├─ Send network variable deltas                      │
│     ├─ Process incoming network messages                 │
│     └─ Update network transforms                         │
│                                                           │
│  10. Cleanup                                              │
│      ├─ Destroy queued GameObjects                       │
│      ├─ Remove destroyed components                      │
│      └─ Run garbage collection hints (weak refs)         │
│                                                           │
│  11. Profiling                                            │
│      ├─ Capture frame time breakdown                     │
│      ├─ Record draw calls, triangle count               │
│      └─ Update memory statistics                         │
│                                                           │
└───────────────────────────── next frame ─────────────────┘
```

## 🧩 Component System

### Component Lifecycle
```typescript
class MyComponent extends MonoBehaviour {
  // 1. Component created (constructor)
  constructor() {
    super();
    // Initialize references, but don't access other components yet
  }

  // 2. GameObject/Component relationships established
  Awake() {
    // GetComponent calls are safe here
    // Initialize component state
    // Subscribe to events
  }

  // 3. Component enabled in scene
  OnEnable() {
    // Register with systems (input, networking)
    // Start listening to events
  }

  // 4. First frame after being enabled
  Start() {
    // All other Start() have been called
    // Safe to access other components
    // Start coroutines
  }

  // 5. Physics update (fixed timestep)
  FixedUpdate() {
    // Apply forces to rigidbodies
    // Physics-based logic
  }

  // 6. Regular update (variable timestep)
  Update() {
    // Game logic
    // Input handling
    // State machines
  }

  // 7. After all Update() calls
  LateUpdate() {
    // Camera follow logic
    // Finalize positions before rendering
  }

  // 8. Component disabled
  OnDisable() {
    // Unregister from systems
    // Stop listening to events
  }

  // 9. Component/GameObject destroyed
  OnDestroy() {
    // Cleanup resources
    // Unsubscribe from events
    // Dispose of manual allocations
  }
}
```

### Component Communication Patterns

#### 1. Direct Reference (Fastest)
```typescript
// Serialized in inspector
@SerializeField
private otherComponent: OtherComponent;

Update() {
  this.otherComponent.DoSomething();
}
```

#### 2. GetComponent (Cached)
```typescript
private cachedComponent: OtherComponent;

Awake() {
  this.cachedComponent = this.GetComponent(OtherComponent);
}

Update() {
  this.cachedComponent.DoSomething();
}
```

#### 3. Event System (Decoupled)
```typescript
// Publisher
this.gameObject.SendMessage('OnDamage', damage);

// Subscriber (in another component)
OnDamage(damage: number) {
  this.health -= damage;
}
```

#### 4. Singleton Pattern (Global Access)
```typescript
class GameManager extends MonoBehaviour {
  private static instance: GameManager;
  
  Awake() {
    if (GameManager.instance) {
      GameObject.Destroy(this.gameObject);
      return;
    }
    GameManager.instance = this;
    GameObject.DontDestroyOnLoad(this.gameObject);
  }
  
  static get Instance() {
    return GameManager.instance;
  }
}

// Usage anywhere
GameManager.Instance.DoSomething();
```

## 🎨 Rendering Architecture

### Render Pipeline Abstraction
```
┌─────────────────────────────────────────────────┐
│         Render Pipeline Interface                │
│  (Abstract: setup, render, cleanup methods)      │
└─────────────────────────────────────────────────┘
                     ↓
        ┌────────────┴────────────┐
        ↓                         ↓
┌──────────────────┐    ┌────────────────────┐
│  Universal RP    │    │ High Definition RP │
│  (Forward)       │    │    (Deferred)      │
└──────────────────┘    └────────────────────┘
```

### Universal Render Pipeline (URP) Flow
```
1. Culling Phase
   ├─ Frustum culling (camera view)
   ├─ Occlusion culling (pre-computed PVS)
   ├─ LOD selection based on distance
   └─ Sort render queue (opaque: front-to-back, transparent: back-to-front)

2. Shadow Pass
   ├─ For each shadow-casting light:
   │   ├─ Render depth from light's perspective
   │   └─ Store in shadow map texture
   └─ Cascade shadow maps for directional lights

3. Depth Prepass (optional, for mobile)
   ├─ Render opaque geometry (depth only)
   └─ Early-Z optimization for fragment shader

4. Opaque Pass
   ├─ Setup lighting uniforms
   ├─ Bind shadow maps
   ├─ For each opaque renderer:
   │   ├─ Bind material shader
   │   ├─ Bind textures (albedo, normal, metallic, etc.)
   │   ├─ Draw mesh
   │   └─ GPU instancing for identical materials
   └─ Result: Opaque color buffer + depth buffer

5. Skybox Pass
   └─ Render skybox at far plane (depth = 1.0)

6. Transparent Pass
   ├─ Disable depth writes
   ├─ For each transparent renderer (back-to-front):
   │   ├─ Blend with color buffer
   │   └─ Apply alpha blending
   └─ Result: Final color buffer with transparency

7. Post-Processing
   ├─ Render to temporary render target
   ├─ Apply effects chain:
   │   ├─ Bloom (blur bright areas)
   │   ├─ Depth of Field (focus blur)
   │   ├─ Motion Blur (velocity buffer)
   │   ├─ Color Grading (LUT)
   │   ├─ Tone Mapping (HDR → LDR)
   │   ├─ Vignette
   │   └─ Chromatic Aberration
   └─ Output to screen

8. UI Pass
   ├─ Render Canvas (screen space)
   ├─ UI Toolkit rendering
   └─ Gizmos (editor only)
```

### High Definition Render Pipeline (HDRP) Flow
```
1. G-Buffer Pass (Deferred Rendering)
   ├─ Render to Multiple Render Targets (MRTs):
   │   ├─ RT0: Albedo RGB + Occlusion A
   │   ├─ RT1: Normal XYZ + Roughness W
   │   ├─ RT2: Metallic R + Emission GBA
   │   └─ RT3: Depth + Stencil
   └─ Store material properties for lighting pass

2. Lighting Pass
   ├─ For each light (screen-space):
   │   ├─ Read G-Buffer textures
   │   ├─ Calculate lighting (PBR BRDF)
   │   ├─ Apply shadows
   │   └─ Accumulate in lighting buffer
   └─ Support for 100+ dynamic lights

3. Screen Space Reflections (SSR)
   ├─ Raymarch in screen space
   ├─ Sample color buffer at hit point
   └─ Blend with reflection probes

4. Screen Space Ambient Occlusion (SSAO)
   ├─ Sample depth buffer in hemisphere
   ├─ Calculate occlusion factor
   └─ Apply to ambient lighting

5. Volumetrics
   ├─ Volumetric fog (ray marching)
   ├─ Volumetric lighting (light shafts)
   └─ Render to 3D texture, upsample to full res

6. Forward Pass (Transparent + Special Materials)
   └─ Materials that can't be deferred (hair, subsurface scattering)

7. Post-Processing (same as URP)
```

## ⚙️ Physics Integration

### Physics Simulation (Rapier.js)

```
┌──────────────────────────────────────────────────┐
│           Unity API (Rigidbody, Collider)        │
└──────────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────────┐
│          Physics Adapter Layer                   │
│  (Translate Unity API → Rapier API)              │
└──────────────────────────────────────────────────┘
                      ↓
┌──────────────────────────────────────────────────┐
│            Rapier.js (WASM)                      │
│  (Collision Detection, Constraint Solver)        │
└──────────────────────────────────────────────────┘
```

### Physics Step
```typescript
FixedUpdate() {
  // 1. Sync Transform → Physics
  for (const rigidbody of this.rigidbodies) {
    if (!rigidbody.isKinematic) continue;
    const transform = rigidbody.gameObject.transform;
    rigidbody.rapierBody.setTranslation(transform.position);
    rigidbody.rapierBody.setRotation(transform.rotation);
  }

  // 2. Step Physics Simulation (50Hz typically)
  this.physicsWorld.step();

  // 3. Sync Physics → Transform
  for (const rigidbody of this.rigidbodies) {
    if (rigidbody.isKinematic) continue;
    const rapierPos = rigidbody.rapierBody.translation();
    const rapierRot = rigidbody.rapierBody.rotation();
    rigidbody.gameObject.transform.position = rapierPos;
    rigidbody.gameObject.transform.rotation = rapierRot;
  }

  // 4. Process Collision Events
  this.physicsWorld.forEachCollisionPair((handle1, handle2, started) => {
    const body1 = this.getBodyByHandle(handle1);
    const body2 = this.getBodyByHandle(handle2);
    
    if (started) {
      body1.gameObject.SendMessage('OnCollisionEnter', body2);
      body2.gameObject.SendMessage('OnCollisionEnter', body1);
    }
  });

  // 5. Process Trigger Events
  this.physicsWorld.forEachActiveContactPair((handle1, handle2) => {
    // Similar to collisions but for triggers
  });
}
```

### Physics Performance Optimization
- **Spatial Partitioning**: Broad-phase collision using AABB trees
- **Sleeping**: Inactive bodies don't simulate until disturbed
- **Continuous Collision Detection (CCD)**: For fast-moving objects
- **Collision Layers**: Matrix-based filtering (32x32 boolean matrix)
- **Fixed Timestep**: Decoupled from frame rate for determinism

## 🎵 Audio Architecture

### Audio System Design
```
┌────────────────────────────────────────────────┐
│         Unity Audio API                        │
│  (AudioSource, AudioClip, AudioListener)       │
└────────────────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────────────┐
│         Audio Mixer System                     │
│  (Groups, Snapshots, Effects, Ducking)         │
└────────────────────────────────────────────────┘
                    ↓
┌────────────────────────────────────────────────┐
│         Web Audio API                          │
│  (AudioContext, GainNode, PannerNode, etc.)    │
└────────────────────────────────────────────────┘
```

### Audio Mixer Graph
```
                     Master
                       │
        ┌──────────────┼──────────────┐
        ↓              ↓              ↓
      Music           SFX            Voice
        │              │              │
    [Effects]      [Effects]      [Effects]
        │              │              │
    [Reverb]       [Distortion]   [LowPass]
        │              │              │
        └──────────────┴──────────────┘
                       ↓
                   Output
```

### 3D Spatial Audio
```typescript
class AudioSource {
  Update() {
    if (!this.spatialBlend) return;
    
    const listener = AudioListener.main;
    const distance = Vector3.Distance(
      this.transform.position,
      listener.transform.position
    );
    
    // Distance attenuation
    const volume = this.CalculateVolumeRolloff(distance);
    this.gainNode.gain.value = volume;
    
    // 3D panning (HRTF)
    const relativePos = this.transform.position.sub(listener.transform.position);
    this.pannerNode.setPosition(relativePos.x, relativePos.y, relativePos.z);
    
    // Doppler effect
    const relativeVelocity = this.GetRelativeVelocity(listener);
    this.pannerNode.dopplerFactor = this.dopplerLevel;
  }
}
```

## 🌐 Networking Architecture

### Network Topology
```
Client-Server (Authoritative)
┌──────────┐     ┌──────────┐     ┌──────────┐
│ Client A │────▶│  Server  │◀────│ Client B │
└──────────┘     └──────────┘     └──────────┘
                      │
                      ↓
              [Game State]
              [Physics Sim]
              [Authority]

Peer-to-Peer (WebRTC)
┌──────────┐ ◀────▶ ┌──────────┐
│ Client A │        │ Client B │
└──────────┘        └──────────┘
     ◀───────────────────▶
     │       Mesh        │
     ↓                   ↓
┌──────────┐       ┌──────────┐
│ Client C │ ◀───▶ │ Client D │
└──────────┘       └──────────┘
```

### Network Variable Synchronization
```typescript
class NetworkBehaviour extends MonoBehaviour {
  @NetworkVariable({ sync: SyncMode.Owner })
  private position: Vector3;
  
  @NetworkVariable({ sync: SyncMode.Observers, reliability: Reliability.Reliable })
  private health: number;
  
  // Delta compression
  private lastSyncedPosition: Vector3;
  
  NetworkUpdate() {
    // Only send if changed significantly
    const deltaPos = this.position.sub(this.lastSyncedPosition);
    if (deltaPos.magnitude > this.positionThreshold) {
      this.SyncVariable('position', this.position);
      this.lastSyncedPosition = this.position.clone();
    }
  }
}
```

### Network Tick Rate vs Frame Rate
```
Frame Rate: 60 FPS (16.67ms per frame)
Network Tick: 20 Hz (50ms per tick)

Frame 1  2  3  4  5  6  7  8  9  10
 |   |  |  |  |  |  |  |  |  |  |
 └───┴──┴──┘  └──┴──┴──┘  └──┴──┴──┘
     Tick         Tick         Tick
```

### Client-Side Prediction & Server Reconciliation
```
1. Client predicts movement immediately (no lag)
2. Client sends input to server with sequence number
3. Server simulates authoritative movement
4. Server sends back position with sequence number
5. Client checks: if mismatch, rewind and replay inputs from that point
```

## 🔧 Build & Optimization

### Bundle Structure
```
dist/
├── engine.core.js          # Core ECS (50KB gzipped)
├── engine.runtime.js       # Runtime loop (20KB gzipped)
├── engine.renderer.js      # Three.js + rendering (200KB gzipped)
├── engine.physics.js       # Rapier (WASM + JS) (800KB gzipped)
├── engine.audio.js         # Audio system (30KB gzipped)
├── engine.ui.js            # UI Toolkit (80KB gzipped)
├── game.bundle.js          # User game code (varies)
└── assets/
    ├── scenes/
    ├── textures/
    ├── models/
    ├── audio/
    └── shaders/
```

### Code Splitting Strategy
```typescript
// Lazy load heavy subsystems
const physics = await import('@web-game-engine/physics');
const terrain = await import('@web-game-engine/terrain');
const particles = await import('@web-game-engine/particles');

// Load on-demand based on scene needs
if (scene.hasPhysics) {
  await this.loadPhysicsSubsystem();
}
```

### Asset Loading Pipeline
```
1. Asset Import (Editor)
   ├─ Detect asset type (texture, model, audio, etc.)
   ├─ Process asset (compress, optimize, generate mipmaps)
   ├─ Generate metadata (GUID, dependencies)
   └─ Store in asset database

2. Asset Bundle Creation (Build)
   ├─ Group assets by scene/addressable group
   ├─ Serialize to binary format
   ├─ Compress bundles (gzip/brotli)
   └─ Generate manifest (bundle map)

3. Runtime Asset Loading
   ├─ Request bundle from CDN
   ├─ Decompress bundle
   ├─ Deserialize assets
   ├─ Upload to GPU (textures, meshes)
   └─ Cache in memory
```

## 🎯 Performance Targets & Optimization

### Target Metrics
- **60 FPS** at 1080p on mid-range hardware (2020+ laptop)
- **10,000+ visible objects** with GPU instancing
- **100+ dynamic lights** (with HDRP deferred rendering)
- **< 100ms** scene load time for typical scene
- **< 50ms** engine initialization time

### Optimization Techniques

#### Rendering
- GPU Instancing (draw 10,000 identical objects in 1 draw call)
- Static/Dynamic Batching (combine meshes with same material)
- Frustum Culling (only render visible objects)
- Occlusion Culling (pre-computed PVS or GPU occlusion queries)
- LOD System (swap meshes based on distance)
- Texture Atlasing (combine small textures to reduce draw calls)
- Mipmapping (reduce texture bandwidth)
- Texture Compression (DXT, ETC2, ASTC)

#### Physics
- Spatial Hashing (broad-phase collision)
- Sleeping Bodies (don't simulate static objects)
- Simplified Colliders (use primitive shapes instead of mesh colliders)
- Physics Layers (avoid unnecessary collision checks)

#### Scripting
- Object Pooling (reuse GameObjects instead of Instantiate/Destroy)
- Caching GetComponent() (don't call every frame)
- Avoiding Allocations in Update() (no `new`, no lambdas, no LINQ)
- Coroutines instead of Update() for infrequent logic

#### Memory
- Texture Streaming (load high-res mips only when needed)
- Audio Streaming (stream large audio files)
- Asset Unloading (unload unused assets with Resources.UnloadUnusedAssets)
- Weak References (allow GC to collect unused references)

## 🧪 Testing Strategy

### Test Pyramid
```
           ┌─────────┐
          │   E2E    │  (10%)
         └───────────┘
        ┌─────────────┐
       │ Integration  │  (30%)
      └───────────────┘
     ┌─────────────────┐
    │    Unit Tests    │  (60%)
   └───────────────────┘
```

### Test Types

#### 1. Unit Tests (Jest)
```typescript
describe('Transform', () => {
  it('should calculate world position correctly', () => {
    const parent = new GameObject();
    const child = new GameObject();
    child.transform.SetParent(parent.transform);
    
    parent.transform.position = new Vector3(10, 0, 0);
    child.transform.localPosition = new Vector3(5, 0, 0);
    
    expect(child.transform.position).toEqual(new Vector3(15, 0, 0));
  });
});
```

#### 2. Integration Tests (Play Mode)
```typescript
describe('Physics Integration', () => {
  it('should apply gravity to rigidbody', async () => {
    const scene = await Scene.Load('TestScene');
    const obj = new GameObject();
    const rb = obj.AddComponent(Rigidbody);
    
    await WaitForSeconds(1.0);
    
    expect(obj.transform.position.y).toBeLessThan(0);
  });
});
```

#### 3. Performance Tests
```typescript
describe('Performance', () => {
  it('should render 10,000 objects at 60 FPS', () => {
    const objects = [];
    for (let i = 0; i < 10000; i++) {
      const obj = GameObject.CreatePrimitive(PrimitiveType.Cube);
      objects.push(obj);
    }
    
    const avgFPS = Profiler.MeasureFPS(100); // 100 frames
    expect(avgFPS).toBeGreaterThan(60);
  });
});
```

## 📊 Profiling & Debugging

### Profiler Modules
- **CPU Profiler**: Function call hierarchy, time per function
- **GPU Profiler**: Draw calls, shader compile time, GPU time
- **Memory Profiler**: Heap allocations, garbage collection, texture memory
- **Rendering Stats**: Triangle count, vertices, draw calls, batches
- **Physics Stats**: Active rigidbodies, collision pairs, raycast count

### Debugging Tools
- **Scene Inspector**: Runtime hierarchy view with component inspection
- **Console**: Logs with stack traces and source maps
- **Frame Debugger**: Step through render pipeline, inspect render targets
- **Gizmos**: Visual debugging in scene view (draw lines, spheres, etc.)
- **Network Profiler**: Bandwidth usage, packet loss, latency

---

## 🎓 Next Steps

- See [`IMPLEMENTATION_GUIDE.md`](IMPLEMENTATION_GUIDE.md) for detailed implementation instructions
- See [`API_DESIGN.md`](API_DESIGN.md) for API surface design
- See [`COMPONENT_REFERENCE.md`](COMPONENT_REFERENCE.md) for all built-in components
