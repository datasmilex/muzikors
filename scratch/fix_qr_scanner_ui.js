const fs = require('fs');

const file = 'C:\\Muzikors\\Kullanıcı Tarafı\\src\\components\\QrScannerModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const newReturnBlock = `  return (
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
              className="p-1.5 rounded-full bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white transition-all backdrop-blur-md"
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
            <style dangerouslySetInnerHTML={{__html: \`
              @keyframes scan {
                0% { top: 0%; opacity: 0; }
                10% { opacity: 1; }
                90% { opacity: 1; }
                100% { top: 100%; opacity: 0; }
              }
            \`}} />

            {!videoRef.current?.srcObject && !streamError && (
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
`;

const startIndex = content.indexOf('  return (');
if (startIndex !== -1) {
  content = content.substring(0, startIndex) + newReturnBlock;
  fs.writeFileSync(file, content, 'utf8');
}
console.log('Fixed QrScannerModal UI');
