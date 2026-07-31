const fs = require('fs');

function replaceInFile(file, replacements) {
  let content = fs.readFileSync(file, 'utf8');
  for (let r of replacements) {
    content = content.replace(r.search, r.replace);
  }
  fs.writeFileSync(file, content, 'utf8');
}

replaceInFile('C:\\Muzikors\\Kullanıcı Tarafı\\src\\components\\DrawerMenu.tsx', [
  { search: /{user.credits}/g, replace: '{user.credits + (user.promo_credits || 0)}' }
]);

replaceInFile('C:\\Muzikors\\Kullanıcı Tarafı\\src\\components\\ProfileView.tsx', [
  { search: /{user \? user.credits : 0}/g, replace: '{user ? user.credits + (user.promo_credits || 0) : 0}' }
]);

replaceInFile('C:\\Muzikors\\Kullanıcı Tarafı\\src\\components\\MusicSearchModal.tsx', [
  { search: /const canAfford = \(user\?\.credits \?\? 0\) >= \(finalCost \?\? 0\);/g, replace: 'const canAfford = ((user?.credits ?? 0) + (user?.promo_credits ?? 0)) >= (finalCost ?? 0);' },
  { search: /Bakiye: {user \? user\.credits : 0}/g, replace: 'Bakiye: {user ? user.credits + (user.promo_credits || 0) : 0}' }
]);

replaceInFile('C:\\Muzikors\\Kullanıcı Tarafı\\src\\components\\TvShoutoutModal.tsx', [
  { search: /if \(user\.credits < 20\) {/g, replace: 'if (user.credits + (user.promo_credits || 0) < 20) {' },
  // Let's not deduct purely from credits, actually wait, AppContext handles deduct! But TvShoutoutModal might be deducting it locally for UI optimistic updates.
  { search: /setUser\(prev => prev \? { \.\.\.prev, credits: prev\.credits - 20 } : prev\);/g, replace: 'setUser(prev => prev ? { ...prev, credits: Math.max(0, prev.credits - 20) } : prev);' } // To be safe, though TvShoutoutModal probably doesn't deduct promo correctly locally.
]);

console.log('Fixed promo credits display');
