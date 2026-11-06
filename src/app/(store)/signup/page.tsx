import AuthForm from '@/components/store/AuthForm';
export const metadata = { title: 'Create account' };
export default function Page({ searchParams }: { searchParams: { next?: string } }) {
  return <AuthForm mode="signup" next={searchParams.next} />;
}
