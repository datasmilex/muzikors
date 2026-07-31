const fs = require('fs');
const path = require('path');

const componentsDir = 'C:\\Muzikors\\Kullanıcı Tarafı\\src\\components';
const files = [
  'CreditTopUpModal.tsx',
  'DailyRewardModal.tsx',
  'DrawerMenu.tsx',
  'GpsMapModal.tsx',
  'InfoModals.tsx',
  'LeaderboardModal.tsx',
  'LoginModal.tsx',
  'MusicSearchModal.tsx',
  'ProfileView.tsx',
  'QrScannerModal.tsx',
  'TvShoutoutModal.tsx',
  'VenueInfoModal.tsx'
];

files.forEach(file => {
  const filePath = path.join(componentsDir, file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');

  // Find the condition, e.g., `if (activeModal !== 'topup') return null;`
  // And remove it.
  let conditionStr = '';
  let activeModalCheck = '';
  const conditionRegex = /if\s*\(([^)]*(?:activeModal|isInfoModal)[^)]*)\)\s*(?:return null;|return;)/;
  const match = content.match(conditionRegex);
  
  if (match) {
    conditionStr = match[0];
    let rawCondition = match[1];
    
    // We want the reverse condition for the wrapper
    // if rawCondition is `activeModal !== 'topup'`, reverse is `activeModal === 'topup'`
    rawCondition = rawCondition.replace(/!==/g, '===');
    rawCondition = rawCondition.replace(/!isInfoModal/g, 'isInfoModal');
    
    activeModalCheck = rawCondition;
    
    // Remove the early return
    content = content.replace(conditionStr, '');
  }

  // Find the AnimatePresence block
  const animatePresenceRegex = /(<AnimatePresence>)([\s\S]*?)(<\/AnimatePresence>)/;
  if (activeModalCheck && animatePresenceRegex.test(content)) {
    content = content.replace(animatePresenceRegex, (match, p1, p2, p3) => {
      return `${p1}\n      {${activeModalCheck} && (<>\n${p2}\n      </>)}\n    ${p3}`;
    });
  }

  // Update exit animations for all motion.div
  // Specifically the ones inside the modal, typically they have `exit={{ ... }}`
  // We want to replace `exit={{ ... }}` with `exit={{ opacity: 0, y: "100%" }}`
  // Only for motion.div that represent the modal card. They usually have y or scale.
  // Actually, let's just replace all `exit={{...}}` except the backdrop.
  // The backdrop usually has `exit={{ opacity: 0 }}`.
  
  // Let's replace the modal exit animation. The modal motion.div typically has `y: 20` or similar in exit.
  content = content.replace(/exit=\{\{[^}]*(?:scale|y)[^}]*\}\}/g, 'exit={{ opacity: 0, y: "100%" }}');
  
  // We also need to fix DrawerMenu's exit maybe? `exit={{ x: '100%' }}` for DrawerMenu might be fine, but user said "her modalin". 
  // Wait, I will just apply to y-based exits for now, or just all.
  
  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated ${file}`);
});
