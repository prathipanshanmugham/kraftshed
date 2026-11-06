'use client';
import { useFormState } from 'react-dom';
import { saveProduct } from '@/app/actions/seller';
import SubmitButton from '@/components/ui/SubmitButton';
import Alert from '@/components/ui/Alert';
import ImageUploader from '@/components/ui/ImageUploader';

export default function ProductForm({ p, categories }: { p?: any; categories: { id: string; name: string; parent?: { name: string } | null }[] }) {
  const [state, action] = useFormState(saveProduct, null as any);
  const n = (v: any) => (v == null ? '' : String(v));
  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[2fr_1fr]">
      {p?.id && <input type="hidden" name="id" value={p.id} />}
      <div className="space-y-6">
        {state?.error && <Alert type="error">{state.error}</Alert>}
        <section className="card space-y-3 p-5"><h2 className="font-bold">Product identity</h2>
          <div><label className="label">Title</label><input name="title" defaultValue={p?.title} className="input" required placeholder="Hand-thrown terracotta planter, 8 inch, unglazed" /><p className="text-xs text-gray-500">Include what it is, material, size and key feature. 60–150 characters works best.</p></div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div><label className="label">Category</label><select name="categoryId" defaultValue={p?.categoryId ?? ''} className="input" required><option value="">Choose…</option>{categories.map((c) => <option key={c.id} value={c.id}>{c.parent ? `${c.parent.name} › ` : ''}{c.name}</option>)}</select></div>
            <div><label className="label">Brand / maker name</label><input name="brand" defaultValue={n(p?.brand)} className="input" /></div>
          </div>
          <div><label className="label">Images</label><ImageUploader initial={p?.images?.map((i: any) => i.url) ?? []} /></div>
        </section>
        <section className="card space-y-3 p-5"><h2 className="font-bold">Description</h2>
          <div><label className="label">Bullet points (one per line, up to 5)</label><textarea name="bulletPoints" rows={4} defaultValue={p?.bulletPoints?.join('\n')} className="input" placeholder={'100% handmade on the potter\'s wheel\nDrainage hole included\nFood-safe natural clay'} /></div>
          <div><label className="label">Full description</label><textarea name="description" rows={7} defaultValue={p?.description} className="input" required /></div>
          <div className="grid gap-3 sm:grid-cols-3"><div><label className="label">Materials</label><input name="materials" defaultValue={n(p?.materials)} className="input" /></div><div><label className="label">Dimensions</label><input name="dimensions" defaultValue={n(p?.dimensions)} className="input" placeholder="20 × 20 × 18 cm" /></div><div><label className="label">Weight (g)</label><input name="weightGrams" type="number" defaultValue={n(p?.weightGrams)} className="input" /></div></div>
          <div><label className="label">Search tags (comma separated)</label><input name="tags" defaultValue={p?.tags?.join(', ')} className="input" placeholder="pottery, planter, terracotta, garden" /></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="handmade" defaultChecked={p?.handmade ?? true} /> This item is handmade</label>
        </section>
        <section className="card space-y-3 p-5"><h2 className="font-bold">Variants (optional)</h2>
          <p className="text-xs text-gray-500">One per line: <code>Name | Price | Stock</code> — e.g. <code>Small (6 in) | 349 | 20</code></p>
          <textarea name="variants" rows={3} defaultValue={p?.variants?.map((v: any) => `${v.name} | ${v.price} | ${v.stock}`).join('\n')} className="input font-mono text-xs" />
        </section>
      </div>
      <div className="space-y-6">
        <section className="card space-y-3 p-5"><h2 className="font-bold">Offer</h2>
          <div className="grid grid-cols-2 gap-3"><div><label className="label">Your price (₹)</label><input name="price" type="number" step="1" min="1" defaultValue={n(p?.price)} className="input" required /></div><div><label className="label">M.R.P. (₹)</label><input name="mrp" type="number" step="1" defaultValue={n(p?.mrp)} className="input" /></div></div>
          <div className="grid grid-cols-2 gap-3"><div><label className="label">Stock</label><input name="stock" type="number" min="0" defaultValue={n(p?.stock ?? 1)} className="input" required /></div><div><label className="label">Low-stock alert at</label><input name="lowStockAt" type="number" defaultValue={n(p?.lowStockAt ?? 5)} className="input" /></div></div>
          <div><label className="label">SKU</label><input name="sku" defaultValue={n(p?.sku)} className="input" /></div>
        </section>
        <section className="card space-y-3 p-5"><h2 className="font-bold">Shipping &amp; returns</h2>
          <div className="grid grid-cols-2 gap-3"><div><label className="label">Shipping fee (₹)</label><input name="shippingFee" type="number" min="0" defaultValue={n(p?.shippingFee ?? 0)} className="input" /></div><div><label className="label">Free over (₹)</label><input name="freeShippingOver" type="number" defaultValue={n(p?.freeShippingOver)} className="input" /></div></div>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="codAvailable" defaultChecked={p?.codAvailable ?? false} /> Cash on delivery available</label>
          <label className="flex items-center gap-2 text-sm"><input type="checkbox" name="returnable" defaultChecked={p?.returnable ?? true} /> Accept returns</label>
          <div><label className="label">Return window (days)</label><input name="returnDays" type="number" defaultValue={n(p?.returnDays ?? 7)} className="input" /></div>
        </section>
        <div className="card space-y-2 p-5">
          <SubmitButton className="btn-primary w-full">{p?.status === 'ACTIVE' ? 'Save changes' : 'Submit for listing'}</SubmitButton>
          <input type="hidden" name="submit" value="publish" />
          <button type="submit" formAction={action} name="submit" value="draft" className="btn-outline w-full">Save as draft</button>
          <p className="text-xs text-gray-500">New listings are reviewed by Kraftshed before going live.</p>
        </div>
      </div>
    </form>
  );
}
