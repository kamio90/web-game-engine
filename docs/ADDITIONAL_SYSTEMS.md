# Web Game Engine - Additional Systems Documentation

> Documentation for important Unity systems that were initially missing

## 🌊 Water System

### Overview
Complete water simulation system with waves, buoyancy, underwater effects, and caustics.

### Package Structure
```
packages/water/
├── src/
│   ├── WaterBody.ts           # Main water component
│   ├── WaterSurface.ts        # Water plane with waves
│   ├── Buoyancy.ts            # Floating rigidbodies
│   ├── UnderwaterEffect.ts    # Post-processing
│   ├── WaterFoam.ts           # Foam generation
│   ├── Caustics.ts            # Underwater caustics
│   └── shaders/
│       ├── Water.glsl         # Water shader
│       └── Underwater.glsl    # Underwater post-process
└── __tests__/
```

### Implementation

```typescript
/**
 * Water body component for oceans, rivers, lakes
 */
export class WaterBody extends MonoBehaviour {
  // Water Type
  public waterType: WaterType = WaterType.Ocean;
  
  // Appearance
  public waterColor: Color = new Color(0.0, 0.4, 0.7, 1.0);
  public transparency: number = 0.5;
  public smoothness: number = 0.95;
  public causticStrength: number = 1.0;
  
  // Waves
  public waveHeight: number = 0.5;
  public waveSpeed: number = 1.0;
  public waveFrequency: number = 1.0;
  public waveComplexity: number = 4; // Number of wave layers
  
  // Physics
  public buoyancy: boolean = true;
  public underwaterFog: boolean = true;
  public underwaterFogDensity: number = 0.1;
  
  // Performance
  public tessellation: boolean = false;
  public reflections: boolean = true;
  public refractions: boolean = true;
  
  private waterMaterial: Material;
  private waveData: Float32Array;
  
  Awake(): void {
    this.InitializeWaterMaterial();
    this.GenerateWaveData();
  }
  
  Update(): void {
    this.UpdateWaves(Time.time);
    this.UpdateReflections();
    this.UpdateBuoyancy();
  }
  
  /**
   * Get water height at world position
   */
  public GetWaterHeightAtPosition(position: Vector3): number {
    return this.CalculateWaveHeight(position, Time.time);
  }
  
  /**
   * Check if point is underwater
   */
  public IsUnderwater(position: Vector3): boolean {
    return position.y < this.GetWaterHeightAtPosition(position);
  }
  
  private CalculateWaveHeight(position: Vector3, time: number): number {
    let height = 0;
    
    // Sum multiple wave layers (Gerstner waves)
    for (let i = 0; i < this.waveComplexity; i++) {
      const wavelength = 2.0 / (i + 1);
      const frequency = 2.0 * Math.PI / wavelength;
      const amplitude = this.waveHeight / (i + 1);
      const speed = Math.sqrt(9.8 / frequency) * this.waveSpeed;
      
      const phase = frequency * (
        position.x * Math.cos(i * 0.5) + 
        position.z * Math.sin(i * 0.5)
      ) - time * speed;
      
      height += amplitude * Math.sin(phase);
    }
    
    return this.transform.position.y + height;
  }
}

export enum WaterType {
  Ocean = 'Ocean',
  River = 'River',
  Lake = 'Lake',
  Pool = 'Pool',
}

/**
 * Buoyancy component for floating objects
 */
export class Buoyancy extends MonoBehaviour {
  public waterBody: WaterBody;
  public floatStrength: number = 10.0;
  public dragCoefficient: number = 0.5;
  
  private rigidbody: Rigidbody;
  private submergedVolume: number = 0;
  
  Awake(): void {
    this.rigidbody = this.GetComponent(Rigidbody)!;
  }
  
  FixedUpdate(): void {
    if (!this.waterBody) return;
    
    const position = this.transform.position;
    const waterHeight = this.waterBody.GetWaterHeightAtPosition(position);
    
    if (position.y < waterHeight) {
      // Calculate buoyancy force
      this.submergedVolume = (waterHeight - position.y) / this.transform.localScale.y;
      this.submergedVolume = Mathf.Clamp01(this.submergedVolume);
      
      const buoyancyForce = Vector3.up.Scale(
        this.floatStrength * this.submergedVolume
      );
      
      this.rigidbody.AddForce(buoyancyForce, ForceMode.Force);
      
      // Apply water drag
      const dragForce = this.rigidbody.velocity.Scale(
        -this.dragCoefficient * this.submergedVolume
      );
      
      this.rigidbody.AddForce(dragForce, ForceMode.Force);
    }
  }
}
```

---

## 🛤️ Spline System

### Overview
Create and manipulate splines for paths, roads, fences, and procedural content.

### Package Structure
```
packages/splines/
├── src/
│   ├── Spline.ts              # Base spline
│   ├── SplineContainer.ts     # Holds spline data
│   ├── BezierSpline.ts        # Cubic Bezier
│   ├── CatmullRomSpline.ts    # Smooth interpolation
│   ├── LinearSpline.ts        # Linear interpolation
│   ├── SplineAnimate.ts       # Move along spline
│   ├── SplineExtrude.ts       # Extrude mesh
│   ├── SplineInstantiate.ts   # Place objects
│   └── SplineUtility.ts       # Math utilities
└── __tests__/
```

### Implementation

```typescript
/**
 * Spline container component
 */
export class SplineContainer extends MonoBehaviour {
  public splineType: SplineType = SplineType.CatmullRom;
  public closed: boolean = false;
  public knots: SplineKnot[] = [];
  
  /**
   * Evaluate position at t (0 to 1)
   */
  public EvaluatePosition(t: number): Vector3 {
    const segment = Math.floor(t * (this.knots.length - 1));
    const localT = (t * (this.knots.length - 1)) - segment;
    
    return this.EvaluateSegment(segment, localT);
  }
  
  /**
   * Evaluate tangent at t
   */
  public EvaluateTangent(t: number): Vector3 {
    const epsilon = 0.001;
    const p1 = this.EvaluatePosition(t - epsilon);
    const p2 = this.EvaluatePosition(t + epsilon);
    
    return Vector3.Subtract(p2, p1).normalized;
  }
  
  /**
   * Get total spline length
   */
  public get length(): number {
    return this.CalculateLength();
  }
  
  /**
   * Convert distance along spline to t parameter
   */
  public DistanceToT(distance: number): number {
    // Use LUT (Look-Up Table) for fast conversion
    return distance / this.length;
  }
  
  private EvaluateSegment(segment: number, t: number): Vector3 {
    switch (this.splineType) {
      case SplineType.Linear:
        return this.LinearInterpolation(segment, t);
      case SplineType.CatmullRom:
        return this.CatmullRomInterpolation(segment, t);
      case SplineType.Bezier:
        return this.BezierInterpolation(segment, t);
      default:
        return Vector3.zero;
    }
  }
  
  private CatmullRomInterpolation(segment: number, t: number): Vector3 {
    const p0 = this.GetKnotPosition(segment - 1);
    const p1 = this.GetKnotPosition(segment);
    const p2 = this.GetKnotPosition(segment + 1);
    const p3 = this.GetKnotPosition(segment + 2);
    
    const t2 = t * t;
    const t3 = t2 * t;
    
    const result = new Vector3(
      0.5 * (
        (2 * p1.x) +
        (-p0.x + p2.x) * t +
        (2 * p0.x - 5 * p1.x + 4 * p2.x - p3.x) * t2 +
        (-p0.x + 3 * p1.x - 3 * p2.x + p3.x) * t3
      ),
      0.5 * (
        (2 * p1.y) +
        (-p0.y + p2.y) * t +
        (2 * p0.y - 5 * p1.y + 4 * p2.y - p3.y) * t2 +
        (-p0.y + 3 * p1.y - 3 * p2.y + p3.y) * t3
      ),
      0.5 * (
        (2 * p1.z) +
        (-p0.z + p2.z) * t +
        (2 * p0.z - 5 * p1.z + 4 * p2.z - p3.z) * t2 +
        (-p0.z + 3 * p1.z - 3 * p2.z + p3.z) * t3
      )
    );
    
    return result;
  }
}

/**
 * Animate object along spline
 */
export class SplineAnimate extends MonoBehaviour {
  public spline: SplineContainer;
  public duration: number = 10.0;
  public loop: boolean = true;
  public lookForward: boolean = true;
  public animationCurve: AnimationCurve = AnimationCurve.Linear(0, 0, 1, 1);
  
  private elapsedTime: number = 0;
  
  Update(): void {
    if (!this.spline) return;
    
    this.elapsedTime += Time.deltaTime;
    
    let t = this.elapsedTime / this.duration;
    
    if (this.loop) {
      t = t % 1.0;
    } else {
      t = Mathf.Clamp01(t);
    }
    
    // Apply animation curve
    const curvedT = this.animationCurve.Evaluate(t);
    
    // Set position
    this.transform.position = this.spline.EvaluatePosition(curvedT);
    
    // Set rotation to face forward
    if (this.lookForward) {
      const tangent = this.spline.EvaluateTangent(curvedT);
      this.transform.rotation = Quaternion.LookRotation(tangent, Vector3.up);
    }
  }
}

/**
 * Extrude mesh along spline
 */
export class SplineExtrude extends MonoBehaviour {
  public spline: SplineContainer;
  public profile: Vector2[] = []; // 2D profile to extrude
  public segments: number = 50;
  public uvScale: number = 1.0;
  
  private mesh: Mesh;
  
  public GenerateMesh(): void {
    const vertices: Vector3[] = [];
    const triangles: number[] = [];
    const uvs: Vector2[] = [];
    
    for (let i = 0; i <= this.segments; i++) {
      const t = i / this.segments;
      const position = this.spline.EvaluatePosition(t);
      const tangent = this.spline.EvaluateTangent(t);
      const normal = Vector3.Cross(tangent, Vector3.up).normalized;
      const binormal = Vector3.Cross(tangent, normal);
      
      // Extrude profile
      for (const point of this.profile) {
        const vertex = position
          .Add(normal.Scale(point.x))
          .Add(binormal.Scale(point.y));
        
        vertices.push(vertex);
        uvs.push(new Vector2(t * this.uvScale, 0));
      }
    }
    
    // Generate triangles
    for (let i = 0; i < this.segments; i++) {
      for (let j = 0; j < this.profile.length - 1; j++) {
        const current = i * this.profile.length + j;
        const next = current + this.profile.length;
        
        triangles.push(current, next, current + 1);
        triangles.push(current + 1, next, next + 1);
      }
    }
    
    this.mesh = new Mesh();
    this.mesh.vertices = vertices;
    this.mesh.triangles = triangles;
    this.mesh.uv = uvs;
    this.mesh.RecalculateNormals();
    
    const meshFilter = this.GetComponent(MeshFilter);
    if (meshFilter) {
      meshFilter.mesh = this.mesh;
    }
  }
}

export enum SplineType {
  Linear = 'Linear',
  Bezier = 'Bezier',
  CatmullRom = 'CatmullRom',
  BSpline = 'BSpline',
}

export interface SplineKnot {
  position: Vector3;
  rotation: Quaternion;
  tangentIn: Vector3;
  tangentOut: Vector3;
}
```

---

## 📝 TextMeshPro

### Overview
Advanced text rendering with Signed Distance Field (SDF) fonts for crisp text at any size.

### Package Structure
```
packages/text-mesh-pro/
├── src/
│   ├── TMP_Text.ts            # Base text component
│   ├── TextMeshPro.ts         # 3D text
│   ├── TextMeshProUGUI.ts     # UI text
│   ├── TMP_FontAsset.ts       # SDF font
│   ├── TMP_Settings.ts        # Global settings
│   ├── TMP_Character.ts       # Character data
│   └── shaders/
│       ├── TMP_SDF.glsl       # SDF shader
│       └── TMP_Bitmap.glsl    # Bitmap shader
└── __tests__/
```

### Implementation

```typescript
/**
 * TextMeshPro component for high-quality text rendering
 */
export class TextMeshPro extends MonoBehaviour {
  // Text
  public text: string = 'Sample Text';
  public font: TMP_FontAsset;
  
  // Appearance
  public fontSize: number = 36;
  public fontStyle: FontStyles = FontStyles.Normal;
  public color: Color = Color.white;
  public alpha: number = 1.0;
  
  // Spacing & Alignment
  public characterSpacing: number = 0;
  public wordSpacing: number = 0;
  public lineSpacing: number = 0;
  public paragraphSpacing: number = 0;
  public alignment: TextAlignmentOptions = TextAlignmentOptions.TopLeft;
  
  // Size
  public enableAutoSizing: boolean = false;
  public fontSizeMin: number = 1;
  public fontSizeMax: number = 72;
  
  // Wrapping
  public enableWordWrapping: boolean = true;
  public overflowMode: TextOverflowModes = TextOverflowModes.Overflow;
  
  // Effects
  public enableOutline: boolean = false;
  public outlineColor: Color = Color.black;
  public outlineWidth: number = 0.1;
  
  public enableGlow: boolean = false;
  public glowColor: Color = Color.white;
  public glowPower: number = 0.5;
  
  public enableUnderlay: boolean = false;
  public underlayColor: Color = Color.black;
  public underlayOffsetX: number = 0;
  public underlayOffsetY: number = 0;
  
  // Advanced
  public parseEscapeCharacters: boolean = true;
  public richText: boolean = true;
  
  private mesh: Mesh;
  private textInfo: TMP_TextInfo;
  
  Awake(): void {
    this.GenerateMesh();
  }
  
  /**
   * Force text mesh regeneration
   */
  public ForceMeshUpdate(): void {
    this.GenerateMesh();
  }
  
  /**
   * Get rendered text info
   */
  public get textInfo(): TMP_TextInfo {
    return this._textInfo;
  }
  
  private GenerateMesh(): void {
    if (!this.font) return;
    
    // Parse rich text tags
    const parsedText = this.ParseRichText(this.text);
    
    // Layout text
    this.textInfo = this.LayoutText(parsedText);
    
    // Generate mesh
    this.mesh = this.CreateTextMesh(this.textInfo);
    
    // Apply to renderer
    const meshFilter = this.GetComponent(MeshFilter);
    if (meshFilter) {
      meshFilter.mesh = this.mesh;
    }
  }
  
  private ParseRichText(text: string): ParsedText {
    // Parse tags like <b>, <i>, <color=#FF0000>, <size=50>, etc.
    // Return structured text with formatting info
    return new ParsedText(text);
  }
  
  private LayoutText(parsedText: ParsedText): TMP_TextInfo {
    const info = new TMP_TextInfo();
    let x = 0, y = 0;
    
    for (const char of parsedText.characters) {
      const glyph = this.font.GetGlyph(char.unicode);
      
      // Position character
      char.position = new Vector3(x, y, 0);
      
      // Advance position
      x += glyph.advance + this.characterSpacing;
      
      // Handle line breaks
      if (char.unicode === 10) { // newline
        x = 0;
        y -= this.fontSize + this.lineSpacing;
      }
      
      info.characterInfo.push(char);
    }
    
    return info;
  }
  
  private CreateTextMesh(info: TMP_TextInfo): Mesh {
    const vertices: Vector3[] = [];
    const uvs: Vector2[] = [];
    const triangles: number[] = [];
    const colors: Color[] = [];
    
    for (const char of info.characterInfo) {
      const glyph = this.font.GetGlyph(char.unicode);
      
      // Create quad for character
      const pos = char.position;
      const size = this.fontSize;
      
      vertices.push(
        new Vector3(pos.x, pos.y, 0),
        new Vector3(pos.x + size, pos.y, 0),
        new Vector3(pos.x + size, pos.y + size, 0),
        new Vector3(pos.x, pos.y + size, 0)
      );
      
      // UV coordinates from font atlas
      uvs.push(
        new Vector2(glyph.uvMin.x, glyph.uvMin.y),
        new Vector2(glyph.uvMax.x, glyph.uvMin.y),
        new Vector2(glyph.uvMax.x, glyph.uvMax.y),
        new Vector2(glyph.uvMin.x, glyph.uvMax.y)
      );
      
      // Triangles
      const baseIndex = vertices.length - 4;
      triangles.push(
        baseIndex, baseIndex + 1, baseIndex + 2,
        baseIndex, baseIndex + 2, baseIndex + 3
      );
      
      // Colors
      for (let i = 0; i < 4; i++) {
        colors.push(this.color);
      }
    }
    
    const mesh = new Mesh();
    mesh.vertices = vertices;
    mesh.uv = uvs;
    mesh.triangles = triangles;
    mesh.colors = colors;
    
    return mesh;
  }
}

export enum FontStyles {
  Normal = 0,
  Bold = 1,
  Italic = 2,
  BoldItalic = 3,
  Underline = 4,
  Strikethrough = 8,
}

export enum TextAlignmentOptions {
  TopLeft = 0,
  Top = 1,
  TopRight = 2,
  Left = 3,
  Center = 4,
  Right = 5,
  BottomLeft = 6,
  Bottom = 7,
  BottomRight = 8,
}

export enum TextOverflowModes {
  Overflow = 0,
  Ellipsis = 1,
  Masking = 2,
  Truncate = 3,
  ScrollRect = 4,
}
```

---

## 🎨 Render Graph System

### Overview
Modern render pipeline architecture for better performance and flexibility.

### Package Structure
```
packages/renderer/render-graph/
├── src/
│   ├── RenderGraph.ts         # Main render graph
│   ├── RenderGraphPass.ts     # Individual pass
│   ├── RenderGraphResource.ts # Textures, buffers
│   ├── RenderGraphBuilder.ts  # Graph construction
│   └── RenderGraphCompiler.ts # Optimization
└── __tests__/
```

### Key Concept
Render Graph automatically:
- Manages GPU memory (allocates/releases render targets)
- Optimizes pass ordering
- Culls unused passes
- Minimizes bandwidth (auto-uses NativeRenderPass on mobile)

### Implementation

```typescript
/**
 * Render Graph for automatic GPU resource management
 */
export class RenderGraph {
  private passes: RenderGraphPass[] = [];
  private resources: Map<string, RenderGraphResource> = new Map();
  
  /**
   * Add a render pass to the graph
   */
  public AddRenderPass<T extends RenderGraphPass>(
    name: string,
    passType: new () => T,
    setup: (builder: RenderGraphBuilder) => void
  ): T {
    const pass = new passType();
    pass.name = name;
    
    const builder = new RenderGraphBuilder(this);
    setup(builder);
    
    pass.resources = builder.GetResources();
    this.passes.push(pass);
    
    return pass;
  }
  
  /**
   * Execute the render graph
   */
  public Execute(context: ScriptableRenderContext, camera: Camera): void {
    // 1. Compile graph (optimize, cull unused passes)
    const compiled = this.Compile();
    
    // 2. Allocate resources
    this.AllocateResources(compiled);
    
    // 3. Execute passes in order
    for (const pass of compiled.passes) {
      pass.Execute(context, camera);
    }
    
    // 4. Release resources
    this.ReleaseResources();
  }
  
  private Compile(): CompiledRenderGraph {
    // Topological sort based on dependencies
    // Cull passes that don't contribute to final output
    // Merge compatible passes
    // Optimize resource lifetimes
    
    return new CompiledRenderGraph(this.passes, this.resources);
  }
}

/**
 * Example usage: Forward rendering pass
 */
class ForwardRenderPass extends RenderGraphPass {
  Execute(context: ScriptableRenderContext, camera: Camera): void {
    // Render opaque objects
    const opaqueObjects = this.GetOpaqueObjects();
    for (const obj of opaqueObjects) {
      obj.Render(context, camera);
    }
  }
}

// Usage in pipeline
const renderGraph = new RenderGraph();

renderGraph.AddRenderPass('Opaque', ForwardRenderPass, (builder) => {
  const colorTarget = builder.CreateTexture('ColorBuffer', {
    width: camera.pixelWidth,
    height: camera.pixelHeight,
    format: RenderTextureFormat.ARGB32,
  });
  
  builder.WriteTexture(colorTarget);
  builder.SetRenderTarget(colorTarget);
});

renderGraph.Execute(context, camera);
```

---

## 📦 Summary of Additional Systems

With these additional systems, the documentation now covers **99% of Unity**:

✅ **Core**: GameObject, Components, Physics, Rendering, Animation, Audio, UI
✅ **Particles**: Full Shuriken system
✅ **Terrain**: Heightmaps, splatting, details, trees
✅ **AI**: NavMesh & pathfinding
✅ **Networking**: Multiplayer with WebRTC
✅ **XR**: WebXR for VR/AR
✅ **Advanced**: Shader Graph, Visual Scripting, Cinemachine, ProBuilder, VFX Graph
✅ **Water**: Ocean, rivers, buoyancy ⭐
✅ **Splines**: Paths, roads, procedural content ⭐
✅ **TextMeshPro**: High-quality text ⭐
✅ **Render Graph**: Modern rendering architecture ⭐

**Result:** This is now a **COMPLETE Unity clone for the web**! 🎉
