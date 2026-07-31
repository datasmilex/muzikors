const fs = require('fs');
const path = require('path');
const file = 'C:\\Muzikors\\Kullanıcı Tarafı\\src\\components\\MusicSearchModal.tsx';
let content = fs.readFileSync(file, 'utf8');

// Replace the h-[92vh] with something slightly smaller as requested "Devasa olmasın"
content = content.replace(
  'className="relative w-full max-w-md h-[92vh] bg-[#120C08] sm:rounded-3xl rounded-t-3xl p-4 z-10 shadow-[0_-20px_50px_rgba(212,175,55,0.15)] flex flex-col justify-between overflow-hidden glass-panel-gold border border-[#D4AF37]/30"',
  'className="relative w-full max-w-md h-[85vh] max-h-[750px] bg-[#120C08] sm:rounded-3xl rounded-t-3xl p-4 z-10 shadow-[0_-20px_50px_rgba(212,175,55,0.15)] flex flex-col justify-between overflow-hidden glass-panel-gold border border-[#D4AF37]/30"'
);

// We need to replace from "return (" inside map to the closing of the map loop.
// The easiest is a regex replace.
const oldReturnBlockRegex = /return \(\s*<div\s*key=\{track\.id\}[\s\S]*?className={`relative group transition-all duration-500 hover:-translate-y-2 hover:z-50 \$\{idx !== 0 \? '-mt-3' : ''\}`}[\s\S]*?<\!-\- end of mapping \-\->|return \(\s*<div\s*key=\{track\.id\}[\s\S]*?className={`relative group transition-all duration-500 hover:-translate-y-2 hover:z-50 \$\{idx !== 0 \? '-mt-3' : ''\}`}[\s\S]*?<\/div>\s*<\/div>\s*\);\s*\}\)/m;

// Actually I'll use a script that just finds the exact start and end strings.
const startStr = `                  return (
                    <div 
                      key={track.id}
                      className={\`relative group transition-all duration-500 hover:-translate-y-2 hover:z-50 \${idx !== 0 ? '-mt-3' : ''}\`}`;
const endStr = `                      </div>
                    </div>
                  );
                })`;

const startIndex = content.indexOf(startStr);
const endIndex = content.indexOf(endStr) + endStr.length;

if (startIndex !== -1 && endIndex > startStr.length) {
  const replacement = `                  return (
                    <div 
                      key={track.id}
                      className={\`relative group transition-all duration-300 hover:-translate-y-1 \${idx !== 0 ? 'mt-1.5' : ''}\`}
                      style={{ zIndex }}
                    >
                      <div
                        onClick={() => !isBlocked && setSelectedTrack(track)}
                        className={\`rounded-[1.25rem] p-2 flex items-center justify-between border transition-all duration-300 \${
                          isBlocked
                            ? 'bg-black/40 opacity-50 border-red-500/10'
                            : isSelected
                            ? 'bg-gradient-to-r from-[#241911] to-[#1C130D] border-[#D4AF37]/50 shadow-[0_5px_15px_rgba(212,175,55,0.15)] scale-[1.01] cursor-pointer'
                            : 'bg-white/5 border-transparent hover:border-white/10 hover:bg-white/10 cursor-pointer'
                        }\`}
                      >
                        <div className="flex items-center gap-3 min-w-0 flex-1 pl-1">
                          {/* Compact Album Cover */}
                          <div className="relative w-10 h-10 rounded-[0.6rem] overflow-hidden shrink-0 shadow-sm border border-white/5">
                            <img
                              src={track.albumCover || track.coverUrl || track.album_art || '/logo.png'}
                              alt={track.title}
                              onError={(e) => {
                                e.currentTarget.onerror = null;
                                e.currentTarget.src = '/logo.png';
                              }}
                              className="w-full h-full object-cover"
                            />
                            {isSelected && (
                              <div className="absolute inset-0 bg-[#D4AF37]/30 flex items-center justify-center backdrop-blur-sm">
                                <Check className="w-5 h-5 text-white drop-shadow-md stroke-[3]" />
                              </div>
                            )}
                          </div>
                          
                          {/* Title & Artist - Single Column */}
                          <div className="min-w-0 flex-1 flex flex-col justify-center py-0.5">
                            <div className="flex items-center gap-1.5">
                              <h4 className={\`text-[13px] font-black truncate leading-tight \${isSelected ? 'text-white' : 'text-gray-100'}\`}>
                                {track.title}
                              </h4>
                              {isExplicitBlocked ? (
                                <AlertTriangle className="w-3 h-3 text-red-400 shrink-0" />
                              ) : finalCost === null ? (
                                <Clock className="w-3 h-3 text-red-400 shrink-0" />
                              ) : null}
                            </div>
                            <p className="text-[11px] font-semibold text-gray-400 truncate mt-0.5 leading-tight">
                              {track.artist}
                            </p>
                          </div>
                        </div>

                        {/* Right side: Duration + Action Button */}
                        <div className="flex items-center gap-3 shrink-0 pr-1">
                          {durMs > 0 && !isBlocked && (
                            <span className="text-[11px] font-semibold text-gray-400/80 tracking-wide">
                              {formatDuration(durMs)}
                            </span>
                          )}
                          
                          {isExplicitBlocked ? (
                            <span className="text-[9px] text-red-400/80 font-bold uppercase tracking-wider">Engelli</span>
                          ) : finalCost === null ? (
                            <span className="text-[9px] text-red-400/80 font-bold uppercase tracking-wider">&gt;7 Dk</span>
                          ) : (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedTrack(track);
                                handleConfirmRequest(track);
                              }}
                              disabled={cooldown.active || !canAfford || submittingTrackId === track.id}
                              className={\`h-7 px-3.5 rounded-full font-black text-[10px] flex items-center shadow-sm transition-all duration-300 \${
                                !canAfford || submittingTrackId === track.id
                                  ? 'bg-black/30 text-gray-500 border border-white/5 cursor-not-allowed'
                                  : 'bg-white/10 text-white border border-white/10 hover:bg-white/20 active:scale-95'
                              }\`}
                            >
                              {submittingTrackId === track.id ? (
                                <Loader2 className="w-3 h-3 animate-spin" />
                              ) : (
                                <span>SEÇ</span>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })`;
  content = content.substring(0, startIndex) + replacement + content.substring(endIndex);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Fixed MusicSearchModal');
} else {
  console.log('Could not find start or end index for MusicSearchModal');
  console.log('startIndex:', startIndex);
  console.log('endIndex:', endIndex);
}
