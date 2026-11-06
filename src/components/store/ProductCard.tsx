import Link from 'next/link';
import Stars from '@/components/ui/Stars';
import Price from '@/components/ui/Price';
import { effectivePrice } from '@/lib/cart';

type P = {
  slug: string; title: string; price: unknown; mrp: unknown; ratingAvg: unknown; ratingCount: number; stock: number;
  images: { url: string; alt?: string | null }[]; seller?: { storeName: string } | null;
  deal?: { dealPrice: unknown; startsAt: Date; endsAt: Date } | null; freeShippingOver?: unknown; shippingFee?: unknown;
};

export default function ProductCard({ p, sponsored }: { p: P; sponsored?: boolean }) {
  const img = p.images[0]?.url;
  const price = effectivePrice(p as any);
  const dealLive = p.deal && p.deal.endsAt > new Date() && p.deal.startsAt <= new Date();
  return (
    <Link href={`/p/${p.slug}`} className="group flex flex-col">
      <div className="relative aspect-[4/5] overflow-hidden rounded-2xl bg-sand-light">
        {img ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={img} alt={p.images[0]?.alt ?? p.title} className="h-full w-full object-cover transition duration-300 group-hover:scale-105" loading="lazy" />
        ) : (
          <div className="flex h-full items-center justify-center text-4xl text-sand-dark">✦</div>
        )}
        {dealLive && <span className="absolute left-3 top-3 rounded-full bg-clay px-2.5 py-1 text-[11px] font-extrabold text-white">Offer</span>}
        {sponsored && <span className="absolute right-3 top-3 rounded-full bg-white/90 px-2 py-0.5 text-[10px] font-bold text-ink-soft">Promoted</span>}
        {p.stock === 0 && <span className="absolute inset-x-3 bottom-3 rounded-full bg-ink/80 py-1 text-center text-xs font-bold text-white">Sold out</span>}
      </div>
      <div className="px-1 pt-3">
        {p.seller && <p className="text-xs font-semibold text-forest">{p.seller.storeName}</p>}
        <h3 className="mt-0.5 line-clamp-2 text-sm font-semibold leading-snug text-ink group-hover:underline">{p.title}</h3>
        <div className="mt-1.5"><Price price={price} mrp={p.mrp} size="sm" /></div>
        <div className="mt-1 flex items-center justify-between"><Stars value={p.ratingAvg} count={p.ratingCount} />{Number(p.shippingFee ?? 0) === 0 && <span className="text-[11px] font-semibold text-ink-soft">Free shipping</span>}</div>
      </div>
    </Link>
  );
}
