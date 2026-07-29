import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Music, Menu, Wifi, Copy, Check, Store } from 'lucide-react';

export const GatewayScreen: React.FC = () => {
  const { activeVenue, setHasEnteredGateway, showToast, openModal } = useApp();
  const [copied, setCopied] = useState(false);
  const [isCheckingCooldown, setIsCheckingCooldown] = useState(true);

  useEffect(() => {
    if (!activeVenue) return;
    
    const STORAGE_KEY = `lastSeenCafeMenu_${activeVenue.id}`;
    const COOLDOWN_MS = 10 * 60 * 1000; // 10 minutes
    const lastSeen = localStorage.getItem(STORAGE_KEY);
    const now = Date.now();

    if (lastSeen && now - parseInt(lastSeen, 10) < COOLDOWN_MS) {
      setHasEnteredGateway(true);
    } else {
      localStorage.setItem(STORAGE_KEY, now.toString());
      setIsCheckingCooldown(false);
    }
  }, [activeVenue, setHasEnteredGateway]);

  if (isCheckingCooldown || !activeVenue) return null;

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

  const hasWifi = Boolean(wifiName?.trim()) || Boolean(wifiPass?.trim());
  const hasMenu = Boolean(menuUrl?.trim());

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#120C08] p-6 relative overflow-hidden items-center">
      {/* Background Glow */}
      <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#D4AF37]/10 via-[#120C08]/5 to-transparent pointer-events-none" />

      {/* Header: Minimal Powered by Muzikors */}
      <div className="w-full flex justify-center pt-8 pb-4 relative z-10">
        <div className="flex items-center gap-2 opacity-70">
          <Music className="w-4 h-4 text-[#D4AF37]" />
          <span className="text-[10px] font-bold tracking-widest text-[#D4AF37] uppercase">Powered by Muzikors</span>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="w-full max-w-sm mx-auto flex-1 flex flex-col items-center justify-center space-y-10 relative z-10 mb-20">
        
        {/* Profile Card */}
        <div className="flex flex-col items-center space-y-5">
          <div className="relative">
            <div className="w-[120px] h-[120px] rounded-full border-2 border-[#D4AF37]/30 p-1 flex items-center justify-center bg-[#1A1A1A] shadow-[0_0_30px_rgba(212,175,55,0.15)] overflow-hidden">
              {activeVenue.logo_url?.trim() ? (
                <img 
                  src={activeVenue.logo_url} 
                  alt={activeVenue.venue_name} 
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <Store className="w-12 h-12 text-[#D4AF37]/50" />
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-[#D4AF37] w-8 h-8 rounded-full flex items-center justify-center border-[3px] border-[#120C08] shadow-lg">
              <Check className="w-4 h-4 text-black" />
            </div>
          </div>
          <div className="text-center space-y-1">
            <h1 className="text-2xl font-black text-white tracking-tight">{activeVenue.venue_name}</h1>
            <p className="text-xs text-gray-400 font-medium tracking-wide uppercase">Hoş Geldiniz</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-4">
          <button
            onClick={() => setHasEnteredGateway(true)}
            className="w-full h-14 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#F1C40F] text-black font-black flex items-center justify-center gap-3 shadow-[0_4px_20px_rgba(212,175,55,0.3)] hover:opacity-95 active:scale-[0.98] transition-all"
          >
            <Music className="w-6 h-6" />
            Muzikors Müzik Kutusu
          </button>

          {/* Wi-Fi Info Card (CONDITIONAL) */}
          {hasWifi && (
            <div className="w-full bg-zinc-900/80 border border-zinc-800 rounded-2xl p-4 text-center mt-4 shadow-xl">
              <div className="flex items-center justify-center gap-2 mb-3">
                <Wifi className="w-5 h-5 text-gray-300" />
                <h3 className="text-sm font-bold text-gray-200">Mekân Wi-Fi Bilgileri</h3>
              </div>
              
              <div className="space-y-3">
                {wifiName?.trim() && (
                  <div className="flex items-center justify-between bg-black/40 rounded-xl p-3 border border-white/5">
                    <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Ağ Adı</span>
                    <span className="text-sm text-white font-bold">{wifiName}</span>
                  </div>
                )}
                
                {wifiPass?.trim() && (
                  <div className="flex items-center justify-between bg-black/40 rounded-xl p-3 border border-white/5 group">
                    <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Şifre</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-white font-mono font-bold tracking-wider">{wifiPass}</span>
                      <button 
                        onClick={() => {
                          if (wifiPass) {
                            navigator.clipboard.writeText(wifiPass);
                            setCopied(true);
                            showToast('Wi-Fi Şifresi Kopyalandı!');
                            setTimeout(() => setCopied(false), 2000);
                          }
                        }}
                        className="p-1.5 rounded-lg bg-white/5 hover:bg-white/10 text-gray-300 transition-colors"
                        title="Şifreyi Kopyala"
                      >
                        {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {hasMenu && (
            <a
              href={menuUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-14 rounded-2xl bg-[#1A1A1A] border border-[#D4AF37]/20 text-white font-bold flex items-center justify-center gap-3 hover:bg-[#222] active:scale-[0.98] transition-all"
            >
              📖 Dijital Menü
            </a>
          )}
        </div>
      </div>

      {/* Footer KVKK */}
      <div className="absolute bottom-4 w-full flex flex-col items-center gap-1 z-10 px-4">
        <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-[10px] text-gray-500">
          <a href="/legal/terms" className="hover:text-[#E5A93C] underline underline-offset-2 transition-colors">Hizmet Sözleşmesi</a>
          <a href="/legal/privacy" className="hover:text-[#E5A93C] underline underline-offset-2 transition-colors">Gizlilik & KVKK</a>
          <a href="/legal/refund" className="hover:text-[#E5A93C] underline underline-offset-2 transition-colors">İptal & İade</a>
          <a href="/legal/sales" className="hover:text-[#E5A93C] underline underline-offset-2 transition-colors">Mesafeli Satış</a>
        </div>
      </div>
    </div>
  );
};
