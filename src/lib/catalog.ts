import { db } from './db';
import type { Prisma } from '@/generated/prisma/client';

export const productInclude = {
  images: { orderBy: { sortOrder: 'asc' as const }, take: 1 },
  seller: { select: { storeName: true, slug: true } },
  deal: true,
};

export async function searchProducts(opts: { q?: string; category?: string; min?: number; max?: number; rating?: number; sort?: string; page?: number; perPage?: number; sellerId?: string; freeShip?: boolean }) {
  const page = Math.max(1, opts.page ?? 1), perPage = opts.perPage ?? 20;
  const where: Prisma.ProductWhereInput = { status: 'ACTIVE', seller: { status: 'APPROVED' } };
  if (opts.q) {
    const words = opts.q.split(/\s+/).filter(Boolean);
    where.AND = words.map((w) => ({ OR: [{ title: { contains: w, mode: 'insensitive' } }, { description: { contains: w, mode: 'insensitive' } }, { tags: { has: w.toLowerCase() } }, { brand: { contains: w, mode: 'insensitive' } }] }));
  }
  if (opts.category) {
    const cat = await db.category.findUnique({ where: { slug: opts.category }, include: { children: { include: { children: true } } } });
    if (cat) {
      const ids = [cat.id, ...cat.children.map((c) => c.id), ...cat.children.flatMap((c) => c.children.map((g) => g.id))];
      where.categoryId = { in: ids };
    }
  }
  if (opts.min != null || opts.max != null) where.price = { gte: opts.min ?? 0, lte: opts.max ?? 10_000_000 };
  if (opts.rating) where.ratingAvg = { gte: opts.rating };
  if (opts.sellerId) where.sellerId = opts.sellerId;
  if (opts.freeShip) where.shippingFee = 0;

  const orderBy: Prisma.ProductOrderByWithRelationInput =
    opts.sort === 'price_asc' ? { price: 'asc' } : opts.sort === 'price_desc' ? { price: 'desc' } : opts.sort === 'rating' ? { ratingAvg: 'desc' } : opts.sort === 'newest' ? { createdAt: 'desc' } : { salesCount: 'desc' };

  const [items, total] = await Promise.all([
    db.product.findMany({ where, include: productInclude, orderBy, skip: (page - 1) * perPage, take: perPage }),
    db.product.count({ where }),
  ]);
  return { items, total, page, pages: Math.ceil(total / perPage) };
}

export async function sponsoredFor(q?: string, take = 2) {
  const campaigns = await db.adCampaign.findMany({
    where: { isActive: true, product: { status: 'ACTIVE' }, ...(q ? { keywords: { hasSome: q.toLowerCase().split(/\s+/) } } : {}) },
    include: { product: { include: productInclude } },
    orderBy: { bidPerClick: 'desc' },
    take,
  });
  if (campaigns.length) await db.adCampaign.updateMany({ where: { id: { in: campaigns.map((c) => c.id) } }, data: { impressions: { increment: 1 } } });
  return campaigns.map((c) => c.product);
}
