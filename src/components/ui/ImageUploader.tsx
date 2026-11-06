'use client';
import { useState } from 'react';
export default function ImageUploader({ name = 'images', initial = [], max = 8 }: { name?: string; initial?: string[]; max?: number }) {
  const [urls, setUrls] = useState<string[]>(initial);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState('');
  const upload = async (files: FileList | null) => {
    if (!files?.length) return;
    setBusy(true); setErr('');
    const fd = new FormData();
    Array.from(files).slice(0, max - urls.length).forEach((f) => fd.append('files', f));
    const r = await fetch('/api/upload', { method: 'POST', body: fd });
    const j = await r.json();
    if (j.urls) setUrls((u) => [...u, ...j.urls]); else setErr(j.error || 'Upload failed');
    setBusy(false);
  };
  return (
    <div>
      <input type="hidden" name={name} value={urls.join('\n')} />
      <div className="flex flex-wrap gap-2">
        {urls.map((u, i) => (
          <div key={u} className="relative h-24 w-24 overflow-hidden rounded-lg border bg-gray-50">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={u} alt="" className="h-full w-full object-cover" />
            {i === 0 && <span className="absolute left-0 top-0 rounded-br bg-brand px-1 text-[10px] text-white">Main</span>}
            <button type="button" onClick={() => setUrls(urls.filter((x) => x !== u))} className="absolute right-0 top-0 rounded-bl bg-black/60 px-1.5 text-xs text-white">✕</button>
          </div>
        ))}
        {urls.length < max && (
          <label className="flex h-24 w-24 cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed text-xs text-gray-500 hover:border-brand hover:text-brand">
            <span className="text-xl">＋</span>{busy ? 'Uploading…' : 'Add image'}
            <input type="file" accept="image/*" multiple className="hidden" onChange={(e) => upload(e.target.files)} disabled={busy} />
          </label>
        )}
      </div>
      <p className="mt-1 text-xs text-gray-500">JPG/PNG/WebP, up to 5 MB each. First image is the main image. Or paste image URLs below.</p>
      <input className="input mt-1" placeholder="https://… (paste a URL and press Enter)" onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); const v = (e.target as HTMLInputElement).value.trim(); if (v) { setUrls((u) => [...u, v]); (e.target as HTMLInputElement).value = ''; } } }} />
      {err && <p className="text-xs text-red-600">{err}</p>}
    </div>
  );
}
