import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import SearchBar from './SearchBar';

export default async function Header() {
  const session = await getSession();
  const [categories, cartCount] = await Promise.all([
    db.category.findMany({ where: { parentId: null, isActive: true }, orderBy: { sortOrder: 'asc' } }),
    session ? db.cartItem.aggregate({ _sum: { quantity: true }, where: { cart: { userId: session.userId }, savedForLater: false } }).then((r) => r._sum.quantity ?? 0) : Promise.resolve(0),
  ]);
  const cats = categories.map((c) => ({ name: c.name, slug: c.slug }));

  return (
    <header className="sticky top-0 z-40 border-b border-sand bg-paper/95 backdrop-blur">
      <div className="container-x flex items-center gap-4 py-3">
        <Logo href="/" size="sm" />
        <div className="hidden min-w-0 flex-1 px-6 md:block"><SearchBar categories={cats} /></div>
        <nav className="ml-auto flex items-center gap-1 text-sm font-semibold">
          <Link href="/seller" className="hidden rounded-full px-3 py-2 text-forest hover:bg-forest-50 lg:block">Open a shop</Link>
          <Link href="/wishlist" aria-label="Saved items" className="rounded-full p-2 hover:bg-sand-light"><svg className="h-6 w-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 20s-7-4.4-9-9a4.5 4.5 0 0 1 8-3.5A4.5 4.5 0 0 1 21 11c-2 4.6-9 9-9 9z"/></svg></Link>
          <Link href={session ? '/account' : '/signin'} className="flex items-center gap-2 rounded-full px-3 py-2 hover:bg-sand-light">
            <span className="flex h-7 w-7 items-center justify-center rounded-full bg-forest text-xs font-extrabold text-white">{session ? session.name[0].toUpperCase() : '?'}</span>
            <span className="hidden sm:block">{session ? session.name.split(' ')[0] : 'Sign in'}</span>
          </Link>
          <Link href="/cart" className="relative flex items-center gap-2 rounded-full bg-ink px-4 py-2 text-white hover:bg-navy-light">
            <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M6 7h12l1 13H5L6 7z"/><path d="M9 7a3 3 0 0 1 6 0"/></svg>
            <span>Bag</span>{cartCount > 0 && <span className="rounded-full bg-clay px-1.5 text-xs font-extrabold">{cartCount}</span>}
          </Link>
        </nav>
      </div>
      <div className="container-x pb-3 md:hidden"><SearchBar categories={cats} /></div>
      <div className="border-t border-sand bg-white">
        <div className="container-x flex items-center gap-1 overflow-x-auto py-2 text-sm whitespace-nowrap">
          <Link href="/categories" className="rounded-full bg-sand-light px-3 py-1 font-bold">Browse all</Link>
          {categories.slice(0, 8).map((c) => <Link key={c.id} href={`/c/${c.slug}`} className="rounded-full px-3 py-1 text-ink-soft hover:bg-sand-light hover:text-ink">{c.name}</Link>)}
          <span className="mx-1 h-4 w-px bg-sand-dark" />
          <Link href="/deals" className="rounded-full px-3 py-1 font-bold text-clay hover:bg-clay-50">Offers</Link>
          <Link href="/bestsellers" className="rounded-full px-3 py-1 text-ink-soft hover:bg-sand-light hover:text-ink">Most loved</Link>
          <Link href="/new" className="rounded-full px-3 py-1 text-ink-soft hover:bg-sand-light hover:text-ink">Just in</Link>
          <Link href="/help" className="ml-auto rounded-full px-3 py-1 text-ink-soft hover:bg-sand-light hover:text-ink">Help</Link>
        </div>
      </div>
    </header>
  );
}
