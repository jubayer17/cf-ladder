import { progressLabels } from '@/lib/progress';
export default function ProgressLegend() {
  return <div className="desk-progress-legend" aria-label="Problem progress color legend">{(['solved','failed','pending','unsolved'] as const).map(state => <span key={state}><i data-state={state} aria-hidden="true" />{progressLabels[state]}</span>)}</div>;
}
