const ZODIAC_RANGES: { sign: string; start: [number, number]; end: [number, number] }[] =
  [
    { sign: "Capricorn", start: [12, 22], end: [1, 19] },
    { sign: "Aquarius", start: [1, 20], end: [2, 18] },
    { sign: "Pisces", start: [2, 19], end: [3, 20] },
    { sign: "Aries", start: [3, 21], end: [4, 19] },
    { sign: "Taurus", start: [4, 20], end: [5, 20] },
    { sign: "Gemini", start: [5, 21], end: [6, 20] },
    { sign: "Cancer", start: [6, 21], end: [7, 22] },
    { sign: "Leo", start: [7, 23], end: [8, 22] },
    { sign: "Virgo", start: [8, 23], end: [9, 22] },
    { sign: "Libra", start: [9, 23], end: [10, 22] },
    { sign: "Scorpio", start: [10, 23], end: [11, 21] },
    { sign: "Sagittarius", start: [11, 22], end: [12, 21] },
  ];

function dayOfYear(month: number, day: number): number {
  const days = [0, 31, 59, 90, 120, 151, 181, 212, 243, 273, 304, 334];
  return days[month - 1]! + day;
}

function isInRange(
  month: number,
  day: number,
  start: [number, number],
  end: [number, number],
): boolean {
  const value = dayOfYear(month, day);
  const startValue = dayOfYear(start[0], start[1]);
  const endValue = dayOfYear(end[0], end[1]);

  if (startValue <= endValue) {
    return value >= startValue && value <= endValue;
  }

  return value >= startValue || value <= endValue;
}

export const ZODIAC_SIGNS = ZODIAC_RANGES.map((z) => z.sign);

export function getZodiacSign(date: Date): string {
  const month = date.getUTCMonth() + 1;
  const day = date.getUTCDate();

  for (const { sign, start, end } of ZODIAC_RANGES) {
    if (isInRange(month, day, start, end)) {
      return sign;
    }
  }

  return "Capricorn";
}
