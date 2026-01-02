import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Time } from '../Time';

describe('Time', () => {
  beforeEach(() => {
    // Reset Time before each test
    Time._reset();
  });

  describe('Initialization', () => {
    it('should initialize with default values', () => {
      Time._initialize();

      expect(Time.time).toBe(0);
      expect(Time.unscaledTime).toBe(0);
      expect(Time.deltaTime).toBe(0);
      expect(Time.unscaledDeltaTime).toBe(0);
      expect(Time.frameCount).toBe(0);
      expect(Time.timeScale).toBe(1.0);
      expect(Time.fixedDeltaTime).toBe(0.02);
      expect(Time.maximumDeltaTime).toBeCloseTo(0.333333);
    });

    it('should reset time values', () => {
      Time._initialize();
      Time._update();
      Time._update();

      expect(Time.frameCount).toBeGreaterThan(0);

      Time._reset();

      expect(Time.frameCount).toBe(0);
      expect(Time.time).toBe(0);
    });
  });

  describe('Frame Updates', () => {
    it('should increment frame count on update', () => {
      Time._initialize();

      expect(Time.frameCount).toBe(0);

      Time._update();
      expect(Time.frameCount).toBe(1);

      Time._update();
      expect(Time.frameCount).toBe(2);

      Time._update();
      expect(Time.frameCount).toBe(3);
    });

    it('should update deltaTime', () => {
      Time._initialize();
      const startTime = (Time as any)._lastFrameTime;

      // Mock performance.now to simulate 16ms frame (60 FPS)
      vi.spyOn(performance, 'now').mockReturnValue(startTime + 16);

      Time._update();

      expect(Time.deltaTime).toBeCloseTo(0.016, 3);
      expect(Time.unscaledDeltaTime).toBeCloseTo(0.016, 3);
    });

    it('should accumulate time', () => {
      Time._initialize();
      const startTime = (Time as any)._lastFrameTime;

      // Simulate 3 frames at 60 FPS (16ms each)
      vi.spyOn(performance, 'now')
        .mockReturnValueOnce(startTime + 16)
        .mockReturnValueOnce(startTime + 32)
        .mockReturnValueOnce(startTime + 48);

      Time._update();
      expect(Time.time).toBeCloseTo(0.016, 3);

      Time._update();
      expect(Time.time).toBeCloseTo(0.032, 3);

      Time._update();
      expect(Time.time).toBeCloseTo(0.048, 3);
    });

    it('should update realtimeSinceStartup', () => {
      Time._initialize();
      const startTime = (Time as any)._startTime;

      vi.spyOn(performance, 'now').mockReturnValue(startTime + 1000);

      Time._update();

      expect(Time.realtimeSinceStartup).toBeCloseTo(1.0, 2);
    });
  });

  describe('Time Scale', () => {
    it('should affect deltaTime but not unscaledDeltaTime', () => {
      Time._initialize();
      Time.timeScale = 0.5; // Half speed

      const startTime = (Time as any)._lastFrameTime;
      vi.spyOn(performance, 'now').mockReturnValue(startTime + 16);

      Time._update();

      expect(Time.deltaTime).toBeCloseTo(0.008, 3); // 0.016 * 0.5
      expect(Time.unscaledDeltaTime).toBeCloseTo(0.016, 3);
    });

    it('should affect time but not unscaledTime', () => {
      Time._initialize();
      Time.timeScale = 2.0; // Double speed

      const startTime = (Time as any)._lastFrameTime;
      vi.spyOn(performance, 'now').mockReturnValue(startTime + 16);

      Time._update();

      expect(Time.time).toBeCloseTo(0.032, 3); // 0.016 * 2.0
      expect(Time.unscaledTime).toBeCloseTo(0.016, 3);
    });

    it('should clamp negative timeScale to 0', () => {
      Time.timeScale = -1.0;
      expect(Time.timeScale).toBe(0);
    });

    it('should allow timeScale of 0 (pause)', () => {
      Time._initialize();
      Time.timeScale = 0;

      const startTime = (Time as any)._lastFrameTime;
      vi.spyOn(performance, 'now').mockReturnValue(startTime + 16);

      Time._update();

      expect(Time.deltaTime).toBe(0);
      expect(Time.time).toBe(0);
      expect(Time.unscaledDeltaTime).toBeCloseTo(0.016, 3);
      expect(Time.unscaledTime).toBeCloseTo(0.016, 3);
    });
  });

  describe('Fixed Delta Time', () => {
    it('should have default fixed delta time of 0.02', () => {
      expect(Time.fixedDeltaTime).toBe(0.02);
    });

    it('should allow setting fixed delta time', () => {
      Time.fixedDeltaTime = 0.01;
      expect(Time.fixedDeltaTime).toBe(0.01);
    });

    it('should clamp negative fixed delta time to 0.001', () => {
      Time.fixedDeltaTime = -1.0;
      expect(Time.fixedDeltaTime).toBe(0.001);
    });

    it('should clamp zero fixed delta time to 0.001', () => {
      Time.fixedDeltaTime = 0;
      expect(Time.fixedDeltaTime).toBe(0.001);
    });
  });

  describe('Fixed Update Timing', () => {
    it('should indicate when fixed update should occur', () => {
      Time._initialize();
      Time.fixedDeltaTime = 0.02;

      const startTime = (Time as any)._lastFrameTime;

      // First frame: 16ms (0.016s) - not enough for fixed update (needs 0.02s)
      vi.spyOn(performance, 'now').mockReturnValue(startTime + 16);
      Time._update();
      expect(Time._shouldFixedUpdate()).toBe(false);

      // Second frame: another 16ms (total 0.032s) - now we should fixed update
      vi.spyOn(performance, 'now').mockReturnValue(startTime + 32);
      Time._update();
      expect(Time._shouldFixedUpdate()).toBe(true);
    });

    it('should consume fixed timestep', () => {
      Time._initialize();
      Time.fixedDeltaTime = 0.02;

      const startTime = (Time as any)._lastFrameTime;

      // Accumulate enough time for fixed update
      vi.spyOn(performance, 'now').mockReturnValue(startTime + 32);
      Time._update();

      expect(Time._shouldFixedUpdate()).toBe(true);

      const fixedTimeBefore = Time.fixedUnscaledTime;
      Time._consumeFixedUpdate();

      expect(Time.fixedUnscaledTime).toBeCloseTo(fixedTimeBefore + 0.02);
      expect(Time.fixedUnscaledDeltaTime).toBe(0.02);
    });

    it('should allow multiple fixed updates in one frame', () => {
      Time._initialize();
      Time.fixedDeltaTime = 0.02;

      const startTime = (Time as any)._lastFrameTime;

      // Simulate 100ms frame (should trigger 5 fixed updates)
      vi.spyOn(performance, 'now').mockReturnValue(startTime + 100);
      Time._update();

      let fixedUpdateCount = 0;
      while (Time._shouldFixedUpdate()) {
        Time._consumeFixedUpdate();
        fixedUpdateCount++;
      }

      expect(fixedUpdateCount).toBe(5); // 100ms / 20ms = 5
    });
  });

  describe('Maximum Delta Time', () => {
    it('should have default maximum delta time', () => {
      expect(Time.maximumDeltaTime).toBeCloseTo(0.333333);
    });

    it('should clamp deltaTime to maximumDeltaTime', () => {
      Time._initialize();
      Time.maximumDeltaTime = 0.1; // 100ms max

      const startTime = (Time as any)._lastFrameTime;

      // Simulate 500ms frame (very slow)
      vi.spyOn(performance, 'now').mockReturnValue(startTime + 500);
      Time._update();

      expect(Time.unscaledDeltaTime).toBe(0.1); // Clamped to max
      expect(Time.unscaledDeltaTime).toBeLessThan(0.5);
    });

    it('should clamp negative maximumDeltaTime to 0.001', () => {
      Time.maximumDeltaTime = -1.0;
      expect(Time.maximumDeltaTime).toBe(0.001);
    });

    it('should clamp zero maximumDeltaTime to 0.001', () => {
      Time.maximumDeltaTime = 0;
      expect(Time.maximumDeltaTime).toBe(0.001);
    });
  });

  describe('Smooth Delta Time', () => {
    it('should calculate smooth delta time as average', () => {
      Time._initialize();
      const startTime = (Time as any)._lastFrameTime;

      // Simulate varying frame times
      const frameTimes = [16, 32, 16, 16, 32]; // Alternating fast/slow frames

      frameTimes.forEach((frameTime, index) => {
        vi.spyOn(performance, 'now').mockReturnValue(
          startTime + frameTimes.slice(0, index + 1).reduce((a, b) => a + b, 0)
        );
        Time._update();
      });

      // Average should smooth out the variation
      const avgDelta = frameTimes.reduce((a, b) => a + b, 0) / frameTimes.length / 1000;
      expect(Time.smoothDeltaTime).toBeCloseTo(avgDelta, 3);
    });

    it('should limit samples to maximum count', () => {
      Time._initialize();
      const startTime = (Time as any)._lastFrameTime;

      // Simulate many frames (more than MAX_DELTA_SAMPLES)
      for (let i = 1; i <= 20; i++) {
        vi.spyOn(performance, 'now').mockReturnValue(startTime + i * 16);
        Time._update();
      }

      // Smooth delta should only consider last 10 samples
      expect((Time as any)._deltaTimeSamples.length).toBe(10);
    });
  });

  describe('Performance Time', () => {
    it('should use performance.now when available', () => {
      const mockNow = vi.spyOn(performance, 'now').mockReturnValue(12345.678);

      Time._initialize();

      expect(mockNow).toHaveBeenCalled();
    });

    it('should fallback to Date.now when performance is unavailable', () => {
      const originalPerformance = global.performance;

      // Temporarily remove performance
      (global as any).performance = undefined;

      const mockDateNow = vi.spyOn(Date, 'now').mockReturnValue(12345678);

      Time._initialize();

      expect(mockDateNow).toHaveBeenCalled();

      // Restore
      global.performance = originalPerformance;
    });
  });

  describe('Edge Cases', () => {
    it('should handle very small delta times', () => {
      Time._initialize();
      const startTime = (Time as any)._lastFrameTime;

      // Simulate 1ms frame (1000 FPS)
      vi.spyOn(performance, 'now').mockReturnValue(startTime + 1);
      Time._update();

      expect(Time.deltaTime).toBeCloseTo(0.001, 4);
    });

    it('should handle very large delta times', () => {
      Time._initialize();
      Time.maximumDeltaTime = 1.0;

      const startTime = (Time as any)._lastFrameTime;

      // Simulate 5 second frame (computer froze)
      vi.spyOn(performance, 'now').mockReturnValue(startTime + 5000);
      Time._update();

      expect(Time.unscaledDeltaTime).toBe(1.0); // Clamped to max
    });

    it('should handle multiple time scale changes', () => {
      Time._initialize();
      const startTime = (Time as any)._lastFrameTime;

      Time.timeScale = 0.5;
      vi.spyOn(performance, 'now').mockReturnValue(startTime + 16);
      Time._update();
      const time1 = Time.time;

      Time.timeScale = 2.0;
      vi.spyOn(performance, 'now').mockReturnValue(startTime + 32);
      Time._update();
      const time2 = Time.time;

      expect(time1).toBeCloseTo(0.008, 3); // 0.016 * 0.5
      expect(time2).toBeCloseTo(0.040, 3); // 0.008 + (0.016 * 2.0)
    });
  });
});
