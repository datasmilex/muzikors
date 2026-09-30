'use client';

import React, { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient';

function AuthCallback() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let mounted = true;

    const processSession = async (session: any) => {
      const returnUrl = typeof window !== 'undefined' ? localStorage.getItem('muzikors_auth_return_url') || '/' : '/';
      
      if (!session) {
        if (mounted) router.replace(returnUrl);
        return;
      }

      try {
        const userId = session.user.id;

        const fullName =
          session.user.user_metadata?.full_name ||
          session.user.user_metadata?.name ||
          session.user.email?.split('@')[0] ||
          'Kullanıcı';

        const avatarUrl =
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
              email: session.user.email || '',
              updated_at: new Date().toISOString(),
            },
            { onConflict: 'id' }
          );

        if (upsertErr) {
          console.error('[Auth Callback] Profile upsert error:', upsertErr.message);
        }
        
        if (typeof window !== 'undefined') localStorage.removeItem('muzikors_auth_return_url');
        if (mounted) router.replace(returnUrl);
      } catch (err: any) {
        console.error('[Auth Callback Error]', err);
        if (mounted) setError(err.message || 'An error occurred during authentication.');
        setTimeout(() => {
          if (typeof window !== 'undefined') localStorage.removeItem('muzikors_auth_return_url');
          if (mounted) router.replace(returnUrl);
        }, 3000);
      }
    };

    // First check if there's already a session
    const checkSession = async () => {
      try {
        // Wait 1.5 seconds to allow Android WebView to regain network connectivity 
        // (often drops momentarily when closing Custom Tabs)
        await new Promise((resolve) => setTimeout(resolve, 1500));

        const errorParam = searchParams?.get('error');
        const errorDesc = searchParams?.get('error_description');
        if (errorParam) {
          throw new Error(`Auth Error: ${errorDesc || errorParam}`);
        }

        // If there's a code in the URL, manually exchange it
        const code = searchParams?.get('code');
        if (code) {
          console.log('[Auth Callback] Found code in URL, exchanging for session...');
          const { data, error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);
          if (exchangeError) throw exchangeError;
          if (data.session) {
            await processSession(data.session);
            return;
          }
        }
        
        // Implicit flow hash parsing fallback (if hash exists but wasn't processed)
        if (typeof window !== 'undefined' && window.location.hash.includes('access_token=')) {
          // Force hashchange for supabase to pick it up if it hasn't
          window.dispatchEvent(new Event('hashchange')); // Using standard Event for older WebViews
        }

        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          processSession(session);
        } else {
          // If no session immediately available, wait for auth state change
          const { data: authListener } = supabase.auth.onAuthStateChange((event, newSession) => {
            if (event === 'SIGNED_IN' && newSession) {
              processSession(newSession);
            }
          });
          
          // Timeout fallback (increased to 8 seconds to allow for slow networks)
          setTimeout(() => {
            if (mounted && !error) {
              console.warn('[Auth Callback] Timeout waiting for session, redirecting to home...');
              const fallbackUrl = typeof window !== 'undefined' ? localStorage.getItem('muzikors_auth_return_url') || '/' : '/';
              router.replace(fallbackUrl);
            }
          }, 8000);

          return () => {
            authListener.subscription.unsubscribe();
          };
        }
      } catch (err: any) {
        console.error('[Auth Callback Error]', err);
        if (mounted) setError(err.message || 'An error occurred during authentication.');
        setTimeout(() => {
          const fallbackUrl = typeof window !== 'undefined' ? localStorage.getItem('muzikors_auth_return_url') || '/' : '/';
          if (mounted) router.replace(fallbackUrl);
        }, 3000);
      }
    };

    checkSession();

    return () => { mounted = false; };
  }, [router, searchParams]);

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

export default function AuthCallbackPage() {
  return (
    <React.Suspense fallback={
      <div className="flex h-screen w-full flex-col items-center justify-center bg-[#120C08] text-white">
        <div className="w-12 h-12 border-4 border-[#D4AF37] border-t-transparent rounded-full animate-spin"></div>
      </div>
    }>
      <AuthCallback />
    </React.Suspense>
  );
}
