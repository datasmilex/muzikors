import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/lib/supabaseClient';

const FCM_TOKEN_STORAGE_KEY = 'muzikors_fcm_token';
const APP_VERSION = '1.6.1';

/**
 * Sync the FCM token with Supabase user_devices table.
 * If token is not provided, reads the cached token from localStorage.
 */
export const syncDeviceToken = async (explicitToken?: string, userId?: string) => {
  if (!Capacitor.isNativePlatform()) return;

  try {
    const token = explicitToken || (typeof window !== 'undefined' ? localStorage.getItem(FCM_TOKEN_STORAGE_KEY) : null);
    if (!token) return;

    await supabase.rpc('register_device_token', {
      p_fcm_token: token,
      p_platform: Capacitor.getPlatform(),
      p_app_version: APP_VERSION,
      p_user_id: userId || null,
    });
    console.log('[Push] Device token synced with Supabase for user:', userId || 'guest');
  } catch (err) {
    console.error('[Push] Device token sync error:', err);
  }
};

export const initPushNotifications = async (userId?: string) => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    // 1. Android Notification Channel configuration (mandatory for Android 8+)
    if (Capacitor.getPlatform() === 'android') {
      await PushNotifications.createChannel({
        id: 'muzikors_default_channel',
        name: 'Muzikors Bildirimleri',
        description: 'Muzikors mekan ve genel sistem bildirimleri',
        importance: 5,
        visibility: 1,
        sound: 'default',
        vibration: true,
        lights: true,
        lightColor: '#D4AF37',
      });
    }

    // 2. Remove any old listeners before attaching fresh ones
    await PushNotifications.removeAllListeners();

    // 3. Attach listeners BEFORE calling register()
    PushNotifications.addListener('registration', async (token) => {
      console.log('[Push] FCM Registration successful, token:', token.value);
      if (typeof window !== 'undefined') {
        localStorage.setItem(FCM_TOKEN_STORAGE_KEY, token.value);
      }
      await syncDeviceToken(token.value, userId);
    });

    PushNotifications.addListener('registrationError', (error) => {
      console.error('[Push] FCM Registration Error:', error);
    });

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('[Push] Notification received in foreground:', notification);
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('[Push] Notification clicked/action performed:', notification);
      const data = notification.notification.data;
      if (data?.url && typeof window !== 'undefined') {
        window.location.href = data.url;
      }
    });

    // 4. Check and request notification permissions (supports Android 13+ POST_NOTIFICATIONS)
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt' || (permStatus.receive as any) === 'prompt-with-rationale') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      console.log('[Push] Bildirim izni verilmedi (status:', permStatus.receive, ')');
      return;
    }

    // 5. Register with FCM / APNS now that listeners and permissions are active
    await PushNotifications.register();

    // 6. If we already have a cached token from previous launch, sync it immediately
    if (typeof window !== 'undefined') {
      const cachedToken = localStorage.getItem(FCM_TOKEN_STORAGE_KEY);
      if (cachedToken) {
        await syncDeviceToken(cachedToken, userId);
      }
    }
  } catch (err) {
    console.error('[Push] initPushNotifications error:', err);
  }
};
