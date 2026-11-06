import { notFound } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import AddressForm from '@/components/store/AddressForm';
export default async function Page({ params }: { params: { id: string } }) {
  const s = await requireUser('/account/addresses');
  const a = await db.address.findFirst({ where: { id: params.id, userId: s.userId } });
  if (!a) notFound();
  return <div className="mx-auto max-w-xl"><h1 className="mb-4 text-2xl font-bold">Edit address</h1><AddressForm a={a} /></div>;
}
