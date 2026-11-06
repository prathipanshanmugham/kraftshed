import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';
import { db } from '@/lib/db';
export async function GET() {
  const s = await getSession();
  const seller = s ? await db.seller.findUnique({ where: { userId: s.userId } }) : null;
  if (!seller) return new NextResponse('Unauthorized', { status: 401 });
  const items = await db.orderItem.findMany({ where: { sellerId: seller.id }, include: { order: { include: { address: true } } }, orderBy: { order: { createdAt: 'desc' } } });
  const esc = (v: unknown) => `"${String(v ?? '').replace(/"/g, '""')}"`;
  const rows = [['Order', 'Date', 'Item', 'Qty', 'Unit price', 'Line total', 'Commission', 'Your earning', 'Status', 'Customer', 'City', 'State', 'Pincode', 'Courier', 'Tracking']];
  for (const it of items) rows.push([it.order.orderNumber, it.order.createdAt.toISOString().slice(0, 10), it.title, it.quantity, it.unitPrice, it.lineTotal, it.commission, it.sellerEarning, it.status, it.order.address.fullName, it.order.address.city, it.order.address.state, it.order.address.pincode, it.courier, it.trackingNo].map(String) as any);
  const csv = rows.map((r) => r.map(esc).join(',')).join('\n');
  return new NextResponse(csv, { headers: { 'Content-Type': 'text/csv', 'Content-Disposition': 'attachment; filename="kraftshed-orders.csv"' } });
}
