import { db } from '@/lib/db';
import AdminShell from '@/components/admin/AdminShell';
import { saveBanner, deleteBanner } from '@/app/actions/admin';
export default async function Page() {
  const banners = await db.banner.findMany({ orderBy: { sortOrder: 'asc' } });
  const Form = ({ b }: { b?: any }) => <form action={saveBanner} className="grid gap-2 sm:grid-cols-6 text-xs">{b?.id && <input type="hidden" name="id" value={b.id} />}<input name="title" defaultValue={b?.title} placeholder="Headline" className="input py-1 sm:col-span-2" required /><input name="subtitle" defaultValue={b?.subtitle ?? ''} placeholder="Subtitle" className="input py-1 sm:col-span-2" /><input name="linkUrl" defaultValue={b?.linkUrl ?? '/'} placeholder="Link" className="input py-1" /><input name="imageUrl" defaultValue={b?.imageUrl ?? ''} placeholder="Image URL" className="input py-1" /><input name="sortOrder" type="number" defaultValue={b?.sortOrder ?? 0} className="input py-1" /><button className="btn-outline py-1">{b ? 'Save' : 'Add banner'}</button></form>;
  return <AdminShell title="Home page banners"><div className="card mb-4 p-4"><Form /></div><div className="space-y-3">{banners.map((b) => <div key={b.id} className="card p-4"><Form b={b} /><form action={deleteBanner} className="mt-2"><input type="hidden" name="id" value={b.id} /><button className="text-xs text-red-600">Delete</button></form></div>)}</div></AdminShell>;
}
