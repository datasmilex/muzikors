'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Download, 
  Copy, 
  Check, 
  Send,
  Disc3
} from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatUserDisplayName } from '../utils/formatters';

export const StoryShareModal: React.FC = () => {
  const { activeModal, closeModal, nowPlaying, activeVenue, user, showToast } = useApp();
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  if (activeModal !== 'story_share' || !nowPlaying) {
    return null;
  }

  const venueName = activeVenue?.name || activeVenue?.venue_name || 'Muzikors Mekânı';
  const venueId = activeVenue?.id || (activeVenue as any)?.kafe_id;
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://muzikors.com.tr';
  const shareUrl = venueId 
    ? `${baseUrl}/?v=${venueId}` 
    : (typeof window !== 'undefined' ? window.location.href : 'https://muzikors.com.tr');

  const trackTitle = nowPlaying.title || 'Bilinmeyen Şarkı';
  const trackArtist = nowPlaying.artist || 'Bilinmeyen Sanatçı';
  const albumSrc = nowPlaying.albumCover || nowPlaying.coverUrl || nowPlaying.album_art || '/logo.png';

  const isMySong = user && nowPlaying.requestedByUserId === user.id;
  const requesterText = isMySong 
    ? 'Benim Seçimim' 
    : nowPlaying.requestedBy 
      ? `İsteyen: ${formatUserDisplayName(null, nowPlaying.requestedBy.replace(' VIP', ''))}`
      : 'Mekân Seçimi';

  const shareCaption = isMySong
    ? `Şu an ${venueName} salonunda seçtiğim "${trackTitle} - ${trackArtist}" çalıyor! Sen de sıradaki şarkını ekle:`
    : `Şu an ${venueName} salonunda "${trackTitle} - ${trackArtist}" dinliyoruz! Sen de sıraya şarkı ekle:`;

  // ── HTML5 CANVAS 1080x1920 HD STORY GENERATION (STUDIO CRAFT) ────────────
  const generateStoryCanvas = async (): Promise<string | null> => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      // 1. Deep Obsidian Atmosphere Background
      const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1920);
      bgGrad.addColorStop(0, '#09080E');
      bgGrad.addColorStop(0.3, '#13111C');
      bgGrad.addColorStop(0.7, '#161421');
      bgGrad.addColorStop(1, '#060509');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1080, 1920);

      // 2. Subtle Acoustic Radial Grooves
      ctx.save();
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.04)';
      ctx.lineWidth = 1.5;
      for (let r = 260; r <= 860; r += 75) {
        ctx.beginPath();
        ctx.arc(540, 800, r, 0, Math.PI * 2);
        ctx.stroke();
      }
      ctx.restore();

      // Helper to load image safely
      const loadImage = (src: string): Promise<HTMLImageElement> => {
        return new Promise((resolve) => {
          const img = new Image();
          img.crossOrigin = 'anonymous';
          img.onload = () => resolve(img);
          img.onerror = () => {
            const fallback = new Image();
            fallback.onload = () => resolve(fallback);
            fallback.src = '/logo.png';
          };
          img.src = src;
        });
      };

      // 3. Top Header: Real Logo + Brand Wordmark & Sleek Minimal Live Status
      ctx.save();
      // Load and draw Muzikors Logo
      const logoImg = await loadImage('/logo.png');
      const logoSize = 48;
      const logoX = 130;
      const logoY = 160 - logoSize / 2;
      ctx.save();
      ctx.beginPath();
      ctx.roundRect(logoX, logoY, logoSize, logoSize, 12);
      ctx.clip();
      ctx.drawImage(logoImg, logoX, logoY, logoSize, logoSize);
      ctx.restore();

      // Brand Wordmark next to logo
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '800 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('MUZIKORS', logoX + logoSize + 16, 160);

      // Clean Live Status on Top-Right (No clunky oval AI slop pill)
      const liveRightX = 950;
      ctx.fillStyle = '#10B981';
      ctx.font = '800 22px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'right';
      ctx.textBaseline = 'middle';
      ctx.fillText('CANLI', liveRightX, 160);

      // Emerald Live Dot
      const liveTextW = ctx.measureText('CANLI').width;
      ctx.beginPath();
      ctx.arc(liveRightX - liveTextW - 14, 160, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();

      // 4. Venue Identity Strip
      ctx.save();
      const venueY = 240;
      const venueH = 100;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(130, venueY, 820, venueH, 24);
      ctx.fill();
      ctx.stroke();

      // Vinyl Record Icon (Canvas Vector - Zero Emoji)
      const iconCenterX = 185;
      const iconCenterY = venueY + venueH / 2;
      ctx.fillStyle = '#1A1824';
      ctx.strokeStyle = '#D97706';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(iconCenterX, iconCenterY, 28, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Inner Vinyl Rings
      ctx.strokeStyle = 'rgba(245, 158, 11, 0.35)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.arc(iconCenterX, iconCenterY, 18, 0, Math.PI * 2);
      ctx.stroke();
      ctx.beginPath();
      ctx.arc(iconCenterX, iconCenterY, 10, 0, Math.PI * 2);
      ctx.stroke();

      // Spindle Center
      ctx.fillStyle = '#F59E0B';
      ctx.beginPath();
      ctx.arc(iconCenterX, iconCenterY, 4, 0, Math.PI * 2);
      ctx.fill();

      // Venue Name & Subtitle
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '800 32px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      const truncatedVenueName = venueName.length > 26 ? venueName.substring(0, 24) + '...' : venueName;
      ctx.fillText(truncatedVenueName, 235, venueY + 20);

      ctx.fillStyle = '#E6C88B';
      ctx.font = '500 21px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('Mekân Canlı Jukebox', 235, venueY + 58);
      ctx.restore();

      // 5. Centerpiece Artwork with Deep Luxury Drop Shadow
      ctx.save();
      const artSize = 620;
      const artX = (1080 - artSize) / 2;
      const artY = 390;

      // Soft deep drop shadow
      ctx.shadowColor = 'rgba(0, 0, 0, 0.85)';
      ctx.shadowBlur = 70;
      ctx.shadowOffsetY = 24;

      const albumImg = await loadImage(albumSrc);
      ctx.beginPath();
      ctx.roundRect(artX, artY, artSize, artSize, 40);
      ctx.clip();
      ctx.drawImage(albumImg, artX, artY, artSize, artSize);
      ctx.restore();

      // Subtle Outer Glass Border on Artwork
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.16)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(artX, artY, artSize, artSize, 40);
      ctx.stroke();
      ctx.restore();

      // 6. Refined Audio Equalizer Spectrum
      ctx.save();
      const waveY = 1080;
      const waveBarCount = 30;
      const waveBarW = 10;
      const waveGap = 15;
      const totalWaveW = waveBarCount * (waveBarW + waveGap) - waveGap;
      const startWaveX = (1080 - totalWaveW) / 2;

      for (let i = 0; i < waveBarCount; i++) {
        // Tapered center-high profile
        const distFromCenter = Math.abs(i - waveBarCount / 2) / (waveBarCount / 2);
        const centerFactor = Math.cos(distFromCenter * Math.PI * 0.45);
        const height = Math.max(12, Math.round(52 * centerFactor + Math.sin(i * 1.2) * 16));
        const bx = startWaveX + i * (waveBarW + waveGap);
        const by = waveY - height / 2;

        const barGrad = ctx.createLinearGradient(0, by, 0, by + height);
        barGrad.addColorStop(0, '#F59E0B');
        barGrad.addColorStop(1, '#D97706');

        ctx.fillStyle = barGrad;
        ctx.beginPath();
        ctx.roundRect(bx, by, waveBarW, height, 5);
        ctx.fill();
      }
      ctx.restore();

      // 7. Song Title, Artist & Requester
      ctx.save();
      ctx.textAlign = 'center';

      // Title
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '800 52px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      const truncatedTitle = trackTitle.length > 25 ? trackTitle.substring(0, 23) + '...' : trackTitle;
      ctx.fillText(truncatedTitle, 540, 1180);

      // Artist
      ctx.fillStyle = '#E6C88B';
      ctx.font = '600 36px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      const truncatedArtist = trackArtist.length > 30 ? trackArtist.substring(0, 28) + '...' : trackArtist;
      ctx.fillText(truncatedArtist, 540, 1245);

      // Requester Capsule
      const reqW = 380;
      const reqH = 58;
      const reqX = (1080 - reqW) / 2;
      const reqY = 1305;
      ctx.fillStyle = isMySong ? 'rgba(245, 158, 11, 0.15)' : 'rgba(255, 255, 255, 0.05)';
      ctx.strokeStyle = isMySong ? 'rgba(245, 158, 11, 0.4)' : 'rgba(255, 255, 255, 0.1)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(reqX, reqY, reqW, reqH, 29);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = isMySong ? '#FDE68A' : '#D1D5DB';
      ctx.font = '600 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.textBaseline = 'middle';
      ctx.fillText(requesterText, 540, reqY + reqH / 2 + 1);
      ctx.restore();

      // 8. Bottom Footer: Refined Invitation & URL
      ctx.save();
      const footerY = 1540;
      const footerH = 200;
      ctx.fillStyle = 'rgba(20, 18, 28, 0.7)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.roundRect(130, footerY, 820, footerH, 30);
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '800 34px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('Sıradaki Parçayı Sen Seç', 540, footerY + 62);

      ctx.fillStyle = '#9CA3AF';
      ctx.font = '500 24px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText('Masanızdaki QR kodu okutun veya adrese gidin:', 540, footerY + 106);

      ctx.fillStyle = '#F59E0B';
      ctx.font = '800 30px -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif';
      ctx.fillText(venueId ? `muzikors.com.tr/?v=${venueId}` : 'muzikors.com.tr', 540, footerY + 152);
      ctx.restore();

      return canvas.toDataURL('image/png');
    } catch (e) {
      console.error('Error rendering story canvas:', e);
      return null;
    }
  };

  // ── ACTION HANDLERS ───────────────────────────────────────────────────────

  // 1. Download HD Story PNG
  const handleDownload = async () => {
    setIsGenerating(true);
    showToast('HD Hikaye kartı hazırlanıyor...');
    try {
      const dataUrl = await generateStoryCanvas();
      if (!dataUrl) {
        showToast('Görsel oluşturulamadı.');
        return;
      }
      const link = document.createElement('a');
      link.download = `muzikors-story-${Date.now()}.png`;
      link.href = dataUrl;
      link.click();
      showToast('Hikaye kartı başarıyla indirildi.');
    } catch (e) {
      showToast('Görsel indirilirken hata oluştu.');
    } finally {
      setIsGenerating(false);
    }
  };

  // 2. Instagram Stories
  const handleInstagramShare = async () => {
    setIsGenerating(true);
    showToast('Instagram için hikaye kartı oluşturuluyor...');
    try {
      const dataUrl = await generateStoryCanvas();
      if (dataUrl) {
        const link = document.createElement('a');
        link.download = `muzikors-story-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      }

      if (navigator.share && dataUrl) {
        try {
          const res = await fetch(dataUrl);
          const blob = await res.blob();
          const file = new File([blob], 'muzikors-story.png', { type: 'image/png' });

          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: `${trackTitle} - ${trackArtist}`,
              text: shareCaption,
              files: [file],
            });
            return;
          }
        } catch (err) {
          // fallback
        }
      }

      await navigator.clipboard.writeText(`${shareCaption} ${shareUrl}`);
      showToast('Görsel indirildi ve metin kopyalandı! Instagram açılıyor...');
      setTimeout(() => {
        window.location.href = 'instagram://story-camera';
        setTimeout(() => {
          window.open('https://instagram.com', '_blank');
        }, 1200);
      }, 600);
    } catch (e) {
      showToast('Paylaşım başlatılamadı.');
    } finally {
      setIsGenerating(false);
    }
  };

  // 3. WhatsApp Share
  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(`${shareCaption}\n👉 ${shareUrl}`);
    const waUrl = `https://api.whatsapp.com/send?text=${text}`;
    window.open(waUrl, '_blank');
  };

  // 4. X (Twitter) Share
  const handleTwitterShare = () => {
    const cleanVenue = venueName.replace(/[^a-zA-Z0-9]/g, '');
    const tweet = encodeURIComponent(`${shareCaption}\n\n@muzikors #Muzikors #${cleanVenue}\n${shareUrl}`);
    const twitterUrl = `https://twitter.com/intent/tweet?text=${tweet}`;
    window.open(twitterUrl, '_blank');
  };

  // 5. TikTok Share
  const handleTikTokShare = async () => {
    setIsGenerating(true);
    showToast('TikTok için hikaye kartı indiriliyor...');
    try {
      const dataUrl = await generateStoryCanvas();
      if (dataUrl) {
        const link = document.createElement('a');
        link.download = `muzikors-tiktok-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
      }
      await navigator.clipboard.writeText(`${shareCaption} ${shareUrl}`);
      showToast('Görsel indirildi! TikTok açılıyor...');
      setTimeout(() => {
        window.location.href = 'snssdk1233://';
        setTimeout(() => {
          window.open('https://www.tiktok.com', '_blank');
        }, 1200);
      }, 600);
    } catch (e) {
      showToast('TikTok paylaşımı başlatılamadı.');
    } finally {
      setIsGenerating(false);
    }
  };

  // 6. Generic System Share
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${trackTitle} - ${venueName}`,
          text: shareCaption,
          url: shareUrl,
        });
      } catch (e) {
        // user cancelled
      }
    } else {
      handleCopyLink();
    }
  };

  // 7. Copy Link
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(`${shareCaption} ${shareUrl}`);
      setCopied(true);
      showToast('Mekân ve parça bağlantısı panoya kopyalandı.');
      setTimeout(() => setCopied(false), 3000);
    } catch (e) {
      showToast('Kopyalama başarısız oldu.');
    }
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-lg overflow-y-auto">
        {/* Backdrop */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeModal}
          className="fixed inset-0"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 16 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 8 }}
          transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-2xl bg-[var(--theme-card)] border border-white/10 rounded-3xl shadow-[0_24px_64px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col md:flex-row my-auto"
        >
          {/* Close Button */}
          <button
            onClick={closeModal}
            aria-label="Kapat"
            className="absolute top-3.5 right-3.5 z-30 w-9 h-9 rounded-full bg-[var(--theme-card-alt)]/80 hover:bg-[var(--theme-card-alt)] text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] flex items-center justify-center border border-white/10 active:scale-95 transition-all cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>

          {/* LEFT: 9:16 Story Card Live Preview */}
          <div className="w-full md:w-[280px] shrink-0 p-4 sm:p-5 flex flex-col items-center justify-center bg-[var(--theme-bg)]/80 border-b md:border-b-0 md:border-r border-white/[0.08] relative overflow-hidden">
            
            {/* Ambient Lighting */}
            <div 
              className="absolute inset-0 bg-cover bg-center blur-3xl opacity-20 pointer-events-none scale-150"
              style={{ backgroundImage: `url(${albumSrc})` }}
            />

            {/* The 9:16 Card Shell (Exact 1:1 Parity with Generated HD Image) */}
            <div className="relative z-10 w-full max-w-[230px] aspect-[9/16] rounded-2xl bg-[#09080E] border border-white/15 p-3 flex flex-col justify-between shadow-2xl overflow-hidden text-left">
              
              {/* Subtle Concentric Rings */}
              <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full border border-amber-500/[0.07] pointer-events-none" />
              <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full border border-amber-500/[0.04] pointer-events-none" />

              {/* Story Header: Real Logo + Brand Wordmark & Clean Live Status */}
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-1.5">
                  <img src="/logo.png" alt="Muzikors" className="w-4 h-4 rounded-md object-contain" />
                  <span className="text-[10px] font-black text-white tracking-wider">MUZIKORS</span>
                </div>
                <div className="flex items-center gap-1 text-[8px] font-extrabold text-emerald-400 tracking-wider">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>CANLI</span>
                </div>
              </div>

              {/* Venue Tag */}
              <div className="flex items-center gap-2 p-1.5 rounded-xl bg-white/[0.03] border border-white/[0.08]">
                <div className="w-6 h-6 rounded-lg bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
                  <Disc3 className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-white truncate leading-tight">{venueName}</p>
                  <p className="text-[8px] text-[#E6C88B] font-medium">Mekân Canlı Jukebox</p>
                </div>
              </div>

              {/* Central Artwork */}
              <div className="relative w-28 h-28 mx-auto rounded-2xl overflow-hidden border border-white/15 shadow-xl my-1">
                <img 
                  src={albumSrc} 
                  alt={trackTitle}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/logo.png';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Symmetrical Equalizer Waveform */}
              <div className="flex items-center justify-center gap-[2.5px] h-3.5 my-0.5" aria-hidden="true">
                {[5, 7, 10, 12, 14, 13, 11, 8, 6, 8, 11, 13, 14, 12, 10, 7, 5].map((h, idx) => (
                  <span 
                    key={idx} 
                    className="w-[2px] bg-gradient-to-t from-amber-600 to-amber-400 rounded-full"
                    style={{ height: `${h}px` }}
                  />
                ))}
              </div>

              {/* Track Info */}
              <div className="text-center w-full min-w-0">
                <h4 className="text-[11px] font-black text-white truncate leading-tight">{trackTitle}</h4>
                <p className="text-[9px] font-medium text-[#E6C88B] truncate mt-0.5">{trackArtist}</p>
                <div className={`inline-block px-2 py-0.5 mt-1 rounded-full text-[7.5px] font-medium border ${
                  isMySong 
                    ? 'bg-amber-500/15 border-amber-500/40 text-amber-200' 
                    : 'bg-white/[0.05] border-white/10 text-neutral-300'
                }`}>
                  {requesterText}
                </div>
              </div>

              {/* Bottom Invitation Card (1:1 with Canvas) */}
              <div className="rounded-xl bg-white/[0.03] border border-white/[0.08] p-1.5 text-center mt-1">
                <p className="text-[8.5px] font-black text-white leading-tight">Sıradaki Parçayı Sen Seç</p>
                <p className="text-[7px] text-neutral-400 mt-0.5 leading-tight">Masanızdaki QR kodu okutun veya adrese gidin:</p>
                <p className="text-[8px] font-extrabold text-amber-400 tracking-tight mt-0.5">
                  {venueId ? `muzikors.com.tr/?v=${venueId}` : 'muzikors.com.tr'}
                </p>
              </div>
            </div>

            <p className="text-[10px] text-[var(--theme-text-muted)] mt-2 font-medium">9:16 Hikaye Önizlemesi</p>
          </div>

          {/* RIGHT: Multi-Platform Sharing Hub */}
          <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between space-y-4 bg-[var(--theme-card)]">
            
            {/* Clean, Non-Kicker Header */}
            <div>
              <h3 className="text-xl font-black text-[var(--theme-text)] tracking-tight">
                Şarkını Hikayende Paylaş
              </h3>
              <p className="text-xs text-[var(--theme-text-muted)] mt-1 leading-relaxed">
                Şu an <span className="text-[var(--theme-text)] font-semibold">{venueName}</span> salonunda çalan parçanı tek tıkla hikayene ekle, masadaki herkesi sıraya davet et.
              </p>
            </div>

            {/* Platform Grid (Clean Themed Cards with Real Vector Glyphs) */}
            <div className="grid grid-cols-2 gap-2.5">
              
              {/* Instagram */}
              <button
                type="button"
                onClick={handleInstagramShare}
                disabled={isGenerating}
                className="p-3 rounded-2xl bg-[var(--theme-card-alt)]/60 hover:bg-[var(--theme-card-alt)] border border-white/[0.08] hover:border-white/20 active:scale-[0.98] transition-all flex items-center gap-3 text-left group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#F58529]/20 via-[#DD2A7B]/20 to-[#8134AF]/20 border border-[#DD2A7B]/30 flex items-center justify-center text-[#E1306C] shrink-0 group-hover:scale-105 transition-transform">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"/>
                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
                    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"/>
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[var(--theme-text)] truncate">Instagram</p>
                  <p className="text-[10px] text-[var(--theme-text-muted)] truncate">Hikaye Kartı</p>
                </div>
              </button>

              {/* WhatsApp */}
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="p-3 rounded-2xl bg-[var(--theme-card-alt)]/60 hover:bg-[var(--theme-card-alt)] border border-white/[0.08] hover:border-white/20 active:scale-[0.98] transition-all flex items-center gap-3 text-left group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-[#25D366]/15 border border-[#25D366]/30 flex items-center justify-center text-[#25D366] shrink-0 group-hover:scale-105 transition-transform">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91C2.13 13.66 2.59 15.36 3.45 16.86L2.05 22L7.3 20.62C8.75 21.41 10.38 21.83 12.04 21.83C17.5 21.83 21.95 17.38 21.95 11.92C21.95 9.27 20.92 6.78 19.05 4.91C17.18 3.03 14.69 2 12.04 2ZM12.05 20.15C10.57 20.15 9.12 19.76 7.85 19.01L7.55 18.83L4.43 19.65L5.26 16.61L5.06 16.29C4.24 14.98 3.8 13.47 3.8 11.91C3.8 7.37 7.5 3.67 12.05 3.67C14.25 3.67 16.32 4.53 17.87 6.09C19.42 7.65 20.28 9.72 20.28 11.92C20.28 16.46 16.59 20.15 12.05 20.15ZM16.57 14.39C16.32 14.26 15.1 13.66 14.87 13.58C14.65 13.5 14.48 13.46 14.32 13.71C14.15 13.96 13.68 14.51 13.53 14.68C13.39 14.85 13.24 14.87 12.99 14.75C12.74 14.62 11.94 14.36 10.99 13.52C10.25 12.86 9.75 12.04 9.61 11.79C9.46 11.54 9.59 11.41 9.72 11.28C9.83 11.17 9.97 10.99 10.1 10.84C10.22 10.69 10.26 10.59 10.34 10.42C10.43 10.25 10.39 10.11 10.32 9.98C10.26 9.86 9.77 8.65 9.56 8.16C9.37 7.68 9.17 7.74 9.02 7.73C8.88 7.73 8.71 7.72 8.54 7.72C8.37 7.72 8.1 7.78 7.87 8.03C7.65 8.28 7.02 8.87 7.02 10.07C7.02 11.27 7.89 12.43 8.02 12.59C8.14 12.76 9.74 15.23 12.2 16.29C12.78 16.54 13.24 16.69 13.59 16.81C14.18 16.99 14.71 16.97 15.14 16.9C15.61 16.83 16.59 16.31 16.79 15.72C17 15.13 17 14.63 16.93 14.52C16.87 14.41 16.72 14.35 16.57 14.39Z"/>
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[var(--theme-text)] truncate">WhatsApp</p>
                  <p className="text-[10px] text-[var(--theme-text-muted)] truncate">Gruba Gönder</p>
                </div>
              </button>

              {/* TikTok */}
              <button
                type="button"
                onClick={handleTikTokShare}
                disabled={isGenerating}
                className="p-3 rounded-2xl bg-[var(--theme-card-alt)]/60 hover:bg-[var(--theme-card-alt)] border border-white/[0.08] hover:border-white/20 active:scale-[0.98] transition-all flex items-center gap-3 text-left group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/15 flex items-center justify-center text-[var(--theme-text)] shrink-0 group-hover:scale-105 transition-transform">
                  <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64c.298-.002.595.042.88.13V9.4a6.33 6.33 0 0 0-1-.08A6.34 6.34 0 0 0 3 15.66a6.34 6.34 0 0 0 10.86 4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-2.91-1.46c-.63-.64-1.03-1.48-1.13-2.38z"/>
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[var(--theme-text)] truncate">TikTok</p>
                  <p className="text-[10px] text-[var(--theme-text-muted)] truncate">Video / Story</p>
                </div>
              </button>

              {/* X (Twitter) */}
              <button
                type="button"
                onClick={handleTwitterShare}
                className="p-3 rounded-2xl bg-[var(--theme-card-alt)]/60 hover:bg-[var(--theme-card-alt)] border border-white/[0.08] hover:border-white/20 active:scale-[0.98] transition-all flex items-center gap-3 text-left group cursor-pointer"
              >
                <div className="w-8 h-8 rounded-xl bg-white/[0.06] border border-white/15 flex items-center justify-center text-[var(--theme-text)] shrink-0 group-hover:scale-105 transition-transform">
                  <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
                  </svg>
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-[var(--theme-text)] truncate">X / Twitter</p>
                  <p className="text-[10px] text-[var(--theme-text-muted)] truncate">Tweet Paylaş</p>
                </div>
              </button>

            </div>

            {/* Action Row - UNIFIED SLEEK CARDS */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-white/[0.08]">
              
              {/* Primary CTA: Download HD Story (Unified with adjacent buttons) */}
              <button
                type="button"
                onClick={handleDownload}
                disabled={isGenerating}
                className="flex-1 py-3 px-4 rounded-xl bg-[var(--theme-card-alt)]/80 hover:bg-[var(--theme-card-alt)] active:bg-white/[0.12] border border-white/10 text-[var(--theme-text)] font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all cursor-pointer"
              >
                <Download className="w-4 h-4 text-[var(--theme-primary)]" />
                <span>{isGenerating ? 'Oluşturuluyor...' : 'HD Görseli İndir'}</span>
              </button>

              {/* Native System Share */}
              <button
                type="button"
                onClick={handleNativeShare}
                className="py-3 px-4 rounded-xl bg-[var(--theme-card-alt)]/80 hover:bg-[var(--theme-card-alt)] active:bg-white/[0.12] border border-white/10 text-[var(--theme-text)] text-xs font-bold active:scale-95 transition-all flex items-center justify-center gap-2 cursor-pointer"
              >
                <Send className="w-4 h-4 text-[var(--theme-primary)]" />
                <span>Arkadaşlarına Gönder</span>
              </button>

              {/* Copy Link */}
              <button
                type="button"
                onClick={handleCopyLink}
                className="py-3 px-3.5 rounded-xl bg-[var(--theme-card-alt)]/80 hover:bg-[var(--theme-card-alt)] active:bg-white/[0.12] border border-white/10 text-[var(--theme-text-muted)] hover:text-[var(--theme-text)] text-xs font-medium active:scale-95 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
                title="Bağlantıyı Kopyala"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span className="hidden sm:inline">{copied ? 'Kopyalandı' : 'Kopyala'}</span>
              </button>

            </div>

            {/* Bottom Safe Note */}
            <p className="text-[10px] text-[var(--theme-text-muted)] text-center">
              Mekân ve çalan parçaya özel 1080x1920 HD dikey hikaye kartı olarak üretilir.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
