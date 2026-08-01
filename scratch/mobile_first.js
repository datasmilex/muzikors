const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  let originalContent = content;

  // 1. Replace whileHover={{...}} with whileTap={{ scale: 0.95 }}
  // We'll just remove whileHover completely if it's there, and ensure whileTap is present if appropriate, 
  // but it's simpler to just replace whileHover with whileTap={{ scale: 0.95 }}
  content = content.replace(/whileHover=\{\{[^}]+\}\}/g, '');
  
  // Make sure we have whileTap={{ scale: 0.95 }} on elements that had whileHover.
  // Actually, if we just remove whileHover, we can globally look for motion.button and motion.div (if clickable)
  // Let's just do regex replacements for the Tailwind classes first:

  // Replace hover: with active:
  content = content.replace(/\bhover:([a-zA-Z0-9_-]+(?:\[[^\]]+\])?)/g, 'active:$1');
  
  // Replace group-hover: with group-active:
  content = content.replace(/\bgroup-hover:([a-zA-Z0-9_-]+(?:\[[^\]]+\])?)/g, 'group-active:$1');

  // Fix active scales. If active:scale-105, active:scale-[1.02] etc, make them active:scale-95
  content = content.replace(/active:scale-105/g, 'active:scale-95');
  content = content.replace(/active:scale-110/g, 'active:scale-95');
  content = content.replace(/active:scale-\[1\.\d+\]/g, 'active:scale-95');
  
  // We might end up with duplicate active:scale-95 if it already had one.
  // E.g., `active:scale-95 active:scale-95`
  content = content.replace(/active:scale-95\s+active:scale-95/g, 'active:scale-95');

  if (content !== originalContent) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Updated ${path.basename(filePath)}`);
  }
}

function traverseDir(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    if (fs.statSync(fullPath).isDirectory()) {
      traverseDir(fullPath);
    } else if (fullPath.endsWith('.tsx') || fullPath.endsWith('.ts')) {
      processFile(fullPath);
    }
  }
}

traverseDir(path.join(__dirname, '../src/components'));
traverseDir(path.join(__dirname, '../src/app'));
console.log('Mobile-first animation sweep complete!');
