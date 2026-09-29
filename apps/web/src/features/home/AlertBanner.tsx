export type AlertType = 'i' | 'w' | 'e' | 'o';

export interface AlertItem {
  id: string;
  type: AlertType;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}

interface AlertBannerProps {
  alerts: AlertItem[];
}

export function AlertBanner({ alerts }: AlertBannerProps) {
  if (!alerts || alerts.length === 0) return null;

  const icons: Record<AlertType, string> = {
    i: 'i',
    w: '!',
    e: '×',
    o: '✓',
  };

  return (
    <div className="alx">
      {alerts.map((item) => (
        <div key={item.id} className={`al al-${item.type}`} role="alert">
          <div className="ic">{icons[item.type]}</div>
          <div className="flex-1">
            <b className="block text-sm text-[var(--ink)]">{item.title}</b>
            <div className="sm mut">{item.description}</div>
          </div>
          {item.actionLabel && (
            <button
              onClick={item.onAction}
              className="ab"
            >
              {item.actionLabel}
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
