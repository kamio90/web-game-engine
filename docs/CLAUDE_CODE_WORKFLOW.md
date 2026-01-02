# Claude Code Autonomous Development Workflow

> **This document is the PRIMARY guide for Claude Code agents implementing Web Game Engine.**
> Always start here before beginning any implementation task.

## 🎯 Mission Statement

You are implementing **Web Game Engine** - a complete, production-ready Unity clone for the web. Your code will be used by thousands of game developers. Every line must be **principal-level TypeScript**, **thoroughly tested**, and **performant**.

## 🚀 Getting Started

### Initial Setup (First Time Only)

```bash
# 1. Navigate to project directory
cd /path/to/web-game-engine

# 2. Read ALL documentation first (critical!)
claude view /path/to/web-game-engine/README.md
claude view /path/to/web-game-engine/ARCHITECTURE.md
claude view /path/to/web-game-engine/IMPLEMENTATION_GUIDE.md
claude view /path/to/web-game-engine/COMPONENT_REFERENCE.md

# 3. Initialize monorepo
pnpm install

# 4. Verify setup
pnpm typecheck
pnpm lint
pnpm test
```

## 📋 Development Workflow (For Every Task)

### Phase 1: PLAN (30 minutes)

**Never skip this phase!** Planning prevents wasted effort.

1. **Read what_has_been_done.md**
```bash
claude view /path/to/web-game-engine/what_has_been_done.md
```
This file tracks completed work. **Update it after every session.**

2. **Identify current task**
Based on IMPLEMENTATION_GUIDE.md, determine:
- What phase are we in? (Foundation, Rendering, Physics, etc.)
- What specific component/system needs implementation?
- What are its dependencies?

3. **Research deeply**
```bash
# Search Unity documentation
claude web_search "Unity [ComponentName] API documentation"

# Search best practices
claude web_search "TypeScript performance optimization [topic]"

# Search algorithm details
claude web_search "[algorithm name] implementation details"
```

4. **Create detailed implementation plan**
Write a plan in a temporary file:
```bash
claude create PLAN.md "
# Implementation Plan: [ComponentName]

## Dependencies
- Requires: [list dependencies]
- Used by: [list dependents]

## API Surface
[List all public methods, properties from COMPONENT_REFERENCE.md]

## Implementation Strategy
1. [Step 1]
2. [Step 2]
...

## Test Strategy
- Unit tests: [describe]
- Integration tests: [describe]
- Performance tests: [describe]

## Performance Targets
- [metric 1]: [target]
- [metric 2]: [target]

## Estimated Time: [X hours]
"
```

### Phase 2: IMPLEMENT (3-6 hours per component)

**Implementation Pattern:**

```typescript
// 1. Start with interface/type definitions
interface IComponentName {
  // Define public API first
}

// 2. Implement class with full TSDoc
/**
 * Brief description of component.
 * 
 * Detailed explanation of what this component does and how to use it.
 * 
 * @example
 * ```typescript
 * const component = new ComponentName();
 * component.DoSomething();
 * ```
 */
export class ComponentName extends BaseClass implements IComponentName {
  // 3. Private fields first
  private _internalState: Type;
  
  // 4. Public properties (with getters/setters)
  /**
   * Brief property description.
   */
  public get propertyName(): Type {
    return this._internalState;
  }
  
  public set propertyName(value: Type) {
    this._internalState = value;
  }
  
  // 5. Constructor
  constructor() {
    super();
    this._internalState = defaultValue;
  }
  
  // 6. Public methods (alphabetical order)
  /**
   * Method description.
   * @param param1 - Description
   * @returns Description
   */
  public MethodName(param1: Type): ReturnType {
    // Implementation with error handling
    if (!this.ValidateInput(param1)) {
      throw new Error(`Invalid parameter: ${param1}`);
    }
    
    // Main logic
    const result = this.InternalLogic(param1);
    return result;
  }
  
  // 7. Protected methods (for inheritance)
  protected InternalMethod(): void {
    // Implementation
  }
  
  // 8. Private methods (implementation details)
  private InternalLogic(param: Type): ReturnType {
    // Implementation
  }
  
  private ValidateInput(param: Type): boolean {
    // Validation logic
    return true;
  }
}
```

**Performance Checklist (CRITICAL):**
- [ ] No allocations in Update() or hot paths
- [ ] Cache frequently accessed values
- [ ] Use object pools where appropriate
- [ ] Minimize property access (cache to local variables)
- [ ] Use TypedArrays for large datasets
- [ ] Profile with Chrome DevTools

**Error Handling Pattern:**
```typescript
try {
  // Risky operation
  const result = await SomeAsyncOperation();
  return result;
} catch (error) {
  // Provide context and chain errors
  throw new Error(
    `Failed to perform operation in ${this.constructor.name}: ${error.message}`,
    { cause: error }
  );
}
```

### Phase 3: TEST (1 hour)

**Test File Structure:**
```typescript
// packages/[package-name]/src/__tests__/ComponentName.test.ts

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ComponentName } from '../ComponentName';

describe('ComponentName', () => {
  let component: ComponentName;
  
  beforeEach(() => {
    // Setup before each test
    component = new ComponentName();
  });
  
  afterEach(() => {
    // Cleanup after each test
    component.Destroy();
  });
  
  describe('constructor', () => {
    it('should initialize with default values', () => {
      expect(component.propertyName).toBe(defaultValue);
    });
  });
  
  describe('MethodName', () => {
    it('should handle normal case', () => {
      const result = component.MethodName(validInput);
      expect(result).toEqual(expectedOutput);
    });
    
    it('should throw on invalid input', () => {
      expect(() => component.MethodName(invalidInput)).toThrow();
    });
    
    it('should handle edge case: empty input', () => {
      const result = component.MethodName(emptyInput);
      expect(result).toEqual(expectedEmptyOutput);
    });
    
    it('should handle edge case: max values', () => {
      const result = component.MethodName(maxInput);
      expect(result).toEqual(expectedMaxOutput);
    });
  });
  
  describe('performance', () => {
    it('should process 10000 items in <100ms', () => {
      const start = performance.now();
      
      for (let i = 0; i < 10000; i++) {
        component.MethodName(testData[i]);
      }
      
      const elapsed = performance.now() - start;
      expect(elapsed).toBeLessThan(100);
    });
  });
});
```

**Test Coverage Requirements:**
- Minimum 80% line coverage
- All public methods tested
- All edge cases covered
- Performance tests for hot paths

**Run Tests:**
```bash
# Run tests for current package
pnpm test

# Run tests with coverage
pnpm test --coverage

# Run tests in watch mode (during development)
pnpm test --watch
```

### Phase 4: DOCUMENT (30 minutes)

**Documentation Checklist:**
- [ ] TSDoc comments on all public APIs
- [ ] Usage examples in comments
- [ ] Update relevant docs in `docs/` folder
- [ ] Add entry to CHANGELOG.md
- [ ] Update what_has_been_done.md

**TSDoc Template:**
```typescript
/**
 * Brief one-line description.
 * 
 * Longer description that explains:
 * - What this method does
 * - When to use it
 * - Any important caveats or gotchas
 * 
 * @param paramName - Description of parameter
 * @param optionalParam - Description (optional, default: value)
 * @returns Description of return value
 * 
 * @throws {ErrorType} When this error occurs
 * 
 * @example
 * ```typescript
 * // Example usage
 * const result = component.Method(param);
 * console.log(result);
 * ```
 * 
 * @see {@link RelatedMethod} for related functionality
 * @since 0.1.0
 */
public Method(paramName: Type, optionalParam: Type = defaultValue): ReturnType {
  // Implementation
}
```

### Phase 5: REVIEW & COMMIT (30 minutes)

**Self-Review Checklist:**
- [ ] TypeScript compiles with no errors (`pnpm typecheck`)
- [ ] ESLint passes with no warnings (`pnpm lint`)
- [ ] All tests pass (`pnpm test`)
- [ ] Code follows style guide
- [ ] No console.log statements (use proper logging)
- [ ] No commented-out code
- [ ] No TODO comments without GitHub issue links
- [ ] Performance targets met
- [ ] Documentation complete

**Update what_has_been_done.md:**
```markdown
## [Date] - [ComponentName] Implementation

### Completed
- ✅ [ComponentName] core implementation
- ✅ Unit tests (85% coverage)
- ✅ Integration tests
- ✅ Documentation

### Performance
- [Metric]: [Result] (target: [Target]) ✅

### Next Steps
- [ ] [Next task]
```

**Git Commit:**
```bash
# Stage changes
git add .

# Commit with descriptive message
git commit -m "feat(package-name): implement ComponentName

- Add ComponentName with full Unity API compatibility
- Implement all public methods and properties
- Add comprehensive tests (85% coverage)
- Achieve 60 FPS target with 10k objects

Closes #issue-number"
```

## 🔄 Iterative Development Pattern

### For Large Systems (e.g., Rendering Pipeline)

Break down into smaller milestones:

```
Week 1: Core Rendering
├── Day 1-2: Three.js integration, basic scene setup
├── Day 3-4: Camera system, view/projection matrices
├── Day 5: MeshRenderer, Material basics
└── Weekend: Testing & documentation

Week 2: Lighting & Shadows
├── Day 1-2: Light components (Directional, Point, Spot)
├── Day 3-4: Shadow mapping implementation
├── Day 5: Light culling & optimization
└── Weekend: Testing & documentation

Week 3: Advanced Features
├── Day 1-2: Post-processing stack
├── Day 3-4: Frustum culling, LOD system
├── Day 5: GPU instancing, batching
└── Weekend: Performance optimization & testing
```

### Daily Workflow

```
Morning (3 hours):
1. Review what_has_been_done.md (10 min)
2. Plan today's tasks (20 min)
3. Implementation sprint (2.5 hours)

Afternoon (3 hours):
1. Continue implementation (1.5 hours)
2. Write tests (1 hour)
3. Documentation & review (30 min)

Evening:
1. Run full test suite
2. Update what_has_been_done.md
3. Commit progress
```

## 🧪 Testing Strategy

### Test Types & When to Use

#### 1. Unit Tests (60% of tests)
Test individual functions and methods in isolation.

**When to write:**
- For every public method
- For complex algorithms
- For utility functions

**Example:**
```typescript
describe('Vector3.Add', () => {
  it('should add two vectors correctly', () => {
    const a = new Vector3(1, 2, 3);
    const b = new Vector3(4, 5, 6);
    const result = Vector3.Add(a, b);
    expect(result).toEqual(new Vector3(5, 7, 9));
  });
});
```

#### 2. Integration Tests (30% of tests)
Test how components work together.

**When to write:**
- For component interactions
- For system workflows
- For scene management

**Example:**
```typescript
describe('GameObject Component Integration', () => {
  it('should allow adding and removing components', () => {
    const gameObject = new GameObject();
    const renderer = gameObject.AddComponent(MeshRenderer);
    
    expect(gameObject.GetComponent(MeshRenderer)).toBe(renderer);
    
    gameObject.RemoveComponent(renderer);
    
    expect(gameObject.GetComponent(MeshRenderer)).toBeNull();
  });
});
```

#### 3. Performance Tests (10% of tests)
Verify performance targets are met.

**When to write:**
- For hot paths (Update loops)
- For batch operations
- For memory allocations

**Example:**
```typescript
describe('Rendering Performance', () => {
  it('should render 10000 objects at 60 FPS', () => {
    const scene = SetupScene(10000);
    const frameTime = MeasureFrameTime(scene, 100);
    
    expect(frameTime).toBeLessThan(16.67); // 60 FPS
  });
});
```

## 🎨 Code Style & Conventions

### Naming Conventions

```typescript
// PascalCase for classes, interfaces, enums, type aliases
class GameObject {}
interface IComponent {}
enum Space { World, Self }
type ComponentType = typeof Component;

// camelCase for variables, functions, methods, parameters
const gameObject = new GameObject();
function calculateDistance(a: Vector3, b: Vector3): number {}

// PascalCase for public methods (Unity convention)
public AddComponent<T>(type: new () => T): T {}

// camelCase for private/protected methods and properties
private _internalState: number;
protected calculateInternal(): void {}

// UPPER_SNAKE_CASE for constants
const MAX_PARTICLE_COUNT = 100000;

// Prefix interfaces with 'I'
interface ISerializable {}

// Prefix private fields with underscore
private _transform: Transform;

// Boolean variables should be questions
const isActive: boolean;
const hasComponent: boolean;
const canMove: boolean;
```

### File Organization

```typescript
// 1. Imports (grouped and sorted)
import { Vector3, Quaternion } from '../math';
import { Component } from './Component';
import { GameObject } from './GameObject';

// 2. Constants
const DEFAULT_MASS = 1.0;
const MAX_VELOCITY = 100.0;

// 3. Enums
export enum ForceMode {
  Force,
  Impulse,
}

// 4. Interfaces
export interface IRigidbodyOptions {
  mass?: number;
  useGravity?: boolean;
}

// 5. Type aliases
export type RigidbodyType = 'dynamic' | 'kinematic' | 'static';

// 6. Main class
export class Rigidbody extends Component {
  // Implementation
}

// 7. Helper classes (if small and related)
class CollisionInfo {
  // Implementation
}
```

## 🚨 Common Pitfalls & How to Avoid

### Pitfall 1: Memory Leaks
**Problem:** Not cleaning up references
**Solution:** Implement dispose patterns

```typescript
class Component {
  private _listeners: Function[] = [];
  
  OnDestroy(): void {
    // Clean up event listeners
    for (const listener of this._listeners) {
      EventSystem.RemoveListener(listener);
    }
    this._listeners = [];
    
    // Clean up other resources
    this.CleanupResources();
  }
}
```

### Pitfall 2: Allocations in Update()
**Problem:** Creating new objects every frame causes GC pressure
**Solution:** Reuse objects, use object pools

```typescript
// ❌ BAD: Allocates every frame
Update(): void {
  const direction = new Vector3(1, 0, 0); // Allocation!
  this.transform.Translate(direction);
}

// ✅ GOOD: Reuse static instance
private static _cachedDirection = new Vector3(1, 0, 0);

Update(): void {
  this.transform.Translate(Component._cachedDirection);
}
```

### Pitfall 3: Blocking Operations in Main Thread
**Problem:** Heavy computations freeze the game
**Solution:** Use Web Workers for heavy work

```typescript
// ❌ BAD: Blocks main thread
async LoadAssets(): Promise<void> {
  const data = await this.HeavyProcessing(); // Blocks!
}

// ✅ GOOD: Offload to worker
async LoadAssets(): Promise<void> {
  const worker = new Worker('asset-processor.worker.js');
  const data = await this.SendToWorker(worker, assetData);
}
```

### Pitfall 4: Improper Error Handling
**Problem:** Silent failures make debugging impossible
**Solution:** Throw informative errors, validate inputs

```typescript
// ❌ BAD: Silent failure
public GetComponent<T>(type: new () => T): T | null {
  return this._components.find(c => c instanceof type) as T;
}

// ✅ GOOD: Validate and provide context
public GetComponent<T>(type: new () => T): T | null {
  if (!type) {
    throw new Error('GetComponent: type parameter cannot be null');
  }
  
  const component = this._components.find(c => c instanceof type);
  
  if (!component) {
    console.warn(
      `Component '${type.name}' not found on GameObject '${this.name}' (ID: ${this._instanceId})`
    );
  }
  
  return component as T | null;
}
```

## 📊 Performance Monitoring

### Profiling Checklist

Before committing any code:
1. Run Chrome DevTools Performance profiler
2. Record 60 seconds of gameplay
3. Verify:
   - Frame time < 16.67ms (60 FPS)
   - No long tasks (>50ms)
   - Minimal GC pauses (<5ms)
   - No memory leaks (heap stable over time)

### Performance Targets (from ARCHITECTURE.md)

| Metric | Target | How to Measure |
|--------|--------|----------------|
| Frame Rate | 60 FPS @ 1080p | Performance.now() between frames |
| Visible Objects | 10,000+ | Rendering stats counter |
| Scene Load | <1s | Time from SceneManager.LoadScene() to scene ready |
| Engine Init | <50ms | Time from Engine.Initialize() to first frame |
| Bundle Size | <100KB (core) | webpack-bundle-analyzer |
| Memory | <100MB baseline | Chrome DevTools Memory profiler |

## 🎓 Learning Resources

### Before Implementing X, Read:

**Transform & Scene Graph:**
- [Unity Transform Documentation](https://docs.unity3d.com/ScriptReference/Transform.html)
- [Scene Graph Wikipedia](https://en.wikipedia.org/wiki/Scene_graph)

**Rendering:**
- [Three.js Examples](https://threejs.org/examples/)
- [Real-Time Rendering Book](http://www.realtimerendering.com/)
- [Learn OpenGL](https://learnopengl.com/)

**Physics:**
- [Rapier.js Documentation](https://rapier.rs/docs/)
- [Game Physics Engine Development](https://www.amazon.com/Game-Physics-Engine-Development-Commercial-Grade/dp/0123819768)

**Animation:**
- [Unity Animation Manual](https://docs.unity3d.com/Manual/AnimationOverview.html)
- [Skeletal Animation Wikipedia](https://en.wikipedia.org/wiki/Skeletal_animation)

## 🆘 When Stuck

### Debugging Strategy

1. **Reproduce the issue**
   - Create minimal test case
   - Write failing test

2. **Isolate the problem**
   - Binary search (comment out code until it works)
   - Check assumptions with console.log
   - Use debugger with breakpoints

3. **Research solutions**
   ```bash
   claude web_search "[error message]"
   claude web_search "[technology] [problem] best practices"
   ```

4. **Ask for help** (update this document!)
   - Document the problem
   - Document the solution
   - Help future developers

## ✅ Daily Checklist

### Morning (Before Starting)
- [ ] `git pull` to get latest changes
- [ ] Read what_has_been_done.md
- [ ] Review today's tasks from IMPLEMENTATION_GUIDE.md
- [ ] Create PLAN.md for today

### Evening (Before Finishing)
- [ ] Run full test suite (`pnpm test`)
- [ ] Run type check (`pnpm typecheck`)
- [ ] Run linter (`pnpm lint`)
- [ ] Update what_has_been_done.md
- [ ] Commit progress
- [ ] Push to remote

## 🎯 Success Criteria

Your implementation is **DONE** when:
- ✅ All tests pass (>80% coverage)
- ✅ TypeScript compiles with no errors
- ✅ ESLint passes with no warnings
- ✅ Performance targets met (profiled)
- ✅ API matches Unity exactly (verified against COMPONENT_REFERENCE.md)
- ✅ Documentation complete (TSDoc + examples)
- ✅ Code reviewed (self-review checklist passed)
- ✅ what_has_been_done.md updated

---

**Remember:** You're building a production-grade game engine. Every line of code matters. Take your time, test thoroughly, and make it perfect. 🚀
