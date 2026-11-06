import Link from 'next/link';
export default function Empty({ title, body, cta, href }: { title: string; body?: string; cta?: string; href?: string }) {
  return (
    <div className="card p-10 text-center">
      <h3 className="text-lg font-semibold">{title}</h3>
      {body && <p className="mt-1 text-sm text-gray-600">{body}</p>}
      {cta && href && <Link href={href} className="btn-primary mt-4">{cta}</Link>}
    </div>
  );
}
