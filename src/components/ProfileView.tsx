'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Zap, Music, Trash2, LogOut, Sparkles, Award, ShieldCheck, ChevronRight } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ProfileView: React.FC = () => {
  const { activeModal, closeModal, user, deleteAccount, logout, loginWithProvider } = useApp();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  

  return (
    <AnimatePresence>
      {activeModal === 'profile' && (<>

      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Cinematic Deep Black Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ duration: 0.4 }}
          onClick={closeModal}
          className="fixed inset-0 bg-black/90 backdrop-blur-xl"
        />

        {/* Futuristic Card Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-sm bg-gradient-to-b from-[#1C130D] to-black rounded-3xl p-6 z-10 shadow-[0_0_50px_rgba(212,175,55,0.1)] border border-[#D4AF37]/20 overflow-hidden"
        >
          {/* Subtle Cyberpunk/Futuristic Grid & Glow */}
          <div className="absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-[#D4AF37]/15 to-transparent blur-3xl rounded-full pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-40 h-40 bg-gradient-to-tr from-amber-600/10 to-transparent blur-2xl rounded-full pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between mb-8 relative z-10">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-5 h-5 text-[#D4AF37]" />
              <span className="text-[10px] font-black text-[#D4AF37] tracking-[0.2em] uppercase">Kullanıcı Paneli</span>
            </div>
            <button
              onClick={closeModal}
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all backdrop-blur-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Avatar & ID Section */}
          <div className="flex flex-col items-center relative z-10 mb-8">
            <div className="relative group">
              {/* Outer Glowing Ring */}
              <div className="absolute -inset-1 bg-gradient-to-r from-[#D4AF37] to-amber-600 rounded-full blur opacity-25 group-hover:opacity-50 transition duration-1000 group-hover:duration-200 animate-pulse" />
              
              <div className="relative w-20 h-20 rounded-full border-2 border-[#D4AF37]/50 bg-black flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                {user && user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <User className="w-8 h-8 text-[#D4AF37]" />
                )}
              </div>
              {user && (
                <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-400 to-[#D4AF37] p-1.5 rounded-full border-2 border-black shadow-lg">
                  <Sparkles className="w-3 h-3 text-black" />
                </div>
              )}
            </div>

            <div className="mt-4 text-center">
              <h2 className="text-xl font-black text-white tracking-tight leading-none drop-shadow-md">
                {user ? user.name : 'Misafir Kullanıcı'}
              </h2>
              <div className="inline-flex items-center gap-1.5 mt-2 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                <span className="text-[9px] text-gray-300 font-medium tracking-wider">ID:</span>
                <span className="text-[10px] text-[#D4AF37] font-black tracking-widest">{user ? user.username : '@misafir'}</span>
              </div>
            </div>
          </div>

          {/* Sleek Data Cards (Stats) */}
          <div className="grid grid-cols-2 gap-3 mb-8 relative z-10">
            {/* Primary Stat */}
            <div className="col-span-2 bg-gradient-to-r from-[#241911] to-[#120C08] p-4 rounded-2xl border border-[#D4AF37]/30 shadow-[0_5px_15px_rgba(212,175,55,0.1)] flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-black/50 border border-[#D4AF37]/20 flex items-center justify-center shadow-inner">
                  <Zap className="w-5 h-5 text-[#D4AF37] fill-[#D4AF37]/20" />
                </div>
                <div>
                  <div className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-0.5">Aktif Bakiye</div>
                  <div className="text-xl font-black text-white font-mono leading-none">{user ? user.credits + (user.promo_credits || 0) : 0}</div>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-600" />
            </div>

            {/* Sub Stats */}
            <div className="bg-[#1A1A1A]/60 p-3 rounded-2xl border border-white/5 flex flex-col justify-center">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Award className="w-3.5 h-3.5 text-emerald-400" />
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Toplam</span>
              </div>
              <span className="text-base font-black text-gray-200 font-mono">{user ? (user.lifetimeCredits || user.credits || 10) : 0}</span>
            </div>

            <div className="bg-[#1A1A1A]/60 p-3 rounded-2xl border border-white/5 flex flex-col justify-center">
              <div className="flex items-center gap-1.5 mb-1.5">
                <Music className="w-3.5 h-3.5 text-amber-400" />
                <span className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">İstekler</span>
              </div>
              <span className="text-base font-black text-gray-200 font-mono">{user ? user.totalSongsRequested : 0}</span>
            </div>
          </div>

          {/* Actions */}
          <div className="relative z-10 pt-2 border-t border-white/5">
            {!user ? (
              <button
                onClick={() => { closeModal(); loginWithProvider('google'); }}
                className="w-full py-3 rounded-xl bg-white text-black font-black text-xs flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all shadow-lg"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                Google ile Devam Et
              </button>
            ) : showConfirmDelete ? (
              <div className="bg-red-500/10 border border-red-500/20 rounded-xl p-3 shadow-inner">
                <p className="text-[10px] text-red-300 font-bold tracking-wide text-center mb-3">Hesabınızı kalıcı olarak silmek istediğinize emin misiniz?</p>
                <div className="flex gap-2">
                  <button
                    onClick={() => setShowConfirmDelete(false)}
                    className="flex-1 py-2 rounded-lg bg-black/50 border border-white/5 text-gray-300 font-bold text-[10px] hover:bg-white/10 hover:text-white transition-all active:scale-95 uppercase tracking-widest"
                  >
                    Vazgeç
                  </button>
                  <button
                    onClick={deleteAccount}
                    className="flex-1 py-2 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 font-bold text-[10px] hover:bg-red-500 hover:text-white transition-all active:scale-95 uppercase tracking-widest"
                  >
                    Kalıcı Sil
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between mt-2">
                <button
                  onClick={logout}
                  className="text-[9px] font-bold text-gray-400 hover:text-white flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-white/5 transition-all group uppercase tracking-widest"
                >
                  <LogOut className="w-3.5 h-3.5 group-hover:-translate-x-1 transition-transform" />
                  Çıkış Yap
                </button>
                <button
                  onClick={() => setShowConfirmDelete(true)}
                  className="text-[9px] font-bold text-red-500/60 hover:text-red-400 flex items-center gap-1.5 px-3 py-2 rounded-lg hover:bg-red-500/10 transition-all group uppercase tracking-widest"
                >
                  <Trash2 className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
                  Hesabı Sil
                </button>
              </div>
            )}
                    </div>

          {/* Legal Links (List Group) */}
          <div className="relative z-10 mt-6 pt-4 border-t border-white/5 flex flex-wrap justify-center gap-x-4 gap-y-2 text-[10px] text-gray-500 font-medium">
            <a href="/legal/terms" className="hover:text-[#D4AF37] transition-colors">Hizmet Sözleşmesi</a>
            <span className="text-white/10">•</span>
            <a href="/legal/privacy" className="hover:text-[#D4AF37] transition-colors">KVKK & Gizlilik</a>
            <span className="text-white/10">•</span>
            <a href="/legal/refund" className="hover:text-[#D4AF37] transition-colors">İptal & İade</a>
            <span className="text-white/10">•</span>
            <a href="/legal/sales" className="hover:text-[#D4AF37] transition-colors">Mesafeli Satış</a>
          </div>
        </motion.div>
      </div>
    
      </>)}
    </AnimatePresence>
  );
};
