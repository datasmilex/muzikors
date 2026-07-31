const fs = require('fs');
const file = 'C:\\Muzikors\\Kullanıcı Tarafı\\src\\components\\DailyRewardModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `<p className="text-[13px] text-amber-200/60 font-medium mb-8 leading-relaxed relative z-10 px-2">
            {isButtonDisabled
              ? "Bugünkü ödülünü aldın! Yarın tekrar bekleriz."
              : "Her gün giriş yap, bedava kredileri topla! Hemen +2 Kredini al."}
          </p>

          <button
            disabled={isButtonDisabled || isClaiming}
            onClick={handleClaimReward}
            className={\`w-full py-4 px-4 rounded-[1.5rem] font-black text-base flex items-center justify-center gap-3 transition-all duration-300 relative z-10 shadow-[0_10px_30px_rgba(212,175,55,0.2)] group
              \${isButtonDisabled
                ? 'bg-zinc-900 border border-zinc-800 text-zinc-500 cursor-not-allowed shadow-none'
                : 'gold-gradient-bg text-stone-950 hover:brightness-110 hover:scale-[1.02] active:scale-95'
              }
            \`}
          >
            {isClaiming ? (
              <span className="animate-pulse tracking-wide">Bekleniyor...</span>
            ) : isButtonDisabled ? (
              <>
                <Clock className="w-5 h-5" />
                <span className="font-mono tracking-widest text-sm">
                  {timeLeft !== null ? formatTime(timeLeft) : '00:00:00'}
                </span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="tracking-wide">Günlük Ödülünü Al</span>
              </>
            )}
          </button>`;

const replaceStr = `<p className="text-[13px] text-amber-200/60 font-medium mb-4 leading-relaxed relative z-10 px-2">
            {isButtonDisabled
              ? "Bugünkü ödülünü aldın! Bir sonraki ödüle kalan süre:"
              : "Her gün giriş yap, bedava kredileri topla! Hemen +2 Kredini al."}
          </p>

          {isButtonDisabled && (
            <div className="flex items-center justify-center gap-2 mb-6 z-10 relative">
               <Clock className="w-5 h-5 text-[#D4AF37] animate-pulse" />
               <span className="font-mono font-black text-2xl text-white tracking-widest drop-shadow-md">
                 {timeLeft !== null ? formatTime(timeLeft) : '00:00:00'}
               </span>
            </div>
          )}

          <button
            disabled={isButtonDisabled || isClaiming}
            onClick={handleClaimReward}
            className={\`w-full py-4 px-4 rounded-[1.5rem] font-black text-base flex items-center justify-center gap-3 transition-all duration-300 relative z-10 shadow-[0_10px_30px_rgba(212,175,55,0.2)] group
              \${isButtonDisabled
                ? 'bg-white/5 border border-white/10 text-zinc-500 cursor-not-allowed shadow-none'
                : 'gold-gradient-bg text-stone-950 hover:brightness-110 hover:scale-[1.02] active:scale-95'
              }
            \`}
          >
            {isClaiming ? (
              <span className="animate-pulse tracking-wide">Bekleniyor...</span>
            ) : isButtonDisabled ? (
              <>
                <span className="tracking-wide">Yarın Görüşürüz 👋</span>
              </>
            ) : (
              <>
                <Sparkles className="w-5 h-5 group-hover:scale-110 transition-transform" />
                <span className="tracking-wide">Günlük Ödülünü Al</span>
              </>
            )}
          </button>`;

content = content.replace(targetStr, replaceStr);
fs.writeFileSync(file, content, 'utf8');
console.log('Fixed daily reward modal UI');
