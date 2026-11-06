import { db } from '@/lib/db';
import AdminShell from '@/components/admin/AdminShell';
import { saveSettings } from '@/app/actions/admin';
export default async function Page() {
  const rows = await db.setting.findMany();
  const g = (k: string, d = '') => rows.find((r) => r.key === k)?.value ?? d;
  return (
    <AdminShell title="Platform settings">
      <form action={saveSettings} className="card max-w-xl space-y-4 p-5">
        <div><label className="label">Default commission (%)</label><input name="commission_percent" type="number" step="0.5" defaultValue={g('commission_percent', process.env.PLATFORM_COMMISSION_PERCENT || '10')} className="input" /><p className="text-xs text-gray-500">Applied to new orders. Per-seller overrides are set on the Sellers page.</p></div>
        <div><label className="label">Auto-approve new listings</label><select name="auto_approve_products" defaultValue={g('auto_approve_products', 'false')} className="input"><option value="false">No — review every listing</option><option value="true">Yes — publish immediately</option></select></div>
        <div><label className="label">Support email</label><input name="support_email" defaultValue={g('support_email', 'support@kraftshed.com')} className="input" /></div>
        <div><label className="label">Site announcement (shown on home page)</label><input name="announcement" defaultValue={g('announcement')} className="input" placeholder="e.g. Diwali sale — free delivery on orders over ₹999" /></div>
        <button className="btn-primary">Save settings</button>
      </form>
      <div className="card mt-6 max-w-xl p-5 text-sm"><h2 className="font-bold">Integrations</h2><ul className="mt-2 space-y-1 text-gray-700"><li>Razorpay key: <code>{process.env.RAZORPAY_KEY_ID ? process.env.RAZORPAY_KEY_ID.slice(0, 12) + '…' : 'not set'}</code></li><li>Webhook URL: <code>{process.env.NEXT_PUBLIC_SITE_URL}/api/razorpay/webhook</code> (events: payment.captured, payment.failed)</li></ul></div>
    </AdminShell>
  );
}
