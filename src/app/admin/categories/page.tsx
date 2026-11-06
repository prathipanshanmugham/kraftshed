import { db } from '@/lib/db';
import AdminShell from '@/components/admin/AdminShell';
import { saveCategory, deleteCategory } from '@/app/actions/admin';
export default async function Page() {
  const cats = await db.category.findMany({ where: { parentId: null }, include: { children: { orderBy: { sortOrder: 'asc' }, include: { _count: { select: { products: true } } } }, _count: { select: { products: true } } }, orderBy: { sortOrder: 'asc' } });
  const Form = ({ c, parentId }: { c?: any; parentId?: string }) => <form action={saveCategory} className="flex flex-wrap items-center gap-2 text-xs">{c?.id && <input type="hidden" name="id" value={c.id} />}{parentId && <input type="hidden" name="parentId" value={parentId} />}<input name="name" defaultValue={c?.name} placeholder={parentId ? 'Sub-category name' : 'Category name'} className="input w-44 py-1" required /><input name="sortOrder" type="number" defaultValue={c?.sortOrder ?? 0} className="input w-16 py-1" title="Sort" /><input name="imageUrl" defaultValue={c?.imageUrl ?? ''} placeholder="Image URL" className="input w-40 py-1" />{!parentId && <input name="description" defaultValue={c?.description ?? ''} placeholder="Description" className="input w-48 py-1" />}<button className="btn-outline py-1">{c ? 'Save' : 'Add'}</button></form>;
  return (
    <AdminShell title="Categories">
      <div className="card mb-4 p-4"><h2 className="mb-2 font-bold">Add top-level category</h2><Form /></div>
      <div className="space-y-4">{cats.map((c) => (
        <div key={c.id} className="card p-4"><div className="flex flex-wrap items-center gap-3"><span className="font-bold">{c.name}</span><span className="text-xs text-gray-500">/c/{c.slug} · {c._count.products} products</span><Form c={c} />{c._count.products === 0 && c.children.length === 0 && <form action={deleteCategory}><input type="hidden" name="id" value={c.id} /><button className="text-xs text-red-600">Delete</button></form>}</div>
          <div className="mt-3 space-y-2 border-l-2 pl-4">{c.children.map((s) => <div key={s.id} className="flex flex-wrap items-center gap-3"><span className="text-sm">{s.name} <span className="text-xs text-gray-500">({s._count.products})</span></span><Form c={s} parentId={c.id} />{s._count.products === 0 && <form action={deleteCategory}><input type="hidden" name="id" value={s.id} /><button className="text-xs text-red-600">Delete</button></form>}</div>)}<Form parentId={c.id} /></div>
        </div>
      ))}</div>
    </AdminShell>
  );
}
