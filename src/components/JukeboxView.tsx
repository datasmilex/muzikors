'use client';

import React, { useEffect } from 'react';
import { ModalType } from '../types';
import { useApp } from '../context/AppContext';
import { Header } from './Header';
import { NowPlayingSection } from './NowPlayingSection';
import { UpNextQueueSection } from './UpNextQueueSection';
import { VenueGuard } from './VenueGuard';
import { DrawerMenu } from './DrawerMenu';
import { BottomNav } from './BottomNav';
import { MusicSearchModal } from './MusicSearchModal';
import { ProfileView } from './ProfileView';
import { LoginModal } from './LoginModal';
import { QrScannerModal } from './QrScannerModal';
import { GpsMapModal } from './GpsMapModal';
import { InfoModals } from './InfoModals';
import { VenueInfoModal } from './VenueInfoModal';
import { PremiumModal } from './PremiumModal';
import { DailyRewardModal } from './DailyRewardModal';
import { RewardedAdModal } from './RewardedAdModal';
import { ToastNotification } from './ToastNotification';
import { LeaderboardModal } from './LeaderboardModal';
import { LyricsModal } from './LyricsModal';
import { MenuModal } from './MenuModal';
import { VenueOwnerModal } from './VenueOwnerModal';
import { StoryShareModal } from './StoryShareModal';
import { QuickActionsBanner } from './QuickActionsBanner';
import { GatewayScreen } from './GatewayScreen';
import { WelcomeScreen } from './WelcomeScreen';
import { TutorialManager } from './TutorialManager';
import { BetaTesterWelcomeModal } from './BetaTesterWelcomeModal';
import { EntranceAnnouncementModal } from './EntranceAnnouncementModal';
import { LandscapeNowPlaying, LandscapeQueue, LandscapeNavRail } from './LandscapeView';

interface JukeboxViewProps {
  initialModal?: ModalType;
}

export const JukeboxView: React.FC<JukeboxViewProps> = ({ initialModal }) => {
  const { isVenueBound, hasEnteredGateway, openModal } = useApp();
  const showGateway = isVenueBound && !hasEnteredGateway;

  useEffect(() => {
    if (initialModal) {
      const timer = setTimeout(() => {
        openModal(initialModal);
      }, 150);
      return () => clearTimeout(timer);
    }
  }, [initialModal, openModal]);

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
      <LyricsModal />
      <StoryShareModal />
      <ToastNotification />
    </div>
  );
};
