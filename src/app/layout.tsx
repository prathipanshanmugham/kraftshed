import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: { default: 'Kraftshed — The marketplace for art & crafts', template: '%s | Kraftshed' },
  description: 'Pottery, leather, textiles, paints and one-of-a-kind pieces from independent Indian makers — plus the supplies to make your own.',
  icons: { icon: '/favicon.svg' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body id="top">{children}</body>
    </html>
  );
}
