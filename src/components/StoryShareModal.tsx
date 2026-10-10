'use client';

import React, { useState } from 'react';
import { Check, Copy, Download, Share2 } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { formatUserDisplayName } from '../utils/formatters';
import { Sheet } from './ui/Sheet';
import { btn } from './ui/controls';

export const StoryShareModal: React.FC = () => {
  const { activeModal, closeModal, nowPlaying, activeVenue, user, showToast } = useApp();
  const [isGenerating, setIsGenerating] = useState(false);
  const [copied, setCopied] = useState(false);
  const isOpen = activeModal === 'story_share' && Boolean(nowPlaying);

  const venueName = activeVenue?.name || activeVenue?.venue_name || 'Muzikors Mekânı';
  const venueId = activeVenue?.id || (activeVenue as any)?.kafe_id;
  const baseUrl = typeof window !== 'undefined' ? window.location.origin : 'https://muzikors.com.tr';
  const shareUrl = venueId
    ? `${baseUrl}/?v=${venueId}`
    : (typeof window !== 'undefined' ? window.location.href : 'https://muzikors.com.tr');

  const trackTitle = nowPlaying?.title || 'Bilinmeyen Şarkı';
  const trackArtist = nowPlaying?.artist || 'Bilinmeyen Sanatçı';
  const albumSrc = nowPlaying?.albumCover || nowPlaying?.coverUrl || nowPlaying?.album_art || '/logo.png';

  const isMySong = Boolean(user && nowPlaying && nowPlaying.requestedByUserId === user.id);
  const requesterText = isMySong
    ? 'Benim Seçimim'
    : nowPlaying?.requestedBy
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

  // 2. Hikayede paylaş: önce telefonun paylaşım menüsü (görselle), olmazsa indir + Instagram
  const handleInstagramShare = async () => {
    setIsGenerating(true);
    try {
      const dataUrl = await generateStoryCanvas();

      if (navigator.share && dataUrl) {
        try {
          const res = await fetch(dataUrl);
          const blob = await res.blob();
          const file = new File([blob], 'muzikors-story.png', { type: 'image/png' });

          if (navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({
              title: `${trackTitle} - ${trackArtist}`,
              text: `${shareCaption} ${shareUrl}`,
              files: [file],
            });
            return;
          }
        } catch (err: any) {
          // Kullanıcı paylaşım menüsünü kapattıysa başka bir şey yapılmaz
          if (err?.name === 'AbortError') return;
        }
      }

      if (dataUrl) {
        const link = document.createElement('a');
        link.download = `muzikors-story-${Date.now()}.png`;
        link.href = dataUrl;
        link.click();
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

  const secondary = [
    {
      label: 'WhatsApp',
      onClick: handleWhatsAppShare,
      icon: (
        <svg className="w-5 h-5 text-[#25D366]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M12.04 2C6.58 2 2.13 6.45 2.13 11.91c0 1.75.46 3.45 1.32 4.95L2.05 22l5.25-1.38c1.45.79 3.08 1.21 4.74 1.21 5.46 0 9.91-4.45 9.91-9.91 0-2.65-1.03-5.14-2.9-7.01A9.82 9.82 0 0 0 12.04 2zm.01 18.15c-1.48 0-2.93-.4-4.2-1.15l-.3-.18-3.12.82.83-3.04-.2-.31a8.26 8.26 0 0 1-1.26-4.38c0-4.54 3.7-8.24 8.25-8.24 2.2 0 4.27.86 5.82 2.42a8.18 8.18 0 0 1 2.41 5.83c.01 4.54-3.68 8.23-8.23 8.23zm4.52-6.16c-.25-.12-1.47-.72-1.7-.81-.22-.08-.39-.12-.55.13-.17.25-.64.81-.79.97-.14.17-.29.19-.54.06-.25-.12-1.05-.39-1.99-1.23-.74-.66-1.24-1.47-1.38-1.72-.15-.25-.02-.38.11-.51.11-.11.25-.29.37-.43.13-.15.17-.25.25-.42.08-.17.04-.31-.02-.43-.06-.13-.55-1.34-.76-1.83-.2-.48-.4-.42-.55-.42h-.47c-.17 0-.43.06-.66.31-.22.25-.86.85-.86 2.07 0 1.22.89 2.39 1.01 2.56.12.17 1.75 2.67 4.23 3.74.59.26 1.05.41 1.41.52.59.19 1.13.16 1.56.1.48-.07 1.47-.6 1.67-1.18.21-.58.21-1.07.14-1.18-.06-.11-.22-.17-.47-.29z" />
        </svg>
      ),
    },
    {
      label: 'X',
      onClick: handleTwitterShare,
      icon: (
        <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
        </svg>
      ),
    },
    {
      label: copied ? 'Kopyalandı' : 'Kopyala',
      onClick: handleCopyLink,
      icon: copied ? <Check className="w-5 h-5 text-emerald-400" /> : <Copy className="w-5 h-5" />,
    },
    {
      label: 'İndir',
      onClick: handleDownload,
      icon: <Download className="w-5 h-5" />,
    },
  ];

  return (
    <Sheet
      open={isOpen}
      onClose={closeModal}
      title={isMySong ? 'Şarkını paylaş' : 'Şarkıyı paylaş'}
      subtitle={venueName}
      width="lg"
    >
      <div className="landscape:grid landscape:grid-cols-[220px_1fr] landscape:gap-6 landscape:items-center pb-2">
        {/* Hikaye kartı önizlemesi (oluşturulan görselle aynı düzen) */}
        <div className="relative mx-auto w-[180px] landscape:w-[200px] aspect-[9/16] rounded-[22px] overflow-hidden bg-[#09080E] border border-white/10 p-3.5 flex flex-col justify-between text-left shadow-[0_16px_40px_rgba(0,0,0,0.5)]">
          <div className="absolute inset-0 bg-cover bg-center blur-2xl opacity-25 scale-150 pointer-events-none" style={{ backgroundImage: `url(${albumSrc})` }} />
          <div className="relative flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <img src="/logo.png" alt="" className="w-3.5 h-3.5 object-contain" />
              <span className="text-[9px] font-bold tracking-wider">MUZIKORS</span>
            </span>
            <span className="flex items-center gap-1 text-[8px] font-bold text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              CANLI
            </span>
          </div>
          <div className="relative">
            <img
              src={albumSrc}
              alt=""
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = '/logo.png';
              }}
              className="w-[110px] h-[110px] mx-auto rounded-2xl object-cover border border-white/10 shadow-xl"
            />
            <p className="text-[11px] font-bold text-center truncate mt-3">{trackTitle}</p>
            <p className="text-[9px] text-white/60 text-center truncate mt-0.5">{trackArtist}</p>
            <p className="text-[8px] text-white/45 text-center mt-1.5">{requesterText}</p>
          </div>
          <div className="relative rounded-xl bg-white/[0.05] px-2 py-1.5 text-center">
            <p className="text-[8px] font-bold">Sıradaki parçayı sen seç</p>
            <p className="text-[7px] text-[#F59E0B] font-semibold mt-0.5 truncate">{venueId ? `muzikors.com.tr/?v=${venueId}` : 'muzikors.com.tr'}</p>
          </div>
        </div>

        <div className="mt-6 landscape:mt-0 space-y-4">
          <p className="text-[14px] text-white/60 leading-relaxed text-center landscape:text-left">
            Çalan şarkıyı hikayende paylaş, masadakileri de sıraya davet et.
          </p>
          <button type="button" onClick={handleInstagramShare} disabled={isGenerating} className={`${btn.primary} w-full`}>
            <Share2 className="w-4 h-4" />
            <span>{isGenerating ? 'Hazırlanıyor…' : 'Hikayende paylaş'}</span>
          </button>
          <div className="grid grid-cols-4 gap-2">
            {secondary.map((action) => (
              <button
                key={action.label}
                type="button"
                onClick={action.onClick}
                disabled={isGenerating}
                className="flex flex-col items-center gap-1.5 py-1 active:scale-95 transition-transform duration-150 disabled:opacity-50"
              >
                <span className="w-12 h-12 rounded-full bg-white/[0.07] grid place-items-center text-white/85">{action.icon}</span>
                <span className="text-[11px] text-white/60">{action.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </Sheet>
  );
};
