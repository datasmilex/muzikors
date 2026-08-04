import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { Music, Menu, Wifi, Copy, Check, Store, X } from 'lucide-react';

export const GatewayScreen: React.FC = () => {
  const { activeVenue, setHasEnteredGateway, showToast } = useApp();
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

  const hasWifi = Boolean(wifiName?.trim()) || Boolean(wifiPass?.trim());
  const hasMenu = Boolean(menuUrl?.trim());

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-[#120C08] p-4 relative overflow-hidden items-center">
      {/* Close Button */}
      <button 
        onClick={() => setHasEnteredGateway(true)}
        className="absolute top-6 right-6 z-50 p-2 rounded-full bg-white/5 border border-white/10 text-white/50 hover:text-white hover:bg-white/10 active:scale-95 transition-all shadow-lg backdrop-blur-sm"
      >
        <X className="w-5 h-5" />
      </button>

      {/* Background Glow */}
      <div className="absolute top-[-20%] left-[-20%] w-[140%] h-[140%] bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#D4AF37]/10 via-[#120C08]/5 to-transparent pointer-events-none" />

      {/* Header: Minimal Powered by Muzikors */}
      <div className="w-full flex justify-center pt-8 pb-4 relative z-10">
        <div className="flex items-center gap-2 opacity-70">
          <Music className="w-4 h-4 text-[#D4AF37]" />
          <span className="text-[10px] font-black tracking-widest text-[#D4AF37] uppercase">Powered by Muzikors</span>
        </div>
      </div>

      {/* Main Content Container */}
      <div className="w-full max-w-sm mx-auto flex-1 flex flex-col items-center justify-center space-y-10 relative z-10 mb-20">
        
        {/* Profile Card */}
        <div className="flex flex-col items-center space-y-5">
          <div className="relative">
            <div className="w-[140px] h-[140px] rounded-full border border-[#D4AF37]/40 p-1.5 flex items-center justify-center bg-gradient-to-br from-[#1C130D] to-[#120C08] shadow-[0_0_40px_rgba(212,175,55,0.25)] overflow-hidden relative group">
              <div className="absolute inset-0 bg-[#D4AF37]/5 animate-pulse rounded-full pointer-events-none" />
              {activeVenue.logo_url?.trim() ? (
                <img 
                  src={activeVenue.logo_url} 
                  alt={activeVenue.venue_name} 
                  className="w-full h-full object-cover rounded-full z-10"
                />
              ) : (
                <Store className="w-14 h-14 text-[#D4AF37]/50 z-10" />
              )}
            </div>
            <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-[#D4AF37] to-[#F1C40F] w-10 h-10 rounded-full flex items-center justify-center border-[3px] border-[#120C08] shadow-[0_5px_15px_rgba(212,175,55,0.4)]">
              <Check className="w-5 h-5 text-black stroke-[3]" />
            </div>
          </div>
          <div className="text-center space-y-2">
            <h1 className="text-2xl font-black text-white tracking-tighter drop-shadow-lg">{activeVenue.venue_name}</h1>
            <p className="text-xs text-[#D4AF37] font-bold tracking-widest uppercase">Hoş Geldiniz</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="w-full space-y-5">
          <button
            onClick={() => setHasEnteredGateway(true)}
            className="w-full h-16 rounded-[1.5rem] bg-gradient-to-r from-[#D4AF37] to-[#F1C40F] text-black font-black text-lg flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(212,175,55,0.3)] active:brightness-110 active:scale-[0.98] active:scale-95 transition-all group"
          >
            <Music className="w-6 h-6 group-active:scale-95 transition-transform" />
            Müzik Kutusuna Bağlan
          </button>

          {/* Wi-Fi Info Card (CONDITIONAL) */}
          {hasWifi && (
            <div className="w-full bg-[#1A1A1A]/80 border border-[#D4AF37]/20 rounded-2xl p-4 text-center mt-4 shadow-inner backdrop-blur-md">
              <div className="flex items-center justify-center gap-2 mb-4 pb-4 border-b border-[#D4AF37]/10">
                <Wifi className="w-5 h-5 text-[#D4AF37] animate-pulse" />
                <h3 className="text-sm font-black text-white tracking-widest uppercase">Mekân Wi-Fi Bilgileri</h3>
              </div>
              
              <div className="space-y-3">
                {wifiName?.trim() && (
                  <div className="flex items-center justify-between bg-black/60 rounded-2xl p-4 border border-white/5 shadow-inner">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Ağ Adı</span>
                    <span className="text-sm text-white font-black">{wifiName}</span>
                  </div>
                )}
                
                {wifiPass?.trim() && (
                  <div className="flex items-center justify-between bg-black/60 rounded-2xl p-4 border border-white/5 shadow-inner group">
                    <span className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Şifre</span>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-[#D4AF37] font-mono font-black tracking-widest drop-shadow-md">{wifiPass}</span>
                      <button 
                        onClick={() => {
                          if (wifiPass) {
                            navigator.clipboard.writeText(wifiPass);
                            setCopied(true);
                            showToast('Wi-Fi Şifresi Kopyalandı!');
                            setTimeout(() => setCopied(false), 2000);
                          }
                        }}
                        className="p-2 rounded-xl bg-white/5 active:bg-white/10 text-gray-300 transition-all active:scale-95 active:scale-90 shadow-sm"
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
              className="w-full h-16 rounded-[1.5rem] bg-gradient-to-r from-[#241911] to-[#1C130D] border border-[#D4AF37]/40 text-amber-100 font-black text-lg flex items-center justify-center gap-3 active:bg-[#222] active:border-[#D4AF37]/60 active:shadow-[0_0_25px_rgba(212,175,55,0.2)] active:scale-95 transition-all shadow-xl group"
            >
              📖 Dijital Menü
            </a>
          )}
        </div>
      </div>

      {/* Footer KVKK */}
      <div className="absolute bottom-4 w-full flex flex-col items-center gap-1 z-10 px-4">
        <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-1 text-[10px] text-gray-500">
          <a href="/legal/terms" className="active:text-[#E5A93C] underline underline-offset-2 transition-colors">Hizmet Sözleşmesi</a>
          <a href="/legal/privacy" className="active:text-[#E5A93C] underline underline-offset-2 transition-colors">Gizlilik & KVKK</a>
          <a href="/legal/refund" className="active:text-[#E5A93C] underline underline-offset-2 transition-colors">İptal & İade</a>
          <a href="/legal/sales" className="active:text-[#E5A93C] underline underline-offset-2 transition-colors">Mesafeli Satış</a>
        </div>
      </div>
    </div>
  );
};
