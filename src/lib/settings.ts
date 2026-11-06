import { db } from './db';

export async function getSetting(key: string, fallback: string) {
  const s = await db.setting.findUnique({ where: { key } }).catch(() => null);
  return s?.value ?? fallback;
}

export async function commissionPercent(sellerOverride?: unknown) {
  if (sellerOverride != null) return Number(sellerOverride);
  return Number(await getSetting('commission_percent', process.env.PLATFORM_COMMISSION_PERCENT || '10'));
}
