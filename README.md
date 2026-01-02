# Web Game Engine

> A complete Unity-like game engine for the web, built with TypeScript, Node.js, and Three.js

## 🎮 Vision

Web Game Engine is a **production-ready, feature-complete game engine** that brings the full power of Unity to the browser. Built from the ground up in TypeScript, it provides all the systems, tools, and workflows that professional game developers expect, while leveraging modern web technologies for maximum performance and accessibility.

## ⚡ Key Features

### Core Engine
- **Entity Component System (ECS)** - Full Unity-style GameObject/Component architecture
- **Scene Management** - Multi-scene loading, async/streaming, additive scenes
- **Prefab System** - Nested prefabs, variants, overrides, instancing
- **Lifecycle Events** - Complete MonoBehaviour lifecycle (Awake, Start, Update, FixedUpdate, LateUpdate, OnDestroy)
- **Coroutines** - Generator-based coroutines with WaitForSeconds, WaitUntil, etc.
- **Event System** - Type-safe event bus, Unity-style SendMessage/BroadcastMessage
- **Serialization** - JSON/YAML scene format with GUID-based references

### Rendering Pipeline
- **Universal Render Pipeline (URP)** - High-performance forward renderer
- **High Definition Render Pipeline (HDRP)** - AAA-quality deferred renderer with advanced features
- **Shader Graph** - Node-based visual shader editor
- **Material System** - PBR materials with full texture support (albedo, normal, metallic, roughness, emission, occlusion)
- **Lighting** - Directional, point, spot, area lights with shadows
- **Global Illumination** - Real-time GI, baked lightmaps, light probes, reflection probes
- **Post-Processing** - Bloom, DOF, motion blur, color grading, vignette, chromatic aberration, ambient occlusion, lens distortion
- **Camera System** - Multi-camera rendering, render textures, camera stacking
- **Culling** - Frustum culling, occlusion culling, LOD system
- **Optimization** - GPU instancing, static/dynamic batching, draw call reduction

### Physics Engine
- **Rigidbody Physics** - Dynamic, kinematic, static bodies via Rapier.js
- **Colliders** - Box, sphere, capsule, mesh, terrain, compound colliders
- **Joints** - Hinge, spring, fixed, configurable joints with limits
- **Triggers** - OnTriggerEnter/Stay/Exit events
- **Raycasting** - Raycast, SphereCast, BoxCast, CapsuleCast with LayerMask filtering
- **Physics Materials** - Friction, bounciness, combine modes
- **Collision Matrix** - Layer-based collision filtering
- **Character Controller** - Built-in character movement with slope/step handling

### Animation System
- **Animator Controller** - State machines with transitions, conditions, parameters
- **Blend Trees** - 1D, 2D freeform directional/cartesian blending
- **Animation Clips** - Keyframe animation with curve interpolation
- **Timeline Editor** - Cinematic sequencing, cutscenes, multi-track editing
- **Inverse Kinematics (IK)** - Two-bone IK, look-at IK
- **Root Motion** - Animation-driven movement
- **Avatar System** - Humanoid rig retargeting, generic rigs
- **Animation Events** - Callback functions triggered at specific frames

### Particle System (Shuriken)
- **Modules** - Emission, shape, velocity over lifetime, force over lifetime, color over lifetime, size over lifetime, rotation over lifetime
- **Advanced Modules** - Texture sheet animation, sub-emitters, collision, noise, external forces, trails, lights
- **Shapes** - Sphere, hemisphere, cone, box, mesh, edge, circle
- **Emission Modes** - Continuous, burst, distance-based
- **GPU Particles** - High-performance particle rendering with instancing

### Audio System
- **AudioSource** - 3D spatial audio with doppler effect, reverb zones
- **AudioListener** - Single/multiple listener support
- **Audio Mixer** - Groups, snapshots, effects (reverb, echo, chorus, distortion, low-pass, high-pass)
- **Streaming** - Compressed audio streaming for large files
- **Audio Clips** - WAV, MP3, OGG support

### Terrain System
- **Heightmap Editing** - Raise, lower, smooth, flatten, paint height
- **Texture Splatting** - Multi-layer terrain textures with normal maps (up to 16 layers)
- **Detail System** - Grass, flowers, rocks with density painting, wind animation
- **Tree System** - Billboard/LOD trees with batching, wind zones
- **Terrain Collider** - Optimized terrain physics

### AI & Navigation
- **NavMesh** - Recast-based navigation mesh baking
- **NavMeshAgent** - Pathfinding, steering, obstacle avoidance
- **NavMeshObstacle** - Dynamic obstacle carving
- **OffMeshLink** - Manual connections between NavMesh regions
- **NavMeshSurface** - Multi-surface navigation, runtime baking
- **NavMesh Areas** - Cost-based pathfinding with area types

### Visual Scripting (Bolt-Style)
- **Node Graph Editor** - Visual programming without code
- **Custom Nodes** - Extensible node system
- **Variables** - Scene/graph/object scope variables
- **Events** - Custom events, Unity lifecycle events
- **State Machines** - Visual state machine graphs
- **Flow Control** - Branches, loops, switches
- **Debugging** - Node execution visualization, breakpoints

### UI System
- **UI Toolkit** - React-based runtime UI with CSS-like styling
- **Canvas** - Screen space overlay, screen space camera, world space
- **Layout System** - Anchors, pivots, rect transforms, content size fitters, layout groups
- **UI Builder** - Visual UI editor with drag-and-drop
- **Components** - Button, Toggle, Slider, Dropdown, ScrollView, InputField, Image, Text (TextMeshPro-style)
- **Event System** - Pointer events, drag-and-drop, keyboard navigation
- **Localization** - Multi-language support with string tables

### Input System (New)
- **Action Maps** - Organize inputs into logical groups
- **Input Actions** - Rebindable actions with multiple bindings
- **Device Support** - Keyboard, mouse, gamepad, touch, custom devices
- **Processors** - Input value processors (scale, invert, normalize, clamp)
- **Interactions** - Press, hold, tap, multi-tap, slow-tap
- **Control Schemes** - Device-specific control configurations

### ProBuilder-Style Editor
- **Mesh Editing** - Create and edit 3D geometry in-engine
- **Primitives** - Cube, sphere, cylinder, plane, stairs, arch, door, window
- **Tools** - Extrude, bevel, merge, subdivide, flip, detach
- **UV Editor** - Manual and auto UV mapping
- **Material Assignment** - Per-face material painting
- **Collision Generation** - Auto-generate colliders from meshes

### Cinemachine
- **Virtual Cameras** - Procedural camera control without animation
- **Brain** - Blending between virtual cameras with easing curves
- **Body** - Follow, framing composer, orbital transposer, hard lock to target
- **Aim** - Composer, group composer, POV (first-person)
- **Noise** - Perlin, handheld camera shake
- **Timeline Integration** - Cinemachine tracks for cutscenes
- **State-Driven Cameras** - Switch cameras based on animation state

### VFX Graph
- **Node-Based VFX** - Visual effects programming with GPU particles
- **Spawners** - Constant, periodic burst, custom spawning logic
- **Contexts** - Initialize, update, output particle contexts
- **Blocks** - Position, velocity, color, size, lifetime blocks
- **Forces** - Gravity, turbulence, vector fields, attractors, conformers
- **Collision** - Depth buffer, signed distance field collision
- **Events** - Spawn, die, collision events
- **Output** - Quad, mesh, line, trail renderers

### Networking
- **Transport Layer** - WebRTC (P2P) and WebSocket (client-server)
- **NetworkManager** - Connection management, scene synchronization
- **NetworkBehaviour** - Network-aware component base class
- **Network Variables** - Automatic state synchronization with delta compression
- **RPCs (Remote Procedure Calls)** - Client-to-server, server-to-client, reliable/unreliable
- **Network Transform** - Position/rotation/scale synchronization with interpolation
- **Ownership** - Client authority, server authority
- **Host Migration** - Seamless host transfer on disconnect
- **Matchmaking** - Lobby system, room creation, player readiness

### XR (Extended Reality)
- **WebXR Integration** - VR/AR via WebXR Device API
- **VR Controllers** - 6DOF tracking, button/trigger input, haptic feedback
- **Hand Tracking** - Hand joint tracking, gesture recognition
- **AR Features** - Hit testing, plane detection, image tracking, anchors
- **XR Interaction Toolkit** - Interactables, locomotion, teleportation, UI interaction
- **Performance** - Foveated rendering, reprojection

### Editor
- **Hierarchy Window** - Scene graph with drag-and-drop, multi-select, search
- **Inspector Window** - Property editing with custom drawers, multi-object editing
- **Scene View** - 3D viewport with gizmos, handles, grid, snap-to-grid
- **Game View** - Runtime preview with play/pause/step controls, stats overlay
- **Project Browser** - Asset management with favorites, search, filters
- **Console** - Logs, warnings, errors with stack traces, source links
- **Profiler** - CPU profiler, GPU profiler, memory profiler, rendering stats, frame debugger
- **Package Manager** - Install/update/remove packages
- **Build Settings** - Multi-platform build configuration
- **Preferences** - Editor customization, key bindings, external tools

### Scripting
- **TypeScript** - Full TypeScript support with strict mode
- **Hot Module Replacement** - Change scripts without losing state
- **Component Hot Reload** - Update component code in Play mode
- **Async/Await** - Modern async patterns in coroutines
- **Decorators** - @Component, @SerializeField, @Range decorators
- **Auto-Complete** - IntelliSense support in Monaco editor
- **Debugging** - Source maps, breakpoints, watch variables

### Build System
- **Web Target** - WebGL and WebGPU support
- **Bundle Optimization** - Vite-based bundling with code splitting
- **Asset Compression** - Texture compression (DXT, ETC2, ASTC), mesh compression, audio compression
- **Runtime Asset Loading** - AssetBundles, Addressables system
- **Progressive Web App** - Service worker, offline support, installable
- **WebAssembly** - Critical paths compiled to WASM for performance

### Testing Framework
- **Edit Mode Tests** - Unit tests for editor code
- **Play Mode Tests** - Integration tests in runtime environment
- **Performance Tests** - Automated performance regression testing
- **Test Runner** - UI and CLI test execution
- **Mocking** - Mock Unity APIs for isolated testing
- **Code Coverage** - Line/branch coverage reporting

### Performance
- **Multi-Threading** - Web Workers for physics, AI, asset loading
- **OffscreenCanvas** - Rendering in worker threads
- **Object Pooling** - Reusable object pools for GameObjects, particles, audio
- **Memory Management** - Dispose patterns, weak references, memory leak detection
- **Frame Budget** - Dynamic quality adjustment to maintain target FPS
- **Occlusion Culling** - Pre-computed occlusion data for large scenes
- **Streaming** - Level streaming, texture streaming, audio streaming

## 📦 Monorepo Structure

```
web-game-engine/
├── packages/
│   ├── core/                    # Core ECS, GameObject, Component, Scene
│   ├── runtime/                 # Runtime engine loop, time management
│   ├── renderer/                # Three.js wrapper, URP, HDRP, materials
│   ├── physics/                 # Rapier.js integration, rigidbody, colliders
│   ├── animation/               # Animator, state machines, blend trees, Timeline
│   ├── audio/                   # Web Audio API wrapper, AudioSource, Mixer
│   ├── particles/               # Shuriken particle system
│   ├── terrain/                 # Terrain heightmap, splatting, details
│   ├── ai/                      # NavMesh, pathfinding, behavior trees
│   ├── ui/                      # UI Toolkit, Canvas, layout system
│   ├── input/                   # New Input System, Action Maps
│   ├── networking/              # WebRTC, WebSocket, NetworkManager
│   ├── xr/                      # WebXR, VR controllers, AR features
│   ├── vfx/                     # VFX Graph, GPU particles
│   ├── visual-scripting/        # Bolt-style node editor
│   ├── cinemachine/             # Virtual cameras, procedural camera control
│   ├── probuilder/              # Mesh editing tools
│   ├── shader-graph/            # Node-based shader editor
│   ├── editor/                  # React-based editor UI
│   ├── editor-core/             # Editor backend, asset database, serialization
│   ├── build/                   # Build pipeline, bundler, optimization
│   ├── testing/                 # Test framework, test runner
│   └── examples/                # Sample projects, tutorials
├── docs/                        # Documentation
│   ├── getting-started/
│   ├── manual/                  # User manual
│   ├── api/                     # API reference (TypeDoc)
│   ├── tutorials/
│   ├── migration-from-unity/
│   └── architecture/            # ADRs, system design
├── tools/                       # Development tools, scripts
├── scripts/                     # Build scripts, deployment
└── .github/                     # CI/CD workflows
```

## 🎯 Target Metrics

- **Performance**: 60 FPS @ 1080p with 10,000+ objects in view
- **Startup Time**: < 50ms engine initialization
- **Bundle Size**: < 100KB gzipped for minimal runtime (tree-shaking)
- **Memory**: < 100MB baseline for empty scene
- **Loading**: < 1s for typical scene with async asset streaming

## 🔧 Tech Stack

- **Language**: TypeScript 5.3+ (strict mode)
- **Rendering**: Three.js (WebGL 2.0 / WebGPU)
- **Physics**: Rapier.js (WASM-based physics engine)
- **Audio**: Web Audio API
- **Networking**: WebRTC, WebSockets
- **UI Framework**: React 18+ for editor and runtime UI
- **Build Tool**: Vite 5+ (ESM, HMR, code splitting)
- **Package Manager**: pnpm (monorepo, workspaces)
- **Testing**: Jest, Playwright
- **Linting**: ESLint, Prettier
- **Documentation**: TypeDoc, Docusaurus

## 🚀 Getting Started

See [`docs/getting-started/installation.md`](docs/getting-started/installation.md) for detailed setup instructions.

Quick start:
```bash
# Clone repository
git clone https://github.com/your-org/web-game-engine.git
cd web-game-engine

# Install dependencies
pnpm install

# Start editor
pnpm dev

# Build for production
pnpm build
```

## 📚 Documentation

- [Installation Guide](docs/getting-started/installation.md)
- [Quick Start Tutorial](docs/getting-started/quickstart.md)
- [User Manual](docs/manual/README.md)
- [API Reference](docs/api/README.md)
- [Migration from Unity](docs/migration-from-unity/README.md)
- [Architecture & Design](docs/architecture/README.md)

## 🎓 Learning Resources

- [Official Tutorials](docs/tutorials/README.md)
- [Sample Projects](packages/examples/README.md)
- [Video Tutorials](https://youtube.com/web-game-engine)
- [Community Forum](https://forum.webgameengine.dev)
- [Discord Server](https://discord.gg/webgameengine)

## 🤝 Contributing

We welcome contributions! See [CONTRIBUTING.md](CONTRIBUTING.md) for guidelines.

Areas we're looking for help:
- Additional render pipelines
- Mobile optimization
- Console platform support
- Documentation improvements
- Sample projects and tutorials
- Bug fixes and performance improvements

## 📄 License

MIT License - See [LICENSE](LICENSE) for details.

## 🙏 Acknowledgments

- Unity Technologies for the original engine design and API inspiration
- Three.js community for the excellent 3D library
- Rapier.js team for the high-performance physics engine
- All contributors and users of Web Game Engine

## 🗺️ Roadmap

See [ROADMAP.md](ROADMAP.md) for planned features and timeline.

### Q1 2026
- ✅ Core ECS implementation
- ✅ Basic renderer with Three.js
- ✅ Physics integration with Rapier
- ✅ Scene management and serialization
- 🚧 Editor UI foundation

### Q2 2026
- 🔜 Animation system and Timeline
- 🔜 Audio system with mixer
- 🔜 Particle system (Shuriken)
- 🔜 Terrain system
- 🔜 Basic UI toolkit

### Q3 2026
- 🔜 Shader Graph
- 🔜 Visual Scripting
- 🔜 Cinemachine
- 🔜 NavMesh and AI
- 🔜 Networking

### Q4 2026
- 🔜 VFX Graph
- 🔜 XR support
- 🔜 ProBuilder tools
- 🔜 Build optimization
- 🔜 Performance profiling tools

## 📊 Status

**Current Version**: 0.1.0-alpha

**Project Status**: 🚧 Active Development

**Stability**: ⚠️ Alpha - API may change

**Production Ready**: ❌ Not yet (targeting Q4 2026)

---

**Built with ❤️ for the web game development community**
