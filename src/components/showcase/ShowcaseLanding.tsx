'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  QrCode,
  ArrowRight,
  ExternalLink,
  MessageCircle,
  CheckCircle2,
  ChevronDown,
  Menu,
  X,
  Loader2,
  ShieldCheck,
  Music2,
  Disc3,
  Volume2,
  Sliders,
  Check,
  Store,
  Clock,
  Zap,
  Navigation,
  Headphones,
  CheckCheck,
  ThumbsUp,
  Building2,
  AlertCircle,
  Coffee
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export const ShowcaseLanding: React.FC = () => {
  // Mobile Navigation State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // FAQ Accordion State (first item open by default)
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Interactive Live Jukebox Simulator State (Patron experience demo)
  const [demoVotes, setDemoVotes] = useState<Record<string, number>>({
    'song-1': 8,
    'song-2': 5,
    'song-3': 3,
  });
  const [userVotedSong, setUserVotedSong] = useState<string | null>(null);

  const handleVoteDemo = (songId: string) => {
    if (userVotedSong === songId) {
      setDemoVotes((prev) => ({ ...prev, [songId]: prev[songId] - 1 }));
      setUserVotedSong(null);
    } else {
      setDemoVotes((prev) => ({
        ...prev,
        [songId]: prev[songId] + 1,
        ...(userVotedSong ? { [userVotedSong]: prev[userVotedSong] - 1 } : {}),
      }));
      setUserVotedSong(songId);
    }
  };

  // Lead Form State
  const [partnerForm, setPartnerForm] = useState({
    venueName: '',
    contactPerson: '',
    phone: '',
    city: '',
    tableCount: '15',
    email: '',
  });
  const [submittingLead, setSubmittingLead] = useState(false);
  const [partnerSubmitted, setPartnerSubmitted] = useState(false);
  const [leadError, setLeadError] = useState<string | null>(null);

  // Smooth Scroll Navigation
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      const headerOffset = 84;
      const elementPosition = element.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - headerOffset;

      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
    }
    setMobileMenuOpen(false);
  };

  // Handle B2B Partner Lead Submit with Supabase Persistence
  const handlePartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerForm.venueName || !partnerForm.contactPerson || !partnerForm.phone) return;

    setSubmittingLead(true);
    setLeadError(null);

    try {
      const { error } = await supabase.from('field_venues').insert({
        name: partnerForm.venueName.trim(),
        manager_name: partnerForm.contactPerson.trim(),
        phone: partnerForm.phone.trim(),
        city: partnerForm.city.trim() || 'Belirtilmedi',
        address: partnerForm.email.trim() ? `E-posta: ${partnerForm.email.trim()} | Masa: ${partnerForm.tableCount}` : `Masa: ${partnerForm.tableCount} | Web Başvurusu`,
        status: 'yeni_basvuru',
        visit_notes: `Web sitesi (Beyaz Açık Tema Vitrin) üzerinden B2B ortaklık başvurusu. Masa sayısı: ${partnerForm.tableCount}, E-posta: ${partnerForm.email || 'Belirtilmedi'}`,
        package_price: 1500,
        last_visited_at: new Date().toISOString()
      });

      if (error) {
        console.error('Lead submission error:', error);
        // Fallback to mailto
        const subject = encodeURIComponent(`Mekan Ortaklığı Başvurusu: ${partnerForm.venueName}`);
        const body = encodeURIComponent(
          `Mekan Adı: ${partnerForm.venueName}\n` +
          `Yetkili: ${partnerForm.contactPerson}\n` +
          `Telefon: ${partnerForm.phone}\n` +
          `Şehir: ${partnerForm.city || 'Belirtilmedi'}\n` +
          `Masa Sayısı: ${partnerForm.tableCount}\n` +
          `E-posta: ${partnerForm.email || 'Belirtilmedi'}\n`
        );
        window.location.href = `mailto:destek@muzikors.com?subject=${subject}&body=${body}`;
      }

      setPartnerSubmitted(true);
    } catch (err: any) {
      console.error('Lead error:', err);
      setLeadError('Başvuru gönderilirken bir hata oluştu. Lütfen doğrudan kurumsal WhatsApp hattımızdan bize ulaşın.');
    } finally {
      setSubmittingLead(false);
    }
  };

  const faqs = [
    {
      q: 'Karekod müzik sistemi nedir?',
      a: 'Karekod müzik sistemi; bir karekodu telefon kamerasıyla okutunca doğrudan tarayıcıda açılan sosyal jukebox deneyimidir. Müşterinizin uygulama indirmesi gerekmez. Masadaki akrilik stantta bulunan QR kod okutulduğunda mekanınızın logosuyla açılır; misafirleriniz Spotify arşivi üzerinden şarkı seçer ve sıradaki parçaları masasıyla oylar.'
    },
    {
      q: 'Müşterilerimin herhangi bir uygulama indirmesi gerekir mi?',
      a: 'Kesinlikle hayır! Masadaki QR kodu standart telefon kamerasıyla okutmaları yeterlidir. Muzikors tamamen web tabanlı (PWA) çalıştığı için müşteriniz hiçbir uygulama yüklemeden, şifre girmeden 3 saniye içinde parçalarını sıraya ekleyebilir.'
    },
    {
      q: 'Mekanım küçük veya 3. nesil kahveci, bize uyar mı?',
      a: 'Müşterinin masada oturduğu her mekana uygundur: kafe, 3. nesil coffee shop, bar, pub, restoran, pastane, otel lobisi ve co-working alanları. Masa sayınız fiyatı değiştirmez; her masa için özel pleksi stant hazırlanır.'
    },
    {
      q: 'Müşteriler mekanımızın havasına uymayan şarkılar açarsa ne olur? (Vibe Guard)',
      a: 'Vibe Guard™ teknolojisi mekanınızın atmosfer sigortasıdır. Çalınabilecek müzik türlerini, sanatçıları veya Spotify çalma listesi sınırlarını Kafe Panelinden siz belirlersiniz. Mekanınızın tarzına uymayan parçalar arama sonuçlarında filtrelenir; ayrıca istemediğiniz herhangi bir şarkıyı panelden tek tıkla sıradan atlayabilirsiniz.'
    },
    {
      q: 'Fiyat ne kadar ve nasıl tahsil edilir?',
      a: 'Tüm Muzikors sisteminde sabit tek fiyat geçerlidir: Aylık 1.500 ₺ + %20 KDV (1.800 ₺ KDV dahil). Tahsilat üç aylık dönemlerle peşin alınır (3 x 1.500 = 4.500 ₺ + KDV). Masa sayınıza göre hazırlanan lazer kesim akrilik QR pleksileri, Kafe Yönetim Paneli ve sınırsız müşteri istekleri bu fiyata dahildir; kurulum ücreti veya cihaz maliyeti yoktur.'
    },
    {
      q: 'Karekod pleksiler masamıza nasıl gelir?',
      a: 'Başvurunuz onaylandıktan sonra masa sayınıza özel hazırlanan yüksek kaliteli, şeffaf akrilik masa stantları ve QR kod etiketleri kargoyla kapınıza teslim edilir. Vida, kablo, delme ya da montaj gerekmez; masaya koymanız yeterlidir.'
    },
    {
      q: 'Kafede şarkı istemek misafirler için ücretli mi?',
      a: 'Hayır, misafirler için tamamen ücretsizdir! Masadaki QR kodu okutan her müşteri şarkı seçebilir, sıraya ekleyebilir ve sıradaki şarkılara oy verebilir. Bireysel VIP abonelik ise yalnızca ekstra ayrıcalıklar (reklamsız deneyim, öncelikli istekler) isteyen kullanıcılar içindir; sistemde jeton veya kredi satışı kesinlikle yoktur.'
    }
  ];

  return (
    <div className="min-h-screen bg-white text-zinc-900 font-sans selection:bg-amber-400 selection:text-black antialiased overflow-x-hidden">
      
      {/* ── TOP NAV BAR (AÇIK TEMA) ────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/95 border-b border-zinc-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-zinc-900 flex items-center justify-center p-2 shadow-sm transition-transform group-hover:scale-105">
              <img
                src="/logo.png"
                alt="Muzikors Logo"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-black tracking-tight text-zinc-900 leading-none">
                Muzikors
              </span>
              <span className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest mt-1">
                İnteraktif Müzik
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-zinc-600">
            <a
              href="#nasil-calisir"
              onClick={(e) => scrollToSection(e, 'nasil-calisir')}
              className="hover:text-zinc-900 transition-colors cursor-pointer"
            >
              Nasıl Çalışır?
            </a>
            <a
              href="#ozellikler"
              onClick={(e) => scrollToSection(e, 'ozellikler')}
              className="hover:text-zinc-900 transition-colors cursor-pointer"
            >
              Özellikler
            </a>
            <a
              href="#fiyat"
              onClick={(e) => scrollToSection(e, 'fiyat')}
              className="hover:text-zinc-900 transition-colors cursor-pointer"
            >
              Fiyat
            </a>
            <a
              href="#sss"
              onClick={(e) => scrollToSection(e, 'sss')}
              className="hover:text-zinc-900 transition-colors cursor-pointer"
            >
              SSS
            </a>
            <a
              href="https://kafe.muzikors.com.tr"
              target="_blank"
              rel="noreferrer"
              className="hover:text-zinc-900 transition-colors inline-flex items-center gap-1"
            >
              <span>Kafe Girişi</span>
              <ExternalLink className="w-3 h-3 text-zinc-400" />
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* QR Okut (Patron direct scanner) */}
            <Link
              href="/qr"
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 text-xs font-bold text-zinc-800 transition-all active:scale-95 min-h-[42px]"
            >
              <QrCode className="w-4 h-4 text-zinc-900" />
              <span>QR Okut</span>
            </Link>

            {/* Satın Al / Ücretsiz Dene */}
            <a
              href="#hero-form"
              onClick={(e) => scrollToSection(e, 'hero-form')}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-zinc-900 hover:bg-black text-white font-bold text-xs transition-all shadow-sm active:scale-95 cursor-pointer min-h-[42px]"
            >
              <span>14 Gün Ücretsiz Dene</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-zinc-100 border border-zinc-200 text-zinc-700 hover:text-zinc-900 active:scale-95 min-h-[42px] min-w-[42px] flex items-center justify-center cursor-pointer"
              aria-label="Menüyü Aç"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-zinc-200 bg-white px-5 py-4 space-y-3 shadow-lg">
            <a
              href="#nasil-calisir"
              onClick={(e) => scrollToSection(e, 'nasil-calisir')}
              className="block text-sm font-bold text-zinc-700 hover:text-zinc-900 py-1.5"
            >
              Nasıl Çalışır?
            </a>
            <a
              href="#ozellikler"
              onClick={(e) => scrollToSection(e, 'ozellikler')}
              className="block text-sm font-bold text-zinc-700 hover:text-zinc-900 py-1.5"
            >
              Özellikler
            </a>
            <a
              href="#fiyat"
              onClick={(e) => scrollToSection(e, 'fiyat')}
              className="block text-sm font-bold text-zinc-700 hover:text-zinc-900 py-1.5"
            >
              Fiyat
            </a>
            <a
              href="#sss"
              onClick={(e) => scrollToSection(e, 'sss')}
              className="block text-sm font-bold text-zinc-700 hover:text-zinc-900 py-1.5"
            >
              Sıkça Sorulanlar (SSS)
            </a>
            <a
              href="https://kafe.muzikors.com.tr"
              target="_blank"
              rel="noreferrer"
              className="block text-sm font-bold text-zinc-700 hover:text-zinc-900 py-1.5"
            >
              Kafe Girişi (kafe.muzikors.com.tr)
            </a>
            <Link
              href="/privacy"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-bold text-zinc-500 hover:text-zinc-800 py-1.5"
            >
              Yasal Bilgiler &amp; KVKK
            </Link>
          </div>
        )}
      </header>

      {/* ── HERO SECTION (OYUNLUK BİLGİ VE KANCA DİLİ) ────────────────────────── */}
      <section className="relative pt-8 sm:pt-16 pb-14 sm:pb-24 border-b border-zinc-200/80 bg-gradient-to-b from-zinc-50/80 to-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
            
            {/* Sol Sütun: Değer Önermesi ve Sürtünmesiz Giriş */}
            <div className="lg:col-span-7 space-y-5 text-center lg:text-left">
              
              {/* Üst Kicker Rozeti */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-700 text-xs font-bold tracking-wide">
                <span className="w-2 h-2 rounded-full bg-emerald-500" />
                <span>Kafe, Bar ve Restoranlar İçin Karekodlu Müzik</span>
              </div>

              {/* Ana Başlık */}
              <h1 className="text-3xl sm:text-5xl font-black text-zinc-950 tracking-tight leading-[1.12]">
                Masana karekod koy, <br />
                <span className="text-zinc-900">müşterin çalan müziği yönetsin.</span>
              </h1>

              {/* Alt Metin (Oyunluk netliği) */}
              <p className="text-sm sm:text-base text-zinc-600 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Milyonlarca Spotify şarkısı, masa oylaması ve mekan atmosferini koruyan Vibe Guard™ koruması; <strong>uygulama yok, kurulum yok.</strong>
              </p>

              {/* Misafir Ayrıştırması (Patron vs. Mekan Sahibi İkilemini Çözen Kanca) */}
              <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200/80 max-w-xl mx-auto lg:mx-0 text-left flex items-start gap-2.5">
                <div className="p-1 rounded-md bg-amber-100 text-amber-800 shrink-0 mt-0.5">
                  <Coffee className="w-4 h-4" />
                </div>
                <div className="text-xs text-amber-950 leading-relaxed">
                  <strong>Misafir misin?</strong> Müzik sırası yalnızca masadaki karekod okutularak açılır. Masandaki akrilik stantta bulunan QR kodu kameranla taratarak sıraya şarkı ekleyebilirsin. · <Link href="/privacy" className="underline font-bold text-amber-900 hover:text-black">Aydınlatma Metni</Link>
                </div>
              </div>

              {/* CTA Buton Çifti */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 pt-2">
                <a
                  href="#hero-form"
                  onClick={(e) => scrollToSection(e, 'hero-form')}
                  className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-zinc-900 hover:bg-black text-white font-black text-sm flex items-center justify-center gap-2 shadow-sm active:scale-95 transition-all cursor-pointer min-h-[46px]"
                >
                  <span>14 Gün Ücretsiz Başla</span>
                  <ArrowRight className="w-4 h-4" />
                </a>

                <a
                  href="#nasil-calisir"
                  onClick={(e) => scrollToSection(e, 'nasil-calisir')}
                  className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-white hover:bg-zinc-100 border border-zinc-300 text-zinc-800 font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all min-h-[46px]"
                >
                  <span>Nasıl Çalışır?</span>
                </a>

                <Link
                  href="/qr"
                  className="w-full sm:w-auto px-5 py-3.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 font-bold text-sm flex items-center justify-center gap-2 active:scale-95 transition-all min-h-[46px]"
                >
                  <QrCode className="w-4 h-4 text-emerald-700" />
                  <span>Masa QR&apos;ı Okut</span>
                </Link>
              </div>

              {/* Alt Güven Vurguları */}
              <div className="pt-2 flex flex-wrap items-center justify-center lg:justify-start gap-4 text-xs font-semibold text-zinc-500">
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                  <span>Cihaz / donanım gerekmez</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                  <span>Akrilik QR pleksiler kargoyla gelir</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 stroke-[3]" />
                  <span>Kredi kartı gerekmez</span>
                </span>
              </div>

            </div>

            {/* Sağ Sütun: Canlı Masadaki Telefon Deneyimi Simülatörü */}
            <div className="lg:col-span-5 flex justify-center w-full">
              <div className="w-full max-w-[380px] bg-white rounded-2xl border-2 border-zinc-200 shadow-xl overflow-hidden p-4 space-y-4">
                
                {/* Mekan Başlığı & Canlı Göstergesi */}
                <div className="flex items-center justify-between pb-3 border-b border-zinc-100">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-bold text-xs shadow-sm">
                      <Store className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-black text-zinc-900">Kadıköy Demo Kafe</h4>
                      <p className="text-[10px] text-zinc-500 font-medium">Masa #04 · Canlı Sıra</p>
                    </div>
                  </div>
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
                    Canlı
                  </span>
                </div>

                {/* Şu An Çalan Parça */}
                <div className="p-3.5 rounded-xl bg-zinc-900 text-white space-y-2 shadow-sm">
                  <div className="flex items-center justify-between text-[10px] font-bold text-zinc-400 uppercase tracking-wider">
                    <span>Şu An Çalıyor</span>
                    <span className="text-emerald-400 flex items-center gap-1">
                      <Volume2 className="w-3 h-3" /> Hoparlörde
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-lg bg-zinc-800 flex items-center justify-center text-zinc-400 shrink-0 border border-white/10">
                      <Music2 className="w-5 h-5 text-amber-400" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <h5 className="text-xs font-bold text-white truncate">Get Lucky (feat. Pharrell Williams)</h5>
                      <p className="text-[11px] text-zinc-400 truncate">Daft Punk</p>
                    </div>
                  </div>
                  {/* Mini Progress */}
                  <div className="w-full bg-zinc-800 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-amber-400 h-full w-2/3 rounded-full" />
                  </div>
                </div>

                {/* Sırada Bekleyen Şarkılar (Canlı Oylama Test Alanı) */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-[11px] font-bold text-zinc-500 px-1">
                    <span>Sıradaki Parçalar (Canlı Oylama)</span>
                    <span className="text-[10px] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                      Test Et &amp; Oy Ver
                    </span>
                  </div>

                  {/* Demo Song 1 */}
                  <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/90 flex items-center justify-between gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-zinc-200 flex items-center justify-center shrink-0">
                      <Disc3 className="w-4 h-4 text-zinc-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-zinc-900 truncate">Kuzu Kuzu</p>
                      <p className="text-[10px] text-zinc-500 truncate">Tarkan</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleVoteDemo('song-1')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        userVotedSong === 'song-1'
                          ? 'bg-amber-500 text-black shadow-sm'
                          : 'bg-white hover:bg-zinc-100 border border-zinc-300 text-zinc-800'
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{demoVotes['song-1']}</span>
                    </button>
                  </div>

                  {/* Demo Song 2 */}
                  <div className="p-2.5 rounded-xl bg-zinc-50 border border-zinc-200/90 flex items-center justify-between gap-2.5">
                    <div className="w-8 h-8 rounded-lg bg-zinc-200 flex items-center justify-center shrink-0">
                      <Disc3 className="w-4 h-4 text-zinc-700" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-bold text-zinc-900 truncate">Blinding Lights</p>
                      <p className="text-[10px] text-zinc-500 truncate">The Weeknd</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleVoteDemo('song-2')}
                      className={`px-3 py-1.5 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-all cursor-pointer ${
                        userVotedSong === 'song-2'
                          ? 'bg-amber-500 text-black shadow-sm'
                          : 'bg-white hover:bg-zinc-100 border border-zinc-300 text-zinc-800'
                      }`}
                    >
                      <ThumbsUp className="w-3.5 h-3.5" />
                      <span>{demoVotes['song-2']}</span>
                    </button>
                  </div>
                </div>

                {/* Alt Mikro Not */}
                <p className="text-[10px] text-center text-zinc-500 pt-1">
                  En çok oy alan şarkı sıranın başına tırmanır, hoparlörden çalar.
                </p>

              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 3 ADIMLI YOLCULUK (01 - 02 - 03 OYUNLUK ŞABLONU) ─────────────────── */}
      <section id="nasil-calisir" className="py-14 sm:py-24 border-b border-zinc-200/80 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-2">
              Nasıl Çalışır?
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-zinc-950 tracking-tight">
              3 Adımda Mekanında Canlı Müzik
            </h2>
            <p className="text-sm text-zinc-600 mt-2">
              Karmaşık kablolar, pahalı cihazlar ve eleman eğitimi yok.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Adım 01 */}
            <div className="bg-zinc-50 rounded-2xl p-6 sm:p-8 border border-zinc-200/90 hover:border-zinc-300 transition-all space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-mono font-black text-base shadow-sm">
                01
              </div>
              <h3 className="text-lg font-black text-zinc-900">
                Karekodların masana gelir
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                Masa sayın kadar lazer kesim akrilik pleksi stant kargoyla kapına gelir. Kurulum ücreti yok, vidalama yok; masaya koyman yeter.
              </p>
            </div>

            {/* Adım 02 */}
            <div className="bg-zinc-50 rounded-2xl p-6 sm:p-8 border border-zinc-200/90 hover:border-zinc-300 transition-all space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-mono font-black text-base shadow-sm">
                02
              </div>
              <h3 className="text-lg font-black text-zinc-900">
                Müşterin okutur, parçayı seçer
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                Uygulama indirmeden Spotify kataloğundan dilediği şarkıyı arar, mekanının logosu ve Wi-Fi bilgisiyle açılan sayfadan sıraya ekler.
              </p>
            </div>

            {/* Adım 03 */}
            <div className="bg-zinc-50 rounded-2xl p-6 sm:p-8 border border-zinc-200/90 hover:border-zinc-300 transition-all space-y-4 shadow-sm">
              <div className="w-12 h-12 rounded-xl bg-zinc-900 text-white flex items-center justify-center font-mono font-black text-base shadow-sm">
                03
              </div>
              <h3 className="text-lg font-black text-zinc-900">
                Sen panelden yönetirsin
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                Vibe Guard™ ile uygunsuz türleri filtrelersin; hangi şarkıların sevildiğini görür, istenmeyen şarkıyı tek dokunuşla atlayıp kontrolü sağlarsın.
              </p>
            </div>

          </div>

          <div className="pt-10 text-center">
            <a
              href="#hero-form"
              onClick={(e) => scrollToSection(e, 'hero-form')}
              className="inline-flex items-center gap-2 text-xs font-black text-zinc-900 hover:text-black uppercase tracking-wider underline cursor-pointer"
            >
              <span>Mekanına Özel 14 Günlük Ücretsiz Denemeyi Başlat</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          </div>

        </div>
      </section>

      {/* ── BENTO BİLGİ PANELLERİ (OYUNLUK BİLGİ MİMARİSİ) ─────────────────────── */}
      <section id="ozellikler" className="py-14 sm:py-24 border-b border-zinc-200/80 bg-zinc-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-2">
              Ayrı Ayrı Satılmaz
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-zinc-950 tracking-tight">
              Masanızdaki Aynı Karekod Hepsini Açar
            </h2>
            <p className="text-sm text-zinc-600 mt-2">
              Masa stantları, Spotify entegrasyonu ve yönetim paneli tek bir çatı altında.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            
            {/* Panel 1: Masaya koy, bitti */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-zinc-200/90 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-800">
                <Store className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-zinc-900">Masaya koy, bitti</h3>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                Pleksiler kargoyla adresinize gelir. Cihaz maliyeti, kablolama, ek ekran yatırımı ve eleman eğitimi yoktur.
              </p>
            </div>

            {/* Panel 2: Boş saatte masada bir sebep */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-zinc-200/90 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-800">
                <Coffee className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-zinc-900">Boş saatte masada bir sebep</h3>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                Öğleden sonra veya sakin saatlerde oturan müşterinin masasında etkileşim kuracağı bir sebep olur; masa enerjinin merkezi haline gelir.
              </p>
            </div>

            {/* Panel 3: Tekrar gelen müşteri & Adisyon */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-zinc-200/90 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-800">
                <Clock className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-zinc-900">Masada kalma süresinde artış</h3>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                Kendi şarkısının çalmasını bekleyen ve sıradaki parçaları masasıyla oylayan misafirler mekanda daha uzun süre kalır, ek sipariş verir.
              </p>
            </div>

            {/* Panel 4: Vibe Guard */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-zinc-200/90 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-800">
                <ShieldCheck className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-base font-black text-zinc-900">Vibe Guard™ ile tarzın güvende</h3>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                Rock kafede arabesk, caz barda uygunsuz müzik çalmaz. İzin verilen türleri ve çalma listelerini siz belirlersiniz.
              </p>
            </div>

            {/* Panel 5: Mekanının adıyla açılır */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-zinc-200/90 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-800">
                <Building2 className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-zinc-900">Senin mekanının adıyla açılır</h3>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                Müşteri QR kodu okuttuğunda sayfa mekanınızın logosu, adı ve Wi-Fi şifresiyle açılır; kurumsal prestijiniz artar.
              </p>
            </div>

            {/* Panel 6: Garson & Personel Rahatlığı */}
            <div className="bg-white rounded-2xl p-6 sm:p-7 border border-zinc-200/90 shadow-sm space-y-3">
              <div className="w-10 h-10 rounded-xl bg-zinc-100 flex items-center justify-center text-zinc-800">
                <Headphones className="w-5 h-5" />
              </div>
              <h3 className="text-base font-black text-zinc-900">Personel müzik baskısından kurtulur</h3>
              <p className="text-xs sm:text-sm text-zinc-600 leading-relaxed">
                Garsonların veya baristaların telefondan şarkı değiştirme baskısı biter. Personel yalnızca siparişe ve kaliteli servise odaklanır.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ── ŞEFFAF FİYATLANDIRMA (1500 TL + KDV SABİT / 3 AYLIK PEŞİN) ──────── */}
      <section id="fiyat" className="py-14 sm:py-24 border-b border-zinc-200/80 bg-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-2">
              Şeffaf Fiyatlandırma
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-zinc-950 tracking-tight">
              Tek Fiyat. Bütün Özellikler Dahil.
            </h2>
            <p className="text-sm text-zinc-600 mt-2">
              Kurulum ücreti yok. Donanım masrafı yok. İlk 14 gün tamamen ücretsiz deneyin.
            </p>
          </div>

          {/* Fiyat Kartı (Oyunluk Şablonu) */}
          <div className="max-w-xl mx-auto bg-zinc-50 rounded-3xl border-2 border-zinc-300/80 p-6 sm:p-10 shadow-lg space-y-6">
            
            {/* Üst Vurgu */}
            <div className="flex items-center justify-between pb-6 border-b border-zinc-200">
              <div>
                <span className="inline-block px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold mb-1">
                  Kurumsal Kafe Paketi
                </span>
                <h3 className="text-xl sm:text-2xl font-black text-zinc-900">Muzikors Standart</h3>
              </div>
              <div className="text-right">
                <div className="text-2xl sm:text-4xl font-black text-zinc-950 tracking-tight">
                  ₺1.500 <span className="text-xs sm:text-sm font-bold text-zinc-500 font-normal">+ KDV</span>
                </div>
                <div className="text-[11px] text-zinc-500 mt-0.5">
                  %20 KDV dahil ₺1.800 / Ay
                </div>
              </div>
            </div>

            {/* Tahsilat ve Koşul Notu */}
            <div className="p-3.5 rounded-xl bg-white border border-zinc-200 text-xs text-zinc-700 space-y-1">
              <div className="font-bold text-zinc-900 flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Tahsilat 3 Aylık Dönemlerle Peşin Alınır</span>
              </div>
              <p className="text-zinc-500 text-[11px] leading-relaxed">
                3 aylık toplam ödeme: ₺4.500 + KDV (₺5.400 KDV Dahil). Ne seçerseniz seçin bütün özellikler, masa pleksileri ve Kafe Paneli dahildir.
              </p>
            </div>

            {/* Dahil Olan Özellikler Listesi */}
            <div className="space-y-3 pt-2">
              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-zinc-800">
                  Masa sayınız kadar lazer kazımalı akrilik QR pleksi stantları kapınıza teslim
                </span>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-zinc-800">
                  Spotify entegrasyonu ve sınırsız müşteri şarkı isteği &amp; oylama kuyruğu
                </span>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-zinc-800">
                  Vibe Guard™ Müzik ve Tür Filtresi (Uygunsuz şarkıları otomatik engelleme)
                </span>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-zinc-800">
                  Gelişmiş Kafe Yönetim Paneli (kafe.muzikors.com.tr) &amp; Anlık Şarkı Atlama (Skip)
                </span>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-5 h-5 rounded-md bg-emerald-100 text-emerald-800 flex items-center justify-center shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
                <span className="text-xs sm:text-sm font-semibold text-zinc-800">
                  7/24 Doğrudan Kurumsal WhatsApp &amp; E-posta Destek Hattı
                </span>
              </div>
            </div>

            {/* Aksiyon Butonu */}
            <div className="pt-4">
              <a
                href="#hero-form"
                onClick={(e) => scrollToSection(e, 'hero-form')}
                className="w-full py-4 rounded-xl bg-zinc-900 hover:bg-black text-white font-black text-sm flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md cursor-pointer"
              >
                <span>14 Gün Ücretsiz Denemeyi Başlat</span>
                <ArrowRight className="w-4 h-4" />
              </a>
              <p className="text-[11px] text-center text-zinc-500 mt-2">
                14 gün boyunca hiçbir taahhüt ve ücret yoktur.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ── B2B BAŞVURU FORMU (#hero-form) ─────────────────────────────────── */}
      <section id="hero-form" className="py-14 sm:py-24 border-b border-zinc-200/80 bg-zinc-50/60 scroll-mt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-zinc-200 shadow-xl space-y-6">
            
            <div className="border-b border-zinc-100 pb-5 text-center sm:text-left">
              <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-1">
                İşletme Başvurusu
              </span>
              <h3 className="text-xl sm:text-3xl font-black text-zinc-950 tracking-tight">
                Mekanınızı Muzikors ile Tanıştırın
              </h3>
              <p className="text-xs sm:text-sm text-zinc-600 mt-1">
                Bilgilerinizi bırakın, 14 günlük ücretsiz denemenizi başlatalım ve akrilik pleksi stantlarınızı hazırlayalım.
              </p>
            </div>

            {leadError && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{leadError}</span>
              </div>
            )}

            {partnerSubmitted ? (
              <div className="text-center py-8 sm:py-12 space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 border border-emerald-300 flex items-center justify-center mx-auto text-emerald-700 shadow-sm">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h4 className="text-lg font-black text-zinc-900">
                  Başvurunuz Başarıyla Kaydedildi!
                </h4>
                <p className="text-xs sm:text-sm text-zinc-600 max-w-md mx-auto leading-relaxed">
                  Talebiniz ekibimize ulaştı. 24 saat içinde sizinle telefon üzerinden iletişime geçip akrilik QR kiti ve panel aktivasyonunuzu tamamlayacağız.
                </p>
                <div className="pt-3">
                  <a
                    href="https://wa.me/905068638306?text=Merhaba%20Muzikors,%20web%20sitenizden%20mekan%20ba%C5%9Fvurusu%20yapt%C4%B1m.%20Kurulum%20i%C3%A7in%20bilgi%20almak%20istiyorum."
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-emerald-600 text-white text-xs font-bold hover:bg-emerald-700 transition-all active:scale-95 shadow-sm min-h-[46px]"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>Hızlı Aktivasyon İçin WhatsApp&apos;tan Yazın</span>
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePartnerSubmit} className="space-y-4">
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="venue-name" className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                      Mekan Adı *
                    </label>
                    <input
                      id="venue-name"
                      type="text"
                      required
                      value={partnerForm.venueName}
                      onChange={(e) => setPartnerForm({ ...partnerForm, venueName: e.target.value })}
                      placeholder="Örn: Moda Sahne Cafe"
                      className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 focus:bg-white transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-person" className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                      Yetkili Adı Soyadı *
                    </label>
                    <input
                      id="contact-person"
                      type="text"
                      required
                      value={partnerForm.contactPerson}
                      onChange={(e) => setPartnerForm({ ...partnerForm, contactPerson: e.target.value })}
                      placeholder="Ad Soyad"
                      className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 focus:bg-white transition-all font-medium"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="phone" className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                      Telefon Numarası *
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      required
                      value={partnerForm.phone}
                      onChange={(e) => setPartnerForm({ ...partnerForm, phone: e.target.value })}
                      placeholder="05XX XXX XX XX"
                      className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 focus:bg-white transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label htmlFor="city" className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                      Şehir / İlçe *
                    </label>
                    <input
                      id="city"
                      type="text"
                      required
                      value={partnerForm.city}
                      onChange={(e) => setPartnerForm({ ...partnerForm, city: e.target.value })}
                      placeholder="Örn: İstanbul / Kadıköy"
                      className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 focus:bg-white transition-all font-medium"
                    />
                  </div>

                  <div>
                    <label htmlFor="table-count" className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                      Masa Sayısı (Pleksi İçin)
                    </label>
                    <input
                      id="table-count"
                      type="number"
                      min={1}
                      max={200}
                      value={partnerForm.tableCount}
                      onChange={(e) => setPartnerForm({ ...partnerForm, tableCount: e.target.value })}
                      placeholder="15"
                      className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 focus:bg-white transition-all font-medium"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="email" className="block text-[11px] font-bold text-zinc-700 uppercase tracking-wider mb-1.5">
                    E-posta Adresi (İsteğe Bağlı)
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={partnerForm.email}
                    onChange={(e) => setPartnerForm({ ...partnerForm, email: e.target.value })}
                    placeholder="iletisim@mekan.com"
                    className="w-full bg-zinc-50 border border-zinc-300 rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-zinc-900 placeholder-zinc-400 focus:outline-none focus:border-zinc-900 focus:bg-white transition-all font-medium"
                  />
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submittingLead}
                    className="w-full py-3.5 rounded-xl bg-zinc-900 hover:bg-black disabled:opacity-50 text-white font-black text-sm transition-all shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2 min-h-[46px]"
                  >
                    {submittingLead ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Başvuru İletiliyor...</span>
                      </>
                    ) : (
                      <>
                        <span>Ücretsiz Başvuru Gönder</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                <p className="text-[11px] text-zinc-500 text-center pt-1">
                  Bilgileriniz Gizlilik Politikamız ve KVKK kapsamında korunur. Doğrudan WhatsApp hattımız: <span className="font-bold text-zinc-800 font-mono">0506 863 83 06</span>
                </p>

              </form>
            )}

          </div>

        </div>
      </section>

      {/* ── SSS (SIKÇA SORULAN SORULAR) ACCORDION ──────────────────────────── */}
      <section id="sss" className="py-14 sm:py-24 border-b border-zinc-200/80 bg-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest block mb-2">
              Merak Edilenler
            </span>
            <h2 className="text-2xl sm:text-4xl font-black text-zinc-950 tracking-tight">
              Sıkça Sorulan Sorular
            </h2>
            <p className="text-sm text-zinc-600 mt-2">
              Muzikors sistemi, akrilik pleksi kiti ve kafe paneli hakkında aklınıza takılanlar.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="bg-zinc-50 rounded-2xl border border-zinc-200/90 overflow-hidden transition-colors shadow-sm"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer active:bg-zinc-100 min-h-[48px]"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm sm:text-base font-bold text-zinc-900">{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-zinc-600 transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-xs sm:text-sm text-zinc-600 leading-relaxed border-t border-zinc-200/60 pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── FOOTER (AÇIK TEMA) ──────────────────────────────────────────────── */}
      <footer className="bg-zinc-50 pt-12 pb-16 text-zinc-600 border-t border-zinc-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 pb-10 border-b border-zinc-200">
            
            {/* Marka & Tanım */}
            <div className="md:col-span-6 lg:col-span-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-zinc-900 flex items-center justify-center p-1.5 shadow-sm">
                  <img src="/logo.png" alt="Muzikors Logo" className="w-full h-full object-contain" />
                </div>
                <span className="text-base font-black text-zinc-950 tracking-tight">Muzikors İnteraktif Müzik</span>
              </div>
              <p className="text-xs text-zinc-600 leading-relaxed max-w-sm">
                Muzikors; kafe, bar ve restoranlarda misafirlerin dinlenen müziğe ortaklaşa karar verdiği interaktif sosyal müzik kutusu altyapısıdır.
              </p>
              <div className="text-[11px] text-zinc-500 space-y-0.5 pt-1">
                <div>&copy; {new Date().getFullYear()} Muzikors. Tüm hakları saklıdır.</div>
                <div>Geliştirici &amp; Kurucu: <strong className="text-zinc-800 font-semibold">Yunus Emre Gedik</strong></div>
              </div>
            </div>

            {/* Yasal & Güvenlik */}
            <div className="md:col-span-3 lg:col-span-4 space-y-2">
              <span className="text-xs font-bold text-zinc-900 block uppercase tracking-wider mb-2">
                Yasal Bilgiler &amp; Güvenlik
              </span>
              <ul className="space-y-1 text-xs">
                <li>
                  <Link href="/privacy" className="inline-flex items-center py-1 text-zinc-600 hover:text-zinc-950 transition-colors">
                    KVKK ve Gizlilik Politikası
                  </Link>
                </li>
                <li>
                  <Link href="/legal/terms" className="inline-flex items-center py-1 text-zinc-600 hover:text-zinc-950 transition-colors">
                    Kullanıcı Hizmet Sözleşmesi
                  </Link>
                </li>
                <li>
                  <Link href="/legal/refund" className="inline-flex items-center py-1 text-zinc-600 hover:text-zinc-950 transition-colors">
                    Abonelik İptal &amp; İade Koşulları
                  </Link>
                </li>
                <li>
                  <Link href="/delete-account" className="inline-flex items-center py-1 text-zinc-500 hover:text-zinc-900 transition-colors">
                    Hesap ve Veri Silme Talebi
                  </Link>
                </li>
              </ul>
            </div>

            {/* İletişim & Destek */}
            <div className="md:col-span-3 space-y-2">
              <span className="text-xs font-bold text-zinc-900 block uppercase tracking-wider mb-2">
                İletişim &amp; Destek
              </span>
              <ul className="space-y-1.5 text-xs">
                <li>
                  <a href="mailto:destek@muzikors.com" className="inline-flex items-center text-zinc-700 hover:text-zinc-950 font-mono font-medium transition-colors">
                    destek@muzikors.com
                  </a>
                </li>
                <li>
                  <a
                    href="https://wa.me/905068638306"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-emerald-700 font-bold hover:underline"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp: 0506 863 83 06</span>
                  </a>
                </li>
                <li>
                  <span className="text-[11px] text-zinc-500 block pt-1">
                    Haftanın 7 Günü: 10:00 - 02:00
                  </span>
                </li>
              </ul>
            </div>

          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-[11px] text-zinc-500 gap-2">
            <span>Muzikors Türkiye · İstanbul</span>
            <div className="flex items-center gap-4">
              <a href="https://kafe.muzikors.com.tr" target="_blank" rel="noreferrer" className="hover:text-zinc-900 font-bold">
                Kafe Yönetim Paneli
              </a>
              <a href="https://admin.muzikors.com.tr" target="_blank" rel="noreferrer" className="hover:text-zinc-900 font-bold">
                Admin Panel
              </a>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
};
