'use client';

import React, { useEffect, useRef } from 'react';
import { driver } from 'driver.js';
import 'driver.js/dist/driver.css';
import { useApp } from '../context/AppContext';
import { supabase } from '../lib/supabaseClient';

export const TutorialManager: React.FC = () => {
  const { user, openModal, showToast, fetchProfileCredits } = useApp();
  const driverRef = useRef<any>(null);
  const isRunning = useRef(false);

  useEffect(() => {
    // Only run once per session/device if not completed
    const hasCompleted = localStorage.getItem('muzikors_tutorial_completed');
    if (hasCompleted || isRunning.current) return;

    // Small delay to ensure DOM is ready
    const timer = setTimeout(() => {
      startTutorial();
    }, 1500);

    return () => clearTimeout(timer);
  }, [user]);

  const startTutorial = () => {
    if (isRunning.current) return;
    isRunning.current = true;

    const driverObj = driver({
      showProgress: true,
      allowClose: true,
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
            title: 'Mekanlara Bağlan 🎧',
            description: 'Kafeye bağlanmak için masandaki QR kodu okutabilir veya "Keşfet" menüsünden bulunduğun kafeyi bulabilirsin.',
            side: 'top',
            align: 'center'
          }
        },
        {
          element: '#tour-wallet-button',
          popover: {
            title: 'Cüzdan & Krediler 💳',
            description: '<div class="space-y-3"><p>Buradan mevcut kredilerini görebilir ve dilediğin şarkıyı açabilirsin!</p><p>Hemen başlaman için sana <b>Ücretsiz 10 Kredi</b> hediye ediyoruz!</p><button id="btn-claim-tutorial" class="w-full py-2 mt-2 bg-[#D4AF37] text-black font-black rounded-xl active:scale-95 transition-transform">🎁 10 Kredi Hediyeni Al!</button></div>',
            side: 'left',
            align: 'start',
            onPopoverRender: (popover) => {
              const btn = popover.wrapper.querySelector('#btn-claim-tutorial');
              if (btn) {
                btn.addEventListener('click', async () => {
                  if (!user) {
                    driverObj.destroy();
                    openModal('login');
                    showToast('Hediyeni almak için giriş yapmalısın!');
                    isRunning.current = false;
                    return;
                  }

                  // Simulate loading state
                  btn.innerHTML = 'Yükleniyor...';
                  btn.setAttribute('disabled', 'true');

                  try {
                    const { data, error } = await supabase.rpc('claim_tutorial_reward');
                    if (error) throw error;
                    
                    if (data?.success) {
                      showToast(data.message || '10 Promosyon Kredisi başarıyla yüklendi! 🎉');
                      fetchProfileCredits(user.id);
                      driverObj.moveNext();
                    } else {
                      showToast(data?.error || 'Ödül zaten alınmış.');
                      driverObj.moveNext();
                    }
                  } catch (err) {
                    console.error('Tutorial reward error:', err);
                    showToast('Bir hata oluştu.');
                    btn.innerHTML = '🎁 10 Kredi Hediyeni Al!';
                    btn.removeAttribute('disabled');
                  }
                });
              }
            }
          }
        },
        {
          element: '#tour-add-song',
          popover: {
            title: 'Şarkı Ekle 🎵',
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
            title: 'Şarkı Arama 🔍',
            description: 'Dilediğin şarkıyı seç, sıraya ekle ve herkes dinlesin! (Şarkı seçmek zorunlu değil, tanıtımı burada bitirebilirsin)',
            side: 'bottom',
            align: 'center'
          }
        }
      ]
    });

    driverRef.current = driverObj;
    driverObj.drive();
  };

  return null;
};
