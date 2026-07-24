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
    if (activeModal !== 'qr') return;

    let mediaStream: MediaStream | null = null;
    let animFrameId: number | null = null;
    setStreamError(null);
    isScanningRef.current = true;

    // Helper: Select optimal standard back camera to prevent macro/wide-angle lens issues
    const getOptimalConstraints = async (): Promise<MediaStreamConstraints> => {
      if (!navigator?.mediaDevices?.enumerateDevices) {
        return { video: { facingMode: { exact: 'environment' } } };
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
          return { video: { deviceId: { exact: standardBackCamera.deviceId } } };
        }
      } catch (err) {
        console.warn('[Camera Enumeration Warning]', err);
      }

      return { video: { facingMode: { exact: 'environment' } } };
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
            });
          } catch (fallbackErr) {
            console.error('[Rear Camera Fallback Error]', fallbackErr);
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

  if (activeModal !== 'qr') return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeModal}
          className="fixed inset-0 bg-black/90 backdrop-blur-2xl"
        />

        {/* Camera Viewfinder */}
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9 }}
          className="relative w-full max-w-sm bg-[#120C08] border-2 border-[#D4AF37]/50 rounded-[32px] p-6 z-10 shadow-2xl overflow-hidden text-center"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#D4AF37]/20 mb-4">
            <div className="flex items-center gap-2 text-[#D4AF37]">
              <QrCode className="w-5 h-5" />
              <h2 className="text-sm font-bold text-white">Masa QR Kodunu Tara</h2>
            </div>
            <button
              onClick={closeModal}
              className="w-8 h-8 rounded-full bg-[#1C130D] border border-[#D4AF37]/30 flex items-center justify-center text-amber-200 hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Direct Camera Video Stream Container */}
          <div className="relative w-64 h-64 mx-auto rounded-3xl overflow-hidden border-2 border-[#D4AF37]/60 bg-[#1C130D] flex items-center justify-center shadow-inner my-2">
            <video
              ref={videoRef}
              playsInline
              muted
              className="w-full h-full object-cover"
            />

            {/* Corner guides */}
            <div className="absolute top-3 left-3 w-6 h-6 border-t-4 border-l-4 border-[#D4AF37] rounded-tl-lg pointer-events-none z-10" />
            <div className="absolute top-3 right-3 w-6 h-6 border-t-4 border-r-4 border-[#D4AF37] rounded-tr-lg pointer-events-none z-10" />
            <div className="absolute bottom-3 left-3 w-6 h-6 border-b-4 border-l-4 border-[#D4AF37] rounded-bl-lg pointer-events-none z-10" />
            <div className="absolute bottom-3 right-3 w-6 h-6 border-b-4 border-r-4 border-[#D4AF37] rounded-br-lg pointer-events-none z-10" />

            {/* Laser Line Overlay */}
            <div className="absolute left-0 right-0 h-0.5 bg-[#D4AF37] shadow-[0_0_15px_#D4AF37] animate-pulse my-auto top-0 bottom-0 pointer-events-none z-10" />

            {streamError && (
              <div className="absolute inset-0 bg-[#120C08]/90 flex flex-col items-center justify-center p-4 text-center z-20">
                <AlertCircle className="w-8 h-8 text-amber-400 mb-2" />
                <p className="text-xs text-amber-200/80 font-medium">{streamError}</p>
              </div>
            )}
          </div>

          <p className="text-xs text-amber-200/70 font-medium mt-3">
            Masadaki Muzikors QR kodunu kutucuğun içine getirerek taratın.
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
