// Returns true if claimed today in Turkey time (UTC+3)
export const isClaimedTodayTR = (lastClaimedIso: string | null): boolean => {
  if (!lastClaimedIso) return false;
  
  const now = new Date();
  // Shift UTC time to TR time (+3 hours)
  const trNow = new Date(now.getTime() + (3 * 60 + now.getTimezoneOffset()) * 60000);
  const trTodayStr = trNow.toISOString().split('T')[0];

  const claimDate = new Date(lastClaimedIso);
  const trClaim = new Date(claimDate.getTime() + (3 * 60 + claimDate.getTimezoneOffset()) * 60000);
  const trClaimStr = trClaim.toISOString().split('T')[0];

  return trTodayStr === trClaimStr;
};

// Returns remaining seconds until next TR Midnight (00:00:00)
export const getSecondsUntilTRMidnight = (): number => {
  const now = new Date();
  const trNow = new Date(now.getTime() + (3 * 60 + now.getTimezoneOffset()) * 60000);

  const trNextMidnight = new Date(trNow);
  trNextMidnight.setDate(trNextMidnight.getDate() + 1);
  trNextMidnight.setHours(0, 0, 0, 0);

  const diffMs = trNextMidnight.getTime() - trNow.getTime();
  return Math.max(0, Math.floor(diffMs / 1000));
};
