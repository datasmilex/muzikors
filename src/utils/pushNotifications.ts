import { PushNotifications } from '@capacitor/push-notifications';
import { Capacitor } from '@capacitor/core';
import { supabase } from '@/lib/supabaseClient';

export const initPushNotifications = async () => {
  if (!Capacitor.isNativePlatform()) {
    return;
  }

  try {
    let permStatus = await PushNotifications.checkPermissions();

    if (permStatus.receive === 'prompt') {
      permStatus = await PushNotifications.requestPermissions();
    }

    if (permStatus.receive !== 'granted') {
      console.log('[Push] Bildirim izni reddedildi.');
      return;
    }

    await PushNotifications.register();

    PushNotifications.removeAllListeners();

    PushNotifications.addListener('registration', async (token) => {
      console.log('[Push] FCM Token kaydediliyor:', token.value);
      try {
        await supabase.rpc('register_device_token', {
          p_fcm_token: token.value,
          p_platform: Capacitor.getPlatform(),
          p_app_version: '1.4.7',
        });
      } catch (err) {
        console.error('[Push] Token Supabase kayıt hatası:', err);
      }
    });

    PushNotifications.addListener('registrationError', (error) => {
      console.error('[Push] FCM Registration Error:', error);
    });

    PushNotifications.addListener('pushNotificationReceived', (notification) => {
      console.log('[Push] Bildirim alındı:', notification);
    });

    PushNotifications.addListener('pushNotificationActionPerformed', (notification) => {
      console.log('[Push] Bildirime tıklandı:', notification);
      const data = notification.notification.data;
      if (data?.url && typeof window !== 'undefined') {
        window.location.href = data.url;
      }
    });
  } catch (err) {
    console.error('[Push] initPushNotifications hata:', err);
  }
};
