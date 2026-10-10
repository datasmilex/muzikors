'use client';

import React, { useState, useEffect, useRef } from 'react';
import { AlertCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import jsQR from 'jsqr';
import { Sheet } from './ui/Sheet';
import { triggerHaptic } from '../../utils/haptics';

export const QrScannerModal: React.FC = () => {
  const { activeModal, closeModal, bindVenueById } = useApp();
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
      // Default to the OS's primary rear camera (1x) rather than manually parsing device labels 
      // which often selects the ultra-wide lens by mistake on modern Android devices.
      return { video: { facingMode: 'environment' }, audio: false };
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
          try {
            await videoRef.current.play();
            setIsCameraReady(true);
          } catch (playErr) {
            console.error('[Video Play Error]', playErr);
          }
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
                  triggerHaptic('success');
                  bindVenueById(venueId);
                  closeModal();
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
  }, [activeModal, bindVenueById, closeModal]);

  

  return (
    <Sheet open={activeModal === 'qr'} onClose={closeModal} title="QR kodu okut" width="sm">
      <div className="pb-2">
        <div className="relative w-full max-w-[300px] aspect-square mx-auto rounded-[28px] overflow-hidden bg-black">
          <video ref={videoRef} playsInline muted className="w-full h-full object-cover" />

          {/* Vizör köşeleri */}
          <div className="absolute inset-6 pointer-events-none" aria-hidden="true">
            <span className="absolute top-0 left-0 w-8 h-8 border-t-[3px] border-l-[3px] border-white/85 rounded-tl-2xl" />
            <span className="absolute top-0 right-0 w-8 h-8 border-t-[3px] border-r-[3px] border-white/85 rounded-tr-2xl" />
            <span className="absolute bottom-0 left-0 w-8 h-8 border-b-[3px] border-l-[3px] border-white/85 rounded-bl-2xl" />
            <span className="absolute bottom-0 right-0 w-8 h-8 border-b-[3px] border-r-[3px] border-white/85 rounded-br-2xl" />
          </div>

          {!isCameraReady && !streamError && (
            <div className="absolute inset-0 grid place-items-center bg-black">
              <span className="w-7 h-7 rounded-full border-2 border-white/20 border-t-white/80 animate-spin" aria-label="Kamera açılıyor" />
            </div>
          )}
        </div>

        {streamError ? (
          <div className="mt-5 flex items-start gap-3 rounded-2xl bg-red-500/[0.1] px-4 py-3 text-[13px] text-red-200">
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <span>{streamError}</span>
          </div>
        ) : (
          <p className="mt-5 text-center text-[14px] text-white/60 leading-relaxed max-w-[280px] mx-auto">
            Masadaki QR kodu çerçevenin içine getir; otomatik olarak bağlanırsın.
          </p>
        )}
      </div>

      <canvas ref={canvasRef} className="hidden" />
    </Sheet>
  );
};
