import React, { useState } from 'react';
import { SocialPost as SocialPostType } from '../types';
import { Heart, MessageCircle, ShieldCheck, CheckCircle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useApp } from '../context/AppContext';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';

interface SocialPostProps {
  post: SocialPostType;
  onPostUpdated?: () => void;
  onClickUser?: (userId: string) => void;
}

export const SocialPost: React.FC<SocialPostProps> = ({ post, onPostUpdated, onClickUser }) => {
  const { user, openProtectedModal, showToast } = useApp();
  const [hasLiked, setHasLiked] = useState(post.has_liked || false);
  const [likesCount, setLikesCount] = useState(post.likes_count || 0);
  const [isLiking, setIsLiking] = useState(false);

  const handleLike = async () => {
    if (!user) {
      openProtectedModal('none', 'Beğenmek için giriş yapmalısınız.');
      return;
    }
    if (isLiking) return;

    setIsLiking(true);
    const prevLiked = hasLiked;
    const prevCount = likesCount;

    // Optimistic UI update
    setHasLiked(!prevLiked);
    setLikesCount(prevLiked ? prevCount - 1 : prevCount + 1);

    try {
      if (prevLiked) {
        const { error } = await supabase.from('post_likes').delete().eq('post_id', post.id).eq('user_id', user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('post_likes').insert({ post_id: post.id, user_id: user.id });
        if (error) throw error;
      }
      onPostUpdated?.();
    } catch (err: any) {
      console.error(err);
      showToast('İşlem başarısız oldu.');
      // Revert optimistic UI
      setHasLiked(prevLiked);
      setLikesCount(prevCount);
    } finally {
      setIsLiking(false);
    }
  };

  const handleComment = () => {
    // TBD: Open comment modal
    showToast('Yorumlar yakında eklenecek!');
  };

  return (
    <div className="bg-[#1C130D]/80 border border-[#D4AF37]/10 p-4 mb-3 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.2)]">
      {/* Header: User Info */}
      <div className="flex items-start justify-between mb-3">
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => onClickUser?.(post.user_id)}
        >
          <img 
            src={post.user_avatar_url || "https://ui-avatars.com/api/?name=" + (post.user_full_name || 'U') + "&background=27272a&color=fff"} 
            alt={post.user_full_name} 
            className="w-10 h-10 rounded-full object-cover border border-[#D4AF37]/30 group-active:scale-95 transition-transform"
          />
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-bold text-white group-hover:text-amber-100 transition-colors">
                {post.user_full_name || 'Bilinmeyen Kullanıcı'}
              </span>
              {post.user_is_premium && <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />}
              {post.user_is_beta_tester && <CheckCircle className="w-3.5 h-3.5 text-purple-400" />}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-[11px] font-medium text-amber-200/50">
                {post.user_username || '@misafir'}
              </span>
              <span className="text-[10px] text-zinc-600 font-medium">•</span>
              <span className="text-[10px] text-zinc-500 font-medium">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: tr })}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="mb-4 text-sm text-zinc-200 leading-relaxed font-medium whitespace-pre-wrap break-words px-1">
        {post.content}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-6 px-1 border-t border-white/5 pt-3">
        <button 
          onClick={handleLike}
          disabled={isLiking}
          className={`flex items-center gap-2 transition-colors active:scale-90 ${
            hasLiked ? 'text-rose-500' : 'text-zinc-400 hover:text-zinc-200'
          }`}
        >
          <Heart className={`w-5 h-5 ${hasLiked ? 'fill-rose-500' : ''}`} />
          <span className="text-xs font-bold">{likesCount > 0 ? likesCount : ''}</span>
        </button>

        <button 
          onClick={handleComment}
          className="flex items-center gap-2 text-zinc-400 hover:text-zinc-200 transition-colors active:scale-90"
        >
          <MessageCircle className="w-5 h-5" />
          <span className="text-xs font-bold">{post.comments_count > 0 ? post.comments_count : ''}</span>
        </button>
      </div>
    </div>
  );
};
