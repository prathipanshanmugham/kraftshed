'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { db } from '@/lib/db';
import { requireUser, requireSeller, requireApprovedSeller } from '@/lib/auth';
import { slugify, num } from '@/lib/format';

const str = (f: FormData, k: string) => String(f.get(k) ?? '').trim();
const opt = (f: FormData, k: string) => str(f, k) || null;

export async function registerSeller(prev: any, form: FormData) {
  const s = await requireUser('/seller/register');
  const storeName = str(form, 'storeName');
  if (storeName.length < 3) return { error: 'Shop name must be at least 3 characters' };
  const existing = await db.seller.findUnique({ where: { userId: s.userId } });
  if (existing) redirect('/seller/dashboard');
  let slug = slugify(storeName);
  if (await db.seller.findUnique({ where: { slug } })) slug = `${slug}-${Math.random().toString(36).slice(2, 6)}`;
  await db.seller.create({ data: { userId: s.userId, storeName, slug, tagline: opt(form, 'tagline'), description: opt(form, 'description'), businessType: opt(form, 'businessType'), legalName: opt(form, 'legalName'), gstin: opt(form, 'gstin'), pan: opt(form, 'pan'), pickupAddress: opt(form, 'pickupAddress'), pickupCity: opt(form, 'pickupCity'), pickupState: opt(form, 'pickupState'), pickupPincode: opt(form, 'pickupPincode'), bankAccountName: opt(form, 'bankAccountName'), bankAccountNo: opt(form, 'bankAccountNo'), bankIfsc: opt(form, 'bankIfsc'), upiId: opt(form, 'upiId') } });
  await db.user.update({ where: { id: s.userId }, data: { role: s.role === 'ADMIN' ? 'ADMIN' : 'SELLER' } });
  const admins = await db.user.findMany({ where: { role: 'ADMIN' }, select: { id: true } });
  await db.notification.createMany({ data: admins.map((a) => ({ userId: a.id, title: 'New seller application', body: `${storeName} applied to sell on Kraftshed`, link: '/admin/sellers' })) });
  redirect('/seller/pending');
}

export async function updateSellerSettings(prev: any, form: FormData) {
  const { seller } = await requireSeller();
  await db.seller.update({ where: { id: seller.id }, data: { storeName: str(form, 'storeName') || seller.storeName, tagline: opt(form, 'tagline'), description: opt(form, 'description'), logoUrl: opt(form, 'logoUrl'), bannerUrl: opt(form, 'bannerUrl'), handlingDays: Number(form.get('handlingDays') || 2), businessType: opt(form, 'businessType'), legalName: opt(form, 'legalName'), gstin: opt(form, 'gstin'), pan: opt(form, 'pan'), pickupAddress: opt(form, 'pickupAddress'), pickupCity: opt(form, 'pickupCity'), pickupState: opt(form, 'pickupState'), pickupPincode: opt(form, 'pickupPincode'), bankAccountName: opt(form, 'bankAccountName'), bankAccountNo: opt(form, 'bankAccountNo'), bankIfsc: opt(form, 'bankIfsc'), upiId: opt(form, 'upiId') } });
  revalidatePath('/seller/settings');
  return { success: 'Settings saved' };
}

function productData(form: FormData) {
  const title = str(form, 'title');
  const images = str(form, 'images').split('\n').map((x) => x.trim()).filter(Boolean);
  const bullets = str(form, 'bulletPoints').split('\n').map((x) => x.trim()).filter(Boolean);
  const tags = str(form, 'tags').split(',').map((x) => x.trim().toLowerCase()).filter(Boolean);
  const variants = str(form, 'variants').split('\n').map((l) => l.trim()).filter(Boolean).map((l) => { const [name, price, stock] = l.split('|').map((x) => x.trim()); return { name, price: Number(price) || 0, stock: Number(stock) || 0 }; }).filter((v) => v.name);
  return {
    title, images, bullets, tags, variants,
    data: {
      title, categoryId: str(form, 'categoryId'), brand: opt(form, 'brand'), description: str(form, 'description'), bulletPoints: bullets, materials: opt(form, 'materials'), dimensions: opt(form, 'dimensions'),
      weightGrams: form.get('weightGrams') ? Number(form.get('weightGrams')) : null, handmade: form.get('handmade') === 'on', sku: opt(form, 'sku'),
      mrp: Number(form.get('mrp') || form.get('price') || 0), price: Number(form.get('price') || 0), stock: Number(form.get('stock') || 0), lowStockAt: Number(form.get('lowStockAt') || 5),
      shippingFee: Number(form.get('shippingFee') || 0), freeShippingOver: form.get('freeShippingOver') ? Number(form.get('freeShippingOver')) : null,
      codAvailable: form.get('codAvailable') === 'on', returnable: form.get('returnable') === 'on', returnDays: Number(form.get('returnDays') || 7), tags,
    },
  };
}

export async function saveProduct(prev: any, form: FormData) {
  const { seller } = await requireApprovedSeller();
  const id = form.get('id') ? String(form.get('id')) : null;
  const pd = productData(form);
  if (pd.title.length < 5) return { error: 'Title must be at least 5 characters' };
  if (!pd.data.categoryId) return { error: 'Please choose a category' };
  if (pd.data.price <= 0) return { error: 'Price must be greater than 0' };
  if (pd.data.description.length < 20) return { error: 'Description must be at least 20 characters' };
  const submit = form.get('submit') === 'publish';
  const autoApprove = (await db.setting.findUnique({ where: { key: 'auto_approve_products' } }))?.value === 'true';
  const status = submit ? (autoApprove ? 'ACTIVE' : 'PENDING_REVIEW') : 'DRAFT';
  let product;
  if (id) {
    const ex = await db.product.findFirst({ where: { id, sellerId: seller.id } });
    if (!ex) return { error: 'Product not found' };
    product = await db.product.update({ where: { id }, data: { ...pd.data, status: submit ? status : ex.status === 'ACTIVE' ? 'ACTIVE' : 'DRAFT', images: { deleteMany: {}, create: pd.images.map((url, i) => ({ url, sortOrder: i })) }, variants: { deleteMany: {}, create: pd.variants } } });
  } else {
    let slug = slugify(pd.title);
    if (await db.product.findUnique({ where: { slug } })) slug = `${slug}-${Math.random().toString(36).slice(2, 7)}`;
    product = await db.product.create({ data: { ...pd.data, sellerId: seller.id, slug, status, images: { create: pd.images.map((url, i) => ({ url, sortOrder: i })) }, variants: { create: pd.variants } } });
  }
  revalidatePath('/seller/products');
  redirect(`/seller/products?saved=${product.id}`);
}

export async function setProductStatus(form: FormData) {
  const { seller } = await requireSeller();
  const id = String(form.get('id'));
  const action = String(form.get('action'));
  const p = await db.product.findFirst({ where: { id, sellerId: seller.id } });
  if (!p) return;
  if (action === 'delete') await db.product.delete({ where: { id } });
  else if (action === 'deactivate') await db.product.update({ where: { id }, data: { status: 'INACTIVE' } });
  else if (action === 'activate' && ['INACTIVE', 'ACTIVE'].includes(p.status)) await db.product.update({ where: { id }, data: { status: 'ACTIVE' } });
  revalidatePath('/seller/products');
}

export async function quickUpdateInventory(form: FormData) {
  const { seller } = await requireSeller();
  const id = String(form.get('id'));
  const p = await db.product.findFirst({ where: { id, sellerId: seller.id } });
  if (!p) return;
  await db.product.update({ where: { id }, data: { stock: Number(form.get('stock')), price: Number(form.get('price')), mrp: Number(form.get('mrp') || form.get('price')) } });
  revalidatePath('/seller/inventory');
}

export async function updateOrderItem(form: FormData) {
  const { seller } = await requireSeller();
  const id = String(form.get('id'));
  const action = String(form.get('action'));
  const it = await db.orderItem.findFirst({ where: { id, sellerId: seller.id }, include: { order: true } });
  if (!it) return;
  const notify = (title: string, body: string) => db.notification.create({ data: { userId: it.order.userId, title, body, link: `/orders/${it.orderId}` } });
  if (action === 'pack' && it.status === 'CONFIRMED') await db.orderItem.update({ where: { id }, data: { status: 'PACKED' } });
  else if (action === 'ship' && ['CONFIRMED', 'PACKED'].includes(it.status)) {
    await db.orderItem.update({ where: { id }, data: { status: 'SHIPPED', courier: str(form, 'courier'), trackingNo: str(form, 'trackingNo'), trackingUrl: opt(form, 'trackingUrl'), shippedAt: new Date() } });
    await notify('Your item has shipped', `${it.title} is on its way via ${str(form, 'courier')} (${str(form, 'trackingNo')}).`);
  } else if (action === 'deliver' && it.status === 'SHIPPED') {
    await db.orderItem.update({ where: { id }, data: { status: 'DELIVERED', deliveredAt: new Date() } });
    await notify('Delivered', `${it.title} has been delivered. Enjoy!`);
    const remaining = await db.orderItem.count({ where: { orderId: it.orderId, status: { notIn: ['DELIVERED', 'CANCELLED', 'RETURNED', 'REFUNDED'] } } });
    if (remaining === 0) await db.order.update({ where: { id: it.orderId }, data: { status: 'COMPLETED' } });
  } else if (action === 'cancel' && ['PENDING', 'CONFIRMED', 'PACKED'].includes(it.status)) {
    await db.orderItem.update({ where: { id }, data: { status: 'CANCELLED', cancelReason: str(form, 'reason') || 'Cancelled by seller' } });
    await db.product.update({ where: { id: it.productId }, data: { stock: { increment: it.quantity } } });
    await db.ledgerEntry.createMany({ data: [{ sellerId: seller.id, type: 'REFUND', amount: -num(it.lineTotal), reference: it.id, note: 'Cancelled by seller' }, { sellerId: seller.id, type: 'ADJUSTMENT', amount: num(it.commission), reference: it.id, note: 'Commission reversed' }] });
    await notify('Item cancelled', `${it.title} was cancelled by the seller. Any payment will be refunded.`);
  }
  revalidatePath('/seller/orders');
}

export async function handleReturn(form: FormData) {
  const { seller } = await requireSeller();
  const id = String(form.get('id'));
  const action = String(form.get('action'));
  const rr = await db.returnRequest.findFirst({ where: { id, orderItem: { sellerId: seller.id } }, include: { orderItem: { include: { order: true } } } });
  if (!rr) return;
  const note = opt(form, 'note');
  if (action === 'approve') await db.returnRequest.update({ where: { id }, data: { status: 'APPROVED', sellerNote: note ?? 'Return approved. Please pack the item securely; pickup/return instructions will follow.' } });
  else if (action === 'reject') { await db.returnRequest.update({ where: { id }, data: { status: 'REJECTED', sellerNote: note } }); await db.orderItem.update({ where: { id: rr.orderItemId }, data: { status: 'DELIVERED' } }); }
  else if (action === 'received') await db.returnRequest.update({ where: { id }, data: { status: 'RECEIVED', sellerNote: note } });
  else if (action === 'refund') {
    await db.returnRequest.update({ where: { id }, data: { status: 'REFUNDED' } });
    await db.orderItem.update({ where: { id: rr.orderItemId }, data: { status: 'REFUNDED' } });
    await db.product.update({ where: { id: rr.orderItem.productId }, data: { stock: { increment: rr.orderItem.quantity } } });
    await db.ledgerEntry.createMany({ data: [{ sellerId: seller.id, type: 'REFUND', amount: -num(rr.refundAmount ?? rr.orderItem.lineTotal), reference: rr.orderItemId, note: 'Return refund' }, { sellerId: seller.id, type: 'ADJUSTMENT', amount: num(rr.orderItem.commission), reference: rr.orderItemId, note: 'Commission reversed on return' }] });
  }
  await db.notification.create({ data: { userId: rr.orderItem.order.userId, title: 'Return update', body: `Return for ${rr.orderItem.title}: ${action}`, link: `/orders/${rr.orderItem.orderId}` } });
  revalidatePath('/seller/returns');
}

export async function replyReview(form: FormData) {
  const { seller } = await requireSeller();
  const id = String(form.get('id'));
  const r = await db.review.findFirst({ where: { id, product: { sellerId: seller.id } } });
  if (!r) return;
  await db.review.update({ where: { id }, data: { sellerReply: str(form, 'reply') } });
  revalidatePath('/seller/performance');
}

export async function answerQuestion(form: FormData) {
  const { seller } = await requireSeller();
  const id = String(form.get('id'));
  const q = await db.productQuestion.findFirst({ where: { id, product: { sellerId: seller.id } } });
  if (!q) return;
  await db.productQuestion.update({ where: { id }, data: { answer: str(form, 'answer'), answeredAt: new Date() } });
  revalidatePath('/seller/performance');
}

export async function saveCoupon(form: FormData) {
  const { seller } = await requireApprovedSeller();
  const code = str(form, 'code').toUpperCase();
  if (code.length < 3) return;
  await db.coupon.upsert({ where: { code }, create: { code, sellerId: seller.id, description: opt(form, 'description'), percentOff: form.get('percentOff') ? Number(form.get('percentOff')) : null, amountOff: form.get('amountOff') ? Number(form.get('amountOff')) : null, minOrder: form.get('minOrder') ? Number(form.get('minOrder')) : null, maxUses: form.get('maxUses') ? Number(form.get('maxUses')) : null, endsAt: form.get('endsAt') ? new Date(String(form.get('endsAt'))) : null }, update: { isActive: true } });
  revalidatePath('/seller/coupons');
}
export async function toggleCoupon(form: FormData) {
  const { seller } = await requireSeller();
  const c = await db.coupon.findFirst({ where: { id: String(form.get('id')), sellerId: seller.id } });
  if (c) await db.coupon.update({ where: { id: c.id }, data: { isActive: !c.isActive } });
  revalidatePath('/seller/coupons');
}

export async function saveDeal(form: FormData) {
  const { seller } = await requireApprovedSeller();
  const productId = String(form.get('productId'));
  const p = await db.product.findFirst({ where: { id: productId, sellerId: seller.id } });
  if (!p) return;
  const dealPrice = Number(form.get('dealPrice'));
  if (dealPrice <= 0 || dealPrice >= num(p.price)) return;
  await db.deal.upsert({ where: { productId }, create: { productId, dealPrice, startsAt: new Date(String(form.get('startsAt'))), endsAt: new Date(String(form.get('endsAt'))), label: str(form, 'label') || 'Limited-time offer' }, update: { dealPrice, startsAt: new Date(String(form.get('startsAt'))), endsAt: new Date(String(form.get('endsAt'))), label: str(form, 'label') || 'Limited-time offer' } });
  revalidatePath('/seller/deals');
}
export async function deleteDeal(form: FormData) {
  const { seller } = await requireSeller();
  await db.deal.deleteMany({ where: { id: String(form.get('id')), product: { sellerId: seller.id } } });
  revalidatePath('/seller/deals');
}

export async function saveCampaign(form: FormData) {
  const { seller } = await requireApprovedSeller();
  const productId = String(form.get('productId'));
  const p = await db.product.findFirst({ where: { id: productId, sellerId: seller.id } });
  if (!p) return;
  await db.adCampaign.create({ data: { sellerId: seller.id, productId, name: str(form, 'name') || p.title, dailyBudget: Number(form.get('dailyBudget') || 100), bidPerClick: Number(form.get('bidPerClick') || 2), keywords: str(form, 'keywords').split(',').map((k) => k.trim().toLowerCase()).filter(Boolean) } });
  revalidatePath('/seller/ads');
}
export async function toggleCampaign(form: FormData) {
  const { seller } = await requireSeller();
  const c = await db.adCampaign.findFirst({ where: { id: String(form.get('id')), sellerId: seller.id } });
  if (c) await db.adCampaign.update({ where: { id: c.id }, data: { isActive: !c.isActive } });
  revalidatePath('/seller/ads');
}
