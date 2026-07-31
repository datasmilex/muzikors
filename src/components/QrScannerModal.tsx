'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { QrCode, X, AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import jsQR from 'jsqr';

export const QrScannerModal: React.FC = () => {
  const { activeModal, closeModal, bindVenueById, showToast } = useApp();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [streamError, setStreamError] = useState<string | null>(null);
  const isScanningRef = useRef<boolean>(false);

  useEffect(() => {
    

    let mediaStream: MediaStream | null = null;
    let animFrameId: number | null = null;
    setStreamError(null);
    isScanningRef.current = true;

    // Helper: Select optimal standard back camera to prevent macro/wide-angle lens issues
    const getOptimalConstraints = async (): Promise<MediaStreamConstraints> => {
      if (!navigator?.mediaDevices?.enumerateDevices) {
        return { video: { facingMode: { exact: 'environment' } }, audio: false };
      }

      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === 'videoinput');

        // Prefer standard back/rear camera over ultra-wide or macro
        const standardBackCamera = videoDevices.find((d) => {
          const lbl = d.label.toLowerCase();
          return (
            (lbl.includes('back') || lbl.includes('rear') || lbl.includes('0') || lbl.includes('1')) &&
            !lbl.includes('front') &&
            !lbl.includes('user') &&
            !lbl.includes('selfie') &&
            !lbl.includes('wide') &&
            !lbl.includes('ultra') &&
            !lbl.includes('macro') &&
            !lbl.includes('depth') &&
            !lbl.includes('telephoto')
          );
        }) || videoDevices.find((d) => {
          const lbl = d.label.toLowerCase();
          return (lbl.includes('back') || lbl.includes('rear')) && !lbl.includes('front');
        });

        if (standardBackCamera && standardBackCamera.deviceId) {
          return { video: { deviceId: { exact: standardBackCamera.deviceId } }, audio: false };
        }
      } catch (err) {
        console.warn('[Camera Enumeration Warning]', err);
      }

      return { video: { facingMode: { exact: 'environment' } }, audio: false };
    };

    const startCameraAndScan = async () => {
      try {
        if (!navigator?.mediaDevices?.getUserMedia) {
          setStreamError('Cihazınız kamera erişimini desteklemiyor.');
          return;
        }

        let stream: MediaStream | null = null;

        try {
          const constraints = await getOptimalConstraints();
          stream = await navigator.mediaDevices.getUserMedia(constraints);
        } catch {
          // Fallback to basic environment facingMode constraint
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: { facingMode: 'environment' },
              audio: false
            });
          } catch (fallbackErr) {
            console.warn('[Rear Camera Fallback] Device not found or inaccessible.');
          }
        }

        if (!stream) {
          setStreamError('Arka kamera bulunamadı veya erişilemedi.');
          return;
        }

        // Verify stream does NOT use front/user camera
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          const settings = videoTrack.getSettings();
          if (settings.facingMode === 'user') {
            videoTrack.stop();
            setStreamError('Ön kamera algılandı. Lütfen arka kameranızı kullanın.');
            return;
          }
        }

        mediaStream = stream;

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          await videoRef.current.play();
        }

        // Frame scanner loop
        const scanFrame = () => {
          if (!isScanningRef.current) return;

          const video = videoRef.current;
          if (video && video.readyState === video.HAVE_ENOUGH_DATA) {
            let canvas = canvasRef.current;
            if (!canvas) {
              canvas = document.createElement('canvas');
              canvasRef.current = canvas;
            }

            const width = video.videoWidth;
            const height = video.videoHeight;
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d', { willReadFrequently: true });
            if (ctx) {
              ctx.drawImage(video, 0, 0, width, height);
              const imageData = ctx.getImageData(0, 0, width, height);
              const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
                inversionAttempts: 'dontInvert',
              });

              if (qrCode && qrCode.data) {
                const rawResult = qrCode.data.trim();
                console.log('[QR Code Detected]:', rawResult);

                // Parse venue_id from URL or raw number
                let venueId: string | null = null;
                try {
                  if (rawResult.includes('?v=')) {
                    venueId = new URLSearchParams(rawResult.split('?')[1]).get('v');
                  } else if (rawResult.includes('v=')) {
                    const match = rawResult.match(/v=(\d+)/);
                    if (match) venueId = match[1];
                  } else if (/^\d+$/.test(rawResult)) {
                    venueId = rawResult;
                  }
                } catch {
                  if (/^\d+$/.test(rawResult)) venueId = rawResult;
                }

                if (venueId) {
                  isScanningRef.current = false;
                  bindVenueById(venueId);
                  closeModal();
                  showToast('Mekana başarıyla bağlandınız!');
                  return;
                }
              }
            }
          }

          if (isScanningRef.current) {
            animFrameId = requestAnimationFrame(scanFrame);
          }
        };

        animFrameId = requestAnimationFrame(scanFrame);
      } catch (err: any) {
        console.error('[Camera Error]', err);
        setStreamError('Kamera izni verilemedi veya cihaz kamerası bulunamadı.');
      }
    };

    startCameraAndScan();

    return () => {
      isScanningRef.current = false;
      if (animFrameId) cancelAnimationFrame(animFrameId);
      if (mediaStream) {
        mediaStream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [activeModal, bindVenueById, closeModal, showToast]);

  

  return (
    <AnimatePresence>
      {activeModal === 'qr' && (<>

      {activeModal === 'qr' && (<>

      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Cinematic Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ duration: 0.4 }}
          onClick={closeModal}
          className="fixed inset-0 bg-black/80 backdrop-blur-2xl"
        />

        {/* Camera Viewfinder */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ type: 'spring', damping: 22, stiffness: 200, bounce: 0.2 }}
          className="relative w-full max-w-sm bg-[#120C08] border border-[#D4AF37]/30 rounded-3xl p-5 z-10 shadow-[0_20px_50px_rgba(212,175,55,0.15)] overflow-hidden text-center glass-panel-gold"
        >
          {/* Decorative Glow */}
          <div className="absolute top-0 right-0 w-40 h-40 bg-[#D4AF37]/10 blur-3xl rounded-full pointer-events-none" />

          <div className="flex items-center justify-between pb-4 border-b border-[#D4AF37]/20 mb-6 relative z-10">
            <div className="flex items-center gap-3 text-[#D4AF37]">
              <div className="w-10 h-10 rounded-xl bg-[#D4AF37]/10 border border-[#D4AF37]/30 flex items-center justify-center shadow-inner">
                <QrCode className="w-5 h-5 drop-shadow-md" />
              </div>
              <h2 className="text-lg font-black text-white tracking-tight drop-shadow-md">Masa QR Kodunu Tara</h2>
            </div>
            <button
              onClick={closeModal}
              className="p-2.5 rounded-full bg-white/5 hover:bg-white/10 hover:rotate-90 text-zinc-400 hover:text-white transition-all duration-300"
              aria-label="Kapat"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Direct Camera Video Stream Container */}
          <div className="relative w-64 h-64 mx-auto rounded-[2rem] overflow-hidden border-4 border-[#D4AF37]/40 bg-[#1C130D] flex items-center justify-center shadow-[0_0_30px_rgba(212,175,55,0.2)] my-2 relative z-10">
            <video
              ref={videoRef}
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Corner guides */}
            <div className="absolute top-4 left-4 w-8 h-8 border-t-4 border-l-4 border-[#D4AF37] rounded-tl-xl pointer-events-none z-10" />
            <div className="absolute top-4 right-4 w-8 h-8 border-t-4 border-r-4 border-[#D4AF37] rounded-tr-xl pointer-events-none z-10" />
            <div className="absolute bottom-4 left-4 w-8 h-8 border-b-4 border-l-4 border-[#D4AF37] rounded-bl-xl pointer-events-none z-10" />
            <div className="absolute bottom-4 right-4 w-8 h-8 border-b-4 border-r-4 border-[#D4AF37] rounded-br-xl pointer-events-none z-10" />

            {/* Laser Line Overlay */}
            <div className="absolute left-4 right-4 h-0.5 bg-[#D4AF37] shadow-[0_0_15px_#D4AF37] animate-pulse my-auto top-0 bottom-0 pointer-events-none z-10" />

            {streamError && (
              <div className="absolute inset-0 bg-[#120C08]/95 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center z-20">
                <AlertCircle className="w-10 h-10 text-[#D4AF37] mb-3 animate-bounce" />
                <p className="text-xs text-amber-200/90 font-black uppercase tracking-wider">{streamError}</p>
              </div>
            )}
          </div>

          <p className="text-xs text-amber-200/70 font-bold mt-6 tracking-wide px-4 relative z-10">
            Masadaki Muzikors QR kodunu kutucuğun içine getirerek taratın.
          </p>
        </motion.div>
      </div>
    
      </>)}
    
      </>)}
    </AnimatePresence>
  );
};
