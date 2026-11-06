import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { dateFmt } from '@/lib/format';
export const metadata = { title: 'Notifications' };
export default async function Page() {
  const s = await requireUser('/account/notifications');
  const items = await db.notification.findMany({ where: { userId: s.userId }, orderBy: { createdAt: 'desc' }, take: 50 });
  await db.notification.updateMany({ where: { userId: s.userId, isRead: false }, data: { isRead: true } });
  return <div className="mx-auto max-w-2xl"><h1 className="text-2xl font-bold">Notifications</h1><div className="card mt-4 divide-y">{items.length === 0 && <p className="p-5 text-sm text-gray-500">Nothing yet.</p>}{items.map((n) => <div key={n.id} className={`p-4 text-sm ${n.isRead ? '' : 'bg-brand-50'}`}><p className="font-semibold">{n.title}</p><p className="text-gray-700">{n.body}</p><p className="mt-1 text-xs text-gray-500">{dateFmt(n.createdAt)}{n.link && <> · <Link href={n.link} className="text-brand underline">View</Link></>}</p></div>)}</div></div>;
}
