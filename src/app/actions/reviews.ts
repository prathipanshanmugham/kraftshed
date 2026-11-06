'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { getSession } from '@/lib/auth';

async function recomputeRating(productId: string) {
  const agg = await db.review.aggregate({ where: { productId }, _avg: { rating: true }, _count: true });
  const p = await db.product.update({ where: { id: productId }, data: { ratingAvg: agg._avg.rating ?? 0, ratingCount: agg._count } });
  const sagg = await db.review.aggregate({ where: { product: { sellerId: p.sellerId } }, _avg: { rating: true }, _count: true });
  await db.seller.update({ where: { id: p.sellerId }, data: { ratingAvg: sagg._avg.rating ?? 0, ratingCount: sagg._count } });
}

export async function submitReview(prev: any, form: FormData) {
  const s = await getSession();
  if (!s) return { error: 'Please sign in to review.' };
  const productId = String(form.get('productId'));
  const rating = Number(form.get('rating'));
  const body = String(form.get('body') || '').trim();
  const title = String(form.get('title') || '').trim() || null;
  if (rating < 1 || rating > 5 || body.length < 10) return { error: 'Give a star rating and write at least 10 characters.' };
  const purchased = await db.orderItem.findFirst({ where: { productId, order: { userId: s.userId, status: { in: ['PAID', 'COMPLETED'] } } } });
  await db.review.upsert({
    where: { productId_userId: { productId, userId: s.userId } },
    create: { productId, userId: s.userId, rating, body, title, isVerified: !!purchased, orderItemId: purchased?.id },
    update: { rating, body, title },
  });
  await recomputeRating(productId);
  const p = await db.product.findUnique({ where: { id: productId } });
  revalidatePath(`/p/${p?.slug}`);
  return { success: 'Thanks! Your review has been posted.' };
}

export async function askQuestion(form: FormData) {
  const s = await getSession();
  const slug = String(form.get('slug'));
  if (!s) redirect(`/signin?next=/p/${slug}`);
  const question = String(form.get('question') || '').trim();
  if (question.length < 5) return;
  await db.productQuestion.create({ data: { productId: String(form.get('productId')), userId: s.userId, question } });
  revalidatePath(`/p/${slug}`);
}

export async function markHelpful(form: FormData) {
  await db.review.update({ where: { id: String(form.get('id')) }, data: { helpfulCount: { increment: 1 } } });
  revalidatePath(`/p/${form.get('slug')}`);
}
