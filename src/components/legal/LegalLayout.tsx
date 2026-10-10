import React from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

// Yasal sayfaların ortak düzeni: düz, rahat okunan belge görünümü.

export const LegalLayout: React.FC<{
  title: string;
  subtitle?: string;
  updated?: string;
  children: React.ReactNode;
}> = ({ title, subtitle, updated, children }) => (
  <div className="min-h-screen bg-[var(--theme-bg)] text-white">
    <header className="sticky top-0 z-10 bg-[rgba(var(--theme-bg-rgb),0.9)] backdrop-blur-md border-b border-white/[0.06]">
      <div className="max-w-2xl mx-auto px-5 h-14 flex items-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 min-h-[44px] text-[14px] font-medium text-white/70 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Muzikors
        </Link>
      </div>
    </header>

    <main className="max-w-2xl mx-auto px-5 pt-10 pb-20">
      <h1 className="text-[28px] sm:text-[34px] font-bold tracking-tight leading-tight">{title}</h1>
      {subtitle && <p className="text-[15px] text-white/55 mt-3 leading-relaxed">{subtitle}</p>}
      {updated && <p className="text-[13px] text-white/35 mt-2">Son güncelleme: {updated}</p>}

      <div className="mt-10 space-y-10 text-[15px] leading-[1.75] text-white/75">{children}</div>

      <footer className="mt-16 pt-6 border-t border-white/[0.08] text-[13px] text-white/40 space-y-1.5">
        <p>
          Sorular ve yasal bildirimler:{' '}
          <a href="mailto:destek@muzikors.com" className="text-white/70 underline underline-offset-2">
            destek@muzikors.com
          </a>
        </p>
        <p>© {new Date().getFullYear()} Muzikors. Tüm hakları saklıdır.</p>
      </footer>
    </main>
  </div>
);

export const LegalSection: React.FC<{ title: string; children: React.ReactNode }> = ({ title, children }) => (
  <section>
    <h2 className="text-[18px] font-semibold text-white tracking-tight mb-3">{title}</h2>
    <div className="space-y-3">{children}</div>
  </section>
);

/** Tek bir önemli notu öne çıkaran sade kutu */
export const LegalNote: React.FC<{ title?: string; children: React.ReactNode }> = ({ title, children }) => (
  <div className="rounded-2xl bg-white/[0.04] px-4 py-3.5 text-[14px]">
    {title && <p className="font-semibold text-white mb-1">{title}</p>}
    <p>{children}</p>
  </div>
);

export const B: React.FC<{ children: React.ReactNode }> = ({ children }) => <strong className="font-semibold text-white">{children}</strong>;
