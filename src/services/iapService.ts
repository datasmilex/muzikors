'use client';

import { Capacitor } from '@capacitor/core';
import { supabase } from '../lib/supabaseClient';

export const PREMIUM_PRODUCT_ID = 'muzikors_premium';
export const KAFE_PRODUCT_ID = 'kafe_abonelik';
export const KAFE_ANNUAL_PRODUCT_ID = 'kafe_abonelik_yillik';

class IAPService {
  private isInitialized = false;
  private activePendingVenueId: number | null = null;
  private activePlanType: 'monthly' | 'annual' = 'monthly';
  private onPurchaseSuccessCallback: (() => void) | null = null;
  private onPurchaseErrorCallback: ((error: string) => void) | null = null;

  public async initialize(
    onSuccess?: () => void,
    onError?: (err: string) => void
  ) {
    if (onSuccess) this.onPurchaseSuccessCallback = onSuccess;
    if (onError) this.onPurchaseErrorCallback = onError;

    if (!Capacitor.isNativePlatform()) {
      console.log('[IAPService] Web platform detected, native Google Play Billing disabled.');
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

      // Register Google Play Subscriptions
      store.register([
        {
          type: CdvPurchase.ProductType.PAID_SUBSCRIPTION,
          id: PREMIUM_PRODUCT_ID,
          platform: CdvPurchase.Platform.GOOGLE_PLAY,
        },
        {
          type: CdvPurchase.ProductType.PAID_SUBSCRIPTION,
          id: KAFE_PRODUCT_ID,
          platform: CdvPurchase.Platform.GOOGLE_PLAY,
        },
        {
          type: CdvPurchase.ProductType.PAID_SUBSCRIPTION,
          id: KAFE_ANNUAL_PRODUCT_ID,
          platform: CdvPurchase.Platform.GOOGLE_PLAY,
        },
      ]);

      // Set up transaction listeners
      store.when()
        .approved(async (transaction: any) => {
          console.log('[IAPService] Transaction approved:', transaction);
          try {
            const productId = transaction.products?.[0]?.id || transaction.id;

            if (productId === KAFE_PRODUCT_ID || productId === KAFE_ANNUAL_PRODUCT_ID || this.activePendingVenueId !== null) {
              const targetVenueId = this.activePendingVenueId;
              const { data, error } = await supabase.rpc('activate_venue_subscription_self', {
                p_venue_id: targetVenueId || null,
                p_product_id: productId || (this.activePlanType === 'annual' ? KAFE_ANNUAL_PRODUCT_ID : KAFE_PRODUCT_ID),
                p_order_id: transaction.transactionId || null,
                p_purchase_token: transaction.purchaseToken || null,
              });
              if (error) console.error('[IAPService] Error activating venue subscription in Supabase:', error);
              else console.log('[IAPService] Venue subscription activated successfully:', data);
              this.activePendingVenueId = null;
            } else {
              // User VIP Premium
              const { data, error } = await supabase.rpc('activate_subscription_self', {
                p_product_id: PREMIUM_PRODUCT_ID,
                p_order_id: transaction.transactionId || null,
                p_purchase_token: transaction.purchaseToken || null,
              });
              if (error) console.error('[IAPService] Error activating user premium in Supabase:', error);
              else console.log('[IAPService] Premium activated successfully:', data);
            }

            // Finish the transaction with Google Play (Acknowledge)
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

      // Initialize the store
      await store.initialize([CdvPurchase.Platform.GOOGLE_PLAY]);
      this.isInitialized = true;
      console.log('[IAPService] Google Play Billing Store initialized successfully.');
    } catch (err: any) {
      console.error('[IAPService] Initialization error:', err);
    }
  }

  public async subscribe(): Promise<{ success: boolean; message?: string }> {
    return this.orderProduct(PREMIUM_PRODUCT_ID);
  }

  public async subscribeVenue(venueId: number, plan: 'monthly' | 'annual' = 'monthly'): Promise<{ success: boolean; message?: string }> {
    this.activePendingVenueId = venueId;
    this.activePlanType = plan;
    const targetProductId = plan === 'annual' ? KAFE_ANNUAL_PRODUCT_ID : KAFE_PRODUCT_ID;
    return this.orderProduct(targetProductId);
  }

  private async orderProduct(productId: string): Promise<{ success: boolean; message?: string }> {
    if (!Capacitor.isNativePlatform()) {
      return {
        success: false,
        message: 'Abonelik işlemi sadece Android mobil uygulaması üzerinden Google Play ile yapılabilir.',
      };
    }

    try {
      const CdvPurchase = (window as any).CdvPurchase;
      if (!CdvPurchase || !CdvPurchase.store) {
        throw new Error('Google Play Faturalandırma Servisi başlatılamadı. Lütfen uygulamayı yeniden başlatın.');
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
        throw new Error('Abonelik paketi Google Play üzerinden yüklenemedi. Lütfen internet bağlantınızı kontrol edin.');
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
