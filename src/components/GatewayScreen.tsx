import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Music, Menu, Wifi, Copy, Check, Store, X, BookOpen } from 'lucide-react';

export const GatewayScreen: React.FC = () => {
  const { activeVenue, setHasEnteredGateway, openModal, showToast } = useApp();
  const [copied, setCopied] = useState(false);

  if (!activeVenue) return null;

  const handleCopyPassword = () => {
    if (activeVenue.wifi_password) {
      navigator.clipboard.writeText(activeVenue.wifi_password);
      setCopied(true);
      showToast('Şifre kopyalandı!');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const wifiName = activeVenue.wifi_name || (activeVenue as any).wifi_ssid;
  const wifiPass = activeVenue.wifi_password || (activeVenue as any).wifi_pass;
  const menuUrl = activeVenue.menu_link || (activeVenue as any).menu_url;
  const isNativeMenu = activeVenue.menu_type === 'native';

  const hasWifi = Boolean(wifiName?.trim()) || Boolean(wifiPass?.trim());
  const hasMenu = isNativeMenu || Boolean(menuUrl?.trim());

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[var(--theme-bg)] p-4 landscape:p-3 relative overflow-y-auto items-center text-white transition-colors duration-300">
      {/* Close Button */}
      <button 
        onClick={() => setHasEnteredGateway(true)}
        className="absolute top-6 landscape:top-3 right-6 landscape:right-4 z-50 p-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] border border-white/10 text-neutral-400 hover:text-white active:scale-95 transition-all shadow-lg cursor-pointer"
        aria-label="Kapat"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Header: Minimal Powered by Muzikors */}
      <div className="w-full flex justify-center pt-8 landscape:pt-2 pb-4 landscape:pb-2 relative z-10">
        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-white/[0.03] border border-white/[0.08]">
          <Music className="w-3.5 h-3.5 text-[var(--theme-primary)]" />
          <span className="text-[10px] font-black tracking-widest text-[var(--theme-primary-light)] uppercase">Powered by Muzikors</span>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="w-full max-w-sm landscape:max-w-2xl mx-auto flex-1 flex flex-col landscape:flex-row landscape:items-center landscape:justify-center landscape:gap-8 items-center justify-center space-y-8 landscape:space-y-0 relative z-10 mb-16 landscape:mb-4">
        
        {/* Profile Card */}
        <div className="flex flex-col items-center space-y-4 landscape:space-y-2.5 shrink-0">
          <div className="relative">
            <div className="w-28 h-28 landscape:w-22 landscape:h-22 rounded-3xl landscape:rounded-2xl border border-[var(--theme-primary)]/30 p-1 flex items-center justify-center bg-[var(--theme-card)] shadow-[0_0_30px_rgba(0,0,0,0.8)] overflow-hidden relative">
              {activeVenue.logo_url?.trim() ? (
                <img 
                  src={activeVenue.logo_url} 
                  alt={activeVenue.venue_name} 
                  className="w-full h-full object-cover rounded-2xl z-10"
                />
              ) : (
                <Store className="w-12 h-12 text-[var(--theme-primary)]/60 z-10" />
              )}
            </div>
            <div className="absolute -bottom-1.5 -right-1.5 bg-[var(--theme-primary)] w-8 h-8 landscape:w-7 landscape:h-7 rounded-full flex items-center justify-center border-2 border-[var(--theme-bg)] shadow-md">
              <Check className="w-4 h-4 text-black stroke-[3]" />
            </div>
          </div>
          <div className="text-center space-y-1">
            <h1 className="text-xl landscape:text-lg font-black text-white tracking-tight">{activeVenue.venue_name}</h1>
            <p className="text-[11px] text-[var(--theme-primary-light)] font-bold tracking-widest uppercase">Hoş Geldiniz</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-3 landscape:space-y-2.5 flex-1">
          <button
            onClick={() => setHasEnteredGateway(true)}
            className="w-full h-13 landscape:h-11 rounded-2xl bg-[var(--theme-primary)] text-black font-black text-sm flex items-center justify-center gap-2.5 shadow-lg active:scale-95 transition-all cursor-pointer"
          >
            <Music className="w-4.5 h-4.5" />
            Muzikors'a Başla
          </button>

          {/* Wi-Fi Info Card (CONDITIONAL) */}
          {hasWifi && (
            <div className="w-full bg-[var(--theme-card-alt)] border border-white/[0.08] rounded-2xl p-4 text-center space-y-3 shadow-sm">
              <div className="flex items-center justify-center gap-2 pb-2 border-b border-white/[0.06]">
                <Wifi className="w-4 h-4 text-[var(--theme-primary)]" />
                <h3 className="text-xs font-bold text-white tracking-wider uppercase">Mekân Wi-Fi Bilgileri</h3>
              </div>
              
              <div className="space-y-2">
                {wifiName?.trim() && (
                  <div className="flex items-center justify-between bg-black/40 rounded-xl p-3 border border-white/[0.04]">
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Ağ Adı</span>
                    <span className="text-xs text-white font-bold">{wifiName}</span>
                  </div>
                )}
                
                {wifiPass?.trim() && (
                  <div className="flex items-center justify-between bg-black/40 rounded-xl p-3 border border-white/[0.04]">
                    <span className="text-[10px] text-neutral-400 font-bold uppercase tracking-wider">Şifre</span>
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-white font-mono font-bold tracking-wider">{wifiPass}</span>
                      <button 
                        onClick={() => {
                          if (wifiPass) {
                            navigator.clipboard.writeText(wifiPass);
                            setCopied(true);
                            showToast('Wi-Fi Şifresi Kopyalandı!');
                            setTimeout(() => setCopied(false), 2000);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-neutral-400 hover:text-white transition-colors"
                        title="Şifreyi Kopyala"
                      >
                        {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Menu Button (CONDITIONAL) */}
          {hasMenu && (
            isNativeMenu ? (
              <button
                type="button"
                onClick={() => openModal('menu')}
                className="w-full h-14 rounded-2xl bg-[var(--theme-card-alt)] hover:bg-[var(--theme-card)] border border-[var(--theme-primary)]/30 text-white font-bold text-sm flex items-center justify-center gap-2.5 active:scale-95 transition-all shadow-sm cursor-pointer"
              >
                <BookOpen className="w-4 h-4 text-[var(--theme-primary)]" />
                <span>Dijital Menüyü İncele</span>
              </button>
            ) : (
              <a
                href={menuUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full h-14 rounded-2xl bg-[var(--theme-card-alt)] hover:bg-[var(--theme-card)] border border-[var(--theme-primary)]/30 text-white font-bold text-sm flex items-center justify-center gap-2.5 active:scale-95 transition-all shadow-sm"
              >
                <BookOpen className="w-4 h-4 text-[var(--theme-primary)]" />
                <span>Dijital Menüyü İncele</span>
              </a>
            )
          )}
        </div>
      </div>

      {/* Footer KVKK */}
      <div className="absolute bottom-4 w-full flex flex-col items-center gap-1 z-10 px-4">
        <div className="flex flex-wrap justify-center items-center gap-x-3 gap-y-1 text-[10px] text-neutral-500">
          <a href="/legal/terms" className="hover:text-amber-400 transition-colors">Hizmet Sözleşmesi</a>
          <span>•</span>
          <a href="/legal/privacy" className="hover:text-amber-400 transition-colors">Gizlilik & KVKK</a>
          <span>•</span>
          <a href="/legal/refund" className="hover:text-amber-400 transition-colors">İptal & İade</a>
        </div>
      </div>
    </div>
  );
};
