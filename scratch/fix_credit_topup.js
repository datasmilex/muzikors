const fs = require('fs');
const file = 'C:\\Muzikors\\Kullanıcı Tarafı\\src\\components\\CreditTopUpModal.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetStr = `                  <div className="flex items-center gap-2.5">
                    {/* Circle Radio Indicator */}
                    <div
                      className={\`w-4 h-4 shrink-0 rounded-full border-[2px] flex items-center justify-center transition-all duration-300 shadow-inner \${
                        isSelected
                          ? 'border-[#D4AF37] bg-[#D4AF37] text-stone-950 scale-110'
                          : 'border-[#D4AF37]/30 bg-[#120C08] group-hover:border-[#D4AF37]/50'
                      }\`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[4]" />}
                    </div>

                    <div>
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className={\`text-sm font-black tracking-tight \${isSelected ? 'text-white' : 'text-gray-200'}\`}>+{pkg.credits} <span className="text-[10px] text-[#D4AF37]">Kr.</span></span>
                        {pkg.bonusCredits > 0 && (
                          <span className="text-[9px] font-black text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded border border-emerald-400/20 shadow-sm whitespace-nowrap">
                            +{pkg.bonusCredits} Hediye
                          </span>
                        )}
                      </div>
                    </div>
                  </div>`;

const replaceStr = `                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {/* Circle Radio Indicator */}
                    <div
                      className={\`w-4 h-4 shrink-0 rounded-full border-[2px] flex items-center justify-center transition-all duration-300 shadow-inner \${
                        isSelected
                          ? 'border-[#D4AF37] bg-[#D4AF37] text-stone-950 scale-110'
                          : 'border-[#D4AF37]/30 bg-[#120C08] group-hover:border-[#D4AF37]/50'
                      }\`}
                    >
                      {isSelected && <Check className="w-2.5 h-2.5 stroke-[4]" />}
                    </div>

                    <div className="flex-1 min-w-0 flex flex-col items-start">
                      <span className={\`text-[15px] font-black tracking-tight truncate w-full \${isSelected ? 'text-white' : 'text-gray-200'}\`}>
                        +{pkg.credits} <span className="text-[11px] text-[#D4AF37]">Kredi</span>
                      </span>
                      {pkg.bonusCredits > 0 && (
                        <span className="text-[10px] font-black text-emerald-400 bg-emerald-400/10 px-1.5 py-0.5 rounded border border-emerald-400/20 shadow-sm mt-0.5 whitespace-nowrap">
                          +{pkg.bonusCredits} Hediye
                        </span>
                      )}
                    </div>
                  </div>`;

content = content.replace(targetStr, replaceStr);
fs.writeFileSync(file, content, 'utf8');
console.log('Fixed credit top up modal UI');
