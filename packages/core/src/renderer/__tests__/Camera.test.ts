import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { Camera, CameraClearFlags } from '../Camera';
import { GameObject } from '../../ecs/GameObject';
import { Object } from '../../ecs/Object';
import { Vector3 } from '../../math/Vector3';
import { Color } from '../../math/Color';
import { Rect } from '../../math/Rect';

describe('Camera', () => {
  let cameraObj: GameObject;
  let camera: Camera;

  beforeEach(() => {
    // Reset all cameras before each test
    Camera._resetAll();

    // Create a camera GameObject
    cameraObj = new GameObject('TestCamera');
    camera = cameraObj.AddComponent(Camera) as Camera;
  });

  afterEach(() => {
    // Clean up
    if (cameraObj) {
      Object.DestroyImmediate(cameraObj);
    }
    Camera._resetAll();
  });

  describe('Constructor and Defaults', () => {
    it('should create with default values', () => {
      expect(camera.fieldOfView).toBe(60);
      expect(camera.nearClipPlane).toBe(0.3);
      expect(camera.farClipPlane).toBe(1000);
      expect(camera.orthographic).toBe(false);
      expect(camera.orthographicSize).toBe(5);
      expect(camera.aspect).toBe(1);
    });

    it('should have default rendering properties', () => {
      expect(camera.depth).toBe(-1);
      expect(camera.clearFlags).toBe(CameraClearFlags.Skybox);
      expect(camera.cullingMask).toBe(0xFFFFFFFF);
    });

    it('should have default background color', () => {
      const bg = camera.backgroundColor;
      expect(bg.r).toBeCloseTo(0.19);
      expect(bg.g).toBeCloseTo(0.3);
      expect(bg.b).toBeCloseTo(0.47);
    });

    it('should have default viewport rect', () => {
      const rect = camera.rect;
      expect(rect.x).toBe(0);
      expect(rect.y).toBe(0);
      expect(rect.width).toBe(1);
      expect(rect.height).toBe(1);
    });

    it('should have rendering path', () => {
      expect(camera.renderingPath).toBe('Forward');
    });

    it('should have stereo eye', () => {
      expect(camera.stereoActiveEye).toBe('Mono');
    });
  });

  describe('Projection Properties', () => {
    it('should set field of view', () => {
      camera.fieldOfView = 90;
      expect(camera.fieldOfView).toBe(90);
    });

    it('should set near clip plane', () => {
      camera.nearClipPlane = 0.1;
      expect(camera.nearClipPlane).toBe(0.1);
    });

    it('should set far clip plane', () => {
      camera.farClipPlane = 2000;
      expect(camera.farClipPlane).toBe(2000);
    });

    it('should set orthographic mode', () => {
      camera.orthographic = true;
      expect(camera.orthographic).toBe(true);
    });

    it('should set orthographic size', () => {
      camera.orthographicSize = 10;
      expect(camera.orthographicSize).toBe(10);
    });

    it('should set aspect ratio', () => {
      camera.aspect = 16 / 9;
      expect(camera.aspect).toBeCloseTo(16 / 9);
    });
  });

  describe('Rendering Properties', () => {
    it('should set depth', () => {
      camera.depth = 10;
      expect(camera.depth).toBe(10);
    });

    it('should set clear flags', () => {
      camera.clearFlags = CameraClearFlags.SolidColor;
      expect(camera.clearFlags).toBe(CameraClearFlags.SolidColor);
    });

    it('should set background color', () => {
      camera.backgroundColor = Color.red;
      expect(camera.backgroundColor.equals(Color.red)).toBe(true);
    });

    it('should set culling mask', () => {
      camera.cullingMask = 0xFF;
      expect(camera.cullingMask).toBe(0xFF);
    });

    it('should set viewport rect', () => {
      const rect = new Rect(0.1, 0.1, 0.8, 0.8);
      camera.rect = rect;
      expect(camera.rect.equals(rect)).toBe(true);
    });
  });

  describe('Projection Mode Switching', () => {
    it('should switch from perspective to orthographic', () => {
      expect(camera.orthographic).toBe(false);
      camera.orthographic = true;
      expect(camera.orthographic).toBe(true);
    });

    it('should switch from orthographic to perspective', () => {
      camera.orthographic = true;
      expect(camera.orthographic).toBe(true);
      camera.orthographic = false;
      expect(camera.orthographic).toBe(false);
    });

    it('should preserve position when switching modes', () => {
      cameraObj.transform.position = new Vector3(10, 20, 30);
      camera.orthographic = true;
      // Position should be preserved (handled internally by Three.js camera)
      expect(camera.threeCamera.position.x).toBe(10);
      expect(camera.threeCamera.position.y).toBe(20);
      expect(camera.threeCamera.position.z).toBe(30);
    });
  });

  describe('Three.js Integration', () => {
    it('should have a Three.js camera', () => {
      expect(camera.threeCamera).toBeDefined();
    });

    it('should create PerspectiveCamera by default', () => {
      expect(camera.threeCamera.type).toBe('PerspectiveCamera');
    });

    it('should create OrthographicCamera when orthographic', () => {
      camera.orthographic = true;
      expect(camera.threeCamera.type).toBe('OrthographicCamera');
    });

    it('should update Three.js camera FOV', () => {
      camera.fieldOfView = 90;
      const threeCamera = camera.threeCamera;
      if ('fov' in threeCamera) {
        expect(threeCamera.fov).toBe(90);
      }
    });

    it('should update Three.js camera near/far planes', () => {
      camera.nearClipPlane = 1;
      camera.farClipPlane = 500;
      const threeCamera = camera.threeCamera;
      expect(threeCamera.near).toBe(1);
      expect(threeCamera.far).toBe(500);
    });
  });

  describe('World/Screen Conversion', () => {
    beforeEach(() => {
      // Position camera at origin looking down +Z
      cameraObj.transform.position = Vector3.zero;
      cameraObj.transform.rotation.eulerAngles = Vector3.zero;
    });

    it('should convert world to screen point', () => {
      const worldPoint = new Vector3(0, 0, 10);
      const screenPoint = camera.WorldToScreenPoint(worldPoint);
      expect(screenPoint).toBeDefined();
      expect(typeof screenPoint.x).toBe('number');
      expect(typeof screenPoint.y).toBe('number');
      expect(typeof screenPoint.z).toBe('number');
    });

    it('should convert screen to world point', () => {
      const screenPoint = new Vector3(960, 540, 10);
      const worldPoint = camera.ScreenToWorldPoint(screenPoint);
      expect(worldPoint).toBeDefined();
      expect(typeof worldPoint.x).toBe('number');
      expect(typeof worldPoint.y).toBe('number');
      expect(typeof worldPoint.z).toBe('number');
    });

    it('should have round-trip consistency for world/screen', () => {
      const originalWorld = new Vector3(1, 2, 10);
      const screen = camera.WorldToScreenPoint(originalWorld);
      const backToWorld = camera.ScreenToWorldPoint(screen);

      // Should be approximately the same (with floating point tolerance)
      expect(backToWorld.x).toBeCloseTo(originalWorld.x, 1);
      expect(backToWorld.y).toBeCloseTo(originalWorld.y, 1);
      expect(backToWorld.z).toBeCloseTo(originalWorld.z, 1);
    });
  });

  describe('Viewport Conversion', () => {
    it('should convert viewport to world point', () => {
      const viewportPoint = new Vector3(0.5, 0.5, 10);
      const worldPoint = camera.ViewportToWorldPoint(viewportPoint);
      expect(worldPoint).toBeDefined();
    });

    it('should convert world to viewport point', () => {
      const worldPoint = new Vector3(0, 0, 10);
      const viewportPoint = camera.WorldToViewportPoint(worldPoint);
      expect(viewportPoint).toBeDefined();
      // Center of screen should be around (0.5, 0.5)
      expect(viewportPoint.x).toBeGreaterThan(0);
      expect(viewportPoint.x).toBeLessThan(1);
    });

    it('should convert screen to viewport point', () => {
      const screenPoint = new Vector3(960, 540, 0);
      const viewportPoint = camera.ScreenToViewportPoint(screenPoint);
      expect(viewportPoint.x).toBeCloseTo(0.5, 1);
      expect(viewportPoint.y).toBeCloseTo(0.5, 1);
    });

    it('should convert viewport to screen point', () => {
      const viewportPoint = new Vector3(0.5, 0.5, 0);
      const screenPoint = camera.ViewportToScreenPoint(viewportPoint);
      expect(screenPoint.x).toBeCloseTo(960, 0);
      expect(screenPoint.y).toBeCloseTo(540, 0);
    });
  });

  describe('Ray Casting', () => {
    it('should create ray from screen point', () => {
      const screenPoint = new Vector3(960, 540, 0);
      const ray = camera.ScreenPointToRay(screenPoint);
      expect(ray).toBeDefined();
      expect(ray.origin).toBeDefined();
      expect(ray.direction).toBeDefined();
    });

    it('should create ray from viewport point', () => {
      const viewportPoint = new Vector3(0.5, 0.5, 0);
      const ray = camera.ViewportPointToRay(viewportPoint);
      expect(ray).toBeDefined();
      expect(ray.origin).toBeDefined();
      expect(ray.direction).toBeDefined();
    });

    it('should have normalized ray direction', () => {
      const viewportPoint = new Vector3(0.5, 0.5, 0);
      const ray = camera.ViewportPointToRay(viewportPoint);
      const magnitude = ray.direction.magnitude;
      expect(magnitude).toBeCloseTo(1, 5);
    });

    it('should create ray from camera position', () => {
      cameraObj.transform.position = new Vector3(5, 10, 15);
      const ray = camera.ViewportPointToRay(new Vector3(0.5, 0.5, 0));
      expect(ray.origin.equals(cameraObj.transform.position)).toBe(true);
    });
  });

  describe('Static Camera Management', () => {
    it('should track enabled cameras', () => {
      const cameras = Camera.GetAllCameras();
      expect(cameras.length).toBe(1);
      expect(cameras[0]).toBe(camera);
    });

    it('should add camera when created', () => {
      const camera2Obj = new GameObject('Camera2');
      const camera2 = camera2Obj.AddComponent(Camera) as Camera;

      const cameras = Camera.GetAllCameras();
      expect(cameras.length).toBe(2);
      expect(cameras).toContain(camera);
      expect(cameras).toContain(camera2);

      Object.DestroyImmediate(camera2Obj);
    });

    it('should remove camera when destroyed', () => {
      Object.DestroyImmediate(cameraObj);

      const cameras = Camera.GetAllCameras();
      expect(cameras.length).toBe(0);
    });
  });

  describe('Main Camera', () => {
    it('should not set main camera by default', () => {
      expect(Camera.main).toBeNull();
    });

    it('should set main camera when tagged MainCamera', () => {
      const mainCameraObj = new GameObject('MainCamera');
      mainCameraObj.tag = 'MainCamera'; // Set tag before adding Camera
      const mainCamera = mainCameraObj.AddComponent(Camera) as Camera;

      expect(Camera.main).toBe(mainCamera);

      Object.DestroyImmediate(mainCameraObj);
    });

    it('should clear main camera when destroyed', () => {
      const mainCameraObj = new GameObject('MainCamera');
      mainCameraObj.tag = 'MainCamera'; // Set tag before adding Camera
      const mainCamera = mainCameraObj.AddComponent(Camera) as Camera;

      expect(Camera.main).toBe(mainCamera);

      Object.DestroyImmediate(mainCameraObj);

      expect(Camera.main).toBeNull();
    });
  });

  describe('Component Lifecycle', () => {
    it('should be added to all cameras on enable', () => {
      expect(Camera.GetAllCameras()).toContain(camera);
    });

    it('should be removed from all cameras on disable', () => {
      Object.DestroyImmediate(cameraObj);
      expect(Camera.GetAllCameras()).not.toContain(camera);
    });
  });

  describe('Clear Flags Enum', () => {
    it('should have Skybox flag', () => {
      expect(CameraClearFlags.Skybox).toBe(1);
    });

    it('should have SolidColor flag', () => {
      expect(CameraClearFlags.SolidColor).toBe(2);
    });

    it('should have Depth flag', () => {
      expect(CameraClearFlags.Depth).toBe(3);
    });

    it('should have Nothing flag', () => {
      expect(CameraClearFlags.Nothing).toBe(4);
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero field of view', () => {
      camera.fieldOfView = 0;
      expect(camera.fieldOfView).toBe(0);
    });

    it('should handle very large field of view', () => {
      camera.fieldOfView = 179;
      expect(camera.fieldOfView).toBe(179);
    });

    it('should handle near plane equal to far plane', () => {
      camera.nearClipPlane = 10;
      camera.farClipPlane = 10;
      expect(camera.nearClipPlane).toBe(10);
      expect(camera.farClipPlane).toBe(10);
    });

    it('should handle negative depth', () => {
      camera.depth = -100;
      expect(camera.depth).toBe(-100);
    });

    it('should handle zero culling mask', () => {
      camera.cullingMask = 0;
      expect(camera.cullingMask).toBe(0);
    });
  });
});
