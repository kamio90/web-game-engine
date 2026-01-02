/**
 * Application provides access to application runtime data.
 *
 * Unity's Application class provides information about the platform,
 * build settings, and application lifecycle. This implementation provides
 * web-specific equivalents.
 *
 * @example
 * ```typescript
 * console.log(`Platform: ${Application.platform}`);
 * console.log(`Is Mobile: ${Application.isMobile}`);
 * console.log(`Is Playing: ${Application.isPlaying}`);
 * console.log(`URL: ${Application.absoluteURL}`);
 * ```
 */
export class Application {
  private static _isPlaying: boolean = false;
  private static _isFocused: boolean = true;
  private static _targetFrameRate: number = -1;
  private static _runInBackground: boolean = true;

  // Build information
  private static _companyName: string = '';
  private static _productName: string = 'Web Game Engine';
  private static _version: string = '1.0.0';

  // Callbacks
  private static _onQuit: (() => void)[] = [];
  private static _onFocusChanged: ((focused: boolean) => void)[] = [];

  /**
   * Initializes the Application system.
   * Sets up event listeners for visibility and focus changes.
   * @internal
   */
  public static _initialize(): void {
    // Listen for visibility changes
    document.addEventListener('visibilitychange', () => {
      const isFocused = !document.hidden;
      if (isFocused !== this._isFocused) {
        this._isFocused = isFocused;
        this._notifyFocusChanged(isFocused);
      }
    });

    // Listen for beforeunload (quit)
    window.addEventListener('beforeunload', (_event) => {
      this._notifyQuit();
    });

    // Listen for pagehide (mobile quit)
    window.addEventListener('pagehide', (_event) => {
      this._notifyQuit();
    });

    // Detect initial focus state
    this._isFocused = !document.hidden;
  }

  // Public API (matches Unity)

  /**
   * The URL of the web page the game is running in.
   */
  public static get absoluteURL(): string {
    return window.location.href;
  }

  /**
   * The company name specified in the project settings.
   */
  public static get companyName(): string {
    return this._companyName;
  }

  public static set companyName(value: string) {
    this._companyName = value;
  }

  /**
   * The name of the store or package that installed the application (Read Only).
   * For web, this returns 'web'.
   */
  public static get installerName(): string {
    return 'web';
  }

  /**
   * Returns true when called in web browser.
   */
  public static get isEditor(): boolean {
    return false; // We're always in runtime, not editor
  }

  /**
   * Whether the application is focused.
   */
  public static get isFocused(): boolean {
    return this._isFocused;
  }

  /**
   * Checks whether the game is running on a mobile device.
   */
  public static get isMobile(): boolean {
    return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    );
  }

  /**
   * Returns true when the application is playing.
   */
  public static get isPlaying(): boolean {
    return this._isPlaying;
  }

  /**
   * Returns the platform the game is running on.
   */
  public static get platform(): string {
    if (this.isMobile) {
      if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        return 'iOS';
      } else if (/Android/i.test(navigator.userAgent)) {
        return 'Android';
      }
      return 'Mobile';
    }

    const platform = navigator.platform.toLowerCase();
    if (platform.indexOf('mac') !== -1) {
      return 'macOS';
    } else if (platform.indexOf('win') !== -1) {
      return 'Windows';
    } else if (platform.indexOf('linux') !== -1) {
      return 'Linux';
    }

    return 'WebGL';
  }

  /**
   * Returns the name of the product.
   */
  public static get productName(): string {
    return this._productName;
  }

  public static set productName(value: string) {
    this._productName = value;
  }

  /**
   * Should the application continue running when it loses focus?
   */
  public static get runInBackground(): boolean {
    return this._runInBackground;
  }

  public static set runInBackground(value: boolean) {
    this._runInBackground = value;
  }

  /**
   * Instructs the game to try to render at a specified frame rate.
   *
   * Set to -1 (default) to use the platform's default frame rate.
   * This directly affects GameLoop.targetFrameRate.
   */
  public static get targetFrameRate(): number {
    return this._targetFrameRate;
  }

  public static set targetFrameRate(value: number) {
    if (value < -1) {
      console.warn('Application.targetFrameRate must be -1 or positive. Clamping to -1.');
      this._targetFrameRate = -1;
    } else {
      this._targetFrameRate = value;
    }
  }

  /**
   * The version of the application.
   */
  public static get version(): string {
    return this._version;
  }

  public static set version(value: string) {
    this._version = value;
  }

  /**
   * The browser's user agent string.
   */
  public static get userAgent(): string {
    return navigator.userAgent;
  }

  /**
   * Returns the language the user's operating system is running in.
   */
  public static get systemLanguage(): string {
    return navigator.language || 'en-US';
  }

  /**
   * Opens the URL in the browser.
   * @param url - The URL to open
   */
  public static OpenURL(url: string): void {
    window.open(url, '_blank');
  }

  /**
   * Quits the application.
   *
   * For web applications, this closes the current tab/window.
   * Note: Browsers may block this for security reasons.
   */
  public static Quit(): void {
    this._notifyQuit();
    window.close();
  }

  // Event system

  /**
   * Registers a callback to be invoked when the application quits.
   * @param callback - Function to call on quit
   */
  public static onQuit(callback: () => void): void {
    if (!this._onQuit.includes(callback)) {
      this._onQuit.push(callback);
    }
  }

  /**
   * Unregisters a quit callback.
   * @param callback - The callback to remove
   */
  public static offQuit(callback: () => void): void {
    const index = this._onQuit.indexOf(callback);
    if (index !== -1) {
      this._onQuit.splice(index, 1);
    }
  }

  /**
   * Registers a callback to be invoked when focus changes.
   * @param callback - Function to call on focus change
   */
  public static onFocusChanged(callback: (focused: boolean) => void): void {
    if (!this._onFocusChanged.includes(callback)) {
      this._onFocusChanged.push(callback);
    }
  }

  /**
   * Unregisters a focus changed callback.
   * @param callback - The callback to remove
   */
  public static offFocusChanged(callback: (focused: boolean) => void): void {
    const index = this._onFocusChanged.indexOf(callback);
    if (index !== -1) {
      this._onFocusChanged.splice(index, 1);
    }
  }

  // Internal methods

  /**
   * Starts the application (sets isPlaying to true).
   * @internal
   */
  public static _start(): void {
    this._isPlaying = true;
  }

  /**
   * Stops the application (sets isPlaying to false).
   * @internal
   */
  public static _stop(): void {
    this._isPlaying = false;
  }

  /**
   * Notifies all quit callbacks.
   * @internal
   */
  private static _notifyQuit(): void {
    // Create a copy to prevent modification during iteration
    const callbacks = [...this._onQuit];
    for (const callback of callbacks) {
      try {
        callback();
      } catch (error) {
        console.error('Error in Application.onQuit callback:', error);
      }
    }
  }

  /**
   * Notifies all focus changed callbacks.
   * @internal
   */
  private static _notifyFocusChanged(focused: boolean): void {
    // Create a copy to prevent modification during iteration
    const callbacks = [...this._onFocusChanged];
    for (const callback of callbacks) {
      try {
        callback(focused);
      } catch (error) {
        console.error('Error in Application.onFocusChanged callback:', error);
      }
    }
  }

  /**
   * Resets the Application system (for testing).
   * @internal
   */
  public static _reset(): void {
    this._isPlaying = false;
    this._isFocused = true;
    this._targetFrameRate = -1;
    this._runInBackground = true;
    this._companyName = '';
    this._productName = 'Web Game Engine';
    this._version = '1.0.0';
    this._onQuit = [];
    this._onFocusChanged = [];
  }
}
