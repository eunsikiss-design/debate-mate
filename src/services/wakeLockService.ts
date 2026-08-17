class WakeLockService {
  private wakeLock: WakeLockSentinel | null = null;
  private isSupported: boolean = 'wakeLock' in navigator;

  public async request(): Promise<boolean> {
    if (!this.isSupported) {
      console.warn('Screen Wake Lock API is not supported on this browser.');
      return false;
    }
    try {
      this.wakeLock = await navigator.wakeLock.request('screen');
      this.wakeLock.addEventListener('release', () => {
        console.log('Screen Wake Lock released');
        this.wakeLock = null;
      });
      console.log('Screen Wake Lock active');
      return true;
    } catch (err) {
      console.error('Failed to request Wake Lock:', err);
      return false;
    }
  }

  public async release(): Promise<void> {
    if (this.wakeLock) {
      try {
        await this.wakeLock.release();
        this.wakeLock = null;
      } catch (err) {
        console.error('Failed to release Wake Lock:', err);
      }
    }
  }

  public isActive(): boolean {
    return this.wakeLock !== null;
  }
}

export const wakeLockService = new WakeLockService();
