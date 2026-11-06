'use client';
import { useFormState } from 'react-dom';
import { registerSeller, updateSellerSettings } from '@/app/actions/seller';
import SubmitButton from '@/components/ui/SubmitButton';
import Alert from '@/components/ui/Alert';
import ImageUploader from '@/components/ui/ImageUploader';

const F = ({ l, n, v, req, type = 'text', ph }: { l: string; n: string; v?: any; req?: boolean; type?: string; ph?: string }) => <div><label className="label">{l}</label><input name={n} defaultValue={v ?? ''} required={req} type={type} className="input" placeholder={ph} /></div>;

export default function RegisterForm({ seller, mode }: { seller?: any; mode: 'register' | 'settings' }) {
  const [state, action] = useFormState(mode === 'register' ? registerSeller : updateSellerSettings, null as any);
  return (
    <form action={action} className="space-y-6">
      {state?.error && <Alert type="error">{state.error}</Alert>}
      {state?.success && <Alert type="success">{state.success}</Alert>}
      <section className="card space-y-3 p-5"><h2 className="font-bold">Shop details</h2>
        <F l="Shop name" n="storeName" v={seller?.storeName} req ph="e.g. Kumbakonam Clayworks" />
        <F l="Tagline" n="tagline" v={seller?.tagline} ph="Handmade terracotta from Tamil Nadu" />
        <div><label className="label">About your shop</label><textarea name="description" defaultValue={seller?.description ?? ''} rows={3} className="input" /></div>
        {mode === 'settings' && <>
          <div><label className="label">Logo</label><ImageUploader name="logoUrl" initial={seller?.logoUrl ? [seller.logoUrl] : []} max={1} /></div>
          <div><label className="label">Banner</label><ImageUploader name="bannerUrl" initial={seller?.bannerUrl ? [seller.bannerUrl] : []} max={1} /></div>
          <F l="Handling time (days to ship)" n="handlingDays" v={seller?.handlingDays ?? 2} type="number" />
        </>}
      </section>
      <section className="card space-y-3 p-5"><h2 className="font-bold">Business &amp; KYC</h2>
        <div><label className="label">Business type</label><select name="businessType" defaultValue={seller?.businessType ?? 'Individual'} className="input"><option>Individual</option><option>Sole Proprietorship</option><option>Partnership</option><option>Private Limited</option><option>LLP</option></select></div>
        <F l="Legal / registered name" n="legalName" v={seller?.legalName} />
        <div className="grid gap-3 sm:grid-cols-2"><F l="PAN" n="pan" v={seller?.pan} req ph="ABCDE1234F" /><F l="GSTIN (optional)" n="gstin" v={seller?.gstin} ph="33ABCDE1234F1Z5" /></div>
        <F l="Pickup address" n="pickupAddress" v={seller?.pickupAddress} req />
        <div className="grid gap-3 sm:grid-cols-3"><F l="City" n="pickupCity" v={seller?.pickupCity} req /><F l="State" n="pickupState" v={seller?.pickupState ?? 'Tamil Nadu'} req /><F l="Pincode" n="pickupPincode" v={seller?.pickupPincode} req /></div>
      </section>
      <section className="card space-y-3 p-5"><h2 className="font-bold">Bank details for payouts</h2>
        <F l="Account holder name" n="bankAccountName" v={seller?.bankAccountName} req />
        <div className="grid gap-3 sm:grid-cols-2"><F l="Account number" n="bankAccountNo" v={seller?.bankAccountNo} req /><F l="IFSC" n="bankIfsc" v={seller?.bankIfsc} req /></div>
        <F l="UPI ID (optional)" n="upiId" v={seller?.upiId} />
      </section>
      <SubmitButton>{mode === 'register' ? 'Submit application' : 'Save settings'}</SubmitButton>
      {mode === 'register' && <p className="text-xs text-gray-500">By submitting you agree to the <a href="/legal/seller-agreement" className="underline">Maker Agreement</a>.</p>}
    </form>
  );
}
