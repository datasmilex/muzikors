'use client';

import React, { useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, ShieldCheck } from 'lucide-react';
import { useApp } from '../context/AppContext';

export const IyzicoPaymentModal: React.FC = () => {
  const { activeModal, closeModal, iyzicoHtml } = useApp();

  // Iyzico formu yüklendiğinde içerisindeki <script> etiketlerinin çalıştırılması gerekebilir.
  // dangerouslySetInnerHTML ile doğrudan yerleştirildiğinde React script'leri çalıştırmaz.
  // Bu nedenle useEffect ile scriptleri manuel olarak eklemeliyiz.
  useEffect(() => {
    if (activeModal === 'iyzico' && iyzicoHtml) {
      const container = document.getElementById('iyzico-container');
      if (container) {
        // Önce içeriği temizle
        container.innerHTML = '';
        
        // Geçici bir dive HTML'i atalım
        const tempDiv = document.createElement('div');
        tempDiv.innerHTML = iyzicoHtml;
        
        // Tüm elementleri tek tek kopyalayarak script'leri aktifleştirelim
        Array.from(tempDiv.childNodes).forEach(node => {
          if (node.nodeName === 'SCRIPT') {
            const script = document.createElement('script');
            const sourceNode = node as HTMLScriptElement;
            if (sourceNode.src) {
              script.src = sourceNode.src;
            } else {
              script.innerHTML = sourceNode.innerHTML;
            }
            container.appendChild(script);
          } else {
            container.appendChild(node.cloneNode(true));
          }
        });
      }
    }
  }, [activeModal, iyzicoHtml]);

  return (
    <AnimatePresence>
      {activeModal === 'iyzico' && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center p-4">
          {/* Cinematic Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            onClick={closeModal}
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
          />

          {/* Modal Container */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            transition={{ type: 'tween', duration: 0.2, ease: [0.25, 0.46, 0.45, 0.94] }}
            className="relative w-full max-w-md bg-white rounded-3xl p-0 z-10 shadow-[0_15px_40px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col max-h-[90vh]"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 bg-[#120C08] border-b border-[#D4AF37]/20">
              <div className="flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#10b981]" />
                <h2 className="text-sm font-black text-white tracking-tight">Iyzico Güvenli Ödeme</h2>
              </div>
              <button
                onClick={closeModal}
                className="p-1.5 rounded-full bg-white/10 active:bg-white/20 text-gray-300 transition-all duration-300"
                aria-label="Kapat"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Iyzico Form Container */}
            <div className="w-full flex-1 overflow-y-auto bg-white min-h-[400px] relative p-4 flex flex-col justify-center">
              {!iyzicoHtml && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400">
                  <div className="w-8 h-8 border-4 border-gray-200 border-t-emerald-500 rounded-full animate-spin mb-4" />
                  <p className="text-sm font-semibold">Ödeme formu yükleniyor...</p>
                </div>
              )}
              
              <div id="iyzico-container" className="w-full h-full" />
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
