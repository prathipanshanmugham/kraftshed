import { saveAddress } from '@/app/actions/checkout';
const states = ['Andhra Pradesh','Arunachal Pradesh','Assam','Bihar','Chhattisgarh','Goa','Gujarat','Haryana','Himachal Pradesh','Jharkhand','Karnataka','Kerala','Madhya Pradesh','Maharashtra','Manipur','Meghalaya','Mizoram','Nagaland','Odisha','Punjab','Rajasthan','Sikkim','Tamil Nadu','Telangana','Tripura','Uttar Pradesh','Uttarakhand','West Bengal','Andaman and Nicobar Islands','Chandigarh','Dadra and Nagar Haveli and Daman and Diu','Delhi','Jammu and Kashmir','Ladakh','Lakshadweep','Puducherry'];
export default function AddressForm({ a, back }: { a?: any; back?: string }) {
  return (
    <form action={saveAddress} className="card space-y-3 p-5">
      {a?.id && <input type="hidden" name="id" value={a.id} />}
      {back && <input type="hidden" name="back" value={back} />}
      <div className="grid gap-3 sm:grid-cols-2">
        <div><label className="label">Full name</label><input name="fullName" defaultValue={a?.fullName} className="input" required /></div>
        <div><label className="label">Mobile number</label><input name="phone" defaultValue={a?.phone} className="input" required pattern="[0-9+ ]{10,15}" /></div>
      </div>
      <div><label className="label">Flat, House no., Building</label><input name="line1" defaultValue={a?.line1} className="input" required /></div>
      <div><label className="label">Area, Street, Village</label><input name="line2" defaultValue={a?.line2} className="input" /></div>
      <div><label className="label">Landmark (optional)</label><input name="landmark" defaultValue={a?.landmark} className="input" /></div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div><label className="label">Pincode</label><input name="pincode" defaultValue={a?.pincode} className="input" required pattern="[0-9]{6}" /></div>
        <div><label className="label">Town / City</label><input name="city" defaultValue={a?.city} className="input" required /></div>
        <div><label className="label">State</label><select name="state" defaultValue={a?.state ?? 'Tamil Nadu'} className="input">{states.map((s) => <option key={s}>{s}</option>)}</select></div>
      </div>
      <button className="btn-primary">Save address</button>
    </form>
  );
}
