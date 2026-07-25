export const containsBadWords = (text: string): boolean => {
  if (!text) return false;
  
  const badWords = [
    'amk', 'amq', 'aq', 'siktir', 'piç', 'pic', 'yarrak', 'yarak', 'orospu',
    'göt', 'got', 'ibne', 'yavşak', 'yavsak', 'amcık', 'amcik', 'sik'
  ];
  
  const lowerText = text.toLocaleLowerCase('tr-TR');
  
  for (const word of badWords) {
    const regex = new RegExp(`(?:^|\\s|[.,!?;:])${word}(?:$|\\s|[.,!?;:])`, 'i');
    if (regex.test(lowerText)) {
      return true;
    }
  }
  
  return false;
};
