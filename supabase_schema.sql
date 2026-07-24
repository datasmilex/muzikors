-- ============================================================
-- MUZIKORS CLEAN SUPABASE SCHEMA v3.2
-- Run this in Supabase SQL Editor to reset and rebuild
-- ============================================================

-- 1. DROP existing tables (clean slate)
DROP TABLE IF EXISTS public.song_requests_log CASCADE;
DROP TABLE IF EXISTS public.song_user_votes CASCADE;
DROP TABLE IF EXISTS public.song_queue CASCADE;
DROP TABLE IF EXISTS public.profiles CASCADE;

-- ============================================================
-- 2. PROFILES TABLE
-- ============================================================
CREATE TABLE public.profiles (
  id                    UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name             TEXT,
  avatar_url            TEXT,
  email                 TEXT,
  credits               INTEGER NOT NULL DEFAULT 10,
  lifetime_credits      INTEGER NOT NULL DEFAULT 10,
  total_songs_requested INTEGER NOT NULL DEFAULT 0,
  is_spotify_connected  BOOLEAN NOT NULL DEFAULT false,
  updated_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-update timestamp on row change
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- ============================================================
-- 3. AUTO-CREATE PROFILE ON SIGNUP (gives 10 credits)
-- ============================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, full_name, avatar_url, email, credits, lifetime_credits, total_songs_requested, is_spotify_connected
  )
  VALUES (
    NEW.id,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    COALESCE(
      NEW.raw_user_meta_data->>'avatar_url',
      NEW.raw_user_meta_data->>'picture',
      ''
    ),
    NEW.email,
    10,
    10,
    0,
    (NEW.raw_app_meta_data->>'provider' = 'spotify')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Attach trigger to auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- ============================================================
-- 4. SONG_QUEUE TABLE (with started_at for multi-device sync)
-- ============================================================
CREATE TABLE public.song_queue (
  id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  song_title            TEXT NOT NULL,
  artist                TEXT NOT NULL,
  album_cover           TEXT,
  spotify_uri           TEXT,
  duration_ms           INTEGER DEFAULT 210000,
  requested_by_user_id  UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  requested_by_name     TEXT NOT NULL DEFAULT 'Misafir',
  votes                 INTEGER NOT NULL DEFAULT 1,
  status                TEXT NOT NULL DEFAULT 'queued' CHECK (status IN ('queued', 'playing', 'played', 'skipped')),
  started_at            TIMESTAMPTZ,
  created_at            TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 5. SONG_USER_VOTES TABLE (Track max 5 votes per song per user)
-- ============================================================
CREATE TABLE public.song_user_votes (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  song_id     UUID REFERENCES public.song_queue(id) ON DELETE CASCADE,
  vote_count  INTEGER NOT NULL DEFAULT 1,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, song_id)
);

-- ============================================================
-- 6. SONG_REQUESTS_LOG TABLE (Permanent log for monthly leaderboard)
-- ============================================================
CREATE TABLE public.song_requests_log (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================
-- 7. ENABLE ROW LEVEL SECURITY
-- ============================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.song_queue ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.song_user_votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.song_requests_log ENABLE ROW LEVEL SECURITY;

-- PROFILES
CREATE POLICY "Profiles are viewable by authenticated users" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id) WITH CHECK (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- SONG_QUEUE
CREATE POLICY "Song queue is publicly readable" ON public.song_queue FOR SELECT USING (true);
CREATE POLICY "Authenticated users can add to queue" ON public.song_queue FOR INSERT WITH CHECK (auth.role() = 'authenticated');
CREATE POLICY "Song queue items are updateable" ON public.song_queue FOR UPDATE USING (true);
CREATE POLICY "Song queue items are deletable" ON public.song_queue FOR DELETE USING (true);

-- SONG_USER_VOTES
CREATE POLICY "Votes are readable by anyone" ON public.song_user_votes FOR SELECT USING (true);
CREATE POLICY "Authenticated users can manage own votes" ON public.song_user_votes FOR ALL USING (auth.uid() = user_id);

-- SONG_REQUESTS_LOG
CREATE POLICY "Song requests log is readable" ON public.song_requests_log FOR SELECT USING (true);
CREATE POLICY "Authenticated users can insert into log" ON public.song_requests_log FOR INSERT WITH CHECK (auth.role() = 'authenticated');

-- ============================================================
-- 8. ENABLE REALTIME
-- ============================================================
ALTER PUBLICATION supabase_realtime ADD TABLE public.profiles;
ALTER PUBLICATION supabase_realtime ADD TABLE public.song_queue;
ALTER PUBLICATION supabase_realtime ADD TABLE public.song_user_votes;
ALTER PUBLICATION supabase_realtime ADD TABLE public.song_requests_log;
