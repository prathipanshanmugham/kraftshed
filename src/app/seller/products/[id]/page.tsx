import { notFound } from 'next/navigation';
import { requireSeller } from '@/lib/auth';
import { db } from '@/lib/db';
import SellerShell from '@/components/seller/SellerShell';
import ProductForm from '@/components/seller/ProductForm';
export default async function Page({ params }: { params: { id: string } }) {
  const { seller } = await requireSeller();
  const [p, categories] = await Promise.all([
    db.product.findFirst({ where: { id: params.id, sellerId: seller.id }, include: { images: { orderBy: { sortOrder: 'asc' } }, variants: true } }),
    db.category.findMany({ where: { isActive: true, parentId: { not: null } }, include: { parent: true }, orderBy: [{ parent: { sortOrder: 'asc' } }, { sortOrder: 'asc' }] }),
  ]);
  if (!p) notFound();
  const plain = JSON.parse(JSON.stringify(p));
  return <SellerShell storeName={seller.storeName} status={seller.status} title="Edit product"><ProductForm p={plain} categories={categories} /></SellerShell>;
}
