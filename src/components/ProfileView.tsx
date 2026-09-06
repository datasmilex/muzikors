'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Zap, Music, Trash2, LogOut, Award, ShieldCheck, ChevronRight, Upload, Loader2, Check, CropIcon, Trophy, Heart, Users, CheckCircle, MessageCircle, Lock, Palette } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { THEMES } from '../lib/theme';
import { PremiumBadge, BetaTesterBadge } from './PremiumBadge';
import Cropper from 'react-easy-crop';
import { AvatarFrame } from './AvatarFrame';
import { supabase } from '../lib/supabaseClient';
import { SocialPost as SocialPostType, ProfileStats } from '../types';
import { SocialPost } from './SocialPost';
import { getLevelDetails, AVATAR_FRAMES, isFrameUnlocked } from '../utils/levelSystem';

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
    <div className="fixed inset-0 z-[150] flex flex-col items-center justify-center bg-black/90 p-4">
      <div className="relative w-full max-w-sm aspect-square bg-neutral-900 rounded-3xl overflow-hidden border border-white/10 shadow-2xl">
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

      <div className="w-full max-w-sm mt-4 px-4 flex items-center gap-3">
        <span className="text-xs text-neutral-400 font-bold">Yakınlaştır</span>
        <input
          type="range"
          min={1}
          max={3}
          step={0.05}
          value={zoom}
          onChange={(e) => setZoom(Number(e.target.value))}
          className="flex-1 accent-[var(--theme-primary)] h-1.5 bg-neutral-700 rounded-lg cursor-pointer"
        />
      </div>

      <div className="flex gap-3 mt-6 w-full max-w-sm px-4">
        <button
          onClick={onCancel}
          disabled={loading}
          className="flex-1 py-3 rounded-2xl bg-white/10 text-white font-bold text-xs active:scale-95 transition-all"
        >
          İptal
        </button>
        <button
          onClick={handleConfirm}
          disabled={loading}
          className="flex-1 py-3 rounded-2xl bg-[var(--theme-primary)] text-black font-black text-xs flex items-center justify-center gap-2 active:scale-95 transition-all shadow-lg"
        >
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><CropIcon className="w-4 h-4" /> Kırp ve Seç</>}
        </button>
      </div>
    </div>
  );
};

export const ProfileView: React.FC = () => {
  const {
    user,
    setUser,
    activeModal,
    closeModal,
    logout,
    deleteAccount,
    showToast,
    loginWithProvider,
    theme,
    setTheme,
    viewingProfileId,
    openProfile,
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

  // Social & Stats state
  const [profileData, setProfileData] = useState<any>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [stats, setStats] = useState<ProfileStats>({ followers_count: 0, following_count: 0, posts_count: 0, is_following: false });
  const [posts, setPosts] = useState<SocialPostType[]>([]);
  const [newPostContent, setNewPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const isOwnProfile = !viewingProfileId || viewingProfileId === user?.id;
  const currentProfile = isOwnProfile ? user : profileData;

  const fetchProfileData = useCallback(async () => {
    if (!supabase) return;
    const targetId = viewingProfileId || user?.id;
    if (!targetId) return;

    setIsLoadingProfile(true);
    try {
      // 1. Fetch Profile
      const { data: pData, error: pErr } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', targetId)
        .single();
      
      if (!pErr && pData) {
        setProfileData(pData);
      }

      // 2. Fetch Stats
      const { count: followersCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('following_id', targetId);

      const { count: followingCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true })
        .eq('follower_id', targetId);

      let isFollowing = false;
      if (user?.id && user.id !== targetId) {
        const { data: followRel } = await supabase
          .from('follows')
          .select('id')
          .eq('follower_id', user.id)
          .eq('following_id', targetId)
          .maybeSingle();
        isFollowing = !!followRel;
      }

      setStats({
        followers_count: followersCount || 0,
        following_count: followingCount || 0,
        posts_count: 0,
        is_following: isFollowing,
      });

      // 3. Fetch Posts
      const { data: postsData, error: postsErr } = await supabase
        .from('posts')
        .select(`
          id, user_id, content, likes_count, comments_count, created_at,
          profiles:user_id (id, full_name, username, avatar_url, avatar_frame, is_premium, is_beta_tester, total_songs_requested, xp, level),
          post_likes ( user_id )
        `)
        .eq('user_id', targetId)
        .order('created_at', { ascending: false });

      if (!postsErr && postsData) {
        const formattedPosts: SocialPostType[] = postsData.map((row: any) => {
          const prof = Array.isArray(row.profiles) ? row.profiles[0] : row.profiles;
          const authorFullName = prof?.full_name || (targetId === user?.id ? user?.name : pData?.full_name) || 'Muzikors Dinleyicisi';
          const authorUsername = prof?.username || (targetId === user?.id ? user?.username : pData?.username) || '@dinleyici';
          const authorAvatar = prof?.avatar_url || (targetId === user?.id ? user?.avatar : pData?.avatar_url);
          const authorFrame = prof?.avatar_frame || (targetId === user?.id ? user?.avatar_frame : pData?.avatar_frame) || 'none';
          const authorPremium = prof?.is_premium ?? (targetId === user?.id ? user?.isPremium : pData?.is_premium) ?? false;
          const authorBeta = prof?.is_beta_tester ?? (targetId === user?.id ? user?.is_beta_tester : pData?.is_beta_tester) ?? false;

          return {
            id: row.id,
            user_id: row.user_id,
            content: row.content,
            likes_count: row.likes_count || 0,
            comments_count: row.comments_count || 0,
            created_at: row.created_at,
            user_full_name: authorFullName,
            user_username: authorUsername,
            user_avatar_url: authorAvatar,
            user_avatar_frame: authorFrame,
            user_is_beta_tester: authorBeta,
            user_is_premium: authorPremium,
            has_liked: user && row.post_likes ? row.post_likes.some((like: any) => like.user_id === user.id) : false,
          };
        });
        setPosts(formattedPosts);
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

  const handleCreatePost = async () => {
    if (!newPostContent.trim() || !user || !supabase) return;
    setIsPosting(true);
    try {
      const { data, error } = await supabase
        .from('posts')
        .insert({
          user_id: user.id,
          content: newPostContent.trim(),
        })
        .select(`
          id, user_id, content, likes_count, comments_count, created_at,
          profiles:user_id (id, full_name, username, avatar_url, avatar_frame, is_premium, is_beta_tester, total_songs_requested, xp, level)
        `)
        .single();

      if (error) throw error;
      if (data) {
        const prof = Array.isArray((data as any).profiles) ? (data as any).profiles[0] : (data as any).profiles;
        const newFormattedPost: SocialPostType = {
          id: data.id,
          user_id: data.user_id,
          content: data.content,
          likes_count: data.likes_count || 0,
          comments_count: data.comments_count || 0,
          created_at: data.created_at,
          user_full_name: prof?.full_name || user.name || 'Muzikors Dinleyicisi',
          user_username: prof?.username || user.username || '@dinleyici',
          user_avatar_url: prof?.avatar_url || user.avatar,
          user_avatar_frame: prof?.avatar_frame || user.avatar_frame || 'none',
          user_is_beta_tester: prof?.is_beta_tester ?? user.is_beta_tester ?? false,
          user_is_premium: prof?.is_premium ?? user.isPremium ?? false,
          has_liked: false,
        };
        setPosts(prev => [newFormattedPost, ...prev]);
        setNewPostContent('');
        showToast('Gönderi paylaşıldı!');
      }
    } catch (err) {
      console.error('[Create Post Error]', err);
      showToast('Gönderi paylaşılamadı.');
    } finally {
      setIsPosting(false);
    }
  };

  const [isFollowingState, setIsFollowingState] = useState(false);

  useEffect(() => {
    setIsFollowingState(Boolean(stats.is_following));
  }, [stats.is_following]);

  const handleFollowToggle = async () => {
    if (!user) {
      showToast('Takip etmek için giriş yapmalısınız.');
      return;
    }
    const targetId = viewingProfileId;
    if (!targetId || targetId === user.id || !supabase) return;

    setIsFollowLoading(true);
    const nextState = !isFollowingState;
    setIsFollowingState(nextState);
    setStats(prev => ({
      ...prev,
      followers_count: prev.followers_count + (nextState ? 1 : -1),
    }));

    try {
      if (!nextState) {
        await supabase
          .from('follows')
          .delete()
          .eq('follower_id', user.id)
          .eq('following_id', targetId);
        showToast('Takipten çıkıldı.');
      } else {
        await supabase
          .from('follows')
          .insert({ follower_id: user.id, following_id: targetId });
        showToast('Takip edildi!');
      }
    } catch (err) {
      console.error('[Follow Error]', err);
      setIsFollowingState(!nextState);
      setStats(prev => ({
        ...prev,
        followers_count: prev.followers_count + (!nextState ? 1 : -1),
      }));
      showToast('İşlem başarısız.');
    } finally {
      setIsFollowLoading(false);
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

  return (
    <AnimatePresence>
      {activeModal === 'profile' && (
        <>
          <AnimatePresence>
            {cropImageSrc && (
              <CropModal
                imageSrc={cropImageSrc}
                onConfirm={handleCropConfirm}
                onCancel={() => setCropImageSrc(null)}
              />
            )}
          </AnimatePresence>

          <div className="fixed inset-0 z-[100] flex flex-col justify-end items-center pointer-events-none">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={closeModal}
              className="absolute inset-0 bg-black/80 backdrop-blur-md pointer-events-auto"
            />

            <motion.div
              key="profile-sheet"
              initial={{ y: '100%', opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: '100%', opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 280 }}
              className="relative w-full max-w-md bg-[var(--theme-card)] rounded-t-[2.5rem] overflow-y-auto max-h-[92vh] border-t border-white/[0.1] shadow-[0_-20px_50px_rgba(0,0,0,0.9)] pointer-events-auto custom-scrollbar"
            >
              {/* Handle */}
              <div className="flex justify-center pt-3 pb-1">
                <div className="w-12 h-1 bg-white/20 rounded-full" />
              </div>

          <button
            onClick={closeModal}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/[0.05] hover:bg-white/[0.1] text-neutral-400 hover:text-white transition-all z-10"
          >
            <X className="w-4 h-4" />
          </button>

          <div className="px-5 pt-2 pb-10">
            {isLoadingProfile && !isOwnProfile && !profileData ? (
               <div className="flex flex-col items-center justify-center py-20">
                 <Loader2 className="w-8 h-8 animate-spin text-[var(--theme-primary)]" />
               </div>
            ) : (
              <>
                {/* ─── Avatar & Basic Info ─── */}
                <div className="flex flex-col items-center">
                  <div className="relative mb-3 mt-2">
                    <AvatarFrame frameId={isEditing ? selectedFrame : (currentProfile?.avatar_frame || 'none')} size="2xl">
                      <div className="w-full h-full bg-[var(--theme-card-alt)] border border-white/10 flex items-center justify-center rounded-full overflow-hidden shadow-inner">
                        {(() => {
                          const av = isEditing ? editAvatar : currentProfile?.avatar || currentProfile?.avatar_url;
                          const isGoogle = av?.includes('googleusercontent.com') || av?.includes('google.com');
                          return av && !isGoogle ? (
                            <img src={av} alt={currentProfile?.name || currentProfile?.full_name} className={`w-full h-full ${av.startsWith('/logo') ? 'object-contain p-3 bg-black/60' : 'object-cover'}`} />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <User className="w-10 h-10 text-[var(--theme-primary)]/40" />
                            </div>
                          );
                        })()}
                      </div>
                    </AvatarFrame>
                    {uploadingAvatar && (
                      <div className="absolute inset-0 rounded-full bg-black/70 flex items-center justify-center z-20">
                        <Loader2 className="w-6 h-6 text-[var(--theme-primary)] animate-spin" />
                      </div>
                    )}
                  </div>

                  <div className="text-center w-full">
                    {isEditing ? (
                      <div className="space-y-4">
                        <div>
                          <p className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mb-3">Fotoğraf Seç</p>
                          <div className="flex gap-3 overflow-x-auto pb-2 px-1 scrollbar-hide justify-start">
                            <div className="flex flex-col items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingAvatar}
                                className="w-14 h-14 rounded-full border-2 border-dashed border-amber-400/50 flex items-center justify-center bg-white/5 active:bg-white/10 transition-colors text-amber-400"
                              >
                                {uploadingAvatar ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                              </button>
                            </div>
                            <input
                              type="file"
                              ref={fileInputRef}
                              onChange={handleFileSelect}
                              accept="image/*"
                              className="hidden"
                            />
                            {[
                              ...(user?.avatar && !['/logo_gold.png', '/logo_cyan.png', '/logo_purple.png', '/logo_green.png', '/logo_blue.png', '/logo_red.png', '/logo.png'].includes(user.avatar) ? [{ id: 'custom', url: user.avatar }] : []),
                              { id: 'gold', url: '/logo_gold.png' },
                              { id: 'cyan', url: '/logo_cyan.png' },
                              { id: 'purple', url: '/logo_purple.png' },
                              { id: 'green', url: '/logo_green.png' },
                              { id: 'blue', url: '/logo_blue.png' },
                              { id: 'red', url: '/logo_red.png' },
                              { id: 'classic', url: '/logo.png' },
                            ].map((av) => (
                              <button
                                key={av.id}
                                type="button"
                                onClick={() => setEditAvatar(av.url)}
                                className={`w-14 h-14 rounded-full border-2 overflow-hidden shrink-0 relative transition-transform active:scale-95 cursor-pointer ${
                                  editAvatar === av.url ? 'border-amber-400 scale-105 shadow-md shadow-amber-500/20' : 'border-white/10 opacity-70 hover:opacity-100'
                                }`}
                              >
                                <img src={av.url} alt="avatar" className={`w-full h-full ${av.url.startsWith('/logo') ? 'object-contain p-2 bg-black/60' : 'object-cover'}`} />
                                {editAvatar === av.url && (
                                  <div className="absolute inset-0 bg-amber-400/20 flex items-center justify-center">
                                    <Check className="w-5 h-5 text-amber-400 stroke-[3]" />
                                  </div>
                                )}
                              </button>
                            ))}
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mb-1 block">Görünen Ad</label>
                          <input
                            type="text"
                            value={editName}
                            onChange={(e) => setEditName(e.target.value)}
                            className="w-full bg-[var(--theme-card-alt)] border border-white/10 rounded-xl py-2 px-3 text-white font-bold focus:outline-none focus:border-[var(--theme-primary)]/50 transition-colors"
                            placeholder="Ad Soyad"
                          />
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest block">Avatar Çerçevesi</label>
                            <span className="text-[9px] text-[var(--theme-primary-light)] font-bold">
                              Seviye: {levelInfo.level} ({levelInfo.title})
                            </span>
                          </div>
                          <div className="grid grid-cols-2 gap-2 max-h-48 overflow-y-auto pr-1 custom-scrollbar text-left">
                            {AVATAR_FRAMES.map((frame) => {
                              const isUnlocked = isFrameUnlocked(frame.id, levelInfo.level, isProfileBetaTester);
                              const isSelected = selectedFrame === frame.id;
                              return (
                                <div
                                  key={frame.id}
                                  onClick={() => {
                                    if (isUnlocked) {
                                      setSelectedFrame(frame.id);
                                    } else {
                                      showToast(frame.description || 'Bu çerçeve henüz kilitli.');
                                    }
                                  }}
                                  className={`p-2.5 rounded-2xl border transition-all flex items-center gap-2.5 cursor-pointer relative overflow-hidden ${
                                    isSelected
                                      ? 'bg-amber-400/15 border-amber-400 shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                                      : isUnlocked
                                      ? 'bg-white/[0.03] border-white/10 hover:border-white/20'
                                      : 'bg-white/[0.02] border-white/5 opacity-40'
                                  }`}
                                >
                                  <div className="shrink-0">
                                    <AvatarFrame frameId={frame.id} size="xs" showOrnament={false}>
                                      <div className={`w-full h-full bg-gradient-to-tr ${frame.previewGradient} flex items-center justify-center text-[10px]`}>
                                        {frame.ornamentEmoji || '👤'}
                                      </div>
                                    </AvatarFrame>
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-1">
                                      <span className={`text-[11px] font-bold truncate ${isSelected ? 'text-amber-300' : 'text-white'}`}>
                                        {frame.name}
                                      </span>
                                    </div>
                                    <span className="text-[9px] text-neutral-400 block truncate">
                                      {isUnlocked ? (isSelected ? 'Kuşanıldı' : 'Açık') : 'Kilitli'}
                                    </span>
                                  </div>
                                  {!isUnlocked && (
                                    <Lock className="w-3.5 h-3.5 text-neutral-500 shrink-0" />
                                  )}
                                  {isSelected && (
                                    <div className="w-4 h-4 rounded-full bg-amber-400 text-black flex items-center justify-center shrink-0">
                                      <Check className="w-2.5 h-2.5 stroke-[3]" />
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] text-neutral-400 font-bold uppercase tracking-widest mb-1 block">Kullanıcı ID</label>
                          <div className="relative">
                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-amber-400 font-bold">@</span>
                            <input
                              type="text"
                              value={editUsername}
                              onChange={(e) => setEditUsername(e.target.value)}
                              className="w-full bg-[var(--theme-card-alt)] border border-white/10 rounded-xl py-2 pl-7 pr-3 text-white font-bold focus:outline-none focus:border-[var(--theme-primary)]/50 transition-colors"
                              placeholder="kullanici_adi"
                            />
                          </div>
                          <p className="text-[9px] text-neutral-500 mt-1">Haftada sadece 1 kez değiştirebilirsiniz.</p>
                        </div>

                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => setIsEditing(false)}
                            className="flex-1 py-2.5 rounded-xl bg-white/10 text-white font-bold text-xs active:scale-95 transition-all"
                          >
                            İptal
                          </button>
                          <button
                            onClick={handleSaveProfile}
                            disabled={isSaving}
                            className="flex-1 py-2.5 rounded-xl bg-[var(--theme-primary)] text-black font-black text-xs flex items-center justify-center gap-1.5 active:scale-95 transition-all shadow-md"
                          >
                            {isSaving ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Kaydet'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-center gap-1.5">
                          <h2 className="text-base font-black text-white tracking-tight">
                            {currentProfile?.name || currentProfile?.full_name || 'Misafir Kullanıcı'}
                          </h2>
                          {currentProfile?.isPremium || currentProfile?.is_premium ? <PremiumBadge /> : null}
                          {isProfileBetaTester ? <BetaTesterBadge /> : null}
                        </div>

                        <div className="flex items-center justify-center gap-2 mt-1">
                          <span className="text-[11px] font-black tracking-wider text-amber-400">
                            {currentProfile?.username || '@misafir'}
                          </span>
                        </div>

                        <div className="mt-4 flex items-center gap-2 w-full justify-center">
                          {isOwnProfile ? (
                            <button
                              onClick={handleEditClick}
                              className="w-full py-2.5 rounded-2xl bg-white/[0.05] hover:bg-white/[0.08] border border-white/10 text-white font-bold text-xs active:scale-95 transition-all shadow-sm"
                            >
                              Profili Düzenle
                            </button>
                          ) : (
                            <button
                              onClick={handleFollowToggle}
                              disabled={isFollowLoading}
                              className={`w-full py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-md
                                ${isFollowingState 
                                  ? 'bg-white/5 border border-white/10 text-white' 
                                  : 'bg-amber-400 text-black font-black'}`}
                            >
                              {isFollowLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                isFollowingState ? <><Check className="w-4 h-4" /> Takip Ediliyor</> : 'Takip Et'
                              )}
                            </button>
                          )}
                        </div>
                      </>
                    )}
                  </div>
                </div>

                {/* ─── Level & XP Progress Card (Anti-Slop Minimalist) ─── */}
                <div className="w-full bg-[var(--theme-card-alt)] rounded-2xl border border-white/[0.08] p-3.5 mt-4 mb-2 shadow-sm space-y-2.5">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-lg text-[10px] font-black border ${levelInfo.tier.badgeBg} ${levelInfo.tier.badgeText} ${levelInfo.tier.badgeBorder}`}>
                        Lv. {levelInfo.level}
                      </span>
                      <span className="text-xs font-black text-white flex items-center gap-1">
                        <span>{levelInfo.icon}</span>
                        <span>{levelInfo.title}</span>
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold text-amber-400">
                      {levelInfo.currentLevelXp} / {levelInfo.xpForNextLevel} XP
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div className="w-full h-2 rounded-full bg-white/[0.06] overflow-hidden p-0.5 border border-white/5">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${levelInfo.progressPercentage}%` }}
                      transition={{ duration: 0.6, ease: 'easeOut' }}
                      className="h-full rounded-full bg-gradient-to-r from-amber-500 to-yellow-300 shadow-[0_0_8px_rgba(245,158,11,0.5)]"
                    />
                  </div>

                  <div className="flex items-center justify-between text-[9px] text-neutral-400 font-semibold px-0.5">
                    <span>%{levelInfo.progressPercentage} tamamlandı</span>
                    <span>Sonraki seviyeye {levelInfo.remainingXpForNext} XP</span>
                  </div>
                </div>

                {/* ─── Profile Stats ─── */}
                <div className="flex justify-around items-center bg-[var(--theme-card-alt)] rounded-2xl border border-white/[0.08] py-3 my-3 shadow-inner">
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-sm font-black text-white">
                      {currentProfile?.totalSongsRequested ?? currentProfile?.total_songs_requested ?? 0}
                    </span>
                    <span className="text-[9px] text-neutral-400 uppercase tracking-widest font-bold">Toplam İstek</span>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-sm font-black text-white">{stats.followers_count}</span>
                    <span className="text-[9px] text-neutral-400 uppercase tracking-widest font-bold">Takipçi</span>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-sm font-black text-white">{stats.following_count}</span>
                    <span className="text-[9px] text-neutral-400 uppercase tracking-widest font-bold">Takip Edilen</span>
                  </div>
                </div>

                {/* ─── Social Feed ─── */}
                <div className="mt-2 relative">
                  <h3 className="text-sm font-black text-white mb-4 border-b border-white/[0.08] pb-2">Gönderiler</h3>
                  
                  {isOwnProfile && (
                    <div className="bg-[var(--theme-card-alt)] rounded-2xl p-4 border border-white/[0.08] mb-4 shadow-inner">
                      <textarea
                        placeholder="Yeni gönderi paylaş..."
                        value={newPostContent}
                        onChange={e => setNewPostContent(e.target.value)}
                        maxLength={280}
                        className="w-full bg-transparent text-sm text-white placeholder-neutral-500 resize-none focus:outline-none min-h-[50px]"
                      />
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                        <span className={`text-[10px] font-bold ${newPostContent.length >= 280 ? 'text-red-400' : 'text-neutral-500'}`}>
                          {newPostContent.length}/280
                        </span>
                        <button
                          onClick={handleCreatePost}
                          disabled={isPosting || !newPostContent.trim()}
                          className="bg-[var(--theme-primary)] text-black px-4 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
                        >
                          {isPosting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Paylaş'}
                        </button>
                      </div>
                    </div>
                  )}

                  {posts.length === 0 ? (
                    <div className="text-center py-10 opacity-70">
                      <p className="text-sm text-neutral-500 font-medium">Henüz gönderi yok.</p>
                    </div>
                  ) : (
                    posts.map(post => (
                      <SocialPost key={post.id} post={post} onPostUpdated={fetchProfileData} />
                    ))
                  )}
                </div>

                {/* Settings / Auth Actions for Own Profile */}
                {isOwnProfile && (
                  <div className="mt-6 border-t border-white/[0.08] pt-5 space-y-3">
                    {/* Theme Switcher in Profile */}
                    <div className="p-3.5 rounded-2xl bg-[var(--theme-card-alt)] border border-white/[0.08]">
                      <div className="flex items-center justify-between mb-3 px-1">
                        <div className="flex items-center gap-2">
                          <Palette className="w-4 h-4 text-[var(--theme-primary)]" />
                          <span className="text-xs font-bold text-white">Renk Teması</span>
                        </div>
                        <span className="text-[10px] font-bold text-[var(--theme-primary-light)]">
                          {THEMES.find((t) => t.id === theme)?.name}
                        </span>
                      </div>

                      <div className="grid grid-cols-5 gap-1.5">
                        {THEMES.map((t) => {
                          const isSelected = theme === t.id;
                          return (
                            <button
                              key={t.id}
                              onClick={() => setTheme(t.id)}
                              title={`${t.name} - ${t.subtitle}`}
                              className={`flex flex-col items-center gap-1.5 p-1.5 rounded-xl transition-all cursor-pointer ${
                                isSelected
                                  ? 'bg-white/10 border border-[var(--theme-primary)] shadow-sm'
                                  : 'hover:bg-white/[0.04] border border-transparent opacity-60 hover:opacity-100 active:scale-95'
                              }`}
                            >
                              <div
                                className="w-7 h-7 rounded-full flex items-center justify-center border border-white/20 shadow-sm"
                                style={{ backgroundColor: t.previewColor || t.accentColor }}
                              >
                                {isSelected && (
                                  <Check className={`w-3.5 h-3.5 stroke-[3] ${t.id === 'crema' ? 'text-black' : 'text-white'}`} />
                                )}
                              </div>
                              <span className="text-[8px] font-bold text-neutral-300 truncate w-full text-center leading-none mt-0.5">
                                {t.name}
                              </span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {!user ? (
                      <button
                        onClick={() => { closeModal(); loginWithProvider('google'); }}
                        className="w-full py-3 px-4 rounded-2xl bg-white text-black font-black text-xs flex items-center justify-center gap-2 active:scale-95 transition-transform shadow-lg"
                      >
                        <svg className="w-4 h-4" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                        Google ile Giriş Yap
                      </button>
                    ) : (
                      <div className="space-y-2 pt-1">
                        <button
                          onClick={() => { closeModal(); setTimeout(() => logout(), 150); }}
                          className="w-full py-2.5 px-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 text-white font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
                        >
                          <LogOut className="w-3.5 h-3.5 text-neutral-400" />
                          Çıkış Yap
                        </button>
                        <button
                          onClick={() => setShowConfirmDelete(true)}
                          className="w-full py-2.5 px-4 rounded-2xl bg-red-500/10 hover:bg-red-500/15 border border-red-500/20 text-red-400 font-bold text-xs flex items-center justify-center gap-2 active:scale-95 transition-all"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Hesabı Sil
                        </button>

                        {showConfirmDelete && (
                          <div className="p-4 rounded-2xl bg-red-950/20 border border-red-500/30 space-y-3 mt-2">
                            <p className="text-xs text-red-300 font-bold text-center">Hesabınız kalıcı olarak silinecek. Emin misiniz?</p>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setShowConfirmDelete(false)}
                                className="flex-1 py-2 rounded-xl bg-white/10 text-white font-bold text-xs active:scale-95"
                              >
                                İptal
                              </button>
                              <button
                                onClick={() => { deleteAccount(); setShowConfirmDelete(false); }}
                                className="flex-1 py-2 rounded-xl bg-red-600 text-white font-black text-xs active:scale-95"
                              >
                                Sil
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>
      </>)}
    </AnimatePresence>
  );
};
