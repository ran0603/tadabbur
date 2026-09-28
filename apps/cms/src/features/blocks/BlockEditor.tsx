import { useState } from 'react';

export interface BlockDraft {
  id: string;
  surahId: number;
  title: string;
  verseStart: number;
  verseEnd: number;
  summary: string;
  reviewStatus: 'draft' | 'in_review' | 'approved' | 'published';
}

interface Props {
  surahId: number;
  surahNameEn: string;
  totalVerses: number;
}

export function BlockEditor({ surahId, surahNameEn, totalVerses }: Props) {
  const [blocks, setBlocks] = useState<BlockDraft[]>([
    {
      id: 'blk-1',
      surahId: 78,
      title: 'Evidence of Resurrection in Creation',
      verseStart: 1,
      verseEnd: 16,
      summary: 'Signs of cosmic creation proving divine power.',
      reviewStatus: 'approved',
    },
    {
      id: 'blk-2',
      surahId: 78,
      title: 'The Day of Recompense',
      verseStart: 17,
      verseEnd: 30,
      summary: 'Description of Judgement Day.',
      reviewStatus: 'in_review',
    },
    {
      id: 'blk-3',
      surahId: 78,
      title: 'Reward of the Righteous',
      verseStart: 31,
      verseEnd: 40,
      summary: 'Final call to success.',
      reviewStatus: 'draft',
    },
  ]);

  // Live gap and overlap validation
  const sortedBlocks = [...blocks].sort((a, b) => a.verseStart - b.verseStart);
  const validationErrors: string[] = [];

  let expectedStart = 1;
  for (const b of sortedBlocks) {
    if (b.verseStart > expectedStart) {
      validationErrors.push(`Gap: Verses ${expectedStart} to ${b.verseStart - 1} are unassigned.`);
    } else if (b.verseStart < expectedStart) {
      validationErrors.push(`Overlap: Block "${b.title}" overlaps at verse ${b.verseStart}.`);
    }
    expectedStart = b.verseEnd + 1;
  }

  if (expectedStart <= totalVerses) {
    validationErrors.push(`Coverage incomplete: Verses ${expectedStart} to ${totalVerses} remain.`);
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-stone-200 pb-4">
        <div>
          <h2 className="text-lg font-bold text-stone-900">
            Surah {surahId}: {surahNameEn} ({totalVerses} Verses)
          </h2>
          <p className="text-xs text-stone-500">Live thematic block coverage validation</p>
        </div>
        <span className={`text-xs px-3 py-1 rounded-full font-semibold ${
          validationErrors.length === 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
        }`}>
          {validationErrors.length === 0 ? '✓ Coverage Valid' : `${validationErrors.length} Issue(s)`}
        </span>
      </div>

      {/* Validation alert banner */}
      {validationErrors.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 text-xs text-rose-900 space-y-1">
          <span className="font-bold">Validation Warnings:</span>
          <ul className="list-disc list-inside space-y-0.5">
            {validationErrors.map((err, i) => (
              <li key={i}>{err}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Blocks list */}
      <div className="space-y-4">
        {sortedBlocks.map((b) => (
          <div key={b.id} className="p-4 rounded-xl border border-stone-200 bg-stone-50 space-y-2">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold text-sm text-stone-900">{b.title}</h3>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-mono bg-stone-200 text-stone-800 px-2 py-0.5 rounded">
                  Verses {b.verseStart}–{b.verseEnd}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded font-medium capitalize ${
                  b.reviewStatus === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                  b.reviewStatus === 'in_review' ? 'bg-amber-100 text-amber-800' : 'bg-stone-200 text-stone-700'
                }`}>
                  {b.reviewStatus.replace('_', ' ')}
                </span>
              </div>
            </div>
            <p className="text-xs text-stone-600 leading-relaxed">{b.summary}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
