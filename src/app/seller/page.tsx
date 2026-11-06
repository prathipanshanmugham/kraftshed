import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
import Logo from '@/components/ui/Logo';

export default async function Page() {
  const s = await getSession();
  if (s) {
    const seller = await db.seller.findUnique({ where: { userId: s.userId } });
    if (seller) redirect(seller.status === 'APPROVED' ? '/seller/dashboard' : '/seller/pending');
  }
  return (
    <div className="min-h-screen bg-cream">
      <header className="border-b bg-white"><div className="container-x flex items-center justify-between py-3"><Logo sub="Maker Studio" /><div className="flex gap-2 text-sm"><Link href="/" className="btn-ghost">Marketplace</Link><Link href={s ? '/seller/register' : '/signin?next=/seller/register'} className="btn-primary">Start selling</Link></div></div></header>
      <section className="container-x grid items-center gap-10 py-16 lg:grid-cols-2">
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-brand">Open a shop</p>
          <h1 className="mt-2 text-4xl font-extrabold leading-tight sm:text-5xl">Reach craft lovers across India. Keep more of what you earn.</h1>
          <p className="mt-4 text-lg text-gray-700">Kraftshed is built only for art and craft. List what you make, get orders, ship them your way and get paid weekly to your bank account.</p>
          <div className="mt-6 flex gap-3"><Link href={s ? '/seller/register' : '/signup?next=/seller/register'} className="btn-primary">Open your shop — it&apos;s free</Link><Link href="/seller/help" className="btn-outline">How it works</Link></div>
          <p className="mt-3 text-sm text-gray-500">No listing fees · 10% commission only when you sell · Weekly payouts</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[['🏪', 'Your own shop page', 'A store page with your logo, story and all your products.'], ['📦', 'Orders without the headache', 'Confirm, pack and ship with tracking — buyers get updates automatically.'], ['💰', 'Payouts you can trace', 'See every sale, commission and payout in one ledger.'], ['📣', 'Grow with offers & promotions', 'Run limited-time deals, coupons and sponsored placements.']].map(([i, h, b]) => <div key={h} className="card p-5"><div className="text-3xl">{i}</div><h3 className="mt-2 font-bold">{h}</h3><p className="mt-1 text-sm text-gray-600">{b}</p></div>)}
        </div>
      </section>
      <section className="bg-white py-14"><div className="container-x"><h2 className="text-center text-2xl font-bold">Open your shop in 3 steps</h2><div className="mt-8 grid gap-6 sm:grid-cols-3">{[['1', 'Create your account', 'Sign up with your email and tell us about your store.'], ['2', 'Complete KYC', 'Add PAN, GST (if any), pickup address and bank details. Approval in 1–2 working days.'], ['3', 'List & sell', 'Add products with photos and prices. Orders land in your Maker Studio dashboard.']].map(([n, h, b]) => <div key={n} className="text-center"><div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-brand text-xl font-bold text-white">{n}</div><h3 className="mt-3 font-bold">{h}</h3><p className="mt-1 text-sm text-gray-600">{b}</p></div>)}</div></div></section>
    </div>
  );
}
