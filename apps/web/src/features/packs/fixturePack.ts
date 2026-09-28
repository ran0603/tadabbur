import { db, SurahRecord, ThematicBlockRecord, VerseRecord } from '../../core/db';

export const FIXTURE_DATA = {
  fixture: true,
  contentVersion: '0.1.0-fixture',
  surahs: [
    {
      id: 1,
      nameAr: 'الفاتحة',
      nameEn: 'Al-Fatihah',
      revelationType: 'makki' as const,
      verseCount: 7,
      textChecksum: 'fatihah-chk-001',
    },
    {
      id: 112,
      nameAr: 'الإخلاص',
      nameEn: 'Al-Ikhlas',
      revelationType: 'makki' as const,
      verseCount: 4,
      textChecksum: 'ikhlas-chk-112',
    },
    {
      id: 78,
      nameAr: 'النبأ',
      nameEn: 'An-Naba',
      revelationType: 'makki' as const,
      verseCount: 40,
      textChecksum: 'naba-chk-078',
    },
  ],
  blocks: [
    {
      id: 'block-78-1',
      surahId: 78,
      title: 'The Great News & Evidence of Resurrection',
      verseStart: 1,
      verseEnd: 16,
      summary: 'Reflection on the signs of creation in the earth and heavens as proof of the Resurrection.',
    },
    {
      id: 'block-78-2',
      surahId: 78,
      title: 'The Day of Sorting & Recompense',
      verseStart: 17,
      verseEnd: 30,
      summary: 'Description of the Day of Judgement and the outcome for those who deny.',
    },
    {
      id: 'block-78-3',
      surahId: 78,
      title: 'The Reward of the Righteous',
      verseStart: 31,
      verseEnd: 40,
      summary: 'The eternal success of the righteous and the final call to action.',
    },
  ],
  verses: [
    { ref: '1:1', surahId: 1, verseNumber: 1, textUthmani: 'بِسْمِ اللَّهِ الرَّحْمَٰنِ الرَّحِيمِ', blockId: null, juz: 1 },
    { ref: '1:2', surahId: 1, verseNumber: 2, textUthmani: 'الْحَمْدُ لِلَّهِ رَبِّ الْعَالَمِينَ', blockId: null, juz: 1 },
    { ref: '1:3', surahId: 1, verseNumber: 3, textUthmani: 'الرَّحْمَٰنِ الرَّحِيمِ', blockId: null, juz: 1 },
    { ref: '1:4', surahId: 1, verseNumber: 4, textUthmani: 'مَالِكِ يَوْمِ الدِّينِ', blockId: null, juz: 1 },
    { ref: '1:5', surahId: 1, verseNumber: 5, textUthmani: 'إِيَّاكَ نَعْبُدُ وَإِيَّاكَ نَسْتَعِينُ', blockId: null, juz: 1 },
    { ref: '1:6', surahId: 1, verseNumber: 6, textUthmani: 'اهْدِنَا الصِّرَاطَ الْمُسْتَقِيمَ', blockId: null, juz: 1 },
    { ref: '1:7', surahId: 1, verseNumber: 7, textUthmani: 'صِرَاطَ الَّذِينَ أَنْعَمْتَ عَلَيْهِمْ غَيْرِ الْمَغْضُوبِ عَلَيْهِمْ وَلَا الضَّالِّينَ', blockId: null, juz: 1 },

    { ref: '112:1', surahId: 112, verseNumber: 1, textUthmani: 'قُلْ هُوَ اللَّهُ أَحَدٌ', blockId: null, juz: 30 },
    { ref: '112:2', surahId: 112, verseNumber: 2, textUthmani: 'اللَّهُ الصَّمَدُ', blockId: null, juz: 30 },
    { ref: '112:3', surahId: 112, verseNumber: 3, textUthmani: 'لَمْ يَلِدْ وَلَمْ يُولَدْ', blockId: null, juz: 30 },
    { ref: '112:4', surahId: 112, verseNumber: 4, textUthmani: 'وَلَمْ يَكُن لَّهُ كُفُوًا أَحَدٌ', blockId: null, juz: 30 },

    { ref: '78:1', surahId: 78, verseNumber: 1, textUthmani: 'عَمَّ يَتَسَاءَلُونَ', blockId: 'block-78-1', juz: 30 },
    { ref: '78:2', surahId: 78, verseNumber: 2, textUthmani: 'عَنِ النَّبَإِ الْعَظِيمِ', blockId: 'block-78-1', juz: 30 },
    { ref: '78:3', surahId: 78, verseNumber: 3, textUthmani: 'الَّذِي هُمْ فِيهِ مُخْتَلِفُونَ', blockId: 'block-78-1', juz: 30 },
    { ref: '78:17', surahId: 78, verseNumber: 17, textUthmani: 'إِنَّ يَوْمَ الْفَصْلِ كَانَ مِيقَاتًا', blockId: 'block-78-2', juz: 30 },
    { ref: '78:31', surahId: 78, verseNumber: 31, textUthmani: 'إِنَّ لِلْمُتَّقِينَ مَفَازًا', blockId: 'block-78-3', juz: 30 },
  ],
};

export async function ensureFixturePackLoaded(): Promise<void> {
  const packId = 'juz-30-fixture';
  const existingPack = await db.getPackState(packId);
  if (existingPack) return;

  await db.savePack(
    packId,
    FIXTURE_DATA.contentVersion,
    FIXTURE_DATA.surahs as SurahRecord[],
    FIXTURE_DATA.blocks as ThematicBlockRecord[],
    FIXTURE_DATA.verses as VerseRecord[]
  );
}
