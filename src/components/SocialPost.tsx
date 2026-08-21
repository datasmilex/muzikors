import React, { useState } from 'react';
import { SocialPost as SocialPostType } from '../types';
import { Heart, MessageCircle, ShieldCheck, CheckCircle, Send, Loader2, MoreHorizontal, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useApp } from '../context/AppContext';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { PremiumBadge, BetaTesterBadge } from './PremiumBadge';
import { containsProfanity } from '../utils/profanity';

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
  
  const [showComments, setShowComments] = useState(false);
  const [comments, setComments] = useState<any[]>([]);
  const [isLoadingComments, setIsLoadingComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  const [isPostingComment, setIsPostingComment] = useState(false);
  const [commentsCount, setCommentsCount] = useState(post.comments_count || 0);

  const [showOptions, setShowOptions] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

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

  const fetchComments = async () => {
    setIsLoadingComments(true);
    try {
      const { data, error } = await supabase
        .from('post_comments')
        .select(`
          id, content, created_at, user_id,
          profiles:user_id ( full_name, username, avatar_url, is_premium, is_beta_tester )
        `)
        .eq('post_id', post.id)
        .order('created_at', { ascending: true });
      
      if (error) throw error;
      setComments(data || []);
    } catch (err) {
      console.error('[fetchComments error]', err);
    } finally {
      setIsLoadingComments(false);
    }
  };

  const handleComment = () => {
    if (!showComments) {
      setShowComments(true);
      if (comments.length === 0) fetchComments();
    } else {
      setShowComments(false);
    }
  };

  const handlePostComment = async () => {
    if (!user) {
      openProtectedModal('none', 'Yorum yapmak için giriş yapmalısınız.');
      return;
    }
    const content = newComment.trim();
    if (!content) return;
    if (content.length > 280) {
      showToast('Yorum 280 karakterden uzun olamaz.');
      return;
    }
    if (containsProfanity(content)) {
      showToast('Yorumunuzda uygunsuz kelimeler bulunuyor.');
      return;
    }

    setIsPostingComment(true);
    try {
      const { error } = await supabase.from('post_comments').insert({
        post_id: post.id,
        user_id: user.id,
        content
      });
      if (error) throw error;
      
      setNewComment('');
      showToast('Yorum paylaşıldı!');
      setCommentsCount(c => c + 1);
      fetchComments();
      onPostUpdated?.();
    } catch (err) {
      console.error(err);
      showToast('Yorum paylaşılırken hata oluştu.');
    } finally {
      setIsPostingComment(false);
    }
  };

  const handleDeletePost = async () => {
    if (!window.confirm("Bu gönderiyi silmek istediğinize emin misiniz?")) return;
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('posts').delete().eq('id', post.id);
      if (error) throw error;
      showToast('Gönderi silindi.');
      setShowOptions(false);
      onPostUpdated?.();
    } catch (err) {
      console.error(err);
      showToast('Silinirken hata oluştu.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!window.confirm("Bu yorumu silmek istediğinize emin misiniz?")) return;
    try {
      const { error } = await supabase.from('post_comments').delete().eq('id', commentId);
      if (error) throw error;
      showToast('Yorum silindi.');
      setCommentsCount(c => Math.max(0, c - 1));
      fetchComments();
      onPostUpdated?.();
    } catch (err) {
      console.error(err);
      showToast('Yorum silinirken hata oluştu.');
    }
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
              {post.user_is_premium && <PremiumBadge className="w-3.5 h-3.5 ml-1" />}
              {post.user_is_beta_tester && <BetaTesterBadge className="w-3.5 h-3.5 ml-1" />}
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

        {/* Delete Post Menu */}
        {user?.id === post.user_id && (
          <div className="relative">
            <button onClick={() => setShowOptions(!showOptions)} className="p-1 text-zinc-400 hover:text-white transition-colors">
              <MoreHorizontal className="w-5 h-5" />
            </button>
            {showOptions && (
              <div className="absolute right-0 top-full mt-1 bg-[#27272a] border border-white/10 rounded-lg shadow-xl overflow-hidden z-10 w-28 text-sm">
                <button onClick={handleDeletePost} disabled={isDeleting} className="w-full text-left px-3 py-2 text-rose-500 font-bold hover:bg-white/5 disabled:opacity-50 flex items-center justify-between">
                  Sil
                  {isDeleting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Trash2 className="w-3.5 h-3.5" />}
                </button>
              </div>
            )}
          </div>
        )}
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
          <span className="text-xs font-bold">{commentsCount > 0 ? commentsCount : ''}</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-4 pt-3 border-t border-white/5 flex flex-col gap-3">
          {isLoadingComments ? (
            <div className="text-center py-2"><Loader2 className="w-4 h-4 animate-spin mx-auto text-zinc-500" /></div>
          ) : comments.length > 0 ? (
            <div className="flex flex-col gap-3 max-h-[300px] overflow-y-auto pr-1 custom-scrollbar">
              {comments.map((comment: any) => (
                <div key={comment.id} className="flex gap-2">
                  <img 
                    src={comment.profiles?.avatar_url || "https://ui-avatars.com/api/?name=" + (comment.profiles?.full_name || 'U') + "&background=27272a&color=fff"}
                    alt={comment.profiles?.full_name}
                    className="w-7 h-7 rounded-full object-cover border border-[#D4AF37]/20"
                    onClick={() => onClickUser?.(comment.user_id)}
                  />
                  <div className="flex flex-col bg-white/5 rounded-2xl rounded-tl-sm px-3 py-2 text-sm flex-1 group/comment relative">
                    <div className="flex items-center justify-between mb-0.5">
                      <div className="flex items-center gap-1.5" onClick={() => onClickUser?.(comment.user_id)}>
                        <span className="font-bold text-white text-xs cursor-pointer hover:text-amber-100">{comment.profiles?.full_name || 'Bilinmeyen'}</span>
                        {comment.profiles?.is_premium && <PremiumBadge className="w-3 h-3 ml-0.5" />}
                      </div>
                      {(user?.id === comment.user_id || user?.id === post.user_id) && (
                        <button onClick={() => handleDeleteComment(comment.id)} className="text-zinc-500 hover:text-rose-500 transition-colors p-1">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                    <span className="text-zinc-300 font-medium whitespace-pre-wrap break-words text-[13px]">{comment.content}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center text-xs text-zinc-500 py-2">Henüz yorum yok. İlk yorumu sen yap!</div>
          )}

          {/* New Comment Input */}
          <div className="flex items-center gap-2 mt-1">
            <img 
              src={user?.avatar || "https://ui-avatars.com/api/?name=" + (user?.name || 'U') + "&background=27272a&color=fff"} 
              className="w-8 h-8 rounded-full border border-white/10" 
              alt="You" 
            />
            <div className="flex-1 flex items-center bg-white/5 border border-white/10 rounded-full pr-1 pl-3 h-9">
              <input 
                type="text" 
                placeholder="Yorum yaz..." 
                className="bg-transparent border-none outline-none text-sm text-white flex-1 placeholder:text-zinc-600"
                value={newComment}
                onChange={e => setNewComment(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handlePostComment();
                  }
                }}
                maxLength={280}
              />
              <button 
                onClick={handlePostComment}
                disabled={!newComment.trim() || isPostingComment}
                className="w-7 h-7 rounded-full bg-[#D4AF37] flex items-center justify-center text-black disabled:opacity-50 transition-all active:scale-90"
              >
                {isPostingComment ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5 -ml-0.5" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
