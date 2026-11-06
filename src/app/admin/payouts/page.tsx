import { db } from '@/lib/db';
import { inr, num, dateFmt } from '@/lib/format';
import AdminShell from '@/components/admin/AdminShell';
import StatusBadge from '@/components/ui/StatusBadge';
import { createPayout, markPayoutPaid } from '@/app/actions/admin';
export default async function Page() {
  const sellers = await db.seller.findMany({ where: { status: 'APPROVED' }, include: { ledger: { select: { amount: true } } }, orderBy: { storeName: 'asc' } });
  const payouts = await db.payout.findMany({ include: { seller: { select: { storeName: true, bankAccountName: true, bankAccountNo: true, bankIfsc: true } } }, orderBy: { createdAt: 'desc' }, take: 50 });
  const balances = sellers.map((s) => ({ s, balance: s.ledger.reduce((a, l) => a + num(l.amount), 0) })).filter((x) => x.balance !== 0);
  return (
    <AdminShell title="Seller payouts">
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="card p-5"><h2 className="font-bold">Balances due</h2><p className="text-xs text-gray-500">Create a payout, transfer via your bank/NEFT, then mark paid with the UTR.</p><table className="table mt-3"><thead><tr><th>Seller</th><th>Balance</th><th>Bank</th><th></th></tr></thead><tbody>{balances.map(({ s, balance }) => <tr key={s.id}><td>{s.storeName}</td><td className={balance < 0 ? 'text-red-600' : 'font-semibold'}>{inr(balance)}</td><td className="text-xs">{s.bankAccountName}<br />{s.bankAccountNo} · {s.bankIfsc}</td><td>{balance > 0 && <form action={createPayout} className="flex gap-1"><input type="hidden" name="sellerId" value={s.id} /><input name="amount" type="number" defaultValue={Math.floor(balance)} className="input w-24 py-1 text-xs" /><button className="btn-primary py-1 text-xs">Create</button></form>}</td></tr>)}{balances.length === 0 && <tr><td colSpan={4} className="text-center text-gray-500">Nothing due.</td></tr>}</tbody></table></div>
        <div className="card p-5"><h2 className="font-bold">Payout history</h2><table className="table mt-3"><thead><tr><th>Seller</th><th>Amount</th><th>Status</th><th>Date</th><th>UTR</th></tr></thead><tbody>{payouts.map((p) => <tr key={p.id}><td>{p.seller.storeName}</td><td>{inr(p.amount)}</td><td><StatusBadge s={p.status} /></td><td className="text-xs">{dateFmt(p.createdAt)}</td><td>{p.status === 'PAID' ? <span className="text-xs">{p.utr}</span> : <form action={markPayoutPaid} className="flex gap-1"><input type="hidden" name="id" value={p.id} /><input name="utr" placeholder="UTR" className="input w-28 py-1 text-xs" /><button className="btn-outline py-1 text-xs">Paid</button></form>}</td></tr>)}</tbody></table></div>
      </div>
    </AdminShell>
  );
}
