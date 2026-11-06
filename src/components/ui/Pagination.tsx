import Link from 'next/link';
export default function Pagination({ page, pages, base }: { page: number; pages: number; base: string }) {
  if (pages <= 1) return null;
  const sep = base.includes('?') ? '&' : '?';
  return (
    <div className="mt-6 flex items-center justify-center gap-2">
      {page > 1 && <Link className="btn-outline" href={`${base}${sep}page=${page - 1}`}>← Previous</Link>}
      <span className="text-sm text-gray-600">Page {page} of {pages}</span>
      {page < pages && <Link className="btn-outline" href={`${base}${sep}page=${page + 1}`}>Next →</Link>}
    </div>
  );
}
