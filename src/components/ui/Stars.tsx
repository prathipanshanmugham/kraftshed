export default function Stars({ value, count, size = 'sm' }: { value: unknown; count?: number; size?: 'sm' | 'md' }) {
  const v = Number(value as number);
  const pct = Math.max(0, Math.min(100, (v / 5) * 100));
  const h = size === 'sm' ? 'h-3.5' : 'h-5';
  const Row = ({ cls }: { cls: string }) => (
    <span className={`flex ${cls}`} aria-hidden>{[0, 1, 2, 3, 4].map((i) => <svg key={i} viewBox="0 0 20 20" className={`${h} w-auto`} fill="currentColor"><path d="M10 1.8l2.5 5.3 5.8.7-4.3 4 1.1 5.7L10 14.7l-5.1 2.8 1.1-5.7-4.3-4 5.8-.7z"/></svg>)}</span>
  );
  return (
    <span className="inline-flex items-center gap-1.5" title={`${v.toFixed(1)} out of 5`}>
      <span className="relative inline-block"><Row cls="text-sand-dark" /><span className="absolute inset-y-0 left-0 overflow-hidden" style={{ width: `${pct}%` }}><Row cls="text-clay" /></span></span>
      {count !== undefined && <span className="text-xs text-ink-soft">{count.toLocaleString('en-IN')}</span>}
    </span>
  );
}
