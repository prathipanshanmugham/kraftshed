import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import Stars from '@/components/ui/Stars';
import { dateFmt } from '@/lib/format';
export default async function Page({ params, searchParams }: { params: { slug: string }; searchParams: Record<string, string | undefined> }) {
  const seller = await db.seller.findUnique({ where: { slug: params.slug } });
  if (!seller || seller.status !== 'APPROVED') notFound();
  return (
    <div>
      <div className="card overflow-hidden">
        <div className="h-32 bg-gradient-to-r from-brand to-navy" style={seller.bannerUrl ? { backgroundImage: `url(${seller.bannerUrl})`, backgroundSize: 'cover' } : {}} />
        <div className="flex items-end gap-4 px-6 pb-5 -mt-8">
          <div className="flex h-20 w-20 items-center justify-center overflow-hidden rounded-xl border-4 border-white bg-brand-50 text-3xl shadow">{seller.logoUrl ? /* eslint-disable-next-line @next/next/no-img-element */ <img src={seller.logoUrl} alt="" className="h-full w-full object-cover" /> : '🏺'}</div>
          <div className="pt-8"><h1 className="text-2xl font-bold">{seller.storeName}</h1>{seller.tagline && <p className="text-sm text-gray-600">{seller.tagline}</p>}<div className="mt-1 flex items-center gap-3 text-sm"><Stars value={seller.ratingAvg} count={seller.ratingCount} /><span className="text-gray-500">Maker since {dateFmt(seller.createdAt)}</span>{seller.pickupCity && <span className="text-gray-500">📍 {seller.pickupCity}, {seller.pickupState}</span>}</div></div>
        </div>
        {seller.description && <p className="border-t px-6 py-4 text-sm text-gray-700">{seller.description}</p>}
      </div>
      <div className="mt-6"><SellerProducts sellerId={seller.id} params={searchParams} slug={seller.slug} /></div>
    </div>
  );
}
async function SellerProducts({ sellerId, params, slug }: { sellerId: string; params: Record<string, string | undefined>; slug: string }) {
  const { searchProducts } = await import('@/lib/catalog');
  const ProductCard = (await import('@/components/store/ProductCard')).default;
  const Pagination = (await import('@/components/ui/Pagination')).default;
  const res = await searchProducts({ sellerId, page: Number(params.page ?? 1), sort: params.sort });
  return <div><h2 className="mb-3 text-lg font-bold">All products ({res.total})</h2><div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">{res.items.map((p) => <ProductCard key={p.id} p={p} />)}</div><Pagination page={res.page} pages={res.pages} base={`/s/${slug}`} /></div>;
}
