# Web Game Engine - Complete Package Structure

> Detailed breakdown of all packages in the monorepo

## 📦 Package Overview

```
web-game-engine/
├── packages/
│   ├── core/                    # Core ECS, math, serialization
│   ├── runtime/                 # Game loop, time, coroutines
│   ├── renderer/                # Rendering pipeline (Three.js)
│   ├── physics/                 # Physics (Rapier.js)
│   ├── animation/               # Animation system
│   ├── audio/                   # Audio system (Web Audio API)
│   ├── particles/               # Particle system (Shuriken)
│   ├── terrain/                 # Terrain system
│   ├── ai/                      # AI & navigation (NavMesh)
│   ├── ui/                      # UI system (UI Toolkit)
│   ├── input/                   # New Input System
│   ├── networking/              # Networking (WebRTC/WebSocket)
│   ├── xr/                      # XR support (WebXR)
│   ├── vfx/                     # VFX Graph
│   ├── visual-scripting/        # Visual scripting (Bolt-style)
│   ├── cinemachine/             # Virtual cameras
│   ├── probuilder/              # Mesh editing
│   ├── shader-graph/            # Shader editor
│   ├── editor/                  # Editor UI (React)
│   ├── editor-core/             # Editor backend
│   ├── assets/                  # Asset import/export
│   ├── build/                   # Build system
│   ├── testing/                 # Test framework
│   └── examples/                # Sample projects
└── docs/                        # Documentation
```

---

## Package Details

### @web-game-engine/core

**Purpose:** Foundation - ECS, math, scene management

**Dependencies:** None (zero dependencies)

**Structure:**
```
packages/core/
├── src/
│   ├── math/
│   │   ├── Vector2.ts
│   │   ├── Vector3.ts
│   │   ├── Vector4.ts
│   │   ├── Quaternion.ts
│   │   ├── Matrix4x4.ts
│   │   ├── Mathf.ts
│   │   ├── Bounds.ts
│   │   ├── Ray.ts
│   │   ├── Plane.ts
│   │   └── Color.ts
│   ├── ecs/
│   │   ├── Object.ts            # Base Unity Object
│   │   ├── Component.ts         # Base component
│   │   ├── Behaviour.ts         # Enable/disable
│   │   ├── MonoBehaviour.ts     # Lifecycle methods
│   │   ├── Transform.ts         # Position/rotation/scale
│   │   ├── GameObject.ts        # Entity
│   │   └── Scene.ts             # Scene container
│   ├── scene/
│   │   ├── SceneManager.ts      # Scene loading
│   │   └── SceneUtility.ts      # Scene helpers
│   ├── serialization/
│   │   ├── JSONSerializer.ts
│   │   ├── YAMLSerializer.ts
│   │   └── GUIDResolver.ts
│   ├── events/
│   │   ├── EventBus.ts
│   │   └── UnityEvent.ts
│   ├── utils/
│   │   ├── GUID.ts
│   │   ├── Debug.ts
│   │   └── Assertions.ts
│   └── __tests__/
│       └── [all test files]
├── package.json
├── tsconfig.json
└── README.md
```

**Public API:**
```typescript
// Math
export { Vector2, Vector3, Vector4 } from './math/Vector';
export { Quaternion } from './math/Quaternion';
export { Matrix4x4 } from './math/Matrix4x4';
export { Mathf } from './math/Mathf';
export { Color } from './math/Color';
export { Bounds } from './math/Bounds';
export { Ray } from './math/Ray';
export { Plane } from './math/Plane';

// ECS
export { UnityObject as Object } from './ecs/Object';
export { Component } from './ecs/Component';
export { Behaviour } from './ecs/Behaviour';
export { MonoBehaviour } from './ecs/MonoBehaviour';
export { Transform } from './ecs/Transform';
export { GameObject } from './ecs/GameObject';
export { Scene } from './ecs/Scene';

// Scene Management
export { SceneManager } from './scene/SceneManager';

// Events
export { EventBus } from './events/EventBus';
export { UnityEvent } from './events/UnityEvent';
```

---

### @web-game-engine/runtime

**Purpose:** Game loop, time management, coroutines

**Dependencies:** `@web-game-engine/core`

**Structure:**
```
packages/runtime/
├── src/
│   ├── Time.ts                  # deltaTime, timeScale
│   ├── GameLoop.ts              # Main loop
│   ├── Coroutine.ts             # Generator coroutines
│   ├── YieldInstructions.ts     # WaitForSeconds, etc.
│   ├── Application.ts           # App lifecycle
│   ├── Screen.ts                # Screen resolution
│   ├── SystemInfo.ts            # Platform detection
│   └── __tests__/
├── package.json
├── tsconfig.json
└── README.md
```

**Public API:**
```typescript
export { Time } from './Time';
export { GameLoop } from './GameLoop';
export { Coroutine } from './Coroutine';
export {
  WaitForSeconds,
  WaitForFixedUpdate,
  WaitForEndOfFrame,
  WaitUntil,
  WaitWhile,
} from './YieldInstructions';
export { Application } from './Application';
export { Screen } from './Screen';
export { SystemInfo } from './SystemInfo';
```

---

### @web-game-engine/renderer

**Purpose:** Rendering pipeline with Three.js

**Dependencies:**
- `@web-game-engine/core`
- `three` (Three.js)

**Structure:**
```
packages/renderer/
├── src/
│   ├── core/
│   │   ├── Camera.ts
│   │   ├── Light.ts
│   │   ├── Mesh.ts
│   │   ├── Material.ts
│   │   ├── Shader.ts
│   │   ├── Texture.ts
│   │   └── RenderTexture.ts
│   ├── components/
│   │   ├── MeshRenderer.ts
│   │   ├── SkinnedMeshRenderer.ts
│   │   ├── MeshFilter.ts
│   │   ├── LineRenderer.ts
│   │   ├── TrailRenderer.ts
│   │   └── SpriteRenderer.ts
│   ├── pipeline/
│   │   ├── RenderPipeline.ts           # Abstract
│   │   ├── UniversalRenderPipeline.ts  # URP
│   │   ├── HDRenderPipeline.ts         # HDRP
│   │   └── BuiltInRenderPipeline.ts    # Legacy
│   ├── lighting/
│   │   ├── LightProbe.ts
│   │   ├── ReflectionProbe.ts
│   │   ├── LightmapSettings.ts
│   │   └── Lightmapping.ts
│   ├── post-processing/
│   │   ├── PostProcessLayer.ts
│   │   ├── Bloom.ts
│   │   ├── DepthOfField.ts
│   │   ├── MotionBlur.ts
│   │   ├── ColorGrading.ts
│   │   └── [other effects]
│   ├── shaders/
│   │   ├── Standard.glsl
│   │   ├── Unlit.glsl
│   │   ├── Skybox.glsl
│   │   └── [builtin shaders]
│   └── __tests__/
├── package.json
├── tsconfig.json
└── README.md
```

---

### @web-game-engine/physics

**Purpose:** Physics simulation with Rapier.js

**Dependencies:**
- `@web-game-engine/core`
- `@dimforge/rapier3d` (Rapier.js)

**Structure:**
```
packages/physics/
├── src/
│   ├── PhysicsWorld.ts
│   ├── Rigidbody.ts
│   ├── colliders/
│   │   ├── Collider.ts
│   │   ├── BoxCollider.ts
│   │   ├── SphereCollider.ts
│   │   ├── CapsuleCollider.ts
│   │   ├── MeshCollider.ts
│   │   └── TerrainCollider.ts
│   ├── joints/
│   │   ├── Joint.ts
│   │   ├── HingeJoint.ts
│   │   ├── SpringJoint.ts
│   │   ├── FixedJoint.ts
│   │   └── ConfigurableJoint.ts
│   ├── CharacterController.ts
│   ├── PhysicsMaterial.ts
│   ├── Collision.ts
│   ├── ContactPoint.ts
│   └── __tests__/
├── package.json
├── tsconfig.json
└── README.md
```

---

### @web-game-engine/animation

**Purpose:** Animation system, Timeline, IK

**Dependencies:** `@web-game-engine/core`

**Structure:**
```
packages/animation/
├── src/
│   ├── core/
│   │   ├── AnimationClip.ts
│   │   ├── AnimationCurve.ts
│   │   ├── Keyframe.ts
│   │   └── AnimationEvent.ts
│   ├── animator/
│   │   ├── Animator.ts
│   │   ├── AnimatorController.ts
│   │   ├── AnimatorState.ts
│   │   ├── AnimatorStateMachine.ts
│   │   ├── AnimatorTransition.ts
│   │   ├── BlendTree.ts
│   │   └── Avatar.ts
│   ├── timeline/
│   │   ├── TimelineAsset.ts
│   │   ├── PlayableDirector.ts
│   │   ├── tracks/
│   │   │   ├── AnimationTrack.ts
│   │   │   ├── AudioTrack.ts
│   │   │   ├── ActivationTrack.ts
│   │   │   └── SignalTrack.ts
│   │   └── clips/
│   ├── ik/
│   │   ├── IKSolver.ts
│   │   ├── TwoBoneIK.ts
│   │   └── LookAtIK.ts
│   └── __tests__/
├── package.json
├── tsconfig.json
└── README.md
```

---

### @web-game-engine/audio

**Purpose:** Audio system with Web Audio API

**Dependencies:** `@web-game-engine/core`

**Structure:**
```
packages/audio/
├── src/
│   ├── AudioClip.ts
│   ├── AudioSource.ts
│   ├── AudioListener.ts
│   ├── AudioMixer.ts
│   ├── AudioMixerGroup.ts
│   ├── AudioMixerSnapshot.ts
│   ├── AudioReverbZone.ts
│   ├── AudioSettings.ts
│   ├── effects/
│   │   ├── AudioLowPassFilter.ts
│   │   ├── AudioHighPassFilter.ts
│   │   ├── AudioEchoFilter.ts
│   │   ├── AudioDistortionFilter.ts
│   │   ├── AudioReverbFilter.ts
│   │   └── AudioChorusFilter.ts
│   └── __tests__/
├── package.json
├── tsconfig.json
└── README.md
```

---

### @web-game-engine/particles

**Purpose:** Shuriken particle system

**Dependencies:**
- `@web-game-engine/core`
- `@web-game-engine/renderer`

**Structure:**
```
packages/particles/
├── src/
│   ├── ParticleSystem.ts
│   ├── ParticleSystemRenderer.ts
│   ├── Particle.ts
│   ├── modules/
│   │   ├── MainModule.ts
│   │   ├── EmissionModule.ts
│   │   ├── ShapeModule.ts
│   │   ├── VelocityOverLifetimeModule.ts
│   │   ├── LimitVelocityOverLifetimeModule.ts
│   │   ├── ForceOverLifetimeModule.ts
│   │   ├── ColorOverLifetimeModule.ts
│   │   ├── ColorBySpeedModule.ts
│   │   ├── SizeOverLifetimeModule.ts
│   │   ├── SizeBySpeedModule.ts
│   │   ├── RotationOverLifetimeModule.ts
│   │   ├── RotationBySpeedModule.ts
│   │   ├── ExternalForcesModule.ts
│   │   ├── NoiseModule.ts
│   │   ├── CollisionModule.ts
│   │   ├── TriggerModule.ts
│   │   ├── SubEmittersModule.ts
│   │   ├── TextureSheetAnimationModule.ts
│   │   ├── LightsModule.ts
│   │   ├── TrailsModule.ts
│   │   └── CustomDataModule.ts
│   ├── MinMaxCurve.ts
│   ├── MinMaxGradient.ts
│   └── __tests__/
├── package.json
├── tsconfig.json
└── README.md
```

---

### @web-game-engine/terrain

**Purpose:** Terrain system with heightmaps

**Dependencies:**
- `@web-game-engine/core`
- `@web-game-engine/renderer`
- `@web-game-engine/physics`

**Structure:**
```
packages/terrain/
├── src/
│   ├── Terrain.ts
│   ├── TerrainData.ts
│   ├── TerrainCollider.ts
│   ├── TerrainLayer.ts
│   ├── Tree.ts
│   ├── DetailPrototype.ts
│   ├── TerrainSettings.ts
│   └── __tests__/
├── package.json
├── tsconfig.json
└── README.md
```

---

### @web-game-engine/ai

**Purpose:** NavMesh & pathfinding

**Dependencies:**
- `@web-game-engine/core`
- `recast-navigation` (NavMesh)

**Structure:**
```
packages/ai/
├── src/
│   ├── NavMeshAgent.ts
│   ├── NavMeshObstacle.ts
│   ├── NavMeshSurface.ts
│   ├── NavMeshLink.ts
│   ├── OffMeshLink.ts
│   ├── NavMesh.ts
│   ├── NavMeshPath.ts
│   ├── NavMeshData.ts
│   └── __tests__/
├── package.json
├── tsconfig.json
└── README.md
```

---

### @web-game-engine/ui

**Purpose:** UI system (UI Toolkit + Canvas)

**Dependencies:**
- `@web-game-engine/core`
- `react` (for UI Toolkit)

**Structure:**
```
packages/ui/
├── src/
│   ├── toolkit/                     # React-based UI
│   │   ├── UIDocument.ts
│   │   ├── VisualElement.ts
│   │   ├── Button.ts
│   │   ├── Toggle.ts
│   │   ├── Slider.ts
│   │   ├── TextField.ts
│   │   ├── ScrollView.ts
│   │   ├── ListView.ts
│   │   └── [other elements]
│   ├── canvas/                      # Legacy UI
│   │   ├── Canvas.ts
│   │   ├── CanvasScaler.ts
│   │   ├── GraphicRaycaster.ts
│   │   ├── RectTransform.ts
│   │   ├── Image.ts
│   │   ├── Text.ts
│   │   ├── Button.ts
│   │   ├── Toggle.ts
│   │   ├── Slider.ts
│   │   ├── InputField.ts
│   │   └── ScrollRect.ts
│   ├── EventSystem.ts
│   └── __tests__/
├── package.json
├── tsconfig.json
└── README.md
```

---

### @web-game-engine/input

**Purpose:** New Input System

**Dependencies:** `@web-game-engine/core`

**Structure:**
```
packages/input/
├── src/
│   ├── InputSystem.ts
│   ├── InputAction.ts
│   ├── InputActionMap.ts
│   ├── InputActionAsset.ts
│   ├── InputDevice.ts
│   ├── devices/
│   │   ├── Keyboard.ts
│   │   ├── Mouse.ts
│   │   ├── Gamepad.ts
│   │   ├── Touchscreen.ts
│   │   └── [other devices]
│   ├── processors/
│   │   ├── ScaleProcessor.ts
│   │   ├── InvertProcessor.ts
│   │   ├── NormalizeProcessor.ts
│   │   └── [other processors]
│   ├── interactions/
│   │   ├── PressInteraction.ts
│   │   ├── HoldInteraction.ts
│   │   ├── TapInteraction.ts
│   │   └── [other interactions]
│   └── __tests__/
├── package.json
├── tsconfig.json
└── README.md
```

---

### @web-game-engine/networking

**Purpose:** Multiplayer networking

**Dependencies:**
- `@web-game-engine/core`
- `simple-peer` (WebRTC)

**Structure:**
```
packages/networking/
├── src/
│   ├── NetworkManager.ts
│   ├── NetworkBehaviour.ts
│   ├── NetworkTransform.ts
│   ├── NetworkIdentity.ts
│   ├── NetworkVariable.ts
│   ├── RPC.ts
│   ├── transport/
│   │   ├── WebRTCTransport.ts
│   │   ├── WebSocketTransport.ts
│   │   └── Transport.ts
│   ├── NetworkTime.ts
│   ├── NetworkSceneManager.ts
│   └── __tests__/
├── package.json
├── tsconfig.json
└── README.md
```

---

### @web-game-engine/xr

**Purpose:** XR support (VR/AR)

**Dependencies:**
- `@web-game-engine/core`
- `@web-game-engine/input`

**Structure:**
```
packages/xr/
├── src/
│   ├── XRSession.ts
│   ├── XRController.ts
│   ├── XRCamera.ts
│   ├── XRInputSource.ts
│   ├── XRRayInteractor.ts
│   ├── XRHandTracking.ts
│   ├── ar/
│   │   ├── ARHitTest.ts
│   │   ├── ARPlane.ts
│   │   ├── ARImageTracking.ts
│   │   └── ARAnchors.ts
│   └── __tests__/
├── package.json
├── tsconfig.json
└── README.md
```

---

### @web-game-engine/editor

**Purpose:** Editor UI (React)

**Dependencies:**
- `@web-game-engine/core`
- `@web-game-engine/editor-core`
- `react`, `react-dom`
- `@monaco-editor/react` (code editor)

**Structure:**
```
packages/editor/
├── src/
│   ├── windows/
│   │   ├── Hierarchy.tsx
│   │   ├── Inspector.tsx
│   │   ├── SceneView.tsx
│   │   ├── GameView.tsx
│   │   ├── ProjectBrowser.tsx
│   │   ├── Console.tsx
│   │   └── Profiler.tsx
│   ├── components/
│   │   ├── PropertyDrawers/
│   │   ├── Gizmos/
│   │   └── Handles/
│   ├── EditorWindow.tsx
│   ├── EditorApplication.tsx
│   └── __tests__/
├── package.json
├── tsconfig.json
└── README.md
```

---

### @web-game-engine/assets

**Purpose:** Asset import/export

**Dependencies:**
- `@web-game-engine/core`
- Various loaders (gltf, ktx2, etc.)

**Structure:**
```
packages/assets/
├── src/
│   ├── AssetDatabase.ts
│   ├── AssetImporter.ts
│   ├── importers/
│   │   ├── GLTFImporter.ts
│   │   ├── TextureImporter.ts
│   │   ├── AudioImporter.ts
│   │   ├── FontImporter.ts
│   │   └── [other importers]
│   ├── AssetBundle.ts
│   ├── Addressables.ts
│   └── __tests__/
├── package.json
├── tsconfig.json
└── README.md
```

---

## 🔗 Package Dependencies Graph

```
                              core
                                │
                ┌───────────────┼───────────────┐
                ↓               ↓               ↓
             runtime         renderer        physics
                                │               │
                ┌───────────────┼───────────────┤
                ↓               ↓               ↓
            animation        particles      terrain
                │               │               │
                └───────────────┴───────────────┘
                                │
                ┌───────────────┼───────────────┐
                ↓               ↓               ↓
               ai              ui            input
                │               │               │
                └───────────────┴───────────────┘
                                │
                        ┌───────┴───────┐
                        ↓               ↓
                   networking          xr
                        │               │
                        └───────┬───────┘
                                ↓
                        editor-core
                                │
                                ↓
                            editor
```

---

## 📊 Package Size Targets

| Package | Target Size (gzipped) | Critical |
|---------|----------------------|----------|
| `core` | < 50 KB | ⭐ |
| `runtime` | < 20 KB | ⭐ |
| `renderer` | < 200 KB | ⭐ |
| `physics` | < 800 KB | (WASM) |
| `animation` | < 50 KB | |
| `audio` | < 30 KB | |
| `particles` | < 40 KB | |
| `terrain` | < 60 KB | |
| `ai` | < 100 KB | |
| `ui` | < 80 KB | |
| `input` | < 25 KB | |
| `networking` | < 60 KB | |
| `xr` | < 50 KB | |
| `editor` | < 500 KB | (dev only) |
| `assets` | < 100 KB | |

**Total (minimal game):** ~1.5 MB (with physics)
**Total (without physics):** ~700 KB

---

## 🎯 Import/Export Strategy

Each package exports a clean public API:

```typescript
// packages/[package-name]/src/index.ts

// Export public API only
export { PublicClass } from './PublicClass';
export { PublicFunction } from './utils';
export type { PublicType } from './types';

// DO NOT export internal implementation details
// Keep _ prefixed classes private
```

Usage in games:

```typescript
// Import only what you need (tree-shaking)
import { Vector3, GameObject } from '@web-game-engine/core';
import { Rigidbody, BoxCollider } from '@web-game-engine/physics';
import { AudioSource } from '@web-game-engine/audio';

// Or import everything (larger bundle)
import * as Engine from '@web-game-engine/core';
const player = new Engine.GameObject();
```

---

## 🧪 Testing Strategy Per Package

```
packages/[package]/
├── src/
│   └── __tests__/           # Unit tests
└── e2e/                      # Integration tests (optional)
```

- Unit tests: Test individual classes/functions
- Integration tests: Test package interaction
- Performance tests: Benchmark critical paths
- Coverage target: >80% for all packages
