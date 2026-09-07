'use client';

import React, { useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, 
  Share2, 
  Download, 
  Copy, 
  Check, 
  Music, 
  Disc, 
  Store, 
  Send,
  MessageCircle,
  ExternalLink
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
  const venueSlug = activeVenue?.slug || '';
  const shareUrl = typeof window !== 'undefined' 
    ? (venueSlug ? `${window.location.origin}/c/${venueSlug}` : window.location.href)
    : 'https://muzikors.com.tr';

  const trackTitle = nowPlaying.title || 'Bilinmeyen Şarkı';
  const trackArtist = nowPlaying.artist || 'Bilinmeyen Sanatçı';
  const albumSrc = nowPlaying.albumCover || nowPlaying.coverUrl || nowPlaying.album_art || '/logo.png';

  const isMySong = user && nowPlaying.requestedByUserId === user.id;
  const requesterText = isMySong 
    ? 'Benim Seçimim' 
    : nowPlaying.requestedBy 
      ? `İsteyen: ${formatUserDisplayName(null, nowPlaying.requestedBy.replace(' VIP', ''))}`
      : 'Kafede Çalıyor';

  const shareCaption = isMySong
    ? `Şu an ${venueName} mekânında seçtiğim "${trackTitle} - ${trackArtist}" çalıyor! Sen de sıradaki şarkını ekle:`
    : `Şu an ${venueName} mekânında "${trackTitle} - ${trackArtist}" dinliyoruz! Sen de sıraya şarkı ekle:`;

  // ── HTML5 CANVAS 1080x1920 HD STORY GENERATION ────────────────────────────
  const generateStoryCanvas = async (): Promise<string | null> => {
    try {
      const canvas = document.createElement('canvas');
      canvas.width = 1080;
      canvas.height = 1920;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;

      // 1. Deep Obsidian Gradient Background
      const bgGrad = ctx.createLinearGradient(0, 0, 1080, 1920);
      bgGrad.addColorStop(0, '#0B0A10');
      bgGrad.addColorStop(0.35, '#151320');
      bgGrad.addColorStop(0.65, '#1B1728');
      bgGrad.addColorStop(1, '#07060A');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, 1080, 1920);

      // 2. Subtle Acoustic / Vinyl Concentric Glow Rings
      ctx.save();
      ctx.strokeStyle = 'rgba(217, 163, 62, 0.08)';
      ctx.lineWidth = 2;
      for (let r = 240; r <= 800; r += 70) {
        ctx.beginPath();
        ctx.arc(540, 880, r, 0, Math.PI * 2);
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

      // 3. Top Header: Muzikors Brand Pill
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.06)';
      ctx.strokeStyle = 'rgba(217, 163, 62, 0.3)';
      ctx.lineWidth = 2;
      const pillX = 140;
      const pillY = 130;
      const pillW = 800;
      const pillH = 90;
      const pillR = 45;
      ctx.beginPath();
      ctx.roundRect(pillX, pillY, pillW, pillH, pillR);
      ctx.fill();
      ctx.stroke();

      // Top Header Text
      ctx.fillStyle = '#D9A33E';
      ctx.font = 'bold 32px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'middle';
      ctx.fillText('MUZIKORS LIVE', pillX + 50, pillY + pillH / 2);

      // Emerald Live Dot
      ctx.fillStyle = '#10B981';
      ctx.beginPath();
      ctx.arc(pillX + pillW - 220, pillY + pillH / 2, 10, 0, Math.PI * 2);
      ctx.fill();

      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 26px sans-serif';
      ctx.fillText('ŞU AN ÇALIYOR', pillX + pillW - 190, pillY + pillH / 2);
      ctx.restore();

      // 4. Cafe Venue Badge (Venue Logo + Name)
      ctx.save();
      const venueBoxY = 270;
      const venueBoxH = 120;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.12)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(140, venueBoxY, 800, venueBoxH, 28);
      ctx.fill();
      ctx.stroke();

      // Venue Name & Subtitle
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 38px sans-serif';
      ctx.textAlign = 'left';
      ctx.textBaseline = 'top';
      const truncatedVenueName = venueName.length > 28 ? venueName.substring(0, 26) + '...' : venueName;
      ctx.fillText(truncatedVenueName, 280, venueBoxY + 24);

      ctx.fillStyle = '#D9A33E';
      ctx.font = '500 26px sans-serif';
      ctx.fillText('Mekân Jukebox Listesi', 280, venueBoxY + 70);

      // Draw Cafe Icon Circle
      ctx.fillStyle = 'rgba(217, 163, 62, 0.15)';
      ctx.strokeStyle = 'rgba(217, 163, 62, 0.4)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(210, venueBoxY + venueBoxH / 2, 40, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#D9A33E';
      ctx.font = 'bold 30px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('☕', 210, venueBoxY + venueBoxH / 2);
      ctx.restore();

      // 5. Hero Album Artwork (Centerpiece)
      ctx.save();
      const artSize = 580;
      const artX = (1080 - artSize) / 2;
      const artY = 460;

      // Glow behind artwork
      ctx.shadowColor = 'rgba(217, 163, 62, 0.25)';
      ctx.shadowBlur = 60;

      const albumImg = await loadImage(albumSrc);
      ctx.beginPath();
      ctx.roundRect(artX, artY, artSize, artSize, 40);
      ctx.clip();
      ctx.drawImage(albumImg, artX, artY, artSize, artSize);
      ctx.restore();

      // Artwork Border
      ctx.save();
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.18)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.roundRect(artX, artY, artSize, artSize, 40);
      ctx.stroke();
      ctx.restore();

      // 6. Audio Waveform Graphic
      ctx.save();
      const waveY = 1100;
      const waveBarCount = 28;
      const waveBarW = 12;
      const waveGap = 16;
      const totalWaveW = waveBarCount * (waveBarW + waveGap) - waveGap;
      const startWaveX = (1080 - totalWaveW) / 2;

      for (let i = 0; i < waveBarCount; i++) {
        const height = 15 + Math.sin(i * 0.5) * 35 + ((i % 3) * 12);
        const bx = startWaveX + i * (waveBarW + waveGap);
        const by = waveY - height / 2;

        ctx.fillStyle = i % 2 === 0 ? '#D9A33E' : '#E6C07B';
        ctx.beginPath();
        ctx.roundRect(bx, by, waveBarW, height, 6);
        ctx.fill();
      }
      ctx.restore();

      // 7. Track Title & Artist
      ctx.save();
      ctx.textAlign = 'center';

      // Song Title
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 54px sans-serif';
      const truncatedTitle = trackTitle.length > 25 ? trackTitle.substring(0, 23) + '...' : trackTitle;
      ctx.fillText(truncatedTitle, 540, 1190);

      // Artist Name
      ctx.fillStyle = '#D9A33E';
      ctx.font = 'bold 40px sans-serif';
      const truncatedArtist = trackArtist.length > 30 ? trackArtist.substring(0, 28) + '...' : trackArtist;
      ctx.fillText(truncatedArtist, 540, 1260);

      // Requester Badge
      ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.strokeStyle = 'rgba(217, 163, 62, 0.35)';
      ctx.lineWidth = 2;
      const reqW = 440;
      const reqH = 64;
      const reqX = (1080 - reqW) / 2;
      const reqY = 1320;
      ctx.beginPath();
      ctx.roundRect(reqX, reqY, reqW, reqH, 32);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#E5E7EB';
      ctx.font = '600 28px sans-serif';
      ctx.textBaseline = 'middle';
      ctx.fillText(requesterText, 540, reqY + reqH / 2);
      ctx.restore();

      // 8. Bottom Footer: Call to Action & Muzikors URL
      ctx.save();
      const footerY = 1540;
      ctx.fillStyle = 'rgba(255, 255, 255, 0.03)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.08)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(140, footerY, 800, 220, 36);
      ctx.fill();
      ctx.stroke();

      ctx.textAlign = 'center';
      ctx.fillStyle = '#FFFFFF';
      ctx.font = 'bold 36px sans-serif';
      ctx.fillText('Sıradaki Parçayı Sen Seç', 540, footerY + 70);

      ctx.fillStyle = '#9CA3AF';
      ctx.font = '500 26px sans-serif';
      ctx.fillText('Masanızdaki QR kodu okutun veya adrese gidin:', 540, footerY + 115);

      ctx.fillStyle = '#D9A33E';
      ctx.font = 'bold 32px sans-serif';
      ctx.fillText('muzikors.com.tr', 540, footerY + 165);
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

  // 6. Generic System Share (AirDrop, Bluetooth, Telegram, etc.)
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `${trackTitle} - ${venueName}`,
          text: shareCaption,
          url: shareUrl,
        });
      } catch (e) {
        // user cancelled or failed
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
      <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
        {/* Modal Backdrop click to close */}
        <motion.div 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeModal}
          className="fixed inset-0"
        />

        {/* Modal Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
          className="relative z-10 w-full max-w-2xl bg-[#100F17] border border-white/10 rounded-3xl shadow-[0_24px_64px_rgba(0,0,0,0.95)] overflow-hidden flex flex-col md:flex-row my-auto"
        >
          {/* Close Button */}
          <button
            onClick={closeModal}
            aria-label="Kapat"
            className="absolute top-3 right-3 z-30 w-10 h-10 rounded-full bg-black/60 hover:bg-white/10 text-neutral-300 hover:text-white flex items-center justify-center border border-white/10 active:scale-95 transition-all"
          >
            <X className="w-5 h-5" />
          </button>

          {/* LEFT: 9:16 Story Card Live Preview */}
          <div className="w-full md:w-[290px] shrink-0 p-4 sm:p-5 flex flex-col items-center justify-center bg-gradient-to-b from-[#14121F] to-[#0A0910] border-b md:border-b-0 md:border-r border-white/[0.08] relative overflow-hidden">
            
            {/* Background Artwork Ambient Blur */}
            <div 
              className="absolute inset-0 bg-cover bg-center blur-2xl opacity-15 pointer-events-none scale-125"
              style={{ backgroundImage: `url(${albumSrc})` }}
            />

            {/* The 9:16 Interactive Card Shell */}
            <div className="relative z-10 w-full max-w-[240px] aspect-[9/16] rounded-2xl bg-[#0E0D16] border border-white/15 p-3 flex flex-col justify-between shadow-2xl overflow-hidden">
              
              {/* Subtle Vinyl Grooves */}
              <div className="absolute -top-12 -left-12 w-48 h-48 rounded-full border border-amber-500/10 pointer-events-none" />
              <div className="absolute -top-16 -left-16 w-56 h-56 rounded-full border border-amber-500/5 pointer-events-none" />

              {/* Story Header */}
              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-black/40 border border-[var(--theme-primary)]/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-[var(--theme-primary)]" />
                  <span className="text-[9px] font-black text-[var(--theme-primary)] tracking-wider">MUZIKORS</span>
                </div>
                <div className="flex items-center gap-1 text-[8px] font-bold text-emerald-400">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  <span>CANLI</span>
                </div>
              </div>

              {/* Cafe Mini Banner */}
              <div className="flex items-center gap-2 p-1.5 rounded-xl bg-white/[0.04] border border-white/10 my-1">
                <div className="w-6 h-6 rounded-lg bg-[var(--theme-primary)]/15 border border-[var(--theme-primary)]/30 flex items-center justify-center text-[var(--theme-primary)] shrink-0">
                  <Store className="w-3.5 h-3.5" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] font-bold text-white truncate leading-tight">{venueName}</p>
                  <p className="text-[8px] text-[var(--theme-primary-light)] font-medium">Mekân Jukebox</p>
                </div>
              </div>

              {/* Central Artwork */}
              <div className="relative w-28 h-28 mx-auto rounded-xl overflow-hidden border border-white/15 shadow-xl my-auto group">
                <img 
                  src={albumSrc} 
                  alt={trackTitle}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.currentTarget.onerror = null;
                    e.currentTarget.src = '/logo.png';
                  }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent pointer-events-none" />
              </div>

              {/* Soundwave Bars */}
              <div className="flex items-center justify-center gap-1 h-3 my-1" aria-hidden="true">
                <span className="w-0.5 h-2 bg-[var(--theme-primary)] rounded-full animate-bar-1" />
                <span className="w-0.5 h-3.5 bg-[var(--theme-primary)] rounded-full animate-bar-2" />
                <span className="w-0.5 h-2 bg-[var(--theme-primary)] rounded-full animate-bar-3" />
                <span className="w-0.5 h-3 bg-[var(--theme-primary)] rounded-full animate-bar-4" />
                <span className="w-0.5 h-1.5 bg-[var(--theme-primary)] rounded-full animate-bar-2" />
              </div>

              {/* Track Info */}
              <div className="text-center w-full min-w-0 mb-1">
                <h4 className="text-xs font-black text-white truncate leading-tight">{trackTitle}</h4>
                <p className="text-[10px] font-semibold text-[var(--theme-primary-light)] truncate mt-0.5">{trackArtist}</p>
                <div className="inline-block px-2 py-0.5 mt-1 rounded-full bg-white/[0.06] border border-white/10 text-[8px] text-neutral-300">
                  {requesterText}
                </div>
              </div>

              {/* Bottom Tag */}
              <div className="text-center pt-1 border-t border-white/[0.08]">
                <p className="text-[8px] text-neutral-400 font-medium truncate">
                  muzikors.com.tr • Sıradaki parçayı seç
                </p>
              </div>
            </div>

            <p className="text-[11px] text-neutral-400 mt-2.5 font-medium">9:16 Hikaye Önizlemesi</p>
          </div>

          {/* RIGHT: Multi-Platform Sharing Hub */}
          <div className="flex-1 p-5 sm:p-6 flex flex-col justify-between space-y-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[var(--theme-primary)]/15 border border-[var(--theme-primary)]/30 text-[var(--theme-primary-light)] text-[11px] font-black uppercase tracking-wider mb-2">
                <Share2 className="w-3.5 h-3.5" />
                <span>Mekânda Sahne Senin</span>
              </div>
              <h3 className="text-xl font-black text-white tracking-tight">
                Şarkını Hikayende Paylaş
              </h3>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                Şu an {venueName} kafesinde çalan parçanı tek tıkla Instagram, WhatsApp, X ve TikTok'ta paylaşarak masayı havaya sok.
              </p>
            </div>

            {/* Social Share Buttons Grid */}
            <div className="grid grid-cols-2 gap-2.5">
              
              {/* Instagram Stories */}
              <button
                type="button"
                onClick={handleInstagramShare}
                disabled={isGenerating}
                className="py-3 px-3.5 rounded-2xl bg-gradient-to-r from-[#E1306C]/20 to-[#833AB4]/20 hover:from-[#E1306C]/30 hover:to-[#833AB4]/30 border border-[#E1306C]/35 text-white active:scale-95 transition-all flex items-center gap-2.5 text-xs font-bold shadow-sm"
              >
                <div className="w-7 h-7 rounded-xl bg-[#E1306C] flex items-center justify-center text-white shrink-0 shadow-md">
                  <span className="text-xs font-black">IG</span>
                </div>
                <div className="text-left min-w-0">
                  <p className="truncate font-bold text-white">Instagram</p>
                  <p className="text-[10px] text-neutral-300 font-normal">Hikaye Kartı</p>
                </div>
              </button>

              {/* WhatsApp */}
              <button
                type="button"
                onClick={handleWhatsAppShare}
                className="py-3 px-3.5 rounded-2xl bg-[#25D366]/15 hover:bg-[#25D366]/25 border border-[#25D366]/35 text-white active:scale-95 transition-all flex items-center gap-2.5 text-xs font-bold shadow-sm"
              >
                <div className="w-7 h-7 rounded-xl bg-[#25D366] flex items-center justify-center text-black shrink-0 shadow-md">
                  <MessageCircle className="w-4 h-4 fill-current" />
                </div>
                <div className="text-left min-w-0">
                  <p className="truncate font-bold text-white">WhatsApp</p>
                  <p className="text-[10px] text-neutral-300 font-normal">Gruba Gönder</p>
                </div>
              </button>

              {/* X / Twitter */}
              <button
                type="button"
                onClick={handleTwitterShare}
                className="py-3 px-3.5 rounded-2xl bg-white/[0.06] hover:bg-white/[0.1] border border-white/15 text-white active:scale-95 transition-all flex items-center gap-2.5 text-xs font-bold shadow-sm"
              >
                <div className="w-7 h-7 rounded-xl bg-black border border-white/20 flex items-center justify-center text-white shrink-0 shadow-md font-black text-xs">
                  𝕏
                </div>
                <div className="text-left min-w-0">
                  <p className="truncate font-bold text-white">X / Twitter</p>
                  <p className="text-[10px] text-neutral-300 font-normal">Tweet Paylaş</p>
                </div>
              </button>

              {/* TikTok */}
              <button
                type="button"
                onClick={handleTikTokShare}
                disabled={isGenerating}
                className="py-3 px-3.5 rounded-2xl bg-gradient-to-r from-[#25F4EE]/15 to-[#FE2C55]/15 hover:from-[#25F4EE]/25 hover:to-[#FE2C55]/25 border border-white/20 text-white active:scale-95 transition-all flex items-center gap-2.5 text-xs font-bold shadow-sm"
              >
                <div className="w-7 h-7 rounded-xl bg-black border border-[#FE2C55]/40 flex items-center justify-center text-white shrink-0 shadow-md font-black text-[11px]">
                  TT
                </div>
                <div className="text-left min-w-0">
                  <p className="truncate font-bold text-white">TikTok</p>
                  <p className="text-[10px] text-neutral-300 font-normal">Video / Story</p>
                </div>
              </button>

            </div>

            {/* Secondary Action Row */}
            <div className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-white/[0.08]">
              
              {/* Download HD Story Image */}
              <button
                type="button"
                onClick={handleDownload}
                disabled={isGenerating}
                className="flex-1 py-3 px-4 rounded-xl bg-[var(--theme-primary)] hover:opacity-90 active:scale-95 text-black font-black text-xs flex items-center justify-center gap-2 transition-all shadow-md"
              >
                <Download className="w-4 h-4" />
                <span>{isGenerating ? 'Oluşturuluyor...' : 'HD Görseli İndir'}</span>
              </button>

              {/* Native System Share / Arkadaşlarına Gönder */}
              <button
                type="button"
                onClick={handleNativeShare}
                className="py-3 px-4 rounded-xl bg-white/[0.06] hover:bg-white/[0.1] active:bg-white/[0.15] border border-white/10 text-white text-xs font-bold active:scale-95 transition-all flex items-center justify-center gap-2"
              >
                <Send className="w-4 h-4 text-[var(--theme-primary)]" />
                <span>Arkadaşlarına Gönder</span>
              </button>

              {/* Copy Link */}
              <button
                type="button"
                onClick={handleCopyLink}
                className="py-3 px-3.5 rounded-xl bg-white/[0.04] hover:bg-white/[0.08] active:bg-white/[0.12] border border-white/10 text-neutral-300 hover:text-white text-xs font-medium active:scale-95 transition-all flex items-center justify-center gap-1.5"
                title="Bağlantıyı Kopyala"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                <span className="hidden sm:inline">{copied ? 'Kopyalandı' : 'Kopyala'}</span>
              </button>

            </div>

            {/* Bottom Safe Note */}
            <p className="text-[10px] text-neutral-500 text-center">
              Görsel kartı {venueName} mekanına ve Muzikors sistemine özel hazırlanmıştır.
            </p>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
