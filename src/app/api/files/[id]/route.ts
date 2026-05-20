import { NextRequest } from 'next/server';
import { getFile } from '@/lib/file-store';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const file = getFile(id);
  if (!file) {
    return new Response('Not found', { status: 404 });
  }
  return new Response(new Uint8Array(file.buffer), {
    headers: {
      'Content-Type': file.contentType,
      'Content-Disposition': `attachment; filename="${encodeURIComponent(file.filename)}"`,
      'Cache-Control': 'private, max-age=0, must-revalidate',
    },
  });
}
