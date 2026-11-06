import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import { signout } from '@/app/actions/auth';

const nav = [
  ['Dashboard', '/seller/dashboard', '📊'], ['Orders', '/seller/orders', '📦'], ['Returns', '/seller/returns', '↩️'], ['Products', '/seller/products', '🏷️'], ['Inventory', '/seller/inventory', '📋'],
  ['Deals', '/seller/deals', '⚡'], ['Coupons', '/seller/coupons', '🎟️'], ['Advertising', '/seller/ads', '📣'], ['Payments', '/seller/payments', '💰'], ['Shop performance', '/seller/performance', '⭐'], ['Reports', '/seller/reports', '📈'], ['Settings', '/seller/settings', '⚙️'], ['Help', '/seller/help', '❓'],
];

export default function SellerShell({ children, storeName, status, title }: { children: React.ReactNode; storeName: string; status: string; title?: string }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-30 border-b bg-white">
        <div className="flex items-center gap-4 px-4 py-2.5">
          <Logo href="/seller/dashboard" sub="Maker Studio" size="sm" />
          <span className="ml-2 hidden rounded-full bg-navy-50 px-3 py-1 text-xs font-semibold text-navy sm:inline">{storeName}</span>
          {status !== 'APPROVED' && <span className="badge bg-amber-100 text-amber-800">{status}</span>}
          <div className="ml-auto flex items-center gap-3 text-sm">
            <Link href="/" className="text-gray-600 hover:text-brand">View marketplace</Link>
            <form action={signout}><button className="btn-outline py-1.5 text-xs">Sign out</button></form>
          </div>
        </div>
      </header>
      <div className="flex">
        <aside className="hidden w-56 shrink-0 border-r bg-white md:block min-h-[calc(100vh-57px)]">
          <nav className="p-3 text-sm">{nav.map(([l, h, i]) => <Link key={h} href={h} className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-700 hover:bg-brand-50 hover:text-brand"><span>{i}</span>{l}</Link>)}</nav>
        </aside>
        <main className="min-w-0 flex-1 p-4 sm:p-6">
          <nav className="mb-3 flex gap-2 overflow-x-auto text-xs md:hidden">{nav.map(([l, h]) => <Link key={h} href={h} className="whitespace-nowrap rounded-full border bg-white px-3 py-1">{l}</Link>)}</nav>
          {title && <h1 className="mb-4 text-2xl font-bold">{title}</h1>}
          {children}
        </main>
      </div>
    </div>
  );
}
