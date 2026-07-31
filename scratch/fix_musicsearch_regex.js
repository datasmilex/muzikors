const fs = require('fs');
const path = require('path');
const file = 'C:\\Muzikors\\Kullanıcı Tarafı\\src\\components\\MusicSearchModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const regex = /return \(\s*<div\s*key=\{track\.id\}[\s\S]*?<\/div>\s*<\/div>\s*\);\s*\}\)/m;

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

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync(file, content, 'utf8');
  console.log('Fixed MusicSearchModal with regex');
} else {
  console.log('Regex did not match!');
}
