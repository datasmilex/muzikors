'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';
import {
  X,
  Store,
  Calendar,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  ExternalLink,
  Copy,
  Loader2,
  Plus,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import { iapService } from '../services/iapService';

interface OwnedVenue {
  id: number;
  venue_name: string;
  slug: string;
  is_active: boolean;
  subscription_until: string | null;
  grace_period_until: string | null;
  remaining_days: number;
  subscription_status: 'active' | 'grace_period' | 'expired';
  logo_url: string | null;
  city: string | null;
  district: string | null;
}

export const VenueOwnerModal: React.FC = () => {
  const { activeModal, closeModal, user, showToast } = useApp();
  const [venues, setVenues] = useState<OwnedVenue[]>([]);
  const [loading, setLoading] = useState(true);
  const [processingVenueId, setProcessingVenueId] = useState<number | null>(null);

  // Link manual venue state
  const [isLinking, setIsLinking] = useState(false);
  const [linkUsername, setLinkUsername] = useState('');
  const [linkPassword, setLinkPassword] = useState('');
  const [linkSubmitting, setLinkSubmitting] = useState(false);

  const fetchOwnedVenues = async () => {
    if (!user) {
      setVenues([]);
      setLoading(false);
      return;
    }
    try {
      setLoading(true);
      const { data, error } = await supabase.rpc('get_my_owned_venues');
      if (error) throw error;
      setVenues((data as OwnedVenue[]) || []);
    } catch (e) {
      console.error('[fetchOwnedVenues error]', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (activeModal === 'venue_owner') {
      fetchOwnedVenues();
      iapService.initialize(
        async () => {
          showToast('Tebrikler! Kafe aboneliğiniz başarıyla yenilendi! ☕👑');
          await fetchOwnedVenues();
        },
        (err) => {
          showToast(err || 'Ödeme tamamlanamadı.');
        }
      );
    }
  }, [activeModal, user]);

  if (activeModal !== 'venue_owner') return null;

  const handleSubscribe = async (venueId: number) => {
    setProcessingVenueId(venueId);
    try {
      const res = await iapService.subscribeVenue(venueId);
      if (!res.success && res.message) {
        showToast(res.message);
      }
    } catch (e: any) {
      showToast(e.message || 'Ödeme başlatılamadı.');
    } finally {
      setProcessingVenueId(null);
    }
  };

  const handleCopyPanelLink = (slug: string) => {
    const url = `https://kafe.muzikors.com.tr/admin/${slug}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(url);
      showToast('Kafe paneli linki panoya kopyalandı! 📋');
    }
  };

  const handleLinkVenue = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!linkUsername.trim() || !linkPassword.trim()) {
      showToast('Lütfen kafe kullanıcı adı ve şifrenizi girin.');
      return;
    }

    setLinkSubmitting(true);
    try {
      const { data, error } = await supabase.rpc('link_venue_by_credentials_self', {
        p_username: linkUsername.trim(),
        p_password: linkPassword.trim()
      });

      if (error) {
        showToast('Yetkilendirme başarısız: ' + error.message);
      } else {
        showToast(`"${data?.venue_name || 'Mekan'}" başarıyla hesabınıza bağlandı! 🎉`);
        setIsLinking(false);
        setLinkUsername('');
        setLinkPassword('');
        await fetchOwnedVenues();
      }
    } catch (e: any) {
      showToast('Bağlantı sırasında hata oluştu.');
    } finally {
      setLinkSubmitting(false);
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/90 backdrop-blur-md"
          onClick={closeModal}
        />

        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          className="relative w-full max-w-lg bg-[#120C08] rounded-3xl overflow-hidden shadow-2xl border border-[#D4AF37]/30 flex flex-col max-h-[90vh]"
        >
          {/* Header Graphic */}
          <div className="relative p-6 bg-gradient-to-br from-amber-950 via-[#1A120B] to-[#120C08] border-b border-[#D4AF37]/20 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#D4AF37]/30 to-amber-900/30 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] shadow-inner">
                <Store className="w-6 h-6 stroke-[2.2]" />
              </div>
              <div>
                <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                  İşletme & Abonelik Yönetimi
                </h2>
                <p className="text-xs text-amber-200/70 font-medium">
                  Mekanlarınızın durumunu ve aylık aboneliklerinizi yönetin
                </p>
              </div>
            </div>

            <button
              onClick={closeModal}
              className="p-2 bg-black/40 rounded-full text-white/60 hover:text-white hover:bg-black/60 transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-5 overflow-y-auto custom-scrollbar space-y-4">
            {loading ? (
              <div className="py-12 flex flex-col items-center justify-center text-zinc-400 gap-3">
                <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
                <span className="text-xs">Mekan bilgileriniz yükleniyor...</span>
              </div>
            ) : venues.length > 0 ? (
              venues.map((venue) => {
                const isGrace = venue.subscription_status === 'grace_period';
                const isExpired = venue.subscription_status === 'expired';
                const isActive = venue.subscription_status === 'active';

                return (
                  <div
                    key={venue.id}
                    className="bg-[#1C140E]/80 border border-[#D4AF37]/25 rounded-2xl p-4.5 space-y-4 shadow-lg"
                  >
                    {/* Venue Header */}
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-black text-white text-base">{venue.venue_name}</h3>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-white/10 text-zinc-300 font-mono">
                            /{venue.slug}
                          </span>
                        </div>
                        <p className="text-[11px] text-zinc-400 mt-0.5">
                          {venue.district ? `${venue.district}, ${venue.city}` : 'Konum bilgisi girilmedi'}
                        </p>
                      </div>

                      {/* Status Badge */}
                      {isActive && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" />
                          {venue.remaining_days} Gün Kaldı
                        </span>
                      )}
                      {isGrace && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1 animate-pulse">
                          <AlertTriangle className="w-3 h-3" />
                          3 Günlük Tolerans
                        </span>
                      )}
                      {isExpired && (
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/15 text-red-400 border border-red-500/30 flex items-center gap-1">
                          <XCircle className="w-3 h-3" />
                          Süresi Doldu
                        </span>
                      )}
                    </div>

                    {/* Subscription Warning Message if needed */}
                    {isGrace && (
                      <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-200 text-xs flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <span>
                          Abonelik süreniz bitti! 3 günlük ek tolerans süresindesiniz. Kafe yayınınızın kesilmemesi için lütfen aboneliğinizi yenileyin.
                        </span>
                      </div>
                    )}
                    {isExpired && (
                      <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/30 text-red-200 text-xs flex items-start gap-2">
                        <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <span>
                          Aboneliğiniz sona erdiği için mekanınız geçici olarak pasife alınmıştır. Tekrar aktif etmek için hemen yenileyebilirsiniz.
                        </span>
                      </div>
                    )}

                    {/* Pricing Breakdown Card */}
                    <div className="p-3 bg-white/5 border border-white/10 rounded-xl flex items-center justify-between">
                      <div>
                        <span className="text-[10px] text-zinc-400 font-bold uppercase tracking-wider block">Aylık Kafe Abonelik Bedeli</span>
                        <div className="flex items-baseline gap-1.5 mt-0.5">
                          <span className="text-lg font-black text-[#D4AF37]">1.199 ₺</span>
                          <span className="text-xs text-zinc-400 font-normal">/ ay</span>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[11px] font-bold text-amber-200/90 block">1.000 TL + KDV</span>
                        <span className="text-[10px] text-zinc-500">Google Play Faturalandırma</span>
                      </div>
                    </div>

                    {/* Payment CTA */}
                    <button
                      onClick={() => handleSubscribe(venue.id)}
                      disabled={processingVenueId === venue.id}
                      className="w-full py-3.5 rounded-xl font-black text-sm bg-gradient-to-r from-yellow-500 via-[#D4AF37] to-amber-600 text-black shadow-[0_0_20px_rgba(212,175,55,0.3)] active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {processingVenueId === venue.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Google Play ile İşleniyor...</span>
                        </>
                      ) : (
                        <>
                          <Store className="w-4 h-4" />
                          <span>
                            {isExpired ? '1.199 ₺ ile Başlat (1.000 TL + KDV)' : '1.199 ₺ ile 1 Ay Uzat (Google Play)'}
                          </span>
                        </>
                      )}
                    </button>

                    {/* Quick Tools */}
                    <div className="pt-2 border-t border-white/5 flex items-center justify-end text-xs text-zinc-400">
                      <button
                        onClick={() => handleCopyPanelLink(venue.slug)}
                        className="hover:text-white flex items-center gap-1.5 py-1.5 px-3 rounded-xl bg-white/5 hover:bg-white/10 transition-colors cursor-pointer text-xs"
                      >
                        <Copy className="w-3.5 h-3.5 text-[#D4AF37]" />
                        <span>Kafe Paneli Linkini Kopyala</span>
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              <div className="py-8 text-center space-y-3 bg-white/5 rounded-2xl p-6 border border-white/5">
                <Store className="w-12 h-12 text-[#D4AF37]/60 mx-auto" />
                <div>
                  <h4 className="font-bold text-white text-sm">Henüz Bağlı Bir Mekanınız Yok</h4>
                  <p className="text-xs text-zinc-400 mt-1 max-w-xs mx-auto">
                    Kafeni hesabına bağlayarak mobilden kolayca abonelik ödemesi yapabilir ve durumunu takip edebilirsin.
                  </p>
                </div>
                <button
                  onClick={() => setIsLinking(true)}
                  className="py-2.5 px-5 rounded-xl gold-gradient-bg text-black font-black text-xs inline-flex items-center gap-1.5 active:scale-95 transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Mekanımı Hesabıma Bağla
                </button>
              </div>
            )}

            {/* Link Venue Form (Collapsible) */}
            {isLinking && (
              <form onSubmit={handleLinkVenue} className="bg-black/60 border border-[#D4AF37]/30 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-[#D4AF37]" /> Mekan Bağlama
                  </h4>
                  <button
                    type="button"
                    onClick={() => setIsLinking(false)}
                    className="text-zinc-500 hover:text-white"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Kafe Paneli Kullanıcı Adı</label>
                  <input
                    type="text"
                    value={linkUsername}
                    onChange={(e) => setLinkUsername(e.target.value)}
                    placeholder="Kafe kullanıcı adınız (örn: demokafe)"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:border-[#D4AF37] focus:outline-none"
                    required
                  />
                </div>

                <div>
                  <label className="text-[11px] text-zinc-400 block mb-1">Kafe Paneli Şifresi</label>
                  <input
                    type="password"
                    value={linkPassword}
                    onChange={(e) => setLinkPassword(e.target.value)}
                    placeholder="Kafe giriş şifreniz"
                    className="w-full px-3 py-2 rounded-xl bg-white/5 border border-white/10 text-white text-xs focus:border-[#D4AF37] focus:outline-none"
                    required
                  />
                </div>

                <button
                  type="submit"
                  disabled={linkSubmitting}
                  className="w-full py-2.5 rounded-xl gold-gradient-bg text-black font-black text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {linkSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Giriş Yap ve Mekanı Bağla'}
                </button>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
