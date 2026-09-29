'use client';

import { Capacitor } from '@capacitor/core';
import { supabase } from '../lib/supabaseClient';

export const PREMIUM_PRODUCT_ID = 'muzikors_premium';

class IAPService {
  private isInitialized = false;
  private onPurchaseSuccessCallback: (() => void) | null = null;
  private onPurchaseErrorCallback: ((error: string) => void) | null = null;

  public async initialize(
    onSuccess?: () => void,
    onError?: (err: string) => void
  ) {
    if (onSuccess) this.onPurchaseSuccessCallback = onSuccess;
    if (onError) this.onPurchaseErrorCallback = onError;

    if (!Capacitor.isNativePlatform()) {
      console.log('[IAPService] Web platform detected, native In-App Purchase disabled.');
      return;
    }

    if (this.isInitialized) return;

    try {
      const CdvPurchase = (window as any).CdvPurchase;
      if (!CdvPurchase || !CdvPurchase.store) {
        console.warn('[IAPService] CdvPurchase not available on window yet.');
        return;
      }

      const store = CdvPurchase.store;
      const isIos = Capacitor.getPlatform() === 'ios';
      const targetPlatform = isIos
        ? (CdvPurchase.Platform.APPLE_APPSTORE || 'apple-appstore')
        : (CdvPurchase.Platform.GOOGLE_PLAY || 'google-play');

      // Register Subscriptions for Google Play & Apple App Store (Individual VIP Only)
      store.register([
        {
          type: CdvPurchase.ProductType.PAID_SUBSCRIPTION,
          id: PREMIUM_PRODUCT_ID,
          platform: targetPlatform,
        },
      ]);

      // Set up transaction listeners
      store.when()
        .approved(async (transaction: any) => {
          console.log('[IAPService] Transaction approved:', transaction);
          try {
            // User VIP Premium
            const { data, error } = await supabase.rpc('activate_subscription_self', {
              p_product_id: PREMIUM_PRODUCT_ID,
              p_order_id: transaction.transactionId || null,
              p_purchase_token: transaction.purchaseToken || null,
            });
            if (error) console.error('[IAPService] Error activating user premium in Supabase:', error);
            else console.log('[IAPService] Premium activated successfully:', data);

            // Finish the transaction (Acknowledge)
            await transaction.finish();

            if (this.onPurchaseSuccessCallback) {
              this.onPurchaseSuccessCallback();
            }
          } catch (e: any) {
            console.error('[IAPService] Failed to process approved transaction:', e);
          }
        })
        .verified((receipt: any) => {
          receipt.finish();
        })
        .unverified((err: any) => {
          console.warn('[IAPService] Unverified transaction:', err);
        })
        .finished((transaction: any) => {
          console.log('[IAPService] Transaction finished:', transaction);
        });

      // Initialize the store with active platform
      await store.initialize([targetPlatform]);
      this.isInitialized = true;
      console.log(`[IAPService] In-App Purchase Store (${isIos ? 'Apple App Store' : 'Google Play'}) initialized successfully.`);
    } catch (err: any) {
      console.error('[IAPService] Initialization error:', err);
    }
  }

  public async subscribe(): Promise<{ success: boolean; message?: string }> {
    return this.orderProduct(PREMIUM_PRODUCT_ID);
  }

  private async orderProduct(productId: string): Promise<{ success: boolean; message?: string }> {
    if (!Capacitor.isNativePlatform()) {
      return {
        success: false,
        message: 'Abonelik işlemi iOS ve Android mobil uygulamaları (App Store & Google Play) üzerinden başlatılabilir.',
      };
    }

    try {
      const CdvPurchase = (window as any).CdvPurchase;
      if (!CdvPurchase || !CdvPurchase.store) {
        throw new Error('Uygulama İçi Faturalandırma Servisi başlatılamadı. Lütfen uygulamayı yeniden başlatın.');
      }

      const store = CdvPurchase.store;
      const product = store.get(productId);

      if (!product) {
        await this.initialize();
      }

      const readyProduct = store.get(productId);
      const offer = readyProduct?.getOffer();

      if (!offer) {
        const fallbackOffer = readyProduct?.offers?.[0];
        if (fallbackOffer) {
          await store.order(fallbackOffer);
          return { success: true };
        }
        throw new Error('Abonelik paketi mağaza üzerinden yüklenemedi. Lütfen internet bağlantınızı kontrol edin.');
      }

      const result = await store.order(offer);
      console.log('[IAPService] Order initiated for product:', productId, result);
      return { success: true };
    } catch (err: any) {
      console.error('[IAPService] Order error:', err);
      return {
        success: false,
        message: err.message || 'Ödeme başlatılırken bir hata oluştu.',
      };
    }
  }

  public async restore(): Promise<void> {
    if (Capacitor.isNativePlatform()) {
      try {
        const CdvPurchase = (window as any).CdvPurchase;
        if (CdvPurchase?.store) {
          await CdvPurchase.store.restorePurchases();
        }
      } catch (e) {
        console.error('[IAPService] Restore error:', e);
      }
    }
  }
}

export const iapService = new IAPService();
