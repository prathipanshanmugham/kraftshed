'use client';
import { useFormState } from 'react-dom';
import { useState } from 'react';
import { submitReview } from '@/app/actions/reviews';
import SubmitButton from '@/components/ui/SubmitButton';
import Alert from '@/components/ui/Alert';

export default function ReviewForm({ productId }: { productId: string }) {
  const [state, action] = useFormState(submitReview, null as any);
  const [rating, setRating] = useState(0);
  return (
    <form action={action} className="space-y-3 border-t border-sand pt-4">
      <h4 className="text-sm font-bold">Share your experience</h4>
      {state?.error && <Alert type="error">{state.error}</Alert>}
      {state?.success && <Alert type="success">{state.success}</Alert>}
      <input type="hidden" name="productId" value={productId} />
      <input type="hidden" name="rating" value={rating} />
      <div className="flex gap-1 text-2xl">
        {[1, 2, 3, 4, 5].map((i) => <button type="button" key={i} onClick={() => setRating(i)} className={i <= rating ? 'text-clay' : 'text-sand-dark'} aria-label={`${i} stars`}>★</button>)}
      </div>
      <input name="title" className="input" placeholder="Summary (optional)" />
      <textarea name="body" className="input" rows={3} placeholder="How did it turn out? Quality, packaging, anything a fellow buyer should know." required />
      <SubmitButton>Post review</SubmitButton>
    </form>
  );
}
