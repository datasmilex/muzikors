'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Coins, Music, Trash2, LogOut, Sparkles, Trophy, Loader2, Award } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';



export const ProfileView: React.FC = () => {
  const { activeModal, closeModal, user, deleteAccount, logout, loginWithProvider } = useApp();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);



  if (activeModal !== 'profile') return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Cinematic Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          onClick={closeModal}
          className="fixed inset-0 bg-black/80 backdrop-blur-2xl"
        />

        {/* Profile Card Container */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          transition={{ type: 'spring', damping: 22, stiffness: 200, bounce: 0.2 }}
          className="relative w-full max-w-md bg-[#120C08] sm:rounded-[2.5rem] rounded-[2rem] p-6 z-10 shadow-[0_-10px_40px_rgba(212,175,55,0.15)] flex flex-col justify-between overflow-hidden glass-panel-gold border border-[#D4AF37]/30"
        >
          {/* Decorative Glow */}
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/10 blur-3xl rounded-full pointer-events-none" />

          {/* Header */}
          <div className="flex items-center justify-between pb-4 border-b border-[#D4AF37]/20 relative z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center text-[#D4AF37] shadow-inner">
                <User className="w-5 h-5 drop-shadow-md" />
              </div>
              <h2 className="text-xl font-black text-white tracking-tight drop-shadow-lg">Profilim</h2>
            </div>
            <button
              onClick={closeModal}
              className="p-2 rounded-full bg-white/5 hover:bg-white/10 hover:rotate-90 text-zinc-400 hover:text-white transition-all duration-300"
              aria-label="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Profile Avatar & Username */}
          <div className="flex flex-col items-center text-center my-6 relative z-10 group">
            <div className="relative w-24 h-24 rounded-full p-1 border-[3px] border-[#D4AF37] shadow-[0_0_20px_rgba(212,175,55,0.3)] bg-[#1C130D] mb-4 flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
              {user && user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-full h-full object-cover rounded-full"
                />
              ) : (
                <div className="w-full h-full rounded-full bg-[#1C130D] flex items-center justify-center text-[#D4AF37]">
                  <User className="w-10 h-10" />
                </div>
              )}
              {user && (
                <div className="absolute -bottom-1 -right-1 w-8 h-8 rounded-full gold-gradient-bg border-[3px] border-stone-950 flex items-center justify-center text-stone-950 shadow-md">
                  <Sparkles className="w-4 h-4" />
                </div>
              )}
            </div>

            <h3 className="text-xl font-black text-white tracking-tight drop-shadow-md">{user ? user.name : 'Misafir Kullanıcı'}</h3>
            <span className="text-sm text-[#D4AF37] font-bold mt-1 tracking-wider uppercase">{user ? user.username : '@misafir'}</span>
          </div>

          {/* ITEM 4: Profile Stats Persistence (3 Stat Cards) */}
          <div className="grid grid-cols-3 gap-3 my-4 relative z-10">
            <div className="bg-gradient-to-br from-[#241911] to-[#1C130D] rounded-2xl p-4 text-center border border-[#D4AF37]/40 shadow-[0_5px_15px_rgba(212,175,55,0.15)] flex flex-col items-center justify-center group hover:-translate-y-1 transition-transform">
              <div className="w-8 h-8 rounded-xl bg-[#D4AF37]/20 border border-[#D4AF37]/40 flex items-center justify-center text-[#D4AF37] mb-2 group-hover:scale-110 transition-transform">
                <Coins className="w-4 h-4 drop-shadow-md" />
              </div>
              <span className="text-2xl font-black text-white drop-shadow-sm">{user ? user.credits : 0}</span>
              <span className="text-[10px] font-black text-[#D4AF37] uppercase tracking-widest mt-1">
                Kredi
              </span>
            </div>

            <div className="bg-[#1A1A1A]/80 rounded-2xl p-4 text-center border border-emerald-500/20 flex flex-col items-center justify-center group hover:-translate-y-1 transition-transform shadow-inner">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2 group-hover:scale-110 transition-transform">
                <Award className="w-4 h-4 drop-shadow-sm" />
              </div>
              <span className="text-xl font-black text-gray-200">
                {user ? (user.lifetimeCredits || user.credits || 10) : 0}
              </span>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                Yüklenen
              </span>
            </div>

            <div className="bg-[#1A1A1A]/80 rounded-2xl p-4 text-center border border-amber-500/20 flex flex-col items-center justify-center group hover:-translate-y-1 transition-transform shadow-inner">
              <div className="w-8 h-8 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400 mb-2 group-hover:scale-110 transition-transform">
                <Music className="w-4 h-4 drop-shadow-sm" />
              </div>
              <span className="text-xl font-black text-gray-200">{user ? user.totalSongsRequested : 0}</span>
              <span className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mt-1">
                İstenen
              </span>
            </div>
          </div>

          {/* Actions */}
          <div className="pt-6 border-t border-[#D4AF37]/20 text-center space-y-4 relative z-10">
            {!user ? (
              <div className="space-y-3">
                <button
                  onClick={() => {
                    closeModal();
                    loginWithProvider('google');
                  }}
                  className="w-full py-4 rounded-[1.5rem] bg-white text-stone-950 font-black text-sm flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(255,255,255,0.15)] hover:scale-[1.02] active:scale-95 transition-all group"
                >
                  <svg className="w-5 h-5 shrink-0 group-hover:scale-110 transition-transform" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                  </svg>
                  <span>Google ile Devam Et</span>
                </button>
              </div>
            ) : showConfirmDelete ? (
              <div className="bg-red-950/40 border border-red-500/40 rounded-[1.5rem] p-4 space-y-3 shadow-inner">
                <p className="text-sm text-red-300 font-bold tracking-wide">Hesabınızı kalıcı olarak silmek istediğinize emin misiniz?</p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setShowConfirmDelete(false)}
                    className="flex-1 py-3 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-bold text-xs hover:bg-white/10 hover:text-white transition-all active:scale-95"
                  >
                    Vazgeç
                  </button>
                  <button
                    onClick={deleteAccount}
                    className="flex-1 py-3 rounded-xl bg-red-500/20 border border-red-500/50 text-red-400 font-bold text-xs hover:bg-red-500 hover:text-white transition-all shadow-[0_0_15px_rgba(239,68,68,0.2)] active:scale-95"
                  >
                    Evet, Kalıcı Sil
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between px-2">
                <button
                  onClick={logout}
                  className="text-xs font-bold text-amber-200/50 hover:text-white flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-white/5 transition-all group"
                >
                  <LogOut className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                  <span>Çıkış Yap</span>
                </button>

                <button
                  onClick={() => setShowConfirmDelete(true)}
                  className="text-xs font-bold text-red-500/70 hover:text-red-400 flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-red-500/10 transition-all group"
                >
                  <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>Hesabı Sil</span>
                </button>
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
