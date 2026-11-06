import Link from 'next/link';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { deleteAddress, setDefaultAddress } from '@/app/actions/checkout';
export const metadata = { title: 'My addresses' };
export default async function Page() {
  const s = await requireUser('/account/addresses');
  const list = await db.address.findMany({ where: { userId: s.userId }, orderBy: [{ isDefault: 'desc' }, { createdAt: 'desc' }] });
  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="text-2xl font-bold">My addresses</h1>
      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <Link href="/account/addresses/new" className="card flex min-h-40 items-center justify-center border-2 border-dashed border-gray-300 text-gray-600 hover:border-brand hover:text-brand">+ Add address</Link>
        {list.map((a) => (
          <div key={a.id} className="card p-5 text-sm">
            {a.isDefault && <span className="badge mb-2 bg-navy-50 text-navy">Default</span>}
            <p className="font-bold">{a.fullName}</p><p>{a.line1}{a.line2 ? `, ${a.line2}` : ''}</p>{a.landmark && <p>{a.landmark}</p>}<p>{a.city}, {a.state} {a.pincode}</p><p>Phone: {a.phone}</p>
            <div className="mt-3 flex gap-3 text-brand">
              <Link href={`/account/addresses/${a.id}`} className="hover:underline">Edit</Link>
              <form action={deleteAddress}><input type="hidden" name="id" value={a.id} /><button className="hover:underline">Remove</button></form>
              {!a.isDefault && <form action={setDefaultAddress}><input type="hidden" name="id" value={a.id} /><button className="hover:underline">Set as default</button></form>}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
