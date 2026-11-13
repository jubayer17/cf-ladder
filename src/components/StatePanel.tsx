import type { ReactNode } from 'react';
import { AlertTriangle, CheckCircle2, Inbox, LoaderCircle, PlugZap } from 'lucide-react';
type Tone = 'info' | 'loading' | 'empty' | 'success' | 'error';
const icons = { info: PlugZap, loading: LoaderCircle, empty: Inbox, success: CheckCircle2, error: AlertTriangle };
export default function StatePanel({ tone = 'info', title, description, action, compact = false }: { tone?: Tone; title: string; description?: string; action?: ReactNode; compact?: boolean }) {
  const Icon = icons[tone];
  return <div className={`desk-state ${compact ? 'is-compact' : ''}`} data-tone={tone} role={tone === 'error' ? 'alert' : 'status'} aria-busy={tone === 'loading'}>
    <span className="desk-state-icon"><Icon size={compact ? 18 : 24} className={tone === 'loading' ? 'animate-spin' : ''} aria-hidden="true" /></span>
    <div className="desk-state-copy"><h3>{title}</h3>{description && <p>{description}</p>}{action && <div className="desk-state-action">{action}</div>}</div>
  </div>;
}
