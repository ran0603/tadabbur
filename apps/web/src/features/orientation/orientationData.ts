export interface OrientationCardData {
  surahId: number;
  revelationType: 'makki' | 'madani';
  verseCount: number;
  nameAr: string;
  nameEn: string;
  coreAxis: string;
  cards: {
    id: string;
    title: string;
    content: string;
    source?: string;
  }[];
}

export const ORIENTATION_FIXTURE_MAP: Record<number, OrientationCardData> = {
  78: {
    surahId: 78,
    revelationType: 'makki',
    verseCount: 40,
    nameAr: 'النبأ',
    nameEn: 'An-Naba',
    coreAxis: 'The certainty of the Resurrection and the divine cosmic order as proof.',
    cards: [
      {
        id: 'card-1',
        title: 'Overview & Context',
        content: 'Revealed in Mecca following the early public call, addressing questions about the Great News (the Resurrection).',
      },
      {
        id: 'card-2',
        title: 'Core Axis',
        content: 'Demonstrates Allah’s power through the creation of mountains, night, day, and rain as proof of bringing life after death.',
      },
      {
        id: 'card-3',
        title: 'Virtues & Significance',
        content: 'Recited to awaken deep reflection on accountability and the ultimate recompense of the Day of Sorting.',
        source: 'Scholar Reviewed Source',
      },
    ],
  },
  1: {
    surahId: 1,
    revelationType: 'makki',
    verseCount: 7,
    nameAr: 'الفاتحة',
    nameEn: 'Al-Fatihah',
    coreAxis: 'The Foundation of the Book: praise, worship, and prayer for guidance.',
    cards: [
      {
        id: 'card-1',
        title: 'The Opening',
        content: 'Seven oft-repeated verses containing the essence of Quranic guidance.',
      },
      {
        id: 'card-2',
        title: 'Core Axis',
        content: 'Orientation toward total reliance on Allah alone and asking for the Straight Path.',
      },
    ],
  },
  112: {
    surahId: 112,
    revelationType: 'makki',
    verseCount: 4,
    nameAr: 'الإخلاص',
    nameEn: 'Al-Ikhlas',
    coreAxis: 'Pure Monotheism (Tawhid) and the absolute uniqueness of Allah.',
    cards: [
      {
        id: 'card-1',
        title: 'Pure Monotheism',
        content: 'Direct declaration of Allah’s absolute oneness and eternal nature.',
      },
      {
        id: 'card-2',
        title: 'Virtue',
        content: 'Equivalent to one third of the Quran in its theological weight.',
        source: 'Sahih Hadith Source',
      },
    ],
  },
};
