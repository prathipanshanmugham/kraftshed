import Link from 'next/link';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';
import { productInclude } from '@/lib/catalog';
import { effectivePrice } from '@/lib/cart';
import { addDays, dateFmt, num } from '@/lib/format';
import Stars from '@/components/ui/Stars';
import Gallery from '@/components/store/Gallery';
import BuyBox from '@/components/store/BuyBox';
import ReviewForm from '@/components/store/ReviewForm';
import ProductGrid from '@/components/store/ProductGrid';
import { toggleWishlist } from '@/app/actions/cart';
import { askQuestion, markHelpful } from '@/app/actions/reviews';

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const p = await db.product.findUnique({ where: { slug: params.slug }, select: { title: true, description: true } });
  return { title: p?.title ?? 'Product', description: p?.description.slice(0, 160) };
}

export default async function Page({ params }: { params: { slug: string } }) {
  const session = await getSession();
  const p = await db.product.findUnique({
    where: { slug: params.slug },
    include: { images: { orderBy: { sortOrder: 'asc' } }, variants: true, category: { include: { parent: true } }, seller: true, deal: true, reviews: { include: { user: { select: { name: true } } }, orderBy: { helpfulCount: 'desc' }, take: 10 }, questions: { include: { user: { select: { name: true } } }, orderBy: { createdAt: 'desc' }, take: 10 } },
  });
  if (!p || (p.status !== 'ACTIVE' && session?.role !== 'ADMIN')) notFound();
  db.product.update({ where: { id: p.id }, data: { viewCount: { increment: 1 } } }).catch(() => {});
  const price = effectivePrice(p);
  const dealLive = p.deal && p.deal.startsAt <= new Date() && p.deal.endsAt >= new Date();
  const [related, wished, moreFromMaker] = await Promise.all([
    db.product.findMany({ where: { status: 'ACTIVE', categoryId: p.categoryId, id: { not: p.id } }, include: productInclude, take: 5, orderBy: { salesCount: 'desc' } }),
    session ? db.wishlistItem.findUnique({ where: { userId_productId: { userId: session.userId, productId: p.id } } }) : null,
    db.product.findMany({ where: { status: 'ACTIVE', sellerId: p.sellerId, id: { not: p.id } }, include: productInclude, take: 5 }),
  ]);
  const deliveryBy = dateFmt(addDays(new Date(), p.seller.handlingDays + 4));
  const dist = [5, 4, 3, 2, 1].map((r) => ({ r, n: p.reviews.filter((x) => x.rating === r).length }));

  return (
    <div>
      <nav className="mb-5 text-xs text-ink-soft">
        <Link href="/" className="hover:underline">Home</Link> / {p.category.parent && <><Link href={`/c/${p.category.parent.slug}`} className="hover:underline">{p.category.parent.name}</Link> / </>}<Link href={`/c/${p.category.slug}`} className="hover:underline">{p.category.name}</Link>
      </nav>
      <div className="grid gap-10 lg:grid-cols-[1.05fr_1fr]">
        <Gallery images={p.images} title={p.title} />
        <div>
          <div className="flex items-center gap-3">
            <Link href={`/s/${p.seller.slug}`} className="flex items-center gap-2 text-sm font-bold text-forest hover:underline">
              <span className="flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-forest-light text-xs">{p.seller.logoUrl ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={p.seller.logoUrl} alt="" className="h-full w-full object-cover" /> : p.seller.storeName[0]}</span>{p.seller.storeName}
            </Link>
            {p.seller.pickupCity && <span className="text-xs text-ink-soft">· {p.seller.pickupCity}, {p.seller.pickupState}</span>}
          </div>
          <h1 className="mt-2 text-3xl font-bold leading-tight">{p.title}</h1>
          <div className="mt-2 flex flex-wrap items-center gap-3 text-sm"><Stars value={p.ratingAvg} size="md" /><a href="#reviews" className="font-semibold text-ink-soft hover:underline">{p.ratingCount} reviews</a>{p.salesCount > 50 && <span className="badge bg-clay-50 text-clay-dark">{p.salesCount}+ sold</span>}{dealLive && <span className="badge bg-clay text-white">{p.deal!.label} · until {dateFmt(p.deal!.endsAt)}</span>}</div>

          <BuyBox product={{ id: p.id, slug: p.slug, stock: p.stock, codAvailable: p.codAvailable, returnable: p.returnable, returnDays: p.returnDays, shippingFee: p.shippingFee, freeShippingOver: p.freeShippingOver }} variants={p.variants.map((v) => ({ id: v.id, name: v.name, price: Number(v.price), stock: v.stock }))} price={price} mrp={num(p.mrp)} deliveryBy={deliveryBy} signedIn={!!session} />

          <form action={toggleWishlist} className="mt-4">
            <input type="hidden" name="productId" value={p.id} /><input type="hidden" name="slug" value={p.slug} />
            <button className="text-sm font-semibold text-ink-soft hover:text-clay">{wished ? '♥ Saved' : '♡ Keep for later'}</button>
          </form>

          <div className="mt-8 border-t border-sand pt-6">
            {p.bulletPoints.length > 0 && <><h2 className="text-lg font-bold">Highlights</h2><ul className="mt-2 space-y-1.5 text-sm">{p.bulletPoints.map((b, i) => <li key={i} className="flex gap-2"><span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-clay" />{b}</li>)}</ul></>}
            <dl className="mt-5 grid grid-cols-2 gap-x-6 gap-y-2 text-sm sm:grid-cols-3">
              {p.materials && <div><dt className="text-xs font-bold uppercase tracking-wide text-ink-soft">Materials</dt><dd>{p.materials}</dd></div>}
              {p.dimensions && <div><dt className="text-xs font-bold uppercase tracking-wide text-ink-soft">Size</dt><dd>{p.dimensions}</dd></div>}
              {p.weightGrams && <div><dt className="text-xs font-bold uppercase tracking-wide text-ink-soft">Weight</dt><dd>{p.weightGrams} g</dd></div>}
              <div><dt className="text-xs font-bold uppercase tracking-wide text-ink-soft">Made</dt><dd>{p.handmade ? 'By hand' : 'Small batch'} · {p.madeIn}</dd></div>
              {p.brand && <div><dt className="text-xs font-bold uppercase tracking-wide text-ink-soft">Maker / brand</dt><dd>{p.brand}</dd></div>}
            </dl>
          </div>
        </div>
      </div>

      <div className="mt-14 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div>
          <section><h2 className="text-2xl font-bold">The story</h2><div className="mt-3 max-w-3xl whitespace-pre-line text-[15px] leading-relaxed text-ink">{p.description}</div></section>

          <section id="reviews" className="mt-12">
            <h2 className="text-2xl font-bold">Reviews</h2>
            <div className="mt-4 space-y-5">
              {p.reviews.length === 0 && <p className="text-sm text-ink-soft">No reviews yet — be the first to share how it turned out.</p>}
              {p.reviews.map((r) => (
                <div key={r.id} className="border-b border-sand pb-5 last:border-0">
                  <div className="flex items-center gap-2"><Stars value={r.rating} /><span className="text-sm font-bold">{r.user.name}</span>{r.isVerified && <span className="badge bg-forest-light text-forest-dark">Bought on Kraftshed</span>}<span className="text-xs text-ink-soft">{dateFmt(r.createdAt)}</span></div>
                  {r.title && <p className="mt-1.5 font-bold">{r.title}</p>}
                  <p className="mt-1 text-sm">{r.body}</p>
                  {r.sellerReply && <p className="mt-2 rounded-xl bg-sand-light p-3 text-sm"><strong>{p.seller.storeName}:</strong> {r.sellerReply}</p>}
                  <form action={markHelpful} className="mt-2"><input type="hidden" name="id" value={r.id} /><input type="hidden" name="slug" value={p.slug} /><button className="text-xs font-semibold text-ink-soft hover:text-forest">Helpful · {r.helpfulCount}</button></form>
                </div>
              ))}
            </div>
          </section>

          <section className="mt-12">
            <h2 className="text-2xl font-bold">Ask the maker</h2>
            <form action={askQuestion} className="mt-3 flex gap-2">
              <input type="hidden" name="productId" value={p.id} /><input type="hidden" name="slug" value={p.slug} />
              <input name="question" className="input" placeholder="Can this be customised? How is it packed?" required />
              <button className="btn-secondary">Ask</button>
            </form>
            <ul className="mt-4 space-y-3 text-sm">
              {p.questions.map((q) => <li key={q.id}><p className="font-bold">{q.question}</p><p className="text-ink-soft">{q.answer ? q.answer : <em>The maker hasn&apos;t answered yet</em>}</p></li>)}
            </ul>
          </section>
        </div>
        <aside className="space-y-5">
          <div className="card p-5">
            <h3 className="font-bold">Rating breakdown</h3>
            <div className="mt-1 flex items-center gap-2"><span className="font-display text-3xl font-bold">{Number(p.ratingAvg).toFixed(1)}</span><Stars value={p.ratingAvg} /><span className="text-xs text-ink-soft">{p.ratingCount} reviews</span></div>
            <div className="mt-3 space-y-1.5">{dist.map(({ r, n }) => <div key={r} className="flex items-center gap-2 text-xs"><span className="w-4">{r}</span><div className="h-2 flex-1 rounded-full bg-sand"><div className="h-2 rounded-full bg-clay" style={{ width: `${p.reviews.length ? (n / p.reviews.length) * 100 : 0}%` }} /></div><span className="w-6 text-right text-ink-soft">{n}</span></div>)}</div>
            <div className="mt-4">{session ? <ReviewForm productId={p.id} /> : <Link href={`/signin?next=/p/${p.slug}`} className="btn-outline w-full">Sign in to review</Link>}</div>
          </div>
          <div className="card p-5">
            <h3 className="font-bold">About {p.seller.storeName}</h3>
            <p className="mt-1 text-sm text-ink-soft line-clamp-4">{p.seller.description ?? p.seller.tagline}</p>
            <p className="mt-2 text-xs text-ink-soft">Ships in {p.seller.handlingDays} day{p.seller.handlingDays === 1 ? '' : 's'} · {Number(p.seller.ratingAvg).toFixed(1)} ★ shop rating</p>
            <Link href={`/s/${p.seller.slug}`} className="btn-outline mt-3 w-full">Visit the shop</Link>
          </div>
        </aside>
      </div>

      {moreFromMaker.length > 0 && <ProductGrid eyebrow={p.seller.storeName} title="More from this maker" href={`/s/${p.seller.slug}`} products={moreFromMaker} />}
      {related.length > 0 && <ProductGrid eyebrow={p.category.name} title="You might also like" href={`/c/${p.category.slug}`} products={related} />}
    </div>
  );
}
