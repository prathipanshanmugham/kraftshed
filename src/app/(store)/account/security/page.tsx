import { requireUser } from '@/lib/auth';
import { db } from '@/lib/db';
import { ProfileForm, PasswordForm } from '@/components/store/ProfileForms';
export const metadata = { title: 'Profile & password' };
export default async function Page() {
  const s = await requireUser('/account/security');
  const u = await db.user.findUnique({ where: { id: s.userId } });
  return <div className="mx-auto max-w-xl space-y-6"><h1 className="text-2xl font-bold">Profile &amp; password</h1><ProfileForm name={u!.name} phone={u!.phone ?? ''} email={u!.email} /><PasswordForm /></div>;
}
