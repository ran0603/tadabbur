import { useEffect, useState } from 'react';
import { db, ActionTemplateRecord } from '../../core/db';
import { analytics } from '../../core/analytics';

interface Props {
  verseRef: string;
}

export function VerseActionMenu({ verseRef }: Props) {
  const [templates, setTemplates] = useState<ActionTemplateRecord[]>([]);
  const [addedIds, setAddedIds] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function loadTemplates() {
      const tmpls = await db.getActionTemplatesForVerse(verseRef);
      setTemplates(tmpls);

      const items = await db.getActionItems();
      const added = new Set(
        items.filter((i) => i.verseRef === verseRef).map((i) => i.templateId)
      );
      setAddedIds(added);
    }
    loadTemplates();
  }, [verseRef]);

  if (templates.length === 0) return null;

  async function handleAddAction(tmpl: ActionTemplateRecord) {
    if (addedIds.has(tmpl.id)) return;

    await db.addActionItem(tmpl.id, verseRef);
    setAddedIds((prev) => new Set(prev).add(tmpl.id));

    analytics.track('action_added', {
      template_id: tmpl.id,
      verse_ref: verseRef,
    });
  }

  return (
    <div className="mt-3 pt-3 border-t border-stone-100/80 flex flex-wrap items-center gap-2">
      {templates.map((tmpl) => {
        const isAdded = addedIds.has(tmpl.id);
        return (
          <button
            key={tmpl.id}
            onClick={() => handleAddAction(tmpl)}
            disabled={isAdded}
            className={`text-xs px-3 py-1.5 rounded-lg font-medium transition-all flex items-center space-x-1.5 rtl:space-x-reverse ${
              isAdded
                ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 cursor-default'
                : 'bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200/80 active:scale-95'
            }`}
          >
            <span>{isAdded ? '✓ Added to Today' : '+ Add to action checklist'}</span>
          </button>
        );
      })}
    </div>
  );
}
