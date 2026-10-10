'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { User, Trash2, LogOut, Upload, Loader2, Check, CropIcon, Lock, Pencil } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PremiumBadge, BetaTesterBadge } from './PremiumBadge';
import Cropper from 'react-easy-crop';
import { AvatarFrame } from './AvatarFrame';
import { supabase } from '../lib/supabaseClient';
import { getLevelDetails, AVATAR_FRAMES, isFrameUnlocked } from '../utils/levelSystem';
import { Sheet } from './ui/Sheet';
import { btn, inputBase, sectionLabel } from './ui/controls';
import { EASE_OUT } from '../lib/motion';

// ─── Crop helpers ─────────────────────────────────────────────────────────────
interface Area { x: number; y: number; width: number; height: number; }

async function getCroppedBlob(imageSrc: string, pixelCrop: Area): Promise<Blob> {
  const image = await new Promise<HTMLImageElement>((resolve, reject) => {
    const img = new Image();
    img.addEventListener('load', () => resolve(img));
    img.addEventListener('error', reject);
    img.src = imageSrc;
  });
  const canvas = document.createElement('canvas');
  const size = Math.min(pixelCrop.width, pixelCrop.height, 400);
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(image, pixelCrop.x, pixelCrop.y, pixelCrop.width, pixelCrop.height, 0, 0, size, size);
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob) resolve(blob);
      else reject(new Error('Canvas toBlob failed'));
    }, 'image/jpeg', 0.88);
  });
}

// ─── Crop Modal ────────────────────────────────────────────────────────────────
interface CropModalProps {
  imageSrc: string;
  onConfirm: (blob: Blob) => void;
  onCancel: () => void;
}

const CropModal: React.FC<CropModalProps> = ({ imageSrc, onConfirm, onCancel }) => {
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [loading, setLoading] = useState(false);

  const onCropComplete = useCallback((_: Area, pixels: Area) => {
    setCroppedAreaPixels(pixels);
  }, []);

  const handleConfirm = async () => {
    if (!croppedAreaPixels) return;
    setLoading(true);
    try {
      const blob = await getCroppedBlob(imageSrc, croppedAreaPixels);
      onConfirm(blob);
    } catch (err) {
      console.error('[Crop Error]', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[150] flex flex-col items-center justify-center bg-black/95 p-4"
    >
      <div className="relative w-full max-w-sm aspect-square bg-neutral-900 rounded-3xl overflow-hidden">
        <Cropper
          image={imageSrc}
          crop={crop}
          zoom={zoom}
          aspect={1}
          cropShape="round"
          showGrid={false}
          onCropChange={setCrop}
          onZoomChange={setZoom}
          onCropComplete={onCropComplete}
        />
      </div>

      <div className="w-full max-w-sm mt-5 px-2 flex items-center gap-3">
        <span className="text-[13px] text-white/55">Yakınlaştır</span>
        <input
          type="range"
          min={1}
          max={3}
          step={0.05}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="flex-1 accent-[var(--theme-primary)] h-1.5 cursor-pointer"
        />
      </div>

      <div className="grid grid-cols-2 gap-2.5 mt-6 w-full max-w-sm">
        <button type="button" onClick={onCancel} disabled={loading} className={btn.secondary}>
          Vazgeç
        </button>
        <button type="button" onClick={handleConfirm} disabled={loading} className={btn.primary}>
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <CropIcon className="w-4 h-4" />}
          Kullan
        </button>
      </div>
    </motion.div>
  );
};

export const ProfileView: React.FC = () => {
  const {
    user,
    setUser,
    activeModal,
    openModal,
    closeModal,
    logout,
    deleteAccount,
    showToast,
    viewingProfileId,
    registerBackHandler
  } = useApp();

  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState('');
  const [editUsername, setEditUsername] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [selectedFrame, setSelectedFrame] = useState('none');
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);

  useEffect(() => {
    if (cropImageSrc) {
      return registerBackHandler(() => {
        setCropImageSrc(null);
        return true;
      });
    }
    if (showConfirmDelete) {
      return registerBackHandler(() => {
        setShowConfirmDelete(false);
        return true;
      });
    }
    if (isEditing) {
      return registerBackHandler(() => {
        setIsEditing(false);
        return true;
      });
    }
  }, [cropImageSrc, showConfirmDelete, isEditing, registerBackHandler]);

  // Profile state
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isOwnProfile = !viewingProfileId || viewingProfileId === user?.id;
  const currentProfile = isOwnProfile ? user : profileData;

  const fetchProfileData = useCallback(async () => {
    if (!supabase) return;
    const targetId = viewingProfileId || user?.id;
    if (!targetId) return;

    setIsLoadingProfile(true);
    try {
      // Fetch Profile
      const { data: pData, error: pErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetId)
        .single();
      
      if (!pErr && pData) {
        setProfileData(pData);
      }
    } catch (err) {
      console.error('[fetchProfileData error]', err);
    } finally {
      setIsLoadingProfile(false);
    }
  }, [viewingProfileId, user?.id]);

  useEffect(() => {
    if (activeModal === 'profile') {
      fetchProfileData();
    } else {
      setIsEditing(false);
      setShowConfirmDelete(false);
    }
  }, [activeModal, viewingProfileId, fetchProfileData]);

  const handleEditClick = () => {
    if (!user) return;
    setEditName(user.name || '');
    setEditUsername((user.username || '').replace(/^@/, ''));
    setEditAvatar(user.avatar || '');
    setSelectedFrame(user.avatar_frame || 'none');
    setIsEditing(true);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      showToast('Lütfen geçerli bir görsel dosyası seçin.');
      return;
    }

    if (file.size > 8 * 1024 * 1024) {
      showToast('Görsel boyutu 8MB\'dan küçük olmalıdır.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => setCropImageSrc(reader.result as string);
    reader.readAsDataURL(file);
    e.target.value = '';
  };

  const handleCropConfirm = async (croppedBlob: Blob) => {
    setCropImageSrc(null);
    if (!user || !supabase) return;

    setUploadingAvatar(true);
    try {
      const fileExt = 'jpg';
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, croppedBlob, { contentType: 'image/jpeg', upsert: true });

      if (uploadError) throw uploadError;

      const { data: urlData } = supabase.storage.from('avatars').getPublicUrl(filePath);
      const publicUrl = urlData.publicUrl;

      setEditAvatar(publicUrl);
      showToast('Fotoğraf kırpıldı ve yüklendi!');
    } catch (err: any) {
      console.error('[Avatar Upload Error]', err);
      showToast('Fotoğraf yüklenirken bir hata oluştu.');
    } finally {
      setUploadingAvatar(false);
    }
  };



  const handleSaveProfile = async () => {
    if (!user || !supabase) return;
    setIsSaving(true);

    try {
      const cleanUsername = editUsername.trim().toLowerCase().replace(/^@/, '');
      
      if (cleanUsername && cleanUsername !== (user.username || '').replace(/^@/, '')) {
        const usernameRegex = /^[a-z0-9_]{3,20}$/;
        if (!usernameRegex.test(cleanUsername)) {
          showToast('Kullanıcı adı 3-20 karakter olmalı ve sadece harf, rakam, alt çizgi içermelidir.');
          setIsSaving(false);
          return;
        }

        if (user.last_username_update) {
          const lastUpdate = new Date(user.last_username_update).getTime();
          const oneWeekMs = 7 * 24 * 60 * 60 * 1000;
          if (Date.now() - lastUpdate < oneWeekMs) {
            const daysLeft = Math.ceil((oneWeekMs - (Date.now() - lastUpdate)) / (24 * 60 * 60 * 1000));
            showToast(`Kullanıcı adınızı 7 günde bir değiştirebilirsiniz. (${daysLeft} gün kaldı)`);
            setIsSaving(false);
            return;
          }
        }

        const { data: existingUser } = await supabase
          .from('profiles')
          .select('id')
          .eq('username', '@' + cleanUsername)
          .neq('id', user.id)
          .maybeSingle();

        if (existingUser) {
          showToast('Bu kullanıcı adı zaten kullanılıyor.');
          setIsSaving(false);
          return;
        }
      }

      const updates: any = {
        full_name: editName.trim() || user.name,
        avatar_url: editAvatar || user.avatar,
        avatar_frame: selectedFrame,
        updated_at: new Date().toISOString(),
      };

      if (cleanUsername) {
        updates.username = '@' + cleanUsername;
        if (cleanUsername !== (user.username || '').replace(/^@/, '')) {
          updates.last_username_update = new Date().toISOString();
        }
      }

      const { error } = await supabase
        .from('profiles')
        .update(updates)
        .eq('id', user.id);

      if (error) throw error;

      setUser(prev => prev ? {
        ...prev,
        name: updates.full_name,
        avatar: updates.avatar_url,
        username: updates.username || prev.username,
        avatar_frame: updates.avatar_frame,
        last_username_update: updates.last_username_update || prev.last_username_update,
      } : null);

      showToast('Profiliniz başarıyla güncellendi!');
      setIsEditing(false);
      fetchProfileData();
    } catch (err: any) {
      console.error(err);
      showToast('Profil güncellenirken bir hata oluştu.');
    } finally {
      setIsSaving(false);
    }
  };

  const profileTotalXp = Number(currentProfile?.xp ?? 0);
  const levelInfo = getLevelDetails(profileTotalXp);
  const isProfileBetaTester = currentProfile?.is_beta_tester ?? currentProfile?.isBetaTester ?? false;

  const presetAvatars = [
    ...(user?.avatar && !['/logo_gold.png', '/logo_cyan.png', '/logo_purple.png', '/logo_green.png', '/logo_blue.png', '/logo_red.png', '/logo.png'].includes(user.avatar)
      ? [{ id: 'custom', url: user.avatar }]
      : []),
    { id: 'gold', url: '/logo_gold.png' },
    { id: 'cyan', url: '/logo_cyan.png' },
    { id: 'purple', url: '/logo_purple.png' },
    { id: 'green', url: '/logo_green.png' },
    { id: 'blue', url: '/logo_blue.png' },
    { id: 'red', url: '/logo_red.png' },
    { id: 'classic', url: '/logo.png' },
  ];

  const displayAvatar = (() => {
    const av = isEditing ? editAvatar : currentProfile?.avatar || currentProfile?.avatar_url;
    const isGoogle = av?.includes('googleusercontent.com') || av?.includes('google.com');
    return av && !isGoogle ? av : null;
  })();

  const displayName = currentProfile?.name || currentProfile?.full_name || 'Misafir';
  const isVip = Boolean(currentProfile?.isPremium || currentProfile?.is_premium);
  const totalRequests = currentProfile?.totalSongsRequested ?? currentProfile?.total_songs_requested ?? 0;
  const streak = currentProfile?.daily_streak ?? currentProfile?.dailyStreak ?? 0;

  const avatarBlock = (
    <div className="relative">
      <AvatarFrame frameId={isEditing ? selectedFrame : currentProfile?.avatar_frame || 'none'} size="2xl">
        <div className="w-full h-full rounded-full overflow-hidden bg-white/[0.06] grid place-items-center">
          {displayAvatar ? (
            <img
              src={displayAvatar}
              alt=""
              className={`w-full h-full ${displayAvatar.startsWith('/logo') ? 'object-contain p-4' : 'object-cover'}`}
            />
          ) : (
            <User className="w-10 h-10 text-white/30" />
          )}
        </div>
      </AvatarFrame>
      {uploadingAvatar && (
        <div className="absolute inset-0 rounded-full bg-black/70 grid place-items-center">
          <Loader2 className="w-6 h-6 animate-spin text-white" />
        </div>
      )}
    </div>
  );

  return (
    <>
      <Sheet
        open={activeModal === 'profile'}
        onClose={() => closeModal(true)}
        title={isEditing ? 'Profili düzenle' : undefined}
        onBack={isEditing ? () => setIsEditing(false) : undefined}
        height="tall"
        width="lg"
        ariaLabel={isEditing ? 'Profili düzenle' : `${displayName} profili`}
        footer={
          isEditing ? (
            <button type="button" onClick={handleSaveProfile} disabled={isSaving || uploadingAvatar} className={`${btn.primary} w-full`}>
              {isSaving && <Loader2 className="w-4 h-4 animate-spin" />}
              Kaydet
            </button>
          ) : undefined
        }
      >
        {isLoadingProfile && !isOwnProfile && !profileData ? (
          <div className="flex flex-col items-center pt-6 gap-4" aria-label="Profil yükleniyor">
            <div className="w-24 h-24 rounded-full bg-white/[0.06] animate-pulse" />
            <div className="h-4 w-40 rounded-full bg-white/[0.06] animate-pulse" />
            <div className="h-3 w-24 rounded-full bg-white/[0.05] animate-pulse" />
          </div>
        ) : (
          <AnimatePresence mode="wait" initial={false}>
            {isEditing ? (
              <motion.div
                key="edit"
                initial={{ opacity: 0, x: 24 }}
                animate={{ opacity: 1, x: 0, transition: { duration: 0.28, ease: EASE_OUT } }}
                exit={{ opacity: 0, x: 24, transition: { duration: 0.16 } }}
                className="space-y-6 pb-2"
              >
                <div className="flex flex-col items-center">{avatarBlock}</div>

                <div>
                  <p className={sectionLabel}>Fotoğraf</p>
                  <div className="flex gap-2.5 overflow-x-auto scrollbar-hide -mx-5 px-5 pb-1">
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={uploadingAvatar}
                      aria-label="Fotoğraf yükle"
                      className="w-14 h-14 shrink-0 rounded-full border-2 border-dashed border-white/25 grid place-items-center text-white/70 active:scale-95 transition-transform"
                    >
                      {uploadingAvatar ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                    </button>
                    <input type="file" ref={fileInputRef} onChange={handleFileSelect} accept="image/*" className="hidden" />
                    {presetAvatars.map((av) => {
                      const selected = editAvatar === av.url;
                      return (
                        <button
                          key={av.id}
                          type="button"
                          onClick={() => setEditAvatar(av.url)}
                          aria-pressed={selected}
                          className={`relative w-14 h-14 shrink-0 rounded-full overflow-hidden bg-white/[0.06] active:scale-95 transition-[transform,box-shadow] duration-150 ${
                            selected ? 'ring-2 ring-white' : 'opacity-70'
                          }`}
                        >
                          <img src={av.url} alt="" className={`w-full h-full ${av.url.startsWith('/logo') ? 'object-contain p-2.5' : 'object-cover'}`} />
                          {selected && (
                            <span className="absolute inset-0 bg-black/35 grid place-items-center">
                              <Check className="w-5 h-5 text-white" strokeWidth={3} />
                            </span>
                          )}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="space-y-3">
                  <label className="block">
                    <span className={sectionLabel}>Görünen ad</span>
                    <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} placeholder="Ad Soyad" className={inputBase} />
                  </label>
                  <label className="block">
                    <span className={sectionLabel}>Kullanıcı adı</span>
                    <span className="relative block">
                      <span className="absolute left-4 top-1/2 -translate-y-1/2 text-white/40 text-[15px]">@</span>
                      <input
                        type="text"
                        value={editUsername}
                        onChange={(e) => setEditUsername(e.target.value)}
                        placeholder="kullanici_adi"
                        autoCapitalize="none"
                        className={`${inputBase} pl-9`}
                      />
                    </span>
                    <span className="block text-[12px] text-white/40 mt-1.5 px-1">Kullanıcı adını haftada bir değiştirebilirsin.</span>
                  </label>
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <p className={sectionLabel}>Çerçeve</p>
                    <p className="text-[12px] text-white/40 mb-2">Seviye {levelInfo.level}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    {AVATAR_FRAMES.map((frame) => {
                      const unlocked = isFrameUnlocked(frame.id, levelInfo.level, isProfileBetaTester);
                      const selected = selectedFrame === frame.id;
                      return (
                        <button
                          key={frame.id}
                          type="button"
                          onClick={() => (unlocked ? setSelectedFrame(frame.id) : showToast(frame.description || 'Bu çerçeve henüz kilitli.'))}
                          aria-pressed={selected}
                          className={`flex items-center gap-2.5 rounded-2xl px-3 py-2.5 text-left transition-colors duration-150 ${
                            selected ? 'bg-white/[0.12]' : 'bg-white/[0.04]'
                          } ${unlocked ? '' : 'opacity-45'}`}
                        >
                          <AvatarFrame frameId={frame.id} size="xs" showOrnament={false}>
                            <div className={`w-full h-full rounded-full bg-gradient-to-tr ${frame.previewGradient}`} />
                          </AvatarFrame>
                          <span className="flex-1 min-w-0">
                            <span className="block text-[13px] font-semibold truncate">{frame.name}</span>
                            <span className="block text-[11px] text-white/45">
                              {unlocked ? (selected ? 'Seçili' : 'Açık') : frame.minLevel ? `Seviye ${frame.minLevel}` : 'Beta'}
                            </span>
                          </span>
                          {!unlocked ? <Lock className="w-3.5 h-3.5 text-white/40 shrink-0" /> : selected ? <Check className="w-4 h-4 shrink-0" strokeWidth={3} /> : null}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </motion.div>
            ) : (
              <motion.div
                key="view"
                initial={{ opacity: 0, x: -24 }}
                animate={{ opacity: 1, x: 0, transition: { duration: 0.28, ease: EASE_OUT } }}
                exit={{ opacity: 0, x: -24, transition: { duration: 0.16 } }}
                className="pb-2"
              >
                <div className="flex flex-col items-center text-center pt-1">
                  {avatarBlock}
                  <h2 className="flex items-center gap-1.5 text-[22px] font-bold tracking-tight mt-4">
                    <span className="truncate max-w-[260px]">{displayName}</span>
                    {isVip && <PremiumBadge className="w-5 h-5 shrink-0" />}
                    {isProfileBetaTester && <BetaTesterBadge className="w-5 h-5 shrink-0" />}
                  </h2>
                  <p className="text-[14px] text-white/50 mt-0.5">{currentProfile?.username || '@misafir'}</p>
                  {isOwnProfile && (
                    <button type="button" onClick={handleEditClick} className={`${btn.secondary} mt-4 min-h-[40px] px-4 text-[14px]`}>
                      <Pencil className="w-4 h-4 text-white/60" />
                      Profili düzenle
                    </button>
                  )}
                </div>

                <div className="grid grid-cols-3 gap-2 mt-6">
                  {[
                    { label: 'Seviye', value: levelInfo.level },
                    { label: 'İstek', value: totalRequests },
                    { label: 'Günlük seri', value: streak },
                  ].map((stat) => (
                    <div key={stat.label} className="rounded-2xl bg-white/[0.04] py-3.5 text-center">
                      <p className="text-[20px] font-bold tabular-nums">{stat.value}</p>
                      <p className="text-[12px] text-white/45 mt-0.5">{stat.label}</p>
                    </div>
                  ))}
                </div>

                <div className="mt-3 rounded-2xl bg-white/[0.04] px-4 py-4">
                  <div className="flex items-center justify-between text-[13px]">
                    <span className="font-semibold">
                      {levelInfo.icon} {levelInfo.title}
                    </span>
                    <span className="text-white/45 tabular-nums">
                      {levelInfo.currentLevelXp} / {levelInfo.xpForNextLevel} XP
                    </span>
                  </div>
                  <div className="h-2 rounded-full bg-white/[0.08] overflow-hidden mt-3">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${levelInfo.progressPercentage}%` }}
                      transition={{ duration: 0.8, ease: EASE_OUT }}
                      className="h-full rounded-full bg-[var(--theme-primary)]"
                    />
                  </div>
                  <p className="text-[12px] text-white/45 mt-2">Sonraki seviyeye {levelInfo.remainingXpForNext} XP</p>
                </div>

                {isOwnProfile && user && (
                  <div className="mt-6 space-y-2">
                    <button
                      type="button"
                      onClick={() => {
                        closeModal();
                        setTimeout(() => logout(), 150);
                      }}
                      className={`${btn.secondary} w-full`}
                    >
                      <LogOut className="w-4 h-4 text-white/60" />
                      Çıkış yap
                    </button>

                    <AnimatePresence initial={false} mode="wait">
                      {showConfirmDelete ? (
                        <motion.div
                          key="confirm"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto', transition: { duration: 0.25, ease: EASE_OUT } }}
                          exit={{ opacity: 0, height: 0, transition: { duration: 0.15 } }}
                          className="overflow-hidden"
                        >
                          <div className="rounded-2xl bg-red-500/[0.08] p-4">
                            <p className="text-[14px] font-semibold text-red-200">Hesabın kalıcı olarak silinsin mi?</p>
                            <p className="text-[13px] text-white/55 mt-1">Profilin, geçmişin ve tüm verilerin silinir. Bu işlem geri alınamaz.</p>
                            <div className="grid grid-cols-2 gap-2 mt-4">
                              <button type="button" onClick={() => setShowConfirmDelete(false)} className={btn.secondary}>
                                Vazgeç
                              </button>
                              <button
                                type="button"
                                onClick={() => {
                                  deleteAccount();
                                  setShowConfirmDelete(false);
                                }}
                                className="inline-flex items-center justify-center min-h-[48px] rounded-2xl bg-red-500 text-white text-[15px] font-semibold active:scale-[0.97] transition-transform"
                              >
                                Sil
                              </button>
                            </div>
                          </div>
                        </motion.div>
                      ) : (
                        <motion.button
                          key="delete"
                          type="button"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          onClick={() => setShowConfirmDelete(true)}
                          className={`${btn.quiet} w-full text-red-300/80 hover:text-red-300`}
                        >
                          <Trash2 className="w-4 h-4" />
                          Hesabı sil
                        </motion.button>
                      )}
                    </AnimatePresence>
                  </div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        )}
      </Sheet>

      <AnimatePresence>
        {cropImageSrc && <CropModal imageSrc={cropImageSrc} onConfirm={handleCropConfirm} onCancel={() => setCropImageSrc(null)} />}
      </AnimatePresence>
    </>
  );
};
