import { requireApprovedSeller } from '@/lib/auth';
import { db } from '@/lib/db';
import SellerShell from '@/components/seller/SellerShell';
import ProductForm from '@/components/seller/ProductForm';
export default async function Page() {
  const { seller } = await requireApprovedSeller();
  const categories = await db.category.findMany({ where: { isActive: true, parentId: { not: null } }, include: { parent: true }, orderBy: [{ parent: { sortOrder: 'asc' } }, { sortOrder: 'asc' }] });
  return <SellerShell storeName={seller.storeName} status={seller.status} title="New listing"><ProductForm categories={categories} /></SellerShell>;
}
