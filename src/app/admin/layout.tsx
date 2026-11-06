import { requireAdmin } from '@/lib/auth';
export const dynamic = 'force-dynamic';
export const metadata = { title: { default: 'Kraftshed Admin', template: '%s | Kraftshed Admin' } };
export default async function Layout({ children }: { children: React.ReactNode }) { await requireAdmin(); return <>{children}</>; }
