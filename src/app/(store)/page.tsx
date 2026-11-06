import Link from 'next/link';
import { db } from '@/lib/db';
import { productInclude } from '@/lib/catalog';
import ProductGrid from '@/components/store/ProductGrid';

export default async function Home() {
  const now = new Date();
  const [banners, categories, deals, popular, newest, featured, makers] = await Promise.all([
    db.banner.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' }, take: 3 }),
    db.category.findMany({ where: { parentId: null, isActive: true }, orderBy: { sortOrder: 'asc' }, take: 10 }),
    db.product.findMany({ where: { status: 'ACTIVE', deal: { startsAt: { lte: now }, endsAt: { gte: now } } }, include: productInclude, take: 5 }),
    db.product.findMany({ where: { status: 'ACTIVE' }, include: productInclude, orderBy: { salesCount: 'desc' }, take: 10 }),
    db.product.findMany({ where: { status: 'ACTIVE' }, include: productInclude, orderBy: { createdAt: 'desc' }, take: 5 }),
    db.product.findMany({ where: { status: 'ACTIVE', isFeatured: true }, include: productInclude, take: 5 }),
    db.seller.findMany({ where: { status: 'APPROVED' }, orderBy: { ratingCount: 'desc' }, take: 4 }),
  ]);
  const hero = banners[0];
  return (
    <div>
      <section className="grid items-center gap-8 py-6 lg:grid-cols-[1.1fr_1fr] lg:py-10">
        <div>
          <p className="eyebrow">Handmade in India</p>
          <h1 className="mt-3 text-4xl font-bold leading-[1.05] sm:text-6xl">{hero?.title ?? 'Made by hand. Found by you.'}</h1>
          <p className="mt-5 max-w-lg text-lg text-ink-soft">{hero?.subtitle ?? 'Pottery, leather, textiles, paints and thousands of one-of-a-kind pieces from independent makers — plus the supplies to create your own.'}</p>
          <div className="mt-7 flex flex-wrap gap-3"><Link href={hero?.linkUrl ?? '/categories'} className="btn-primary px-7 py-3">Start exploring</Link><Link href="/seller" className="btn-outline px-7 py-3">Open your shop</Link></div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {featured.slice(0, 3).map((p, i) => (
            <Link key={p.id} href={`/p/${p.slug}`} className={`overflow-hidden rounded-2xl bg-sand-light ${i === 0 ? 'col-span-2 row-span-2 aspect-square' : 'aspect-square'}`}>
              {p.images[0] && /* eslint-disable-next-line @next/next/no-img-element */ <img src={p.images[0].url} alt={p.title} className="h-full w-full object-cover transition hover:scale-105" />}
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-10">
        <div className="mb-5 flex items-end justify-between"><div><p className="eyebrow">Browse</p><h2 className="text-2xl font-bold">What are you making?</h2></div><Link href="/categories" className="text-sm font-bold text-forest hover:underline">All categories</Link></div>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {categories.map((c) => (
            <Link key={c.id} href={`/c/${c.slug}`} className="flex shrink-0 items-center gap-3 rounded-full border border-sand bg-white py-2 pl-2 pr-5 transition hover:border-forest hover:shadow-card">
              <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-full bg-forest-light text-forest">{c.imageUrl ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={c.imageUrl} alt="" className="h-full w-full object-cover" /> : <svg className="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.9L12 16.4 6.8 19.2l1-5.9L3.5 9.2l5.9-.9z"/></svg>}</span>
              <span className="text-sm font-bold">{c.name}</span>
            </Link>
          ))}
        </div>
      </section>

      {deals.length > 0 && <ProductGrid eyebrow="Limited time" title="Offers from makers" href="/deals" products={deals} />}
      <ProductGrid eyebrow="Community favourites" title="Most loved right now" href="/bestsellers" products={popular} />

      {makers.length > 0 && (
        <section className="mt-14 rounded-3xl bg-forest p-8 text-white sm:p-12">
          <p className="eyebrow text-clay-light">Meet the makers</p>
          <h2 className="mt-2 text-3xl font-bold text-white">Every piece has a person behind it.</h2>
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {makers.map((m) => (
              <Link key={m.id} href={`/s/${m.slug}`} className="rounded-2xl bg-white/10 p-5 transition hover:bg-white/15">
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-white/20 text-lg font-bold">{m.logoUrl ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={m.logoUrl} alt="" className="h-full w-full object-cover" /> : m.storeName[0]}</div>
                <p className="mt-3 font-bold">{m.storeName}</p>
                <p className="text-sm text-white/70">{m.tagline ?? `${m.pickupCity ?? ''}${m.pickupState ? `, ${m.pickupState}` : ''}`}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      <ProductGrid eyebrow="Fresh from the studio" title="Just in" href="/new" products={newest} />

      <section className="mt-16 grid gap-6 rounded-3xl border border-sand bg-white p-8 sm:grid-cols-3 sm:p-10">
        {[['Real makers, verified', 'Every shop is checked before it opens. You buy directly from the person who made or curated the piece.'], ['Pay the way you like', 'UPI, cards, net banking, wallets — or cash on delivery where the maker offers it.'], ['Returns, made simple', 'Returnable items can go back within the maker\'s window. Refunds land in your original payment method.']].map(([h, b], i) => (
          <div key={h}><span className="flex h-9 w-9 items-center justify-center rounded-full bg-clay-50 font-display text-lg font-bold text-clay">{i + 1}</span><h3 className="mt-3 text-lg font-bold">{h}</h3><p className="mt-1 text-sm text-ink-soft">{b}</p></div>
        ))}
      </section>
    </div>
  );
}
