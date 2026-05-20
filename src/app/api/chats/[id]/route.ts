import { NextRequest, NextResponse } from 'next/server';
import { getServerSupabase, TABLES, type DbChat, type DbMessage } from '@/lib/supabase';

export const dynamic = 'force-dynamic';

interface RouteContext {
  params: Promise<{ id: string }>;
}

export async function GET(_req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  const supabase = getServerSupabase();

  const { data: chat, error: chatErr } = await supabase
    .from(TABLES.chats)
    .select('id, title, created_at, updated_at')
    .eq('id', id)
    .maybeSingle();

  if (chatErr) {
    return NextResponse.json({ error: chatErr.message }, { status: 500 });
  }
  if (!chat) {
    return NextResponse.json({ error: 'Chat non trovata' }, { status: 404 });
  }

  const { data: messages, error: msgErr } = await supabase
    .from(TABLES.messages)
    .select('id, chat_id, role, content, attachments, created_at')
    .eq('chat_id', id)
    .order('created_at', { ascending: true });

  if (msgErr) {
    return NextResponse.json({ error: msgErr.message }, { status: 500 });
  }

  return NextResponse.json({
    chat: chat as DbChat,
    messages: (messages ?? []) as DbMessage[],
  });
}

export async function DELETE(_req: NextRequest, ctx: RouteContext) {
  const { id } = await ctx.params;
  const supabase = getServerSupabase();

  const { error } = await supabase.from(TABLES.chats).delete().eq('id', id);
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
  return NextResponse.json({ ok: true });
}
