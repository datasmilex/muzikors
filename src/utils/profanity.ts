export const badWords = [
  'amk',
  'aq',
  'sik',
  'sikiş',
  'sokuk',
  'oç',
  'orospu',
  'piç',
  'göt',
  'yavşak',
  'ibne',
  'kahpe',
  'amcık',
  'yarak',
  'yarrak',
  'dalyarak',
  'pezevenk',
  'sürtük'
];

export const containsProfanity = (text: string): boolean => {
  const normalizedText = text.toLowerCase().replace(/[^a-z0-9çğıöşü]/g, ' ');
  const words = normalizedText.split(/\s+/);
  
  for (const word of words) {
    if (badWords.includes(word)) {
      return true;
    }
  }
  return false;
};

export const filterProfanity = (text: string): string => {
  if (!text) return text;
  let filtered = text;
  
  badWords.forEach(word => {
    // Replace whole words, case insensitive
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    filtered = filtered.replace(regex, '***');
  });
  
  return filtered;
};
