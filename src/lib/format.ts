export const inr = (n: number | string | { toString(): string }) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(Number(n));

export const inr2 = (n: number | string | { toString(): string }) =>
  new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 2 }).format(Number(n));

export const num = (n: unknown) => Number(n ?? 0);

export const dateFmt = (d: Date | string | null | undefined) =>
  d ? new Date(d).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : '—';

export const slugify = (s: string) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '').slice(0, 80);

export const discountPct = (mrp: unknown, price: unknown) => {
  const m = num(mrp), p = num(price);
  return m > p && m > 0 ? Math.round(((m - p) / m) * 100) : 0;
};

export const orderNumber = () => 'KS' + Date.now().toString(36).toUpperCase() + Math.random().toString(36).slice(2, 5).toUpperCase();

export const addDays = (d: Date, n: number) => new Date(d.getTime() + n * 86400000);

export const statusLabel = (s: string) => s.replace(/_/g, ' ').toLowerCase().replace(/\b\w/g, (c) => c.toUpperCase());
