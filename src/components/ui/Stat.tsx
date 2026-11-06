export default function Stat({ label, value, sub, accent }: { label: string; value: string | number; sub?: string; accent?: boolean }) {
  return <div className="card p-4"><p className="text-xs font-semibold uppercase tracking-wide text-gray-500">{label}</p><p className={`mt-1 text-2xl font-bold ${accent ? 'text-brand' : ''}`}>{value}</p>{sub && <p className="text-xs text-gray-500">{sub}</p>}</div>;
}
