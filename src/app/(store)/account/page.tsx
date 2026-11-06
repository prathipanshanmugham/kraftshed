import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { signout } from '@/app/actions/auth';
export const metadata = { title: 'My account' };
export default async function Page() {
  const s = await requireUser('/account');
  const seller = await db.seller.findUnique({ where: { userId: s.userId } });
  const tiles = [
    ['📦', 'My orders', 'Track, return or reorder', '/orders'],
    ['🔒', 'Profile & password', 'Name, mobile number, password', '/account/security'],
    ['📍', 'My addresses', 'Where your orders go', '/account/addresses'],
    ['♡', 'Saved items', 'Things you loved', '/wishlist'],
    ['🔔', 'Notifications', 'Order and account updates', '/account/notifications'],
    ['💬', 'Help centre', 'Orders, returns and refunds', '/help'],
    ['🏪', seller ? 'Maker Studio' : 'Open a shop', seller ? 'Manage your shop' : 'Start selling what you make', '/seller'],
    ...(s.role === 'ADMIN' ? [['🛠️', 'Admin panel', 'Marketplace administration', '/admin']] : []),
  ];
  return (
    <div>
      <div className="flex items-center justify-between"><h1 className="text-2xl font-bold">My account</h1><form action={signout}><button className="btn-outline text-sm">Sign out</button></form></div>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {tiles.map(([i, t, d, h]) => <Link key={t} href={h} className="card flex gap-4 p-5 transition hover:shadow-lg"><span className="text-3xl">{i}</span><span><span className="block font-bold">{t}</span><span className="text-sm text-gray-600">{d}</span></span></Link>)}
      </div>
    </div>
  );
}
