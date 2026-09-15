'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';
import {
  X,
  Check,
  Crown,
  Ghost,
  ThumbsUp,
  Music,
  ArrowUpCircle,
  ShieldOff,
  Loader2,
  RefreshCw,
  Zap,
  Clock,
  Store,
  Building2,
  QrCode,
  ShieldCheck,
  MessageCircle,
  ExternalLink,
  ChevronRight,
  AlertCircle,
  SlidersHorizontal,
  Volume2,
} from 'lucide-react';
import { iapService } from '../services/iapService';

interface VenueApplicationData {
  id?: number;
  venue_name: string;
  manager_name: string;
  phone: string;
  city: string;
  district: string;
  full_address: string;
  table_count: number;
  venue_type: string;
  sound_system: string;
  has_copyright_license: string;
  disclaimer_accepted: boolean;
  instagram?: string;
  plan_type: 'monthly' | 'annual';
  status?: 'pending' | 'approved' | 'rejected' | 'expired';
  expires_at?: string;
}

export const PremiumModal: React.FC = () => {
  const { activeModal, closeModal, user, setUser, showToast } = useApp();
  const [activeTab, setActiveTab] = useState<'bireysel' | 'kurumsal'>('bireysel');
  const [isProcessing, setIsProcessing] = useState(false);

  // Kurumsal plan state
  const [selectedCafePlan, setSelectedCafePlan] = useState<'monthly' | 'annual'>('annual');
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [myApplication, setMyApplication] = useState<any | null>(null);
  const [myVenue, setMyVenue] = useState<any | null>(null);
  const [isLoadingApp, setIsLoadingApp] = useState(false);

  // Survey Form state
  const [formData, setFormData] = useState<VenueApplicationData>({
    venue_name: '',
    manager_name: '',
    phone: '',
    city: '',
    district: '',
    full_address: '',
    table_count: 12,
    venue_type: 'Kafe',
    sound_system: 'Bilgisayar / Laptop',
    has_copyright_license: 'var',
    disclaimer_accepted: false,
    instagram: '',
    plan_type: 'annual',
  });
  const [isSubmittingForm, setIsSubmittingForm] = useState(false);
  const [formError, setFormError] = useState('');

  const refreshUser = async () => {
    if (!user?.id) return;
    try {
      const { data } = await supabase.from('profiles').select('*').eq('id', user.id).single();
      if (data) {
        setUser((prev: any) => ({
          ...prev,
          isPremium: data.is_premium === true,
          premium_until: data.premium_until || null,
          premium_activated_at: data.premium_activated_at || null,
        }));
      }
    } catch (e) {
      console.error('[PremiumModal refreshUser error]', e);
    }
  };

  const loadVenueApplication = async () => {
    if (!user?.id) return;
    setIsLoadingApp(true);
    try {
      const { data, error } = await supabase.rpc('get_my_venue_application');
      if (!error && data?.success) {
        setMyApplication(data.application || null);
        setMyVenue(data.venue || null);
      }
    } catch (e) {
      console.error('[loadVenueApplication error]', e);
    } finally {
      setIsLoadingApp(false);
    }
  };

  useEffect(() => {
    if (activeModal === 'premium') {
      loadVenueApplication();
      iapService.initialize(
        async () => {
          showToast('Tebrikler! Satın alım başarıyla tamamlandı.');
          await refreshUser();
          await loadVenueApplication();
          closeModal();
        },
        (err) => {
          showToast(err || 'Ödeme tamamlanamadı.');
        }
      );
    }
  }, [activeModal, closeModal, showToast]);

  if (activeModal !== 'premium') return null;

  const handleSubscribeBireysel = async () => {
    if (!user) {
      showToast('Abonelik başlatmak için lütfen önce giriş yapın.');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await iapService.subscribe();
      if (!res.success && res.message) {
        showToast(res.message);
      }
    } catch (e: any) {
      showToast(e.message || 'Ödeme başlatılamadı.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSubscribeVenue = async () => {
    if (!user) {
      showToast('Abonelik başlatmak için lütfen önce giriş yapın.');
      return;
    }

    if (!myVenue?.id) {
      showToast('Onaylanmış bir mekan kaydı bulunamadı.');
      return;
    }

    setIsProcessing(true);
    try {
      const res = await iapService.subscribeVenue(myVenue.id, selectedCafePlan);
      if (!res.success && res.message) {
        showToast(res.message);
      }
    } catch (e: any) {
      showToast(e.message || 'Kafe aboneliği başlatılamadı.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRestore = async () => {
    showToast('Satın alımlar kontrol ediliyor...');
    try {
      await iapService.restore();
      await refreshUser();
      await loadVenueApplication();
    } catch (e) {
      showToast('Satın alım geri yüklenemedi.');
    }
  };

  const handleOpenSurvey = () => {
    if (!user) {
      showToast('Lütfen önce hesabınıza giriş yapın.');
      return;
    }
    setFormData((prev) => ({
      ...prev,
      manager_name: prev.manager_name || user.name || '',
      plan_type: selectedCafePlan,
    }));
    setShowSurveyModal(true);
  };

  const handleSubmitSurvey = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.venue_name.trim()) {
      setFormError('Lütfen işletme/mekan adını girin.');
      return;
    }
    if (!formData.phone.trim()) {
      setFormError('Lütfen yetkili iletişim telefon numarasını girin.');
      return;
    }
    if (!formData.city.trim() || !formData.district.trim() || !formData.full_address.trim()) {
      setFormError('Lütfen il, ilçe ve açık adres bilgilerini eksiksiz girin.');
      return;
    }
    if (!formData.disclaimer_accepted) {
      setFormError('Lütfen umuma açık müzik yayını yasal sorumluluk beyanını onaylayın.');
      return;
    }

    setIsSubmittingForm(true);
    try {
      const { data, error } = await supabase.rpc('submit_venue_application', {
        p_venue_name: formData.venue_name.trim(),
        p_manager_name: formData.manager_name.trim(),
        p_phone: formData.phone.trim(),
        p_city: formData.city.trim(),
        p_district: formData.district.trim(),
        p_full_address: formData.full_address.trim(),
        p_table_count: Number(formData.table_count) || 10,
        p_venue_type: formData.venue_type,
        p_sound_system: formData.sound_system,
        p_has_copyright_license: formData.has_copyright_license,
        p_disclaimer_accepted: formData.disclaimer_accepted,
        p_instagram: formData.instagram ? formData.instagram.trim() : null,
        p_plan_type: selectedCafePlan,
      });

      if (error) throw error;

      if (data?.success) {
        showToast('Başvurunuz alındı! Ekibimiz 14 gün içinde onaylayacaktır.');
        setShowSurveyModal(false);
        await loadVenueApplication();
      } else {
        setFormError(data?.error || 'Başvuru gönderilemedi.');
      }
    } catch (err: any) {
      console.error('[handleSubmitSurvey error]', err);
      setFormError(err.message || 'Bağlantı hatası oluştu.');
    } finally {
      setIsSubmittingForm(false);
    }
  };

  const bireyselBenefits = [
    {
      icon: <Zap className="w-5 h-5 text-amber-400" />,
      title: "Bekleme Süresi Yok (0 sn Cooldown)",
      description: "Standart 4 dakikalık bekleme süresi olmadan arka arkaya dilediğiniz gibi şarkı ekleyin."
    },
    {
      icon: <Clock className="w-5 h-5 text-sky-400" />,
      title: "7 Dakikaya Kadar Şarkı Açabilme",
      description: "Standart 4 dakika sınırı yerine 7 dakikaya kadar epik parçaları ve konser kayıtlarını çalın."
    },
    {
      icon: <Music className="w-5 h-5 text-white" />,
      title: "Günlük 5 Şarkı İsteme Hakkı",
      description: "Standart 2 şarkı yerine her gün 5 farklı şarkı ekleme özgürlüğü."
    },
    {
      icon: <ArrowUpCircle className="w-5 h-5 text-emerald-400" />,
      title: "Günde 1 VIP Boost (Sıranın Başına Geç)",
      description: "Günde 1 kez şarkınızı anında sıranın en başına fırlatın."
    },
    {
      icon: <ShieldOff className="w-5 h-5 text-red-400" />,
      title: "Şarkı Veto Yetkisi",
      description: "Günde 1 kez beğenmediğiniz şarkıyı sıradan silme yetkisi."
    },
    {
      icon: <ThumbsUp className="w-5 h-5 text-blue-400" />,
      title: "15 Beğeni / Oy Hakkı",
      description: "Şarkılara daha fazla oy verin, favorilerinizi destekleyin."
    },
    {
      icon: <Ghost className="w-5 h-5 text-neutral-400" />,
      title: "Hayalet Modu",
      description: "İsminiz görünmeden tamamen 'Anonim' olarak şarkı ekleyin."
    },
    {
      icon: <Crown className="w-5 h-5 text-amber-400" />,
      title: "VIP Rozeti & Özel Profil",
      description: "Profilde, akışta ve liderlik tablosunda özel VIP statüsü."
    }
  ];

  const kurumsalBenefits = [
    {
      icon: <Store className="w-5 h-5 text-amber-400" />,
      title: "Canlı Dijital Jukebox & Masa Sırası",
      description: "Müşterileriniz masadaki QR kodu okutarak anında sıraya şarkı ekler, mekanınızın enerjisi yükselir."
    },
    {
      icon: <QrCode className="w-5 h-5 text-sky-400" />,
      title: "Yüksek Çözünürlüklü Baskıya Hazır Masa QR'ları",
      description: "Sistemden anında indirebileceğiniz masa numaralı vektörel QR kodları ile sıfır bekleme süresi."
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-emerald-400" />,
      title: "Müzik Moderasyonu & Şarkı Sansürü",
      description: "Mekanınıza uygun olmayan şarkıları tek tıkla engelleyin, tür ve süre sınırlarını dilediğiniz gibi belirleyin."
    },
    {
      icon: <Volume2 className="w-5 h-5 text-purple-400" />,
      title: "Spotify & Mevcut Ses Sistemiyle Uyumlu",
      description: "Ek donanım gerekmez; bilgisayar, tablet veya telefonunuzu amfiye bağlayarak hemen kullanın."
    },
    {
      icon: <Building2 className="w-5 h-5 text-blue-400" />,
      title: "TV Canlı Sıra Ekran Modu",
      description: "Mekanınızın televizyonunda çalan parçayı, sıradaki şarkıları ve mekan adınızı şık bir görselle yansıtın."
    },
    {
      icon: <Clock className="w-5 h-5 text-amber-300" />,
      title: "Akıllı Mekan Analitiği & Zirve Saatleri",
      description: "En çok istek alan sanatçılar, müşteri sadakati ve en hareketli saatler panelinizde raporlanır."
    }
  ];

  // Calculate days left for application expiration
  const getDaysLeft = (expiresAtStr?: string) => {
    if (!expiresAtStr) return 14;
    const diff = new Date(expiresAtStr).getTime() - Date.now();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-3 landscape:p-2 selection:bg-amber-400 selection:text-black">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="absolute inset-0 bg-black/85 backdrop-blur-sm"
          onClick={closeModal}
        />

        {/* Modal Container */}
        <motion.div
          initial={{ scale: 0.96, opacity: 0, y: 12 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.96, opacity: 0, y: 12 }}
          transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
          className="relative w-full max-w-lg landscape:max-w-3xl bg-neutral-950 text-white rounded-xl overflow-hidden shadow-[0_25px_65px_rgba(0,0,0,0.95)] border border-white/10 flex flex-col max-h-[92vh]"
        >
          {/* Header & Segmented Switch */}
          <div className="relative p-5 pb-3 border-b border-white/[0.08] bg-neutral-900/60">
            <button 
              onClick={closeModal}
              className="absolute top-3 right-3 p-2 bg-white/[0.05] hover:bg-white/[0.1] rounded-lg text-neutral-400 hover:text-white transition-colors cursor-pointer"
              aria-label="Kapat"
            >
              <X className="w-4 h-4" />
            </button>

            <div className="flex items-center gap-2 mb-3">
              <div className="p-1.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400">
                <Crown className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-base font-black text-white tracking-tight uppercase">
                  Muzikors Premium
                </h2>
                <p className="text-[11px] text-neutral-400">
                  Deneyiminizi yükseltecek ayrıcalıklı paketler
                </p>
              </div>
            </div>

            {/* Segmented Control */}
            <div className="grid grid-cols-2 p-1 bg-black/60 rounded-lg border border-white/5">
              <button
                type="button"
                onClick={() => setActiveTab('bireysel')}
                className={`py-2 text-xs font-bold rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'bireysel'
                    ? 'bg-neutral-800 text-white shadow-sm border border-white/10'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Crown className="w-3.5 h-3.5 text-amber-400" />
                <span>Bireysel VIP</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveTab('kurumsal')}
                className={`py-2 text-xs font-bold rounded-md transition-all cursor-pointer flex items-center justify-center gap-1.5 ${
                  activeTab === 'kurumsal'
                    ? 'bg-neutral-800 text-white shadow-sm border border-white/10'
                    : 'text-neutral-400 hover:text-white'
                }`}
              >
                <Store className="w-3.5 h-3.5 text-emerald-400" />
                <span>Kurumsal (Kafe)</span>
              </button>
            </div>
          </div>

          {/* Modal Body */}
          <div className="p-5 overflow-y-auto custom-scrollbar flex-1 space-y-4">
            {activeTab === 'bireysel' ? (
              <>
                {/* Free Trial Badge */}
                <div className="flex items-center justify-between p-3 rounded-lg bg-amber-500/10 border border-amber-500/20">
                  <div className="flex items-center gap-2">
                    <div className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
                    <span className="text-xs font-black text-amber-300 uppercase tracking-wider">
                      İlk 3 Gün Ücretsiz Deneme
                    </span>
                  </div>
                  <span className="text-[11px] text-neutral-400">Sonrasında 60 TL / Ay</span>
                </div>

                {/* Benefits List */}
                <div className="space-y-2">
                  {bireyselBenefits.map((b, idx) => (
                    <div
                      key={idx}
                      className="flex gap-3 items-start bg-neutral-900/40 p-2.5 rounded-lg border border-white/5"
                    >
                      <div className="shrink-0 mt-0.5">{b.icon}</div>
                      <div>
                        <h3 className="text-xs font-bold text-white mb-0.5">{b.title}</h3>
                        <p className="text-[11px] text-neutral-400 leading-snug">{b.description}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <>
                {/* Kurumsal Header & Trial Callout */}
                <div className="p-3.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20 flex flex-col gap-1">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 text-[10px] font-black uppercase tracking-wider">
                      14 Gün Ücretsiz Deneme
                    </span>
                    <span className="text-[11px] text-neutral-300 font-semibold">
                      İşletmeler İçin Sıfır Risk
                    </span>
                  </div>
                  <p className="text-[11px] text-neutral-400 leading-relaxed mt-1">
                    Mekanınız için başvurunuzu yapın, onaylandığı an 14 gün boyunca kafe panelini, masa QR sistemini ve müzik sırasını ücretsiz kullanın.
                  </p>
                </div>

                {/* Monthly vs Annual Plan Selector */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Monthly Plan */}
                  <div
                    onClick={() => setSelectedCafePlan('monthly')}
                    className={`p-3.5 rounded-lg border cursor-pointer transition-all flex flex-col justify-between ${
                      selectedCafePlan === 'monthly'
                        ? 'bg-neutral-800/80 border-amber-400 shadow-md ring-1 ring-amber-400/50'
                        : 'bg-neutral-900/40 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-neutral-200">Aylık Plan</span>
                        {selectedCafePlan === 'monthly' && (
                          <div className="w-2 h-2 rounded-full bg-amber-400" />
                        )}
                      </div>
                      <div className="text-lg font-black text-white">700 TL <span className="text-[10px] font-normal text-neutral-400">/ Ay</span></div>
                    </div>
                    <p className="text-[10px] text-neutral-400 mt-2">
                      Dijital QR kodları sisteme dahildir.
                    </p>
                  </div>

                  {/* Annual Plan (10% Off + Free Kit) */}
                  <div
                    onClick={() => setSelectedCafePlan('annual')}
                    className={`p-3.5 rounded-lg border cursor-pointer transition-all relative flex flex-col justify-between ${
                      selectedCafePlan === 'annual'
                        ? 'bg-neutral-800/80 border-emerald-400 shadow-md ring-1 ring-emerald-400/50'
                        : 'bg-neutral-900/40 border-white/10 hover:border-white/20'
                    }`}
                  >
                    <div className="absolute -top-2.5 right-2 px-1.5 py-0.5 rounded bg-emerald-500 text-black text-[9px] font-black uppercase tracking-wider">
                      %10 Tasarruf
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-bold text-emerald-300">Yıllık Plan</span>
                        {selectedCafePlan === 'annual' && (
                          <div className="w-2 h-2 rounded-full bg-emerald-400" />
                        )}
                      </div>
                      <div className="text-lg font-black text-white">7.560 TL <span className="text-[10px] font-normal text-neutral-400">/ Yıl</span></div>
                      <span className="text-[10px] text-neutral-400">(Aylık 630 TL&apos;ye denk gelir)</span>
                    </div>
                    <div className="mt-2 pt-2 border-t border-white/5 text-[10px] text-emerald-300 font-bold flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 shrink-0" />
                      <span>Pleksi QR Stant Kiti Hediye</span>
                    </div>
                  </div>
                </div>

                {/* WhatsApp QR Stant Direct Line Card */}
                <div className="p-3 rounded-lg bg-neutral-900/60 border border-emerald-500/20 flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-md bg-emerald-500/10 text-emerald-400">
                      <MessageCircle className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-white">Fiziksel Pleksi Stant &amp; Sticker Kiti</h4>
                      <p className="text-[10px] text-neutral-400">
                        Aylık aboneler ve denemedekiler için IBAN ile doğrudan sipariş hattı.
                      </p>
                    </div>
                  </div>
                  <a
                    href="https://wa.me/905068638306?text=Merhaba%20Muzikors,%20kafem%20i%C3%A7in%20fiziksel%20pleksi%20QR%20stant%20ve%20sticker%20seti%20sat%C4%B1n%20almak%20istiyorum."
                    target="_blank"
                    rel="noreferrer"
                    className="shrink-0 px-3 py-2 rounded-md bg-emerald-500 hover:bg-emerald-400 text-black font-black text-[11px] flex items-center gap-1 transition-all active:scale-95 cursor-pointer shadow-sm"
                  >
                    <span>WhatsApp</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>

                {/* Benefits List */}
                <div className="space-y-2">
                  <div className="text-[11px] font-bold text-neutral-400 uppercase tracking-wider px-1">
                    Kafe Paneli Özellikleri
                  </div>
                  {kurumsalBenefits.map((b, idx) => (
                    <div
                      key={idx}
                      className="flex gap-3 items-start bg-neutral-900/40 p-2.5 rounded-lg border border-white/5"
                    >
                      <div className="shrink-0 mt-0.5">{b.icon}</div>
                      <div>
                        <h3 className="text-xs font-bold text-white mb-0.5">{b.title}</h3>
                        <p className="text-[11px] text-neutral-400 leading-snug">{b.description}</p>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Status Notice for Cafe Applications */}
                {myApplication && (
                  <div className="p-3 rounded-lg border text-xs space-y-1 bg-neutral-900/60 border-white/10">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white flex items-center gap-1.5">
                        <Store className="w-3.5 h-3.5 text-amber-400" />
                        {myApplication.venue_name}
                      </span>
                      {myApplication.status === 'pending' && (
                        <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-400 font-bold text-[10px] border border-amber-500/20">
                          İncelemede ({getDaysLeft(myApplication.expires_at)} gün kaldı)
                        </span>
                      )}
                      {myApplication.status === 'approved' && (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 font-bold text-[10px] border border-emerald-500/20">
                          Onaylandı
                        </span>
                      )}
                      {myApplication.status === 'expired' && (
                        <span className="px-2 py-0.5 rounded bg-red-500/10 text-red-400 font-bold text-[10px] border border-red-500/20">
                          Süresi Doldu
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-neutral-400">
                      {myApplication.status === 'pending' &&
                        'Başvuru anketiniz ekibimize ulaştı. 14 gün içinde onaylandığında buradan 14 günlük ücretsiz denemenizi başlatabileceksiniz.'}
                      {myApplication.status === 'approved' &&
                        'Tebrikler! Mekanınız onaylandı. Aşağıdaki butondan Google Play 14 günlük ücretsiz denemenizi başlatıp Kafe Panelini anında kullanabilirsiniz.'}
                      {myApplication.status === 'expired' &&
                        '14 günlük inceleme süresi dolmuştur. Dilerseniz formu tekrar güncelleyip gönderebilirsiniz.'}
                    </p>
                  </div>
                )}
              </>
            )}
          </div>

          {/* Footer & CTA Actions */}
          <div className="p-4 border-t border-white/[0.08] bg-neutral-900/60">
            {activeTab === 'bireysel' ? (
              <>
                <button
                  type="button"
                  onClick={handleSubscribeBireysel}
                  disabled={isProcessing}
                  className="w-full py-3 rounded-lg font-black text-xs bg-white text-black hover:bg-neutral-200 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-md"
                >
                  {isProcessing ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>İşleniyor...</span>
                    </>
                  ) : (
                    <>
                      <Crown className="w-4 h-4 text-amber-500" />
                      <span>3 Gün Ücretsiz Başlat</span>
                    </>
                  )}
                </button>

                <div className="flex items-center justify-between mt-2.5 px-1 text-[10px] text-neutral-400">
                  <span>Deneme sonrası 60 TL / Ay</span>
                  <button
                    type="button"
                    onClick={handleRestore}
                    className="text-amber-400 hover:underline flex items-center gap-1 cursor-pointer font-bold"
                  >
                    <RefreshCw className="w-2.5 h-2.5" />
                    Satın Alımı Geri Yükle
                  </button>
                </div>
              </>
            ) : (
              <>
                {/* Kurumsal CTAs according to application state */}
                {myVenue?.is_active ? (
                  <div className="space-y-2">
                    <a
                      href="https://kafe.muzikors.com.tr"
                      target="_blank"
                      rel="noreferrer"
                      className="w-full py-3 rounded-lg font-black text-xs bg-emerald-500 text-black hover:bg-emerald-400 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                    >
                      <Store className="w-4 h-4" />
                      <span>Kafe Paneline Git (kafe.muzikors.com.tr)</span>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                    <p className="text-[10px] text-center text-neutral-400">
                      Aboneliğiniz aktif. Web üzerinden Google hesabınızla giriş yapabilirsiniz.
                    </p>
                  </div>
                ) : myApplication?.status === 'approved' ? (
                  <button
                    type="button"
                    onClick={handleSubscribeVenue}
                    disabled={isProcessing}
                    className="w-full py-3 rounded-lg font-black text-xs bg-emerald-500 text-black hover:bg-emerald-400 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-md"
                  >
                    {isProcessing ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Google Play Başlatılıyor...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4 stroke-[3]" />
                        <span>14 Gün Ücretsiz Denemeyi Başlat</span>
                      </>
                    )}
                  </button>
                ) : myApplication?.status === 'pending' ? (
                  <button
                    type="button"
                    disabled
                    className="w-full py-3 rounded-lg font-bold text-xs bg-neutral-800 text-neutral-400 border border-white/5 flex items-center justify-center gap-2 cursor-not-allowed opacity-80"
                  >
                    <Clock className="w-4 h-4 text-amber-400" />
                    <span>Admin Onayı Bekleniyor</span>
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleOpenSurvey}
                    className="w-full py-3 rounded-lg font-black text-xs bg-white text-black hover:bg-neutral-200 active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer shadow-md"
                  >
                    <Store className="w-4 h-4" />
                    <span>14 Gün Ücretsiz Başlat (Kurulum Formu)</span>
                  </button>
                )}

                <p className="text-[9px] text-center text-neutral-500 mt-2">
                  14 gün deneme süresince hiçbir ücret tahsil edilmez. Google Play üzerinden dilediğiniz an iptal edebilirsiniz.
                </p>
              </>
            )}
          </div>
        </motion.div>

        {/* Survey Modal (Kafe Başvuru & Kurulum Anketi) */}
        {showSurveyModal && (
          <div className="fixed inset-0 z-[120] flex items-center justify-center p-3">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/90 backdrop-blur-md"
              onClick={() => !isSubmittingForm && setShowSurveyModal(false)}
            />

            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 15 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 15 }}
              className="relative w-full max-w-lg bg-neutral-950 text-white rounded-xl overflow-hidden shadow-2xl border border-white/10 flex flex-col max-h-[92vh]"
            >
              <div className="p-4 border-b border-white/10 flex items-center justify-between bg-neutral-900/50">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 rounded-md bg-emerald-500/10 text-emerald-400">
                    <Store className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">Kafe Başvuru &amp; Kurulum Formu</h3>
                    <p className="text-[10px] text-neutral-400">14 gün ücretsiz deneme aktivasyonu</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowSurveyModal(false)}
                  disabled={isSubmittingForm}
                  className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSubmitSurvey} className="p-4 overflow-y-auto custom-scrollbar space-y-3.5 text-xs flex-1">
                {formError && (
                  <div className="p-2.5 rounded-lg bg-red-500/10 border border-red-500/20 text-red-300 text-[11px] flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{formError}</span>
                  </div>
                )}

                {/* Plan reminder */}
                <div className="p-2.5 rounded-lg bg-neutral-900 border border-white/5 flex items-center justify-between text-[11px]">
                  <span className="text-neutral-400">Seçilen Plan:</span>
                  <span className="font-bold text-white">
                    {selectedCafePlan === 'annual' ? 'Yıllık Plan (7.560 TL / Yıl - Pleksi Kit Hediyeli)' : 'Aylık Plan (700 TL / Ay)'}
                  </span>
                </div>

                {/* Mekan Adı */}
                <div>
                  <label className="block text-[11px] font-bold text-neutral-300 mb-1">
                    İşletme / Mekan Adı *
                  </label>
                  <input
                    type="text"
                    required
                    value={formData.venue_name}
                    onChange={(e) => setFormData({ ...formData, venue_name: e.target.value })}
                    placeholder="Örn: Kadıköy Moda Coffee Bar"
                    className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 text-xs"
                  />
                </div>

                {/* Yetkili & Telefon */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-300 mb-1">
                      Yetkili Adı Soyadı *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.manager_name}
                      onChange={(e) => setFormData({ ...formData, manager_name: e.target.value })}
                      placeholder="Ad Soyad"
                      className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-300 mb-1">
                      İletişim Telefonu *
                    </label>
                    <input
                      type="tel"
                      required
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="05XX XXX XX XX"
                      className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 text-xs"
                    />
                  </div>
                </div>

                {/* İl & İlçe */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-300 mb-1">
                      İl *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.city}
                      onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                      placeholder="İstanbul"
                      className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-300 mb-1">
                      İlçe *
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.district}
                      onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                      placeholder="Kadıköy"
                      className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 text-xs"
                    />
                  </div>
                </div>

                {/* Açık Adres (Pleksi Stant Kargo & Fatura İçin) */}
                <div>
                  <label className="block text-[11px] font-bold text-neutral-300 mb-1">
                    Açık Adres (Pleksi QR Stant Kargosu &amp; Doğrulama İçin) *
                  </label>
                  <textarea
                    rows={2}
                    required
                    value={formData.full_address}
                    onChange={(e) => setFormData({ ...formData, full_address: e.target.value })}
                    placeholder="Mahalle, cadde, sokak, no..."
                    className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 text-xs resize-none"
                  />
                </div>

                {/* Masa Sayısı & Mekan Türü */}
                <div className="grid grid-cols-2 gap-2.5">
                  <div>
                    <label className="block text-[11px] font-bold text-neutral-300 mb-1">
                      Masa Sayısı *
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={500}
                      required
                      value={formData.table_count}
                      onChange={(e) => setFormData({ ...formData, table_count: parseInt(e.target.value) || 1 })}
                      className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/10 text-white focus:outline-none focus:border-white/30 text-xs"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-neutral-300 mb-1">
                      Mekan Türü
                    </label>
                    <select
                      value={formData.venue_type}
                      onChange={(e) => setFormData({ ...formData, venue_type: e.target.value })}
                      className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/10 text-white focus:outline-none focus:border-white/30 text-xs"
                    >
                      <option value="Kafe">Kafe / Coffee Shop</option>
                      <option value="Pub & Bar">Pub &amp; Bar</option>
                      <option value="Restoran">Restoran / Bistro</option>
                      <option value="Lounge">Lounge / Nargile</option>
                      <option value="Diger">Diğer</option>
                    </select>
                  </div>
                </div>

                {/* Müzik / Ses Sistemi Seçimi */}
                <div>
                  <label className="block text-[11px] font-bold text-neutral-300 mb-1">
                    Mevcut Müzik / Ses Çalma Sisteminiz
                  </label>
                  <select
                    value={formData.sound_system}
                    onChange={(e) => setFormData({ ...formData, sound_system: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/10 text-white focus:outline-none focus:border-white/30 text-xs"
                  >
                    <option value="Bilgisayar / Laptop">Bilgisayar / Laptop (AUX/Bluetooth ile amfiye bağlı)</option>
                    <option value="Tablet / Telefon">Tablet veya Telefon</option>
                    <option value="Harici Amfi / Mikser">Profesyonel Amfi / Ses Mikseri</option>
                    <option value="Akilli TV">Akıllı TV / Web Tarayıcısı</option>
                    <option value="Diger">Diğer</option>
                  </select>
                </div>

                {/* MESAM / MÜ-YAP Telif Lisans Beyanı */}
                <div>
                  <label className="block text-[11px] font-bold text-neutral-300 mb-1">
                    Müzik Meslek Birliği (MÜ-YAP / MESAM / MSG) Lisans Durumu
                  </label>
                  <select
                    value={formData.has_copyright_license}
                    onChange={(e) => setFormData({ ...formData, has_copyright_license: e.target.value })}
                    className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/10 text-white focus:outline-none focus:border-white/30 text-xs"
                  >
                    <option value="var">İşletmemizin Müzik Yayın Lisansı Mevcuttur</option>
                    <option value="surecte">Lisans Başvuru / Yenileme Aşamasındayız</option>
                    <option value="yok">Lisansımız Bulunmamaktadır / Bilgim Yok</option>
                  </select>
                </div>

                {/* Instagram (Opsiyonel) */}
                <div>
                  <label className="block text-[11px] font-bold text-neutral-300 mb-1">
                    İşletme Instagram Hesabı <span className="text-neutral-500 font-normal">(Opsiyonel)</span>
                  </label>
                  <input
                    type="text"
                    value={formData.instagram}
                    onChange={(e) => setFormData({ ...formData, instagram: e.target.value })}
                    placeholder="@mekanadi"
                    className="w-full px-3 py-2 rounded-lg bg-neutral-900 border border-white/10 text-white placeholder-neutral-500 focus:outline-none focus:border-white/30 text-xs"
                  />
                </div>

                {/* Yasal Sorumluluk Reddi (Disclaimer Checkbox) */}
                <div className="p-3 rounded-lg bg-black/60 border border-white/10">
                  <label className="flex items-start gap-2.5 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={formData.disclaimer_accepted}
                      onChange={(e) => setFormData({ ...formData, disclaimer_accepted: e.target.checked })}
                      className="mt-0.5 rounded bg-neutral-900 border-white/20 text-emerald-500 focus:ring-0 cursor-pointer"
                    />
                    <span className="text-[10px] text-neutral-400 leading-relaxed">
                      <b className="text-neutral-200">Yasal Beyan:</b> Muzikors&apos;un bir müzik sırası ve jukebox yazılım platformu olduğunu; mekan içi umuma açık mahallerde müzik yayını için gerekli meslek birliği (MÜ-YAP, MESAM, MSG) izin ve lisans yükümlülüklerinin müstakilen işletmemize ait olduğunu kabul ve beyan ederim.
                    </span>
                  </label>
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmittingForm}
                    className="w-full py-3 rounded-lg font-black text-xs bg-white text-black hover:bg-neutral-200 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:opacity-50 cursor-pointer shadow-md"
                  >
                    {isSubmittingForm ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Başvuru Kaydediliyor...</span>
                      </>
                    ) : (
                      <>
                        <Check className="w-4 h-4" />
                        <span>Başvuruyu Kaydet ve Gönder</span>
                      </>
                    )}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </div>
    </AnimatePresence>
  );
};
