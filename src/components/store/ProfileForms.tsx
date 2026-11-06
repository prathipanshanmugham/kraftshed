'use client';
import { useFormState } from 'react-dom';
import { updateProfile, changePassword } from '@/app/actions/auth';
import SubmitButton from '@/components/ui/SubmitButton';
import Alert from '@/components/ui/Alert';
export function ProfileForm({ name, phone, email }: { name: string; phone: string; email: string }) {
  const [state, action] = useFormState(updateProfile, null as any);
  return <form action={action} className="card space-y-3 p-5"><h2 className="font-bold">Profile</h2>{state?.error && <Alert type="error">{state.error}</Alert>}{state?.success && <Alert type="success">{state.success}</Alert>}<div><label className="label">Name</label><input name="name" defaultValue={name} className="input" /></div><div><label className="label">Email</label><input value={email} disabled className="input bg-gray-50" /></div><div><label className="label">Mobile</label><input name="phone" defaultValue={phone} className="input" /></div><SubmitButton>Save changes</SubmitButton></form>;
}
export function PasswordForm() {
  const [state, action] = useFormState(changePassword, null as any);
  return <form action={action} className="card space-y-3 p-5"><h2 className="font-bold">Change password</h2>{state?.error && <Alert type="error">{state.error}</Alert>}{state?.success && <Alert type="success">{state.success}</Alert>}<div><label className="label">Current password</label><input name="current" type="password" className="input" required /></div><div><label className="label">New password</label><input name="password" type="password" className="input" required minLength={6} /></div><SubmitButton>Update password</SubmitButton></form>;
}
