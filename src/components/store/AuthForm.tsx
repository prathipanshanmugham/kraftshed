'use client';
import { useFormState } from 'react-dom';
import Link from 'next/link';
import { signin, signup } from '@/app/actions/auth';
import SubmitButton from '@/components/ui/SubmitButton';
import Alert from '@/components/ui/Alert';

export default function AuthForm({ mode, next }: { mode: 'signin' | 'signup'; next?: string }) {
  const [state, action] = useFormState(mode === 'signin' ? signin : signup, null as any);
  return (
    <form action={action} className="card mx-auto mt-8 w-full max-w-md space-y-4 p-6">
      <h1 className="text-2xl font-bold">{mode === 'signin' ? 'Sign in' : 'Create account'}</h1>
      {state?.error && <Alert type="error">{state.error}</Alert>}
      <input type="hidden" name="next" value={next ?? '/'} />
      {mode === 'signup' && (
        <div><label className="label">Your name</label><input name="name" className="input" required /></div>
      )}
      <div><label className="label">Email</label><input name="email" type="email" className="input" required /></div>
      {mode === 'signup' && (
        <div><label className="label">Mobile number (optional)</label><input name="phone" className="input" /></div>
      )}
      <div><label className="label">Password</label><input name="password" type="password" className="input" required minLength={6} /></div>
      <SubmitButton className="btn-primary w-full">{mode === 'signin' ? 'Sign in' : 'Create account'}</SubmitButton>
      <p className="text-xs text-gray-500">By continuing, you agree to Kraftshed&apos;s <Link href="/legal/terms" className="underline">Terms of Use</Link> and <Link href="/legal/privacy" className="underline">Privacy Policy</Link>.</p>
      <div className="border-t pt-4 text-center text-sm">
        {mode === 'signin' ? (
          <>New here? <Link href={`/signup${next ? `?next=${encodeURIComponent(next)}` : ''}`} className="font-semibold text-brand">Create an account</Link></>
        ) : (
          <>Already have an account? <Link href={`/signin${next ? `?next=${encodeURIComponent(next)}` : ''}`} className="font-semibold text-brand">Sign in</Link></>
        )}
      </div>
    </form>
  );
}
