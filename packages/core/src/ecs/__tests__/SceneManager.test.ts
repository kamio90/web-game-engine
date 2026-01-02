import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { SceneManager, LoadSceneMode } from '../SceneManager';
import { Scene } from '../Scene';
import { GameObject } from '../GameObject';
import { Object as UnityObject } from '../Object';

describe('SceneManager', () => {
  afterEach(() => {
    SceneManager._clearAll();
    (UnityObject as any)._clearAllObjects();
    (GameObject as any)._clearAllGameObjects();
  });

  describe('LoadScene (synchronous)', () => {
    it('should load scene by name', () => {
      const scene = SceneManager.LoadScene('TestScene');
      expect(scene).toBeInstanceOf(Scene);
      expect(scene.name).toBe('TestScene');
    });

    it('should load scene by build index', () => {
      SceneManager.RegisterScene('Level1', 'scenes/level1.scene', 0);
      const scene = SceneManager.LoadScene(0);
      expect(scene).toBeInstanceOf(Scene);
      expect(scene.name).toBe('Level1');
      expect(scene.buildIndex).toBe(0);
    });

    it('should mark scene as loaded', () => {
      const scene = SceneManager.LoadScene('TestScene');
      expect(scene.isLoaded).toBe(true);
    });

    it('should add scene to loaded scenes list', () => {
      SceneManager.LoadScene('TestScene');
      expect(SceneManager.sceneCount).toBe(1);
    });

    it('should set scene as active if first scene', () => {
      const scene = SceneManager.LoadScene('TestScene');
      expect(SceneManager.GetActiveScene()).toBe(scene);
    });

    it('should unload existing scene in Single mode', () => {
      const scene1 = SceneManager.LoadScene('Scene1');
      const scene2 = SceneManager.LoadScene('Scene2', LoadSceneMode.Single);

      expect(scene1.isLoaded).toBe(false);
      expect(scene2.isLoaded).toBe(true);
      expect(SceneManager.sceneCount).toBe(1);
    });

    it('should keep existing scenes in Additive mode', () => {
      const scene1 = SceneManager.LoadScene('Scene1');
      const scene2 = SceneManager.LoadScene('Scene2', LoadSceneMode.Additive);

      expect(scene1.isLoaded).toBe(true);
      expect(scene2.isLoaded).toBe(true);
      expect(SceneManager.sceneCount).toBe(2);
    });

    it('should set new scene as active in Single mode', () => {
      SceneManager.LoadScene('Scene1');
      const scene2 = SceneManager.LoadScene('Scene2', LoadSceneMode.Single);
      expect(SceneManager.GetActiveScene()).toBe(scene2);
    });

    it('should keep first scene active in Additive mode', () => {
      const scene1 = SceneManager.LoadScene('Scene1');
      SceneManager.LoadScene('Scene2', LoadSceneMode.Additive);
      expect(SceneManager.GetActiveScene()).toBe(scene1);
    });
  });

  describe('LoadSceneAsync', () => {
    it('should load scene asynchronously', async () => {
      const scene = await SceneManager.LoadSceneAsync('TestScene');
      expect(scene).toBeInstanceOf(Scene);
      expect(scene.name).toBe('TestScene');
    });

    it('should return a promise', () => {
      const result = SceneManager.LoadSceneAsync('TestScene');
      expect(result).toBeInstanceOf(Promise);
    });

    it('should load scene by build index', async () => {
      SceneManager.RegisterScene('Level1', 'scenes/level1.scene', 0);
      const scene = await SceneManager.LoadSceneAsync(0);
      expect(scene.name).toBe('Level1');
      expect(scene.buildIndex).toBe(0);
    });

    it('should unload existing scene in Single mode', async () => {
      const scene1 = await SceneManager.LoadSceneAsync('Scene1');
      const scene2 = await SceneManager.LoadSceneAsync('Scene2', LoadSceneMode.Single);

      expect(scene1.isLoaded).toBe(false);
      expect(scene2.isLoaded).toBe(true);
    });

    it('should keep existing scenes in Additive mode', async () => {
      const scene1 = await SceneManager.LoadSceneAsync('Scene1');
      const scene2 = await SceneManager.LoadSceneAsync('Scene2', LoadSceneMode.Additive);

      expect(scene1.isLoaded).toBe(true);
      expect(scene2.isLoaded).toBe(true);
      expect(SceneManager.sceneCount).toBe(2);
    });
  });

  describe('UnloadSceneAsync', () => {
    it('should unload scene by instance', async () => {
      const scene = SceneManager.LoadScene('TestScene');
      await SceneManager.UnloadSceneAsync(scene);
      expect(scene.isLoaded).toBe(false);
      expect(SceneManager.sceneCount).toBe(0);
    });

    it('should unload scene by name', async () => {
      const scene = SceneManager.LoadScene('TestScene');
      await SceneManager.UnloadSceneAsync('TestScene');
      expect(scene.isLoaded).toBe(false);
    });

    it('should unload scene by build index', async () => {
      SceneManager.RegisterScene('Level1', 'scenes/level1.scene', 0);
      const scene = SceneManager.LoadScene(0);
      await SceneManager.UnloadSceneAsync(0);
      expect(scene.isLoaded).toBe(false);
    });

    it('should throw error if scene not found', async () => {
      await expect(SceneManager.UnloadSceneAsync('Nonexistent')).rejects.toThrow(
        'Scene not found'
      );
    });

    it('should throw error if scene is not loaded', async () => {
      const scene = SceneManager.LoadScene('TestScene');
      SceneManager.LoadScene('Scene2', LoadSceneMode.Additive);
      await SceneManager.UnloadSceneAsync(scene);
      await expect(SceneManager.UnloadSceneAsync(scene)).rejects.toThrow(
        'Scene is not loaded'
      );
    });

    it('should set new active scene if unloading active scene', async () => {
      const scene1 = SceneManager.LoadScene('Scene1');
      const scene2 = SceneManager.LoadScene('Scene2', LoadSceneMode.Additive);

      expect(SceneManager.GetActiveScene()).toBe(scene1);
      await SceneManager.UnloadSceneAsync(scene1);
      expect(SceneManager.GetActiveScene()).toBe(scene2);
    });

    it('should not change active scene if unloading non-active scene', async () => {
      const scene1 = SceneManager.LoadScene('Scene1');
      const scene2 = SceneManager.LoadScene('Scene2', LoadSceneMode.Additive);

      await SceneManager.UnloadSceneAsync(scene2);
      expect(SceneManager.GetActiveScene()).toBe(scene1);
    });

    it('should remove scene from loaded scenes list', async () => {
      SceneManager.LoadScene('Scene1');
      SceneManager.LoadScene('Scene2', LoadSceneMode.Additive);
      expect(SceneManager.sceneCount).toBe(2);

      await SceneManager.UnloadSceneAsync('Scene2');
      expect(SceneManager.sceneCount).toBe(1);
    });
  });

  describe('GetActiveScene', () => {
    it('should return null when no scene is loaded', () => {
      expect(SceneManager.GetActiveScene()).toBeNull();
    });

    it('should return the active scene', () => {
      const scene = SceneManager.LoadScene('TestScene');
      expect(SceneManager.GetActiveScene()).toBe(scene);
    });

    it('should return the most recently loaded scene in Single mode', () => {
      SceneManager.LoadScene('Scene1');
      const scene2 = SceneManager.LoadScene('Scene2', LoadSceneMode.Single);
      expect(SceneManager.GetActiveScene()).toBe(scene2);
    });
  });

  describe('SetActiveScene', () => {
    it('should set the active scene', () => {
      const scene1 = SceneManager.LoadScene('Scene1');
      const scene2 = SceneManager.LoadScene('Scene2', LoadSceneMode.Additive);

      const result = SceneManager.SetActiveScene(scene2);
      expect(result).toBe(true);
      expect(SceneManager.GetActiveScene()).toBe(scene2);
    });

    it('should return false if scene is not loaded', () => {
      const scene = new Scene('UnloadedScene');
      const result = SceneManager.SetActiveScene(scene);
      expect(result).toBe(false);
    });

    it('should not change active scene if operation fails', () => {
      const scene1 = SceneManager.LoadScene('Scene1');
      const scene2 = new Scene('UnloadedScene');

      SceneManager.SetActiveScene(scene2);
      expect(SceneManager.GetActiveScene()).toBe(scene1);
    });
  });

  describe('GetSceneByName', () => {
    it('should return scene by name', () => {
      const scene = SceneManager.LoadScene('TestScene');
      const found = SceneManager.GetSceneByName('TestScene');
      expect(found).toBe(scene);
    });

    it('should return null if scene not found', () => {
      const found = SceneManager.GetSceneByName('Nonexistent');
      expect(found).toBeNull();
    });

    it('should find scene among multiple loaded scenes', () => {
      SceneManager.LoadScene('Scene1');
      const scene2 = SceneManager.LoadScene('Scene2', LoadSceneMode.Additive);
      const found = SceneManager.GetSceneByName('Scene2');
      expect(found).toBe(scene2);
    });
  });

  describe('GetSceneByBuildIndex', () => {
    it('should return scene by build index', () => {
      SceneManager.RegisterScene('Level1', 'scenes/level1.scene', 0);
      const scene = SceneManager.LoadScene(0);
      const found = SceneManager.GetSceneByBuildIndex(0);
      expect(found).toBe(scene);
    });

    it('should return null if scene not found', () => {
      const found = SceneManager.GetSceneByBuildIndex(999);
      expect(found).toBeNull();
    });

    it('should find scene among multiple loaded scenes', () => {
      SceneManager.RegisterScene('Level1', 'scenes/level1.scene', 0);
      SceneManager.RegisterScene('Level2', 'scenes/level2.scene', 1);
      SceneManager.LoadScene(0);
      const scene2 = SceneManager.LoadScene(1, LoadSceneMode.Additive);
      const found = SceneManager.GetSceneByBuildIndex(1);
      expect(found).toBe(scene2);
    });
  });

  describe('GetSceneAt', () => {
    it('should return scene at index', () => {
      const scene = SceneManager.LoadScene('TestScene');
      const found = SceneManager.GetSceneAt(0);
      expect(found).toBe(scene);
    });

    it('should return correct scene for each index', () => {
      const scene1 = SceneManager.LoadScene('Scene1');
      const scene2 = SceneManager.LoadScene('Scene2', LoadSceneMode.Additive);

      expect(SceneManager.GetSceneAt(0)).toBe(scene1);
      expect(SceneManager.GetSceneAt(1)).toBe(scene2);
    });

    it('should throw error for negative index', () => {
      SceneManager.LoadScene('TestScene');
      expect(() => SceneManager.GetSceneAt(-1)).toThrow('Scene index out of range');
    });

    it('should throw error for index >= sceneCount', () => {
      SceneManager.LoadScene('TestScene');
      expect(() => SceneManager.GetSceneAt(1)).toThrow('Scene index out of range');
    });
  });

  describe('sceneCount', () => {
    it('should return 0 when no scenes loaded', () => {
      expect(SceneManager.sceneCount).toBe(0);
    });

    it('should return correct count', () => {
      SceneManager.LoadScene('Scene1');
      expect(SceneManager.sceneCount).toBe(1);

      SceneManager.LoadScene('Scene2', LoadSceneMode.Additive);
      expect(SceneManager.sceneCount).toBe(2);
    });

    it('should update when scenes are unloaded', async () => {
      SceneManager.LoadScene('Scene1');
      SceneManager.LoadScene('Scene2', LoadSceneMode.Additive);
      expect(SceneManager.sceneCount).toBe(2);

      await SceneManager.UnloadSceneAsync('Scene2');
      expect(SceneManager.sceneCount).toBe(1);
    });
  });

  describe('sceneCountInBuildSettings', () => {
    it('should return 0 when no scenes registered', () => {
      expect(SceneManager.sceneCountInBuildSettings).toBe(0);
    });

    it('should return correct count after registration', () => {
      SceneManager.RegisterScene('Level1', 'scenes/level1.scene', 0);
      expect(SceneManager.sceneCountInBuildSettings).toBe(1);

      SceneManager.RegisterScene('Level2', 'scenes/level2.scene', 1);
      expect(SceneManager.sceneCountInBuildSettings).toBe(2);
    });
  });

  describe('RegisterScene', () => {
    it('should register scene in build settings', () => {
      SceneManager.RegisterScene('Level1', 'scenes/level1.scene', 0);
      expect(SceneManager.sceneCountInBuildSettings).toBe(1);
    });

    it('should allow loading registered scene by build index', () => {
      SceneManager.RegisterScene('Level1', 'scenes/level1.scene', 0);
      const scene = SceneManager.LoadScene(0);
      expect(scene.name).toBe('Level1');
      expect(scene.path).toBe('scenes/level1.scene');
      expect(scene.buildIndex).toBe(0);
    });
  });

  describe('scene loaded callbacks', () => {
    it('should invoke callback when scene is loaded', () => {
      let callbackInvoked = false;
      let loadedScene: Scene | null = null;
      let loadMode: LoadSceneMode | null = null;

      SceneManager.AddSceneLoadedCallback((scene, mode) => {
        callbackInvoked = true;
        loadedScene = scene;
        loadMode = mode;
      });

      const scene = SceneManager.LoadScene('TestScene');
      expect(callbackInvoked).toBe(true);
      expect(loadedScene).toBe(scene);
      expect(loadMode).toBe(LoadSceneMode.Single);
    });

    it('should invoke callback with correct mode', () => {
      let loadMode: LoadSceneMode | null = null;

      SceneManager.AddSceneLoadedCallback((scene, mode) => {
        loadMode = mode;
      });

      SceneManager.LoadScene('Scene1');
      SceneManager.LoadScene('Scene2', LoadSceneMode.Additive);
      expect(loadMode).toBe(LoadSceneMode.Additive);
    });

    it('should invoke multiple callbacks', () => {
      let callback1Invoked = false;
      let callback2Invoked = false;

      SceneManager.AddSceneLoadedCallback(() => {
        callback1Invoked = true;
      });
      SceneManager.AddSceneLoadedCallback(() => {
        callback2Invoked = true;
      });

      SceneManager.LoadScene('TestScene');
      expect(callback1Invoked).toBe(true);
      expect(callback2Invoked).toBe(true);
    });

    it('should allow removing callback', () => {
      let callbackInvoked = false;
      const callback = () => {
        callbackInvoked = true;
      };

      SceneManager.AddSceneLoadedCallback(callback);
      SceneManager.RemoveSceneLoadedCallback(callback);

      SceneManager.LoadScene('TestScene');
      expect(callbackInvoked).toBe(false);
    });
  });

  describe('scene unloaded callbacks', () => {
    it('should invoke callback when scene is unloaded', async () => {
      let callbackInvoked = false;
      let unloadedScene: Scene | null = null;

      SceneManager.AddSceneUnloadedCallback((scene) => {
        callbackInvoked = true;
        unloadedScene = scene;
      });

      const scene = SceneManager.LoadScene('Scene1');
      SceneManager.LoadScene('Scene2', LoadSceneMode.Additive);

      await SceneManager.UnloadSceneAsync(scene);
      expect(callbackInvoked).toBe(true);
      expect(unloadedScene).toBe(scene);
    });

    it('should invoke multiple callbacks', async () => {
      let callback1Invoked = false;
      let callback2Invoked = false;

      SceneManager.AddSceneUnloadedCallback(() => {
        callback1Invoked = true;
      });
      SceneManager.AddSceneUnloadedCallback(() => {
        callback2Invoked = true;
      });

      const scene = SceneManager.LoadScene('Scene1');
      SceneManager.LoadScene('Scene2', LoadSceneMode.Additive);

      await SceneManager.UnloadSceneAsync(scene);
      expect(callback1Invoked).toBe(true);
      expect(callback2Invoked).toBe(true);
    });

    it('should allow removing callback', async () => {
      let callbackInvoked = false;
      const callback = () => {
        callbackInvoked = true;
      };

      SceneManager.AddSceneUnloadedCallback(callback);
      SceneManager.RemoveSceneUnloadedCallback(callback);

      const scene = SceneManager.LoadScene('Scene1');
      SceneManager.LoadScene('Scene2', LoadSceneMode.Additive);

      await SceneManager.UnloadSceneAsync(scene);
      expect(callbackInvoked).toBe(false);
    });
  });

  describe('integration with Scene', () => {
    it('should manage scene loaded state', () => {
      const scene = SceneManager.LoadScene('TestScene');
      expect(scene.isLoaded).toBe(true);
    });

    it('should set scene properties correctly', () => {
      SceneManager.RegisterScene('Level1', 'scenes/level1.scene', 0);
      const scene = SceneManager.LoadScene(0);

      expect(scene.name).toBe('Level1');
      expect(scene.path).toBe('scenes/level1.scene');
      expect(scene.buildIndex).toBe(0);
      expect(scene.isLoaded).toBe(true);
    });
  });

  describe('edge cases', () => {
    it('should handle loading same scene multiple times in Additive mode', () => {
      const scene1 = SceneManager.LoadScene('TestScene');
      const scene2 = SceneManager.LoadScene('TestScene', LoadSceneMode.Additive);

      expect(scene1).not.toBe(scene2);
      expect(SceneManager.sceneCount).toBe(2);
    });

    it('should handle empty scene name', () => {
      const scene = SceneManager.LoadScene('');
      expect(scene.name).toBe('');
    });

    it('should handle unregistered build index', () => {
      const scene = SceneManager.LoadScene(999);
      expect(scene.name).toBe('Scene999');
      expect(scene.buildIndex).toBe(999);
    });
  });
});
