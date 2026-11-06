import AuthForm from '@/components/store/AuthForm';
export const metadata = { title: 'Sign in' };
export default function Page({ searchParams }: { searchParams: { next?: string } }) {
  return <AuthForm mode="signin" next={searchParams.next} />;
}
