import Link from 'next/link';
import Logo from '@/components/ui/Logo';
export default function Footer() {
  const cols = [
    { h: 'Kraftshed', l: [['Our story', '/about'], ['Stories from makers', '/blog'], ['Careers', '/about#careers'], ['Press', '/about#press']] },
    { h: 'For makers', l: [['Open a shop', '/seller'], ['Maker Studio', '/seller/dashboard'], ['Promote your work', '/seller/ads'], ['Maker help', '/seller/help']] },
    { h: 'Support', l: [['Help centre', '/help'], ['Track an order', '/orders'], ['Returns & refunds', '/help'], ['Contact us', '/help']] },
    { h: 'Legal', l: [['Privacy policy', '/legal/privacy'], ['Terms of use', '/legal/terms'], ['Maker agreement', '/legal/seller-agreement'], ['Grievance officer', '/legal/grievance']] },
  ];
  return (
    <footer className="mt-20 border-t border-sand bg-sand-light">
      <div className="container-x grid gap-10 py-14 md:grid-cols-[1.4fr_repeat(4,1fr)]">
        <div><Logo /><p className="mt-3 max-w-xs text-sm text-ink-soft">A marketplace where India&apos;s makers sell what they create — and where you find the materials to make your own.</p></div>
        {cols.map((c) => (
          <div key={c.h}>
            <h4 className="mb-3 font-sans text-xs font-extrabold uppercase tracking-[0.16em] text-ink-soft">{c.h}</h4>
            <ul className="space-y-2 text-sm">{c.l.map(([t, h]) => <li key={t}><Link href={h} className="hover:text-forest hover:underline">{t}</Link></li>)}</ul>
          </div>
        ))}
      </div>
      <div className="border-t border-sand py-5 text-center text-xs text-ink-soft">© {new Date().getFullYear()} Kraftshed · Triagon Ventures · Coimbatore, Tamil Nadu</div>
    </footer>
  );
}
