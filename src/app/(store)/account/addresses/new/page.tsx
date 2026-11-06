import { requireUser } from '@/lib/auth';
import AddressForm from '@/components/store/AddressForm';
export default async function Page({ searchParams }: { searchParams: { back?: string } }) {
  await requireUser('/account/addresses/new');
  return <div className="mx-auto max-w-xl"><h1 className="mb-4 text-2xl font-bold">Add a new address</h1><AddressForm back={searchParams.back} /></div>;
}
