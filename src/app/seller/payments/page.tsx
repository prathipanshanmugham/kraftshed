import { requireSeller } from '@/lib/auth';
import { db } from '@/lib/db';
import { inr, num, dateFmt } from '@/lib/format';
import SellerShell from '@/components/seller/SellerShell';
import Stat from '@/components/ui/Stat';
import StatusBadge from '@/components/ui/StatusBadge';
export default async function Page() {
  const { seller } = await requireSeller();
  const [balance, sales, commission, payouts, ledger] = await Promise.all([
    db.ledgerEntry.aggregate({ where: { sellerId: seller.id }, _sum: { amount: true } }),
    db.ledgerEntry.aggregate({ where: { sellerId: seller.id, type: 'SALE' }, _sum: { amount: true } }),
    db.ledgerEntry.aggregate({ where: { sellerId: seller.id, type: 'COMMISSION' }, _sum: { amount: true } }),
    db.payout.findMany({ where: { sellerId: seller.id }, orderBy: { createdAt: 'desc' }, take: 20 }),
    db.ledgerEntry.findMany({ where: { sellerId: seller.id }, orderBy: { createdAt: 'desc' }, take: 100 }),
  ]);
  return (
    <SellerShell storeName={seller.storeName} status={seller.status} title="Payments">
      <div className="grid gap-4 sm:grid-cols-3"><Stat label="Available balance" value={inr(num(balance._sum.amount))} sub="Paid out weekly" accent /><Stat label="Lifetime sales" value={inr(num(sales._sum.amount))} /><Stat label="Commission paid" value={inr(-num(commission._sum.amount))} /></div>
      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <div className="card p-5"><h2 className="font-bold">Payouts</h2><p className="text-xs text-gray-500">To {seller.bankAccountName ?? '—'} · A/c ending {seller.bankAccountNo?.slice(-4) ?? '—'} · {seller.bankIfsc ?? ''}</p>
          <table className="table mt-3"><thead><tr><th>Period</th><th>Amount</th><th>Status</th><th>UTR</th></tr></thead><tbody>{payouts.map((p) => <tr key={p.id}><td className="text-xs">{dateFmt(p.periodFrom)} – {dateFmt(p.periodTo)}</td><td>{inr(p.amount)}</td><td><StatusBadge s={p.status} /></td><td className="text-xs">{p.utr ?? '—'}</td></tr>)}{payouts.length === 0 && <tr><td colSpan={4} className="text-center text-gray-500">No payouts yet.</td></tr>}</tbody></table></div>
        <div className="card p-5"><h2 className="font-bold">Transaction ledger</h2>
          <table className="table mt-3"><thead><tr><th>Date</th><th>Type</th><th>Note</th><th className="text-right">Amount</th></tr></thead><tbody>{ledger.map((l) => <tr key={l.id}><td className="text-xs">{dateFmt(l.createdAt)}</td><td className="text-xs">{l.type}</td><td className="text-xs text-gray-600">{l.note}</td><td className={`text-right font-medium ${num(l.amount) < 0 ? 'text-red-600' : 'text-green-700'}`}>{inr(l.amount)}</td></tr>)}{ledger.length === 0 && <tr><td colSpan={4} className="text-center text-gray-500">No transactions yet.</td></tr>}</tbody></table></div>
      </div>
    </SellerShell>
  );
}
