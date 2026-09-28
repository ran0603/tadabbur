import { useState } from 'react';

export interface ReviewItem {
  id: string;
  type: 'Surah Orientation' | 'Thematic Block' | 'Action Template';
  title: string;
  author: string;
  status: 'draft' | 'in_review' | 'approved' | 'published';
  reviewReason?: string;
}

export function ScholarReviewPanel() {
  const [items, setItems] = useState<ReviewItem[]>([
    {
      id: 'rev-1',
      type: 'Surah Orientation',
      title: 'Surah 78 An-Naba Macro Orientation',
      author: 'Editor Team A',
      status: 'in_review',
    },
    {
      id: 'rev-2',
      type: 'Thematic Block',
      title: 'Block 78:1-16 Signs of Cosmic Power',
      author: 'Editor Team B',
      status: 'approved',
    },
    {
      id: 'rev-3',
      type: 'Action Template',
      title: 'Verse 1:5 Daily Help Prayer Action',
      author: 'Editor Team A',
      status: 'draft',
    },
  ]);

  function handleStatusChange(id: string, newStatus: ReviewItem['status'], reason?: string) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id ? { ...item, status: newStatus, reviewReason: reason } : item
      )
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-6">
      <div className="flex items-center justify-between border-b border-stone-200 pb-4">
        <div>
          <h2 className="text-lg font-bold text-stone-900">Scholar Review Workflow</h2>
          <p className="text-xs text-stone-500">
            Review draft content before publishing to signed content packs.
          </p>
        </div>
        <span className="text-xs font-semibold bg-stone-100 text-stone-700 px-3 py-1 rounded-md border">
          Role: Scholar / Editor
        </span>
      </div>

      <div className="space-y-4">
        {items.map((item) => (
          <div
            key={item.id}
            className="p-4 rounded-xl border border-stone-200 bg-stone-50 flex items-center justify-between gap-4"
          >
            <div>
              <div className="flex items-center space-x-2 rtl:space-x-reverse mb-1">
                <span className="text-xs font-semibold bg-amber-100 text-amber-900 px-2 py-0.5 rounded">
                  {item.type}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded font-medium capitalize ${
                  item.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                  item.status === 'in_review' ? 'bg-amber-100 text-amber-800' : 'bg-stone-200 text-stone-700'
                }`}>
                  {item.status.replace('_', ' ')}
                </span>
              </div>
              <h3 className="font-semibold text-sm text-stone-900">{item.title}</h3>
              <p className="text-xs text-stone-500 mt-0.5">Author: {item.author}</p>
            </div>

            {/* Action Buttons */}
            <div className="flex items-center space-x-2 rtl:space-x-reverse shrink-0">
              {item.status === 'draft' && (
                <button
                  onClick={() => handleStatusChange(item.id, 'in_review')}
                  className="text-xs bg-amber-600 text-white px-3 py-1.5 rounded-lg hover:bg-amber-700 font-medium"
                >
                  Submit for Review
                </button>
              )}
              {item.status === 'in_review' && (
                <>
                  <button
                    onClick={() => handleStatusChange(item.id, 'approved')}
                    className="text-xs bg-emerald-700 text-white px-3 py-1.5 rounded-lg hover:bg-emerald-800 font-medium"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => handleStatusChange(item.id, 'draft', 'Needs revision')}
                    className="text-xs bg-rose-700 text-white px-3 py-1.5 rounded-lg hover:bg-rose-800 font-medium"
                  >
                    Reject
                  </button>
                </>
              )}
              {item.status === 'approved' && (
                <span className="text-xs text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg">
                  ✓ Scholar Approved
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
