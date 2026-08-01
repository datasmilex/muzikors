const fs = require('fs');

const cssFile = 'C:\\Muzikors\\Kullanıcı Tarafı\\src\\app\\globals.css';
let cssContent = fs.readFileSync(cssFile, 'utf8');

if (!cssContent.includes('@keyframes smoothVisualizer')) {
  cssContent += `
@keyframes smoothVisualizer {
  0%, 100% { transform: scaleY(0.15); opacity: 0.6; }
  50% { transform: scaleY(1); opacity: 1; }
}
`;
  fs.writeFileSync(cssFile, cssContent, 'utf8');
}

const file = 'C:\\Muzikors\\Kullanıcı Tarafı\\src\\components\\NowPlayingSection.tsx';
let content = fs.readFileSync(file, 'utf8');

const targetVisualizer = `        {/* Audio Visualizer */}
        <div className="w-full flex flex-col items-center gap-1.5 mb-2">
          <div className="flex items-center justify-center gap-1 h-8 w-full max-w-[150px]">
            {[...Array(12)].map((_, i) => (
              <span 
                key={i} 
                className={\`w-1 rounded-full bg-gradient-to-t from-[#D4AF37] to-[#FFF1C0] shadow-[0_0_8px_rgba(212,175,55,0.8)] \${isPlayingAudio ? 'animate-[pulse_1s_ease-in-out_infinite]' : 'h-1.5'}\`}
                style={{ 
                  animationDuration: \`\${0.5 + Math.random() * 0.8}s\`,
                  animationDelay: \`\${Math.random() * 0.5}s\`,
                  height: isPlayingAudio ? \`\${20 + Math.random() * 80}%\` : '6px'
                }} 
              />
            ))}
          </div>
        </div>`;

const newVisualizer = `        {/* Audio Visualizer */}
        <div className="w-full flex flex-col items-center gap-1.5 mb-2">
          <div className="flex items-end justify-center gap-[3px] h-8 w-full max-w-[150px]">
            {[...Array(12)].map((_, i) => {
              // Deterministic animation durations and delays for a smooth, repeating chaotic-looking loop
              const duration = 0.8 + (i % 4) * 0.15;
              const delay = (i % 5) * 0.1;
              return (
                <span 
                  key={i} 
                  className="w-1 rounded-full bg-gradient-to-t from-[#D4AF37] to-[#FFF1C0] shadow-[0_0_8px_rgba(212,175,55,0.8)] origin-bottom"
                  style={{ 
                    height: '100%',
                    animation: isPlayingAudio ? \`smoothVisualizer \${duration}s ease-in-out \${delay}s infinite\` : 'none',
                    transform: isPlayingAudio ? 'scaleY(0.15)' : 'scaleY(0.15)'
                  }} 
                />
              );
            })}
          </div>
        </div>`;

content = content.replace(targetVisualizer, newVisualizer);

fs.writeFileSync(file, content, 'utf8');
console.log('Fixed visualizer animation');
