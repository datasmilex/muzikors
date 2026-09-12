'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  QrCode,
  Play,
  ArrowRight,
  ExternalLink,
  MessageCircle,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Loader2,
  KeyRound,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export const ShowcaseLanding: React.FC = () => {
  const router = useRouter();

  // Quick Venue Connect State
  const [quickCode, setQuickCode] = useState('');

  // 3-Slide Interactive Slideshow State
  const showcaseSlides = [
    {
      src: '/showcase/slide-1.png',
      alt: 'Muzikors İle Müziği Sen Seç - Bir Mekana Bağlan',
      title: 'Müziği Sen Seç',
      caption: 'Masandaki QR kodu okut, mekana anında bağlan'
    },
    {
      src: '/showcase/slide-2.png',
      alt: 'Dilediğin Parçayı Saniyeler İçerisinde Bul',
      title: 'Saniyeler İçinde Parçanı Bul',
      caption: 'Geniş müzik kataloğundan dilediğin şarkıyı sıraya ekle'
    },
    {
      src: '/showcase/slide-3.png',
      alt: 'Muzikors - Müzik Sizin Elinizde',
      title: 'Müzik Sizin Elinizde',
      caption: 'Kafede çalan şarkılara oy ver, ritmi mekanla birlikte yakala'
    }
  ];
  const [currentSlide, setCurrentSlide] = useState(0);
  const [touchStartX, setTouchStartX] = useState<number | null>(null);

  // Auto-advance slides every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % showcaseSlides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [showcaseSlides.length]);

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + showcaseSlides.length) % showcaseSlides.length);
  };

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % showcaseSlides.length);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    setTouchStartX(e.touches[0].clientX);
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX === null) return;
    const diff = touchStartX - e.changedTouches[0].clientX;
    if (diff > 45) {
      nextSlide();
    } else if (diff < -45) {
      prevSlide();
    }
    setTouchStartX(null);
  };

  // Lead Form State
  const [partnerForm, setPartnerForm] = useState({
    venueName: '',
    contactPerson: '',
    phone: '',
    city: '',
    email: '',
  });
  const [submittingLead, setSubmittingLead] = useState(false);
  const [partnerSubmitted, setPartnerSubmitted] = useState(false);
  const [leadError, setLeadError] = useState<string | null>(null);

  // Mobile Navigation State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // FAQ Accordion State (first item open by default)
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Smooth Slide / Scroll Navigation to Target Sections
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

  // Handle Quick Connect Submit
  const handleQuickConnect = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = quickCode.trim();
    if (!clean) return;
    try {
      localStorage.removeItem('muzikors_active_venue');
    } catch {}
    window.location.href = `/?v=${encodeURIComponent(clean)}`;
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
        address: partnerForm.email.trim() ? `E-posta: ${partnerForm.email.trim()}` : 'Web Vitrin Başvurusu',
        status: 'yeni_basvuru',
        visit_notes: `Web sitesi vitrin formu üzerinden B2B ortaklık başvurusu alındı. E-posta: ${partnerForm.email || 'Belirtilmedi'}`,
        package_price: 0,
        last_visited_at: new Date().toISOString()
      });

      if (error) {
        console.error('Lead submission error:', error);
        // Fallback to mailto if database insert fails
        const subject = encodeURIComponent(`Mekan Ortaklığı Başvurusu: ${partnerForm.venueName}`);
        const body = encodeURIComponent(
          `Mekan Adı: ${partnerForm.venueName}\n` +
          `Yetkili: ${partnerForm.contactPerson}\n` +
          `Telefon: ${partnerForm.phone}\n` +
          `Şehir: ${partnerForm.city || 'Belirtilmedi'}\n` +
          `E-posta: ${partnerForm.email || 'Belirtilmedi'}\n`
        );
        window.location.href = `mailto:destek@muzikors.com?subject=${subject}&body=${body}`;
      }

      setPartnerSubmitted(true);
    } catch (err: any) {
      console.error('Lead error:', err);
      setLeadError('Başvuru gönderilirken bir hata oluştu. Lütfen doğrudan WhatsApp üzerinden bize ulaşın.');
    } finally {
      setSubmittingLead(false);
    }
  };

  const faqs = [
    {
      q: 'Kafede şarkı istemek ücretli mi?',
      a: 'Hayır, tamamen ücretsizdir! Muzikors ile masanızdaki QR kodu okutarak kafenin Spotify kataloğundaki parçaları ücretsiz arayabilir, sıraya ekleyebilir ve çalınan şarkılara oy verebilirsiniz. VIP abonelik ise limitsiz haklar ve reklamsız deneyim sunar. Kredi satışı kesinlikle yoktur.'
    },
    {
      q: 'Masadaki QR kodu nasıl okuturum?',
      a: 'Masanızdaki akrilik stantta yer alan QR kodu telefonunuzun standart kamera uygulamasıyla veya sitemizdeki "QR Okut" butonuna basarak anında okutabilirsiniz. Herhangi bir uygulama yüklemeniz zorunlu değildir.'
    },
    {
      q: 'Masa kodunu girerek mekana nasıl bağlanırım?',
      a: 'Masadaki stantta yer alan 4 haneli mekan veya masa kodunu ana sayfamızdaki hızlı giriş alanına yazıp "Bağlan" butonuna dokunarak doğrudan bulunduğunuz mekanın canlı çalma sırasına katılabilirsiniz.'
    },
    {
      q: 'Mekan sahibi olarak Muzikors\'u işletmeme nasıl kurarım?',
      a: 'Muzikors için pahalı donanım yatırımlarına gerek yoktur. İşletmenizin mevcut ses sistemi ve bir Spotify Premium hesabı yeterlidir. Kafe yönetim panelimizden dakikalar içinde canlı yayına başlayabilirsiniz.'
    },
    {
      q: 'İstenmeyen veya mekana uymayan şarkıları engelleyebilir miyim?',
      a: 'Kesinlikle. Kafe Yönetim Panelinde yer alan "Vibe Guard" teknolojisi ile mekanınızın konseptine uymayan müzik türlerini filtreleyebilir, çalma listesi sınırları koyabilir veya istemediğiniz parçaları tek dokunuşla sıradan atlayabilirsiniz.'
    }
  ];

  return (
    <div className="min-h-screen bg-black text-white font-sans selection:bg-white selection:text-black antialiased overflow-x-hidden">
      
      {/* ── TOP NAV BAR ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-black/90 border-b border-white/[0.08]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-14 sm:h-20 flex items-center justify-between">
          
          {/* Logo (Clean, Enlarged, Slogan: İnteraktif Müzik) */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group cursor-pointer">
            <img
              src="/logo.png"
              alt="Muzikors Logo"
              className="w-8 h-8 sm:w-11 sm:h-11 object-contain transition-transform group-hover:scale-105"
            />
            <div className="flex flex-col">
              <span className="text-base sm:text-xl font-black tracking-tight text-white leading-none">
                Muzikors
              </span>
              <span className="text-[9px] sm:text-[10px] font-mono font-bold text-zinc-400 uppercase tracking-widest mt-0.5 sm:mt-1">
                İnteraktif Müzik
              </span>
            </div>
          </Link>

          {/* Nav Links (Desktop) - Smooth Sliding Scroll */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-semibold text-neutral-400">
            <a
              href="#nasil-calisir"
              onClick={(e) => scrollToSection(e, 'nasil-calisir')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Nasıl Çalışır?
            </a>
            <a
              href="#ozellikler"
              onClick={(e) => scrollToSection(e, 'ozellikler')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Özellikler
            </a>
            <a
              href="#mekanlar"
              onClick={(e) => scrollToSection(e, 'mekanlar')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Mekanlar İçin
            </a>
            <a
              href="#sss"
              onClick={(e) => scrollToSection(e, 'sss')}
              className="hover:text-white transition-colors cursor-pointer"
            >
              Sıkça Sorulanlar
            </a>
            <Link href="/privacy" className="hover:text-white transition-colors">
              Yasal Bilgiler
            </Link>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-1.5 sm:gap-3">
            {/* QR Okut - Permanent on Mobile and Desktop */}
            <Link
              href="/qr"
              className="inline-flex items-center gap-1 px-2.5 sm:px-3.5 py-1.5 sm:py-2 rounded-lg bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-bold text-neutral-200 transition-all active:scale-95 min-h-[38px] sm:min-h-[44px]"
            >
              <QrCode className="w-3.5 h-3.5 text-white" />
              <span className="hidden xs:inline">QR Okut</span>
            </Link>

            <Link
              href="/app"
              className="inline-flex items-center gap-1 sm:gap-2 px-3 sm:px-5 py-1.5 sm:py-2.5 rounded-lg bg-white hover:bg-zinc-200 text-black font-black text-xs transition-all shadow-[0_4px_20px_rgba(255,255,255,0.15)] active:scale-95 cursor-pointer min-h-[38px] sm:min-h-[44px]"
            >
              <span>Uygulamayı Aç</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-1.5 sm:p-2 rounded-lg bg-white/[0.04] border border-white/10 text-neutral-300 hover:text-white active:scale-95 min-h-[38px] min-w-[38px] flex items-center justify-center"
              aria-label="Menüyü Aç"
            >
              {mobileMenuOpen ? <X className="w-4 h-4 sm:w-5 sm:h-5" /> : <Menu className="w-4 h-4 sm:w-5 sm:h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/[0.08] bg-black/95 px-4 py-4 space-y-3 backdrop-blur-2xl">
            <a
              href="#nasil-calisir"
              onClick={(e) => scrollToSection(e, 'nasil-calisir')}
              className="block text-sm font-semibold text-neutral-300 hover:text-white py-2"
            >
              Nasıl Çalışır?
            </a>
            <a
              href="#ozellikler"
              onClick={(e) => scrollToSection(e, 'ozellikler')}
              className="block text-sm font-semibold text-neutral-300 hover:text-white py-2"
            >
              Özellikler
            </a>
            <a
              href="#mekanlar"
              onClick={(e) => scrollToSection(e, 'mekanlar')}
              className="block text-sm font-semibold text-neutral-300 hover:text-white py-2"
            >
              Mekanlar İçin
            </a>
            <a
              href="#sss"
              onClick={(e) => scrollToSection(e, 'sss')}
              className="block text-sm font-semibold text-neutral-300 hover:text-white py-2"
            >
              Sıkça Sorulanlar (SSS)
            </a>
            <Link
              href="/privacy"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-neutral-300 hover:text-white py-2"
            >
              Yasal Bilgiler &amp; KVKK
            </Link>
          </div>
        )}
      </header>

      {/* ── HERO SECTION ─────────────────────────────────────────────────── */}
      <section className="relative pt-6 sm:pt-14 lg:pt-18 pb-12 sm:pb-20 border-b border-white/[0.06] overflow-hidden">
        
        {/* Crisp Top Line */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 lg:gap-10 items-center">
            
            {/* Left Column: Value Proposition (Balanced Mobile Typography) */}
            <div className="lg:col-span-7 space-y-4 sm:space-y-6 text-center lg:text-left">
              
              {/* Clean Kicker */}
              <div className="flex items-center justify-center lg:justify-start gap-2 text-[10px] sm:text-xs font-mono font-bold text-zinc-400 uppercase tracking-widest">
                <span className="w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_8px_rgba(255,255,255,0.6)]" />
                <span>Mekanların İnteraktif Müzik Platformu</span>
              </div>

              {/* Punchy Title (Compact on Mobile) */}
              <h1 className="text-2xl sm:text-4xl lg:text-5xl font-black text-white tracking-tight leading-tight sm:leading-[1.1]">
                Mekanların Ritmini <br />
                <span className="text-white">Sen Yönet.</span>
              </h1>

              {/* Subtitle (Readable on Mobile) */}
              <p className="text-xs sm:text-sm text-neutral-300 max-w-lg mx-auto lg:mx-0 leading-relaxed font-normal">
                Kafede, barda veya restoranda çalan müziğe doğrudan telefonundan yön ver. Masandaki QR kodu okut veya mekan kodunu gir; Spotify kataloğundan dilediğin şarkıyı sıraya ekle.
              </p>

              {/* Quick 4-Digit Venue Code / Table PIN Connector */}
              <form onSubmit={handleQuickConnect} className="pt-0.5 max-w-xs sm:max-w-md mx-auto lg:mx-0">
                <div className="flex items-center gap-1.5 sm:gap-2 p-1 sm:p-1.5 rounded-lg bg-white/[0.04] border border-white/10 focus-within:border-white transition-all shadow-inner">
                  <div className="pl-2 sm:pl-3 text-neutral-400">
                    <KeyRound className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                  </div>
                  <input
                    type="text"
                    value={quickCode}
                    onChange={(e) => setQuickCode(e.target.value)}
                    placeholder="Masa / Mekan Kodu (Örn: 9)"
                    className="flex-1 bg-transparent px-2 py-1.5 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none font-medium min-w-0"
                    aria-label="Mekan Kodu"
                  />
                  <button
                    type="submit"
                    className="px-3 sm:px-4 py-1.5 sm:py-2 rounded-md bg-white hover:bg-zinc-200 text-black font-bold text-xs transition-all active:scale-95 cursor-pointer shrink-0"
                  >
                    Bağlan
                  </button>
                </div>
              </form>

              {/* Primary Launch Action Buttons (Ergonomic Mobile Buttons) */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2.5 sm:gap-4 pt-1">
                <Link
                  href="/app"
                  className="w-full sm:w-auto px-5 sm:px-6 py-2.5 sm:py-3 rounded-lg bg-white hover:bg-zinc-200 text-black font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-[0_8px_24px_rgba(255,255,255,0.15)] active:scale-95 transition-all cursor-pointer min-h-[42px] sm:min-h-[44px]"
                >
                  <Play className="w-3.5 h-3.5 sm:w-4 sm:h-4 fill-black" />
                  <span>Web Uygulamasını Başlat</span>
                </Link>

                <a
                  href="https://play.google.com/store/apps/details?id=com.muzikors.app"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 transition-all min-h-[42px] sm:min-h-[44px]"
                >
                  <svg className="w-3.5 h-3.5 sm:w-4 sm:h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Google Play&apos;den İndir</span>
                </a>
              </div>

            </div>

            {/* Right Column: 3-Photo Interactive Slideshow Carousel */}
            <div className="lg:col-span-5 flex justify-center w-full">
              <div
                className="w-full max-w-[480px] aspect-video rounded-lg bg-[#0D0D0D] border border-white/10 shadow-2xl relative overflow-hidden group select-none flex items-center justify-center"
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
              >
                {/* Slides Layer */}
                <div className="relative w-full h-full">
                  {showcaseSlides.map((slide, index) => (
                    <div
                      key={slide.src}
                      className={`absolute inset-0 transition-opacity duration-500 flex items-center justify-center bg-black ${
                        currentSlide === index
                          ? 'opacity-100 pointer-events-auto z-10'
                          : 'opacity-0 pointer-events-none z-0'
                      }`}
                    >
                      <img
                        src={slide.src}
                        alt={slide.alt}
                        className="w-full h-full object-contain"
                      />
                    </div>
                  ))}
                </div>

                {/* Prev Navigation Button */}
                <button
                  type="button"
                  onClick={prevSlide}
                  className="absolute left-2 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-md bg-black/60 hover:bg-black/90 border border-white/10 text-white/80 hover:text-white transition-all active:scale-95 cursor-pointer"
                  aria-label="Önceki Görsel"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                {/* Next Navigation Button */}
                <button
                  type="button"
                  onClick={nextSlide}
                  className="absolute right-2 top-1/2 -translate-y-1/2 z-20 p-1.5 rounded-md bg-black/60 hover:bg-black/90 border border-white/10 text-white/80 hover:text-white transition-all active:scale-95 cursor-pointer"
                  aria-label="Sonraki Görsel"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>

                {/* Bottom Slide Indicators (Dots / Pills) */}
                <div className="absolute bottom-2.5 inset-x-0 z-20 flex items-center justify-center gap-1.5">
                  {showcaseSlides.map((_, index) => (
                    <button
                      key={index}
                      type="button"
                      onClick={() => setCurrentSlide(index)}
                      className={`h-1.5 rounded-full transition-all cursor-pointer ${
                        currentSlide === index
                          ? 'w-6 bg-white'
                          : 'w-2 bg-white/40 hover:bg-white/70'
                      }`}
                      aria-label={`Görsel ${index + 1}`}
                    />
                  ))}
                </div>
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── 3 ADIMDA NASIL ÇALIŞIR ──────────────────────────────────────── */}
      <section id="nasil-calisir" className="scroll-mt-24 py-12 sm:py-20 border-t border-white/[0.06] bg-black/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              3 Adımda Mekanın Müzik Akışına Katıl
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-8">
            
            {/* Step 1 */}
            <div className="bg-[#0D0D0D] rounded-lg p-5 sm:p-7 border border-white/[0.08] hover:border-white/30 transition-colors space-y-2.5">
              <h3 className="text-base sm:text-lg font-bold text-white">Masadaki QR&apos;ı Okut</h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Masanızdaki Muzikors QR kodunu telefonunuzun kamerasıyla veya web sitemizden tarayın. Tarayıcınız otomatik olarak bulunduğunuz mekana bağlanır.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#0D0D0D] rounded-lg p-5 sm:p-7 border border-white/[0.08] hover:border-white/30 transition-colors space-y-2.5">
              <h3 className="text-base sm:text-lg font-bold text-white">Parçanı Seç &amp; Sırala</h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Milyonlarca Spotify şarkısı arasından en sevdiğini ara, 30 saniyelik önizlemeyi dinle ve mekanın canlı çalma sırasına anında gönder.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#0D0D0D] rounded-lg p-5 sm:p-7 border border-white/[0.08] hover:border-white/30 transition-colors space-y-2.5">
              <h3 className="text-base sm:text-lg font-bold text-white">Oyla &amp; Ritmi Yakala</h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Sıradaki şarkılara masandaki arkadaşlarınla oy ver. En çok oy alan şarkı en öne çıksın, gecenin havasını hep beraber belirleyin.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ── ÖNE ÇIKAN ÖZELLİKLER ─────────────────────────────────────────── */}
      <section id="ozellikler" className="scroll-mt-24 py-12 sm:py-20 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              Sosyal Jukebox Deneyimini Yeniden Tanımladık
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-2">
              Hem müzikseverler hem de işletme sahipleri için en ince ayrıntısına kadar tasarlanmış özellikler.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 sm:gap-6">
            
            {/* Feature 1 */}
            <div className="bg-[#0D0D0D] rounded-lg p-5 sm:p-7 border border-white/[0.08] space-y-2.5 hover:border-white/20 transition-all">
              <h3 className="text-base font-bold text-white">Vibe Guard Koruma</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Mekanın tarzına uymayan parçalar filtrelenir. İşletme sahibi izin verilen müzik türlerini belirler, atmosfer daima korunur.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#0D0D0D] rounded-lg p-5 sm:p-7 border border-white/[0.08] space-y-2.5 hover:border-white/20 transition-all">
              <h3 className="text-base font-bold text-white">Muzikors VIP Abonelik</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Kredi satışı veya jeton hilesi yoktur. Google Play üzerinden tek bir VIP abonelikle reklamsız, limitsiz ve öncelikli şarkı isteyin.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#0D0D0D] rounded-lg p-5 sm:p-7 border border-white/[0.08] space-y-2.5 hover:border-white/20 transition-all">
              <h3 className="text-base font-bold text-white">Anlık Sıra &amp; Oylama</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Her masadaki oylar anlık olarak toplanır. Popüler parçalar sıranın başına tırmanır, mekanın ortak enerjisi hoparlörlere yansır.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ── MEKANLAR İÇİN ORTAKLIK BÖLÜMÜ ─────────────────────────────────── */}
      <section id="mekanlar" className="scroll-mt-24 py-12 sm:py-20 border-t border-white/[0.06] bg-black/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
            
            {/* Left Info */}
            <div className="lg:col-span-6 space-y-4 sm:space-y-6 text-center lg:text-left">
              <span className="text-[10px] sm:text-xs font-mono font-bold uppercase tracking-widest text-zinc-400">İşletmeler İçin</span>
              <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                Kafenizde Müzik Karmaşasına Son Verin
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                Garsonların veya müşterilerin telefondan sürekli şarkı değiştirmesi yerine, misafirlerinize modern ve prestijli bir etkileşim sunun. Mevcut ses sisteminiz ve bir Spotify Premium hesabı kurulum için yeterlidir.
              </p>

              <div className="space-y-3 pt-1 text-left">
                <div className="flex items-start gap-2.5 sm:gap-3">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-white block">Sıfır Donanım Maliyeti</strong>
                    <span className="text-[11px] text-neutral-400">Pahalı jukebox kutuları almanıza gerek yok. Mevcut bilgisayar veya tabletinizle anında çalışır.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 sm:gap-3">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5" />
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-white block">Masa Başı Akrilik Stant &amp; QR Kiti</strong>
                    <span className="text-[11px] text-neutral-400">Mekanınıza özel tasarlanmış kaliteli akrilik masa stantları ve QR kod etiketleri ekibimizce teslim edilir.</span>
                  </div>
                </div>

                <div className="flex items-start gap-2.5 sm:gap-3">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 rounded bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-3.5 sm:h-3.5" />
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
                  className="inline-flex items-center gap-2 text-xs font-bold text-white hover:underline min-h-[44px]"
                >
                  <span>Mevcut Ortak mısınız? Kafe Yönetim Paneline Giriş Yap</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Right Contact / Lead Form */}
            <div className="lg:col-span-6">
              <div className="bg-[#0D0D0D] rounded-lg p-5 sm:p-8 border border-white/10 shadow-2xl space-y-4 sm:space-y-5">
                <div className="border-b border-white/10 pb-3 sm:pb-4">
                  <h3 className="text-base sm:text-lg font-bold text-white">Mekan Ortaklığı Başvurusu</h3>
                  <p className="text-[11px] sm:text-xs text-neutral-400 mt-0.5">Bilgilerinizi bırakın, ekibimiz kurulum için sizinle 24 saat içinde iletişime geçsin.</p>
                </div>

                {leadError && (
                  <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{leadError}</span>
                  </div>
                )}

                {partnerSubmitted ? (
                  <div className="text-center py-6 sm:py-8 space-y-3">
                    <div className="w-12 h-12 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-white">Başvurunuz Başarıyla Kaydedildi!</h4>
                    <p className="text-xs text-neutral-400 max-w-xs mx-auto">
                      Mekan ortaklığı talebiniz veritabanımıza kaydedildi. Kurulum ekibimiz en kısa sürede sizinle telefon üzerinden iletişime geçecektir.
                    </p>
                    <div className="pt-3">
                      <a
                        href="https://wa.me/905068638306"
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-2 px-4 sm:px-5 py-2.5 rounded-lg bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold hover:bg-emerald-500/30 transition-all active:scale-95 min-h-[44px]"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Hızlı İletişim İçin WhatsApp&apos;tan Yazın</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handlePartnerSubmit} className="space-y-3">
                    <div>
                      <label htmlFor="venue-name" className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                        Mekan Adı *
                      </label>
                      <input
                        id="venue-name"
                        type="text"
                        required
                        value={partnerForm.venueName}
                        onChange={(e) => setPartnerForm({ ...partnerForm, venueName: e.target.value })}
                        placeholder="Örn: Moda Sahne Cafe"
                        className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                      <div>
                        <label htmlFor="contact-person" className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                          Yetkili Adı Soyadı *
                        </label>
                        <input
                          id="contact-person"
                          type="text"
                          required
                          value={partnerForm.contactPerson}
                          onChange={(e) => setPartnerForm({ ...partnerForm, contactPerson: e.target.value })}
                          placeholder="Ad Soyad"
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-all"
                        />
                      </div>
                      <div>
                        <label htmlFor="city" className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                          Şehir *
                        </label>
                        <input
                          id="city"
                          type="text"
                          required
                          value={partnerForm.city}
                          onChange={(e) => setPartnerForm({ ...partnerForm, city: e.target.value })}
                          placeholder="Örn: İstanbul / Kadıköy"
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 sm:gap-3">
                      <div>
                        <label htmlFor="phone" className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                          Telefon Numarası *
                        </label>
                        <input
                          id="phone"
                          type="tel"
                          required
                          value={partnerForm.phone}
                          onChange={(e) => setPartnerForm({ ...partnerForm, phone: e.target.value })}
                          placeholder="05XX XXX XX XX"
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-all"
                        />
                      </div>
                      <div>
                        <label htmlFor="email" className="block text-[10px] font-bold text-neutral-400 uppercase tracking-wider mb-1">
                          E-posta Adresi (İsteğe Bağlı)
                        </label>
                        <input
                          id="email"
                          type="email"
                          value={partnerForm.email}
                          onChange={(e) => setPartnerForm({ ...partnerForm, email: e.target.value })}
                          placeholder="iletisim@mekan.com"
                          className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-white transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submittingLead}
                      className="w-full py-2.5 sm:py-3 rounded-lg bg-white hover:bg-zinc-200 disabled:opacity-50 text-black font-black text-xs transition-all shadow-lg active:scale-95 cursor-pointer flex items-center justify-center gap-2 min-h-[44px]"
                    >
                      {submittingLead ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin text-black" />
                          <span>Başvuru İletiliyor...</span>
                        </>
                      ) : (
                        <span>Ortaklık Başvurusu Gönder</span>
                      )}
                    </button>

                    <p className="text-[10px] text-neutral-500 text-center">
                      Başvurunuz gizlilik ilkelerimiz ve KVKK kapsamında korunmaktadır. Doğrudan iletişim için WhatsApp hattımız: <span className="text-neutral-400">0506 863 83 06</span>
                    </p>
                  </form>
                )}

              </div>
            </div>

          </div>

        </div>
      </section>

      {/* ── SSS (FAQ) ACCORDION BÖLÜMÜ ──────────────────────────────────────── */}
      <section id="sss" className="scroll-mt-24 py-12 sm:py-20 border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
            <h2 className="text-xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              Sıkça Sorulan Sorular
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400 mt-2">
              Muzikors sistemi, mekan entegrasyonu ve abonelik modeli hakkında merak edilenler.
            </p>
          </div>

          <div className="space-y-2.5 sm:space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="bg-[#0D0D0D] rounded-lg border border-white/[0.08] overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-3.5 sm:p-5 text-left flex items-center justify-between gap-3 sm:gap-4 cursor-pointer active:bg-white/[0.02] min-h-[44px]"
                    aria-expanded={isOpen}
                  >
                    <span className="text-xs sm:text-base font-bold text-white">{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-white transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-3.5 sm:px-5 pb-3.5 sm:pb-5 text-xs sm:text-sm text-neutral-300 leading-relaxed border-t border-white/[0.04] pt-2.5 sm:pt-3">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────── */}
      <footer className="border-t border-white/[0.08] bg-black/60 pt-10 sm:pt-12 pb-14 sm:pb-16 text-neutral-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 pb-10 sm:pb-12 border-b border-white/[0.06]">
            
            {/* Col 1: Brand & Identity */}
            <div className="md:col-span-6 lg:col-span-5 space-y-3 sm:space-y-4">
              <div className="flex items-center gap-2.5 sm:gap-3">
                <img src="/logo.png" alt="Muzikors Logo" className="w-8 h-8 sm:w-9 sm:h-9 object-contain" />
                <span className="text-sm sm:text-base font-bold text-white tracking-tight">Muzikors İnteraktif Müzik</span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
                Muzikors, kafe ve mekanlarda müşterilerin dinlenen müziğe ortaklaşa karar verdiği interaktif sosyal müzik kutusu platformudur.
              </p>
              <div className="text-[11px] text-neutral-500 space-y-1">
                <div>&copy; {new Date().getFullYear()} Muzikors. Tüm hakları saklıdır.</div>
                <div className="text-[11px] text-neutral-400 font-medium">
                  Geliştirici &amp; Kurucu:{' '}
                  <span className="text-white font-semibold">Yunus Emre Gedik</span>{' '}
                  <span className="text-neutral-500 font-mono text-[10px]">(yunovax)</span>
                </div>
              </div>
            </div>

            {/* Col 2: Legal Links (With >=44px Touch Targets) */}
            <div className="md:col-span-3 lg:col-span-4 space-y-2 sm:space-y-2.5">
              <span className="text-xs font-bold text-white block uppercase tracking-wider mb-1 sm:mb-2">Yasal Bilgiler &amp; Güvenlik</span>
              <ul className="space-y-0.5 text-xs">
                <li>
                  <Link href="/privacy" className="inline-flex items-center py-1.5 sm:py-2 hover:text-white transition-colors min-h-[38px] sm:min-h-[44px]">
                    KVKK ve Gizlilik Politikası
                  </Link>
                </li>
                <li>
                  <Link href="/legal/terms" className="inline-flex items-center py-1.5 sm:py-2 hover:text-white transition-colors min-h-[38px] sm:min-h-[44px]">
                    Kullanıcı Hizmet Sözleşmesi
                  </Link>
                </li>
                <li>
                  <Link href="/legal/refund" className="inline-flex items-center py-1.5 sm:py-2 hover:text-white transition-colors min-h-[38px] sm:min-h-[44px]">
                    Abonelik İptal &amp; İade Koşulları
                  </Link>
                </li>
                <li>
                  <Link href="/delete-account" className="inline-flex items-center py-1.5 sm:py-2 text-neutral-400 hover:text-white transition-colors min-h-[38px] sm:min-h-[44px]">
                    Hesap ve Veri Silme Talebi
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Support & Contact */}
            <div className="md:col-span-3 space-y-2 sm:space-y-2.5">
              <span className="text-xs font-bold text-white block uppercase tracking-wider mb-1 sm:mb-2">İletişim &amp; Destek</span>
              <ul className="space-y-1.5 sm:space-y-2 text-xs">
                <li>
                  <a href="mailto:destek@muzikors.com" className="inline-flex items-center py-1 text-neutral-300 hover:text-white transition-colors font-mono min-h-[36px] sm:min-h-[44px]">
                    destek@muzikors.com
                  </a>
                </li>
                <li>
                  <a
                    href="https://wa.me/905068638306"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 py-1 text-emerald-400 hover:underline min-h-[36px] sm:min-h-[44px]"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp Destek</span>
                  </a>
                </li>
                <li>
                  <span className="text-neutral-500 text-[11px] block pt-0.5">Haftanın 7 Günü: 10:00 - 02:00</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </footer>

    </div>
  );
};
