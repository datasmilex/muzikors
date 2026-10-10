'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
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
  Check,
  AlertCircle,
  Copy
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

// Mekan fiyatlandırması (veritabanındaki app_settings.venue_pricing ile aynı tutulmalı)
const SETUP_FEE_PER_TABLE = 125; // TL, KDV dahil, tek seferlik
const TRIAL_MONTHS = 6;
const ANNUAL_FEE = 5000; // TL / yıl
const formatTL = (amount: number) => `₺${amount.toLocaleString('tr-TR')}`;

type LicenseAnswer = '' | 'var' | 'surecte' | 'yok';

// ── Statik içerik (her render'da yeniden oluşturulmasın diye modül seviyesinde) ──
const SHOWCASE_SLIDES = [
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

/** Bir slaydın ekranda kalma süresi. İlerleme çizgisi animasyonu bu süreyle çalışır ve bitişi slaydı ilerletir. */
const SLIDE_MS = 5000;

const FAQS = [
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
    a: `Müşterinin masada oturduğu her mekana uygundur: kafe, 3. nesil coffee shop, bar, pub, restoran, pastane, otel lobisi ve co-working alanları. Kurulum ücreti masa sayınıza göre hesaplanır (masa başı ${formatTL(SETUP_FEE_PER_TABLE)}); yıllık abonelik masa sayısından bağımsızdır, küçük mekanlar daha az öder.`
  },
  {
    q: 'Müşteriler mekanımızın havasına uymayan şarkılar açarsa ne olur? (Vibe Guard)',
    a: 'Vibe Guard™ teknolojisi mekanınızın atmosfer sigortasıdır. Çalınabilecek müzik türlerini, sanatçıları veya Spotify çalma listesi sınırlarını Kafe Panelinden siz belirlersiniz. Mekanınızın tarzına uymayan parçalar arama sonuçlarında filtrelenir; ayrıca istemediğiniz herhangi bir şarkıyı panelden tek tıkla sıradan atlayabilirsiniz.'
  },
  {
    q: 'Fiyat ne kadar ve ödeme nasıl yapılır?',
    a: `Tek seferlik kurulum masa başı ${formatTL(SETUP_FEE_PER_TABLE)}'dir (KDV dahil); masa sayınız kadar akrilik QR stant bu ücrete dahildir. Kurulumdan sonraki ilk ${TRIAL_MONTHS} ay abonelik ücreti alınmaz. ${TRIAL_MONTHS}. aydan itibaren abonelik yıllık ${formatTL(ANNUAL_FEE)}'dir; aylık aidat veya gizli ücret yoktur. Örneğin 20 masalı bir mekan kurulumda ${formatTL(20 * SETUP_FEE_PER_TABLE)} öder. Ödemeler havale/EFT ile alınır.`
  },
  {
    q: 'Mekanımın müzik yayın lisansı olması gerekiyor mu?',
    a: 'Evet. Mekanda halka açık müzik çalmak için meslek birliklerinden (eser sahipleri için MESAM/MSG, yapımcılar için MÜ-YAP, icracılar için MÜYORBİR) lisans alınması yasal zorunluluktur. Muzikors yalnızca lisanslı veya lisans başvurusu süren mekanlarla çalışır. Lisansınız yoksa başvuru sürecinde size yol gösteririz; TÜRES veya TURYİD üyesi işletmeler, 2025\'te imzalanan gastronomi protokolü kapsamındaki indirimli tarifelerden yararlanabilir.'
  },
  {
    q: 'Karekod pleksiler masamıza nasıl gelir?',
    a: 'Başvurunuz onaylandıktan sonra masa sayınıza özel hazırlanan yüksek kaliteli, şeffaf akrilik masa stantları ve QR kod etiketleri kargoyla kapınıza teslim edilir. Vida, kablo, delme ya da montaj gerekmez; masaya koymanız yeterlidir.'
  },
  {
    q: 'Olası bir sistem kesintisinde veya ileride masadaki pleksilerim çöp olur mu?',
    a: 'Asla! Muzikors Dinamik QR altyapısı kullanır. Masalarınızdaki pleksi QR kodları yalnızca müziğe değil, dilediğiniz an tek bir tıkla mekanınızın kendi PDF dijital menüsüne, Wi-Fi karşılama ekranına veya Instagram hesabına yönlendirilebilir. Pleksileriniz mekanınızda ömür boyu hizmet etmeye devam eder.'
  },
  {
    q: 'Kafede şarkı istemek misafirler için ücretli mi?',
    a: 'Hayır, misafirler için tamamen ücretsizdir! Masadaki QR kodu okutan her müşteri şarkı seçebilir, sıraya ekleyebilir ve sıradaki şarkılara oy verebilir. Bireysel VIP abonelik ise yalnızca ekstra ayrıcalıklar (reklamsız deneyim, öncelikli istekler) isteyen kullanıcılar içindir; sistemde jeton veya kredi satışı kesinlikle yoktur.'
  }
];

const STEPS = [
  {
    title: 'Karekodların masana gelir',
    body: 'Masa sayın kadar lazer kesim akrilik QR stant kargoyla kapına gelir. Vida, kablo, cihaz yok; masaya koyman yeter.'
  },
  {
    title: 'Müşterin okutur, parçayı seçer',
    body: 'Uygulama indirmeden Spotify kataloğundan dilediği şarkıyı arar, mekanının logosu ve Wi-Fi bilgisiyle açılan sayfadan sıraya ekler.'
  },
  {
    title: 'Sen panelden yönetirsin',
    body: 'Vibe Guard™ ile uygunsuz türleri filtrelersin; hangi şarkıların sevildiğini görür, istenmeyen şarkıyı tek dokunuşla atlayıp kontrolü sağlarsın.'
  }
];

const FEATURES = [
  {
    title: 'Masaya koy, bitti',
    body: 'Pleksiler kargoyla adresinize gelir. Cihaz maliyeti, kablolama, ek ekran yatırımı ve eleman eğitimi yoktur.'
  },
  {
    title: 'Boş saatte masada bir sebep',
    body: 'Öğleden sonra veya sakin saatlerde oturan müşterinin masasında etkileşim kuracağı bir sebep olur; masa enerjinin merkezi haline gelir.'
  },
  {
    title: 'Masada kalma süresinde artış',
    body: 'Kendi şarkısının çalmasını bekleyen ve sıradaki parçaları masasıyla oylayan misafirler mekanda daha uzun süre kalır, ek sipariş verir.'
  },
  {
    title: 'Vibe Guard™ ile tarzın güvende',
    body: 'Rock kafede arabesk, caz barda uygunsuz müzik çalmaz. İzin verilen türleri ve çalma listelerini siz belirlersiniz.'
  },
  {
    title: 'Senin mekanının adıyla açılır',
    body: 'Müşteri QR kodu okuttuğunda sayfa mekanınızın logosu, adı ve Wi-Fi şifresiyle açılır; kurumsal prestijiniz artar.'
  },
  {
    title: 'Personel müzik baskısından kurtulur',
    body: 'Garsonların veya baristaların telefondan şarkı değiştirme baskısı biter. Personel yalnızca siparişe ve kaliteli servise odaklanır.'
  }
];

const PRICE_INCLUDES = [
  'Masa sayınız kadar lazer kazımalı akrilik QR stant (kurulum ücretine dahil), kapınıza teslim',
  'Spotify ses sistemi entegrasyonu ve sınırsız müşteri istek & oylama kuyruğu',
  'Vibe Guard™ Müzik ve Tür Filtresi (Uygunsuz şarkıları otomatik filtreleme)',
  'Gelişmiş Kafe Yönetim Paneli (kafe.muzikors.com.tr) & Anlık Şarkı Atlama (Skip)',
  'Kesintisiz Bulut Sunucu & Anlık Senkronizasyon Altyapısı (aylık aidat yok)',
  'Dinamik QR Güvencesi (İstendiğinde kafenin dijital menüsüne anında yönlendirme)',
  '7/24 Doğrudan Kurumsal WhatsApp & E-posta Destek Hattı'
];

const NAV_LINKS = [
  { id: 'nasil-calisir', label: 'Nasıl Çalışır?', mobileLabel: 'Nasıl Çalışır?' },
  { id: 'ozellikler', label: 'Özellikler', mobileLabel: 'Özellikler' },
  { id: 'fiyat', label: 'Fiyat', mobileLabel: 'Fiyat' },
  { id: 'sss', label: 'SSS', mobileLabel: 'Sıkça Sorulanlar (SSS)' }
];

const INPUT_CLASS =
  'w-full bg-[#FAF6F1] border border-[#DACDC0] rounded-xl px-3.5 py-2.5 text-xs sm:text-sm text-[#26170F] placeholder-[#7E6C60] focus:border-[#8C5226] focus:bg-white transition-colors duration-150 font-medium min-h-[46px]';

const LABEL_CLASS = 'block text-xs font-bold text-[#4A3426] uppercase tracking-wider mb-1.5';

/** Kullanıcının "hareketi azalt" tercihini canlı takip eder. */
function usePrefersReducedMotion() {
  const [reduced, setReduced] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const update = () => setReduced(mq.matches);
    update();
    mq.addEventListener('change', update);
    return () => mq.removeEventListener('change', update);
  }, []);
  return reduced;
}

export const ShowcaseLanding: React.FC = () => {
  const reducedMotion = usePrefersReducedMotion();

  // Mobile Navigation State
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // FAQ Accordion State (first item open by default)
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // ── Slayt gösterisi ──────────────────────────────────────────────────────
  const [currentSlide, setCurrentSlide] = useState(0);
  const [hoverPaused, setHoverPaused] = useState(false); // fare üstünde / klavye odağında duraklar
  const [inView, setInView] = useState(true);
  const [pageVisible, setPageVisible] = useState(true);
  // Sadece gösterilen ve sıradaki slaydın görseli yüklenir (slide-3 ≈ 550 KB ilk yüklemeyi şişirmesin)
  const [primedSlides, setPrimedSlides] = useState<Set<number>>(() => new Set([0]));
  const carouselRef = useRef<HTMLDivElement>(null);
  const touchStartX = useRef<number | null>(null);

  const slideCount = SHOWCASE_SLIDES.length;
  const autoplay = !reducedMotion;
  const progressRunning = autoplay && !hoverPaused && inView && pageVisible;

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(((index % slideCount) + slideCount) % slideCount);
  }, [slideCount]);

  const prevSlide = () => goToSlide(currentSlide - 1);
  const nextSlide = useCallback(() => goToSlide(currentSlide + 1), [goToSlide, currentSlide]);

  // Gösterilen + bir sonraki slaydı önceden hazırla
  useEffect(() => {
    setPrimedSlides((prev) => {
      const next = (currentSlide + 1) % slideCount;
      if (prev.has(currentSlide) && prev.has(next)) return prev;
      const updated = new Set(prev);
      updated.add(currentSlide);
      updated.add(next);
      return updated;
    });
  }, [currentSlide, slideCount]);

  // Ekran dışındayken ve sekme gizliyken ilerleme durur (gereksiz döngü yok)
  useEffect(() => {
    const el = carouselRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(([entry]) => setInView(entry.isIntersecting), { threshold: 0.25 });
    io.observe(el);
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const onVisibility = () => setPageVisible(document.visibilityState === 'visible');
    onVisibility();
    document.addEventListener('visibilitychange', onVisibility);
    return () => document.removeEventListener('visibilitychange', onVisibility);
  }, []);

  // Mobil menü: Escape ile kapanır
  useEffect(() => {
    if (!mobileMenuOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setMobileMenuOpen(false);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileMenuOpen]);

  const handleTouchStart = (e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (touchStartX.current === null) return;
    const diff = touchStartX.current - e.changedTouches[0].clientX;
    if (diff > 45) {
      nextSlide();
    } else if (diff < -45) {
      prevSlide();
    }
    touchStartX.current = null;
  };

  const handleCarouselKey = (e: React.KeyboardEvent) => {
    if (e.key === 'ArrowRight') { e.preventDefault(); nextSlide(); }
    if (e.key === 'ArrowLeft') { e.preventDefault(); prevSlide(); }
  };

  const handleCarouselBlur = (e: React.FocusEvent<HTMLDivElement>) => {
    if (!e.currentTarget.contains(e.relatedTarget as Node | null)) setHoverPaused(false);
  };

  // Lead Form State
  const [partnerForm, setPartnerForm] = useState({
    venueName: '',
    contactPerson: '',
    phone: '',
    city: '',
    tableCount: '15',
    email: '',
    license: '' as LicenseAnswer,
    termsAccepted: false,
  });
  const tableCountNum = Math.max(0, Math.floor(Number(partnerForm.tableCount) || 0));
  const estimatedSetupFee = tableCountNum * SETUP_FEE_PER_TABLE;
  const licenseLabel: Record<LicenseAnswer, string> = {
    '': 'Belirtilmedi',
    var: 'Var',
    surecte: 'Başvuru sürüyor',
    yok: 'Yok',
  };
  const [submittingLead, setSubmittingLead] = useState(false);
  const [partnerSubmitted, setPartnerSubmitted] = useState(false);
  const [leadError, setLeadError] = useState<string | null>(null);
  const [leadCopied, setLeadCopied] = useState(false);

  // Fallback durumunda işletme bilgilerini panoya kopyalama
  const copyLeadDetails = () => {
    const text = `Muzikors İşletme Başvurusu:\nMekan Adı: ${partnerForm.venueName}\nYetkili: ${partnerForm.contactPerson}\nTelefon: ${partnerForm.phone}\nŞehir: ${partnerForm.city || 'Belirtilmedi'}\nMasa Sayısı: ${partnerForm.tableCount}\nMüzik Yayın Lisansı: ${licenseLabel[partnerForm.license]}\nE-posta: ${partnerForm.email || 'Belirtilmedi'}`;
    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      navigator.clipboard.writeText(text);
      setLeadCopied(true);
      setTimeout(() => setLeadCopied(false), 2500);
    }
  };

  // WhatsApp doğrudan başvuru bağlantısı
  const getWhatsAppLeadUrl = () => {
    const text = `Merhaba Muzikors, web sitenizden işletme başvurumu iletiyorum:\n- Mekan: ${partnerForm.venueName}\n- Yetkili: ${partnerForm.contactPerson}\n- Telefon: ${partnerForm.phone}\n- Şehir: ${partnerForm.city || 'Belirtilmedi'}\n- Masa Sayısı: ${partnerForm.tableCount}\n- Müzik Yayın Lisansı: ${licenseLabel[partnerForm.license]}${partnerForm.email ? `\n- E-posta: ${partnerForm.email}` : ''}`;
    return `https://wa.me/905068638306?text=${encodeURIComponent(text)}`;
  };

  // Smooth Scroll Navigation (hareketi azalt tercihinde anında kaydırır)
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement>, targetId: string) => {
    e.preventDefault();
    const element = document.getElementById(targetId);
    if (element) {
      const headerOffset = 84;
      const offsetPosition = element.getBoundingClientRect().top + window.scrollY - headerOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: reducedMotion ? 'auto' : 'smooth'
      });
    }
    setMobileMenuOpen(false);
  };

  // Handle B2B Partner Lead Submit with Supabase Persistence
  const handlePartnerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!partnerForm.venueName || !partnerForm.contactPerson || !partnerForm.phone) return;
    if (partnerForm.license === 'yok' || !partnerForm.license || !partnerForm.termsAccepted) return;

    setSubmittingLead(true);
    setLeadError(null);

    try {
      const { data, error } = await supabase.rpc('submit_web_venue_application', {
        p_venue_name: partnerForm.venueName.trim(),
        p_manager_name: partnerForm.contactPerson.trim(),
        p_phone: partnerForm.phone.trim(),
        p_city: partnerForm.city.trim(),
        p_table_count: tableCountNum,
        p_email: partnerForm.email.trim(),
        p_license_status: partnerForm.license,
        p_terms_accepted: partnerForm.termsAccepted,
      });

      if (error) {
        console.error('Lead submission error:', error);
        setLeadError('Sunucu bağlantısı sırasında bir gecikme oluştu. Bilgileriniz kaybolmadı; tek tıkla WhatsApp üzerinden iletebilir veya tekrar gönderebilirsiniz.');
        return;
      }
      if (!(data as any)?.success) {
        setLeadError((data as any)?.error || 'Başvurunuz kaydedilemedi. WhatsApp hattımızdan tek tıkla iletebilirsiniz.');
        return;
      }

      setPartnerSubmitted(true);
    } catch (err: any) {
      console.error('Lead error:', err);
      setLeadError('Sunucu bağlantısı kurulamadı. Bilgileriniz formda korundu; WhatsApp hattımızdan tek tıkla bize iletebilirsiniz.');
    } finally {
      setSubmittingLead(false);
    }
  };

  return (
    <div className="sc-root min-h-screen bg-[#FAF7F2] text-[#241A14] font-sans selection:bg-[#E8D0B5] selection:text-[#241A14] antialiased overflow-x-hidden">

      {/* ── TOP NAV BAR (AÇIK TEMA - ILIK KAHVE TONLARI) ────────────────────────── */}
      {/* Not: %95 opak zeminde backdrop-blur görünmüyordu ama her kaydırmada GPU'ya maliyet çıkarıyordu; düz zemin kullanılıyor. */}
      <header className="sticky top-0 z-50 bg-[#FAF7F2] border-b border-[#E8DFD3]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 sm:h-20 flex items-center justify-between">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group cursor-pointer rounded-xl">
            <div className="w-9 h-9 sm:w-11 sm:h-11 rounded-xl bg-[#241A14] flex items-center justify-center p-2 shadow-sm transition-transform duration-200 ease-out group-hover:scale-105">
              <img
                src="/logo.png"
                alt="Muzikors Logo"
                width={44}
                height={44}
                decoding="async"
                className="w-full h-full object-contain"
              />
            </div>
            <div className="flex flex-col">
              <span className="text-lg sm:text-xl font-black tracking-tight text-[#241A14] leading-none">
                Muzikors
              </span>
              <span className="text-[10px] font-bold text-[#8C5226] uppercase tracking-widest mt-1">
                İnteraktif Müzik
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-8 text-xs font-bold text-[#69574D]">
            {NAV_LINKS.map((link) => (
              <a
                key={link.id}
                href={`#${link.id}`}
                onClick={(e) => scrollToSection(e, link.id)}
                className="sc-navlink hover:text-[#241A14] transition-colors duration-150 cursor-pointer py-2"
              >
                {link.label}
              </a>
            ))}
            <a
              href="https://kafe.muzikors.com.tr"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#241A14] transition-colors duration-150 inline-flex items-center gap-1 py-2"
            >
              <span>Kafe Girişi</span>
              <ExternalLink className="w-3 h-3 text-[#8C7A6F]" />
            </a>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* QR Okut (Patron direct scanner) */}
            <Link
              href="/qr"
              className="inline-flex items-center gap-1.5 px-3 sm:px-4 py-2 rounded-xl bg-[#EFE6DC] hover:bg-[#E4D9CD] border border-[#DDD0C0] text-xs font-bold text-[#3D281B] transition duration-150 active:scale-95 min-h-[44px]"
            >
              <QrCode className="w-4 h-4 text-[#8C5226]" />
              <span>QR Okut</span>
            </Link>

            {/* Mekanını Başlat */}
            <a
              href="#hero-form"
              onClick={(e) => scrollToSection(e, 'hero-form')}
              className="inline-flex items-center gap-1.5 sm:gap-2 px-4 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-[#241A14] hover:bg-[#150E0A] text-[#FAF6F0] font-bold text-xs transition duration-150 shadow-sm active:scale-95 cursor-pointer min-h-[44px]"
            >
              <span>Mekanınızı Başlatın</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-[#EFE6DC] border border-[#DDD0C0] text-[#3D281B] hover:text-[#241A14] transition duration-150 active:scale-95 min-h-[44px] min-w-[44px] flex items-center justify-center cursor-pointer"
              aria-label={mobileMenuOpen ? 'Menüyü Kapat' : 'Menüyü Aç'}
              aria-expanded={mobileMenuOpen}
              aria-controls="sc-mobile-menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer — yükseklik ölçmeden grid-rows ile açılır */}
        <div
          id="sc-mobile-menu"
          className="sc-collapse md:hidden"
          data-open={mobileMenuOpen}
          inert={!mobileMenuOpen}
        >
          <div className="sc-collapse-inner">
            <div className="border-t border-[#E8DFD3] bg-[#FAF7F2] px-5 py-3 shadow-[0_12px_24px_-12px_rgba(36,26,20,0.18)]">
              {NAV_LINKS.map((link) => (
                <a
                  key={link.id}
                  href={`#${link.id}`}
                  onClick={(e) => scrollToSection(e, link.id)}
                  className="flex items-center text-sm font-bold text-[#4D392C] hover:text-[#241A14] min-h-[44px]"
                >
                  {link.mobileLabel}
                </a>
              ))}
              <a
                href="https://kafe.muzikors.com.tr"
                target="_blank"
                rel="noreferrer"
                className="flex items-center text-sm font-bold text-[#4D392C] hover:text-[#241A14] min-h-[44px]"
              >
                Kafe Girişi (kafe.muzikors.com.tr)
              </a>
              <Link
                href="/privacy"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center text-sm font-bold text-[#6B584C] hover:text-[#241A14] min-h-[44px]"
              >
                Yasal Bilgiler &amp; KVKK
              </Link>
            </div>
          </div>
        </div>
      </header>

      {/* ── HERO SECTION ──────────────────────────────────────────────────────── */}
      {/* ── HERO SECTION (KOMPAKT & ORTALANMIŞ ZARİF DÜZEN) ───────────────────── */}
      <section className="relative pt-6 sm:pt-10 pb-10 sm:pb-14 border-b border-[#E8DFD3] bg-gradient-to-b from-[#F3ECE4]/80 to-[#FAF7F2]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5 sm:space-y-6">

          {/* ── 1. Başlık ve Açıklama (Kompakt, Dengeli & Ortalanmış) ───────── */}
          <div className="text-center space-y-2.5">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-[#26170F] tracking-tight leading-tight max-w-2xl mx-auto text-balance">
              <span className="sc-line">
                <span>Masana karekod koy,</span>
              </span>
              <span className="sc-line sc-line-2">
                <span>
                  <span className="sc-ink text-[#8C5226]">müşterin çalan müziği yönetsin.</span>
                </span>
              </span>
            </h1>

            <p className="text-xs sm:text-sm text-[#635044] max-w-lg mx-auto leading-relaxed font-normal">
              Milyonlarca Spotify şarkısı, masa oylaması ve Vibe Guard™ koruması; <strong>uygulama indirme yok, cihaz yok.</strong>
            </p>
          </div>

          {/* ── 2. Kompakt Vitrin Çerçevesi (max-w-2xl) ──────────────────────── */}
          <div className="w-full max-w-xl sm:max-w-2xl mx-auto">
            <div
              ref={carouselRef}
              role="region"
              aria-roledescription="carousel"
              aria-label="Muzikors uygulama ve masa deneyimi"
              tabIndex={0}
              className="w-full aspect-video rounded-2xl bg-[#F7F7F7] border border-[#DACDC0] shadow-[0_8px_24px_rgba(36,26,20,0.06)] relative overflow-hidden select-none"
              onTouchStart={handleTouchStart}
              onTouchEnd={handleTouchEnd}
              onMouseEnter={() => setHoverPaused(true)}
              onMouseLeave={() => setHoverPaused(false)}
              onFocus={() => setHoverPaused(true)}
              onBlur={handleCarouselBlur}
              onKeyDown={handleCarouselKey}
            >
              {SHOWCASE_SLIDES.map((slide, index) => {
                const isActive = currentSlide === index;
                return (
                  <div
                    key={slide.src}
                    role="group"
                    aria-roledescription="slide"
                    aria-label={`${index + 1} / ${slideCount}: ${slide.title}`}
                    aria-hidden={!isActive}
                    className="sc-slide absolute inset-0 flex items-center justify-center bg-[#F7F7F7]"
                    data-active={isActive}
                  >
                    {primedSlides.has(index) && (
                      <img
                        src={slide.src}
                        alt={slide.alt}
                        width={1024}
                        height={576}
                        decoding="async"
                        loading={index === 0 ? 'eager' : 'lazy'}
                        fetchPriority={index === 0 ? 'high' : 'low'}
                        draggable={false}
                        className="w-full h-full object-contain"
                      />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Slayt Bilgisi ve Minimal İlerleme Çizgileri */}
            <div
              className="mt-2.5 flex items-center justify-between px-1"
              data-paused={!progressRunning}
            >
              <div className="min-w-0 pr-4">
                <span className="text-xs font-bold text-[#26170F] truncate block">
                  {SHOWCASE_SLIDES[currentSlide].title}
                </span>
                <span className="text-[11px] text-[#7E6C60] truncate block">
                  {SHOWCASE_SLIDES[currentSlide].caption}
                </span>
              </div>

              {/* 3 İlerleme Çizgisi */}
              <div className="flex items-center gap-1.5 shrink-0">
                {SHOWCASE_SLIDES.map((slide, index) => {
                  const isActive = currentSlide === index;
                  return (
                    <button
                      key={slide.src}
                      type="button"
                      onClick={() => goToSlide(index)}
                      className="h-8 px-1 flex items-center cursor-pointer group"
                      aria-label={`Görsel ${index + 1}: ${slide.title}`}
                      aria-current={isActive ? 'true' : undefined}
                    >
                      <span className="relative block w-7 h-[3px] rounded-full bg-[#D8C7B5] overflow-hidden group-hover:bg-[#C9B49E] transition-colors">
                        {isActive ? (
                          <span
                            key={`fill-${currentSlide}`}
                            className={`absolute inset-0 origin-left bg-[#8C5226] rounded-full ${reducedMotion ? '' : 'sc-progress'}`}
                            style={{ ['--sc-slide-ms' as string]: `${SLIDE_MS}ms` }}
                            onAnimationEnd={nextSlide}
                          />
                        ) : (
                          <span
                            className="absolute inset-0 origin-left bg-[#8C5226]/40 rounded-full"
                            style={{ transform: index < currentSlide ? 'scaleX(1)' : 'scaleX(0)' }}
                          />
                        )}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>
          </div>

          {/* ── 3. Butonlar ve Güven Rozetleri (Hemen Slaytın Altında) ──────── */}
          <div className="pt-2 text-center space-y-3">
            <div className="flex flex-col sm:flex-row items-center justify-center gap-2.5">
              <a
                href="#hero-form"
                onClick={(e) => scrollToSection(e, 'hero-form')}
                className="group w-full sm:w-auto px-6 py-2.5 sm:py-3 rounded-xl bg-[#241A14] hover:bg-[#150E0A] text-[#FAF6F0] font-black text-xs sm:text-sm flex items-center justify-center gap-2 shadow-sm active:scale-95 transition min-h-[44px]"
              >
                <span>Mekanınızı Başlatın</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
              </a>

              <a
                href="#nasil-calisir"
                onClick={(e) => scrollToSection(e, 'nasil-calisir')}
                className="w-full sm:w-auto px-5 py-2.5 sm:py-3 rounded-xl bg-white hover:bg-[#FAF4ED] border border-[#D8C7B5] text-[#362217] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 transition min-h-[44px]"
              >
                <span>Nasıl Çalışır?</span>
              </a>

              <Link
                href="/qr"
                className="w-full sm:w-auto px-5 py-2.5 sm:py-3 rounded-xl bg-[#EFE5D8] hover:bg-[#E5D7C7] border border-[#D9C8B5] text-[#54341E] font-bold text-xs sm:text-sm flex items-center justify-center gap-2 active:scale-95 transition min-h-[44px]"
                title="Kafe müşterisi gözünden masada müzik seçme deneyimini test edin"
              >
                <QrCode className="w-4 h-4 text-[#8C5226]" />
                <span>Müşteri QR Önizleme</span>
              </Link>
            </div>

            {/* Güven Rozetleri */}
            <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-5 text-xs font-semibold text-[#6B584C]">
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#8C5226] stroke-[3]" />
                <span>Cihaz / donanım gerekmez</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#8C5226] stroke-[3]" />
                <span>Akrilik QR pleksiler kargoyla gelir</span>
              </span>
              <span className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-[#8C5226] stroke-[3]" />
                <span>Taahhüt ve vidalama yok</span>
              </span>
            </div>
          </div>

        </div>
      </section>

      {/* ── 3 ADIMLI YOLCULUK (1 - 2 - 3 MİNİMAL ŞABLON) ───────────────────── */}
      <section id="nasil-calisir" className="py-14 sm:py-24 border-b border-[#E8DFD3] bg-[#FAF7F2]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-black text-[#26170F] tracking-tight text-balance">
              3 Adımda Mekanınızda Canlı Müzik
            </h2>
            <p className="text-sm text-[#635044] mt-2">
              Karmaşık kablolar, pahalı cihazlar ve eleman eğitimi yok.
            </p>
          </div>

          {/* Kart kutuları yerine ince çizgiyle ayrılan sütunlar */}
          <ol className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-10">
            {STEPS.map((step, index) => (
              <li key={step.title} className="pt-5 border-t border-[#D8C7B5] space-y-2.5">
                <h3 className="text-base sm:text-lg font-black text-[#26170F] flex items-baseline gap-2">
                  <span className="text-[#8C5226] tabular-nums text-base sm:text-lg font-black shrink-0">{index + 1}.</span>
                  <span>{step.title}</span>
                </h3>
                <p className="text-sm text-[#635044] leading-relaxed max-w-[42ch]">
                  {step.body}
                </p>
              </li>
            ))}
          </ol>

          <div className="pt-12 text-center">
            <a
              href="#hero-form"
              onClick={(e) => scrollToSection(e, 'hero-form')}
              className="group inline-flex items-center gap-2 min-h-[44px] text-xs font-black text-[#8C5226] hover:text-[#6E3C17] uppercase tracking-wider underline underline-offset-4 decoration-[#8C5226]/40 hover:decoration-[#6E3C17] transition-colors duration-150 cursor-pointer"
            >
              <span>Mekanınızı Muzikors ile Başlatın</span>
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
            </a>
          </div>

        </div>
      </section>

      {/* ── ÖZELLİKLER ───────────────────────────────────────────────────────── */}
      <section id="ozellikler" className="py-14 sm:py-24 border-b border-[#E8DFD3] bg-[#F4EEE7]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-black text-[#26170F] tracking-tight text-balance">
              Masanızdaki Aynı Karekod Hepsini Açar
            </h2>
            <p className="text-sm text-[#635044] mt-2">
              Masa stantları, Spotify entegrasyonu ve yönetim paneli tek bir çatı altında.
            </p>
          </div>

          <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-10 gap-y-8 sm:gap-y-10">
            {FEATURES.map((feature) => (
              <div key={feature.title} className="pt-5 border-t border-[#D9CBBB] space-y-2">
                <dt className="text-base sm:text-lg font-black text-[#26170F]">{feature.title}</dt>
                <dd className="text-sm text-[#635044] leading-relaxed max-w-[44ch]">{feature.body}</dd>
              </div>
            ))}
          </dl>

        </div>
      </section>

      {/* ── ŞEFFAF FİYATLANDIRMA (masa başı kurulum + 6 ay ücretsiz + yıllık abonelik) ── */}
      <section id="fiyat" className="py-14 sm:py-24 border-b border-[#E8DFD3] bg-[#FAF7F2]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-black text-[#26170F] tracking-tight text-balance">
              Şeffaf Fiyatlandırma
            </h2>
            <p className="text-sm text-[#635044] mt-2">
              Tek seferlik kurulum, ilk {TRIAL_MONTHS} ay ücretsiz, sonrasında yıllık sabit ücret. Aylık aidat yok.
            </p>
          </div>

          {/* Fiyat Kartı (Ilık Kahve & Crema Şablonu) */}
          <div className="max-w-xl mx-auto bg-[#F8F2EA] rounded-2xl border border-[#D8C7B5] p-6 sm:p-10 shadow-[0_8px_30px_rgba(36,26,20,0.06)] space-y-6">

            {/* Fiyat kalemleri */}
            <dl className="divide-y divide-[#E4D7C8] border-b border-[#E4D7C8]">
              <div className="flex items-end justify-between gap-4 pb-4">
                <div>
                  <dt className="text-base sm:text-lg font-black text-[#26170F]">Kurulum</dt>
                  <span className="text-xs text-[#6B584C] font-semibold">Tek seferlik · KDV dahil · QR stantlar dahil</span>
                </div>
                <dd className="text-right">
                  <span className="text-2xl sm:text-3xl font-black text-[#26170F] tracking-tight tabular-nums">{formatTL(SETUP_FEE_PER_TABLE)}</span>
                  <span className="block text-xs text-[#6B584C] font-bold">masa başı</span>
                </dd>
              </div>
              <div className="flex items-end justify-between gap-4 py-4">
                <div>
                  <dt className="text-base sm:text-lg font-black text-[#26170F]">İlk {TRIAL_MONTHS} ay</dt>
                  <span className="text-xs text-[#6B584C] font-semibold">Tüm özellikler açık</span>
                </div>
                <dd className="text-2xl sm:text-3xl font-black text-[#8C5226] tracking-tight">Ücretsiz</dd>
              </div>
              <div className="flex items-end justify-between gap-4 py-4">
                <div>
                  <dt className="text-base sm:text-lg font-black text-[#26170F]">Sonrasında</dt>
                  <span className="text-xs text-[#6B584C] font-semibold">Aylık aidat yok</span>
                </div>
                <dd className="text-right">
                  <span className="text-2xl sm:text-3xl font-black text-[#26170F] tracking-tight tabular-nums">{formatTL(ANNUAL_FEE)}</span>
                  <span className="block text-xs text-[#6B584C] font-bold">yıllık</span>
                </dd>
              </div>
            </dl>

            {/* Örnek hesap ve koşullar */}
            <div className="text-xs text-[#5C4A3E] space-y-2">
              <div className="font-bold text-[#26170F] flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#8C5226]" />
                <span>
                  {tableCountNum > 0
                    ? `${tableCountNum} masalı bir mekan için kurulum: ${formatTL(estimatedSetupFee)}`
                    : `Örnek: 20 masalı bir mekan için kurulum ${formatTL(20 * SETUP_FEE_PER_TABLE)}`}
                </span>
              </div>
              <p className="text-[#6B584C] text-xs leading-relaxed pl-[22px]">
                Ödemeler havale/EFT ile alınır. Kurulum ödemesinden sonra QR stantlarınız hazırlanıp kargolanır ve {TRIAL_MONTHS} aylık ücretsiz dönem başlar.
              </p>
              <p className="text-[#6B584C] text-xs leading-relaxed pl-[22px]">
                Muzikors, müzik yayın lisansı (MESAM/MSG, MÜ-YAP, MÜYORBİR) olan mekanlarla çalışır.
              </p>
            </div>

            {/* Dahil Olan Özellikler Listesi */}
            <ul className="space-y-3 pt-4 border-t border-[#E4D7C8]">
              {PRICE_INCLUDES.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <Check className="w-4 h-4 text-[#8C5226] stroke-[3] shrink-0 mt-0.5" />
                  <span className="text-xs sm:text-sm font-semibold text-[#362217]">{item}</span>
                </li>
              ))}
            </ul>

            {/* Aksiyon Butonu */}
            <div className="pt-4">
              <a
                href="#hero-form"
                onClick={(e) => scrollToSection(e, 'hero-form')}
                className="group w-full py-4 rounded-xl bg-[#241A14] hover:bg-[#150E0A] text-[#FAF6F0] font-black text-sm flex items-center justify-center gap-2 transition duration-150 active:scale-95 shadow-md cursor-pointer min-h-[48px]"
              >
                <span>Mekanınız İçin Başvurun</span>
                <ArrowRight className="w-4 h-4 transition-transform duration-200 ease-out group-hover:translate-x-0.5" />
              </a>
              <p className="text-xs text-center text-[#6B584C] mt-2">
                Başvuru ücretsizdir; ödeme yalnızca onay ve lisans kontrolünden sonra alınır.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ── B2B BAŞVURU FORMU (#hero-form) ─────────────────────────────────── */}
      <section id="hero-form" className="py-14 sm:py-24 border-b border-[#E8DFD3] bg-[#F4EEE7] scroll-mt-20">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="bg-white rounded-2xl p-6 sm:p-10 border border-[#E8DFD3] shadow-[0_8px_30px_rgba(36,26,20,0.05)] space-y-6">

            <div className="border-b border-[#EFE7DC] pb-5 text-center sm:text-left">
              <h2 className="text-xl sm:text-3xl font-black text-[#26170F] tracking-tight text-balance">
                Mekanınızı Muzikors ile Tanıştırın
              </h2>
              <p className="text-xs sm:text-sm text-[#635044] mt-1.5">
                Bilgilerinizi bırakın; lisans durumunuzu ve kurulum detaylarını görüşmek için 24 saat içinde sizi arayalım.
              </p>
            </div>

            {leadError && (
              <div role="alert" className="sc-fade p-4 rounded-xl bg-amber-50/90 border border-amber-300 text-[#362217] text-xs space-y-3">
                <div className="flex items-start gap-2 text-amber-900 font-semibold leading-relaxed">
                  <AlertCircle className="w-4 h-4 shrink-0 text-amber-700 mt-0.5" />
                  <span>{leadError}</span>
                </div>
                <div className="flex flex-wrap items-center gap-2.5 pt-1">
                  <a
                    href={getWhatsAppLeadUrl()}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#241A14] hover:bg-black text-white font-bold text-xs transition duration-150 active:scale-95 min-h-[44px]"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <span>WhatsApp ile Hemen İlet</span>
                  </a>
                  <button
                    type="button"
                    onClick={copyLeadDetails}
                    className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white border border-[#DACDC0] hover:bg-[#FAF4ED] text-[#26170F] font-bold text-xs transition duration-150 active:scale-95 min-h-[44px] cursor-pointer"
                  >
                    {leadCopied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-[#8C5226]" />}
                    <span>{leadCopied ? 'Bilgiler Kopyalandı!' : 'Bilgilerimi Kopyala'}</span>
                  </button>
                </div>
              </div>
            )}

            {partnerSubmitted ? (
              <div className="sc-fade text-center py-8 sm:py-12 space-y-4" role="status">
                <CheckCircle2 className="w-10 h-10 text-[#8C5226] mx-auto" strokeWidth={1.75} />
                <h3 className="text-lg font-black text-[#26170F]">
                  Başvurunuz Başarıyla Kaydedildi!
                </h3>
                <p className="text-xs sm:text-sm text-[#635044] max-w-md mx-auto leading-relaxed">
                  Talebiniz ekibimize ulaştı. 24 saat içinde sizinle iletişime geçip müzik yayın lisansınızı kontrol edecek ve kurulumu ({tableCountNum > 0 ? `${tableCountNum} masa, ${formatTL(estimatedSetupFee)}` : `masa başı ${formatTL(SETUP_FEE_PER_TABLE)}`}) planlayacağız.
                </p>
                <div className="pt-3">
                  <a
                    href="https://wa.me/905068638306?text=Merhaba%20Muzikors,%20web%20sitenizden%20mekan%20ba%C5%9Fvurusu%20yapt%C4%B1m.%20Kurulum%20i%C3%A7in%20bilgi%20almak%20istiyorum."
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-6 py-3.5 rounded-xl bg-[#241A14] text-white text-xs font-bold hover:bg-black transition duration-150 active:scale-95 shadow-sm min-h-[46px]"
                  >
                    <MessageCircle className="w-4 h-4 text-emerald-400" />
                    <span>Hızlı Aktivasyon İçin WhatsApp&apos;tan Yazın</span>
                  </a>
                </div>
              </div>
            ) : (
              <form onSubmit={handlePartnerSubmit} className="space-y-4">

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="venue-name" className={LABEL_CLASS}>
                      Mekan Adı *
                    </label>
                    <input
                      id="venue-name"
                      type="text"
                      required
                      autoComplete="organization"
                      value={partnerForm.venueName}
                      onChange={(e) => setPartnerForm({ ...partnerForm, venueName: e.target.value })}
                      placeholder="Örn: Moda Sahne Cafe"
                      className={INPUT_CLASS}
                    />
                  </div>

                  <div>
                    <label htmlFor="contact-person" className={LABEL_CLASS}>
                      Yetkili Adı Soyadı *
                    </label>
                    <input
                      id="contact-person"
                      type="text"
                      required
                      autoComplete="name"
                      value={partnerForm.contactPerson}
                      onChange={(e) => setPartnerForm({ ...partnerForm, contactPerson: e.target.value })}
                      placeholder="Ad Soyad"
                      className={INPUT_CLASS}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="phone" className={LABEL_CLASS}>
                      Telefon Numarası *
                    </label>
                    <input
                      id="phone"
                      type="tel"
                      required
                      autoComplete="tel"
                      inputMode="tel"
                      value={partnerForm.phone}
                      onChange={(e) => setPartnerForm({ ...partnerForm, phone: e.target.value })}
                      placeholder="05XX XXX XX XX"
                      className={INPUT_CLASS}
                    />
                  </div>

                  <div>
                    <label htmlFor="city" className={LABEL_CLASS}>
                      Şehir / İlçe *
                    </label>
                    <input
                      id="city"
                      type="text"
                      required
                      autoComplete="address-level2"
                      value={partnerForm.city}
                      onChange={(e) => setPartnerForm({ ...partnerForm, city: e.target.value })}
                      placeholder="Örn: İstanbul / Kadıköy"
                      className={INPUT_CLASS}
                    />
                  </div>

                  <div>
                    <label htmlFor="table-count" className={LABEL_CLASS}>
                      Masa Sayısı *
                    </label>
                    <input
                      id="table-count"
                      type="number"
                      inputMode="numeric"
                      required
                      min={1}
                      max={500}
                      value={partnerForm.tableCount}
                      onChange={(e) => setPartnerForm({ ...partnerForm, tableCount: e.target.value })}
                      placeholder="15"
                      className={`${INPUT_CLASS} tabular-nums`}
                      aria-describedby="table-fee-hint"
                    />
                    <p id="table-fee-hint" className="text-xs text-[#6B584C] mt-1.5 font-semibold tabular-nums">
                      {tableCountNum > 0
                        ? `Kurulum: ${formatTL(estimatedSetupFee)} (KDV dahil)`
                        : `Masa başı ${formatTL(SETUP_FEE_PER_TABLE)}`}
                    </p>
                  </div>
                </div>

                <fieldset>
                  <legend className={LABEL_CLASS}>Mekanınızın müzik yayın lisansı var mı? *</legend>
                  <p className="text-xs text-[#6B584C] mb-2">MESAM/MSG, MÜ-YAP ve MÜYORBİR lisansları</p>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {([
                      ['var', 'Evet, var'],
                      ['surecte', 'Başvurum sürüyor'],
                      ['yok', 'Hayır, yok'],
                    ] as const).map(([value, label]) => (
                      <label
                        key={value}
                        className={`flex items-center gap-2 px-3.5 rounded-xl border cursor-pointer min-h-[46px] text-xs sm:text-sm font-semibold transition-colors duration-150 ${
                          partnerForm.license === value
                            ? 'bg-white border-[#8C5226] text-[#26170F]'
                            : 'bg-[#FAF6F1] border-[#DACDC0] text-[#4A3426] hover:bg-white'
                        }`}
                      >
                        <input
                          type="radio"
                          name="license"
                          value={value}
                          required
                          checked={partnerForm.license === value}
                          onChange={() => setPartnerForm({ ...partnerForm, license: value })}
                          className="accent-[#8C5226]"
                        />
                        <span>{label}</span>
                      </label>
                    ))}
                  </div>
                  {partnerForm.license === 'yok' && (
                    <div role="note" className="sc-fade mt-3 p-4 rounded-xl bg-amber-50/90 border border-amber-300 text-xs text-[#362217] leading-relaxed space-y-2">
                      <p className="font-bold text-amber-900">Muzikors yalnızca lisanslı mekanlarla çalışır.</p>
                      <p>
                        Mekanda müzik yayını için MESAM/MSG (eser sahipleri), MÜ-YAP (yapımcılar) ve MÜYORBİR (icracılar) lisansı yasal zorunluluktur.
                        TÜRES veya TURYİD üyesi işletmeler, 2025 gastronomi protokolü kapsamındaki indirimli tarifelerden yararlanabilir.
                        Lisans başvurunuzu başlattığınızda &ldquo;Başvurum sürüyor&rdquo; seçeneğiyle bize ulaşabilirsiniz; süreçte yol göstermekten memnuniyet duyarız.
                      </p>
                      <a
                        href="https://wa.me/905068638306?text=Merhaba%20Muzikors,%20mekan%C4%B1m%20i%C3%A7in%20m%C3%BCzik%20yay%C4%B1n%20lisans%C4%B1%20alma%20s%C3%BCreci%20hakk%C4%B1nda%20bilgi%20almak%20istiyorum."
                        target="_blank"
                        rel="noreferrer"
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#241A14] hover:bg-black text-white font-bold text-xs transition duration-150 active:scale-95 min-h-[44px]"
                      >
                        <MessageCircle className="w-4 h-4 text-emerald-400" />
                        <span>Lisans Süreci İçin Bilgi Al</span>
                      </a>
                    </div>
                  )}
                </fieldset>

                <div>
                  <label htmlFor="email" className={LABEL_CLASS}>
                    E-posta Adresi (İsteğe Bağlı)
                  </label>
                  <input
                    id="email"
                    type="email"
                    autoComplete="email"
                    value={partnerForm.email}
                    onChange={(e) => setPartnerForm({ ...partnerForm, email: e.target.value })}
                    placeholder="iletisim@mekan.com"
                    className={INPUT_CLASS}
                  />
                </div>

                <label className="flex items-start gap-2.5 text-xs text-[#4A3426] leading-relaxed cursor-pointer min-h-[44px]">
                  <input
                    type="checkbox"
                    required
                    checked={partnerForm.termsAccepted}
                    onChange={(e) => setPartnerForm({ ...partnerForm, termsAccepted: e.target.checked })}
                    className="mt-0.5 w-4 h-4 accent-[#8C5226] shrink-0"
                  />
                  <span>
                    <Link href="/legal/venue" target="_blank" className="font-bold text-[#26170F] underline underline-offset-2">
                      Mekan Hizmet Sözleşmesi
                    </Link>
                    &apos;ni okudum; müzik yayın lisansı ve telif yükümlülüklerinin mekana ait olduğunu kabul ediyorum.
                  </span>
                </label>

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submittingLead || partnerForm.license === 'yok'}
                    aria-busy={submittingLead}
                    className="w-full py-3.5 rounded-xl bg-[#241A14] hover:bg-[#150E0A] disabled:opacity-60 disabled:cursor-wait text-[#FAF6F0] font-black text-sm transition duration-150 shadow-md active:scale-95 cursor-pointer flex items-center justify-center gap-2 min-h-[46px]"
                  >
                    {submittingLead ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin text-white" />
                        <span>Başvuru İletiliyor...</span>
                      </>
                    ) : (
                      <>
                        <span>Başvuruyu Gönder</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>

                <p className="text-xs text-[#6B584C] text-center pt-1 font-medium">
                  Bilgileriniz Gizlilik Politikamız ve KVKK kapsamında korunur. Doğrudan WhatsApp hattımız: <span className="font-bold text-[#26170F] tabular-nums">0506 863 83 06</span>
                </p>

              </form>
            )}

          </div>

        </div>
      </section>

      {/* ── SSS (SIKÇA SORULAN SORULAR) ACCORDION ──────────────────────────── */}
      <section id="sss" className="py-14 sm:py-24 border-b border-[#E8DFD3] bg-[#FAF7F2]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16">
            <h2 className="text-2xl sm:text-4xl font-black text-[#26170F] tracking-tight text-balance">
              Sıkça Sorulan Sorular
            </h2>
            <p className="text-sm text-[#635044] mt-2">
              Muzikors sistemi, akrilik pleksi kiti ve kafe paneli hakkında aklınıza takılanlar.
            </p>
          </div>

          {/* Kart yığını yerine çizgiyle ayrılan liste; cevaplar DOM'da kalır (SEO) ve grid-rows ile açılır */}
          <div className="border-t border-[#E0D4C6]">
            {FAQS.map((faq, index) => {
              const isOpen = openFaq === index;
              const panelId = `sc-faq-panel-${index}`;
              const buttonId = `sc-faq-button-${index}`;
              return (
                <div key={faq.q} className="border-b border-[#E0D4C6]">
                  <h3>
                    <button
                      id={buttonId}
                      type="button"
                      onClick={() => setOpenFaq(isOpen ? null : index)}
                      className="group w-full py-4 sm:py-5 text-left flex items-center justify-between gap-4 cursor-pointer min-h-[48px]"
                      aria-expanded={isOpen}
                      aria-controls={panelId}
                    >
                      <span className="text-sm sm:text-base font-bold text-[#26170F] group-hover:text-[#8C5226] transition-colors duration-150">{faq.q}</span>
                      <ChevronDown
                        className={`w-4 h-4 text-[#8C5226] transition-transform duration-300 ease-[cubic-bezier(0.16,1,0.3,1)] shrink-0 ${
                          isOpen ? 'rotate-180' : ''
                        }`}
                      />
                    </button>
                  </h3>
                  <div
                    id={panelId}
                    role="region"
                    aria-labelledby={buttonId}
                    className="sc-collapse"
                    data-open={isOpen}
                    inert={!isOpen}
                  >
                    <div className="sc-collapse-inner">
                      <p className="pb-5 pr-8 text-sm text-[#635044] leading-relaxed max-w-[68ch]">
                        {faq.a}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      </section>

      {/* ── FOOTER (ILIK KAHVE & CREMA TEMASI) ─────────────────────────────── */}
      <footer className="bg-[#EFE7DC] pt-12 pb-16 text-[#635044] border-t border-[#DFD3C4]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 pb-10 border-b border-[#DFD3C4]">

            {/* Marka & Tanım */}
            <div className="md:col-span-6 lg:col-span-5 space-y-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-[#241A14] flex items-center justify-center p-1.5 shadow-sm">
                  <img src="/logo.png" alt="Muzikors Logo" width={32} height={32} loading="lazy" decoding="async" className="w-full h-full object-contain" />
                </div>
                <span className="text-base font-black text-[#26170F] tracking-tight">Muzikors İnteraktif Müzik</span>
              </div>
              <p className="text-xs text-[#5C4A3E] leading-relaxed max-w-sm">
                Muzikors; kafe, bar ve restoranlarda misafirlerin dinlenen müziğe ortaklaşa karar verdiği interaktif sosyal müzik kutusu altyapısıdır.
              </p>
              <div className="text-xs text-[#6B584C] space-y-0.5 pt-1">
                <div>&copy; {new Date().getFullYear()} Muzikors. Tüm hakları saklıdır.</div>
                <div>Geliştirici &amp; Kurucu: <strong className="text-[#26170F] font-semibold">Yunus Emre Gedik</strong></div>
              </div>
            </div>

            {/* Yasal & Güvenlik */}
            <div className="md:col-span-3 lg:col-span-4 space-y-2">
              <span className="text-xs font-bold text-[#26170F] block uppercase tracking-wider mb-2">
                Yasal Bilgiler &amp; Güvenlik
              </span>
              <ul className="space-y-1 text-xs">
                <li>
                  <Link href="/privacy" className="inline-flex items-center py-1.5 text-[#5C4A3E] hover:text-[#26170F] transition-colors duration-150">
                    KVKK ve Gizlilik Politikası
                  </Link>
                </li>
                <li>
                  <Link href="/legal/terms" className="inline-flex items-center py-1.5 text-[#5C4A3E] hover:text-[#26170F] transition-colors duration-150">
                    Kullanıcı Hizmet Sözleşmesi
                  </Link>
                </li>
                <li>
                  <Link href="/legal/refund" className="inline-flex items-center py-1.5 text-[#5C4A3E] hover:text-[#26170F] transition-colors duration-150">
                    Abonelik İptal &amp; İade Koşulları
                  </Link>
                </li>
                <li>
                  <Link href="/legal/venue" className="inline-flex items-center py-1.5 text-[#5C4A3E] hover:text-[#26170F] transition-colors duration-150">
                    Mekan Hizmet Sözleşmesi
                  </Link>
                </li>
                <li>
                  <Link href="/delete-account" className="inline-flex items-center py-1.5 text-[#6B584C] hover:text-[#26170F] transition-colors duration-150">
                    Hesap ve Veri Silme Talebi
                  </Link>
                </li>
              </ul>
            </div>

            {/* İletişim & Destek */}
            <div className="md:col-span-3 space-y-2">
              <span className="text-xs font-bold text-[#26170F] block uppercase tracking-wider mb-2">
                İletişim &amp; Destek
              </span>
              <ul className="space-y-1.5 text-xs">
                <li>
                  <a href="mailto:destek@muzikors.com" className="inline-flex items-center py-1 text-[#3D281B] hover:text-[#26170F] font-medium transition-colors duration-150">
                    destek@muzikors.com
                  </a>
                </li>
                <li>
                  <a
                    href="https://wa.me/905068638306"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 py-1 text-emerald-800 font-bold hover:underline underline-offset-4"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span className="tabular-nums">WhatsApp: 0506 863 83 06</span>
                  </a>
                </li>
                <li>
                  <span className="text-xs text-[#6B584C] block pt-1 tabular-nums">
                    Haftanın 7 Günü: 10:00 - 02:00
                  </span>
                </li>
              </ul>
            </div>

          </div>

          <div className="pt-6 flex flex-col sm:flex-row items-center justify-between text-xs text-[#6B584C] gap-2">
            <span>Muzikors Türkiye · İstanbul</span>
            <div className="flex items-center gap-4">
              <a href="https://kafe.muzikors.com.tr" target="_blank" rel="noreferrer" className="py-1 text-[#5C4A3E] hover:text-[#26170F] font-bold transition-colors duration-150">
                Kafe Yönetim Paneli
              </a>
              <a href="https://admin.muzikors.com.tr" target="_blank" rel="noreferrer" className="py-1 text-[#5C4A3E] hover:text-[#26170F] font-bold transition-colors duration-150">
                Admin Panel
              </a>
            </div>
          </div>

        </div>
      </footer>

    </div>
  );
};
