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
  const [isCameraReady, setIsCameraReady] = useState<boolean>(false);
  const isScanningRef = useRef<boolean>(false);

  useEffect(() => {
    if (activeModal !== 'qr') return;

    let mediaStream: MediaStream | null = null;
    let animFrameId: number | null = null;
    setStreamError(null);
    setIsCameraReady(false);
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
          videoRef.current.onloadedmetadata = async () => {
            await videoRef.current?.play();
            setIsCameraReady(true);
          };
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
      {activeModal === 'qr' && (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
        {/* Cinematic Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ duration: 0.4 }}
          onClick={closeModal}
          className="fixed inset-0 bg-black/85 backdrop-blur-xl"
        />

        {/* Premium Compact Card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="relative w-full max-w-sm bg-gradient-to-b from-[#1C130D] to-black border border-[#D4AF37]/20 rounded-[2rem] p-6 z-10 shadow-[0_0_50px_rgba(212,175,55,0.1)] overflow-hidden flex flex-col"
        >
          {/* Subtle Cyberpunk/Futuristic Glow */}
          <div className="absolute -top-20 -right-20 w-48 h-48 bg-[#D4AF37]/10 blur-3xl rounded-full pointer-events-none" />

          {/* Header Row */}
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center gap-2">
              <QrCode className="w-5 h-5 text-[#D4AF37]" />
              <span className="text-[10px] font-black text-[#D4AF37] tracking-[0.2em] uppercase">QR Tarayıcı</span>
            </div>
            <button
              onClick={closeModal}
              className="p-1.5 rounded-full bg-white/5 active:bg-white/10 text-gray-400 active:text-white transition-all backdrop-blur-md"
              aria-label="Kapat"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Direct Camera Video Stream Container */}
          <div className="relative w-64 h-64 mx-auto rounded-3xl overflow-hidden bg-black flex items-center justify-center shadow-inner mb-6 relative z-10 border border-white/10">
            <video
              ref={videoRef}
              playsInline
              muted
              className="w-full h-full object-cover scale-105"
            />

            {/* Corner guides - Minimal Apple Style */}
            <div className="absolute top-4 left-4 w-6 h-6 border-t-2 border-l-2 border-white/50 rounded-tl-xl pointer-events-none z-10" />
            <div className="absolute top-4 right-4 w-6 h-6 border-t-2 border-r-2 border-white/50 rounded-tr-xl pointer-events-none z-10" />
            <div className="absolute bottom-4 left-4 w-6 h-6 border-b-2 border-l-2 border-white/50 rounded-bl-xl pointer-events-none z-10" />
            <div className="absolute bottom-4 right-4 w-6 h-6 border-b-2 border-r-2 border-white/50 rounded-br-xl pointer-events-none z-10" />

            {/* Scanning Line overlay */}
            <div className="absolute left-0 right-0 h-[1px] bg-[#D4AF37] shadow-[0_0_8px_#D4AF37] animate-[scan_2s_ease-in-out_infinite] top-0 pointer-events-none z-10" />
            <style dangerouslySetInnerHTML={{__html: `
              @keyframes scan {
                0% { top: 0%; opacity: 0; }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% { top: 100%; opacity: 0; }
              }
            `}} />

            {!isCameraReady && !streamError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center bg-black text-white/50 z-20">
                <span className="w-5 h-5 border-2 border-t-transparent border-white rounded-full animate-spin mb-2" />
                <span className="text-[10px] font-bold tracking-widest uppercase">Kamera Başlatılıyor</span>
              </div>
            )}
          </div>

          {streamError ? (
            <div className="text-center relative z-10 mb-2">
              <div className="inline-flex items-center gap-2 bg-red-500/10 border border-red-500/30 text-red-400 px-4 py-3 rounded-2xl text-xs font-medium">
                <AlertCircle className="w-5 h-5 shrink-0" />
                <span>{streamError}</span>
              </div>
            </div>
          ) : (
            <div className="text-center relative z-10 mb-2">
              <p className="text-xs font-medium text-gray-400 max-w-[220px] mx-auto leading-relaxed">
                Mekanın QR kodunu kameraya okutarak masanıza bağlanın.
              </p>
            </div>
          )}

          {/* Hidden Canvas for QR processing */}
          <canvas ref={canvasRef} className="hidden" />
        </motion.div>
      </div>
      )}
    </AnimatePresence>
  );
};
