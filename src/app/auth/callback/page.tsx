'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

export default function AuthCallback() {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const processSession = async (session: any) => {
      if (!session) {
        if (mounted) router.replace('/');
        return;
      }

      try {
        const userId = session.user.id;
        const provider = session.user.app_metadata?.provider ?? 'google';
        const isSpotify = provider === 'spotify';
        const hasSpotifyToken = !!session.provider_token;

        let spotifyId = null;
        let spotifyEmail = null;
        let spotifyName = null;
        let spotifyAvatar = null;

        if (hasSpotifyToken) {
          try {
            const spRes = await fetch('https://api.spotify.com/v1/me', {
              headers: { Authorization: `Bearer ${session.provider_token}` },
            });
            if (spRes.ok) {
              const spData = await spRes.json();
              spotifyId = spData.id;
              spotifyEmail = spData.email;
              spotifyName = spData.display_name;
              const spImages = spData.images || [];
              if (spImages.length > 0) {
                spotifyAvatar = spImages[0].url;
              }
            }
          } catch (err) {
            console.warn('[Auth Callback] Could not fetch Spotify profile:', err);
          }
        }

        const fullName =
          spotifyName ||
          session.user.user_metadata?.full_name ||
          session.user.user_metadata?.name ||
          session.user.email?.split('@')[0] ||
          'Kullanıcı';

        const avatarUrl =
          spotifyAvatar ||
          session.user.user_metadata?.avatar_url ||
          session.user.user_metadata?.picture ||
          '';

        const { error: upsertErr } = await supabase
          .from('profiles')
          .upsert(
            {
              id: userId,
              full_name: fullName,
              avatar_url: avatarUrl,
              email: session.user.email || spotifyEmail || '',
              ...(isSpotify || hasSpotifyToken ? { is_spotify_connected: true } : {}),
              ...(hasSpotifyToken ? {
                spotify_id: spotifyId,
                spotify_email: spotifyEmail,
                spotify_access_token: session.provider_token,
                spotify_refresh_token: session.provider_refresh_token,
              } : {}),
            },
            { onConflict: 'id' }
          );

        if (upsertErr) {
          console.error('[Auth Callback] Profile upsert error:', upsertErr.message);
        }

        if (mounted) router.replace('/');
      } catch (err: any) {
        console.error('[Auth Callback Error]', err);
        if (mounted) setError(err.message || 'An error occurred during authentication.');
        setTimeout(() => {
          if (mounted) router.replace('/');
        }, 3000);
      }
    };

    // First check if there's already a session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) {
        processSession(session);
      } else {
        // If no session immediately available, wait for auth state change
        // This handles the implicit flow hash parsing
        const { data: authListener } = supabase.auth.onAuthStateChange((event, newSession) => {
          if (event === 'SIGNED_IN' && newSession) {
            processSession(newSession);
          }
        });
        
        // Timeout fallback just in case the hash is invalid or missing
        setTimeout(() => {
          if (mounted && !error) {
            router.replace('/');
          }
        }, 3000);

        return () => {
          authListener.subscription.unsubscribe();
        };
      }
    });

    return () => { mounted = false; };
  }, [router]);

  return (
    <div className="flex h-screen w-full flex-col items-center justify-center bg-[#120C08] text-white">
      {error ? (
        <div className="text-center space-y-4">
          <p className="text-red-500 font-bold text-lg">Giriş Hatası</p>
          <p className="text-sm text-gray-400">{error}</p>
          <p className="text-xs text-gray-500">Ana sayfaya yönlendiriliyorsunuz...</p>
        </div>
      ) : (
        <div className="text-center space-y-4 flex flex-col items-center">
          <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
          <p className="text-[#D4AF37] font-semibold tracking-wide">Oturum açılıyor...</p>
        </div>
      )}
    </div>
  );
}
