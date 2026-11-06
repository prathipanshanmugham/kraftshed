import { redirect } from 'next/navigation';
import { requireSeller } from '@/lib/auth';
import SellerShell from '@/components/seller/SellerShell';
export default async function Page() {
  const { seller } = await requireSeller();
  if (seller.status === 'APPROVED') redirect('/seller/dashboard');
  return <SellerShell storeName={seller.storeName} status={seller.status}><div className="card mx-auto max-w-xl p-8 text-center"><div className="text-5xl">{seller.status === 'PENDING' ? '⏳' : '⛔'}</div><h1 className="mt-3 text-2xl font-bold">{seller.status === 'PENDING' ? 'Application under review' : seller.status === 'REJECTED' ? 'Application not approved' : 'Store suspended'}</h1><p className="mt-2 text-sm text-gray-600">{seller.status === 'PENDING' ? 'We are verifying your details. You will be able to list products once approved — usually within 1–2 working days.' : seller.rejectionReason || 'Please contact makers@kraftshed.com.'}</p><a href="/seller/settings" className="btn-outline mt-5">Review your details</a></div></SellerShell>;
}
