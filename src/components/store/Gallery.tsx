'use client';
import { useState } from 'react';
export default function Gallery({ images, title }: { images: { url: string; alt?: string | null }[]; title: string }) {
  const [i, setI] = useState(0);
  if (!images.length) return <div className="flex aspect-square items-center justify-center rounded-3xl bg-sand-light text-5xl text-sand-dark">✦</div>;
  return (
    <div>
      <div className="overflow-hidden rounded-3xl bg-sand-light">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={images[i].url} alt={images[i].alt ?? title} className="aspect-square w-full object-cover" />
      </div>
      {images.length > 1 && (
        <div className="mt-3 flex gap-2 overflow-x-auto">
          {images.map((im, k) => (
            // eslint-disable-next-line @next/next/no-img-element
            <img key={k} src={im.url} alt="" onClick={() => setI(k)} className={`h-16 w-16 shrink-0 cursor-pointer rounded-xl object-cover ring-2 ring-offset-2 ${k === i ? 'ring-forest' : 'ring-transparent'}`} />
          ))}
        </div>
      )}
    </div>
  );
}
