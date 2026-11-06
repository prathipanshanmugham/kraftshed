import Header from '@/components/store/Header';
import Footer from '@/components/store/Footer';
export const dynamic = 'force-dynamic';
export default function StoreLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="container-x py-6 min-h-[60vh]">{children}</main>
      <Footer />
    </>
  );
}
