import { requireSeller } from '@/lib/auth';
import { db } from '@/lib/db';
import { dateFmt } from '@/lib/format';
import SellerShell from '@/components/seller/SellerShell';
import Stat from '@/components/ui/Stat';
import Stars from '@/components/ui/Stars';
import { replyReview, answerQuestion } from '@/app/actions/seller';
export default async function Page() {
  const { seller } = await requireSeller();
  const [reviews, questions, shipped, late, cancelled, total] = await Promise.all([
    db.review.findMany({ where: { product: { sellerId: seller.id } }, include: { product: { select: { title: true } }, user: { select: { name: true } } }, orderBy: { createdAt: 'desc' }, take: 30 }),
    db.productQuestion.findMany({ where: { product: { sellerId: seller.id } }, include: { product: { select: { title: true } } }, orderBy: [{ answeredAt: 'asc' }, { createdAt: 'desc' }], take: 30 }),
    db.orderItem.findMany({ where: { sellerId: seller.id, shippedAt: { not: null } }, select: { shippedAt: true, order: { select: { createdAt: true } } } }),
    Promise.resolve(0), db.orderItem.count({ where: { sellerId: seller.id, status: 'CANCELLED', cancelReason: { not: 'Cancelled by customer' } } }), db.orderItem.count({ where: { sellerId: seller.id } }),
  ]);
  const lateCount = shipped.filter((s) => s.shippedAt && s.shippedAt.getTime() - s.order.createdAt.getTime() > seller.handlingDays * 86400000).length;
  const lateRate = shipped.length ? Math.round((lateCount / shipped.length) * 100) : 0;
  const cancelRate = total ? Math.round((cancelled / total) * 100) : 0;
  return (
    <SellerShell storeName={seller.storeName} status={seller.status} title="Shop performance">
      <div className="grid gap-4 sm:grid-cols-4"><Stat label="Seller rating" value={`${Number(seller.ratingAvg).toFixed(1)} ★`} sub={`${seller.ratingCount} reviews`} accent /><Stat label="Late shipment rate" value={`${lateRate}%`} sub="Target: under 4%" /><Stat label="Seller cancel rate" value={`${cancelRate}%`} sub="Target: under 2.5%" /><Stat label="Unanswered questions" value={questions.filter((q) => !q.answer).length} sub="Reply within 2 days" /></div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card p-5"><h2 className="font-bold">Customer reviews</h2><div className="mt-3 space-y-3">{reviews.map((r) => <div key={r.id} className="border-b pb-3 text-sm last:border-0"><p className="text-xs text-gray-500">{r.product.title}</p><div className="flex items-center gap-2"><Stars value={r.rating} /><span className="font-semibold">{r.title}</span></div><p>{r.body}</p><p className="text-xs text-gray-500">{r.user.name} · {dateFmt(r.createdAt)}</p>{r.sellerReply ? <p className="mt-1 rounded bg-gray-50 p-2 text-xs"><strong>You replied:</strong> {r.sellerReply}</p> : <form action={replyReview} className="mt-1 flex gap-1"><input type="hidden" name="id" value={r.id} /><input name="reply" className="input py-1 text-xs" placeholder="Reply publicly…" required /><button className="btn-outline py-1 text-xs">Reply</button></form>}</div>)}{reviews.length === 0 && <p className="text-sm text-gray-500">No reviews yet.</p>}</div></div>
        <div className="card p-5"><h2 className="font-bold">Customer questions</h2><div className="mt-3 space-y-3">{questions.map((q) => <div key={q.id} className="border-b pb-3 text-sm last:border-0"><p className="text-xs text-gray-500">{q.product.title}</p><p className="font-semibold">Q: {q.question}</p>{q.answer ? <p className="text-gray-700">A: {q.answer}</p> : <form action={answerQuestion} className="mt-1 flex gap-1"><input type="hidden" name="id" value={q.id} /><input name="answer" className="input py-1 text-xs" placeholder="Type your answer…" required /><button className="btn-primary py-1 text-xs">Answer</button></form>}</div>)}{questions.length === 0 && <p className="text-sm text-gray-500">No questions yet.</p>}</div></div>
      </div>
    </SellerShell>
  );
}
