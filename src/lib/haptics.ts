import { Capacitor } from '@capacitor/core';
import { Haptics, ImpactStyle, NotificationType } from '@capacitor/haptics';

/**
 * Triggers subtle native haptic feedback (Taptic Engine on iOS, vibrator on Android).
 * Safely no-ops in standard web browsers.
 */
export async function hapticTap(style: ImpactStyle = ImpactStyle.Light): Promise<void> {
  if (typeof window === 'undefined' || !Capacitor.isNativePlatform()) return;
  try {
    await Haptics.impact({ style });
  } catch (e) {}
}

export async function hapticSelection(): Promise<void> {
  if (typeof window === 'undefined' || !Capacitor.isNativePlatform()) return;
  try {
    await Haptics.selectionStart();
    await Haptics.selectionChanged();
  } catch (e) {}
}

export async function hapticSuccess(): Promise<void> {
  if (typeof window === 'undefined' || !Capacitor.isNativePlatform()) return;
  try {
    await Haptics.notification({ type: NotificationType.Success });
  } catch (e) {}
}

export async function hapticWarning(): Promise<void> {
  if (typeof window === 'undefined' || !Capacitor.isNativePlatform()) return;
  try {
    await Haptics.notification({ type: NotificationType.Warning });
  } catch (e) {}
}
