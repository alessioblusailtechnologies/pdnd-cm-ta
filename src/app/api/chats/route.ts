import { NextResponse } from 'next/server';
import { getServerSupabase, TABLES, type DbChat } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

export async function GET() {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from(TABLES.chats)
    .select('id, title, created_at, updated_at')
    .order('updated_at', { ascending: false })
    .limit(100);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ chats: (data ?? []) as DbChat[] });
}

export async function POST() {
  const supabase = getServerSupabase();
  const { data, error } = await supabase
    .from(TABLES.chats)
    .insert({ title: 'Nuova chat' })
    .select('id, title, created_at, updated_at')
    .single();

  if (error || !data) {
    return NextResponse.json(
      { error: error?.message ?? 'Errore creazione chat' },
      { status: 500 },
    );
  }
  return NextResponse.json({ chat: data as DbChat });
}
