-- ========================================================
-- MUZIKORS SOCIAL FEATURES MIGRATION
-- ========================================================

-- ========================================================
-- 0. FIX EXISTING PROFILES TABLE
-- ========================================================
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_premium BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS is_beta_tester BOOLEAN DEFAULT false;
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS username TEXT;

-- ========================================================
-- 1. POSTS TABLE
CREATE TABLE IF NOT EXISTS public.posts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) > 0 AND char_length(content) <= 280),
  likes_count INTEGER DEFAULT 0,
  comments_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 2. POST_LIKES TABLE
CREATE TABLE IF NOT EXISTS public.post_likes (
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (post_id, user_id)
);

-- 3. POST_COMMENTS TABLE
CREATE TABLE IF NOT EXISTS public.post_comments (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  post_id UUID REFERENCES public.posts(id) ON DELETE CASCADE,
  user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  content TEXT NOT NULL CHECK (char_length(content) > 0 AND char_length(content) <= 280),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- 4. FOLLOWS TABLE
CREATE TABLE IF NOT EXISTS public.follows (
  follower_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  following_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (follower_id, following_id)
);

-- ========================================================
-- RLS POLICIES & PERMISSIONS
-- ========================================================
-- Grant basic table access so queries aren't rejected before RLS
GRANT ALL ON public.posts TO authenticated;
GRANT ALL ON public.posts TO anon;
GRANT ALL ON public.post_likes TO authenticated;
GRANT ALL ON public.post_likes TO anon;
GRANT ALL ON public.post_comments TO authenticated;
GRANT ALL ON public.post_comments TO anon;
GRANT ALL ON public.follows TO authenticated;
GRANT ALL ON public.follows TO anon;

ALTER TABLE public.posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- Posts
DROP POLICY IF EXISTS "Posts are viewable by everyone" ON public.posts;
CREATE POLICY "Posts are viewable by everyone" ON public.posts FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert own posts" ON public.posts;
CREATE POLICY "Users can insert own posts" ON public.posts FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own posts" ON public.posts;
CREATE POLICY "Users can delete own posts" ON public.posts FOR DELETE USING (auth.uid() = user_id);

-- Post Likes
DROP POLICY IF EXISTS "Likes are viewable by everyone" ON public.post_likes;
CREATE POLICY "Likes are viewable by everyone" ON public.post_likes FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert own likes" ON public.post_likes;
CREATE POLICY "Users can insert own likes" ON public.post_likes FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own likes" ON public.post_likes;
CREATE POLICY "Users can delete own likes" ON public.post_likes FOR DELETE USING (auth.uid() = user_id);

-- Post Comments
DROP POLICY IF EXISTS "Comments are viewable by everyone" ON public.post_comments;
CREATE POLICY "Comments are viewable by everyone" ON public.post_comments FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can insert own comments" ON public.post_comments;
CREATE POLICY "Users can insert own comments" ON public.post_comments FOR INSERT WITH CHECK (auth.uid() = user_id);
DROP POLICY IF EXISTS "Users can delete own comments" ON public.post_comments;
CREATE POLICY "Users can delete own comments" ON public.post_comments FOR DELETE USING (auth.uid() = user_id);

-- Follows
DROP POLICY IF EXISTS "Follows are viewable by everyone" ON public.follows;
CREATE POLICY "Follows are viewable by everyone" ON public.follows FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can follow others" ON public.follows;
CREATE POLICY "Users can follow others" ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
DROP POLICY IF EXISTS "Users can unfollow others" ON public.follows;
CREATE POLICY "Users can unfollow others" ON public.follows FOR DELETE USING (auth.uid() = follower_id);

-- ========================================================
-- TRIGGERS for COUNTERS (Likes, Comments)
-- ========================================================

-- Likes Counter
CREATE OR REPLACE FUNCTION public.handle_post_like()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET likes_count = likes_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET likes_count = likes_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_post_like ON public.post_likes;
CREATE TRIGGER on_post_like
  AFTER INSERT OR DELETE ON public.post_likes
  FOR EACH ROW EXECUTE FUNCTION public.handle_post_like();

-- Comments Counter
CREATE OR REPLACE FUNCTION public.handle_post_comment()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    UPDATE public.posts SET comments_count = comments_count + 1 WHERE id = NEW.post_id;
    RETURN NEW;
  ELSIF TG_OP = 'DELETE' THEN
    UPDATE public.posts SET comments_count = comments_count - 1 WHERE id = OLD.post_id;
    RETURN OLD;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_post_comment ON public.post_comments;
CREATE TRIGGER on_post_comment
  AFTER INSERT OR DELETE ON public.post_comments
  FOR EACH ROW EXECUTE FUNCTION public.handle_post_comment();
  
-- ========================================================
-- RPC: Get Profile Stats (Posts, Followers, Following)
-- ========================================================
CREATE OR REPLACE FUNCTION public.get_profile_stats(p_user_id UUID)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_posts_count INTEGER;
  v_followers_count INTEGER;
  v_following_count INTEGER;
BEGIN
  SELECT count(*) INTO v_posts_count FROM public.posts WHERE user_id = p_user_id;
  SELECT count(*) INTO v_followers_count FROM public.follows WHERE following_id = p_user_id;
  SELECT count(*) INTO v_following_count FROM public.follows WHERE follower_id = p_user_id;
  
  RETURN json_build_object(
    'posts_count', v_posts_count,
    'followers_count', v_followers_count,
    'following_count', v_following_count
  );
END;
$$;
