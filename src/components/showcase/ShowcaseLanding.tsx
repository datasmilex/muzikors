'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  QrCode,
  Play,
  ShieldCheck,
  Zap,
  Crown,
  Store,
  ArrowRight,
  ExternalLink,
  MessageCircle,
  CheckCircle2,
  Music,
  Radio,
  Check,
  Tv,
  ChevronDown,
  Menu,
  X,
  Loader2,
  Search,
  KeyRound,
  AlertCircle
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';

export const ShowcaseLanding: React.FC = () => {
  const router = useRouter();

  // Quick Venue Connect State
  const [quickCode, setQuickCode] = useState('');

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

  // Mockup Interactive State
  const [mockupMode, setMockupMode] = useState<'preview' | 'connect'>('preview');
  const [mockupPin, setMockupPin] = useState('');
  const [mockVotes, setMockVotes] = useState(14);
  const [hasVotedMock, setHasVotedMock] = useState(false);

  // Handle Quick Connect Submit
  const handleQuickConnect = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = quickCode.trim();
    if (!clean) return;
    router.push(`/?v=${encodeURIComponent(clean)}`);
  };

  const handleMockupConnect = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = mockupPin.trim();
    if (!clean) return;
    router.push(`/?v=${encodeURIComponent(clean)}`);
  };

  const toggleMockVote = () => {
    if (hasVotedMock) {
      setMockVotes((v) => v - 1);
      setHasVotedMock(false);
    } else {
      setMockVotes((v) => v + 1);
      setHasVotedMock(true);
    }
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
      q: 'Mekan sahibi olarak Muzikors\'u işletmeme nasıl kurarım?',
      a: 'Muzikors için pahalı donanım yatırımlarına gerek yoktur. İşletmenizin mevcut ses sistemi ve bir Spotify Premium hesabı yeterlidir. Kafe yönetim panelimizden dakikalar içinde canlı yayına başlayabilirsiniz.'
    },
    {
      q: 'İstenmeyen veya mekana uymayan şarkıları engelleyebilir miyim?',
      a: 'Kesinlikle. Kafe Yönetim Panelinde yer alan "Vibe Guard" teknolojisi ile mekanınızın konseptine uymayan müzik türlerini filtreleyebilir, çalma listesi sınırları koyabilir veya istemediğiniz parçaları tek dokunuşla sıradan atlayabilirsiniz.'
    },
    {
      q: 'TV Ekranında canlı sırayı nasıl gösteririm?',
      a: 'Mekanınızdaki televizyona veya projeksiyona kafe panelimizdeki "TV Modu" ekranını yansıtarak, masalarda kimin hangi şarkıyı istediğini ve canlı sırayı dev ekranda şık bir görsel şov olarak sunabilirsiniz.'
    }
  ];

  return (
    <div className="min-h-screen bg-[#070604] text-white font-sans selection:bg-[#E5A93C] selection:text-black antialiased overflow-x-hidden">
      
      {/* ── TOP NAV BAR ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-50 backdrop-blur-xl bg-[#070604]/90 border-b border-white/[0.08]">
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
            <a href="#sss" className="hover:text-white transition-colors">Sıkça Sorulanlar</a>
            <Link href="/privacy" className="hover:text-white transition-colors">Yasal Bilgiler</Link>
          </nav>

          {/* Action CTAs */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* QR Okut - Permanent on Mobile and Desktop */}
            <Link
              href="/qr"
              className="inline-flex items-center gap-1.5 px-3 sm:px-3.5 py-2 rounded-xl bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-xs font-bold text-neutral-200 transition-all active:scale-95"
            >
              <QrCode className="w-4 h-4 text-[#E5A93C]" />
              <span className="hidden xs:inline">QR Okut</span>
            </Link>

            <Link
              href="/app"
              className="inline-flex items-center gap-1.5 sm:gap-2 px-3.5 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-[#E5A93C] hover:bg-[#F59E0B] text-black font-black text-xs transition-all shadow-[0_4px_20px_rgba(229,169,60,0.3)] active:scale-95 cursor-pointer"
            >
              <span>Uygulamayı Aç</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            {/* Mobile Hamburger Toggle */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl bg-white/[0.04] border border-white/10 text-neutral-300 hover:text-white active:scale-95"
              aria-label="Menüyü Aç"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-white/[0.08] bg-[#070604]/95 px-4 py-4 space-y-3 backdrop-blur-2xl">
            <a
              href="#nasil-calisir"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-neutral-300 hover:text-white py-1.5"
            >
              Nasıl Çalışır?
            </a>
            <a
              href="#ozellikler"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-neutral-300 hover:text-white py-1.5"
            >
              Özellikler
            </a>
            <a
              href="#mekanlar"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-neutral-300 hover:text-white py-1.5"
            >
              Mekanlar İçin
            </a>
            <a
              href="#sss"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-neutral-300 hover:text-white py-1.5"
            >
              Sıkça Sorulanlar (SSS)
            </a>
            <Link
              href="/privacy"
              onClick={() => setMobileMenuOpen(false)}
              className="block text-sm font-semibold text-neutral-300 hover:text-white py-1.5"
            >
              Yasal Bilgiler &amp; KVKK
            </Link>
          </div>
        )}
      </header>

      {/* ── HERO SECTION ─────────────────────────────────────────────────── */}
      <section className="relative pt-10 sm:pt-16 lg:pt-24 pb-16 sm:pb-24 border-b border-white/[0.06] overflow-hidden">
        
        {/* Crisp Top Highlight Line (Clean Obsidian Grounding - No Artificial Halo) */}
        <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#E5A93C]/30 to-transparent pointer-events-none" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
            
            {/* Left Column: Value Proposition */}
            <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
              
              {/* Confident Integrated Kicker (No Pill AI Chip) */}
              <div className="flex items-center justify-center lg:justify-start gap-2.5 text-xs font-bold text-[#E5A93C] uppercase tracking-widest">
                <span className="w-2 h-2 rounded-full bg-[#E5A93C]" />
                <span>Mekanların İnteraktif Müzik Platformu</span>
              </div>

              {/* Punchy Title */}
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight leading-[1.1]">
                Mekanların Ritmini <br />
                <span className="text-[#E5A93C]">Sen Yönet.</span>
              </h1>

              {/* Subtitle */}
              <p className="text-sm sm:text-base text-neutral-300 max-w-xl mx-auto lg:mx-0 leading-relaxed font-normal">
                Kafede, barda veya restoranda çalan müziğe doğrudan telefonundan yön ver. Masandaki QR kodu okut veya mekan kodunu gir; Spotify kataloğundan dilediğin şarkıyı sıraya ekle.
              </p>

              {/* Quick 4-Digit Venue Code / Table PIN Connector */}
              <form onSubmit={handleQuickConnect} className="pt-1 max-w-md mx-auto lg:mx-0">
                <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/[0.04] border border-white/10 focus-within:border-[#E5A93C] transition-all shadow-inner">
                  <div className="pl-3 text-neutral-400">
                    <KeyRound className="w-4 h-4 text-[#E5A93C]" />
                  </div>
                  <input
                    type="text"
                    value={quickCode}
                    onChange={(e) => setQuickCode(e.target.value)}
                    placeholder="Masa veya Mekan Kodu (Örn: 2)"
                    className="flex-1 bg-transparent px-2 py-2 text-xs sm:text-sm text-white placeholder-neutral-500 focus:outline-none font-medium"
                    aria-label="Mekan Kodu"
                  />
                  <button
                    type="submit"
                    className="px-4 py-2 rounded-xl bg-[#E5A93C] hover:bg-[#F59E0B] text-black font-bold text-xs transition-all active:scale-95 cursor-pointer shrink-0"
                  >
                    Bağlan
                  </button>
                </div>
              </form>

              {/* Primary Launch Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3 sm:gap-4 pt-1">
                <Link
                  href="/app"
                  className="w-full sm:w-auto px-7 py-3.5 rounded-2xl bg-[#E5A93C] hover:bg-[#F59E0B] text-black font-black text-sm flex items-center justify-center gap-2.5 shadow-[0_10px_30px_rgba(229,169,60,0.25)] active:scale-95 transition-all cursor-pointer min-h-[44px]"
                >
                  <Play className="w-4 h-4 fill-black" />
                  <span>Web Uygulamasını Başlat</span>
                </Link>

                <a
                  href="https://play.google.com/store/apps/details?id=com.muzikors.app"
                  target="_blank"
                  rel="noreferrer"
                  className="w-full sm:w-auto px-6 py-3.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.09] border border-white/10 text-white font-bold text-sm flex items-center justify-center gap-2.5 active:scale-95 transition-all min-h-[44px]"
                >
                  <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24" aria-hidden="true">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Google Play&apos;den İndir</span>
                </a>
              </div>

              {/* Quick Trust Badges */}
              <div className="pt-3 flex flex-wrap items-center justify-center lg:justify-start gap-6 text-xs text-neutral-400 font-medium">
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
                  <span>Kredi Satışı Yoktur</span>
                </span>
              </div>

            </div>

            {/* Right Column: Interactive Phone Jukebox Mockup (User Choice A2) */}
            <div className="lg:col-span-5 flex justify-center">
              <div className="relative w-full max-w-[340px] sm:max-w-[360px]">
                
                {/* Clean Obsidian Phone Frame */}
                <div className="rounded-[40px] bg-[#0E0C0A] border-2 border-white/10 p-3.5 shadow-[0_25px_60px_-15px_rgba(0,0,0,0.9)]">
                  
                  {/* Dynamic Island / Speaker Pill */}
                  <div className="flex justify-center mb-3">
                    <div className="w-24 h-4 rounded-full bg-black/80 border border-white/10 flex items-center justify-center">
                      <div className="w-2.5 h-2.5 rounded-full bg-neutral-800 mr-2" />
                      <div className="w-8 h-1 rounded-full bg-neutral-800" />
                    </div>
                  </div>

                  {/* Mode Selector Tabs inside Mockup */}
                  <div className="flex items-center gap-1 p-1 mb-3 rounded-xl bg-black/60 border border-white/10 text-[11px] font-bold">
                    <button
                      type="button"
                      onClick={() => setMockupMode('preview')}
                      className={`flex-1 py-1.5 rounded-lg transition-all text-center ${
                        mockupMode === 'preview'
                          ? 'bg-[#E5A93C] text-black shadow-sm'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Mekan Önizlemesi
                    </button>
                    <button
                      type="button"
                      onClick={() => setMockupMode('connect')}
                      className={`flex-1 py-1.5 rounded-lg transition-all text-center ${
                        mockupMode === 'connect'
                          ? 'bg-[#E5A93C] text-black shadow-sm'
                          : 'text-neutral-400 hover:text-white'
                      }`}
                    >
                      Masa Kodu Gir
                    </button>
                  </div>

                  {mockupMode === 'preview' ? (
                    /* Tab 1: Simulated Velvet Lounge Jukebox */
                    <div className="space-y-3">
                      {/* Venue Banner */}
                      <div className="flex items-center justify-between pb-2 border-b border-white/[0.08]">
                        <div className="flex items-center gap-2">
                          <div className="w-7 h-7 rounded-lg bg-[#E5A93C]/20 border border-[#E5A93C]/40 flex items-center justify-center text-[#E5A93C]">
                            <Store className="w-3.5 h-3.5" />
                          </div>
                          <div>
                            <span className="text-xs font-bold text-white block">Velvet Lounge &amp; Bar</span>
                            <span className="text-[10px] text-emerald-400 flex items-center gap-1">
                              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                              Müzik Sistemi Aktif
                            </span>
                          </div>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-white/5 border border-white/10 text-neutral-300">
                          Masa #12
                        </span>
                      </div>

                      {/* Currently Playing Card */}
                      <div className="rounded-2xl bg-black/40 border border-white/10 p-3 space-y-2.5">
                        <div className="flex items-center justify-between">
                          <span className="text-[9px] font-bold uppercase tracking-widest text-[#E5A93C]">Şu An Çalıyor</span>
                          <span className="text-[10px] text-neutral-400 font-mono">02:14 / 04:08</span>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-12 h-12 rounded-xl bg-neutral-900 border border-white/10 flex items-center justify-center shrink-0 overflow-hidden">
                            <Music className="w-6 h-6 text-[#E5A93C]" />
                          </div>
                          <div className="min-w-0 flex-1">
                            <h4 className="text-xs font-bold text-white truncate">Get Lucky (feat. Pharrell)</h4>
                            <p className="text-[10px] text-neutral-400 truncate">Daft Punk • Random Access</p>
                          </div>
                        </div>

                        {/* Scrub Bar */}
                        <div className="w-full bg-white/10 h-1.5 rounded-full overflow-hidden">
                          <div className="bg-[#E5A93C] h-full w-[55%]" />
                        </div>
                      </div>

                      {/* Up Next List */}
                      <div className="space-y-1.5">
                        <span className="text-[9px] font-bold uppercase tracking-wider text-neutral-400 block px-1">Sıradaki Parça</span>
                        <div className="flex items-center justify-between p-2.5 rounded-xl bg-white/[0.03] border border-white/[0.06]">
                          <div className="min-w-0 flex-1 pr-2">
                            <span className="text-xs font-semibold text-white truncate block">Blinding Lights</span>
                            <span className="text-[10px] text-neutral-400 truncate block">The Weeknd</span>
                          </div>
                          
                          {/* Interactive Vote Button */}
                          <button
                            type="button"
                            onClick={toggleMockVote}
                            className={`px-2.5 py-1 rounded-lg border text-[10px] font-bold flex items-center gap-1 transition-all active:scale-90 ${
                              hasVotedMock
                                ? 'bg-[#E5A93C] text-black border-[#E5A93C]'
                                : 'bg-white/5 border-white/10 text-neutral-200 hover:border-[#E5A93C]/50'
                            }`}
                            aria-label="Şarkıya oy ver"
                          >
                            <span>▲</span>
                            <span>{mockVotes}</span>
                          </button>
                        </div>
                      </div>

                      {/* Bottom CTA Button */}
                      <Link
                        href="/app"
                        className="w-full py-2.5 rounded-xl bg-[#E5A93C] hover:bg-[#F59E0B] text-black font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all active:scale-95"
                      >
                        <Zap className="w-3.5 h-3.5 fill-black" />
                        <span>Sen de Şarkı İste</span>
                      </Link>
                    </div>
                  ) : (
                    /* Tab 2: Interactive Table PIN Connect (Direct Action) */
                    <form onSubmit={handleMockupConnect} className="py-3 px-1 space-y-4">
                      <div className="text-center space-y-1">
                        <KeyRound className="w-6 h-6 text-[#E5A93C] mx-auto" />
                        <h4 className="text-xs font-bold text-white">Masa / Mekan Kodu</h4>
                        <p className="text-[10px] text-neutral-400">Masandaki kodu girerek doğrudan o mekanın sırasına katıl.</p>
                      </div>

                      <div>
                        <input
                          type="text"
                          value={mockupPin}
                          onChange={(e) => setMockupPin(e.target.value)}
                          placeholder="Örn: 2"
                          className="w-full bg-black/60 border border-white/15 rounded-xl px-3 py-2.5 text-center text-sm font-bold text-white placeholder-neutral-500 focus:outline-none focus:border-[#E5A93C]"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 rounded-xl bg-[#E5A93C] hover:bg-[#F59E0B] text-black font-black text-xs flex items-center justify-center gap-1.5 shadow-md transition-all active:scale-95"
                      >
                        <span>Mekana Katıl</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>

                      <p className="text-[10px] text-neutral-500 text-center">
                        Mekanda değilseniz <Link href="/app" className="text-[#E5A93C] hover:underline">Web Jukebox</Link> ile demo deneyimini inceleyebilirsiniz.
                      </p>
                    </form>
                  )}

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
            <span className="text-xs font-bold uppercase tracking-widest text-[#E5A93C]">Kusursuz Deneyim</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              3 Adımda Mekanın Müzik Akışına Katıl
            </h2>
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
              <h3 className="text-base sm:text-lg font-bold text-white">Masadaki QR&apos;ı Okut</h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Masanızdaki Muzikors QR kodunu telefonunuzun kamerasıyla veya web sitemizden tarayın. Tarayıcınız otomatik olarak bulunduğunuz mekana bağlanır.
              </p>
            </div>

            {/* Step 2 */}
            <div className="bg-[#120D09] rounded-3xl p-6 sm:p-8 border border-white/[0.08] relative group hover:border-[#E5A93C]/40 transition-colors space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#E5A93C]/10 border border-[#E5A93C]/30 flex items-center justify-center text-[#E5A93C] font-black text-lg">
                2
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">Parçanı Seç &amp; Sırala</h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Milyonlarca Spotify şarkısı arasından en sevdiğini ara, 30 saniyelik önizlemeyi dinle ve mekanın canlı çalma sırasına anında gönder.
              </p>
            </div>

            {/* Step 3 */}
            <div className="bg-[#120D09] rounded-3xl p-6 sm:p-8 border border-white/[0.08] relative group hover:border-[#E5A93C]/40 transition-colors space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-[#E5A93C]/10 border border-[#E5A93C]/30 flex items-center justify-center text-[#E5A93C] font-black text-lg">
                3
              </div>
              <h3 className="text-base sm:text-lg font-bold text-white">Oyla &amp; Ritmi Yakala</h3>
              <p className="text-xs sm:text-sm text-neutral-400 leading-relaxed">
                Sıradaki şarkılara masandaki arkadaşlarınla oy ver. En çok oy alan şarkı en öne çıksın, gecenin havasını hep beraber belirleyin.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ── ÖNE ÇIKAN ÖZELLİKLER ─────────────────────────────────────────── */}
      <section id="ozellikler" className="py-16 sm:py-24 border-t border-white/[0.06]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#E5A93C]">Modern Teknoloji</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              Sosyal Jukebox Deneyimini Yeniden Tanımladık
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400">
              Hem müzikseverler hem de işletme sahipleri için en ince ayrıntısına kadar tasarlanmış özellikler.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            
            {/* Feature 1 */}
            <div className="bg-[#120D09] rounded-2xl p-6 border border-white/[0.08] space-y-3.5 hover:border-white/20 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#E5A93C]">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Vibe Guard Koruma</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Mekanın tarzına uymayan parçalar filtrelenir. İşletme sahibi izin verilen müzik türlerini belirler, atmosfer daima korunur.
              </p>
            </div>

            {/* Feature 2 */}
            <div className="bg-[#120D09] rounded-2xl p-6 border border-white/[0.08] space-y-3.5 hover:border-white/20 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#E5A93C]">
                <Crown className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Muzikors VIP Abonelik</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Kredi satışı veya jeton hilesi yoktur. Google Play üzerinden tek bir VIP abonelikle reklamsız, limitsiz ve öncelikli şarkı isteyin.
              </p>
            </div>

            {/* Feature 3 */}
            <div className="bg-[#120D09] rounded-2xl p-6 border border-white/[0.08] space-y-3.5 hover:border-white/20 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#E5A93C]">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">Anlık Sıra &amp; Oylama</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Her masadaki oylar anlık olarak toplanır. Popüler parçalar sıranın başına tırmanır, mekanın ortak enerjisi hoparlörlere yansır.
              </p>
            </div>

            {/* Feature 4 */}
            <div className="bg-[#120D09] rounded-2xl p-6 border border-white/[0.08] space-y-3.5 hover:border-white/20 transition-all">
              <div className="w-10 h-10 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-[#E5A93C]">
                <Tv className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-white">TV &amp; Bar Ekran Modu</h3>
              <p className="text-xs text-neutral-400 leading-relaxed">
                Mekan içi televizyonlara veya projeksiyonlara yansıtılabilen dev ekran modu sayesinde canlı şarkı sırası şık bir şova dönüşür.
              </p>
            </div>

          </div>

        </div>
      </section>

      {/* ── MEKANLAR İÇİN ORTAKLIK BÖLÜMÜ ─────────────────────────────────── */}
      <section id="mekanlar" className="py-16 sm:py-24 border-t border-white/[0.06] bg-black/40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Left Info */}
            <div className="lg:col-span-6 space-y-6 text-center lg:text-left">
              <span className="text-xs font-bold uppercase tracking-widest text-[#E5A93C]">İşletmeler İçin</span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
                Kafenizde Müzik Karmaşasına Son Verin
              </h2>
              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                Garsonların veya müşterilerin telefondan sürekli şarkı değiştirmesi yerine, misafirlerinize modern ve prestijli bir etkileşim sunun. Mevcut ses sisteminiz ve bir Spotify Premium hesabı kurulum için yeterlidir.
              </p>

              <div className="space-y-3.5 pt-2 text-left">
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-white block">Sıfır Donanım Maliyeti</strong>
                    <span className="text-[11px] text-neutral-400">Pahalı jukebox kutuları almanıza gerek yok. Mevcut bilgisayar veya tabletinizle anında çalışır.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
                    <Check className="w-3 h-3" />
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-white block">Masa Başı Akrilik Stant &amp; QR Kiti</strong>
                    <span className="text-[11px] text-neutral-400">Mekanınıza özel tasarlanmış kaliteli akrilik masa stantları ve QR kod etiketleri ekibimizce teslim edilir.</span>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0 mt-0.5">
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
                  className="inline-flex items-center gap-2 text-xs font-bold text-[#E5A93C] hover:underline min-h-[44px]"
                >
                  <span>Mevcut Ortak mısınız? Kafe Yönetim Paneline Giriş Yap</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            </div>

            {/* Right Contact / Lead Form */}
            <div className="lg:col-span-6">
              <div className="bg-[#120D09] rounded-3xl p-6 sm:p-8 border border-white/10 shadow-2xl space-y-5">
                <div className="border-b border-white/10 pb-4">
                  <h3 className="text-lg font-bold text-white">Mekan Ortaklığı Başvurusu</h3>
                  <p className="text-xs text-neutral-400 mt-0.5">Bilgilerinizi bırakın, ekibimiz kurulum için sizinle 24 saat içinde iletişime geçsin.</p>
                </div>

                {leadError && (
                  <div className="p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs flex items-center gap-2">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{leadError}</span>
                  </div>
                )}

                {partnerSubmitted ? (
                  <div className="text-center py-8 space-y-3">
                    <div className="w-12 h-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto text-emerald-400">
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
                        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold hover:bg-emerald-500/30 transition-all active:scale-95"
                      >
                        <MessageCircle className="w-4 h-4" />
                        <span>Hızlı İletişim İçin WhatsApp&apos;tan Yazın</span>
                      </a>
                    </div>
                  </div>
                ) : (
                  <form onSubmit={handlePartnerSubmit} className="space-y-3.5">
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
                        placeholder="Örn: Velvet Lounge"
                        className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#E5A93C] transition-all"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#E5A93C] transition-all"
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
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#E5A93C] transition-all"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
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
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#E5A93C] transition-all"
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
                          className="w-full bg-black/40 border border-white/10 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#E5A93C] transition-all"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={submittingLead}
                      className="w-full py-3 rounded-xl bg-[#E5A93C] hover:bg-[#F59E0B] disabled:opacity-50 text-black font-black text-xs transition-all shadow-lg active:scale-95 cursor-pointer flex items-center justify-center gap-2 min-h-[44px]"
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

      {/* ── SSS (FAQ) ACCORDION BÖLÜMÜ (P2 Fix: Replaces Changelog) ─────────── */}
      <section id="sss" className="py-16 sm:py-24 border-t border-white/[0.06]">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="text-center max-w-2xl mx-auto mb-12 sm:mb-16 space-y-3">
            <span className="text-xs font-bold uppercase tracking-widest text-[#E5A93C]">Aklınıza Takılanlar</span>
            <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight">
              Sıkça Sorulan Sorular
            </h2>
            <p className="text-xs sm:text-sm text-neutral-400">
              Muzikors sistemi, mekan entegrasyonu ve abonelik modeli hakkında merak edilenler.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={index}
                  className="bg-[#120D09] rounded-2xl border border-white/[0.08] overflow-hidden transition-colors"
                >
                  <button
                    type="button"
                    onClick={() => setOpenFaq(isOpen ? null : index)}
                    className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 cursor-pointer active:bg-white/[0.02]"
                    aria-expanded={isOpen}
                  >
                    <span className="text-sm sm:text-base font-bold text-white">{faq.q}</span>
                    <ChevronDown
                      className={`w-4 h-4 text-[#E5A93C] transition-transform duration-200 shrink-0 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-4 sm:px-5 pb-4 sm:pb-5 text-xs sm:text-sm text-neutral-300 leading-relaxed border-t border-white/[0.04] pt-3">
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
      <footer className="border-t border-white/[0.08] bg-black/60 pt-12 pb-16 text-neutral-400">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 pb-12 border-b border-white/[0.06]">
            
            {/* Col 1: Brand & Identity */}
            <div className="md:col-span-6 lg:col-span-5 space-y-4">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-white/[0.04] border border-white/10 p-1.5 flex items-center justify-center">
                  <img src="/logo.png" alt="Muzikors Logo" className="w-full h-full object-contain" />
                </div>
                <span className="text-base font-bold text-white tracking-tight">Muzikors Social Jukebox</span>
              </div>
              <p className="text-xs text-neutral-400 leading-relaxed max-w-sm">
                Muzikors, kafe ve mekanlarda müşterilerin dinlenen müziğe ortaklaşa karar verdiği interaktif sosyal müzik kutusu platformudur.
              </p>
              <div className="text-[11px] text-neutral-500">
                &copy; {new Date().getFullYear()} Muzikors Inc. Tüm hakları saklıdır.
              </div>
            </div>

            {/* Col 2: Legal Links (With >=44px Touch Targets) */}
            <div className="md:col-span-3 lg:col-span-4 space-y-2.5">
              <span className="text-xs font-bold text-white block uppercase tracking-wider mb-2">Yasal Bilgiler &amp; Güvenlik</span>
              <ul className="space-y-1 text-xs">
                <li>
                  <Link href="/privacy" className="inline-flex items-center py-2 hover:text-white transition-colors">
                    KVKK ve Gizlilik Politikası
                  </Link>
                </li>
                <li>
                  <Link href="/legal/terms" className="inline-flex items-center py-2 hover:text-white transition-colors">
                    Kullanıcı Hizmet Sözleşmesi
                  </Link>
                </li>
                <li>
                  <Link href="/legal/refund" className="inline-flex items-center py-2 hover:text-white transition-colors">
                    Abonelik İptal &amp; İade Koşulları
                  </Link>
                </li>
                <li>
                  <Link href="/delete-account" className="inline-flex items-center py-2 text-amber-400/80 hover:text-amber-400 transition-colors">
                    Hesap ve Veri Silme Talebi
                  </Link>
                </li>
              </ul>
            </div>

            {/* Col 3: Support & Contact */}
            <div className="md:col-span-3 space-y-2.5">
              <span className="text-xs font-bold text-white block uppercase tracking-wider mb-2">İletişim &amp; Destek</span>
              <ul className="space-y-2 text-xs">
                <li>
                  <a href="mailto:destek@muzikors.com" className="inline-flex items-center py-1 text-neutral-300 hover:text-white transition-colors font-mono">
                    destek@muzikors.com
                  </a>
                </li>
                <li>
                  <a
                    href="https://wa.me/905068638306"
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 py-1 text-emerald-400 hover:underline"
                  >
                    <MessageCircle className="w-4 h-4" />
                    <span>WhatsApp Destek</span>
                  </a>
                </li>
                <li>
                  <span className="text-neutral-500 text-[11px] block pt-1">Haftanın 7 Günü: 10:00 - 02:00</span>
                </li>
              </ul>
            </div>

          </div>

        </div>
      </footer>

    </div>
  );
};
