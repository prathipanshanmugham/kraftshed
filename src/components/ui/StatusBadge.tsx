import { statusLabel } from '@/lib/format';
const colors: Record<string, string> = {
  ACTIVE: 'bg-green-100 text-green-800', APPROVED: 'bg-green-100 text-green-800', PAID: 'bg-green-100 text-green-800', DELIVERED: 'bg-green-100 text-green-800', CAPTURED: 'bg-green-100 text-green-800', COMPLETED: 'bg-green-100 text-green-800', REFUNDED: 'bg-green-100 text-green-800',
  PENDING: 'bg-amber-100 text-amber-800', PENDING_REVIEW: 'bg-amber-100 text-amber-800', PENDING_PAYMENT: 'bg-amber-100 text-amber-800', REQUESTED: 'bg-amber-100 text-amber-800', OPEN: 'bg-amber-100 text-amber-800', PROCESSING: 'bg-amber-100 text-amber-800', UNDER_REVIEW: 'bg-amber-100 text-amber-800', RETURN_REQUESTED: 'bg-amber-100 text-amber-800',
  SHIPPED: 'bg-blue-100 text-blue-800', PACKED: 'bg-blue-100 text-blue-800', CONFIRMED: 'bg-blue-100 text-blue-800', AUTHORIZED: 'bg-blue-100 text-blue-800',
  CANCELLED: 'bg-red-100 text-red-800', REJECTED: 'bg-red-100 text-red-800', SUSPENDED: 'bg-red-100 text-red-800', FAILED: 'bg-red-100 text-red-800',
};
export default function StatusBadge({ s }: { s: string }) {
  return <span className={`badge ${colors[s] ?? 'bg-gray-100 text-gray-700'}`}>{statusLabel(s)}</span>;
}
