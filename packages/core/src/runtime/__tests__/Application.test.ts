import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Application } from '../Application';

describe('Application', () => {
  beforeEach(() => {
    // Reset Application before each test
    Application._reset();
    vi.clearAllMocks();
  });

  describe('Platform Information', () => {
    it('should return absolute URL', () => {
      const url = Application.absoluteURL;
      expect(url).toBeDefined();
      expect(typeof url).toBe('string');
    });

    it('should return platform information', () => {
      const platform = Application.platform;
      expect(platform).toBeDefined();
      expect(typeof platform).toBe('string');
    });

    it('should return user agent', () => {
      const userAgent = Application.userAgent;
      expect(userAgent).toBeDefined();
      expect(typeof userAgent).toBe('string');
    });

    it('should return system language', () => {
      const language = Application.systemLanguage;
      expect(language).toBeDefined();
      expect(typeof language).toBe('string');
    });

    it('should detect if running on mobile', () => {
      const isMobile = Application.isMobile;
      expect(typeof isMobile).toBe('boolean');
    });

    it('should return installer name as web', () => {
      expect(Application.installerName).toBe('web');
    });

    it('should return isEditor as false', () => {
      expect(Application.isEditor).toBe(false);
    });
  });

  describe('Product Information', () => {
    it('should have default product name', () => {
      expect(Application.productName).toBe('Web Game Engine');
    });

    it('should allow setting product name', () => {
      Application.productName = 'My Game';
      expect(Application.productName).toBe('My Game');
    });

    it('should have default company name', () => {
      expect(Application.companyName).toBe('');
    });

    it('should allow setting company name', () => {
      Application.companyName = 'Acme Corp';
      expect(Application.companyName).toBe('Acme Corp');
    });

    it('should have default version', () => {
      expect(Application.version).toBe('1.0.0');
    });

    it('should allow setting version', () => {
      Application.version = '2.0.0';
      expect(Application.version).toBe('2.0.0');
    });
  });

  describe('Runtime State', () => {
    it('should not be playing by default', () => {
      expect(Application.isPlaying).toBe(false);
    });

    it('should start playing when _start is called', () => {
      Application._start();
      expect(Application.isPlaying).toBe(true);
    });

    it('should stop playing when _stop is called', () => {
      Application._start();
      expect(Application.isPlaying).toBe(true);

      Application._stop();
      expect(Application.isPlaying).toBe(false);
    });

    it('should be focused by default', () => {
      expect(Application.isFocused).toBe(true);
    });
  });

  describe('Target Frame Rate', () => {
    it('should have default target frame rate of -1', () => {
      expect(Application.targetFrameRate).toBe(-1);
    });

    it('should allow setting target frame rate', () => {
      Application.targetFrameRate = 60;
      expect(Application.targetFrameRate).toBe(60);

      Application.targetFrameRate = 30;
      expect(Application.targetFrameRate).toBe(30);
    });

    it('should clamp negative frame rate to -1', () => {
      const warnSpy = vi.spyOn(console, 'warn');

      Application.targetFrameRate = -5;

      expect(Application.targetFrameRate).toBe(-1);
      expect(warnSpy).toHaveBeenCalledWith(
        'Application.targetFrameRate must be -1 or positive. Clamping to -1.'
      );
    });

    it('should allow zero frame rate', () => {
      Application.targetFrameRate = 0;
      expect(Application.targetFrameRate).toBe(0);
    });
  });

  describe('Run In Background', () => {
    it('should run in background by default', () => {
      expect(Application.runInBackground).toBe(true);
    });

    it('should allow disabling run in background', () => {
      Application.runInBackground = false;
      expect(Application.runInBackground).toBe(false);
    });
  });

  describe('OpenURL', () => {
    it('should open URL in new window', () => {
      const openSpy = vi.spyOn(window, 'open').mockImplementation(() => null);

      Application.OpenURL('https://example.com');

      expect(openSpy).toHaveBeenCalledWith('https://example.com', '_blank');
    });
  });

  describe('Quit', () => {
    it('should close window when quit', () => {
      const closeSpy = vi.spyOn(window, 'close').mockImplementation(() => {});

      Application.Quit();

      expect(closeSpy).toHaveBeenCalled();
    });

    it('should call quit callbacks when quit', () => {
      const callback1 = vi.fn();
      const callback2 = vi.fn();

      Application.onQuit(callback1);
      Application.onQuit(callback2);

      const closeSpy = vi.spyOn(window, 'close').mockImplementation(() => {});
      Application.Quit();

      expect(callback1).toHaveBeenCalled();
      expect(callback2).toHaveBeenCalled();
    });

    it('should not add duplicate quit callbacks', () => {
      const callback = vi.fn();

      Application.onQuit(callback);
      Application.onQuit(callback); // Add same callback again

      const closeSpy = vi.spyOn(window, 'close').mockImplementation(() => {});
      Application.Quit();

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should allow removing quit callbacks', () => {
      const callback = vi.fn();

      Application.onQuit(callback);
      Application.offQuit(callback);

      const closeSpy = vi.spyOn(window, 'close').mockImplementation(() => {});
      Application.Quit();

      expect(callback).not.toHaveBeenCalled();
    });

    it('should handle errors in quit callbacks', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const throwingCallback = vi.fn(() => {
        throw new Error('Test error');
      });
      const normalCallback = vi.fn();

      Application.onQuit(throwingCallback);
      Application.onQuit(normalCallback);

      const closeSpy = vi.spyOn(window, 'close').mockImplementation(() => {});
      Application.Quit();

      expect(throwingCallback).toHaveBeenCalled();
      expect(normalCallback).toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalled();
    });
  });

  describe('Focus Changed', () => {
    it('should register focus changed callback', () => {
      const callback = vi.fn();

      Application.onFocusChanged(callback);

      // Manually trigger focus change
      (Application as any)._notifyFocusChanged(false);

      expect(callback).toHaveBeenCalledWith(false);
    });

    it('should not add duplicate focus changed callbacks', () => {
      const callback = vi.fn();

      Application.onFocusChanged(callback);
      Application.onFocusChanged(callback); // Add same callback again

      (Application as any)._notifyFocusChanged(true);

      expect(callback).toHaveBeenCalledTimes(1);
    });

    it('should allow removing focus changed callbacks', () => {
      const callback = vi.fn();

      Application.onFocusChanged(callback);
      Application.offFocusChanged(callback);

      (Application as any)._notifyFocusChanged(true);

      expect(callback).not.toHaveBeenCalled();
    });

    it('should handle errors in focus changed callbacks', () => {
      const errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      const throwingCallback = vi.fn(() => {
        throw new Error('Test error');
      });
      const normalCallback = vi.fn();

      Application.onFocusChanged(throwingCallback);
      Application.onFocusChanged(normalCallback);

      (Application as any)._notifyFocusChanged(false);

      expect(throwingCallback).toHaveBeenCalled();
      expect(normalCallback).toHaveBeenCalled();
      expect(errorSpy).toHaveBeenCalled();
    });

    it('should call focus changed callback with correct value', () => {
      const callback = vi.fn();

      Application.onFocusChanged(callback);

      (Application as any)._notifyFocusChanged(true);
      expect(callback).toHaveBeenCalledWith(true);

      (Application as any)._notifyFocusChanged(false);
      expect(callback).toHaveBeenCalledWith(false);
    });
  });

  describe('Initialize', () => {
    it('should initialize without errors', () => {
      expect(() => Application._initialize()).not.toThrow();
    });

    it('should set up visibility change listener', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener');

      Application._initialize();

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'visibilitychange',
        expect.any(Function)
      );
    });

    it('should set up beforeunload listener', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

      Application._initialize();

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'beforeunload',
        expect.any(Function)
      );
    });

    it('should set up pagehide listener', () => {
      const addEventListenerSpy = vi.spyOn(window, 'addEventListener');

      Application._initialize();

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        'pagehide',
        expect.any(Function)
      );
    });
  });

  describe('Reset', () => {
    it('should reset all state', () => {
      Application._start();
      Application.productName = 'Test Game';
      Application.companyName = 'Test Company';
      Application.version = '2.0.0';
      Application.targetFrameRate = 60;
      Application.runInBackground = false;

      const callback = vi.fn();
      Application.onQuit(callback);
      Application.onFocusChanged(callback);

      Application._reset();

      expect(Application.isPlaying).toBe(false);
      expect(Application.productName).toBe('Web Game Engine');
      expect(Application.companyName).toBe('');
      expect(Application.version).toBe('1.0.0');
      expect(Application.targetFrameRate).toBe(-1);
      expect(Application.runInBackground).toBe(true);
      expect(Application.isFocused).toBe(true);

      // Callbacks should be cleared
      const closeSpy = vi.spyOn(window, 'close').mockImplementation(() => {});
      Application.Quit();
      expect(callback).not.toHaveBeenCalled();
    });
  });

  describe('Edge Cases', () => {
    it('should handle removing non-existent quit callback', () => {
      const callback = vi.fn();

      expect(() => Application.offQuit(callback)).not.toThrow();
    });

    it('should handle removing non-existent focus callback', () => {
      const callback = vi.fn();

      expect(() => Application.offFocusChanged(callback)).not.toThrow();
    });

    it('should handle empty product name', () => {
      Application.productName = '';
      expect(Application.productName).toBe('');
    });

    it('should handle very long product name', () => {
      const longName = 'A'.repeat(1000);
      Application.productName = longName;
      expect(Application.productName).toBe(longName);
    });
  });
});
