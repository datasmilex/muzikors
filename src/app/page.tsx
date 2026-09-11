'use client';

import React from 'react';
import { AppProvider } from '../context/AppContext';
import { Header } from '../components/Header';

import { NowPlayingSection } from '../components/NowPlayingSection';
import { UpNextQueueSection } from '../components/UpNextQueueSection';
import { VenueGuard } from '../components/VenueGuard';
import { DrawerMenu } from '../components/DrawerMenu';
import { BottomNav } from '../components/BottomNav';
import { MusicSearchModal } from '../components/MusicSearchModal';
import { ProfileView } from '../components/ProfileView';
import { LoginModal } from '../components/LoginModal';
import { QrScannerModal } from '../components/QrScannerModal';
import { GpsMapModal } from '../components/GpsMapModal';
import { InfoModals } from '../components/InfoModals';
import { VenueInfoModal } from '../components/VenueInfoModal';
import { PremiumModal } from '../components/PremiumModal';
import { DailyRewardModal } from '../components/DailyRewardModal';
import { RewardedAdModal } from '../components/RewardedAdModal';
import { ToastNotification } from '../components/ToastNotification';
import { GlobalFeedView } from '../components/GlobalFeedView';
import { LeaderboardModal } from '../components/LeaderboardModal';
import { LyricsModal } from '../components/LyricsModal';
import { MenuModal } from '../components/MenuModal';
import { VenueOwnerModal } from '../components/VenueOwnerModal';
import { StoryShareModal } from '../components/StoryShareModal';

import { QuickActionsBanner } from '../components/QuickActionsBanner';
import { GatewayScreen } from '../components/GatewayScreen';
import { WelcomeScreen } from '../components/WelcomeScreen';
import { TutorialManager } from '../components/TutorialManager';
import { BetaTesterWelcomeModal } from '../components/BetaTesterWelcomeModal';
import { EntranceAnnouncementModal } from '../components/EntranceAnnouncementModal';
import { LandscapeNowPlaying, LandscapeQueue, LandscapeNavRail } from '../components/LandscapeView';
import { useApp } from '../context/AppContext';

const AppContent = () => {
  const { isVenueBound, hasEnteredGateway } = useApp();
  const showGateway = isVenueBound && !hasEnteredGateway;

  return (
    <div className="w-full max-w-md landscape:max-w-none landscape:w-full min-h-screen landscape:min-h-0 landscape:h-screen landscape:h-[100dvh] bg-[var(--theme-bg)] flex flex-col relative shadow-[0_0_80px_rgba(0,0,0,0.9)] border-x border-white/[0.06] overflow-x-hidden landscape:overflow-hidden transition-colors duration-300">
      
      {!isVenueBound ? (
        <WelcomeScreen />
      ) : showGateway ? (
        <GatewayScreen />
      ) : (
        <>
          {/* ── PORTRAIT MODE LAYOUT ──────────────────────────────────────── */}
          <div className="flex flex-col landscape:hidden w-full">
            <Header />
            <QuickActionsBanner />
            <VenueGuard>
              <NowPlayingSection />
              <UpNextQueueSection />
              <BottomNav />
            </VenueGuard>
          </div>

          {/* ── LANDSCAPE MODE STUDIO LAYOUT ─────────────────────────────── */}
          <div className="hidden landscape:flex flex-col w-full h-full min-h-0 overflow-hidden">
            <Header />
            <VenueGuard>
              <div className="flex-1 min-h-0 flex flex-row overflow-hidden relative">
                {/* Sol Taraf: Çalan Şarkı Ekranı */}
                <div className="w-[40%] max-w-[440px] min-w-[300px] h-full p-2.5 overflow-hidden flex flex-col justify-center">
                  <LandscapeNowPlaying />
                </div>

                {/* Sağ Taraf: Sıradaki Şarkılar */}
                <div className="flex-1 min-w-0 h-full p-2.5 overflow-hidden flex flex-col">
                  <LandscapeQueue />
                </div>

                {/* En Sağ: 5'li Buton Grubu */}
                <div className="w-[72px] shrink-0 h-full">
                  <LandscapeNavRail />
                </div>
              </div>
            </VenueGuard>
          </div>
        </>
      )}

      <TutorialManager />
      <BetaTesterWelcomeModal />
      <EntranceAnnouncementModal />
      <DrawerMenu />
      <LeaderboardModal />
      <MusicSearchModal />
      <ProfileView />
      <LoginModal />
      <QrScannerModal />
      <GpsMapModal />
      <VenueInfoModal />
      <MenuModal />
      <VenueOwnerModal />
      <InfoModals />
      <DailyRewardModal />
      <RewardedAdModal />
      <PremiumModal />
      <GlobalFeedView />
      <LyricsModal />
      <StoryShareModal />
      <ToastNotification />
    </div>
  );
};

export default function Home() {
  return (
    <AppProvider>
      <main className="min-h-screen landscape:min-h-0 landscape:h-screen landscape:h-[100dvh] bg-[var(--theme-bg)] text-white flex justify-center selection:bg-amber-400 selection:text-black transition-colors duration-300 overflow-x-hidden landscape:overflow-hidden">
        <AppContent />
      </main>
    </AppProvider>
  );
}
