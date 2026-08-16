import { Capacitor } from '@capacitor/core';
import type {
  RewardAdOptions,
  AdMobRewardItem,
} from '@capacitor-community/admob';

// Google AdMob Rewarded Video Unit IDs
export const ADMOB_REWARDED_AD_UNIT_ID = 'ca-app-pub-6907017256187136/1915871376';
export const ADMOB_TEST_REWARDED_AD_UNIT_ID = 'ca-app-pub-3940256099942544/5224354917';

class AdMobService {
  private isInitialized = false;
  private isAdPrepared = false;
  private adMobPlugin: any = null;

  private async getAdMob() {
    if (this.adMobPlugin) return this.adMobPlugin;
    if (Capacitor.isNativePlatform()) {
      try {
        const { AdMob } = await import('@capacitor-community/admob');
        this.adMobPlugin = AdMob;
        return AdMob;
      } catch (err) {
        console.warn('[AdMob] Failed to load native AdMob plugin:', err);
      }
    }
    return null;
  }

  public async initialize(): Promise<void> {
    if (this.isInitialized) return;
    if (!Capacitor.isNativePlatform()) {
      this.isInitialized = true;
      return;
    }

    try {
      const AdMob = await this.getAdMob();
      if (AdMob) {
        await AdMob.initialize({
          initializeForTesting: false,
        });
        this.isInitialized = true;
        console.log('[AdMob] Initialized successfully');
        // Preload first rewarded ad
        this.prepareRewardedAd().catch(() => {});
      }
    } catch (error) {
      console.error('[AdMob] Initialization error:', error);
    }
  }

  public async prepareRewardedAd(): Promise<boolean> {
    if (!Capacitor.isNativePlatform()) return true;

    try {
      const AdMob = await this.getAdMob();
      if (!AdMob) return false;

      const options: RewardAdOptions = {
        adId: ADMOB_REWARDED_AD_UNIT_ID,
        isTesting: false,
      };

      await AdMob.prepareRewardVideoAd(options);
      this.isAdPrepared = true;
      console.log('[AdMob] Reward video prepared');
      return true;
    } catch (error) {
      console.warn('[AdMob] Prepare reward video error (falling back to test unit):', error);
      try {
        const AdMob = await this.getAdMob();
        if (!AdMob) return false;
        await AdMob.prepareRewardVideoAd({
          adId: ADMOB_TEST_REWARDED_AD_UNIT_ID,
          isTesting: true,
        });
        this.isAdPrepared = true;
        return true;
      } catch (testErr) {
        console.error('[AdMob] Fallback prepare error:', testErr);
        this.isAdPrepared = false;
        return false;
      }
    }
  }

  public async showRewardedAd(
    onReward: () => void,
    onDismiss?: () => void,
    onError?: (err: string) => void
  ): Promise<void> {
    const isNative = Capacitor.isNativePlatform();

    if (!isNative) {
      // Web fallback handled by custom modal timer
      console.log('[AdMob] Running on web platform fallback');
      return;
    }

    try {
      const AdMob = await this.getAdMob();
      if (!AdMob) {
        throw new Error('AdMob plugin is not available on this device.');
      }

      // Ensure ad is ready
      if (!this.isAdPrepared) {
        const prepared = await this.prepareRewardedAd();
        if (!prepared) {
          throw new Error('Reklam şu anda yüklenemedi. Lütfen internet bağlantınızı kontrol edip tekrar deneyin.');
        }
      }

      let rewardEarned = false;

      const rewardListener = await AdMob.addListener(
        'onRewardedVideoReward',
        (reward: AdMobRewardItem) => {
          console.log('[AdMob] User earned reward:', reward);
          rewardEarned = true;
          onReward();
        }
      );

      const dismissListener = await AdMob.addListener(
        'onRewardedVideoAdDismissed',
        () => {
          console.log('[AdMob] Reward video dismissed');
          this.isAdPrepared = false;
          rewardListener.remove();
          dismissListener.remove();
          if (onDismiss) onDismiss();
          // Prepare next ad in background
          this.prepareRewardedAd().catch(() => {});
        }
      );

      const failedListener = await AdMob.addListener(
        'onRewardedVideoAdFailedToLoad',
        (info: any) => {
          console.error('[AdMob] Reward video failed:', info);
          this.isAdPrepared = false;
          rewardListener.remove();
          dismissListener.remove();
          failedListener.remove();
          if (onError) onError('Reklam oynatılırken bir sorun oluştu.');
        }
      );

      await AdMob.showRewardVideoAd();
    } catch (error: any) {
      console.error('[AdMob] Show reward video failed:', error);
      if (onError) onError(error?.message || 'Reklam başlatılamadı.');
    }
  }
}

export const admobService = new AdMobService();
