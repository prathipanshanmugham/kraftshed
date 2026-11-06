'use server';
import { revalidatePath } from 'next/cache';
import { db } from '@/lib/db';
import { requireAdmin } from '@/lib/auth';
import { slugify, num } from '@/lib/format';
const str = (f: FormData, k: string) => String(f.get(k) ?? '').trim();
const opt = (f: FormData, k: string) => str(f, k) || null;

export async function reviewSeller(form: FormData) {
  await requireAdmin();
  const id = String(form.get('id')), action = String(form.get('action'));
  const status = action === 'approve' ? 'APPROVED' : action === 'reject' ? 'REJECTED' : action === 'suspend' ? 'SUSPENDED' : 'PENDING';
  const seller = await db.seller.update({ where: { id }, data: { status, rejectionReason: opt(form, 'reason'), commissionPercent: form.get('commissionPercent') ? Number(form.get('commissionPercent')) : undefined } });
  await db.notification.create({ data: { userId: seller.userId, title: `Store ${status.toLowerCase()}`, body: status === 'APPROVED' ? 'Congratulations! You can now list products on Kraftshed.' : (opt(form, 'reason') ?? `Your store status is now ${status}.`), link: '/seller' } });
  revalidatePath('/admin/sellers');
}

export async function reviewProduct(form: FormData) {
  await requireAdmin();
  const id = String(form.get('id')), action = String(form.get('action'));
  const data = action === 'approve' ? { status: 'ACTIVE' as const, rejectionReason: null } : action === 'reject' ? { status: 'REJECTED' as const, rejectionReason: opt(form, 'reason') ?? 'Does not meet listing guidelines' } : action === 'feature' ? { isFeatured: true } : action === 'unfeature' ? { isFeatured: false } : { status: 'INACTIVE' as const };
  const p = await db.product.update({ where: { id }, data, include: { seller: true } });
  if (action === 'approve' || action === 'reject') await db.notification.create({ data: { userId: p.seller.userId, title: `Listing ${action}d`, body: `${p.title}${p.rejectionReason ? ` — ${p.rejectionReason}` : ''}`, link: '/seller/products' } });
  revalidatePath('/admin/products');
}

export async function saveCategory(form: FormData) {
  await requireAdmin();
  const id = form.get('id') ? String(form.get('id')) : null;
  const name = str(form, 'name');
  if (!name) return;
  const data = { name, description: opt(form, 'description'), imageUrl: opt(form, 'imageUrl'), parentId: opt(form, 'parentId'), sortOrder: Number(form.get('sortOrder') || 0), isActive: form.get('isActive') !== 'off' };
  if (id) await db.category.update({ where: { id }, data });
  else { let slug = slugify(name); if (await db.category.findUnique({ where: { slug } })) slug += '-' + Math.random().toString(36).slice(2, 5); await db.category.create({ data: { ...data, slug } }); }
  revalidatePath('/admin/categories');
}
export async function deleteCategory(form: FormData) {
  await requireAdmin();
  const id = String(form.get('id'));
  const count = await db.product.count({ where: { categoryId: id } });
  if (count === 0) await db.category.delete({ where: { id } }).catch(() => {});
  revalidatePath('/admin/categories');
}

export async function resolveDispute(form: FormData) {
  await requireAdmin();
  const id = String(form.get('id'));
  const status = String(form.get('status')) as any;
  const d = await db.dispute.update({ where: { id }, data: { status, resolution: opt(form, 'resolution') } });
  await db.notification.create({ data: { userId: d.userId, title: 'Dispute update', body: `${d.subject}: ${status.replace(/_/g, ' ').toLowerCase()}${d.resolution ? ` — ${d.resolution}` : ''}`, link: `/orders/${d.orderId}` } });
  revalidatePath('/admin/disputes');
}

export async function createPayout(form: FormData) {
  await requireAdmin();
  const sellerId = String(form.get('sellerId'));
  const bal = await db.ledgerEntry.aggregate({ where: { sellerId }, _sum: { amount: true } });
  const amount = Number(form.get('amount') || num(bal._sum.amount));
  if (amount <= 0) return;
  const p = await db.payout.create({ data: { sellerId, amount, status: 'PROCESSING', periodFrom: new Date(Date.now() - 7 * 86400000), periodTo: new Date() } });
  await db.ledgerEntry.create({ data: { sellerId, type: 'PAYOUT', amount: -amount, reference: p.id, note: 'Weekly payout' } });
  revalidatePath('/admin/payouts');
}
export async function markPayoutPaid(form: FormData) {
  await requireAdmin();
  const id = String(form.get('id'));
  const p = await db.payout.update({ where: { id }, data: { status: 'PAID', utr: opt(form, 'utr'), paidAt: new Date() }, include: { seller: true } });
  await db.notification.create({ data: { userId: p.seller.userId, title: 'Payout sent', body: `₹${p.amount} has been transferred to your bank account. UTR: ${p.utr ?? '—'}`, link: '/seller/payments' } });
  revalidatePath('/admin/payouts');
}

export async function savePlatformCoupon(form: FormData) {
  await requireAdmin();
  const code = str(form, 'code').toUpperCase();
  if (code.length < 3) return;
  await db.coupon.upsert({ where: { code }, create: { code, description: opt(form, 'description'), percentOff: form.get('percentOff') ? Number(form.get('percentOff')) : null, amountOff: form.get('amountOff') ? Number(form.get('amountOff')) : null, minOrder: form.get('minOrder') ? Number(form.get('minOrder')) : null, maxUses: form.get('maxUses') ? Number(form.get('maxUses')) : null, endsAt: form.get('endsAt') ? new Date(String(form.get('endsAt'))) : null }, update: { isActive: true } });
  revalidatePath('/admin/coupons');
}
export async function toggleAnyCoupon(form: FormData) {
  await requireAdmin();
  const c = await db.coupon.findUnique({ where: { id: String(form.get('id')) } });
  if (c) await db.coupon.update({ where: { id: c.id }, data: { isActive: !c.isActive } });
  revalidatePath('/admin/coupons');
}

export async function saveBanner(form: FormData) {
  await requireAdmin();
  const id = form.get('id') ? String(form.get('id')) : null;
  const data = { title: str(form, 'title'), subtitle: opt(form, 'subtitle'), imageUrl: opt(form, 'imageUrl'), linkUrl: str(form, 'linkUrl') || '/', sortOrder: Number(form.get('sortOrder') || 0), isActive: form.get('isActive') !== 'off' };
  if (id) await db.banner.update({ where: { id }, data }); else await db.banner.create({ data });
  revalidatePath('/admin/banners'); revalidatePath('/');
}
export async function deleteBanner(form: FormData) {
  await requireAdmin();
  await db.banner.delete({ where: { id: String(form.get('id')) } }).catch(() => {});
  revalidatePath('/admin/banners'); revalidatePath('/');
}

export async function saveSettings(form: FormData) {
  await requireAdmin();
  for (const key of ['commission_percent', 'auto_approve_products', 'support_email', 'announcement']) {
    const value = String(form.get(key) ?? '');
    await db.setting.upsert({ where: { key }, create: { key, value }, update: { value } });
  }
  revalidatePath('/admin/settings');
}

export async function setUserRole(form: FormData) {
  await requireAdmin();
  await db.user.update({ where: { id: String(form.get('id')) }, data: { role: String(form.get('role')) as any } });
  revalidatePath('/admin/users');
}

export async function adminUpdateReturn(form: FormData) {
  await requireAdmin();
  const id = String(form.get('id'));
  const status = String(form.get('status')) as any;
  const rr = await db.returnRequest.update({ where: { id }, data: { status, sellerNote: opt(form, 'note') ?? undefined }, include: { orderItem: true } });
  if (status === 'REFUNDED') {
    await db.orderItem.update({ where: { id: rr.orderItemId }, data: { status: 'REFUNDED' } });
    await db.ledgerEntry.createMany({ data: [{ sellerId: rr.orderItem.sellerId, type: 'REFUND', amount: -num(rr.refundAmount ?? rr.orderItem.lineTotal), reference: rr.orderItemId, note: 'Refund (admin)' }, { sellerId: rr.orderItem.sellerId, type: 'ADJUSTMENT', amount: num(rr.orderItem.commission), reference: rr.orderItemId, note: 'Commission reversed (admin)' }] });
  }
  revalidatePath('/admin/returns');
}
