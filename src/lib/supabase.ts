import { createClient, type SupabaseClient } from '@supabase/supabase-js';

// Tutte le tabelle dell'applicazione usano il prefisso cmta_ per separarle
// chiaramente da eventuali altri schemi nello stesso progetto Supabase.
export const TABLES = {
  chats: 'cmta_chats',
  messages: 'cmta_messages',
} as const;

// Client server-side con service-role (può fare scritture, niente RLS).
// Da usare SOLO nei route handler e server components — mai esporlo al client.
let serverClient: SupabaseClient | null = null;

export function getServerSupabase(): SupabaseClient {
  if (serverClient) return serverClient;

  const url = process.env.SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) throw new Error('SUPABASE_URL non configurata');
  if (!serviceKey) throw new Error('SUPABASE_SERVICE_ROLE_KEY non configurata');

  serverClient = createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
  return serverClient;
}

// Tipi DB (in attesa di Supabase typegen)
export interface DbChat {
  id: string;
  title: string;
  created_at: string;
  updated_at: string;
}

export interface DbMessage {
  id: string;
  chat_id: string;
  role: 'user' | 'assistant';
  content: string;
  attachments: Array<{
    kind: 'pdf' | 'word' | 'excel';
    filename: string;
    url: string;
    file_id: string;
  }> | null;
  created_at: string;
}
