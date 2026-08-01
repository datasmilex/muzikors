import { Purchases, LOG_LEVEL } from '@revenuecat/purchases-capacitor';
import { RevenueCatUI } from '@revenuecat/purchases-capacitor-ui';
import { Capacitor } from '@capacitor/core';

// The API key provided by the user
const REVENUECAT_API_KEY = 'test_TYLYZhrTUXKWYcRRwOAHJSwCrYn';
const PREMIUM_ENTITLEMENT_ID = 'Muzikors Premium'; // Assuming this is the entitlement ID in RevenueCat

const isNative = Capacitor.isNativePlatform();

export const RevenueCatService = {
  initialize: async (userId?: string) => {
    if (!isNative) {
      console.log('[RevenueCat] Skipped initialization on web platform.');
      return;
    }
    
    try {
      await Purchases.setLogLevel({ level: LOG_LEVEL.DEBUG });
      if (userId) {
        await Purchases.configure({ apiKey: REVENUECAT_API_KEY, appUserID: userId });
      } else {
        await Purchases.configure({ apiKey: REVENUECAT_API_KEY });
      }
      console.log('[RevenueCat] Initialized successfully');
    } catch (e) {
      console.error('[RevenueCat] Initialization failed:', e);
    }
  },

  getCustomerInfo: async () => {
    if (!isNative) return null;
    try {
      const { customerInfo } = await Purchases.getCustomerInfo();
      return customerInfo;
    } catch (e) {
      console.error('[RevenueCat] Error getting customer info:', e);
      return null;
    }
  },

  checkPremiumEntitlement: async (customerInfo?: any): Promise<boolean> => {
    if (!isNative) return false;
    
    let info = customerInfo;
    if (!info) {
      info = await RevenueCatService.getCustomerInfo();
    }
    
    if (info && info.entitlements.active[PREMIUM_ENTITLEMENT_ID]) {
      return true;
    }
    return false;
  },

  getOfferings: async () => {
    if (!isNative) return null;
    try {
      const offerings = await Purchases.getOfferings();
      return offerings.current;
    } catch (e) {
      console.error('[RevenueCat] Error getting offerings:', e);
      return null;
    }
  },

  purchasePackage: async (packageToBuy: any) => {
    if (!isNative) return null;
    try {
      const { customerInfo } = await Purchases.purchasePackage({ aPackage: packageToBuy });
      console.log('[RevenueCat] Purchase successful:', customerInfo);
      return customerInfo;
    } catch (e: any) {
      if (!e.userCancelled) {
        console.error('[RevenueCat] Purchase failed:', e);
      } else {
        console.log('[RevenueCat] Purchase cancelled by user');
      }
      return null;
    }
  },

  presentPaywall: async () => {
    if (!isNative) {
      console.log('[RevenueCat] Paywall not supported on web.');
      return null;
    }
    try {
      // The presentPaywall method comes from @revenuecat/purchases-capacitor-ui
      const result = await RevenueCatUI.presentPaywall();
      console.log('[RevenueCat] Paywall result:', result);
      return result;
    } catch (e) {
      console.error('[RevenueCat] Failed to present paywall:', e);
      return null;
    }
  },

  presentCustomerCenter: async () => {
    if (!isNative) {
      console.log('[RevenueCat] Customer Center not supported on web.');
      return;
    }
    try {
      await RevenueCatUI.presentCustomerCenter();
    } catch (e) {
      console.error('[RevenueCat] Failed to present customer center:', e);
    }
  },

  restorePurchases: async () => {
    if (!isNative) return null;
    try {
      const customerInfo = await Purchases.restorePurchases();
      console.log('[RevenueCat] Purchases restored:', customerInfo);
      return customerInfo;
    } catch (e) {
      console.error('[RevenueCat] Restore failed:', e);
      return null;
    }
  },
};
