import SearchResults from '@/components/store/SearchResults';
export default function Page({ searchParams }: { searchParams: Record<string, string | undefined> }) {
  return <SearchResults params={searchParams} basePath="/search" title={searchParams.q ? `Showing results for "${searchParams.q}"` : 'All products'} />;
}
