import Link from 'next/link';
import Logo from '@/components/ui/Logo';
import { signout } from '@/app/actions/auth';
const nav = [['Overview', '/admin', '📊'], ['Sellers', '/admin/sellers', '🏪'], ['Products', '/admin/products', '🏷️'], ['Categories', '/admin/categories', '🗂️'], ['Orders', '/admin/orders', '📦'], ['Returns', '/admin/returns', '↩️'], ['Disputes', '/admin/disputes', '⚖️'], ['Payouts', '/admin/payouts', '💸'], ['Coupons', '/admin/coupons', '🎟️'], ['Banners', '/admin/banners', '🖼️'], ['Users', '/admin/users', '👥'], ['Settings', '/admin/settings', '⚙️']];
export default function AdminShell({ children, title }: { children: React.ReactNode; title?: string }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="sticky top-0 z-30 border-b bg-navy text-white"><div className="flex items-center gap-4 px-4 py-2.5"><Logo href="/admin" sub="Admin" size="sm" light /><span className="hidden text-xs text-gray-300 sm:inline">Marketplace administration</span><div className="ml-auto flex items-center gap-3 text-sm"><Link href="/" className="hover:underline">Storefront</Link><form action={signout}><button className="rounded-md bg-white/10 px-3 py-1 text-xs hover:bg-white/20">Sign out</button></form></div></div></header>
      <div className="flex">
        <aside className="hidden w-52 shrink-0 border-r bg-white md:block min-h-[calc(100vh-49px)]"><nav className="p-3 text-sm">{nav.map(([l, h, i]) => <Link key={h} href={h} className="flex items-center gap-2 rounded-lg px-3 py-2 text-gray-700 hover:bg-navy-50 hover:text-navy"><span>{i}</span>{l}</Link>)}</nav></aside>
        <main className="min-w-0 flex-1 p-4 sm:p-6"><nav className="mb-3 flex gap-2 overflow-x-auto text-xs md:hidden">{nav.map(([l, h]) => <Link key={h} href={h} className="whitespace-nowrap rounded-full border bg-white px-3 py-1">{l}</Link>)}</nav>{title && <h1 className="mb-4 text-2xl font-bold">{title}</h1>}{children}</main>
      </div>
    </div>
  );
}
