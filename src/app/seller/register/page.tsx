import { redirect } from 'next/navigation';
import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import Logo from '@/components/ui/Logo';
import RegisterForm from '@/components/seller/RegisterForm';
export default async function Page() {
  const s = await requireUser('/seller/register');
  if (await db.seller.findUnique({ where: { userId: s.userId } })) redirect('/seller/dashboard');
  return <div className="min-h-screen bg-gray-50"><header className="border-b bg-white"><div className="container-x py-3"><Logo sub="Maker Studio" /></div></header><div className="mx-auto max-w-2xl px-4 py-8"><h1 className="text-2xl font-bold">Open your shop</h1><p className="mb-6 text-sm text-gray-600">Tell us about your business. Our team reviews applications within 1–2 working days.</p><RegisterForm mode="register" /></div></div>;
}
