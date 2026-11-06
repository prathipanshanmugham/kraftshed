export default function Alert({ type = 'info', children }: { type?: 'info' | 'success' | 'error'; children: React.ReactNode }) {
  const c = { info: 'bg-blue-50 text-blue-800 border-blue-200', success: 'bg-green-50 text-green-800 border-green-200', error: 'bg-red-50 text-red-800 border-red-200' }[type];
  return <div className={`rounded-lg border px-4 py-3 text-sm ${c}`}>{children}</div>;
}
