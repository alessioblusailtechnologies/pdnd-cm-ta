import { notFound } from 'next/navigation';
import ChatView, { type InitialChat, type InitialMessage } from '@/components/chat/ChatView';
import { getServerSupabase, TABLES, type DbChat, type DbMessage } from '@/lib/supabase';

// Disabilita la cache della route: i messaggi della chat cambiano in
// continuazione e ogni navigazione deve riflettere lo stato corrente del DB.
export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ id: string }>;
}

export default async function ChatPage({ params }: Props) {
  const { id } = await params;

  const supabase = getServerSupabase();

  const { data: chat } = await supabase
    .from(TABLES.chats)
    .select('id, title, created_at, updated_at')
    .eq('id', id)
    .maybeSingle<DbChat>();

  if (!chat) notFound();

  const { data: rows } = await supabase
    .from(TABLES.messages)
    .select('id, chat_id, role, content, attachments, created_at')
    .eq('chat_id', id)
    .order('created_at', { ascending: true });

  const messages: InitialMessage[] = ((rows ?? []) as DbMessage[]).map((m) => ({
    id: m.id,
    role: m.role,
    content: m.content,
    attachments: m.attachments ?? undefined,
  }));

  const initialChat: InitialChat = {
    id: chat.id,
    title: chat.title,
    messages,
  };

  // key={chat.id} forza il remount di ChatView quando si naviga tra chat
  // diverse: senza, il useState con initialChat conserverebbe lo stato della
  // chat precedente perché l'inizializzatore gira solo al mount.
  return <ChatView key={chat.id} initialChat={initialChat} />;
}
