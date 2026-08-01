const fs = require('fs');
const file = 'C:\\Muzikors\\Kullanıcı Tarafı\\src\\components\\MusicSearchModal.tsx';
let content = fs.readFileSync(file, 'utf8');

// Update item wrapper and selection logic
const targetItemDiv = `<div
                        onClick={() => !isBlocked && setSelectedTrack(track)}
                        className={\`rounded-[1.25rem] p-2 flex items-center justify-between border transition-all duration-300 \${
                          isBlocked
                            ? 'bg-black/40 opacity-50 border-red-500/10'
                            : isSelected
                            ? 'bg-gradient-to-r from-[#241911] to-[#1C130D] border-[#D4AF37]/50 shadow-[0_5px_15px_rgba(212,175,55,0.15)] scale-[1.01] cursor-pointer'
                            : 'bg-white/5 border-transparent hover:border-white/10 hover:bg-white/10 cursor-pointer'
                        }\`}
                      >`;

const replacementItemDiv = `<div
                        onClick={() => {
                          if (isBlocked || cooldown.active || !canAfford || submittingTrackId === track.id) return;
                          setSelectedTrack(track);
                          handleConfirmRequest(track);
                        }}
                        className={\`rounded-[1.2rem] p-2 flex items-center justify-between border transition-all duration-300 \${
                          isBlocked
                            ? 'bg-black/40 opacity-50 border-red-500/10'
                            : 'bg-white/5 border-white/5 hover:border-[#D4AF37]/30 hover:bg-[#1C130D]/60 hover:shadow-[0_4px_15px_rgba(212,175,55,0.1)] cursor-pointer'
                        }\`}
                      >`;

content = content.replace(targetItemDiv, replacementItemDiv);

// Make album art slightly bigger (from w-10 h-10 to w-11 h-11)
content = content.replace(
  'className="relative w-10 h-10 rounded-[0.6rem] overflow-hidden shrink-0 shadow-sm border border-white/5"',
  'className="relative w-11 h-11 rounded-[0.7rem] overflow-hidden shrink-0 shadow-md border border-white/10 group-hover:border-[#D4AF37]/40 transition-colors"'
);

// Right side logic replacement (remove SEÇ button, show cost)
const targetRightSideStart = `{/* Right side: Duration + Action Button */}`;
const targetRightSideEnd = `</div>
                      </div>
                    </div>`;

// Find the block from targetRightSideStart to targetRightSideEnd
const startIndex = content.indexOf(targetRightSideStart);
const endIndex = content.indexOf(targetRightSideEnd, startIndex) + targetRightSideEnd.length;

if (startIndex !== -1 && endIndex !== -1) {
  const replacementRightSide = `{/* Right side: Cost Info */}
                        <div className="flex flex-col items-end justify-center shrink-0 pr-2">
                          {isExplicitBlocked ? (
                            <span className="text-[9px] text-red-400 font-bold uppercase tracking-wider bg-red-400/10 px-2 py-1 rounded-md">Engelli</span>
                          ) : finalCost === null ? (
                            <span className="text-[9px] text-red-400 font-bold uppercase tracking-wider bg-red-400/10 px-2 py-1 rounded-md">&gt;7 Dk</span>
                          ) : (
                            <div className="flex flex-col items-end gap-0.5">
                              {/* Cost Display */}
                              <div className="flex items-center gap-1.5">
                                {isHappyHourActive && baseCost !== finalCost && (
                                  <span className="text-[10px] text-gray-500 font-bold line-through">
                                    {baseCost}
                                  </span>
                                )}
                                <span className={\`text-xs font-black drop-shadow-md \${canAfford ? 'text-[#D4AF37]' : 'text-red-400'}\`}>
                                  {finalCost} <span className="text-[9px] opacity-80 uppercase tracking-wider">Kr.</span>
                                </span>
                              </div>
                              
                              {/* Happy hour discount badge if applicable */}
                              {isHappyHourActive && baseCost !== finalCost && (
                                <span className="text-[8px] font-black text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded shadow-sm">
                                  %{(hhDiscount * 100).toFixed(0)} HH İndirimi
                                </span>
                              )}
                              
                              {/* Duration display instead of separate text */}
                              {!isHappyHourActive && durMs > 0 && (
                                <span className="text-[9px] font-semibold text-gray-500 tracking-wider">
                                  {formatDuration(durMs)}
                                </span>
                              )}
                              
                              {submittingTrackId === track.id && (
                                <Loader2 className="w-3 h-3 text-[#D4AF37] animate-spin mt-1" />
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>`;
  content = content.substring(0, startIndex) + replacementRightSide + content.substring(endIndex);
} else {
  console.log("Could not find right side block");
}

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed music search modal UI');
