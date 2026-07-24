-- ========================================================
-- MUZIKORS MOBILE JUKEBOX - SUPABASE PRODUCTION MIGRATION
-- ========================================================

-- 1. Create PROFILES table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  email TEXT,
  credits INTEGER DEFAULT 0 CHECK (credits >= 0),
  full_name TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on profiles
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on profiles"
  ON public.profiles FOR SELECT
  USING (true);

CREATE POLICY "Allow individual update on profiles"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Trigger to automatically create profile on new user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name, avatar_url, credits)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'Kullanıcı'),
    COALESCE(NEW.raw_user_meta_data->>'avatar_url', NEW.raw_user_meta_data->>'picture', ''),
    25 -- Automatic +25 Welcome Credits reward
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();


-- 2. Create VENUES table
CREATE TABLE IF NOT EXISTS public.venues (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  qr_code_id TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on venues
ALTER TABLE public.venues ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on venues"
  ON public.venues FOR SELECT
  USING (true);


-- 3. Create SONG_QUEUE table
CREATE TABLE IF NOT EXISTS public.song_queue (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  venue_id UUID REFERENCES public.venues(id) ON DELETE CASCADE,
  song_title TEXT NOT NULL,
  artist TEXT NOT NULL,
  album_cover TEXT,
  requested_by_user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT DEFAULT 'queued' CHECK (status IN ('playing', 'queued', 'played')),
  votes INTEGER DEFAULT 1 CHECK (votes >= 1),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

-- Enable RLS on song_queue
ALTER TABLE public.song_queue ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on song_queue"
  ON public.song_queue FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated insert into song_queue"
  ON public.song_queue FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Allow authenticated update (voting) on song_queue"
  ON public.song_queue FOR UPDATE
  USING (true);


-- 4. ENABLE REALTIME SYNC ON SONG_QUEUE
-- Adds song_queue to Supabase Realtime publication
BEGIN;
  DROP PUBLICATION IF EXISTS supabase_realtime;
  CREATE PUBLICATION supabase_realtime FOR TABLE public.song_queue, public.venues;
COMMIT;


-- 5. SEED INITIAL VENUE FOR QUICK QR TESTING
INSERT INTO public.venues (id, name, slug, qr_code_id)
VALUES (
  'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  'Kadıköy Velvet Lounge',
  'velvet-lounge-01',
  'velvet-lounge-01'
)
ON CONFLICT (slug) DO NOTHING;
