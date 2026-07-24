'use client';

import React from 'react';
import { AppProvider } from '../context/AppContext';
import { Header } from '../components/Header';
import { TopRowCards } from '../components/TopRowCards';
import { GpsBanner } from '../components/GpsBanner';
import { NowPlayingSection } from '../components/NowPlayingSection';
import { UpNextQueueSection } from '../components/UpNextQueueSection';
import { StickyAddMusicButton } from '../components/StickyAddMusicButton';
import { DrawerMenu } from '../components/DrawerMenu';
import { CreditTopUpModal } from '../components/CreditTopUpModal';
import { MusicSearchModal } from '../components/MusicSearchModal';
import { ProfileView } from '../components/ProfileView';
import { LoginModal } from '../components/LoginModal';
import { QrScannerModal } from '../components/QrScannerModal';
import { GpsMapModal } from '../components/GpsMapModal';
import { InfoModals } from '../components/InfoModals';
import { ToastNotification } from '../components/ToastNotification';

export default function Home() {
  return (
    <AppProvider>
      <main className="min-h-screen bg-[#120C08] text-[#FCEFD5] flex justify-center selection:bg-[#D4AF37] selection:text-black">
        {/* Smartphone Container Viewport Wrapper */}
        <div className="w-full max-w-md min-h-screen bg-[#120C08] flex flex-col relative shadow-[0_0_50px_rgba(212,175,55,0.15)] border-x border-[#D4AF37]/15">
          {/* 1. Top Navigation Bar (Header - Wireframe 2) */}
          <Header />

          {/* 2. Top Row Cards: Credit Balance & QR Okut Trigger (Wireframe 2) */}
          <TopRowCards />

          {/* 3. GPS Banner: Location Icon + Muzikors Haritası Trigger (Wireframe 2) */}
          <GpsBanner />

          {/* 4. Now Playing Hero Section: Song Artwork, Title, Artist, Live Progress Bar & Audio Equalizer (Wireframe 2) */}
          <NowPlayingSection />

          {/* 5. Up Next Queue: Scrollable List of Upcoming Tracks with Upvoting & Requester Avatars (Wireframe 2) */}
          <UpNextQueueSection />

          {/* 6. Sticky Action: Massive Floating "+ Müzik Ekle" Button with Cooldown Timer (Wireframe 2) */}
          <StickyAddMusicButton />

          {/* Modals & Overlays matching wireframes */}
          <DrawerMenu />
          <CreditTopUpModal />
          <MusicSearchModal />
          <ProfileView />
          <LoginModal />
          <QrScannerModal />
          <GpsMapModal />
          <InfoModals />
          <ToastNotification />
        </div>
      </main>
    </AppProvider>
  );
}
