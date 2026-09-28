import { useEffect, useState } from 'react';
import { db, ActionItemRecord, ActionTemplateRecord } from '../../core/db';
import { analytics } from '../../core/analytics';

interface ActionDisplayItem {
  item: ActionItemRecord;
  template: ActionTemplateRecord | null;
  completedToday: boolean;
}

interface Props {
  onBrowseSurahs: () => void;
}

export function TodayScreen({ onBrowseSurahs }: Props) {
  const [actions, setActions] = useState<ActionDisplayItem[]>([]);
  const [loading, setLoading] = useState(true);
  const todayStr = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    async function loadTodayActions() {
      const items = await db.getActionItems();
      const activeItems = items.filter((i) => i.status === 'active');

      const displays: ActionDisplayItem[] = await Promise.all(
        activeItems.map(async (item) => {
          const tmpl = await db.getActionTemplate(item.templateId);
          const completed = await db.isActionCompletedToday(item.id, todayStr);
          return { item, template: tmpl, completedToday: completed };
        })
      );

      setActions(displays);
      setLoading(false);
    }

    loadTodayActions();
  }, [todayStr]);

  async function handleToggleCompletion(actionId: string, templateId: string) {
    const isNowCompleted = await db.toggleActionCompletion(actionId, todayStr);

    setActions((prev) =>
      prev.map((a) => (a.item.id === actionId ? { ...a, completedToday: isNowCompleted } : a))
    );

    if (isNowCompleted) {
      analytics.track('action_completed', {
        template_id: templateId,
        day_index: Math.floor(Date.now() / (1000 * 60 * 60 * 24)),
      });
    }
  }

  if (loading) {
    return (
      <div className="p-8 text-center text-stone-500 animate-pulse">
        Loading Today's action checklist...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm flex items-center justify-between">
        <div>
          <h1 className="text-xl font-serif font-bold text-stone-900">Today's Micro-Actions</h1>
          <p className="text-xs text-stone-600 mt-0.5">
            Verse-anchored daily actions. No pressure, no streaks.
          </p>
        </div>
        <span className="text-xs font-mono bg-stone-100 text-stone-700 px-3 py-1.5 rounded-lg border border-stone-200">
          {todayStr}
        </span>
      </div>

      {/* Action Checklist or Empty State */}
      {actions.length === 0 ? (
        <div className="bg-white rounded-2xl border border-stone-200 p-12 text-center space-y-4 shadow-sm">
          <div className="w-12 h-12 rounded-full bg-amber-100 text-amber-900 text-xl font-bold flex items-center justify-center mx-auto">
            &check;
          </div>
          <div className="space-y-1">
            <h3 className="text-base font-semibold text-stone-900">No actions yet</h3>
            <p className="text-sm text-stone-600 max-w-sm mx-auto">
              Pick a micro-action from any verse while reading to add it to your daily checklist.
            </p>
          </div>
          <button
            onClick={onBrowseSurahs}
            className="px-5 py-2.5 bg-amber-900 hover:bg-amber-950 text-white text-sm font-medium rounded-xl transition-all shadow-sm"
          >
            Browse Surahs to pick an action
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {actions.map(({ item, template, completedToday }) => (
            <div
              key={item.id}
              onClick={() => template && handleToggleCompletion(item.id, template.id)}
              className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-start space-x-4 rtl:space-x-reverse ${
                completedToday
                  ? 'bg-stone-50 border-stone-200 opacity-75'
                  : 'bg-white border-stone-200 hover:border-amber-300 shadow-sm'
              }`}
            >
              {/* Checkbox */}
              <div
                className={`w-6 h-6 rounded-lg border flex items-center justify-center shrink-0 mt-0.5 transition-colors ${
                  completedToday
                    ? 'bg-emerald-600 border-emerald-600 text-white font-bold text-xs'
                    : 'border-stone-300 bg-stone-50'
                }`}
              >
                {completedToday && '✓'}
              </div>

              {/* Action content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center space-x-2 rtl:space-x-reverse mb-1">
                  <span className="text-xs font-mono font-semibold text-amber-900 bg-amber-100 px-2 py-0.5 rounded">
                    Verse {item.verseRef}
                  </span>
                  {completedToday && (
                    <span className="text-xs text-emerald-700 font-medium">Completed today</span>
                  )}
                </div>
                <p
                  className={`text-sm leading-relaxed ${
                    completedToday ? 'line-through text-stone-500' : 'text-stone-900 font-medium'
                  }`}
                >
                  {template ? template.text : 'Curated verse action'}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
