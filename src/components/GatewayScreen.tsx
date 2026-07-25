import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Music, Menu, Wifi, Copy, Check, Store } from 'lucide-react';

export const GatewayScreen: React.FC = () => {
  const { activeVenue, setHasEnteredGateway, showToast, openModal } = useApp();
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

  const hasWifi = Boolean(activeVenue.wifi_name?.trim()) || Boolean(activeVenue.wifi_password?.trim());
  const hasMenu = Boolean(activeVenue.menu_link?.trim());

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

          {hasMenu && (
            <a
              href={activeVenue.menu_link}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full h-14 rounded-2xl bg-[#1A1A1A] border border-[#D4AF37]/20 text-white font-bold flex items-center justify-center gap-3 hover:bg-[#222] active:scale-[0.98] transition-all"
            >
              <Menu className="w-5 h-5 text-[#D4AF37]" />
              Menüyü İncele
            </a>
          )}
        </div>

        {/* Wi-Fi Info Card (CONDITIONAL) */}
        {hasWifi && (
          <div className="w-full bg-[#1A1A1A]/80 backdrop-blur-sm border border-white/5 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-8 h-8 rounded-full bg-[#D4AF37]/10 flex items-center justify-center">
                <Wifi className="w-4 h-4 text-[#D4AF37]" />
              </div>
              <h3 className="text-sm font-bold text-gray-200">Mekân Wi-Fi Bilgileri</h3>
            </div>
            
            <div className="space-y-3">
              {activeVenue.wifi_name?.trim() && (
                <div className="flex items-center justify-between bg-black/40 rounded-xl p-3 border border-white/5">
                  <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Ağ Adı (SSID)</span>
                  <span className="text-sm text-white font-bold">{activeVenue.wifi_name}</span>
                </div>
              )}
              
              {activeVenue.wifi_password?.trim() && (
                <div className="flex items-center justify-between bg-black/40 rounded-xl p-3 border border-white/5 group">
                  <span className="text-xs text-gray-400 font-semibold uppercase tracking-wider">Şifre</span>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-white font-mono font-bold tracking-wider">{activeVenue.wifi_password}</span>
                    <button 
                      onClick={handleCopyPassword}
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
      </div>

      {/* Footer KVKK */}
      <div className="absolute bottom-6 w-full text-center z-10">
        <button
          onClick={() => openModal('terms')}
          className="text-[10px] text-gray-500 hover:text-[#E5A93C] underline underline-offset-2 transition-colors"
        >
          Kullanım Koşulları & KVKK Aydınlatma Metni
        </button>
      </div>
    </div>
  );
};
