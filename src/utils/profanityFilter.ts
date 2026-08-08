// Basic but comprehensive Turkish profanity filter using Regex to catch variations

const BAD_WORDS = [
  'amk', 'amq', 'aq', 'amcık', 'amcik', 'orospu', 'piç', 'pic', 'göt', 'got', 'yarak', 'yarrak', 'yrrk', 'yrk', 
  'sik', 'siktir', 'sktr', 'pezevenk', 'pzv', 'kahpe', 'fahişe', 'fahise', 'ibne', 'ipne',
  'sikiş', 'sikis', 'sokuk', 'yavşak', 'yavsak', 'yvsk', 'or çocuğu', 'o.ç', 'oc',
  'meme', 'am', 'yarrag', 'yarra', 'sikim', 'sikerim', 'sikerler', 'götten'
];

export const containsProfanity = (text: string): boolean => {
  if (!text) return false;
  
  // Normalize text: lowercase, replace common tricks (e.g. 1->i, 0->o, @->a, 3->e)
  const normalizedText = text.toLowerCase()
    .replace(/1/g, 'i')
    .replace(/0/g, 'o')
    .replace(/@/g, 'a')
    .replace(/3/g, 'e')
    .replace(/!/g, 'i')
    .replace(/5/g, 's')
    .replace(/7/g, 't')
    .replace(/[^a-zöçşığü\s]/g, ''); // Remove all punctuation and symbols
    
  const words = normalizedText.split(/\s+/);
  
  // Check exact words against bad words
  for (const word of words) {
    if (BAD_WORDS.includes(word)) {
      return true;
    }
  }

  // Check substring matches for variations (e.g. "yrrkk")
  for (const badWord of BAD_WORDS) {
    // For very short words like 'am', exact match is better to avoid false positives (e.g. 'ama', 'zaman')
    if (badWord.length > 3) {
      if (normalizedText.includes(badWord)) {
        return true;
      }
    }
  }

  return false;
};

export const maskProfanity = (text: string): string => {
  if (!text) return text;
  
  let maskedText = text;
  
  for (const badWord of BAD_WORDS) {
    // Case-insensitive replacement
    const regex = new RegExp(`\\b${badWord}\\b`, 'gi');
    maskedText = maskedText.replace(regex, '***');
  }
  
  // For substrings (longer words)
  for (const badWord of BAD_WORDS.filter(w => w.length > 3)) {
     const regex = new RegExp(badWord, 'gi');
     maskedText = maskedText.replace(regex, '***');
  }

  return maskedText;
};
