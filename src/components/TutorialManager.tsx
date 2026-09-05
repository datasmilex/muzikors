'use client';

import React, { useEffect, useRef, useCallback } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';

export const TutorialManager: React.FC = () => {
  const { user, openModal, showToast, isVenueBound, hasEnteredGateway, activeModal } = useApp();
  const driverRef = useRef<any>(null);
  const isRunning = useRef(false);

  const startTutorial = useCallback(() => {
    if (isRunning.current) return;
    isRunning.current = true;

    const driverObj = driver({
      showProgress: true,
      allowClose: true,
      animate: true,
      doneBtnText: 'Bitir',
      nextBtnText: 'İleri',
      prevBtnText: 'Geri',
      progressText: '{{current}} / {{total}}',
      onDestroyStarted: () => {
        if (!driverObj.hasNextStep() || confirm('Tanıtımı atlamak istediğinize emin misiniz?')) {
          driverObj.destroy();
          localStorage.setItem('muzikors_tutorial_completed', 'true');
          isRunning.current = false;
        }
      },
      steps: [
        {
          element: '#tour-qr-button',
          popover: {
            title: 'Mekanlara Bağlan',
            description: 'Kafeye bağlanmak için masandaki QR kodu okutabilir veya "Keşfet" menüsünden bulunduğun kafeyi bulabilirsin.',
            side: 'top',
            align: 'center'
          }
        },
        {
          element: '#tour-wallet-button',
          popover: {
            title: 'Kullanım Hakları',
            description: '<div class="space-y-3"><p>Muzikors tamamen ücretsizdir!</p><p>Buradan kalan günlük şarkı açma, beğenme ve diğer etkileşim haklarını anlık olarak takip edebilirsin.</p><p class="text-[10px] text-amber-200/50">Hakların her gece 00:00\'da sıfırlanır.</p></div>',
            side: 'left',
            align: 'start'
          }
        },
        {
          element: '#tour-add-song',
          popover: {
            title: 'Şarkı Ekle',
            description: 'Mekana bağlandıktan sonra bu butona tıklayarak şarkı arama ekranını açabilirsin.',
            side: 'top',
            align: 'center',
            onNextClick: () => {
              openModal('search');
              // Wait for modal animation before moving next
              setTimeout(() => {
                driverObj.moveNext();
              }, 400);
            }
          }
        },
        {
          element: '#tour-search-input',
          popover: {
            title: 'Şarkı Arama',
            description: 'Dilediğin şarkıyı seç, sıraya ekle ve herkes dinlesin! (Şarkı seçmek zorunlu değil, tanıtımı burada bitirebilirsin)',
            side: 'bottom',
            align: 'center'
          }
        }
      ]
    });

    driverRef.current = driverObj;
    driverObj.drive();
  }, [openModal]);

  useEffect(() => {
    // Only run if the user has bound to a venue, entered gateway, AND no modal is open
    if (!isVenueBound || !hasEnteredGateway || activeModal !== 'none') return;

    // Only run once per session/device if not completed
    const hasCompleted = localStorage.getItem('muzikors_tutorial_completed');
    if (hasCompleted || isRunning.current) return;

    // Small delay to ensure DOM is ready and main screen is fully visible
    const timer = setTimeout(() => {
      startTutorial();
    }, 1500);

    return () => clearTimeout(timer);
  }, [user, isVenueBound, hasEnteredGateway, activeModal, startTutorial]);

  return (
    <style dangerouslySetInnerHTML={{ __html: `
      @keyframes slideFadeIn {
        from { opacity: 0; transform: translateY(20px) scale(0.95); }
        to { opacity: 1; transform: translateY(0) scale(1); }
      }
      .driver-popover {
        background-color: #120C08 !important;
        color: #FCEFD5 !important;
        border: 1px solid rgba(212, 175, 55, 0.2) !important;
        border-radius: 1.5rem !important;
        box-shadow: 0 10px 40px rgba(212, 175, 55, 0.15) !important;
        padding: 1.5rem !important;
        animation: slideFadeIn 0.5s cubic-bezier(0.16, 1, 0.3, 1) forwards !important;
      }
      .driver-popover-title {
        color: #D4AF37 !important;
        font-weight: 900 !important;
        font-size: 1.25rem !important;
        margin-bottom: 0.5rem !important;
      }
      .driver-popover-description {
        color: #FCEFD5 !important;
        font-size: 0.95rem !important;
        opacity: 0.9;
        line-height: 1.5;
      }
      .driver-popover-footer {
        margin-top: 1rem !important;
      }
      .driver-popover-next-btn, .driver-popover-prev-btn {
        background-color: #D4AF37 !important;
        color: #000 !important;
        border-radius: 0.75rem !important;
        font-weight: 800 !important;
        text-shadow: none !important;
        border: none !important;
        padding: 0.5rem 1rem !important;
      }
      .driver-popover-prev-btn {
        background-color: #1C130D !important;
        color: #D4AF37 !important;
        border: 1px solid rgba(212, 175, 55, 0.3) !important;
      }
      .driver-popover-close-btn {
        color: rgba(252, 239, 213, 0.5) !important;
      }
      .driver-popover-close-btn:hover {
        color: #fff !important;
      }
      .driver-popover-progress-text {
        color: rgba(212, 175, 55, 0.8) !important;
        font-weight: bold !important;
      }
      div[class*="driver-popover-arrow-side-top"] {
        border-top-color: #120C08 !important;
      }
      div[class*="driver-popover-arrow-side-bottom"] {
        border-bottom-color: #120C08 !important;
      }
      div[class*="driver-popover-arrow-side-left"] {
        border-left-color: #120C08 !important;
      }
      div[class*="driver-popover-arrow-side-right"] {
        border-right-color: #120C08 !important;
      }
    `}} />
  );
};
