import { NextRequest, NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import { getSession } from '@/lib/auth';

export const runtime = 'nodejs';
const ALLOWED = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];

export async function POST(req: NextRequest) {
  const s = await getSession();
  if (!s) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const form = await req.formData();
  const files = form.getAll('files') as File[];
  const urls: string[] = [];
  const dir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(dir, { recursive: true });
  for (const f of files) {
    if (!ALLOWED.includes(f.type) || f.size > 5 * 1024 * 1024) continue;
    const ext = f.type.split('/')[1].replace('jpeg', 'jpg');
    const name = `${Date.now()}-${crypto.randomBytes(6).toString('hex')}.${ext}`;
    await writeFile(path.join(dir, name), Buffer.from(await f.arrayBuffer()));
    urls.push(`/uploads/${name}`);
  }
  return NextResponse.json({ urls });
}
