import { requireSeller } from '@/lib/auth';
import SellerShell from '@/components/seller/SellerShell';
import RegisterForm from '@/components/seller/RegisterForm';
export default async function Page() {
  const { seller } = await requireSeller();
  return <SellerShell storeName={seller.storeName} status={seller.status} title="Shop settings"><div className="max-w-2xl"><p className="mb-4 text-sm text-gray-600">Shop URL: <code className="rounded bg-gray-100 px-1">kraftshed.com/s/{seller.slug}</code> · Commission: {seller.commissionPercent ? `${seller.commissionPercent}%` : 'platform default'}</p><RegisterForm mode="settings" seller={JSON.parse(JSON.stringify(seller))} /></div></SellerShell>;
}
