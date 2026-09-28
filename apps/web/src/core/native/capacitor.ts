export interface NativePlatformInfo {
  isNative: boolean;
  platform: 'ios' | 'android' | 'web';
}

export function getNativePlatformInfo(): NativePlatformInfo {
  const win = typeof window !== 'undefined' ? (window as any) : {};
  const isCapacitor = Boolean(win.Capacitor?.isNativePlatform?.());

  let platform: 'ios' | 'android' | 'web' = 'web';
  if (isCapacitor) {
    const rawPlat = win.Capacitor?.getPlatform?.();
    if (rawPlat === 'ios') platform = 'ios';
    else if (rawPlat === 'android') platform = 'android';
  }

  return {
    isNative: isCapacitor,
    platform,
  };
}

export function registerDeepLinkHandler(onUrlOpened: (url: string) => void): void {
  const win = typeof window !== 'undefined' ? (window as any) : {};
  if (win.Capacitor?.Plugins?.App) {
    win.Capacitor.Plugins.App.addListener('appUrlOpen', (data: { url: string }) => {
      onUrlOpened(data.url);
    });
  }
}
