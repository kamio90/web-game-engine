# Web Game Engine - Implementation Guide for Claude Code

> **Target Audience**: This document is specifically designed for Claude Code autonomous agents to implement the Web Game Engine. Each section contains precise, actionable instructions with zero ambiguity.

## 🎯 Implementation Philosophy

### Code Quality Standards
- **Principal TypeScript Developer Level**: All code must be production-ready, maintainable, and follow enterprise-grade patterns
- **Strict TypeScript**: Enable `strict: true`, `noImplicitAny: true`, `strictNullChecks: true`
- **Zero Warnings**: ESLint and TypeScript must pass with zero warnings
- **Test Coverage**: Minimum 80% line coverage, 70% branch coverage
- **Performance First**: Every system must meet or exceed the performance targets defined in ARCHITECTURE.md
- **Documentation**: Every public API must have TSDoc comments with examples

### Development Workflow
1. **Read documentation** - Always start by reading relevant SKILL.md and architecture docs
2. **Plan** - Create detailed plan before writing code
3. **Research** - Use web_search to find best practices, algorithms, and solutions
4. **Implement** - Write modular, testable code with comprehensive error handling
5. **Test** - Write unit tests and integration tests
6. **Document** - Update docs and add code comments
7. **Review** - Self-review for performance, security, and maintainability

## 📋 Project Structure Setup

### Step 1: Initialize Monorepo

```bash
# Create root structure
mkdir -p packages/{core,runtime,renderer,physics,animation,audio,particles,terrain,ai,ui,input,networking,xr,vfx,visual-scripting,cinemachine,probuilder,shader-graph,editor,editor-core,build,testing,examples}
mkdir -p docs/{getting-started,manual,api,tutorials,migration-from-unity,architecture}
mkdir -p tools scripts .github/workflows

# Initialize pnpm workspace
cat > pnpm-workspace.yaml << EOF
packages:
  - 'packages/*'
EOF

# Create root package.json
cat > package.json << EOF
{
  "name": "web-game-engine",
  "version": "0.1.0-alpha",
  "private": true,
  "type": "module",
  "scripts": {
    "dev": "turbo run dev",
    "build": "turbo run build",
    "test": "turbo run test",
    "lint": "turbo run lint",
    "clean": "turbo run clean && rm -rf node_modules",
    "typecheck": "turbo run typecheck"
  },
  "devDependencies": {
    "@types/node": "^20.10.0",
    "@typescript-eslint/eslint-plugin": "^6.13.0",
    "@typescript-eslint/parser": "^6.13.0",
    "eslint": "^8.55.0",
    "eslint-config-prettier": "^9.1.0",
    "prettier": "^3.1.0",
    "turbo": "^1.11.0",
    "typescript": "^5.3.3",
    "vitest": "^1.0.4"
  },
  "engines": {
    "node": ">=18.0.0",
    "pnpm": ">=8.0.0"
  }
}
EOF

# Create turbo.json for monorepo orchestration
cat > turbo.json << EOF
{
  "$schema": "https://turbo.build/schema.json",
  "globalDependencies": ["**/.env.*local"],
  "pipeline": {
    "build": {
      "dependsOn": ["^build"],
      "outputs": ["dist/**", ".next/**", "!.next/cache/**"]
    },
    "test": {
      "dependsOn": ["build"],
      "outputs": ["coverage/**"]
    },
    "lint": {
      "outputs": []
    },
    "typecheck": {
      "outputs": []
    },
    "dev": {
      "cache": false,
      "persistent": true
    },
    "clean": {
      "cache": false
    }
  }
}
EOF

# Create TypeScript config (root)
cat > tsconfig.json << EOF
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "composite": true,
    "incremental": true
  }
}
EOF

# Create ESLint config
cat > .eslintrc.json << EOF
{
  "parser": "@typescript-eslint/parser",
  "extends": [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "prettier"
  ],
  "parserOptions": {
    "ecmaVersion": 2022,
    "sourceType": "module",
    "project": "./tsconfig.json"
  },
  "rules": {
    "@typescript-eslint/explicit-function-return-type": "warn",
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": ["error", { "argsIgnorePattern": "^_" }],
    "@typescript-eslint/no-floating-promises": "error",
    "no-console": ["warn", { "allow": ["warn", "error"] }]
  }
}
EOF

# Create Prettier config
cat > .prettierrc.json << EOF
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false
}
EOF

# Create .gitignore
cat > .gitignore << EOF
# Dependencies
node_modules/
.pnp
.pnp.js

# Build outputs
dist/
build/
out/
.next/
*.tsbuildinfo

# Testing
coverage/
.nyc_output/

# Misc
.DS_Store
*.log
.env*.local
.cache/

# IDEs
.vscode/
.idea/
*.swp
*.swo
*~

# Turbo
.turbo/
EOF
```

### Step 2: Core Package Setup (@web-game-engine/core)

```bash
cd packages/core

# Create package.json
cat > package.json << EOF
{
  "name": "@web-game-engine/core",
  "version": "0.1.0-alpha",
  "type": "module",
  "main": "./dist/index.js",
  "types": "./dist/index.d.ts",
  "exports": {
    ".": {
      "types": "./dist/index.d.ts",
      "import": "./dist/index.js"
    }
  },
  "scripts": {
    "build": "tsc -b",
    "dev": "tsc -b --watch",
    "test": "vitest run",
    "test:watch": "vitest",
    "lint": "eslint src/**/*.ts",
    "typecheck": "tsc --noEmit",
    "clean": "rm -rf dist *.tsbuildinfo"
  },
  "dependencies": {
    "uuid": "^9.0.1"
  },
  "devDependencies": {
    "@types/uuid": "^9.0.7",
    "vitest": "^1.0.4"
  }
}
EOF

# Create tsconfig.json
cat > tsconfig.json << EOF
{
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "rootDir": "./src",
    "outDir": "./dist",
    "composite": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "**/*.test.ts"]
}
EOF

# Create directory structure
mkdir -p src/{ecs,scene,math,serialization,events,utils}
mkdir -p src/__tests__
```

## 🏗️ Implementation Order & Dependencies

### Phase 1: Foundation (Week 1-2)
**Goal**: Core ECS system, math library, basic scene management

#### 1.1 Math Library (`packages/core/src/math/`)
Implement in this order (each depends on previous):
1. `Vector2.ts` - 2D vector math
2. `Vector3.ts` - 3D vector math (most used)
3. `Vector4.ts` - 4D vector, RGBA colors
4. `Quaternion.ts` - Rotation representation
5. `Matrix4x4.ts` - Transformation matrices
6. `Mathf.ts` - Utility math functions (lerp, clamp, etc.)
7. `Bounds.ts` - AABB bounds for culling
8. `Ray.ts` - Raycasting
9. `Plane.ts` - Plane math
10. `Color.ts` - RGBA color with operations

**Critical Requirements**:
- All vector operations must be **performance-optimized**
- Implement both **mutable** (for performance) and **immutable** (for safety) methods
- Use **SIMD** where possible (WebAssembly future-proofing)
- Add comprehensive unit tests (>95% coverage)

**Example Structure**:
```typescript
// packages/core/src/math/Vector3.ts

/**
 * Representation of 3D vectors and points.
 * This structure is used throughout Unity to pass 3D positions and directions around.
 * It also contains functions for doing common vector operations.
 */
export class Vector3 {
  public x: number;
  public y: number;
  public z: number;

  constructor(x: number = 0, y: number = 0, z: number = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  // Immutable operations (return new instance)
  
  /**
   * Adds two vectors.
   * @param a - First vector
   * @param b - Second vector
   * @returns New vector (a + b)
   */
  public static Add(a: Vector3, b: Vector3): Vector3 {
    return new Vector3(a.x + b.x, a.y + b.y, a.z + b.z);
  }

  /**
   * Subtracts one vector from another.
   */
  public static Subtract(a: Vector3, b: Vector3): Vector3 {
    return new Vector3(a.x - b.x, a.y - b.y, a.z - b.z);
  }

  /**
   * Multiplies a vector by a number.
   */
  public static Scale(a: Vector3, scalar: number): Vector3 {
    return new Vector3(a.x * scalar, a.y * scalar, a.z * scalar);
  }

  /**
   * Dot Product of two vectors.
   */
  public static Dot(a: Vector3, b: Vector3): number {
    return a.x * b.x + a.y * b.y + a.z * b.z;
  }

  /**
   * Cross Product of two vectors.
   */
  public static Cross(a: Vector3, b: Vector3): Vector3 {
    return new Vector3(
      a.y * b.z - a.z * b.y,
      a.z * b.x - a.x * b.z,
      a.x * b.y - a.y * b.x
    );
  }

  /**
   * Returns the distance between a and b.
   */
  public static Distance(a: Vector3, b: Vector3): number {
    const dx = a.x - b.x;
    const dy = a.y - b.y;
    const dz = a.z - b.z;
    return Math.sqrt(dx * dx + dy * dy + dz * dz);
  }

  /**
   * Linearly interpolates between two vectors.
   * @param a - Start value
   * @param b - End value
   * @param t - Interpolation parameter (0 to 1)
   */
  public static Lerp(a: Vector3, b: Vector3, t: number): Vector3 {
    t = Math.max(0, Math.min(1, t)); // Clamp t
    return new Vector3(
      a.x + (b.x - a.x) * t,
      a.y + (b.y - a.y) * t,
      a.z + (b.z - a.z) * t
    );
  }

  /**
   * Returns the length of this vector.
   */
  public get magnitude(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
  }

  /**
   * Returns this vector with a magnitude of 1 (Read Only).
   */
  public get normalized(): Vector3 {
    const mag = this.magnitude;
    if (mag > 0.00001) {
      return new Vector3(this.x / mag, this.y / mag, this.z / mag);
    }
    return Vector3.zero;
  }

  // Mutable operations (modify in place for performance)
  
  /**
   * Makes this vector have a magnitude of 1.
   */
  public Normalize(): void {
    const mag = this.magnitude;
    if (mag > 0.00001) {
      this.x /= mag;
      this.y /= mag;
      this.z /= mag;
    }
  }

  /**
   * Set x, y and z components of an existing Vector3.
   */
  public Set(x: number, y: number, z: number): void {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  // Static instances (commonly used vectors)
  public static get zero(): Vector3 { return new Vector3(0, 0, 0); }
  public static get one(): Vector3 { return new Vector3(1, 1, 1); }
  public static get up(): Vector3 { return new Vector3(0, 1, 0); }
  public static get down(): Vector3 { return new Vector3(0, -1, 0); }
  public static get left(): Vector3 { return new Vector3(-1, 0, 0); }
  public static get right(): Vector3 { return new Vector3(1, 0, 0); }
  public static get forward(): Vector3 { return new Vector3(0, 0, 1); }
  public static get back(): Vector3 { return new Vector3(0, 0, -1); }

  // Utility methods
  public toString(): string {
    return `(${this.x.toFixed(2)}, ${this.y.toFixed(2)}, ${this.z.toFixed(2)})`;
  }

  public clone(): Vector3 {
    return new Vector3(this.x, this.y, this.z);
  }

  public equals(other: Vector3, tolerance: number = 0.00001): boolean {
    return (
      Math.abs(this.x - other.x) < tolerance &&
      Math.abs(this.y - other.y) < tolerance &&
      Math.abs(this.z - other.z) < tolerance
    );
  }
}
```

**Test Example**:
```typescript
// packages/core/src/math/__tests__/Vector3.test.ts
import { describe, it, expect } from 'vitest';
import { Vector3 } from '../Vector3';

describe('Vector3', () => {
  describe('constructor', () => {
    it('should create zero vector by default', () => {
      const v = new Vector3();
      expect(v.x).toBe(0);
      expect(v.y).toBe(0);
      expect(v.z).toBe(0);
    });

    it('should create vector with specified values', () => {
      const v = new Vector3(1, 2, 3);
      expect(v.x).toBe(1);
      expect(v.y).toBe(2);
      expect(v.z).toBe(3);
    });
  });

  describe('Add', () => {
    it('should add two vectors', () => {
      const a = new Vector3(1, 2, 3);
      const b = new Vector3(4, 5, 6);
      const result = Vector3.Add(a, b);
      expect(result.x).toBe(5);
      expect(result.y).toBe(7);
      expect(result.z).toBe(9);
    });
  });

  describe('magnitude', () => {
    it('should calculate magnitude correctly', () => {
      const v = new Vector3(3, 4, 0);
      expect(v.magnitude).toBe(5);
    });

    it('should return zero for zero vector', () => {
      const v = Vector3.zero;
      expect(v.magnitude).toBe(0);
    });
  });

  describe('normalized', () => {
    it('should return unit vector', () => {
      const v = new Vector3(3, 4, 0);
      const normalized = v.normalized;
      expect(normalized.magnitude).toBeCloseTo(1, 5);
    });
  });

  describe('Dot', () => {
    it('should calculate dot product', () => {
      const a = new Vector3(1, 0, 0);
      const b = new Vector3(0, 1, 0);
      expect(Vector3.Dot(a, b)).toBe(0);
    });

    it('should return 1 for same direction', () => {
      const a = new Vector3(1, 0, 0);
      const b = new Vector3(2, 0, 0);
      expect(Vector3.Dot(a.normalized, b.normalized)).toBeCloseTo(1, 5);
    });
  });

  describe('Distance', () => {
    it('should calculate distance between two points', () => {
      const a = new Vector3(0, 0, 0);
      const b = new Vector3(3, 4, 0);
      expect(Vector3.Distance(a, b)).toBe(5);
    });
  });
});
```

#### 1.2 ECS Core (`packages/core/src/ecs/`)
Implement in this order:
1. `GUID.ts` - Globally unique identifiers for objects
2. `Object.ts` - Base Unity Object class (name, instanceID)
3. `Component.ts` - Base component class
4. `Transform.ts` - Position, rotation, scale, hierarchy
5. `GameObject.ts` - Game entity with component collection
6. `MonoBehaviour.ts` - Scriptable component with lifecycle
7. `SceneManager.ts` - Scene loading, unloading, active scene

**GameObject Implementation Example**:
```typescript
// packages/core/src/ecs/GameObject.ts
import { v4 as uuidv4 } from 'uuid';
import { UnityObject } from './Object';
import { Component } from './Component';
import { Transform } from './Transform';

/**
 * Base class for all entities in Web Game Engine scenes.
 * 
 * A GameObject is a container for Components. To give a GameObject functionality,
 * you attach one or more Components to it.
 * 
 * @example
 * ```typescript
 * // Create a new GameObject
 * const player = new GameObject('Player');
 * 
 * // Add components
 * const renderer = player.AddComponent(MeshRenderer);
 * const rigidbody = player.AddComponent(Rigidbody);
 * 
 * // Access transform
 * player.transform.position = new Vector3(0, 5, 0);
 * ```
 */
export class GameObject extends UnityObject {
  private readonly _instanceId: number;
  private _transform: Transform;
  private _components: Component[] = [];
  private _isActive: boolean = true;
  private _layer: number = 0;
  private _tag: string = 'Untagged';
  private _scene: Scene | null = null;

  private static _nextInstanceId: number = 1;
  private static readonly _gameObjects: Map<number, GameObject> = new Map();

  constructor(name: string = 'GameObject') {
    super();
    this.name = name;
    this._instanceId = GameObject._nextInstanceId++;
    GameObject._gameObjects.set(this._instanceId, this);

    // Every GameObject has a Transform
    this._transform = new Transform(this);
    this._components.push(this._transform);
  }

  /**
   * The Transform attached to this GameObject.
   */
  public get transform(): Transform {
    return this._transform;
  }

  /**
   * The layer the game object is on. A layer is a 32-bit value from 0 to 31.
   */
  public get layer(): number {
    return this._layer;
  }

  public set layer(value: number) {
    if (value < 0 || value > 31) {
      throw new Error('Layer must be between 0 and 31');
    }
    this._layer = value;
  }

  /**
   * The tag of this game object.
   */
  public get tag(): string {
    return this._tag;
  }

  public set tag(value: string) {
    this._tag = value;
  }

  /**
   * The local active state of this GameObject.
   */
  public get activeSelf(): boolean {
    return this._isActive;
  }

  /**
   * Defines whether the GameObject is active in the Scene.
   * Takes into account parent GameObjects' active state.
   */
  public get activeInHierarchy(): boolean {
    if (!this._isActive) return false;
    
    const parent = this._transform.parent;
    if (parent) {
      return parent.gameObject.activeInHierarchy;
    }
    
    return true;
  }

  /**
   * The Scene that contains the GameObject.
   */
  public get scene(): Scene | null {
    return this._scene;
  }

  /**
   * Adds a component class of type componentType to the game object.
   * 
   * @param componentType - The type of component to add
   * @returns The component that was added
   * 
   * @example
   * ```typescript
   * const renderer = gameObject.AddComponent(MeshRenderer);
   * renderer.material = myMaterial;
   * ```
   */
  public AddComponent<T extends Component>(
    componentType: new (gameObject: GameObject) => T
  ): T {
    // Check if component already exists (for singleton components)
    if (this.HasSingletonComponent(componentType)) {
      throw new Error(
        `Cannot add component '${componentType.name}' because it is a singleton and already exists on this GameObject`
      );
    }

    const component = new componentType(this);
    this._components.push(component);

    // Call Awake if GameObject is in active scene
    if (this.activeInHierarchy) {
      component.Awake();
      if (component.enabled) {
        component.OnEnable();
      }
    }

    return component;
  }

  /**
   * Returns the component of Type type if the game object has one attached, null if it doesn't.
   * 
   * @param componentType - The type of component to retrieve
   * @returns The component if found, null otherwise
   */
  public GetComponent<T extends Component>(
    componentType: new (...args: any[]) => T
  ): T | null {
    for (const component of this._components) {
      if (component instanceof componentType) {
        return component as T;
      }
    }
    return null;
  }

  /**
   * Returns all components of Type type in the GameObject.
   */
  public GetComponents<T extends Component>(
    componentType: new (...args: any[]) => T
  ): T[] {
    const results: T[] = [];
    for (const component of this._components) {
      if (component instanceof componentType) {
        results.push(component as T);
      }
    }
    return results;
  }

  /**
   * Returns the component of Type type in the GameObject or any of its children using depth first search.
   */
  public GetComponentInChildren<T extends Component>(
    componentType: new (...args: any[]) => T,
    includeInactive: boolean = false
  ): T | null {
    // Check self
    if (includeInactive || this.activeInHierarchy) {
      const component = this.GetComponent(componentType);
      if (component) return component;
    }

    // Check children
    for (let i = 0; i < this._transform.childCount; i++) {
      const child = this._transform.GetChild(i);
      const component = child.gameObject.GetComponentInChildren(
        componentType,
        includeInactive
      );
      if (component) return component;
    }

    return null;
  }

  /**
   * Removes a component from the GameObject.
   */
  public RemoveComponent(component: Component): void {
    const index = this._components.indexOf(component);
    if (index === -1) {
      throw new Error('Component not found on this GameObject');
    }

    if (component instanceof Transform) {
      throw new Error('Cannot remove Transform component');
    }

    this._components.splice(index, 1);
    component.OnDestroy();
  }

  /**
   * Activates/Deactivates the GameObject, depending on the given true or false value.
   */
  public SetActive(value: boolean): void {
    if (this._isActive === value) return;

    this._isActive = value;

    // Propagate to components
    for (const component of this._components) {
      if (value && component.enabled) {
        component.OnEnable();
      } else if (!value) {
        component.OnDisable();
      }
    }

    // Propagate to children
    for (let i = 0; i < this._transform.childCount; i++) {
      const child = this._transform.GetChild(i);
      // Trigger child's activeInHierarchy recalculation
      child.gameObject.OnParentActiveChanged();
    }
  }

  /**
   * Compares if two objects refer to the same object.
   */
  public static Equals(a: GameObject | null, b: GameObject | null): boolean {
    if (a === b) return true;
    if (a === null || b === null) return false;
    return a._instanceId === b._instanceId;
  }

  /**
   * Removes a gameobject, component or asset.
   * 
   * @param obj - The object to destroy
   * @param t - Optional time to delay destruction (in seconds)
   */
  public static Destroy(obj: UnityObject, t: number = 0): void {
    if (t > 0) {
      // Schedule destruction
      setTimeout(() => GameObject.DestroyImmediate(obj), t * 1000);
    } else {
      // Destroy at end of current frame
      GameObject._destroyQueue.push(obj);
    }
  }

  /**
   * Destroys the object immediately.
   */
  public static DestroyImmediate(obj: UnityObject): void {
    if (obj instanceof GameObject) {
      // Destroy all components
      for (const component of obj._components) {
        component.OnDestroy();
      }
      obj._components = [];

      // Remove from registry
      GameObject._gameObjects.delete(obj._instanceId);

      // Remove from transform hierarchy
      if (obj._transform.parent) {
        obj._transform.SetParent(null);
      }

      // Destroy all children
      while (obj._transform.childCount > 0) {
        const child = obj._transform.GetChild(0);
        GameObject.DestroyImmediate(child.gameObject);
      }
    } else if (obj instanceof Component) {
      obj.gameObject.RemoveComponent(obj);
    }
  }

  /**
   * Makes the object not be destroyed automatically when loading a new scene.
   */
  public static DontDestroyOnLoad(target: GameObject): void {
    target._scene = null; // Remove from scene so it persists
    GameObject._persistentObjects.add(target);
  }

  // Static factories

  /**
   * Creates a game object with a primitive mesh renderer and appropriate collider.
   */
  public static CreatePrimitive(type: PrimitiveType): GameObject {
    const obj = new GameObject(type);
    const meshFilter = obj.AddComponent(MeshFilter);
    const meshRenderer = obj.AddComponent(MeshRenderer);
    
    // Create primitive mesh
    meshFilter.mesh = MeshGenerator.CreatePrimitive(type);
    
    // Add default material
    meshRenderer.material = Material.defaultMaterial;
    
    // Add collider based on type
    switch (type) {
      case PrimitiveType.Cube:
        obj.AddComponent(BoxCollider);
        break;
      case PrimitiveType.Sphere:
        obj.AddComponent(SphereCollider);
        break;
      case PrimitiveType.Capsule:
        obj.AddComponent(CapsuleCollider);
        break;
      // ... other types
    }
    
    return obj;
  }

  /**
   * Finds a GameObject by name and returns it.
   */
  public static Find(name: string): GameObject | null {
    for (const [, gameObject] of GameObject._gameObjects) {
      if (gameObject.name === name) {
        return gameObject;
      }
    }
    return null;
  }

  /**
   * Returns an array of active GameObjects tagged tag.
   */
  public static FindGameObjectsWithTag(tag: string): GameObject[] {
    const results: GameObject[] = [];
    for (const [, gameObject] of GameObject._gameObjects) {
      if (gameObject.tag === tag && gameObject.activeInHierarchy) {
        results.push(gameObject);
      }
    }
    return results;
  }

  /**
   * Returns one active GameObject tagged tag.
   */
  public static FindWithTag(tag: string): GameObject | null {
    for (const [, gameObject] of GameObject._gameObjects) {
      if (gameObject.tag === tag && gameObject.activeInHierarchy) {
        return gameObject;
      }
    }
    return null;
  }

  // Internal methods
  private static _destroyQueue: UnityObject[] = [];
  private static _persistentObjects: Set<GameObject> = new Set();

  /**
   * Process destroy queue (called at end of frame)
   * @internal
   */
  public static _ProcessDestroyQueue(): void {
    for (const obj of GameObject._destroyQueue) {
      GameObject.DestroyImmediate(obj);
    }
    GameObject._destroyQueue = [];
  }

  private HasSingletonComponent(componentType: new (...args: any[]) => Component): boolean {
    // Components like Transform, Camera, etc. can only have one instance
    const singletonComponents = [Transform, Camera, AudioListener, NetworkIdentity];
    
    if (!singletonComponents.some((c) => componentType === c)) {
      return false;
    }

    return this.GetComponent(componentType) !== null;
  }

  private OnParentActiveChanged(): void {
    const nowActive = this.activeInHierarchy;
    
    for (const component of this._components) {
      if (nowActive && component.enabled) {
        component.OnEnable();
      } else if (!nowActive && component.enabled) {
        component.OnDisable();
      }
    }

    // Propagate to children
    for (let i = 0; i < this._transform.childCount; i++) {
      const child = this._transform.GetChild(i);
      child.gameObject.OnParentActiveChanged();
    }
  }
}

export enum PrimitiveType {
  Sphere = 'Sphere',
  Capsule = 'Capsule',
  Cylinder = 'Cylinder',
  Cube = 'Cube',
  Plane = 'Plane',
  Quad = 'Quad',
}
```

### Phase 2: Runtime & Rendering (Week 3-4)
**Goal**: Game loop, basic rendering with Three.js, camera system

#### 2.1 Runtime System (`packages/runtime/`)
1. `Time.ts` - deltaTime, time, timeScale, fixedDeltaTime
2. `GameLoop.ts` - requestAnimationFrame loop with FixedUpdate accumulator
3. `Coroutine.ts` - Generator-based coroutines
4. `Application.ts` - Application lifecycle, platform detection

#### 2.2 Renderer (`packages/renderer/`)
1. `RenderPipeline.ts` - Abstract render pipeline interface
2. `UniversalRenderPipeline.ts` - Forward rendering pipeline
3. `Camera.ts` - Camera component with projection matrices
4. `Light.ts` - Directional, Point, Spot lights
5. `MeshRenderer.ts` - Render meshes with materials
6. `Material.ts` - Shader + properties
7. `Shader.ts` - Shader compilation and uniform management
8. `Texture.ts` - Texture loading and GPU upload

**Critical Performance Requirements**:
- Implement **frustum culling** (don't render off-screen objects)
- Implement **static batching** (combine static meshes into one draw call)
- Implement **GPU instancing** (render many identical objects in one call)
- Target: **60 FPS with 10,000+ objects**

### Phase 3: Physics (Week 5)
**Goal**: Integrate Rapier.js, implement Unity physics API

#### 3.1 Physics Integration (`packages/physics/`)
1. `PhysicsWorld.ts` - Rapier world wrapper
2. `Rigidbody.ts` - Unity Rigidbody → Rapier RigidBody adapter
3. `Collider.ts` - Base collider class
4. `BoxCollider.ts`, `SphereCollider.ts`, `CapsuleCollider.ts`, `MeshCollider.ts`
5. `PhysicsMaterial.ts` - Friction, bounciness
6. `CharacterController.ts` - Kinematic character movement
7. `Joint.ts` - Base joint class
8. `HingeJoint.ts`, `SpringJoint.ts`, `FixedJoint.ts`

**Physics Sync Pattern**:
```typescript
// In FixedUpdate (50Hz):
1. Sync Unity Transform → Rapier (for kinematic bodies)
2. Rapier.world.step(fixedDeltaTime)
3. Sync Rapier → Unity Transform (for dynamic bodies)
4. Process collision callbacks (OnCollisionEnter, OnCollisionStay, OnCollisionExit)
5. Process trigger callbacks (OnTriggerEnter, OnTriggerStay, OnTriggerExit)
```

### Phase 4: Animation (Week 6-7)
**Goal**: Animation system, Timeline, IK

#### 4.1 Animation Core (`packages/animation/`)
1. `AnimationClip.ts` - Keyframe animation data
2. `AnimationCurve.ts` - Bezier curve interpolation
3. `Animator.ts` - Animation playback component
4. `AnimatorController.ts` - State machine
5. `AnimatorState.ts` - State with motion, transitions
6. `AnimatorTransition.ts` - Conditions, blend duration
7. `BlendTree.ts` - 1D, 2D blend trees
8. `Avatar.ts` - Humanoid rig definition
9. `IKSolver.ts` - Two-bone IK

#### 4.2 Timeline (`packages/animation/timeline/`)
1. `TimelineAsset.ts` - Timeline track collection
2. `PlayableDirector.ts` - Timeline playback component
3. `AnimationTrack.ts` - Animation clip track
4. `ActivationTrack.ts` - GameObject enable/disable track
5. `AudioTrack.ts` - Audio clip track
6. `SignalTrack.ts` - Event emission track

### Phase 5: Audio (Week 8)
**Goal**: Web Audio API integration, AudioMixer

#### 5.1 Audio System (`packages/audio/`)
1. `AudioClip.ts` - Audio file loading (MP3, WAV, OGG)
2. `AudioSource.ts` - 3D spatial audio playback
3. `AudioListener.ts` - Listener component
4. `AudioMixer.ts` - Mixer groups, snapshots
5. `AudioMixerGroup.ts` - Group in mixer hierarchy
6. `AudioMixerSnapshot.ts` - Mixer state preset
7. `AudioReverbZone.ts` - Reverb effect zone

### Phase 6: UI System (Week 9)
**Goal**: React-based UI Toolkit, Canvas

#### 6.1 UI Toolkit (`packages/ui/`)
1. `UIDocument.ts` - Root UI component
2. `VisualElement.ts` - Base UI element
3. `Button.ts`, `Toggle.ts`, `Slider.ts`, `TextField.ts`
4. `ScrollView.ts`, `ListView.ts`
5. `Layout.ts` - Flexbox-style layout
6. `StyleSheet.ts` - CSS-like styling

#### 6.2 Canvas (Legacy UI)
1. `Canvas.ts` - Canvas component (screen space, world space)
2. `CanvasScaler.ts` - Resolution-independent UI
3. `GraphicRaycaster.ts` - UI hit testing
4. `RectTransform.ts` - 2D layout transform
5. `Image.ts`, `Text.ts`, `RawImage.ts`
6. `Button.ts`, `Toggle.ts`, `Slider.ts`, `InputField.ts`

### Phase 7: Advanced Systems (Week 10-14)
- Particle System (Week 10)
- Terrain System (Week 11)
- NavMesh & AI (Week 12)
- Networking (Week 13)
- XR Support (Week 14)

### Phase 8: Editor (Week 15-20)
- Editor UI (React)
- Scene View, Game View, Hierarchy, Inspector
- Asset Browser, Console, Profiler

### Phase 9: Advanced Tools (Week 21-26)
- Shader Graph
- Visual Scripting
- Cinemachine
- ProBuilder
- VFX Graph

## 📝 Coding Standards & Patterns

### TypeScript Style Guide

```typescript
// ✅ GOOD: Clear, type-safe, documented

/**
 * Calculates the forward vector in world space.
 * @returns The forward direction vector (magnitude = 1)
 */
public get forward(): Vector3 {
  return this._rotation.multiplyVector3(Vector3.forward);
}

// ❌ BAD: No documentation, unclear name, implicit any
public get f() {
  return this.r.multiplyVector3(Vector3.forward);
}
```

### Error Handling Pattern
```typescript
// ✅ GOOD: Informative error messages
public GetComponent<T extends Component>(type: new () => T): T | null {
  const component = this._components.find(c => c instanceof type);
  if (!component) {
    console.warn(
      `Component '${type.name}' not found on GameObject '${this.name}' (ID: ${this._instanceId})`
    );
    return null;
  }
  return component as T;
}

// ❌ BAD: Silent failure or cryptic error
public GetComponent<T>(type: any): T {
  return this._components.find(c => c instanceof type) as T; // Can be undefined!
}
```

### Performance-Critical Code
```typescript
// ✅ GOOD: Cache frequently accessed values
private _cachedMagnitude: number = 0;
private _isDirty: boolean = true;

public get magnitude(): number {
  if (this._isDirty) {
    this._cachedMagnitude = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    this._isDirty = false;
  }
  return this._cachedMagnitude;
}

public Set(x: number, y: number, z: number): void {
  this.x = x;
  this.y = y;
  this.z = z;
  this._isDirty = true;
}

// ❌ BAD: Recalculate every access
public get magnitude(): number {
  return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
}
```

## 🧪 Testing Requirements

### Test Coverage Targets
- **Core Systems**: 95%+ line coverage
- **Subsystems**: 80%+ line coverage
- **Editor**: 70%+ line coverage

### Test Structure
```
packages/core/src/math/
├── Vector3.ts
└── __tests__/
    └── Vector3.test.ts
```

### Test Pattern
```typescript
describe('ComponentName', () => {
  describe('methodName', () => {
    it('should handle normal case', () => {
      // Arrange
      const component = new Component();
      
      // Act
      const result = component.method();
      
      // Assert
      expect(result).toBe(expected);
    });

    it('should handle edge case', () => {
      // Test edge cases
    });

    it('should throw error on invalid input', () => {
      expect(() => component.method(invalid)).toThrow();
    });
  });
});
```

## 🚀 Performance Optimization Checklist

### For Every System, Consider:
- [ ] **Object Pooling**: Can objects be reused instead of allocated?
- [ ] **Caching**: Are computed values cached when possible?
- [ ] **Lazy Evaluation**: Is work deferred until actually needed?
- [ ] **Early Exit**: Can we return early to avoid unnecessary work?
- [ ] **Batching**: Can multiple operations be combined into one?
- [ ] **Web Workers**: Can heavy computation be offloaded?
- [ ] **Memory Layout**: Is data stored in cache-friendly way?
- [ ] **Garbage Collection**: Are allocations minimized in hot paths?

## 📚 Required Reading Before Implementation

Before implementing each system, **always** read:
1. Unity's official documentation for that system
2. Relevant architecture docs (ARCHITECTURE.md)
3. Performance best practices for web (MDN)
4. TypeScript best practices (TypeScript Handbook)
5. Three.js documentation (for rendering)
6. Rapier.js documentation (for physics)

## 🎯 Success Criteria

Each implementation must:
1. **Pass all tests** (>80% coverage)
2. **Meet performance targets** (profile and optimize)
3. **Follow TypeScript strict mode** (zero errors, zero warnings)
4. **Have comprehensive docs** (TSDoc for all public APIs)
5. **Match Unity API** (same method names, behavior)
6. **Be production-ready** (error handling, edge cases)

## 🔄 Iterative Development Process

For each component/system:
1. **Plan** (30 min) - Write detailed implementation plan
2. **Research** (1 hour) - Read docs, find algorithms
3. **Implement** (3-6 hours) - Write code with tests
4. **Test** (1 hour) - Unit tests + integration tests
5. **Optimize** (1 hour) - Profile and optimize hot paths
6. **Document** (30 min) - Write API docs and examples
7. **Review** (30 min) - Self-review against standards

---

## 🎓 Next Documents to Read

- [`COMPONENT_REFERENCE.md`](COMPONENT_REFERENCE.md) - All built-in Unity components with exact API
- [`API_DESIGN.md`](API_DESIGN.md) - Public API surface for each package
- [`RENDERING_GUIDE.md`](RENDERING_GUIDE.md) - Rendering pipeline implementation details
- [`PHYSICS_GUIDE.md`](PHYSICS_GUIDE.md) - Physics integration with Rapier
- [`EDITOR_GUIDE.md`](EDITOR_GUIDE.md) - Editor architecture and React integration
