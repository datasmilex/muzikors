'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useApp } from '../context/AppContext';

// İlk kullanımda üç adımlık kısa tanıtım (bir kez gösterilir).
export const TutorialManager: React.FC = () => {
  const { openModal, closeModal, isVenueBound, hasEnteredGateway, activeModal } = useApp();
  const isRunning = useRef(false);

  const startTutorial = useCallback(() => {
    if (isRunning.current) return;
    isRunning.current = true;

    const driverObj = driver({
      showProgress: true,
      allowClose: true,
      animate: true,
      smoothScroll: true,
      overlayOpacity: 0.65,
      stagePadding: 6,
      stageRadius: 18,
      popoverClass: 'mk-tour',
      doneBtnText: 'Tamam',
      nextBtnText: 'İleri',
      prevBtnText: 'Geri',
      progressText: '{{current}} / {{total}}',
      onDestroyStarted: () => {
        driverObj.destroy();
        localStorage.setItem('muzikors_tutorial_completed', 'true');
        isRunning.current = false;
      },
      steps: [
        {
          element: '#tour-add-song',
          popover: {
            title: 'Şarkını iste',
            description: "Buradan şarkı arayıp sıraya eklersin. Üstteki sayı bugün kalan şarkı hakkın; hakların her gece 00:00'da yenilenir.",
            side: 'top',
            align: 'center',
            onNextClick: () => {
              openModal('search');
              // Pencere açılınca sonraki adıma geçilir
              setTimeout(() => driverObj.moveNext(), 450);
            },
          },
        },
        {
          element: '#tour-search-input',
          popover: {
            title: 'Ara ve dinle',
            description: 'Şarkıya dokun, önizlemesini dinle ve sıraya ekle. Sıradaki şarkıları ana ekrandan oylayabilirsin.',
            side: 'bottom',
            align: 'center',
            onNextClick: () => {
              closeModal();
              setTimeout(() => driverObj.moveNext(), 350);
            },
            onPrevClick: () => {
              closeModal();
              setTimeout(() => driverObj.movePrevious(), 350);
            },
          },
        },
        {
          element: '#tour-qr-button',
          popover: {
            title: 'Mekân değiştir',
            description: 'Başka bir mekâna geçtiğinde masadaki QR kodu buradan okut.',
            side: 'bottom',
            align: 'end',
          },
        },
      ],
    });

    driverObj.drive();
  }, [openModal, closeModal]);

  useEffect(() => {
    // Yalnızca mekâna bağlıyken, karşılama ekranı geçildiyse ve açık pencere yokken
    if (!isVenueBound || !hasEnteredGateway || activeModal !== 'none') return;
    if (localStorage.getItem('muzikors_tutorial_completed') || isRunning.current) return;

    const timer = setTimeout(startTutorial, 1500);
    return () => clearTimeout(timer);
  }, [isVenueBound, hasEnteredGateway, activeModal, startTutorial]);

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
      .driver-popover.mk-tour {
        background: var(--theme-card);
        color: #fff;
        border: 1px solid rgba(255, 255, 255, 0.08);
        border-radius: 22px;
        box-shadow: 0 18px 50px rgba(0, 0, 0, 0.55);
        padding: 18px;
        max-width: 300px;
        font-family: inherit;
      }
      .driver-popover.mk-tour .driver-popover-title {
        font-size: 17px;
        font-weight: 700;
        color: #fff;
        margin-bottom: 6px;
      }
      .driver-popover.mk-tour .driver-popover-description {
        font-size: 14px;
        line-height: 1.55;
        color: rgba(255, 255, 255, 0.68);
      }
      .driver-popover.mk-tour .driver-popover-footer { margin-top: 16px; }
      .driver-popover.mk-tour .driver-popover-progress-text { color: rgba(255, 255, 255, 0.4); font-size: 12px; }
      .driver-popover.mk-tour button.driver-popover-next-btn,
      .driver-popover.mk-tour button.driver-popover-prev-btn {
        border: none;
        text-shadow: none;
        border-radius: 12px;
        padding: 8px 14px;
        font-size: 13px;
        font-weight: 700;
      }
      .driver-popover.mk-tour button.driver-popover-next-btn { background: var(--theme-primary); color: #000; }
      .driver-popover.mk-tour button.driver-popover-prev-btn { background: rgba(255, 255, 255, 0.08); color: #fff; }
      .driver-popover.mk-tour .driver-popover-close-btn { color: rgba(255, 255, 255, 0.45); }
      .driver-popover.mk-tour .driver-popover-arrow-side-top { border-top-color: var(--theme-card); }
      .driver-popover.mk-tour .driver-popover-arrow-side-bottom { border-bottom-color: var(--theme-card); }
      .driver-popover.mk-tour .driver-popover-arrow-side-left { border-left-color: var(--theme-card); }
      .driver-popover.mk-tour .driver-popover-arrow-side-right { border-right-color: var(--theme-card); }
    `,
      }}
    />
  );
};
