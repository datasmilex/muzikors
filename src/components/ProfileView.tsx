'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Zap, Music, Trash2, LogOut, Sparkles, Award, ShieldCheck, ChevronRight, Upload, Loader2, Check, CropIcon, Trophy, Heart, Users, CheckCircle, MessageCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { PremiumBadge } from './PremiumBadge';
import Cropper from 'react-easy-crop';
import { AchievementsModal } from './AchievementsModal';
import { ACHIEVEMENTS, TIER_STYLES, isAchievementUnlocked, isAchievementClaimed } from '../data/achievements';
import { supabase } from '../lib/supabaseClient';
import { SocialPost as SocialPostType, ProfileStats } from '../types';
import { SocialPost } from './SocialPost';

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
    } catch {
      setLoading(false);
    }
  };

  return (
    <motion.div
      className="fixed inset-0 z-[200] flex flex-col items-center justify-end"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
    >
      <div className="absolute inset-0 bg-black/95" onClick={onCancel} />
      <motion.div
        className="relative w-full max-w-md bg-[#120C08] rounded-t-[2rem] flex flex-col overflow-hidden border-t border-[#D4AF37]/30 shadow-[0_-20px_60px_rgba(0,0,0,0.8)]"
        initial={{ y: '100%' }}
        animate={{ y: 0 }}
        exit={{ y: '100%' }}
        transition={{ type: 'tween', duration: 0.22, ease: [0.25, 0.46, 0.45, 0.94] }}
      >
        <div className="flex justify-center pt-3 pb-1">
          <div className="w-10 h-1 rounded-full bg-white/20" />
        </div>
        <div className="flex items-center justify-between px-5 py-3 border-b border-[#D4AF37]/15">
          <div className="flex items-center gap-2">
            <CropIcon className="w-4 h-4 text-[#D4AF37]" />
            <span className="text-sm font-black text-white tracking-tight">Fotoğrafı Kırp</span>
          </div>
          <button onClick={onCancel} className="p-1.5 rounded-full bg-white/5 active:bg-white/15 text-zinc-400">
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="relative w-full" style={{ height: '320px' }}>
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
            style={{
              containerStyle: { background: '#0A0A0A' },
              cropAreaStyle: {
                border: '3px solid #D4AF37',
                boxShadow: '0 0 0 9999px rgba(10, 10, 10, 0.75)',
              },
            }}
          />
        </div>
        <div className="px-6 pt-3 pb-2 flex items-center gap-3">
          <span className="text-[10px] text-amber-200/40 font-bold w-4">—</span>
          <input
            type="range"
            min={1} max={3} step={0.01}
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            className="flex-1 h-1 accent-[#D4AF37] cursor-pointer"
          />
          <span className="text-[10px] text-amber-200/40 font-bold w-4">+</span>
        </div>
        <div className="flex gap-3 px-5 pb-6 pt-2">
          <button
            onClick={onCancel}
            className="flex-1 py-3 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-sm active:scale-95 transition-transform"
          >
            İptal
          </button>
          <button
            onClick={handleConfirm}
            disabled={loading}
            className="flex-1 py-3 rounded-2xl bg-gradient-to-r from-[#D4AF37] to-[#E5A93B] text-black font-black text-sm active:scale-95 transition-transform disabled:opacity-60 flex items-center justify-center gap-2 shadow-[0_4px_20px_rgba(212,175,55,0.4)]"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Check className="w-4 h-4" /> Uygula</>}
          </button>
        </div>
      </motion.div>
    </motion.div>
  );
};

// ─── Main ProfileView ──────────────────────────────────────────────────────────
export const ProfileView: React.FC = () => {
  const { activeModal, closeModal, user, deleteAccount, logout, loginWithProvider, showToast, viewingProfileId, openProtectedModal } = useApp();
  
  const [showConfirmDelete, setShowConfirmDelete] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editUsername, setEditUsername] = useState('');
  const [editAvatar, setEditAvatar] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [showAchievements, setShowAchievements] = useState(false);
  const [showTechnicalStats, setShowTechnicalStats] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Social State
  const [profileData, setProfileData] = useState<any>(null);
  const [stats, setStats] = useState<ProfileStats>({ posts_count: 0, followers_count: 0, following_count: 0, is_following: false });
  const [posts, setPosts] = useState<SocialPostType[]>([]);
  const [isLoadingProfile, setIsLoadingProfile] = useState(false);
  const [isFollowingState, setIsFollowingState] = useState(false);
  const [isFollowLoading, setIsFollowLoading] = useState(false);
  const [newPostContent, setNewPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  // Crop state
  const [cropImageSrc, setCropImageSrc] = useState<string | null>(null);

  const presetAvatars = [
    '/logo_gold.png',
    '/logo_red.png',
    '/logo_green.png',
    '/logo_cyan.png',
    '/logo_blue.png',
    '/logo_purple.png',
  ];

  const isOwnProfile = !viewingProfileId || viewingProfileId === user?.id;
  const currentProfile = isOwnProfile ? user : profileData;

  const fetchProfileData = useCallback(async () => {
    if (!viewingProfileId) return;
    if (activeModal !== 'profile') return;
    
    setIsLoadingProfile(true);
    try {
      // 1. Fetch user info if not own
      if (!isOwnProfile) {
        const { data, error } = await supabase.from('profiles').select('*').eq('id', viewingProfileId).single();
        if (error) throw error;
        setProfileData(data);
      }

      // 2. Fetch Stats via RPC
      const { data: statsData, error: statsError } = await supabase.rpc('get_profile_stats', { p_user_id: viewingProfileId });
      if (!statsError && statsData) {
        setStats(statsData as any);
      }

      // 3. Fetch Follow state if logged in and looking at someone else
      if (!isOwnProfile && user) {
        const { data: followData } = await supabase.from('follows').select('*').eq('follower_id', user.id).eq('following_id', viewingProfileId).single();
        setIsFollowingState(!!followData);
      }

      // 4. Fetch Posts
      const { data: postsData, error: postsError } = await supabase
        .from('posts')
        .select(`
          id, content, created_at, likes_count, comments_count, user_id,
          profiles:user_id ( full_name, username, avatar_url, is_premium, is_beta_tester ),
          post_likes ( user_id )
        `)
        .eq('user_id', viewingProfileId)
        .order('created_at', { ascending: false });
        
      if (!postsError && postsData) {
        setPosts(postsData.map((row: any) => ({
          id: row.id,
          user_id: row.user_id,
          content: row.content,
          likes_count: row.likes_count,
          comments_count: row.comments_count,
          created_at: row.created_at,
          user_full_name: row.profiles?.full_name,
          user_username: row.profiles?.username,
          user_avatar_url: row.profiles?.avatar_url,
          user_is_beta_tester: row.profiles?.is_beta_tester,
          user_is_premium: row.profiles?.is_premium,
          has_liked: user ? row.post_likes.some((like: any) => like.user_id === user.id) : false,
        })));
      }
    } catch (err) {
      console.error(err);
      if (!isOwnProfile) showToast('Kullanıcı bulunamadı.');
    } finally {
      setIsLoadingProfile(false);
    }
  }, [viewingProfileId, isOwnProfile, user, activeModal, showToast]);

  useEffect(() => {
    fetchProfileData();
  }, [fetchProfileData]);

  const handleFollowToggle = async () => {
    if (!user) {
      openProtectedModal('none', 'Takip etmek için giriş yapmalısınız.');
      return;
    }
    if (isOwnProfile || !viewingProfileId) return;

    setIsFollowLoading(true);
    const prevFollowing = isFollowingState;
    const prevFollowers = stats.followers_count;
    
    // Optimistic UI update
    setIsFollowingState(!prevFollowing);
    setStats(prev => ({ ...prev, followers_count: prevFollowing ? prevFollowers - 1 : prevFollowers + 1 }));

    try {
      if (prevFollowing) {
        await supabase.from('follows').delete().eq('follower_id', user.id).eq('following_id', viewingProfileId);
      } else {
        await supabase.from('follows').insert({ follower_id: user.id, following_id: viewingProfileId });
      }
    } catch (err) {
      console.error(err);
      showToast('İşlem başarısız.');
      // Revert
      setIsFollowingState(prevFollowing);
      setStats(prev => ({ ...prev, followers_count: prevFollowers }));
    } finally {
      setIsFollowLoading(false);
    }
  };

  const handleCreatePost = async () => {
    if (!user) return;
    const content = newPostContent.trim();
    if (!content) return;
    if (content.length > 280) {
      showToast('Gönderi 280 karakterden uzun olamaz.');
      return;
    }

    setIsPosting(true);
    try {
      const { error } = await supabase.from('posts').insert({
        user_id: user.id,
        content
      });
      if (error) throw error;
      setNewPostContent('');
      showToast('Gönderi paylaşıldı!');
      fetchProfileData(); // Refresh posts and stats
    } catch (err: any) {
      console.error(err);
      showToast('Paylaşırken hata oluştu.');
    } finally {
      setIsPosting(false);
    }
  };

  const handleEditClick = () => {
    setEditUsername(user?.username?.replace('@', '') || '');
    const currentAvatar = user?.avatar || '';
    const isGoogleAvatar = currentAvatar.includes('googleusercontent.com') || currentAvatar.includes('google.com');
    setEditAvatar(isGoogleAvatar ? '' : currentAvatar);
    setIsEditing(true);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file || !user) return;
    if (!file.type.startsWith('image/')) {
      showToast('Lütfen sadece resim dosyası yükleyin.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      setCropImageSrc(reader.result as string);
    };
    reader.readAsDataURL(file);
    event.target.value = '';
  };

  const handleCropConfirm = async (blob: Blob) => {
    setCropImageSrc(null);
    if (!user) return;
    setUploadingAvatar(true);
    try {
      if (user.avatar && user.avatar.includes('/storage/v1/object/public/avatars/')) {
        const oldFileName = user.avatar.split('/').pop();
        if (oldFileName) await supabase.storage.from('avatars').remove([oldFileName]);
      }
      const fileName = `${user.id}-${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage.from('avatars').upload(fileName, blob, {
        contentType: 'image/jpeg',
        upsert: false,
      });
      if (uploadError) throw uploadError;

      const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(fileName);
      setEditAvatar(publicUrl);
      showToast('Fotoğraf yüklendi!');
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
      const { error } = await supabase.from('profiles').update(updates).eq('id', user.id);
      if (error) throw error;
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
          key="profile-backdrop"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={closeModal}
          className="absolute inset-0 bg-black/70 backdrop-blur-sm pointer-events-auto"
        />

        <motion.div
          key="profile-sheet"
          initial={{ y: '100%', opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: '100%', opacity: 0 }}
          transition={{ type: 'tween', duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
          className="relative w-full max-w-md bg-[#120C08] rounded-t-[2.5rem] overflow-y-auto max-h-[92vh] border-t border-[#D4AF37]/30 shadow-[0_-20px_50px_rgba(212,175,55,0.15)] pointer-events-auto custom-scrollbar"
        >
          {/* Handle */}
          <div className="flex justify-center pt-3">
            <div className="w-12 h-1.5 bg-white/15 rounded-full" />
          </div>

          <button
            onClick={closeModal}
            className="absolute top-4 right-4 p-2 rounded-full bg-white/5 border border-white/10 active:bg-white/15 text-zinc-400 active:text-white transition-all z-10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="px-5 pt-2 pb-10">
            {isLoadingProfile && !isOwnProfile && !profileData ? (
               <div className="flex flex-col items-center justify-center py-20">
                 <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37]" />
               </div>
            ) : (
              <>
                {/* ─── Avatar & Basic Info ─── */}
                <div className="flex flex-col items-center">
                  <div className="relative mb-3 mt-2">
                    <div className="w-24 h-24 rounded-full border-2 border-[#D4AF37]/50 overflow-hidden bg-[#1C130D] shadow-[0_0_20px_rgba(212,175,55,0.2)]">
                      {(() => {
                        const av = isEditing ? editAvatar : currentProfile?.avatar || currentProfile?.avatar_url;
                        const isGoogle = av?.includes('googleusercontent.com') || av?.includes('google.com');
                        return av && !isGoogle ? (
                          <img src={av} alt={currentProfile?.name || currentProfile?.full_name} className={`w-full h-full ${av.startsWith('/logo_') ? 'object-contain p-3 bg-black' : 'object-cover'}`} />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <User className="w-10 h-10 text-[#D4AF37]/40" />
                          </div>
                        );
                      })()}
                    </div>
                    {uploadingAvatar && (
                      <div className="absolute inset-0 rounded-full bg-black/70 flex items-center justify-center">
                        <Loader2 className="w-6 h-6 text-[#D4AF37] animate-spin" />
                      </div>
                    )}
                  </div>

                  <div className="text-center w-full">
                    {isEditing ? (
                      <div className="space-y-4">
                        <div>
                          <p className="text-[10px] text-amber-200/40 font-bold uppercase tracking-widest mb-3">Fotoğraf Seç</p>
                          <div className="flex gap-3 overflow-x-auto pb-2 px-1 scrollbar-hide justify-start">
                            <div className="flex flex-col items-center gap-1.5 shrink-0">
                              <button
                                onClick={() => fileInputRef.current?.click()}
                                disabled={uploadingAvatar}
                                className="w-14 h-14 rounded-full border-2 border-dashed border-[#D4AF37]/50 flex items-center justify-center bg-white/5 active:bg-white/10 transition-colors text-[#D4AF37]"
                              >
                                {uploadingAvatar ? <Loader2 className="w-5 h-5 animate-spin" /> : <Upload className="w-5 h-5" />}
                              </button>
                            </div>
                            <input
                              type="file"
                              ref={fileInputRef}
                              className="hidden"
                              accept="image/*"
                              onChange={handleFileSelect}
                            />
                            {presetAvatars.map((url, idx) => (
                              <div key={idx} className="shrink-0">
                                <button
                                  onClick={() => setEditAvatar(url)}
                                  className={`w-14 h-14 rounded-full border-2 overflow-hidden transition-all ${
                                    editAvatar === url
                                      ? 'border-[#D4AF37] scale-110 shadow-[0_0_14px_rgba(212,175,55,0.6)]'
                                      : 'border-white/10 opacity-55 active:opacity-100'
                                  }`}
                                >
                                  <img src={url} alt={`Avatar ${idx + 1}`} className="w-full h-full object-contain p-1.5 bg-black" />
                                </button>
                              </div>
                            ))}
                          </div>
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

                        <div className="flex gap-2 pt-1">
                          <button
                            onClick={() => setIsEditing(false)}
                            className="flex-1 py-2.5 rounded-xl bg-white/5 border border-white/10 text-gray-300 font-bold text-[10px] uppercase tracking-widest active:scale-95 transition-transform"
                          >
                            İptal
                          </button>
                          <button
                            onClick={handleSave}
                            disabled={isSaving}
                            className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#E5A93B] text-black font-black text-[10px] uppercase tracking-widest active:scale-95 transition-transform shadow-[0_0_15px_rgba(212,175,55,0.3)] disabled:opacity-50"
                          >
                            {isSaving ? 'Kaydediliyor...' : 'Kaydet'}
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className="flex items-center justify-center gap-2">
                          <h2 className={`text-xl font-black tracking-tight leading-none drop-shadow-md ${currentProfile?.is_premium || currentProfile?.isPremium ? 'text-amber-100' : 'text-white'}`}>
                            {currentProfile?.name || currentProfile?.full_name || 'Misafir Kullanıcı'}
                          </h2>
                          {(currentProfile?.is_premium || currentProfile?.isPremium) && (
                            <PremiumBadge className="w-4 h-4 ml-1" />
                          )}
                          {(currentProfile?.is_beta_tester || currentProfile?.isBetaTester) && (
                            <CheckCircle className="w-4 h-4 text-purple-400 drop-shadow-md" />
                          )}
                        </div>
                        <div className="inline-flex items-center gap-1.5 mt-2 px-2 py-0.5 rounded-full bg-white/5 border border-white/10">
                          <span className="text-[9px] text-gray-300 font-medium tracking-wider">ID:</span>
                          <span className={`text-[10px] font-black tracking-widest ${(currentProfile?.is_premium || currentProfile?.isPremium) ? 'text-amber-400' : 'text-[#D4AF37]'}`}>
                            {currentProfile?.username || '@misafir'}
                          </span>
                        </div>

                        <div className="mt-5 flex items-center gap-2 w-full justify-center">
                          {isOwnProfile ? (
                            <button
                              onClick={handleEditClick}
                              className="w-full py-2.5 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-xs active:bg-white/10 active:scale-95 transition-all shadow-sm"
                            >
                              Profili Düzenle
                            </button>
                          ) : (
                            <button
                              onClick={handleFollowToggle}
                              disabled={isFollowLoading}
                              className={`w-full py-2.5 rounded-2xl font-bold text-xs flex items-center justify-center gap-2 transition-all active:scale-95 shadow-lg
                                ${isFollowingState 
                                  ? 'bg-white/5 border border-white/10 text-white' 
                                  : 'bg-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.3)]'}`}
                            >
                              {isFollowLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : (
                                isFollowingState ? <><Check className="w-4 h-4" /> Takip Ediliyor</> : 'Takip Et'
                              )}
                            </button>
                          )}
                        </div>

                        {/* ─── Pinned Achievements Badges ─── */}
                        {(() => {
                          const pinnedIds: string[] = (currentProfile as any)?.pinned_achievements ?? [];
                          const pinned = ACHIEVEMENTS.filter(a => pinnedIds.includes(a.id));
                          if (pinned.length === 0) return null;

                          return (
                            <div 
                              onClick={() => setShowAchievements(true)}
                              className="flex items-center justify-center gap-1.5 mt-3 flex-wrap cursor-pointer group"
                              title="Tüm başarımları görüntüle"
                            >
                              {pinned.map(ach => (
                                <div 
                                  key={ach.id}
                                  className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-gradient-to-r from-amber-500/10 to-yellow-500/10 border border-[#D4AF37]/30 backdrop-blur-md shadow-sm group-hover:border-[#D4AF37]/60 group-active:scale-95 transition-all"
                                >
                                  <span className="text-xs">{ach.emoji}</span>
                                  <span className="text-[10px] font-bold text-amber-200">{ach.title}</span>
                                </div>
                              ))}
                            </div>
                          );
                        })()}
                      </>
                    )}
                  </div>
                </div>

                {/* ─── Profile Stats ─── */}
                <div className="flex justify-around items-center bg-[#1C130D] rounded-2xl border border-white/5 py-3 mt-6 mb-3 shadow-inner">
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-sm font-black text-white">
                      {currentProfile?.totalSongsRequested ?? currentProfile?.total_songs_requested ?? 0}
                    </span>
                    <span className="text-[9px] text-amber-200/50 uppercase tracking-widest font-bold">Toplam İstek</span>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-sm font-black text-white">{stats.followers_count}</span>
                    <span className="text-[9px] text-amber-200/50 uppercase tracking-widest font-bold">Takipçi</span>
                  </div>
                  <div className="w-px h-8 bg-white/10" />
                  <div className="flex flex-col items-center flex-1">
                    <span className="text-sm font-black text-white">{stats.following_count}</span>
                    <span className="text-[9px] text-amber-200/50 uppercase tracking-widest font-bold">Takip Edilen</span>
                  </div>
                </div>

                {/* ─── Achievements Action Button ─── */}
                {(() => {
                  const totalSongsCount = currentProfile?.totalSongsRequested ?? currentProfile?.total_songs_requested ?? 0;
                  const isProfileBetaTester = currentProfile?.is_beta_tester ?? currentProfile?.isBetaTester ?? false;
                  const isProfileBetaTesterRewardClaimed = currentProfile?.beta_tester_reward_claimed ?? false;
                  const userClaimedList: string[] = (currentProfile as any)?.claimed_achievements ?? [];
                  const completedCount = ACHIEVEMENTS.filter(
                    a => isAchievementUnlocked(a, totalSongsCount, isProfileBetaTester) || isAchievementClaimed(a, userClaimedList, isProfileBetaTesterRewardClaimed)
                  ).length;

                  return (
                    <button
                      onClick={() => setShowAchievements(true)}
                      className="w-full py-2.5 px-4 rounded-2xl border border-[#D4AF37]/30 bg-gradient-to-r from-[#2A1D13] via-[#1C130D] to-[#2A1D13] text-[#D4AF37] font-bold text-xs flex items-center justify-between shadow-sm active:scale-95 transition-all mb-4 group"
                    >
                      <span className="flex items-center gap-2">
                        <Trophy className="w-4 h-4 text-[#D4AF37] group-hover:scale-110 transition-transform" />
                        <span className="text-xs font-black text-amber-100">Başarımlar & Rozetler</span>
                      </span>
                      <span className="text-[10px] font-black px-2.5 py-0.5 rounded-full bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/30">
                        {completedCount} / {ACHIEVEMENTS.length} Kazanıldı
                      </span>
                    </button>
                  );
                })()}

                {/* ─── Social Feed ─── */}
                <div className="mt-2 relative">
                  <h3 className="text-sm font-black text-white mb-4 border-b border-white/5 pb-2">Gönderiler</h3>
                  
                  {isOwnProfile && (
                    <div className="bg-[#1C130D] rounded-2xl p-4 border border-white/10 mb-4 shadow-inner">
                      <textarea
                        placeholder="Yeni gönderi paylaş..."
                        value={newPostContent}
                        onChange={e => setNewPostContent(e.target.value)}
                        maxLength={280}
                        className="w-full bg-transparent text-sm text-white placeholder-zinc-500 resize-none focus:outline-none min-h-[50px]"
                      />
                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                        <span className={`text-[10px] font-bold ${newPostContent.length >= 280 ? 'text-red-400' : 'text-zinc-500'}`}>
                          {newPostContent.length}/280
                        </span>
                        <button
                          onClick={handleCreatePost}
                          disabled={isPosting || !newPostContent.trim()}
                          className="bg-[#D4AF37] text-black px-4 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all"
                        >
                          {isPosting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Paylaş'}
                        </button>
                      </div>
                    </div>
                  )}

                  {posts.length === 0 ? (
                    <div className="text-center py-10 opacity-70">
                      <p className="text-sm text-zinc-500 font-medium">Henüz gönderi yok.</p>
                    </div>
                  ) : (
                    posts.map(post => (
                      <SocialPost key={post.id} post={post} onPostUpdated={fetchProfileData} />
                    ))
                  )}
                </div>

                {/* Settings / Auth Actions for Own Profile */}
                {isOwnProfile && (
                  <div className="mt-8 border-t border-white/5 pt-6 space-y-2">
                    {!user ? (
                      <button
                        onClick={() => { closeModal(); loginWithProvider('google'); }}
                        className="w-full py-3 px-4 rounded-2xl bg-white text-stone-950 font-black text-sm flex items-center justify-center gap-3 active:scale-95 transition-transform shadow-lg"
                      >
                        <svg className="w-5 h-5" viewBox="0 0 24 24">
                          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                        </svg>
                        Google ile Giriş Yap
                      </button>
                    ) : (
                      <>
                        <button
                          onClick={() => { closeModal(); setTimeout(() => logout(), 150); }}
                          className="w-full py-3 px-4 rounded-2xl bg-white/5 border border-white/10 text-white font-bold text-sm flex items-center gap-3 active:bg-white/10 active:scale-95 transition-all"
                        >
                          <LogOut className="w-4 h-4 text-zinc-400" />
                          Çıkış Yap
                        </button>
                        <button
                          onClick={() => setShowConfirmDelete(true)}
                          className="w-full py-3 px-4 rounded-2xl bg-red-950/30 border border-red-900/30 text-red-400 font-bold text-sm flex items-center gap-3 active:bg-red-950/50 active:scale-95 transition-all"
                        >
                          <Trash2 className="w-4 h-4" />
                          Hesabı Sil
                        </button>

                        {showConfirmDelete && (
                          <div className="p-4 rounded-2xl bg-red-950/40 border border-red-700/40 space-y-3 mt-2">
                            <p className="text-sm text-red-300 font-bold text-center">Hesabınız kalıcı olarak silinecek. Emin misiniz?</p>
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
                      </>
                    )}
                  </div>
                )}
              </>
            )}
          </div>
        </motion.div>
      </div>

      <AchievementsModal 
        isOpen={showAchievements} 
        onClose={() => setShowAchievements(false)} 
        targetProfile={currentProfile}
        isOwnProfile={isOwnProfile}
      />
      </>)}
    </AnimatePresence>
  );
};
