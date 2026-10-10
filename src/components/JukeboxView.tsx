'use client';

import React, { useEffect } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
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
import { ToastNotification } from './ToastNotification';
import { LeaderboardModal } from './LeaderboardModal';
import { LyricsModal } from './LyricsModal';
import { MenuModal } from './MenuModal';
import { StoryShareModal } from './StoryShareModal';
import { GatewayScreen } from './GatewayScreen';
import { WelcomeScreen } from './WelcomeScreen';
import { TutorialManager } from './TutorialManager';
import { BetaTesterWelcomeModal } from './BetaTesterWelcomeModal';
import { EntranceAnnouncementModal } from './EntranceAnnouncementModal';
import { LandscapeNowPlaying, LandscapeQueue, LandscapeNavRail } from './LandscapeView';
import { EASE_OUT } from '../lib/motion';

interface JukeboxViewProps {
  initialModal?: ModalType;
}

export const JukeboxView: React.FC<JukeboxViewProps> = ({ initialModal }) => {
  const { isVenueBound, hasEnteredGateway, openModal } = useApp();
  const reduceMotion = useReducedMotion();
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
    <div className="w-full max-w-md landscape:max-w-none landscape:w-full min-h-screen landscape:min-h-0 landscape:h-screen landscape:h-[100dvh] bg-[var(--theme-bg)] flex flex-col relative overflow-x-hidden landscape:overflow-hidden">
      {!isVenueBound ? (
        <WelcomeScreen />
      ) : showGateway ? (
        <GatewayScreen />
      ) : (
        <>
          {/* ── DİKEY EKRAN ─────────────────────────────────────────────── */}
          <div className="flex flex-col landscape:hidden w-full">
            <Header />
            <VenueGuard>
              <motion.div
                initial={reduceMotion ? false : { opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0, transition: { duration: 0.45, ease: EASE_OUT } }}
              >
                <NowPlayingSection />
                <UpNextQueueSection />
              </motion.div>
              <BottomNav />
            </VenueGuard>
          </div>

          {/* ── YATAY EKRAN ─────────────────────────────────────────────── */}
          <div className="hidden landscape:flex flex-col w-full h-full min-h-0 overflow-hidden">
            <Header />
            <VenueGuard>
              <div className="flex-1 min-h-0 flex flex-row gap-3 px-3 pb-3 overflow-hidden">
                <div className="w-[40%] max-w-[440px] min-w-[300px] h-full overflow-hidden flex flex-col justify-center">
                  <LandscapeNowPlaying />
                </div>
                <div className="flex-1 min-w-0 h-full overflow-hidden flex flex-col">
                  <LandscapeQueue />
                </div>
                <div className="w-[76px] shrink-0 h-full">
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
      <InfoModals />
      <DailyRewardModal />
      <PremiumModal />
      <LyricsModal />
      <StoryShareModal />
      <ToastNotification />
    </div>
  );
};
