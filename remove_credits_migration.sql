-- 1. Remove credit related columns from profiles table
ALTER TABLE public.profiles
DROP COLUMN IF EXISTS credits,
DROP COLUMN IF EXISTS promo_credits,
DROP COLUMN IF EXISTS lifetime_credits;

-- 2. Update the handle_new_user function to not include credit columns
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (
    id, full_name, avatar_url, email, total_songs_requested, is_spotify_connected
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
    0,
    (NEW.raw_app_meta_data->>'provider' = 'spotify')
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
