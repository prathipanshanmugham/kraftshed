import ProductCard from './ProductCard';
export default function ProductGrid({ products, title, href, eyebrow }: { products: any[]; title?: string; href?: string; eyebrow?: string }) {
  return (
    <section className="mt-14">
      {title && (
        <div className="mb-5 flex items-end justify-between">
          <div>{eyebrow && <p className="eyebrow">{eyebrow}</p>}<h2 className="text-2xl font-bold">{title}</h2></div>
          {href && <a href={href} className="text-sm font-bold text-forest hover:underline">View all</a>}
        </div>
      )}
      <div className="grid grid-cols-2 gap-x-4 gap-y-8 sm:grid-cols-3 lg:grid-cols-5">
        {products.map((p) => <ProductCard key={p.id} p={p} />)}
      </div>
    </section>
  );
}
