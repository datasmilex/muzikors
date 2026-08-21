import React, { useState, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Send, Loader2, RefreshCw } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';
import { SocialPost as SocialPostType } from '../types';
import { SocialPost } from './SocialPost';
import { NativeAdCard } from './NativeAdCard';
import { containsProfanity } from '../utils/profanity';

export const GlobalFeedView: React.FC = () => {
  const { activeModal, closeModal, user, showToast, openProtectedModal, openProfile } = useApp();
  const [posts, setPosts] = useState<SocialPostType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const [newPostContent, setNewPostContent] = useState('');
  const [isPosting, setIsPosting] = useState(false);

  const fetchPosts = useCallback(async (showRefreshIndicator = false) => {
    if (showRefreshIndicator) setIsRefreshing(true);
    else setIsLoading(true);

    try {
      const { data, error } = await supabase
        .from('posts')
        .select(`
          id, content, created_at, likes_count, comments_count, user_id,
          profiles:user_id ( full_name, username, avatar_url, avatar_frame, is_premium, is_beta_tester ),
          post_likes ( user_id )
        `)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) throw error;

      const formattedPosts: SocialPostType[] = (data || []).map((row: any) => ({
        id: row.id,
        user_id: row.user_id,
        content: row.content,
        likes_count: row.likes_count,
        comments_count: row.comments_count,
        created_at: row.created_at,
        user_full_name: row.profiles?.full_name,
        user_username: row.profiles?.username,
        user_avatar_url: row.profiles?.avatar_url,
        user_avatar_frame: row.profiles?.avatar_frame || 'none',
        user_is_beta_tester: row.profiles?.is_beta_tester,
        user_is_premium: row.profiles?.is_premium,
        has_liked: user ? row.post_likes.some((like: any) => like.user_id === user.id) : false,
      }));

      setPosts(formattedPosts);
    } catch (err: any) {
      console.error(err);
      showToast('Gönderiler yüklenemedi.');
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [user, showToast]);

  useEffect(() => {
    if (activeModal === 'globalFeed') {
      fetchPosts();
    }
  }, [activeModal, fetchPosts]);

  const handleCreatePost = async () => {
    if (!user) {
      openProtectedModal('none', 'Gönderi paylaşmak için giriş yapmalısınız.');
      return;
    }
    const content = newPostContent.trim();
    if (!content) return;
    if (content.length > 280) {
      showToast('Gönderi 280 karakterden uzun olamaz.');
      return;
    }
    if (containsProfanity(content)) {
      showToast('Gönderinizde uygunsuz kelimeler bulunuyor.');
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
      fetchPosts(true);
    } catch (err: any) {
      console.error(err);
      showToast('Paylaşırken hata oluştu.');
    } finally {
      setIsPosting(false);
    }
  };

  const handleUserClick = (userId: string) => {
    closeModal();
    setTimeout(() => {
      openProfile(userId);
    }, 300);
  };

  return (
    <AnimatePresence>
      {activeModal === 'globalFeed' && (
        <div className="fixed inset-0 z-[100] flex flex-col justify-end items-center pointer-events-none">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            onClick={closeModal}
            className="absolute inset-0 bg-black/70 backdrop-blur-sm pointer-events-auto"
          />

          <motion.div
            initial={{ y: '100%', opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0 }}
            transition={{ type: 'tween', duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative w-full h-[92vh] max-w-md bg-[#120C08] rounded-t-[2.5rem] flex flex-col border-t border-[#D4AF37]/30 shadow-[0_-20px_50px_rgba(212,175,55,0.15)] pointer-events-auto"
          >
            {/* Handle */}
            <div className="flex justify-center pt-3 pb-2 shrink-0">
              <div className="w-12 h-1.5 bg-white/15 rounded-full" />
            </div>

            {/* Header */}
            <div className="flex items-center justify-between px-5 pb-4 pt-1 shrink-0">
              <h2 className="text-xl font-black tracking-tight leading-none text-white flex items-center gap-2">
                Akış
              </h2>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => fetchPosts(true)}
                  disabled={isRefreshing || isLoading}
                  className="p-2 rounded-full bg-white/5 border border-white/10 active:bg-white/15 text-[#D4AF37] transition-all disabled:opacity-50"
                >
                  <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                </button>
                <button
                  onClick={closeModal}
                  className="p-2 rounded-full bg-white/5 border border-white/10 active:bg-white/15 text-zinc-400 active:text-white transition-all"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Content Area */}
            <div className="flex-1 overflow-y-auto px-4 pb-20 custom-scrollbar">
              {/* Post Composer */}
              <div className="bg-[#1C130D] rounded-2xl p-4 border border-white/10 mb-6 shadow-inner relative">
                <div className="flex gap-3">
                  <div className="w-10 h-10 rounded-full bg-zinc-800 shrink-0 border border-[#D4AF37]/30 overflow-hidden">
                    {user?.avatar ? (
                      <img src={user.avatar} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full bg-[#1C130D]" />
                    )}
                  </div>
                  <div className="flex-1">
                    <textarea
                      placeholder="Neler düşünüyorsun?"
                      value={newPostContent}
                      onChange={e => setNewPostContent(e.target.value)}
                      maxLength={280}
                      className="w-full bg-transparent text-sm text-white placeholder-zinc-500 resize-none focus:outline-none min-h-[60px]"
                    />
                    <div className="flex items-center justify-between mt-2 pt-2 border-t border-white/5">
                      <span className={`text-[10px] font-bold ${newPostContent.length >= 280 ? 'text-red-400' : 'text-zinc-500'}`}>
                        {newPostContent.length}/280
                      </span>
                      <button
                        onClick={handleCreatePost}
                        disabled={isPosting || !newPostContent.trim()}
                        className="bg-[#D4AF37] text-black px-4 py-1.5 rounded-full text-xs font-black flex items-center gap-1.5 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 transition-all shadow-[0_0_10px_rgba(212,175,55,0.3)]"
                      >
                        {isPosting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        Paylaş
                      </button>
                    </div>
                  </div>
                </div>
                {/* Block if not logged in */}
                {!user && (
                  <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px] rounded-2xl flex items-center justify-center z-10">
                    <button 
                      onClick={() => openProtectedModal('globalFeed', 'Gönderi paylaşmak için giriş yapın')}
                      className="bg-white text-black px-4 py-2 rounded-full text-xs font-black shadow-lg active:scale-95 transition-transform"
                    >
                      Giriş Yap
                    </button>
                  </div>
                )}
              </div>

              {/* Posts Feed */}
              {isLoading && !isRefreshing ? (
                <div className="flex flex-col items-center justify-center py-10 opacity-60">
                  <Loader2 className="w-8 h-8 animate-spin text-[#D4AF37] mb-2" />
                  <p className="text-xs font-medium text-amber-200/50 uppercase tracking-widest">Akış Yükleniyor...</p>
                </div>
              ) : (
                <div className="flex flex-col">
                  {posts.length === 0 ? (
                    <div className="text-center py-10">
                      <p className="text-sm text-zinc-500 font-medium">Henüz gönderi yok.</p>
                      <p className="text-xs text-zinc-600 mt-1">İlk paylaşan sen ol!</p>
                    </div>
                  ) : (
                    posts.map((post, idx) => (
                      <React.Fragment key={post.id}>
                        <SocialPost 
                          post={post} 
                          onClickUser={handleUserClick} 
                        />
                        {(idx + 1) % 4 === 0 && (
                          <NativeAdCard variantIndex={Math.floor(idx / 4)} />
                        )}
                      </React.Fragment>
                    ))
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
