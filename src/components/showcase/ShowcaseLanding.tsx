'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import {
  QrCode,
  Play,
  Volume2,
  ShieldCheck,
  Zap,
  Crown,
  Store,
  Smartphone,
  Headphones,
  ArrowRight,
  ExternalLink,
  ChevronRight,
  MessageCircle,
  Phone,
  CheckCircle2,
  Music,
  Radio,
  Users,
  Sliders,
  Check,
  Tv
} from 'lucide-react';

export const ShowcaseLanding: React.FC = () => {
  const [partnerForm, setPartnerForm] = useState({
    venueName: '',
    contactPerson: '',
    phone: '',
    email: '',
  });
  const [partnerSubmitted, setPartnerSubmitted] = useState(false);

  const handlePartnerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerForm.venueName || !partnerForm.contactPerson || !partnerForm.phone) return;

    const subject = encodeURIComponent(`Mekan Ortaklığı Başvurusu: ${partnerForm.venueName}`);
    const body = encodeURIComponent(
      `Mekan Adı: ${partnerForm.venueName}\n` +
      `Yetkili Adı Soyadı: ${partnerForm.contactPerson}\n` +
      `Telefon Numarası: ${partnerForm.phone}\n` +
      `E-posta: ${partnerForm.email || 'Belirtilmedi'}\n`
    );
    window.location.href = `mailto:destek@muzikors.com?subject=${subject}&body=${body}`;
    setPartnerSubmitted(true);
  };

  return (
    <div className="min-h-screen bg-[#070604] text-white font-sans selection:bg-[#E5A93C] selection:text-black antialiased overflow-x-hidden">
      
      {/* ── TOP NAV BAR ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#070604]/85 border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">
          
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-white/[0.04] border border-white/10 p-2 flex items-center justify-center group-hover:border-[#E5A93C]/50 transition-colors shadow-lg">
              <img src="/logo.png" alt="Muzikors Logo" className="w-full h-full object-contain" />
            </div>
            <div className="flex flex-col">
              <span className="text-lg font-black tracking-tight text-white flex items-center gap-1.5">
                Muzikors
                <span className="w-1.5 h-1.5 rounded-full bg-[#E5A93C]" />
              </span>
              <span className="text-[10px] font-bold text-[#E6C88B] uppercase tracking-widest -mt-0.5">
                Social Jukebox
              </span>
            </div>
          </Link>

          {/* Nav Links (Desktop) */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-neutral-400">
            <a href="#nasil-calisir" className="hover:text-white transition-colors">Nasıl Çalışır?</a>
            <a href="#ozellikler" className="hover:text-white transition-colors">Özellikler</a>
            <a href="#mekanlar" className="hover:text-white transition-colors">Mekanlar İçin</a>
            <a href="#guncellemeler" className="hover:text-white transition-colors">Yenilikler</a>
            <Link href="/privacy" className="hover:text-white transition-colors">Yasal Bilgiler</Link>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2.5 sm:gap-3">
            <Link
              href="/qr"
              className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-xs font-bold text-neutral-200 transition-all active:scale-95"
            >
              <QrCode className="w-3.5 h-3.5 text-[#E5A93C]" />
              <span>QR Okut</span>
            </Link>

            <Link
              href="/app"
              className="inline-flex items-center gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-[#E5A93C] hover:bg-[#F59E0B] text-black font-black text-xs transition-all shadow-[0_4px_20px_rgba(229,169,60,0.3)] active:scale-95 cursor-pointer"
            >
              <span>Uygulamayı Aç</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO SECTION ────────────────────────────────────────────────── */}
      <section className="relative pt-12 sm:pt-20 pb-16 sm:pb-28 overflow-hidden">
        {/* Subtle Radial Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[450px] bg-[radial-gradient(ellipse_at_center,_rgba(229,169,60,0.12),_transparent_70%)] pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Headlines and CTAs */}
            <div className="lg:col-span-7 space-y-6 sm:space-y-8 text-center lg:text-left">
              
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/[0.04] border border-[#E5A93C]/30 text-[11px] font-bold text-[#E6C88B]">
                <Radio className="w-3.5 h-3.5 text-[#E5A93C] animate-pulse" />
                <span>Mekanların İnteraktif Müzik Platformu</span>
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
                Mekanların Ritmini <br />
                <span className="text-[#E5A93C]">Sen Yönet.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-neutral-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Kafede, barda veya restoranda çalan müziğe doğrudan telefonundan yön ver. Masandaki QR kodu okut, Spotify kataloğundan dilediğin şarkıyı sıraya ekle ve mekanın atmosferine katıl.
              </p>

              {/* Primary Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-2">
                <Link
                  href="/app"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[#E5A93C] hover:bg-[#F59E0B] text-black font-black text-sm flex items-center justify-center gap-2.5 shadow-[0_10px_30px_rgba(229,169,60,0.25)] active:scale-95 transition-all cursor-pointer"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>Web Uygulamasını Başlat</span>
                </Link>

                <a
                  href="https://play.google.com/store/apps/details?id=com.muzikors.app"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 text-white font-bold text-sm flex items-center justify-center gap-2.5 active:scale-95 transition-all"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Google Play&apos;den İndir</span>
                </a>
              </div>

              {/* Quick Trust Highlights */}
              <div className="pt-4 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-neutral-400 font-medium">
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Ücretsiz Şarkı İsteği</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Spotify Entegrasyonu</span>
                </span>
                <span className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>Vibe Guard Koruması</span>
                </span>
              </div>
            </div>

            {/* Right Column: Realistic Smartphone UI Mock-up */}
            <div className="lg:col-span-5 flex justify-center lg:justify-end">
              <div className="relative w-[300px] sm:w-[320px] rounded-[42px] p-3.5 bg-gradient-to-b from-[#2A2420] via-[#141210] to-[#0A0908] border border-white/20 shadow-[0_25px_80px_rgba(0,0,0,0.9)]">
                
                {/* Screen Bezel Glass */}
                <div className="rounded-[32px] bg-[#0A0705] border border-white/10 overflow-hidden flex flex-col p-4 relative space-y-4">
                  
                  {/* Dynamic Island / Header */}
                  <div className="flex items-center justify-between border-b border-white/[0.08] pb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-black/50 border border-white/10 flex items-center justify-center p-1">
                        <Store className="w-3.5 h-3.5 text-[#E5A93C]" />
                      </div>
                      <div>
                        <span className="text-xs font-bold text-white block leading-none">Velvet Lounge</span>
                        <span className="text-[9px] text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                          Masa #4 • Canlı Sıra
                        </span>
                      </div>
                    </div>
                    <span className="px-2 py-0.5 rounded-md bg-[#E5A93C]/10 border border-[#E5A93C]/30 text-[9px] font-extrabold text-[#E5A93C]">
                      LIVE
                    </span>
                  </div>

                  {/* Mock Currently Playing */}
                  <div className="bg-[#17110C] rounded-2xl p-3 border border-white/[0.08] space-y-3 shadow-inner">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-white/10 flex items-center justify-center text-[#E5A93C] shrink-0 relative overflow-hidden">
                        <Music className="w-5 h-5" />
                        <div className="absolute inset-0 bg-gradient-to-tr from-[#E5A93C]/20 to-transparent" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <span className="text-xs font-bold text-white truncate block">Midnight City</span>
                        <span className="text-[10px] text-neutral-400 truncate block">M83</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <span className="w-1 h-3 bg-emerald-400 rounded-full animate-pulse" />
                        <span className="w-1 h-4 bg-emerald-400 rounded-full animate-pulse delay-75" />
                        <span className="w-1 h-2 bg-emerald-400 rounded-full animate-pulse delay-150" />
                      </div>
                    </div>

                    {/* Progress Bar */}
                    <div className="space-y-1">
                      <div className="w-full h-1 rounded-full bg-white/10 overflow-hidden">
                        <div className="w-[62%] h-full bg-[#E5A93C] rounded-full" />
                      </div>
                      <div className="flex justify-between text-[8px] text-neutral-500 font-mono">
                        <span>02:34</span>
                        <span>04:03</span>
                      </div>
                    </div>
                  </div>

                  {/* Mock Up Next Queue */}
                  <div className="space-y-2">
                    <span className="text-[10px] font-bold text-neutral-400 uppercase tracking-wider block px-1">
                      Sıradaki Parçalar (4)
                    </span>

                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-[10px] font-black text-neutral-500 w-3">1</span>
                          <div className="min-w-0">
                            <span className="text-[11px] font-bold text-neutral-200 truncate block">Get Lucky</span>
                            <span className="text-[9px] text-neutral-500 truncate block">Daft Punk</span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-lg bg-emerald-500/10 text-emerald-400 text-[10px] font-black border border-emerald-500/20">
                          14 Oy
                        </span>
                      </div>

                      <div className="flex items-center justify-between p-2 rounded-xl bg-white/[0.03] border border-white/[0.05]">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-[10px] font-black text-neutral-500 w-3">2</span>
                          <div className="min-w-0">
                            <span className="text-[11px] font-bold text-neutral-200 truncate block">Blinding Lights</span>
                            <span className="text-[9px] text-neutral-500 truncate block">The Weeknd</span>
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-lg bg-white/5 text-neutral-300 text-[10px] font-black border border-white/10">
                          9 Oy
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Mock Request Button */}
                  <div className="pt-2">
                    <Link
                      href="/app"
                      className="w-full py-2.5 rounded-xl bg-[#E5A93C] text-black font-black text-[11px] flex items-center justify-center gap-2 shadow-md hover:bg-[#F59E0B] transition-all cursor-pointer"
                    >
                      <Zap className="w-3.5 h-3.5 fill-black" />
                      <span>Şarkı İsteğinde Bulun</span>
                    </Link>
                  </div>

                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 3 ADIMDA NASIL ÇALIŞIR ──────────────────────────────────────── */}
      <section id="nasil-calisir" className="py-16 sm:py-24 border-t border-white/[0.06] bg-black/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#E5A93C]">Kusursuz Deneyim</h2>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              3 Adımda Mekanın Müzik Akışına Katıl
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400">
              Garson çağırmaya veya DJ kabinine gitmeye gerek yok. Tüm kontrol parmaklarının ucunda.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            
            {/* Step 1 */}
            <div className="bg-[#120D09] rounded-3xl p-6 sm:p-8 border border-white/[0.08] relative group hover:border-[#E5A93C]/40 transition-colors space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#E5A93C]/10 border border-[#E5A93C]/30 flex items-center justify-center text-[#E5A93C] font-black text-lg">
                1
              </div>
              <h4 className="text-base sm:text-lg font-bold text-white">Masadaki QR&apos;ı Okut</h4>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Masanızdaki Muzikors QR kodunu telefonunuzun kamerasıyla veya web tarayıcınızdan tarayın. Uygulama otomatik olarak bulunduğunuz kafeye bağlanır.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#120D09] rounded-3xl p-6 sm:p-8 border border-white/[0.08] relative group hover:border-[#E5A93C]/40 transition-colors space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#E5A93C]/10 border border-[#E5A93C]/30 flex items-center justify-center text-[#E5A93C] font-black text-lg">
                2
              </div>
              <h4 className="text-base sm:text-lg font-bold text-white">Parçanı Seç &amp; Sırala</h4>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Spotify entegrasyonu sayesinde milyonlarca şarkı arasından dilediğini ara. İstediğin parçayı mekanın çalma listesine anında gönder veya sıradakilere oy ver.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#120D09] rounded-3xl p-6 sm:p-8 border border-white/[0.08] relative group hover:border-[#E5A93C]/40 transition-colors space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#E5A93C]/10 border border-[#E5A93C]/30 flex items-center justify-center text-[#E5A93C] font-black text-lg">
                3
              </div>
              <h4 className="text-base sm:text-lg font-bold text-white">Atmosferi Yönet</h4>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Şarkın sırası geldiğinde mekanın ses sisteminde çalmaya başlasın. İstek durumunu canlı takip et, masadaki arkadaşlarınla birlikte ritmi belirle.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── ÖNE ÇIKAN ÖZELLİKLER ────────────────────────────────────────── */}
      <section id="ozellikler" className="py-16 sm:py-24 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#E5A93C]">Güçlü Altyapı</h2>
            <h3 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              Sosyal &amp; Akıllı Jukebox Deneyimi
            </h3>
            <p className="text-xs sm:text-sm text-neutral-400">
              Muzikors, sıradan bir istek panosu değildir. Mekan kalitesini artıran ve kullanıcıyı eğlendiren modern bir ekosistemdir.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Feature 1: Vibe Guard */}
            <div className="p-6 rounded-3xl bg-[#120D09] border border-white/[0.08] space-y-3.5 hover:border-amber-500/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#E5A93C]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">Vibe Guard Koruması</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Mekanın akustik kimliğini korur. Mekan sahibinin belirlediği müzik tarzlarına uymayan uygunsuz parçalar akıllıca engellenir.
              </p>
            </div>

            {/* Feature 2: VIP Abonelik */}
            <div className="p-6 rounded-3xl bg-[#120D09] border border-white/[0.08] space-y-3.5 hover:border-amber-500/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#E5A93C]">
                <Crown className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">Muzikors VIP Ayrıcalığı</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Kredi satışı yoktur! Tek bir Google Play VIP aboneliğiyle bekleme süresiz istek hakkı, öncelikli sıra ve özel profil rozetleri kazanın.
              </p>
            </div>

            {/* Feature 3: Gerçek Zamanlı Oylama */}
            <div className="p-6 rounded-3xl bg-[#120D09] border border-white/[0.08] space-y-3.5 hover:border-amber-500/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#E5A93C]">
                <Zap className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">Canlı Sıra ve Oylama</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Masa arkadaşlarınla kuyruktaki parçalara oy ver. En çok oy alan şarkı otomatik olarak öne geçsin ve sıradaki parça olsun.
              </p>
            </div>

            {/* Feature 4: TV Modu */}
            <div className="p-6 rounded-3xl bg-[#120D09] border border-white/[0.08] space-y-3.5 hover:border-amber-500/30 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#E5A93C]">
                <Tv className="w-5 h-5" />
              </div>
              <h4 className="text-base font-bold text-white">Büyük Ekran TV Yayını</h4>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Mekanın televizyon ekranında çalan parça, sıradaki şarkılar ve QR kodu büyük formatta canlı olarak akar.
              </p>
            </div>

          </div>
        </div>
      </section>

      {/* ── MEKANLAR İÇİN MUZIKORS (B2B SECTION) ────────────────────────── */}
      <section id="mekanlar" className="py-16 sm:py-24 border-t border-white/[0.06] bg-gradient-to-b from-black/60 to-[#0C0805]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Info */}
            <div className="lg:col-span-6 space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-[11px] font-bold text-emerald-400">
                <Store className="w-3.5 h-3.5" />
                <span>İşletmeler ve Kafe Sahipleri İçin</span>
              </div>

              <h3 className="text-3xl sm:text-4xl font-black text-white tracking-tight leading-tight">
                Kafenizde Müzik Karmaşasına Son Verin.
              </h3>

              <p className="text-sm text-neutral-300 leading-relaxed font-normal">
                Müşterilerinizin sürekli çalma listesine müdahale etmesinden, garsonlara şarkı sormasından yoruldunuz mu? Muzikors ile mekanınızda profesyonel, kontrollü ve interaktif bir müzik ortamı kurun.
              </p>

              <div className="space-y-3 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#E5A93C]/10 border border-[#E5A93C]/40 flex items-center justify-center text-[#E5A93C] shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-white block">Spotify BYOK (Bring Your Own Key)</strong>
                    <span className="text-[11px] text-neutral-400">Mevcut Spotify Premium hesabınızı sisteme bağlayın, ek donanım almadan 2 dakikada yayına başlayın.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#E5A93C]/10 border border-[#E5A93C]/40 flex items-center justify-center text-[#E5A93C] shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-white block">Masa QR Stantları ve Menü Entegrasyonu</strong>
                    <span className="text-[11px] text-neutral-400">Özel tasarım akrilik masa stantlarımızla müşterileriniz doğrudan dijital menünüze ve jukebox sistemine ulaşır.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#E5A93C]/10 border border-[#E5A93C]/40 flex items-center justify-center text-[#E5A93C] shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-white block">Gelişmiş Kafe Yönetim Paneli</strong>
                    <span className="text-[11px] text-neutral-400">İstenmeyen parçaları anında atlayın (skip), müzik türlerini filtreleyin ve anlık dinleyici istatistiklerini izleyin.</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <a
                  href="https://kafe.muzikors.com.tr"
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#E5A93C] hover:underline"
                >
                  <span>Mevcut Ortak mısınız? Kafe Yönetim Paneline Giriş Yap</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Right Contact / Application Form */}
            <div className="lg:col-span-6">
              <div className="bg-[#140F0B] rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-5">
                <div className="border-b border-white/10 pb-4">
                  <h4 className="text-lg font-bold text-white">Mekan Ortaklığı Başvurusu</h4>
                  <p className="text-xs text-neutral-400 mt-0.5">Bilgilerinizi bırakın, ekibimiz kurulum için sizinle 24 saat içinde iletişime geçsin.</p>
                </div>

                {partnerSubmitted ? (
                  <div className="text-center py-8 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h5 className="text-sm font-bold text-white">Başvurunuz Alındı!</h5>
                    <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                      Mekan ortaklığı talebiniz ekibimize ulaştı. En kısa sürede telefon ile iletişime geçeceğiz.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handlePartnerSubmit} className="space-y-3.5">
                    <div>
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Mekan Adı *</label>
                      <input
                        type="text"
                        required
                        value={partnerForm.venueName}
                        onChange={(e) => setPartnerForm({ ...partnerForm, venueName: e.target.value })}
                        placeholder="Örn: Velvet Lounge"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#E5A93C] transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Yetkili Adı Soyadı *</label>
                        <input
                          type="text"
                          required
                          value={partnerForm.contactPerson}
                          onChange={(e) => setPartnerForm({ ...partnerForm, contactPerson: e.target.value })}
                          placeholder="Örn: Ahmet Yılmaz"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#E5A93C] transition-all"
                        />
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">Telefon Numarası *</label>
                        <input
                          type="tel"
                          required
                          value={partnerForm.phone}
                          onChange={(e) => setPartnerForm({ ...partnerForm, phone: e.target.value })}
                          placeholder="Örn: 0555 123 4567"
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#E5A93C] transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">E-posta Adresi</label>
                      <input
                        type="email"
                        value={partnerForm.email}
                        onChange={(e) => setPartnerForm({ ...partnerForm, email: e.target.value })}
                        placeholder="Örn: iletisim@mekaniniz.com"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#E5A93C] transition-all"
                      />
                    </div>

                    <button
                      type="submit"
                      className="w-full py-3 rounded-xl bg-[#E5A93C] hover:bg-[#F59E0B] text-black font-black text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-md mt-2 cursor-pointer"
                    >
                      <Store className="w-3.5 h-3.5" />
                      <span>Ortaklık Başvurusu Gönder</span>
                    </button>
                  </form>
                )}
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── SON GÜNCELLEMELER (CHANGELOG) ────────────────────────────────── */}
      <section id="guncellemeler" className="py-16 sm:py-24 border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-xl mx-auto mb-12 space-y-2">
            <h2 className="text-xs font-bold uppercase tracking-widest text-[#E5A93C]">Sürekli Gelişim</h2>
            <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
              Son Güncellemeler &amp; Sürüm Notları
            </h3>
          </div>

          <div className="space-y-6">
            
            {/* Version 1.7.6 */}
            <div className="p-6 rounded-3xl bg-[#120D09] border border-[#E5A93C]/30 space-y-3 relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="px-3 py-1 rounded-full bg-[#E5A93C] text-black text-xs font-black">v1.7.6</span>
                  <span className="text-xs font-bold text-white">Google Play Faturalandırma &amp; Yasal Uyumluluk</span>
                </div>
                <span className="text-[10px] text-neutral-500 font-mono">Son Sürüm</span>
              </div>
              <ul className="list-disc list-inside space-y-1.5 text-xs text-neutral-300 pl-1">
                <li>Google Play In-App Billing entegrasyonu tamamlandı, abonelik yönetimi tamamen şeffaflaştırıldı.</li>
                <li>KVKK Aydınlatma, Açık Rıza ve Google Play Hesap Silme politikaları güncellendi.</li>
                <li>Masa QR okuma motoru donanımsal hızlandırma ile daha hızlı hale getirildi.</li>
              </ul>
            </div>

            {/* Version 1.7.0 */}
            <div className="p-6 rounded-3xl bg-[#120D09] border border-white/[0.08] space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <span className="px-3 py-1 rounded-full bg-white/10 text-neutral-300 text-xs font-black">v1.7.0</span>
                  <span className="text-xs font-bold text-white">Büyük Ekran TV Jukebox Modu</span>
                </div>
                <span className="text-[10px] text-neutral-500 font-mono">Güncelleme</span>
              </div>
              <ul className="list-disc list-inside space-y-1.5 text-xs text-neutral-300 pl-1">
                <li>Mekan televizyonları için yatay stüdyo ve TV akış modu eklendi.</li>
                <li>WebSocket tabanlı canlı şarkı oylama senkronizasyonu devreye alındı.</li>
              </ul>
            </div>

          </div>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.08] bg-black/90 py-12 sm:py-16 text-xs text-neutral-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-10">
          
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            
            {/* Col 1: Brand */}
            <div className="space-y-3 md:col-span-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-white/[0.04] border border-white/10 p-1.5 flex items-center justify-center">
                  <img src="/logo.png" alt="Muzikors" className="w-full h-full object-contain" />
                </div>
                <span className="text-base font-black text-white">Muzikors</span>
              </div>
              <p className="text-xs text-neutral-400 max-w-sm leading-relaxed">
                Mekanlarda müzik seçimini müşterilere sunan yeni nesil B2B SaaS interaktif jukebox ve müzik yönetimi platformu.
              </p>
              <p className="text-[11px] text-neutral-500 pt-2">
                © {new Date().getFullYear()} Muzikors B2B SaaS Platformu. Tüm hakları saklıdır.
              </p>
            </div>

            {/* Col 2: Legal Links */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-white block uppercase tracking-wider mb-2">Yasal &amp; Gizlilik</span>
              <ul className="space-y-1.5 text-xs">
                <li><Link href="/privacy" className="hover:text-white transition-colors">KVKK Aydınlatma Metni</Link></li>
                <li><Link href="/legal/privacy" className="hover:text-white transition-colors">Açık Rıza ve Veri Güvenliği</Link></li>
                <li><Link href="/legal/terms" className="hover:text-white transition-colors">Kullanıcı Hizmet Sözleşmesi</Link></li>
                <li><Link href="/legal/refund" className="hover:text-white transition-colors">Abonelik İptal &amp; İade</Link></li>
                <li><Link href="/delete-account" className="text-amber-400/80 hover:text-amber-400 transition-colors">Hesap ve Veri Silme</Link></li>
              </ul>
            </div>

            {/* Col 3: Support & Contact */}
            <div className="space-y-2.5">
              <span className="text-xs font-bold text-white block uppercase tracking-wider mb-2">İletişim &amp; Destek</span>
              <ul className="space-y-2 text-xs">
                <li>
                  <a href="mailto:destek@muzikors.com" className="text-neutral-300 hover:text-white transition-colors block font-mono">
                    destek@muzikors.com
                  </a>
                </li>
                <li>
                  <a href="https://wa.me/905068638306" target="_blank" rel="noreferrer" className="text-emerald-400 hover:underline flex items-center gap-1.5">
                    <MessageCircle className="w-3.5 h-3.5" />
                    <span>WhatsApp Destek</span>
                  </a>
                </li>
                <li>
                  <span className="text-neutral-500 text-[10px] block">Haftanın 7 Günü: 10:00 - 02:00</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </footer>

    </div>
  );
};
