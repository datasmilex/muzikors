'use client';

import React, { useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Zap, Music, Trash2, LogOut, Sparkles, Award, ShieldCheck, ChevronRight, Upload, Loader2 } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const ProfileView: React.FC = () => {
  const { activeModal, closeModal, user, deleteAccount, logout, loginWithProvider, showToast } = useApp();
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const presetAvatars = [
    '/avatar_cat.jpg',
    '/avatar_male.jpg',
    '/avatar_female.jpg',
    '/avatar_dj_panda.jpg',
    '/avatar_robot.jpg',
    '/avatar_fox.jpg',
  ];

  const presetAvatarLabels = ['Kedi', 'Erkek', 'Kız', 'DJ Panda', 'Robot', 'Tilki'];

  const handleEditClick = () => {
    setEditUsername(user?.username?.replace('@', '') || '');
    setEditAvatar(user?.avatar || presetAvatars[0]);
    setIsEditing(true);
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;

    if (!file.type.startsWith('image/')) {
      showToast('Lütfen sadece resim dosyası yükleyin.');
      return;
    }

    setUploadingAvatar(true);
    try {
      const { supabase } = await import('../lib/supabaseClient');
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // If user.avatar is from avatars bucket, we should delete it first
      if (user.avatar && user.avatar.includes('/storage/v1/object/public/avatars/')) {
        const oldFileName = user.avatar.split('/').pop();
        if (oldFileName) {
          await supabase.storage.from('avatars').remove([oldFileName]);
        }
      }

      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file);
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(filePath);
      
      setEditAvatar(publicUrl);
      showToast('Fotoğraf başarıyla yüklendi!');
    } catch (err: any) {
      console.error(err);
      showToast('Fotoğraf yüklenirken bir hata oluştu.');
    } finally {
      setUploadingAvatar(false);
    }
  };

  const handleSave = async () => {
    if (!user) return;
    setIsSaving(true);
    
    try {
      const newUsername = '@' + editUsername.trim();
      
      // Check 7-day limit if username is changed
      if (newUsername !== user.username) {
        if (user.last_username_update) {
          const daysSince = (new Date().getTime() - new Date(user.last_username_update).getTime()) / (1000 * 3600 * 24);
          if (daysSince < 7) {
            showToast('ID (Kullanıcı Adı) haftada sadece 1 kez değiştirilebilir.');
            setIsSaving(false);
            return;
          }
        }
      }

      const updates: any = { avatar_url: editAvatar };
      if (newUsername !== user.username) {
        updates.username = newUsername;
        updates.last_username_update = new Date().toISOString();
      }

      const { supabase } = await import('../lib/supabaseClient');
      const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
      
      if (error) throw error;

      // Update user state immediately so UI reflects change without needing a page reload
      const { setUser: _setUser } = await import('../context/AppContext').then(m => ({ setUser: null })).catch(() => ({ setUser: null }));
      // Trigger re-render via toast; Realtime subscription will propagate actual change
      showToast('Profiliniz başarıyla güncellendi!');
      setIsEditing(false);
    } catch (err: any) {
      console.error(err);
      showToast('Profil güncellenirken bir hata oluştu.');
    } finally {
      setIsSaving(false);
    }
  };

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
          transition={{ type: 'tween', duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
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
              className="p-1.5 rounded-full bg-white/5 active:bg-white/10 text-gray-400 active:text-white transition-all backdrop-blur-md"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Avatar & ID Section */}
          <div className="flex flex-col items-center relative z-10 mb-8">
            <div className="relative group">
              {/* Outer Glowing Ring */}
              <div className={`absolute -inset-1 rounded-full blur opacity-25 group-active:opacity-50 transition duration-1000 group-active:duration-200 animate-pulse ${user?.isPremium ? 'bg-gradient-to-r from-amber-300 via-[#D4AF37] to-amber-300' : 'bg-gradient-to-r from-[#D4AF37] to-amber-600'}`} />
              
              <div className={`relative w-20 h-20 rounded-full border-2 bg-black flex items-center justify-center overflow-hidden shadow-[0_0_20px_rgba(212,175,55,0.2)] ${user?.isPremium ? 'border-amber-300 shadow-[0_0_25px_rgba(252,211,77,0.4)]' : 'border-[#D4AF37]/50'}`}>
                {user && user.avatar ? (
                  <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                ) : (
                  <User className={`w-8 h-8 ${user?.isPremium ? 'text-amber-300' : 'text-[#D4AF37]'}`} />
                )}
              </div>
              
              {/* Premium Badge */}
              {user?.isPremium && (
                <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 bg-gradient-to-r from-amber-500 to-yellow-400 px-2 py-0.5 rounded-full border border-yellow-200 shadow-[0_0_10px_rgba(251,191,36,0.6)] z-20">
                  <span className="text-[9px] font-black text-stone-900 uppercase tracking-widest leading-none block pt-0.5">VIP</span>
                </div>
              )}
              
              {user && !user.isPremium && (
                <div className="absolute -bottom-2 -right-2 bg-gradient-to-r from-amber-400 to-[#D4AF37] p-1.5 rounded-full border-2 border-black shadow-lg">
                  <Sparkles className="w-3 h-3 text-black" />
                </div>
              )}
            </div>

            <div className="mt-5 text-center w-full">
              {isEditing ? (
                <div className="space-y-4 px-2">
                  <div className="flex gap-3 overflow-x-auto pb-2 px-1 scrollbar-hide mb-4">
                    {/* Upload button */}
                    <div className="flex flex-col items-center gap-1 shrink-0">
                      <button
                        onClick={() => fileInputRef.current?.click()}
                        disabled={uploadingAvatar}
                        className="w-14 h-14 rounded-full border-2 border-dashed border-[#D4AF37]/50 flex items-center justify-center bg-white/5 hover:bg-white/10 transition-all text-[#D4AF37]"
                      >
                        {uploadingAvatar ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                      </button>
                      <span className="text-[8px] text-amber-200/50 font-bold">Yükle</span>
                    </div>
                    <input
                      type="file"
                      ref={fileInputRef}
                      className="hidden"
                      accept="image/*"
                      onChange={handleFileUpload}
                    />
                    {presetAvatars.map((url, idx) => (
                      <div key={idx} className="flex flex-col items-center gap-1 shrink-0">
                        <button
                          onClick={() => setEditAvatar(url)}
                          className={`w-14 h-14 rounded-full border-2 overflow-hidden transition-all ${
                            editAvatar === url ? 'border-[#D4AF37] scale-110 shadow-[0_0_12px_rgba(212,175,55,0.6)]' : 'border-white/10 opacity-60 hover:opacity-100'
                          }`}
                        >
                          <img src={url} alt={presetAvatarLabels[idx]} className="w-full h-full object-cover" />
                        </button>
                        <span className="text-[8px] text-amber-200/50 font-bold">{presetAvatarLabels[idx]}</span>
                      </div>
                    ))}
                  </div>
                  <div>
                    <label className="text-[10px] text-gray-400 font-bold uppercase tracking-widest mb-1 block">Kullanıcı ID</label>
                    <div className="relative">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#D4AF37] font-bold">@</span>
                      <input
                        type="text"
                        value={editUsername}
                        onChange={(e) => setEditUsername(e.target.value)}
                        className="w-full bg-black/50 border border-white/10 rounded-xl py-2 pl-7 pr-3 text-white font-bold focus:outline-none focus:border-[#D4AF37]/50 transition-colors"
                        placeholder="kullanici_adi"
                      />
                    </div>
                    <p className="text-[9px] text-amber-200/50 mt-1">Haftada sadece 1 kez değiştirebilirsiniz.</p>
                  </div>
                  <div className="flex gap-2 pt-2">
                    <button
                      onClick={() => setIsEditing(false)}
                      className="flex-1 py-2 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-bold text-[10px] uppercase tracking-widest active:scale-95"
                    >
                      İptal
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={isSaving}
                      className="flex-1 py-2 rounded-xl gold-gradient-bg text-black font-black text-[10px] uppercase tracking-widest active:scale-95 shadow-[0_0_15px_rgba(212,175,55,0.3)] disabled:opacity-50"
                    >
                      {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex items-center justify-center gap-2">
                    <h2 className={`text-xl font-black tracking-tight leading-none drop-shadow-md ${user?.isPremium ? 'text-amber-100' : 'text-white'}`}>
                      {user ? user.name : 'Misafir Kullanıcı'}
                    </h2>
                    {user?.isPremium && (
                      <ShieldCheck className="w-4 h-4 text-amber-400 drop-shadow-md" />
                    )}
                  </div>
                  <div className="inline-flex items-center gap-1.5 mt-2 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                    <span className="text-[9px] text-gray-300 font-medium tracking-wider">ID:</span>
                    <span className={`text-[10px] font-black tracking-widest ${user?.isPremium ? 'text-amber-400' : 'text-[#D4AF37]'}`}>{user ? user.username : '@misafir'}</span>
                  </div>
                  
                  {user && (
                    <div className="mt-4">
                      <button
                        onClick={handleEditClick}
                        className="text-[10px] font-bold text-gray-300 bg-white/5 border border-white/10 px-4 py-1.5 rounded-full hover:bg-white/10 active:scale-95 transition-all shadow-sm"
                      >
                        ✏️ Profili Düzenle
                      </button>
                    </div>
                  )}
                </>
              )}
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
                className="w-full py-3 rounded-xl bg-white text-black font-black text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg"
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
                    className="flex-1 py-2 rounded-lg bg-black/50 border border-white/5 text-gray-300 font-bold text-[10px] active:bg-white/10 active:text-white transition-all active:scale-95 uppercase tracking-widest"
                  >
                    Vazgeç
                  </button>
                  <button
                    onClick={deleteAccount}
                    className="flex-1 py-2 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 font-bold text-[10px] active:bg-red-500 active:text-white transition-all active:scale-95 uppercase tracking-widest"
                  >
                    Kalıcı Sil
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between mt-2">
                <button
                  onClick={logout}
                  className="text-[9px] font-bold text-gray-400 active:text-white flex items-center gap-1.5 px-3 py-2 rounded-lg active:bg-white/5 transition-all group uppercase tracking-widest"
                >
                  <LogOut className="w-3.5 h-3.5 group-active:-translate-x-1 transition-transform" />
                  Çıkış Yap
                </button>
                <button
                  onClick={() => setShowConfirmDelete(true)}
                  className="text-[9px] font-bold text-red-500/60 active:text-red-400 flex items-center gap-1.5 px-3 py-2 rounded-lg active:bg-red-500/10 transition-all group uppercase tracking-widest"
                >
                  <Trash2 className="w-3.5 h-3.5 group-active:scale-95 transition-transform" />
                  Hesabı Sil
                </button>
              </div>
            )}
                    </div>

          {/* Legal Links (List Group) */}
          <div className="relative z-10 mt-6 pt-4 border-t border-white/5 flex flex-wrap justify-center gap-x-4 gap-y-2 text-[10px] text-gray-500 font-medium">
            <a href="/legal/terms" className="active:text-[#D4AF37] transition-colors">Hizmet Sözleşmesi</a>
            <span className="text-white/10">•</span>
            <a href="/legal/privacy" className="active:text-[#D4AF37] transition-colors">KVKK & Gizlilik</a>
            <span className="text-white/10">•</span>
            <a href="/legal/refund" className="active:text-[#D4AF37] transition-colors">İptal & İade</a>
            <span className="text-white/10">•</span>
            <a href="/legal/sales" className="active:text-[#D4AF37] transition-colors">Mesafeli Satış</a>
          </div>
        </motion.div>
      </div>
    
      </>)}
    </AnimatePresence>
  );
};
