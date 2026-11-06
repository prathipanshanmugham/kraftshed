import { db } from '@/lib/db';
import { dateFmt } from '@/lib/format';
import AdminShell from '@/components/admin/AdminShell';
import { setUserRole } from '@/app/actions/admin';
export default async function Page({ searchParams }: { searchParams: { q?: string } }) {
  const users = await db.user.findMany({ where: searchParams.q ? { OR: [{ email: { contains: searchParams.q, mode: 'insensitive' } }, { name: { contains: searchParams.q, mode: 'insensitive' } }] } : {}, include: { _count: { select: { orders: true } }, seller: { select: { storeName: true } } }, orderBy: { createdAt: 'desc' }, take: 100 });
  return <AdminShell title="Users"><form className="mb-4"><input name="q" defaultValue={searchParams.q} placeholder="Search name or email" className="input w-72 py-1" /></form><div className="card overflow-x-auto"><table className="table"><thead><tr><th>Name</th><th>Email</th><th>Phone</th><th>Role</th><th>Store</th><th>Orders</th><th>Joined</th></tr></thead><tbody>{users.map((u) => <tr key={u.id}><td>{u.name}</td><td>{u.email}</td><td>{u.phone ?? '—'}</td><td><form action={setUserRole} className="flex gap-1"><input type="hidden" name="id" value={u.id} /><select name="role" defaultValue={u.role} className="input w-28 py-1 text-xs"><option>BUYER</option><option>SELLER</option><option>ADMIN</option></select><button className="btn-outline py-1 text-xs">Set</button></form></td><td className="text-xs">{u.seller?.storeName ?? '—'}</td><td>{u._count.orders}</td><td className="text-xs">{dateFmt(u.createdAt)}</td></tr>)}</tbody></table></div></AdminShell>;
}
