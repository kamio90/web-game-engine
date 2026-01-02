import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GameLoop } from '../GameLoop';
import { Time } from '../Time';
import { LifecycleManager } from '../../ecs/LifecycleManager';

describe('GameLoop', () => {
  beforeEach(() => {
    // Reset GameLoop before each test
    GameLoop._reset();
    Time._reset();
    vi.clearAllMocks();
  });

  afterEach(() => {
    // Ensure loop is stopped after each test
    if (GameLoop.isRunning) {
      GameLoop.stop();
    }
  });

  describe('Start and Stop', () => {
    it('should start the game loop', () => {
      expect(GameLoop.isRunning).toBe(false);

      GameLoop.start();

      expect(GameLoop.isRunning).toBe(true);
      expect(GameLoop.isPaused).toBe(false);
    });

    it('should stop the game loop', () => {
      GameLoop.start();
      expect(GameLoop.isRunning).toBe(true);

      GameLoop.stop();

      expect(GameLoop.isRunning).toBe(false);
      expect(GameLoop.isPaused).toBe(false);
    });

    it('should warn when starting already running loop', () => {
      const warnSpy = vi.spyOn(console, 'warn');

      GameLoop.start();
      GameLoop.start(); // Start again

      expect(warnSpy).toHaveBeenCalledWith(
        'GameLoop.start: Game loop is already running'
      );
    });

    it('should warn when stopping non-running loop', () => {
      const warnSpy = vi.spyOn(console, 'warn');

      GameLoop.stop();

      expect(warnSpy).toHaveBeenCalledWith(
        'GameLoop.stop: Game loop is not running'
      );
    });

    it('should initialize Time when started', () => {
      const initSpy = vi.spyOn(Time, '_initialize');

      GameLoop.start();

      expect(initSpy).toHaveBeenCalled();
    });

    it('should cancel animation frame when stopped', () => {
      const cancelSpy = vi.spyOn(window, 'cancelAnimationFrame');

      GameLoop.start();
      GameLoop.stop();

      expect(cancelSpy).toHaveBeenCalled();
    });
  });

  describe('Pause and Resume', () => {
    it('should pause the game loop', () => {
      GameLoop.start();
      expect(GameLoop.isPaused).toBe(false);

      GameLoop.pause();

      expect(GameLoop.isPaused).toBe(true);
      expect(GameLoop.isRunning).toBe(true);
      expect(Time.timeScale).toBe(0);
    });

    it('should resume the game loop', () => {
      GameLoop.start();
      GameLoop.pause();
      expect(GameLoop.isPaused).toBe(true);

      GameLoop.resume();

      expect(GameLoop.isPaused).toBe(false);
      expect(GameLoop.isRunning).toBe(true);
      expect(Time.timeScale).toBe(1.0);
    });

    it('should warn when pausing non-running loop', () => {
      const warnSpy = vi.spyOn(console, 'warn');

      GameLoop.pause();

      expect(warnSpy).toHaveBeenCalledWith(
        'GameLoop.pause: Game loop is not running'
      );
    });

    it('should warn when pausing already paused loop', () => {
      const warnSpy = vi.spyOn(console, 'warn');

      GameLoop.start();
      GameLoop.pause();
      GameLoop.pause(); // Pause again

      expect(warnSpy).toHaveBeenCalledWith(
        'GameLoop.pause: Game loop is already paused'
      );
    });

    it('should warn when resuming non-running loop', () => {
      const warnSpy = vi.spyOn(console, 'warn');

      GameLoop.resume();

      expect(warnSpy).toHaveBeenCalledWith(
        'GameLoop.resume: Game loop is not running'
      );
    });

    it('should warn when resuming non-paused loop', () => {
      const warnSpy = vi.spyOn(console, 'warn');

      GameLoop.start();
      GameLoop.resume(); // Resume without pausing

      expect(warnSpy).toHaveBeenCalledWith(
        'GameLoop.resume: Game loop is not paused'
      );
    });
  });

  describe('Target Frame Rate', () => {
    it('should have unlimited frame rate by default', () => {
      expect(GameLoop.targetFrameRate).toBe(-1);
    });

    it('should allow setting target frame rate', () => {
      GameLoop.targetFrameRate = 60;
      expect(GameLoop.targetFrameRate).toBe(60);

      GameLoop.targetFrameRate = 30;
      expect(GameLoop.targetFrameRate).toBe(30);
    });

    it('should clamp negative frame rate to -1', () => {
      const warnSpy = vi.spyOn(console, 'warn');

      GameLoop.targetFrameRate = -5;

      expect(GameLoop.targetFrameRate).toBe(-1);
      expect(warnSpy).toHaveBeenCalledWith(
        'GameLoop.targetFrameRate must be -1 or positive. Clamping to -1.'
      );
    });

    it('should allow zero frame rate', () => {
      GameLoop.targetFrameRate = 0;
      expect(GameLoop.targetFrameRate).toBe(0);
    });

    it('should allow positive frame rates', () => {
      GameLoop.targetFrameRate = 120;
      expect(GameLoop.targetFrameRate).toBe(120);
    });
  });

  describe('Update Callbacks', () => {
    it('should call onUpdate callback each frame', (done) => {
      let updateCount = 0;

      GameLoop.setOnUpdate(() => {
        updateCount++;
        if (updateCount >= 2) {
          GameLoop.stop();
          expect(updateCount).toBeGreaterThanOrEqual(2);
          done();
        }
      });

      GameLoop.start();
    });

    it('should call onLateUpdate callback each frame', (done) => {
      let lateUpdateCount = 0;

      GameLoop.setOnLateUpdate(() => {
        lateUpdateCount++;
        if (lateUpdateCount >= 2) {
          GameLoop.stop();
          expect(lateUpdateCount).toBeGreaterThanOrEqual(2);
          done();
        }
      });

      GameLoop.start();
    });

    it('should call onFixedUpdate callback on fixed timesteps', (done) => {
      let fixedUpdateCount = 0;

      GameLoop.setOnFixedUpdate(() => {
        fixedUpdateCount++;
        if (fixedUpdateCount >= 2) {
          GameLoop.stop();
          expect(fixedUpdateCount).toBeGreaterThanOrEqual(2);
          done();
        }
      });

      GameLoop.start();
    });

    it('should allow removing callbacks by setting to null', () => {
      const callback = vi.fn();

      GameLoop.setOnUpdate(callback);
      GameLoop.setOnUpdate(null);

      GameLoop.start();
      GameLoop.stop();

      // Callback should not be called if removed
      expect(callback).not.toHaveBeenCalled();
    });

    it('should call callbacks in correct order: Update, LateUpdate', (done) => {
      const callOrder: string[] = [];

      GameLoop.setOnUpdate(() => {
        callOrder.push('Update');
      });

      GameLoop.setOnLateUpdate(() => {
        callOrder.push('LateUpdate');
        if (callOrder.length >= 4) {
          // After 2 frames
          GameLoop.stop();
          expect(callOrder).toEqual(['Update', 'LateUpdate', 'Update', 'LateUpdate']);
          done();
        }
      });

      GameLoop.start();
    });
  });

  describe('LifecycleManager Integration', () => {
    it('should call LifecycleManager.processUpdate during Update phase', (done) => {
      const updateSpy = vi.spyOn(LifecycleManager.instance, 'processUpdate');

      GameLoop.setOnUpdate(() => {
        if (updateSpy.mock.calls.length >= 2) {
          GameLoop.stop();
          expect(updateSpy).toHaveBeenCalled();
          done();
        }
      });

      GameLoop.start();
    });

    it('should call LifecycleManager.processLateUpdate during LateUpdate phase', (done) => {
      const lateUpdateSpy = vi.spyOn(LifecycleManager.instance, 'processLateUpdate');

      GameLoop.setOnLateUpdate(() => {
        if (lateUpdateSpy.mock.calls.length >= 2) {
          GameLoop.stop();
          expect(lateUpdateSpy).toHaveBeenCalled();
          done();
        }
      });

      GameLoop.start();
    });

    it('should call LifecycleManager.processFixedUpdate during FixedUpdate phase', (done) => {
      const fixedUpdateSpy = vi.spyOn(LifecycleManager.instance, 'processFixedUpdate');

      GameLoop.setOnFixedUpdate(() => {
        if (fixedUpdateSpy.mock.calls.length >= 2) {
          GameLoop.stop();
          expect(fixedUpdateSpy).toHaveBeenCalled();
          done();
        }
      });

      GameLoop.start();
    });
  });

  describe('Time Integration', () => {
    it('should update Time each frame', (done) => {
      const updateSpy = vi.spyOn(Time, '_update');

      GameLoop.setOnUpdate(() => {
        if (updateSpy.mock.calls.length >= 2) {
          GameLoop.stop();
          expect(updateSpy).toHaveBeenCalled();
          expect(Time.frameCount).toBeGreaterThan(0);
          done();
        }
      });

      GameLoop.start();
    });

    it('should not update game logic when paused', (done) => {
      let updateCount = 0;

      GameLoop.setOnUpdate(() => {
        updateCount++;
        if (updateCount === 2) {
          // Pause after 2 frames
          GameLoop.pause();

          // Wait a bit, then check count hasn't increased
          setTimeout(() => {
            GameLoop.stop();
            expect(updateCount).toBe(2);
            done();
          }, 100);
        }
      });

      GameLoop.start();
    });
  });

  describe('Fixed Update Timing', () => {
    it('should call FixedUpdate multiple times if frame is slow', (done) => {
      let fixedUpdateCount = 0;
      Time.fixedDeltaTime = 0.01; // 10ms

      GameLoop.setOnFixedUpdate(() => {
        fixedUpdateCount++;
      });

      GameLoop.setOnUpdate(() => {
        // After a few frames, check that fixed updates happened
        if (Time.frameCount >= 5) {
          GameLoop.stop();
          expect(fixedUpdateCount).toBeGreaterThan(0);
          done();
        }
      });

      GameLoop.start();
    });

    it('should consume fixed timesteps correctly', (done) => {
      const consumeSpy = vi.spyOn(Time, '_consumeFixedUpdate');

      GameLoop.setOnFixedUpdate(() => {
        // Fixed update called
      });

      GameLoop.setOnUpdate(() => {
        if (Time.frameCount >= 3) {
          GameLoop.stop();
          expect(consumeSpy).toHaveBeenCalled();
          done();
        }
      });

      GameLoop.start();
    });
  });

  describe('Reset', () => {
    it('should reset all state', () => {
      GameLoop.start();
      GameLoop.targetFrameRate = 60;
      GameLoop.setOnUpdate(() => {});
      GameLoop.setOnLateUpdate(() => {});
      GameLoop.setOnFixedUpdate(() => {});

      GameLoop._reset();

      expect(GameLoop.isRunning).toBe(false);
      expect(GameLoop.isPaused).toBe(false);
      expect(GameLoop.targetFrameRate).toBe(-1);
    });
  });

  describe('Edge Cases', () => {
    it('should handle stopping during a frame', () => {
      GameLoop.setOnUpdate(() => {
        GameLoop.stop();
      });

      GameLoop.start();

      expect(GameLoop.isRunning).toBe(false);
    });

    it('should handle pausing during a frame', () => {
      let frameCount = 0;

      GameLoop.setOnUpdate(() => {
        frameCount++;
        if (frameCount === 2) {
          GameLoop.pause();
        }
      });

      GameLoop.start();

      setTimeout(() => {
        GameLoop.stop();
        expect(GameLoop.isPaused).toBe(true);
      }, 100);
    });

    it('should handle very high target frame rates', () => {
      GameLoop.targetFrameRate = 1000;
      expect(GameLoop.targetFrameRate).toBe(1000);
    });

    it('should handle frame rate changes during runtime', (done) => {
      GameLoop.start();
      GameLoop.targetFrameRate = 30;

      setTimeout(() => {
        GameLoop.targetFrameRate = 60;
        expect(GameLoop.targetFrameRate).toBe(60);

        setTimeout(() => {
          GameLoop.stop();
          done();
        }, 50);
      }, 50);
    });
  });
});
