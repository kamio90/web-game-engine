import { Scene } from './Scene';
import { Object as UnityObject } from './Object';

/**
 * Scene loading mode.
 */
export enum LoadSceneMode {
  /** Closes all currently loaded scenes and loads a scene */
  Single = 0,
  /** Adds the scene to the currently loaded scenes */
  Additive = 1,
}

/**
 * Scene management for runtime and editor.
 *
 * Use the SceneManager to load and unload scenes at runtime.
 * Scenes can be loaded by name or build index.
 *
 * @example
 * ```typescript
 * // Load scene by name (replaces current scene)
 * await SceneManager.LoadSceneAsync("MainMenu");
 *
 * // Load scene additively
 * await SceneManager.LoadSceneAsync("UI", LoadSceneMode.Additive);
 *
 * // Unload scene
 * await SceneManager.UnloadSceneAsync("UI");
 *
 * // Get active scene
 * const scene = SceneManager.GetActiveScene();
 * console.log(scene.name);
 * ```
 */
export class SceneManager {
  private static _loadedScenes: Scene[] = [];
  private static _activeScene: Scene | null = null;
  private static _sceneRegistry: Map<string, string> = new Map();
  private static _buildIndexToName: Map<number, string> = new Map();

  // Event callbacks
  private static _onSceneLoaded: Array<(scene: Scene, mode: LoadSceneMode) => void> = [];
  private static _onSceneUnloaded: Array<(scene: Scene) => void> = [];

  // ==================== Properties ====================

  /**
   * The number of scenes currently loaded.
   */
  public static get sceneCount(): number {
    return this._loadedScenes.length;
  }

  /**
   * The total number of scenes in build settings.
   */
  public static get sceneCountInBuildSettings(): number {
    return this._buildIndexToName.size;
  }

  // ==================== Loading ====================

  /**
   * Loads a scene by name or build index.
   * This is the synchronous version that completes immediately.
   * @param sceneNameOrIndex - Scene name or build index
   * @param mode - Load scene mode (Single or Additive)
   * @returns The loaded scene
   */
  public static LoadScene(
    sceneNameOrIndex: string | number,
    mode: LoadSceneMode = LoadSceneMode.Single
  ): Scene {
    const sceneName =
      typeof sceneNameOrIndex === 'number'
        ? this._buildIndexToName.get(sceneNameOrIndex) || `Scene${sceneNameOrIndex}`
        : sceneNameOrIndex;

    const buildIndex = typeof sceneNameOrIndex === 'number' ? sceneNameOrIndex : -1;

    return this._loadSceneInternal(sceneName, mode, buildIndex);
  }

  /**
   * Loads a scene asynchronously by name or build index.
   * @param sceneNameOrIndex - Scene name or build index
   * @param mode - Load scene mode (Single or Additive)
   * @returns Promise that resolves to the loaded scene
   */
  public static async LoadSceneAsync(
    sceneNameOrIndex: string | number,
    mode: LoadSceneMode = LoadSceneMode.Single
  ): Promise<Scene> {
    // Simulate async loading with a small delay
    await new Promise((resolve) => setTimeout(resolve, 0));

    const sceneName =
      typeof sceneNameOrIndex === 'number'
        ? this._buildIndexToName.get(sceneNameOrIndex) || `Scene${sceneNameOrIndex}`
        : sceneNameOrIndex;

    const buildIndex = typeof sceneNameOrIndex === 'number' ? sceneNameOrIndex : -1;

    return this._loadSceneInternal(sceneName, mode, buildIndex);
  }

  /**
   * Unloads a scene asynchronously.
   * @param sceneOrNameOrIndex - Scene instance, name, or build index
   * @returns Promise that resolves when unloading is complete
   */
  public static async UnloadSceneAsync(
    sceneOrNameOrIndex: Scene | string | number
  ): Promise<void> {
    let scene: Scene | null = null;

    if (sceneOrNameOrIndex instanceof Scene) {
      scene = sceneOrNameOrIndex;
    } else if (typeof sceneOrNameOrIndex === 'string') {
      scene = this.GetSceneByName(sceneOrNameOrIndex);
    } else {
      scene = this.GetSceneByBuildIndex(sceneOrNameOrIndex);
    }

    if (scene === null) {
      throw new Error('Scene not found');
    }

    if (!scene.isLoaded) {
      throw new Error('Scene is not loaded');
    }

    // Simulate async unloading
    await new Promise((resolve) => setTimeout(resolve, 0));

    this._unloadSceneInternal(scene);
  }

  // ==================== Queries ====================

  /**
   * Gets the active scene.
   * @returns The active scene, or null if no scene is loaded
   */
  public static GetActiveScene(): Scene | null {
    return this._activeScene;
  }

  /**
   * Sets the active scene.
   * @param scene - The scene to set as active
   * @returns True if successful, false otherwise
   */
  public static SetActiveScene(scene: Scene): boolean {
    if (!this._loadedScenes.includes(scene)) {
      return false;
    }

    this._activeScene = scene;
    return true;
  }

  /**
   * Gets a scene by name.
   * @param name - Name of the scene
   * @returns The scene if found, null otherwise
   */
  public static GetSceneByName(name: string): Scene | null {
    return this._loadedScenes.find((s) => s.name === name) || null;
  }

  /**
   * Gets a scene by build index.
   * @param buildIndex - Build index of the scene
   * @returns The scene if found, null otherwise
   */
  public static GetSceneByBuildIndex(buildIndex: number): Scene | null {
    return this._loadedScenes.find((s) => s.buildIndex === buildIndex) || null;
  }

  /**
   * Gets a scene at a specific index in the loaded scenes list.
   * @param index - Index of the scene
   * @returns The scene at the specified index
   */
  public static GetSceneAt(index: number): Scene {
    if (index < 0 || index >= this._loadedScenes.length) {
      throw new Error(`Scene index out of range: ${index}`);
    }
    return this._loadedScenes[index];
  }

  // ==================== Events ====================

  /**
   * Adds a callback to be invoked when a scene is loaded.
   * @param callback - Callback function
   */
  public static AddSceneLoadedCallback(
    callback: (scene: Scene, mode: LoadSceneMode) => void
  ): void {
    this._onSceneLoaded.push(callback);
  }

  /**
   * Removes a scene loaded callback.
   * @param callback - Callback function to remove
   */
  public static RemoveSceneLoadedCallback(
    callback: (scene: Scene, mode: LoadSceneMode) => void
  ): void {
    const index = this._onSceneLoaded.indexOf(callback);
    if (index !== -1) {
      this._onSceneLoaded.splice(index, 1);
    }
  }

  /**
   * Adds a callback to be invoked when a scene is unloaded.
   * @param callback - Callback function
   */
  public static AddSceneUnloadedCallback(callback: (scene: Scene) => void): void {
    this._onSceneUnloaded.push(callback);
  }

  /**
   * Removes a scene unloaded callback.
   * @param callback - Callback function to remove
   */
  public static RemoveSceneUnloadedCallback(callback: (scene: Scene) => void): void {
    const index = this._onSceneUnloaded.indexOf(callback);
    if (index !== -1) {
      this._onSceneUnloaded.splice(index, 1);
    }
  }

  // ==================== Build Settings ====================

  /**
   * Registers a scene in build settings.
   * @param name - Name of the scene
   * @param path - Path to the scene file
   * @param buildIndex - Build index
   */
  public static RegisterScene(name: string, path: string, buildIndex: number): void {
    this._sceneRegistry.set(name, path);
    this._buildIndexToName.set(buildIndex, name);
  }

  // ==================== Internal Methods ====================

  /**
   * Internal method to load a scene.
   * @param name - Scene name
   * @param mode - Load mode
   * @param buildIndex - Build index
   * @returns The loaded scene
   * @internal
   */
  private static _loadSceneInternal(
    name: string,
    mode: LoadSceneMode,
    buildIndex: number
  ): Scene {
    // If Single mode, unload all existing scenes
    if (mode === LoadSceneMode.Single) {
      const scenesToUnload = [...this._loadedScenes];
      for (const scene of scenesToUnload) {
        this._unloadSceneInternal(scene);
      }
    }

    // Create new scene
    const path = this._sceneRegistry.get(name) || '';
    const scene = new Scene(name, path, buildIndex);
    scene._setLoaded(true);

    // Add to loaded scenes
    this._loadedScenes.push(scene);

    // Set as active if this is the only scene or if Single mode
    if (this._activeScene === null || mode === LoadSceneMode.Single) {
      this._activeScene = scene;
    }

    // Invoke callbacks
    for (const callback of this._onSceneLoaded) {
      callback(scene, mode);
    }

    return scene;
  }

  /**
   * Internal method to unload a scene.
   * @param scene - Scene to unload
   * @internal
   */
  private static _unloadSceneInternal(scene: Scene): void {
    // Remove from loaded scenes
    const index = this._loadedScenes.indexOf(scene);
    if (index !== -1) {
      this._loadedScenes.splice(index, 1);
    }

    // Destroy all GameObjects in the scene
    const rootObjects = scene.GetRootGameObjects();
    for (const go of rootObjects) {
      UnityObject.Destroy(go);
    }
    scene._clearRootGameObjects();

    // Mark as unloaded
    scene._setLoaded(false);

    // If this was the active scene, set a new one
    if (this._activeScene === scene && this._loadedScenes.length > 0) {
      this._activeScene = this._loadedScenes[0];
    } else if (this._loadedScenes.length === 0) {
      this._activeScene = null;
    }

    // Invoke callbacks
    for (const callback of this._onSceneUnloaded) {
      callback(scene);
    }
  }

  /**
   * Creates an empty scene (for testing).
   * @param name - Scene name
   * @returns The created scene
   * @internal
   */
  public static _createEmptyScene(name: string): Scene {
    const scene = new Scene(name);
    scene._setLoaded(true);
    this._loadedScenes.push(scene);

    if (this._activeScene === null) {
      this._activeScene = scene;
    }

    return scene;
  }

  /**
   * Clears all scenes and resets state.
   * Warning: Only use this for testing purposes.
   * @internal
   */
  public static _clearAll(): void {
    this._loadedScenes = [];
    this._activeScene = null;
    this._onSceneLoaded = [];
    this._onSceneUnloaded = [];
    this._sceneRegistry.clear();
    this._buildIndexToName.clear();
  }
}
