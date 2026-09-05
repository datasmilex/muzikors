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
  Copy,
  ExternalLink,
  Loader2,
  Plus,
  ShieldCheck,
  Check,
  CreditCard,
  Lock,
  Sparkles,
  Info,
  Radio,
  ArrowRight,
  MapPin,
  Shield
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
          showToast('Tebrikler! Kafe aboneliğiniz başarıyla yenilendi.');
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
      showToast('Kafe paneli linki kopyalandı.');
    }
  };

  const handleOpenPanel = (slug: string) => {
    const url = `https://kafe.muzikors.com.tr/admin/${slug}`;
    if (typeof window !== 'undefined') {
      window.open(url, '_blank');
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
        showToast(`"${data?.venue_name || 'Mekan'}" başarıyla hesabınıza bağlandı.`);
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

  const formatDate = (isoString: string | null) => {
    if (!isoString) return 'Belirtilmedi';
    try {
      return new Date(isoString).toLocaleDateString('tr-TR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return isoString;
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="absolute inset-0 bg-black/85 backdrop-blur-md"
          onClick={closeModal}
        />

        <motion.div
          initial={{ scale: 0.92, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          style={{
            backgroundColor: 'var(--theme-bg)',
            borderColor: 'rgba(var(--theme-primary-rgb), 0.35)'
          }}
          className="relative w-full max-w-lg rounded-3xl overflow-hidden shadow-2xl border flex flex-col max-h-[92vh]"
        >
          {/* Header Banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, rgba(var(--theme-card-alt-rgb), 0.95) 0%, rgba(var(--theme-bg-rgb), 0.98) 100%)',
              borderBottomColor: 'rgba(var(--theme-primary-rgb), 0.2)'
            }}
            className="relative px-5 py-4.5 border-b flex items-center justify-between"
          >
            <div className="flex items-center gap-3">
              <div
                style={{
                  background: 'linear-gradient(135deg, var(--theme-primary-light) 0%, var(--theme-primary) 100%)',
                  boxShadow: '0 4px 15px var(--theme-glow)'
                }}
                className="w-11 h-11 rounded-2xl flex items-center justify-center text-stone-950 font-black shadow-lg"
              >
                <Store className="w-5 h-5 text-stone-950 stroke-[2.4]" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
                  İşletme & Abonelik Yönetimi
                </h2>
                <p
                  style={{ color: 'var(--theme-text-muted)' }}
                  className="text-[11px] font-medium"
                >
                  Mekan durumu, yayın kontrolü ve aylık faturalandırma
                </p>
              </div>
            </div>

            <button
              onClick={closeModal}
              className="w-8 h-8 rounded-full bg-white/5 hover:bg-white/10 text-white/70 hover:text-white flex items-center justify-center transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Body Content */}
          <div className="p-4 sm:p-5 overflow-y-auto custom-scrollbar space-y-4">
            {loading ? (
              <div className="py-14 flex flex-col items-center justify-center text-zinc-400 gap-3">
                <Loader2
                  style={{ color: 'var(--theme-primary)' }}
                  className="w-8 h-8 animate-spin"
                />
                <span className="text-xs font-medium">Mekan bilgileri getiriliyor...</span>
              </div>
            ) : venues.length > 0 ? (
              venues.map((venue) => {
                const isGrace = venue.subscription_status === 'grace_period';
                const isExpired = venue.subscription_status === 'expired';
                const isActive = venue.subscription_status === 'active';

                return (
                  <div
                    key={venue.id}
                    style={{
                      backgroundColor: 'rgba(var(--theme-card-rgb), 0.85)',
                      borderColor: 'rgba(var(--theme-primary-rgb), 0.28)'
                    }}
                    className="border rounded-2xl p-4 sm:p-5 space-y-4 shadow-xl relative overflow-hidden backdrop-blur-md"
                  >
                    {/* Top Venue Header Info */}
                    <div className="flex items-start justify-between gap-3 pb-3.5 border-b border-white/10">
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h3 className="font-black text-white text-base sm:text-lg">{venue.venue_name}</h3>
                          <span
                            style={{
                              backgroundColor: 'rgba(var(--theme-primary-rgb), 0.15)',
                              color: 'var(--theme-primary-light)',
                              borderColor: 'rgba(var(--theme-primary-rgb), 0.3)'
                            }}
                            className="text-[10px] px-2 py-0.5 rounded-md border font-mono font-bold"
                          >
                            /{venue.slug}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-xs text-zinc-400 mt-0.5">
                          <MapPin className="w-3 h-3 text-neutral-500 shrink-0" />
                          <span>{venue.district ? `${venue.district}, ${venue.city}` : 'Konum tanımlandı'}</span>
                        </div>
                      </div>

                      {/* Status Badges */}
                      {isActive && (
                        <div className="px-3 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider bg-emerald-500/15 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5 shrink-0 shadow-sm">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>{venue.remaining_days} Gün Aktif</span>
                        </div>
                      )}
                      {isGrace && (
                        <div className="px-3 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 shrink-0 animate-pulse">
                          <AlertTriangle className="w-3.5 h-3.5" />
                          <span>3G Tolerans</span>
                        </div>
                      )}
                      {isExpired && (
                        <div className="px-3 py-1 rounded-xl text-[11px] font-black uppercase tracking-wider bg-red-500/15 text-red-400 border border-red-500/30 flex items-center gap-1.5 shrink-0">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Kapalı / Pasif</span>
                        </div>
                      )}
                    </div>

                    {/* Expiration Alerts if needed */}
                    {isGrace && (
                      <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/35 text-amber-200 text-xs flex items-start gap-2.5">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block font-bold text-amber-300 mb-0.5">3 Günlük Ek Tolerans Süresindesiniz!</strong>
                          Aboneliğiniz bitti. Kafe yayınınızın kesilmemesi ve müşterilerinizin istek göndermeye devam edebilmesi için lütfen aboneliğinizi yenileyin.
                        </div>
                      </div>
                    )}
                    {isExpired && (
                      <div className="p-3.5 rounded-xl bg-red-500/10 border border-red-500/35 text-red-200 text-xs flex items-start gap-2.5">
                        <XCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                        <div>
                          <strong className="block font-bold text-red-300 mb-0.5">Abonelik Süresi Doldu (Yayın Durduruldu)</strong>
                          Mekanınız şu an pasif moddadır. Kafe panelini açmak ve istekleri tekrar başlatmak için tek tıkla yenileyebilirsiniz.
                        </div>
                      </div>
                    )}

                    {/* Subscription Details & Expiry Info */}
                    <div className="grid grid-cols-2 gap-2 text-xs">
                      <div
                        style={{
                          backgroundColor: 'rgba(var(--theme-card-alt-rgb), 0.65)',
                          borderColor: 'rgba(var(--theme-primary-rgb), 0.15)'
                        }}
                        className="p-3 rounded-xl border space-y-1"
                      >
                        <span
                          style={{ color: 'var(--theme-text-muted)' }}
                          className="text-[10px] font-bold uppercase tracking-wider block flex items-center gap-1"
                        >
                          <Calendar
                            style={{ color: 'var(--theme-primary)' }}
                            className="w-3 h-3"
                          /> Bitiş Tarihi
                        </span>
                        <span className="font-bold text-white block">
                          {formatDate(venue.subscription_until)}
                        </span>
                      </div>

                      <div
                        style={{
                          backgroundColor: 'rgba(var(--theme-card-alt-rgb), 0.65)',
                          borderColor: 'rgba(var(--theme-primary-rgb), 0.15)'
                        }}
                        className="p-3 rounded-xl border space-y-1"
                      >
                        <span
                          style={{ color: 'var(--theme-text-muted)' }}
                          className="text-[10px] font-bold uppercase tracking-wider block flex items-center gap-1"
                        >
                          <Radio
                            style={{ color: 'var(--theme-primary)' }}
                            className="w-3 h-3"
                          /> Panel Durumu
                        </span>
                        <span className={`font-bold block ${venue.is_active ? 'text-emerald-400' : 'text-red-400'}`}>
                          {venue.is_active ? '● Canlı & İstek Alıyor' : '○ Pasif / Kilitli'}
                        </span>
                      </div>
                    </div>

                    {/* Transparent B2B Pricing Card */}
                    <div
                      style={{
                        background: 'linear-gradient(135deg, rgba(var(--theme-primary-rgb), 0.12) 0%, rgba(var(--theme-card-alt-rgb), 0.75) 100%)',
                        borderColor: 'rgba(var(--theme-primary-rgb), 0.35)'
                      }}
                      className="p-4 rounded-2xl border space-y-3 shadow-inner"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="flex items-center gap-1.5">
                            <Sparkles
                              style={{ color: 'var(--theme-primary)' }}
                              className="w-3.5 h-3.5"
                            />
                            <span
                              style={{ color: 'var(--theme-primary-light)' }}
                              className="text-xs font-black uppercase tracking-wider"
                            >
                              Muzikors İşletme Paketi
                            </span>
                          </div>
                          <div className="flex items-baseline gap-1 mt-1">
                            <span className="text-2xl font-black text-white">1.199 ₺</span>
                            <span className="text-xs text-zinc-400">/ Ay</span>
                          </div>
                        </div>

                        <div className="text-right">
                          <span
                            style={{ color: 'var(--theme-primary)' }}
                            className="text-xs font-bold block"
                          >
                            1.000 TL + %20 KDV
                          </span>
                          <span className="text-[10px] text-zinc-400 flex items-center gap-1 justify-end mt-0.5">
                            <ShieldCheck className="w-3 h-3 text-emerald-400" /> Google Play Faturalı
                          </span>
                        </div>
                      </div>

                      {/* Included Features Checklist */}
                      <div className="pt-2.5 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-1.5 text-[11px] text-zinc-300">
                        <div className="flex items-center gap-1.5">
                          <Check
                            style={{ color: 'var(--theme-primary)' }}
                            className="w-3.5 h-3.5 shrink-0"
                          />
                          <span>Sınırsız Şarkı İstek Kuyruğu</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Check
                            style={{ color: 'var(--theme-primary)' }}
                            className="w-3.5 h-3.5 shrink-0"
                          />
                          <span>Masadan QR / Web ile Bağlantı</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Check
                            style={{ color: 'var(--theme-primary)' }}
                            className="w-3.5 h-3.5 shrink-0"
                          />
                          <span>Spotify ile Otomatik Çalma</span>
                        </div>
                        <div className="flex items-center gap-1.5">
                          <Check
                            style={{ color: 'var(--theme-primary)' }}
                            className="w-3.5 h-3.5 shrink-0"
                          />
                          <span>Küfür & Kara Liste Filtresi</span>
                        </div>
                      </div>
                    </div>

                    {/* Subscription CTA Button */}
                    <button
                      onClick={() => handleSubscribe(venue.id)}
                      disabled={processingVenueId === venue.id}
                      style={{
                        background: 'linear-gradient(135deg, var(--theme-primary-light) 0%, var(--theme-primary) 50%, var(--theme-primary-dark) 100%)',
                        boxShadow: '0 4px 20px var(--theme-glow)'
                      }}
                      className="w-full py-3.5 px-4 rounded-xl font-black text-sm text-stone-950 active:scale-[0.98] transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                    >
                      {processingVenueId === venue.id ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-stone-950" />
                          <span>Google Play Bağlanıyor...</span>
                        </>
                      ) : (
                        <>
                          <CreditCard className="w-4 h-4 text-stone-950" />
                          <span>
                            {isExpired
                              ? 'Aboneliği Başlat & Paneli Aç (1.199 ₺ / Ay)'
                              : '+30 Gün Süre Ekle / Yenile (1.199 ₺)'}
                          </span>
                        </>
                      )}
                    </button>

                    <p className="text-[10px] text-center text-zinc-400 flex items-center justify-center gap-1">
                      <Lock className="w-3 h-3 text-zinc-400" />
                      Google Play ile güvenli faturalandırma. İstediğiniz an tek tıkla iptal edebilirsiniz.
                    </p>

                    {/* Quick Panel Tools */}
                    <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-2 text-xs">
                      <button
                        onClick={() => handleCopyPanelLink(venue.slug)}
                        style={{
                          backgroundColor: 'rgba(var(--theme-card-alt-rgb), 0.6)',
                          borderColor: 'rgba(var(--theme-primary-rgb), 0.15)'
                        }}
                        className="flex-1 py-2 px-3 rounded-xl hover:bg-white/10 text-zinc-300 hover:text-white border transition-colors flex items-center justify-center gap-1.5 cursor-pointer text-xs font-bold"
                      >
                        <Copy
                          style={{ color: 'var(--theme-primary)' }}
                          className="w-3.5 h-3.5"
                        />
                        <span>Panel Linkini Kopyala</span>
                      </button>

                      <button
                        onClick={() => handleOpenPanel(venue.slug)}
                        style={{
                          backgroundColor: 'rgba(var(--theme-primary-rgb), 0.12)',
                          color: 'var(--theme-primary-light)',
                          borderColor: 'rgba(var(--theme-primary-rgb), 0.3)'
                        }}
                        className="flex-1 py-2 px-3 rounded-xl hover:opacity-90 border transition-all flex items-center justify-center gap-1.5 cursor-pointer text-xs font-bold"
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                        <span>Web Paneline Git</span>
                      </button>
                    </div>
                  </div>
                );
              })
            ) : (
              /* Zero Venues State */
              <div
                style={{
                  backgroundColor: 'rgba(var(--theme-card-rgb), 0.6)',
                  borderColor: 'rgba(var(--theme-primary-rgb), 0.2)'
                }}
                className="py-10 text-center space-y-4 rounded-2xl p-6 border"
              >
                <div
                  style={{
                    backgroundColor: 'rgba(var(--theme-primary-rgb), 0.12)',
                    borderColor: 'rgba(var(--theme-primary-rgb), 0.3)',
                    color: 'var(--theme-primary)'
                  }}
                  className="w-16 h-16 rounded-2xl border flex items-center justify-center mx-auto shadow-inner"
                >
                  <Store className="w-8 h-8 stroke-[1.8]" />
                </div>
                <div className="space-y-1">
                  <h4 className="font-black text-white text-base">Henüz Bağlı Bir Mekanınız Yok</h4>
                  <p
                    style={{ color: 'var(--theme-text-muted)' }}
                    className="text-xs max-w-xs mx-auto leading-relaxed"
                  >
                    Kafe panelinde kullandığınız kullanıcı adı ve şifrenizle giriş yaparak mekanınızı bağlayabilir, aboneliğinizi mobilden yönetebilirsiniz.
                  </p>
                </div>
                <button
                  onClick={() => setIsLinking(true)}
                  style={{
                    background: 'linear-gradient(135deg, var(--theme-primary-light) 0%, var(--theme-primary) 100%)',
                    boxShadow: '0 4px 15px var(--theme-glow)'
                  }}
                  className="py-3 px-6 rounded-xl text-stone-950 font-black text-xs inline-flex items-center gap-2 active:scale-95 transition-all cursor-pointer shadow-lg"
                >
                  <Plus className="w-4 h-4 stroke-[2.5]" />
                  Mekanımı Hesabıma Bağla
                </button>
              </div>
            )}

            {/* Bottom Add Another Venue Button if already has venues */}
            {venues.length > 0 && !isLinking && (
              <div className="pt-2 text-center">
                <button
                  onClick={() => setIsLinking(true)}
                  style={{ color: 'var(--theme-primary-light)' }}
                  className="text-xs font-bold hover:underline inline-flex items-center gap-1.5 py-2 px-3 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  Başka Bir Mekan Daha Bağla
                </button>
              </div>
            )}

            {/* Link Venue Form Modal / Box */}
            {isLinking && (
              <form
                onSubmit={handleLinkVenue}
                style={{
                  backgroundColor: 'rgba(var(--theme-card-alt-rgb), 0.95)',
                  borderColor: 'rgba(var(--theme-primary-rgb), 0.35)'
                }}
                className="border rounded-2xl p-4 sm:p-5 space-y-3.5 shadow-2xl animate-in fade-in backdrop-blur-md"
              >
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <div className="flex items-center gap-2">
                    <ShieldCheck
                      style={{ color: 'var(--theme-primary)' }}
                      className="w-4 h-4"
                    />
                    <h4 className="text-xs font-black text-white uppercase tracking-wider">
                      Kafe Girişi ile Mekan Bağlama
                    </h4>
                  </div>
                  <button
                    type="button"
                    onClick={() => setIsLinking(false)}
                    className="text-zinc-400 hover:text-white p-1 rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <p
                  style={{ color: 'var(--theme-text-muted)' }}
                  className="text-[11px]"
                >
                  Kafe panelinize (`kafe.muzikors.com.tr`) giriş yaparken kullandığınız bilgileri giriniz:
                </p>

                <div className="space-y-2.5">
                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                      Kafe Kullanıcı Adı
                    </label>
                    <input
                      type="text"
                      value={linkUsername}
                      onChange={(e) => setLinkUsername(e.target.value)}
                      placeholder="Örn: kadikoy-moda"
                      style={{
                        backgroundColor: 'rgba(var(--theme-bg-rgb), 0.6)',
                        borderColor: 'rgba(var(--theme-primary-rgb), 0.2)'
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border text-white text-xs placeholder-zinc-500 focus:outline-none transition-colors"
                      required
                    />
                  </div>

                  <div>
                    <label className="text-[10px] font-bold text-zinc-400 uppercase tracking-wider block mb-1">
                      Kafe Giriş Şifresi
                    </label>
                    <input
                      type="password"
                      value={linkPassword}
                      onChange={(e) => setLinkPassword(e.target.value)}
                      placeholder="••••••••"
                      style={{
                        backgroundColor: 'rgba(var(--theme-bg-rgb), 0.6)',
                        borderColor: 'rgba(var(--theme-primary-rgb), 0.2)'
                      }}
                      className="w-full px-3.5 py-2.5 rounded-xl border text-white text-xs placeholder-zinc-500 focus:outline-none transition-colors"
                      required
                    />
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    type="button"
                    onClick={() => setIsLinking(false)}
                    className="flex-1 py-2.5 rounded-xl bg-white/5 text-zinc-300 font-bold text-xs hover:bg-white/10 transition-colors"
                  >
                    Vazgeç
                  </button>
                  <button
                    type="submit"
                    disabled={linkSubmitting}
                    style={{
                      background: 'linear-gradient(135deg, var(--theme-primary-light) 0%, var(--theme-primary) 100%)',
                      boxShadow: '0 4px 15px var(--theme-glow)'
                    }}
                    className="flex-2 py-2.5 rounded-xl text-stone-950 font-black text-xs flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-md"
                  >
                    {linkSubmitting ? <Loader2 className="w-4 h-4 animate-spin text-stone-950" /> : 'Doğrula & Mekanı Bağla'}
                  </button>
                </div>
              </form>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
