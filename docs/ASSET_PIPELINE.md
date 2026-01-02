# Web Game Engine - Asset Pipeline & Import System

> Complete guide for importing, processing, and managing all asset types in Web Game Engine

## 🎯 Overview

Web Game Engine supports all major asset formats used in game development, with optimized loaders for web platform. The asset pipeline handles:
- **3D Models** (GLTF, GLB, FBX, OBJ)
- **Textures** (PNG, JPG, WebP, KTX2, DDS, Basis)
- **Audio** (MP3, OGG, WAV, AAC)
- **Animations** (embedded in models)
- **Shaders** (GLSL, WGSL)
- **Fonts** (TTF, WOFF, WOFF2)
- **Videos** (MP4, WebM)
- **Data** (JSON, YAML, XML, CSV)

## 📂 Asset Import Workflow

### Editor-Time Import (Design Phase)

```
User drops file into Project Browser
         ↓
AssetImporter detects file type
         ↓
Appropriate Importer processes file
         ↓
Asset metadata generated (.meta file)
         ↓
Asset added to AssetDatabase
         ↓
Thumbnails/previews generated
         ↓
Asset ready for use in Editor
```

### Runtime Asset Loading (Game Running)

```
Game requests asset (by GUID or path)
         ↓
AssetBundle system checks cache
         ↓
If not cached: Download from CDN
         ↓
Decompress & deserialize asset
         ↓
Upload to GPU (if applicable)
         ↓
Return reference to game code
```

## 🎨 3D Model Import

### Supported Formats

#### glTF / GLB (RECOMMENDED) ⭐
**Best format for web games** - designed for runtime loading

**Features:**
- ✅ Open standard (Khronos Group)
- ✅ Compact binary format (GLB)
- ✅ Embedded textures & materials
- ✅ PBR materials (metallic-roughness)
- ✅ Skeletal animations
- ✅ Morph targets (blend shapes)
- ✅ Multiple LODs
- ✅ Fast parsing (JSON + binary)
- ✅ Compression (Draco, KTX2, Meshopt)
- ✅ Extensions (lights, materials, physics)

**Loader Implementation:**
```typescript
// packages/assets/src/importers/GLTFImporter.ts

import { GLTF, GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader';
import { DRACOLoader } from 'three/examples/jsm/loaders/DRACOLoader';
import { KTX2Loader } from 'three/examples/jsm/loaders/KTX2Loader';
import { MeshoptDecoder } from 'three/examples/jsm/libs/meshopt_decoder.module';

/**
 * Imports glTF/GLB files with full support for extensions.
 * 
 * Supports:
 * - KHR_draco_mesh_compression (mesh compression)
 * - KHR_texture_basisu (texture compression)
 * - KHR_mesh_quantization (attribute quantization)
 * - KHR_materials_pbrSpecularGlossiness
 * - KHR_materials_unlit
 * - KHR_materials_clearcoat
 * - KHR_materials_transmission
 * - KHR_materials_volume
 * - KHR_materials_ior
 * - KHR_materials_specular
 * - KHR_materials_sheen
 * - KHR_materials_emissive_strength
 * - KHR_materials_iridescence
 * - KHR_lights_punctual
 * - EXT_meshopt_compression
 */
export class GLTFImporter extends AssetImporter {
  private loader: GLTFLoader;
  private dracoLoader: DRACOLoader;
  private ktx2Loader: KTX2Loader;

  constructor() {
    super();
    
    // Setup GLTF loader
    this.loader = new GLTFLoader();
    
    // Setup Draco decoder (mesh compression)
    this.dracoLoader = new DRACOLoader();
    this.dracoLoader.setDecoderPath('/draco/'); // WASM decoder
    this.loader.setDRACOLoader(this.dracoLoader);
    
    // Setup KTX2 loader (texture compression)
    this.ktx2Loader = new KTX2Loader();
    this.ktx2Loader.setTranscoderPath('/basis/'); // WASM transcoder
    this.loader.setKTX2Loader(this.ktx2Loader);
    
    // Setup Meshopt decoder (mesh compression)
    this.loader.setMeshoptDecoder(MeshoptDecoder);
  }

  /**
   * Import a glTF/GLB file
   */
  public async Import(assetPath: string): Promise<ImportedAsset> {
    const startTime = performance.now();
    
    try {
      // Load GLTF
      const gltf = await this.LoadGLTF(assetPath);
      
      // Extract meshes
      const meshes = this.ExtractMeshes(gltf);
      
      // Extract materials
      const materials = this.ExtractMaterials(gltf);
      
      // Extract textures
      const textures = this.ExtractTextures(gltf);
      
      // Extract animations
      const animations = this.ExtractAnimations(gltf);
      
      // Extract skeleton (if present)
      const skeleton = this.ExtractSkeleton(gltf);
      
      // Create prefab
      const prefab = this.CreatePrefab(gltf.scene, {
        meshes,
        materials,
        textures,
        animations,
        skeleton,
      });
      
      // Generate metadata
      const metadata = {
        guid: UUID.Generate(),
        importTime: performance.now() - startTime,
        fileSize: await this.GetFileSize(assetPath),
        vertexCount: this.CountVertices(meshes),
        triangleCount: this.CountTriangles(meshes),
        textureCount: textures.length,
        materialCount: materials.length,
        animationCount: animations.length,
        hasSkeleton: skeleton !== null,
      };
      
      console.log(`Imported ${assetPath} in ${metadata.importTime.toFixed(2)}ms`);
      
      return {
        prefab,
        meshes,
        materials,
        textures,
        animations,
        skeleton,
        metadata,
      };
      
    } catch (error) {
      throw new Error(`Failed to import GLTF: ${assetPath}\n${error.message}`);
    }
  }

  /**
   * Load GLTF file with progress tracking
   */
  private async LoadGLTF(path: string): Promise<GLTF> {
    return new Promise((resolve, reject) => {
      this.loader.load(
        path,
        (gltf) => resolve(gltf),
        (progress) => {
          const percent = (progress.loaded / progress.total) * 100;
          this.OnProgress(percent);
        },
        (error) => reject(error)
      );
    });
  }

  /**
   * Extract meshes from GLTF scene
   */
  private ExtractMeshes(gltf: GLTF): Mesh[] {
    const meshes: Mesh[] = [];
    
    gltf.scene.traverse((object) => {
      if (object instanceof THREE.Mesh) {
        const mesh = this.ConvertThreeMeshToEngineMesh(object);
        meshes.push(mesh);
      }
    });
    
    return meshes;
  }

  /**
   * Extract materials with PBR properties
   */
  private ExtractMaterials(gltf: GLTF): Material[] {
    const materials: Material[] = [];
    
    gltf.scene.traverse((object) => {
      if (object instanceof THREE.Mesh && object.material) {
        const threeMaterial = object.material as THREE.MeshStandardMaterial;
        
        const material = new Material();
        material.name = threeMaterial.name;
        material.shader = Shader.Find('Standard'); // PBR shader
        
        // Albedo
        if (threeMaterial.map) {
          material.SetTexture('_MainTex', this.ConvertTexture(threeMaterial.map));
        }
        material.SetColor('_Color', threeMaterial.color);
        
        // Normal map
        if (threeMaterial.normalMap) {
          material.SetTexture('_BumpMap', this.ConvertTexture(threeMaterial.normalMap));
        }
        
        // Metallic & Smoothness
        material.SetFloat('_Metallic', threeMaterial.metalness);
        material.SetFloat('_Glossiness', threeMaterial.roughness);
        
        if (threeMaterial.metalnessMap) {
          material.SetTexture('_MetallicGlossMap', 
            this.ConvertTexture(threeMaterial.metalnessMap)
          );
        }
        
        // Emission
        if (threeMaterial.emissive) {
          material.SetColor('_EmissionColor', threeMaterial.emissive);
          material.EnableKeyword('_EMISSION');
        }
        
        if (threeMaterial.emissiveMap) {
          material.SetTexture('_EmissionMap', 
            this.ConvertTexture(threeMaterial.emissiveMap)
          );
        }
        
        // Occlusion
        if (threeMaterial.aoMap) {
          material.SetTexture('_OcclusionMap', 
            this.ConvertTexture(threeMaterial.aoMap)
          );
        }
        
        materials.push(material);
      }
    });
    
    return materials;
  }

  /**
   * Extract animations with retargeting support
   */
  private ExtractAnimations(gltf: GLTF): AnimationClip[] {
    const clips: AnimationClip[] = [];
    
    for (const threeClip of gltf.animations) {
      const clip = new AnimationClip();
      clip.name = threeClip.name;
      clip.length = threeClip.duration;
      clip.frameRate = 30; // Standard framerate
      
      // Convert Three.js tracks to Unity AnimationCurves
      for (const track of threeClip.tracks) {
        const curve = this.ConvertTrackToCurve(track);
        clip.AddCurve(curve);
      }
      
      clips.push(clip);
    }
    
    return clips;
  }
}
```

#### FBX Format
**Industry standard but complex**

**Features:**
- ✅ Widely supported by DCC tools (Blender, Maya, 3DS Max)
- ✅ Skeletal animations
- ✅ Embedded media
- ⚠️ Proprietary format (Autodesk)
- ⚠️ Large file sizes
- ⚠️ Requires complex parser
- ⚠️ Not optimized for web

**Implementation:**
```typescript
// Use FBX2GLTF converter on server-side
// Convert FBX → GLTF during asset upload
// Store GLTF in AssetDatabase
// This avoids shipping FBX parser to clients
```

#### OBJ Format
**Simple but limited**

**Features:**
- ✅ Simple text format
- ✅ Wide support
- ❌ No animations
- ❌ No materials (separate .mtl file)
- ❌ No skeletal data
- ❌ Large file sizes (text)

**Use case:** Static props, architecture

#### USD Format (Future)
**Pixar's Universal Scene Description**
- Advanced feature for future versions
- Used by Apple (RealityKit), Pixar, Nvidia

### Model Import Settings

```typescript
interface ModelImportSettings {
  // Mesh
  meshCompression: 'none' | 'low' | 'medium' | 'high';
  readWriteEnabled: boolean; // Keep mesh data in CPU memory
  optimizeMesh: boolean; // Reorder vertices for cache efficiency
  generateColliders: boolean;
  generateLightmapUVs: boolean;
  
  // Normals & Tangents
  importNormals: 'calculate' | 'import' | 'none';
  importTangents: 'calculate' | 'import' | 'none';
  smoothingAngle: number; // Degrees
  
  // Animation
  importAnimation: boolean;
  animationCompression: 'off' | 'keyframe_reduction' | 'optimal';
  
  // Materials
  materialImportMode: 'import' | 'none';
  materialLocation: 'external' | 'embedded';
  
  // Scale
  scaleFactor: number;
  useFileScale: boolean;
  
  // Rig
  animationType: 'none' | 'legacy' | 'generic' | 'humanoid';
  avatarDefinition: 'create_from_model' | 'copy_from_other';
  
  // Optimization
  indexFormat: 'auto' | 'uint16' | 'uint32';
  keepQuads: boolean;
  weldVertices: boolean;
}
```

## 🖼️ Texture Import

### Supported Formats

| Format | Use Case | Notes |
|--------|----------|-------|
| **PNG** | UI, transparency | Lossless, large files |
| **JPG** | Diffuse maps | Lossy, small files, no alpha |
| **WebP** | All types | Modern, small files, alpha support |
| **KTX2/Basis** | All types (compressed) | GPU texture compression, smallest files |
| **DDS** | Pre-compressed | DirectX format, requires transcoding |

### Texture Compression

**Why compress textures?**
- Reduce download size (50-90% smaller)
- Reduce GPU memory usage
- Faster texture uploads to GPU
- Better performance (cache efficiency)

**Compression Formats:**

```typescript
enum TextureFormat {
  // Uncompressed
  RGB24,      // 24 bits per pixel
  RGBA32,     // 32 bits per pixel
  RGB565,     // 16 bits per pixel (mobile)
  RGBA4444,   // 16 bits per pixel (mobile, alpha)
  
  // Compressed (Desktop)
  DXT1,       // RGB, 4 bits per pixel (BC1)
  DXT5,       // RGBA, 8 bits per pixel (BC3)
  BC7,        // RGBA, 8 bits per pixel (best quality)
  
  // Compressed (Mobile)
  ETC2_RGB,   // RGB, 4 bits per pixel (Android)
  ETC2_RGBA,  // RGBA, 8 bits per pixel (Android)
  ASTC_4x4,   // RGBA, 8 bits per pixel (iOS/Android, best quality)
  ASTC_8x8,   // RGBA, 2 bits per pixel (iOS/Android, best compression)
  PVRTC_RGB4, // RGB, 4 bits per pixel (iOS, older)
  
  // Universal (Basis Universal / KTX2)
  BasisU_ETC1S,  // Universal, 1-2 bits per pixel
  BasisU_UASTC,  // Universal, 8 bits per pixel (better quality)
}
```

**Basis Universal (RECOMMENDED for Web):**
```typescript
// Transcodes to optimal format at runtime
// Input: .ktx2 file with Basis compressed data
// Output: ETC1 (Android), BC7 (Desktop), ASTC (iOS)

class TextureImporter {
  async ImportKTX2(path: string): Promise<Texture> {
    const ktx2Loader = new KTX2Loader();
    ktx2Loader.setTranscoderPath('/basis/');
    
    // Automatically transcodes to best format for device
    const texture = await ktx2Loader.loadAsync(path);
    
    return this.ConvertThreeTextureToEngineTexture(texture);
  }
}
```

### Texture Import Settings

```typescript
interface TextureImportSettings {
  // Type
  textureType: 'default' | 'normal_map' | 'lightmap' | 'sprite' | 'cursor' | 'cubemap';
  
  // Shape
  textureShape: '2d' | 'cube' | '3d';
  
  // Size
  maxSize: 32 | 64 | 128 | 256 | 512 | 1024 | 2048 | 4096 | 8192;
  resizeAlgorithm: 'bilinear' | 'bicubic' | 'mitchell';
  
  // Format
  format: TextureFormat;
  compression: 'none' | 'low_quality' | 'normal_quality' | 'high_quality';
  
  // Mipmaps
  generateMipMaps: boolean;
  mipmapFilter: 'box' | 'kaiser';
  
  // Wrap mode
  wrapMode: 'repeat' | 'clamp' | 'mirror' | 'mirror_once';
  
  // Filter mode
  filterMode: 'point' | 'bilinear' | 'trilinear';
  anisoLevel: number; // 0-16
  
  // Advanced
  sRGB: boolean; // Gamma correction
  alphaIsTransparency: boolean;
  readWriteEnabled: boolean;
  streamingMipmaps: boolean; // Load mipmaps on demand
}
```

### Texture Streaming

Load high-resolution mips only when needed:

```typescript
class TextureStreamingSystem {
  private textureMemoryBudget: number = 512 * 1024 * 1024; // 512 MB
  private loadedTextures: Map<string, Texture> = new Map();
  
  /**
   * Update texture mip levels based on distance to camera
   */
  Update(camera: Camera): void {
    for (const [guid, texture] of this.loadedTextures) {
      const distance = this.CalculateDistanceToCamera(texture, camera);
      const requiredMipLevel = this.CalculateRequiredMipLevel(distance);
      
      if (texture.currentMipLevel > requiredMipLevel) {
        // Load higher resolution mips
        this.LoadHigherMips(texture, requiredMipLevel);
      } else if (texture.currentMipLevel < requiredMipLevel) {
        // Unload high resolution mips to save memory
        this.UnloadHigherMips(texture, requiredMipLevel);
      }
    }
  }
}
```

## 🎵 Audio Import

### Supported Formats

| Format | Use Case | Browser Support | Notes |
|--------|----------|-----------------|-------|
| **MP3** | Music, long sounds | All browsers | Lossy, good compression |
| **OGG Vorbis** | All audio | All modern browsers | Lossy, better quality than MP3 |
| **WAV** | Short SFX | All browsers | Uncompressed, large files |
| **AAC** | Music | All browsers | Lossy, used by Apple |
| **WebM Opus** | All audio | Chrome, Firefox | Best compression, low latency |

### Audio Import Settings

```typescript
interface AudioImportSettings {
  // Loading
  loadType: 'decompress_on_load' | 'compressed_in_memory' | 'streaming';
  
  // Compression
  compressionFormat: 'vorbis' | 'mp3' | 'aac' | 'pcm';
  quality: number; // 0.0 - 1.0
  sampleRate: 8000 | 11025 | 22050 | 44100 | 48000;
  
  // 3D Audio
  forceToMono: boolean; // Required for 3D spatial audio
  
  // Advanced
  preloadAudioData: boolean;
  loadInBackground: boolean;
}
```

### Audio Streaming

```typescript
class AudioStreamingSystem {
  /**
   * Stream large audio files (music) chunk by chunk
   */
  async StreamAudio(audioClip: AudioClip): Promise<AudioSource> {
    const response = await fetch(audioClip.url);
    const reader = response.body!.getReader();
    
    // Create MediaSource for streaming
    const mediaSource = new MediaSource();
    const audio = new Audio();
    audio.src = URL.createObjectURL(mediaSource);
    
    mediaSource.addEventListener('sourceopen', async () => {
      const sourceBuffer = mediaSource.addSourceBuffer('audio/mpeg');
      
      // Stream chunks
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        
        sourceBuffer.appendBuffer(value);
        await this.WaitForBufferUpdate(sourceBuffer);
      }
      
      mediaSource.endOfStream();
    });
    
    return this.WrapInAudioSource(audio);
  }
}
```

## 📦 Asset Bundles & Addressables

### Asset Bundle System

Group related assets for efficient loading:

```typescript
// Define asset bundle
class AssetBundle {
  name: string;
  assets: Asset[];
  dependencies: AssetBundle[];
  compressed: boolean;
  compressionType: 'lz4' | 'gzip' | 'brotli';
}

// Build asset bundle
class AssetBundleBuilder {
  async BuildBundle(assets: Asset[]): Promise<AssetBundle> {
    // 1. Collect dependencies
    const allAssets = this.CollectDependencies(assets);
    
    // 2. Serialize assets to binary
    const serialized = this.SerializeAssets(allAssets);
    
    // 3. Compress bundle
    const compressed = await this.Compress(serialized, 'brotli');
    
    // 4. Generate manifest
    const manifest = this.GenerateManifest(allAssets);
    
    return { compressed, manifest };
  }
}

// Load asset bundle at runtime
const bundle = await AssetBundle.LoadFromFileAsync('assets/level1.bundle');
const prefab = await bundle.LoadAssetAsync<GameObject>('Player');
const instance = GameObject.Instantiate(prefab);
```

### Addressables System

Reference assets by string key instead of path:

```typescript
// Define addressable assets
const addressableConfig = {
  'Characters/Player': 'assets/characters/player.prefab',
  'Levels/Level1': 'assets/levels/level1.scene',
  'Audio/Music/MainTheme': 'assets/audio/main_theme.ogg',
};

// Load by key (async, lazy)
const player = await Addressables.LoadAssetAsync<GameObject>('Characters/Player');

// Preload multiple assets
await Addressables.PreloadAssetsAsync([
  'Levels/Level1',
  'Characters/Player',
  'Characters/Enemy',
]);

// Unload when not needed
Addressables.Release('Characters/Player');
```

## 🚀 Optimization Strategies

### 1. Texture Atlasing

Combine multiple small textures into one large texture:

```typescript
class TextureAtlas {
  /**
   * Pack multiple textures into atlas
   * Reduces draw calls dramatically
   */
  static Pack(textures: Texture[]): TextureAtlas {
    // Use bin packing algorithm (MaxRects, Skyline)
    const atlas = new Texture(2048, 2048);
    const uvMappings: Map<Texture, Rect> = new Map();
    
    for (const texture of textures) {
      const rect = this.FindSpace(atlas, texture.width, texture.height);
      this.BlitTexture(texture, atlas, rect);
      uvMappings.set(texture, this.NormalizeRect(rect, atlas.width, atlas.height));
    }
    
    return { atlas, uvMappings };
  }
}
```

### 2. Mesh Combining

Merge static meshes to reduce draw calls:

```typescript
class MeshCombiner {
  /**
   * Combine multiple meshes with same material into one
   */
  static Combine(meshes: MeshFilter[]): Mesh {
    const combined = new Mesh();
    const combineInstances: CombineInstance[] = [];
    
    for (const mesh of meshes) {
      combineInstances.push({
        mesh: mesh.sharedMesh,
        transform: mesh.transform.localToWorldMatrix,
      });
    }
    
    combined.CombineMeshes(combineInstances, true, true);
    return combined;
  }
}
```

### 3. LOD (Level of Detail)

Use simpler meshes at distance:

```typescript
class LODGroup extends Component {
  public lods: LOD[] = [
    { screenRelativeHeight: 0.6, renderers: [highPolyMesh] },
    { screenRelativeHeight: 0.3, renderers: [mediumPolyMesh] },
    { screenRelativeHeight: 0.1, renderers: [lowPolyMesh] },
  ];
  
  Update(): void {
    const distance = Vector3.Distance(
      this.transform.position,
      Camera.main.transform.position
    );
    
    const screenHeight = this.CalculateScreenHeight(distance);
    const lod = this.SelectLOD(screenHeight);
    
    // Enable only selected LOD renderers
    for (let i = 0; i < this.lods.length; i++) {
      const isActive = i === lod;
      for (const renderer of this.lods[i].renderers) {
        renderer.enabled = isActive;
      }
    }
  }
}
```

### 4. Async Asset Loading

Never block main thread:

```typescript
class AssetLoader {
  private loadQueue: Promise<Asset>[] = [];
  private maxConcurrent = 6; // Browser limit
  
  /**
   * Load multiple assets without blocking
   */
  async LoadAssetsAsync(paths: string[]): Promise<Asset[]> {
    const chunks = this.Chunk(paths, this.maxConcurrent);
    const results: Asset[] = [];
    
    for (const chunk of chunks) {
      const promises = chunk.map(path => this.LoadAssetAsync(path));
      const loaded = await Promise.all(promises);
      results.push(...loaded);
      
      // Give browser time to breathe
      await this.NextFrame();
    }
    
    return results;
  }
  
  private async NextFrame(): Promise<void> {
    return new Promise(resolve => requestAnimationFrame(() => resolve()));
  }
}
```

## 📊 Asset Database

Central registry of all assets in project:

```typescript
class AssetDatabase {
  private static assets: Map<string, Asset> = new Map();
  private static guidToPath: Map<string, string> = new Map();
  
  /**
   * Load asset by GUID (safe, won't break on file moves)
   */
  static LoadAssetAtGUID<T extends Asset>(guid: string): T | null {
    const path = this.guidToPath.get(guid);
    if (!path) return null;
    
    return this.LoadAssetAtPath<T>(path);
  }
  
  /**
   * Load asset by path
   */
  static LoadAssetAtPath<T extends Asset>(path: string): T | null {
    return this.assets.get(path) as T || null;
  }
  
  /**
   * Find all assets of type
   */
  static FindAssets<T extends Asset>(type: new () => T): T[] {
    const results: T[] = [];
    for (const [, asset] of this.assets) {
      if (asset instanceof type) {
        results.push(asset);
      }
    }
    return results;
  }
  
  /**
   * Get asset dependencies
   */
  static GetDependencies(asset: Asset): Asset[] {
    const deps: Asset[] = [];
    const visited = new Set<string>();
    
    this.CollectDependenciesRecursive(asset, deps, visited);
    return deps;
  }
}
```

## 🎓 Best Practices

### DO ✅
- Use glTF/GLB for 3D models (best for web)
- Use Basis Universal (KTX2) for textures (universal compression)
- Use OGG Vorbis or Opus for audio (best compression)
- Compress meshes with Draco
- Generate mipmaps for all textures
- Use texture atlases for UI and small sprites
- Enable texture streaming for large textures
- Use asset bundles for level-based loading
- Lazy-load assets (don't load everything at start)
- Preload critical assets during loading screen

### DON'T ❌
- Don't use uncompressed textures in production
- Don't load all assets at once (causes long load times)
- Don't use synchronous loading (blocks main thread)
- Don't forget to unload unused assets (memory leaks)
- Don't use large textures where small ones work (2048x2048 vs 512x512)
- Don't use FBX in production (convert to glTF)
- Don't ship uncompressed audio (use OGG/Opus)
- Don't keep mesh read/write enabled unless needed (doubles memory)

---

## 📚 Additional Resources

- [glTF 2.0 Specification](https://www.khronos.org/gltf/)
- [Basis Universal Texture Compression](https://github.com/BinomialLLC/basis_universal)
- [Draco 3D Compression](https://google.github.io/draco/)
- [Web Audio API](https://developer.mozilla.org/en-US/docs/Web/API/Web_Audio_API)
- [Three.js Loaders](https://threejs.org/docs/#manual/en/introduction/Loading-3D-models)
