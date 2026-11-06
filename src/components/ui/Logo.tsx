import Link from 'next/link';

export default function Logo({ href = '/', sub, size = 'md', light }: { href?: string; sub?: string; size?: 'sm' | 'md'; light?: boolean }) {
  const h = size === 'sm' ? 'h-8' : 'h-10';
  return (
    <Link href={href} className="flex items-center gap-2.5 shrink-0">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.svg" alt="Kraftshed" className={h} />
      <span className="leading-none">
        <span className={`block font-display font-bold tracking-tight ${light ? 'text-white' : 'text-ink'} ${size === 'sm' ? 'text-xl' : 'text-2xl'}`}>Kraftshed</span>
        {sub && <span className="block pt-0.5 text-[10px] font-extrabold uppercase tracking-[0.18em] text-forest">{sub}</span>}
      </span>
    </Link>
  );
}
