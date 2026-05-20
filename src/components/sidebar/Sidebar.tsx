'use client';

import { useCallback, useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  AiChat02Icon,
  Add01Icon,
  Settings02Icon,
  Logout01Icon,
  Message02Icon,
} from '@hugeicons/core-free-icons';
import styles from './sidebar.module.scss';

interface ChatListItem {
  id: string;
  title: string;
  updated_at: string;
}

export default function Sidebar() {
  const pathname = usePathname();
  const [chats, setChats] = useState<ChatListItem[]>([]);

  const fetchChats = useCallback(async () => {
    try {
      const res = await fetch('/api/chats', { cache: 'no-store' });
      if (!res.ok) return;
      const { chats } = (await res.json()) as { chats: ChatListItem[] };
      setChats(chats);
    } catch {
      // silent
    }
  }, []);

  useEffect(() => {
    // Rifetcha la lista chat: al mount, su evento esplicito, e a ogni
    // navigazione (così se il titolo di una chat viene generato dopo che
    // l'utente è già navigato altrove, la sidebar si aggiorna al rientro).
    // eslint-disable-next-line react-hooks/set-state-in-effect -- fetch dati lista chat
    fetchChats();
    const handler = () => fetchChats();
    window.addEventListener('pdmd:chats-updated', handler);
    return () => window.removeEventListener('pdmd:chats-updated', handler);
  }, [fetchChats, pathname]);

  const onNewChat = () => {
    window.dispatchEvent(new CustomEvent('pdmd:new-chat'));
  };

  const isHome = pathname === '/';
  const isSettings = pathname === '/impostazioni';
  const activeChatId = pathname?.startsWith('/chat/') ? pathname.split('/')[2] : null;

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarLogo}>
        <span className={styles.logoStripeBlue} />
        <span className={styles.logoStripeRed} />
        <span className={styles.logoName}>PDMD-TA</span>
      </div>

      <div className={`${styles.sidebarSection} ${styles.principaleSection}`}>
        <Link href="/" className={styles.newChatBtn} onClick={onNewChat}>
          <HugeiconsIcon icon={Add01Icon} size={16} color="currentColor" strokeWidth={2} />
          <span>Nuova chat</span>
        </Link>

        <div className={styles.sidebarSectionLabel}>Principale</div>

        <Link
          href="/"
          className={`${styles.navItem} ${isHome ? styles.active : ''}`}
          onClick={isHome ? onNewChat : undefined}
        >
          <HugeiconsIcon icon={AiChat02Icon} size={18} color="currentColor" strokeWidth={1.5} />
          <span>Assistente</span>
        </Link>

        {chats.length > 0 && (
          <div className={styles.chatList}>
            {chats.map((chat) => (
              <Link
                key={chat.id}
                href={`/chat/${chat.id}`}
                className={`${styles.chatItem} ${activeChatId === chat.id ? styles.active : ''}`}
                title={chat.title}
              >
                <HugeiconsIcon
                  icon={Message02Icon}
                  size={13}
                  color="currentColor"
                  strokeWidth={1.5}
                />
                <span className={styles.chatItemTitle}>{chat.title}</span>
              </Link>
            ))}
          </div>
        )}
      </div>

      <div className={styles.sidebarSection}>
        <div className={styles.sidebarSectionLabel}>Sistema</div>
        <Link
          href="/impostazioni"
          className={`${styles.navItem} ${isSettings ? styles.active : ''}`}
        >
          <HugeiconsIcon icon={Settings02Icon} size={18} color="currentColor" strokeWidth={1.5} />
          <span>Impostazioni</span>
        </Link>
      </div>

      <div className={styles.sidebarFooter}>
        <div className={styles.userRow}>
          <div className={styles.avatar}>CT</div>
          <div className={styles.userInfo}>
            <div className={styles.userName}>Comune di Taranto</div>
            <div className={styles.userEmail}>operatore@comune.taranto.it</div>
          </div>
          <button className={styles.logoutBtn} type="button" title="Esci">
            <HugeiconsIcon icon={Logout01Icon} size={16} color="currentColor" strokeWidth={1.5} />
          </button>
        </div>
      </div>
    </aside>
  );
}
