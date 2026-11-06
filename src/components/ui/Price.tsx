import { inr, num } from '@/lib/format';

export default function Price({ price, mrp, size = 'md' }: { price: unknown; mrp?: unknown; size?: 'sm' | 'md' | 'lg' }) {
  const saving = mrp ? num(mrp) - num(price) : 0;
  const main = size === 'lg' ? 'text-3xl' : size === 'md' ? 'text-xl' : 'text-base';
  return (
    <div className="flex flex-wrap items-baseline gap-x-2 gap-y-1">
      <span className={`font-extrabold text-ink ${main}`}>{inr(price as number)}</span>
      {saving > 0 && <><span className="text-xs text-ink-soft line-through">{inr(mrp as number)}</span><span className="badge bg-forest-light text-forest-dark">Save {inr(saving)}</span></>}
    </div>
  );
}
