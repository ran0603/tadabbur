export interface AuditLogEntry {
  id: string;
  actor: string;
  entity: string;
  action: string;
  timestamp: string;
}

export function AuditLogViewer() {
  const logs: AuditLogEntry[] = [
    {
      id: 'log-1',
      actor: 'scholar_user_01',
      entity: 'ThematicBlock (block-78-1)',
      action: 'APPROVE_BLOCK',
      timestamp: new Date().toISOString(),
    },
    {
      id: 'log-2',
      actor: 'editor_user_02',
      entity: 'Surah (id: 78)',
      action: 'UPDATE_CORE_AXIS',
      timestamp: new Date(Date.now() - 3600000).toISOString(),
    },
  ];

  return (
    <div className="bg-white rounded-2xl border border-stone-200 p-6 shadow-sm space-y-4">
      <h2 className="text-lg font-bold text-stone-900 border-b border-stone-200 pb-3">
        Editorial Audit Log
      </h2>
      <div className="space-y-2">
        {logs.map((log) => (
          <div key={log.id} className="p-3 rounded-lg bg-stone-50 border border-stone-100 flex items-center justify-between text-xs">
            <div>
              <span className="font-semibold text-stone-900">{log.actor}</span>{' '}
              <span className="text-stone-600 font-mono bg-stone-200/70 px-1.5 py-0.5 rounded">{log.action}</span>{' '}
              <span className="text-stone-500">on {log.entity}</span>
            </div>
            <span className="text-stone-400 font-mono">{log.timestamp.slice(11, 19)}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
