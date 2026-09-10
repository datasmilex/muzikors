import React, { useState } from 'react';
import { SocialPost as SocialPostType } from '../types';
import { Heart, MessageCircle, ShieldCheck, CheckCircle, Send, Loader2, MoreHorizontal, Trash2 } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useApp } from '../context/AppContext';
import { formatDistanceToNow } from 'date-fns';
import { tr } from 'date-fns/locale';
import { PremiumBadge, BetaTesterBadge } from './PremiumBadge';
import { containsProfanity } from '../utils/profanity';
import { AvatarFrame } from './AvatarFrame';

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
  const [confirmDeletePost, setConfirmDeletePost] = useState(false);
  const [deletingCommentId, setDeletingCommentId] = useState<string | null>(null);
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
          profiles:user_id ( full_name, username, avatar_url, avatar_frame, is_premium, is_beta_tester )
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
    setIsDeleting(true);
    try {
      const { error } = await supabase.from('posts').delete().eq('id', post.id);
      if (error) throw error;
      showToast('Gönderi silindi.');
      setShowOptions(false);
      setConfirmDeletePost(false);
      onPostUpdated?.();
    } catch (err) {
      console.error(err);
      showToast('Silinirken hata oluştu.');
    } finally {
      setIsDeleting(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    try {
      const { error } = await supabase.from('post_comments').delete().eq('id', commentId);
      if (error) throw error;
      showToast('Yorum silindi.');
      setCommentsCount(c => Math.max(0, c - 1));
      setDeletingCommentId(null);
      fetchComments();
      onPostUpdated?.();
    } catch (err) {
      console.error(err);
      showToast('Yorum silinirken hata oluştu.');
    }
  };

  const postProfile = Array.isArray((post as any).profiles) ? (post as any).profiles[0] : (post as any).profiles;
  const isPostOwner = user?.id === post.user_id;

  const authorName = 
    post.user_full_name || 
    postProfile?.full_name || 
    (isPostOwner ? user?.name : null) || 
    'Muzikors Dinleyicisi';

  const authorUsername = 
    post.user_username || 
    postProfile?.username || 
    (isPostOwner ? user?.username : null) || 
    '@dinleyici';

  const authorAvatar = 
    post.user_avatar_url || 
    postProfile?.avatar_url || 
    (isPostOwner ? user?.avatar : null) || 
    `https://ui-avatars.com/api/?name=${encodeURIComponent(authorName)}&background=141318&color=fff`;

  const authorFrame = 
    post.user_avatar_frame || 
    postProfile?.avatar_frame || 
    (isPostOwner ? user?.avatar_frame : null) || 
    'none';

  const authorIsPremium = 
    post.user_is_premium ?? 
    postProfile?.is_premium ?? 
    (isPostOwner ? user?.isPremium : false);

  const authorIsBetaTester = 
    post.user_is_beta_tester ?? 
    postProfile?.is_beta_tester ?? 
    (isPostOwner ? user?.is_beta_tester : false);

  return (
    <div className="bg-[var(--theme-card-alt)] border border-white/[0.08] p-4 mb-3 rounded-2xl shadow-sm">
      {/* Header: User Info */}
      <div className="flex items-start justify-between mb-3">
        <div 
          className="flex items-center gap-3 cursor-pointer group"
          onClick={() => onClickUser?.(post.user_id)}
        >
          <AvatarFrame frameId={authorFrame} size="md">
            <img 
              src={authorAvatar} 
              alt={authorName} 
              className="w-full h-full object-cover group-active:scale-95 transition-transform"
            />
          </AvatarFrame>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-white group-hover:text-[var(--theme-primary-light)] transition-colors">
                {authorName}
              </span>
              {authorIsPremium && <PremiumBadge className="w-3.5 h-3.5 ml-0.5" />}
              {authorIsBetaTester && <BetaTesterBadge className="w-3.5 h-3.5 ml-0.5" />}
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-[10px] font-medium text-neutral-400">
                {authorUsername}
              </span>
              <span className="text-[10px] text-neutral-600 font-medium">•</span>
              <span className="text-[10px] text-neutral-500 font-medium">
                {formatDistanceToNow(new Date(post.created_at), { addSuffix: true, locale: tr })}
              </span>
            </div>
          </div>
        </div>

        {/* Delete Post Menu */}
        {user?.id === post.user_id && (
          <div className="relative">
            <button 
              onClick={() => {
                setShowOptions(!showOptions);
                setConfirmDeletePost(false);
              }} 
              className="p-1.5 text-neutral-400 hover:text-white transition-colors rounded-lg active:scale-95"
              aria-label="Gönderi seçenekleri"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>
            {showOptions && (
              <div className="absolute right-0 top-full mt-1 bg-[var(--theme-card)] border border-white/10 rounded-xl shadow-xl overflow-hidden z-20 min-w-[124px] text-xs animate-in fade-in duration-150">
                {confirmDeletePost ? (
                  <div className="p-2 space-y-1.5">
                    <p className="text-[10px] text-neutral-300 font-bold text-center">Silinsin mi?</p>
                    <div className="flex items-center gap-1">
                      <button
                        onClick={handleDeletePost}
                        disabled={isDeleting}
                        className="flex-1 py-1 px-1.5 rounded-lg bg-rose-500/20 text-rose-300 hover:bg-rose-500/30 text-[10px] font-bold transition-all text-center active:scale-95 disabled:opacity-50"
                      >
                        {isDeleting ? <Loader2 className="w-3 h-3 animate-spin mx-auto" /> : 'Evet'}
                      </button>
                      <button
                        onClick={() => setConfirmDeletePost(false)}
                        className="flex-1 py-1 px-1.5 rounded-lg bg-white/5 text-neutral-400 hover:text-white text-[10px] font-medium transition-all text-center active:scale-95"
                      >
                        Vazgeç
                      </button>
                    </div>
                  </div>
                ) : (
                  <button 
                    onClick={() => setConfirmDeletePost(true)} 
                    className="w-full text-left px-3 py-2 text-rose-400 font-bold hover:bg-white/5 flex items-center justify-between transition-colors active:scale-95"
                  >
                    <span>Sil</span>
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="mb-3.5 text-xs text-neutral-200 leading-relaxed font-normal whitespace-pre-wrap break-words px-0.5">
        {post.content}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-5 px-0.5 border-t border-white/[0.06] pt-2.5">
        <button 
          onClick={handleLike}
          disabled={isLiking}
          className={`flex items-center gap-1.5 transition-colors active:scale-95 text-xs font-bold ${
            hasLiked ? 'text-rose-500' : 'text-neutral-400 hover:text-white'
          }`}
        >
          <Heart className={`w-4 h-4 ${hasLiked ? 'fill-rose-500' : ''}`} />
          <span>{likesCount > 0 ? likesCount : ''}</span>
        </button>

        <button 
          onClick={handleComment}
          className="flex items-center gap-1.5 text-neutral-400 hover:text-white transition-colors active:scale-95 text-xs font-bold"
        >
          <MessageCircle className="w-4 h-4" />
          <span>{commentsCount > 0 ? commentsCount : ''}</span>
        </button>
      </div>

      {/* Comments Section */}
      {showComments && (
        <div className="mt-3 pt-3 border-t border-white/[0.06] flex flex-col gap-2.5">
          {isLoadingComments ? (
            <div className="text-center py-2"><Loader2 className="w-4 h-4 animate-spin mx-auto text-neutral-400" /></div>
          ) : comments.length > 0 ? (
            <div className="flex flex-col gap-2 max-h-[250px] overflow-y-auto pr-1 custom-scrollbar">
              {comments.map((comment: any) => {
                const commentProf = Array.isArray(comment.profiles) ? comment.profiles[0] : comment.profiles;
                const isCommentOwner = user?.id === comment.user_id;
                const cName = commentProf?.full_name || (isCommentOwner ? user?.name : null) || 'Muzikors Dinleyicisi';
                const cAvatar = commentProf?.avatar_url || (isCommentOwner ? user?.avatar : null) || `https://ui-avatars.com/api/?name=${encodeURIComponent(cName)}&background=141318&color=fff`;
                const cFrame = commentProf?.avatar_frame || (isCommentOwner ? user?.avatar_frame : null) || 'none';
                const cIsPremium = commentProf?.is_premium ?? (isCommentOwner ? user?.isPremium : false);
                const cIsBetaTester = commentProf?.is_beta_tester ?? (isCommentOwner ? user?.is_beta_tester : false);

                return (
                  <div key={comment.id} className="flex gap-2 items-start">
                    <div className="cursor-pointer shrink-0" onClick={() => onClickUser?.(comment.user_id)}>
                      <AvatarFrame frameId={cFrame} size="xs">
                        <img 
                          src={cAvatar}
                          alt={cName}
                          className="w-full h-full object-cover"
                        />
                      </AvatarFrame>
                    </div>
                    <div className="flex flex-col bg-white/[0.03] border border-white/[0.06] rounded-2xl rounded-tl-sm px-3 py-2 text-xs flex-1 group/comment relative">
                      <div className="flex items-center justify-between mb-0.5">
                        <div className="flex items-center gap-1.5" onClick={() => onClickUser?.(comment.user_id)}>
                          <span className="font-bold text-white text-xs cursor-pointer hover:text-[var(--theme-primary-light)]">{cName}</span>
                          {cIsPremium && <PremiumBadge className="w-3 h-3 ml-0.5" />}
                          {cIsBetaTester && <BetaTesterBadge className="w-3 h-3 ml-0.5" />}
                        </div>
                        {(user?.id === comment.user_id || user?.id === post.user_id) && (
                          deletingCommentId === comment.id ? (
                            <div className="flex items-center gap-1 ml-auto shrink-0 animate-in fade-in duration-150">
                              <span className="text-[9px] text-neutral-400 font-medium">Silinsin mi?</span>
                              <button 
                                onClick={() => handleDeleteComment(comment.id)} 
                                className="px-1.5 py-0.5 rounded bg-rose-500/20 text-rose-300 text-[9px] font-bold hover:bg-rose-500/30 active:scale-95 transition-all"
                              >
                                Evet
                              </button>
                              <button 
                                onClick={() => setDeletingCommentId(null)} 
                                className="px-1.5 py-0.5 rounded bg-white/10 text-neutral-300 text-[9px] hover:text-white active:scale-95 transition-all"
                              >
                                İptal
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => setDeletingCommentId(comment.id)} 
                              className="text-neutral-500 hover:text-rose-400 transition-colors p-1 active:scale-90"
                              aria-label="Yorumu sil"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          )
                        )}
                      </div>
                      <span className="text-neutral-300 font-normal whitespace-pre-wrap break-words text-xs">{comment.content}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center text-[11px] text-neutral-500 py-1">Henüz yorum yok. İlk yorumu sen yap!</div>
          )}

          {/* New Comment Input */}
          <div className="flex items-center gap-2 mt-1">
            <AvatarFrame frameId={user?.avatar_frame} size="xs">
              <img 
                src={user?.avatar || "https://ui-avatars.com/api/?name=" + (user?.name || 'U') + "&background=141318&color=fff"} 
                className="w-full h-full object-cover" 
                alt="You" 
              />
            </AvatarFrame>
            <div className="flex-1 flex items-center bg-white/[0.04] border border-white/10 rounded-full pr-1 pl-3 h-8">
              <input 
                type="text" 
                placeholder="Yorum yaz..." 
                className="bg-transparent border-none outline-none text-xs text-white flex-1 placeholder:text-neutral-500"
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
                className="w-6 h-6 rounded-full bg-[var(--theme-primary)] flex items-center justify-center text-black disabled:opacity-50 transition-all active:scale-90"
              >
                {isPostingComment ? <Loader2 className="w-3 h-3 animate-spin" /> : <Send className="w-3 h-3 -ml-0.5" />}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
