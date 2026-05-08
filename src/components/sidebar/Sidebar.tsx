'use client';

import { HugeiconsIcon } from '@hugeicons/react';
import {
  AiChat02Icon,
  Add01Icon,
  Globe02Icon,
  BookOpen01Icon,
  Settings02Icon,
  Logout01Icon,
} from '@hugeicons/core-free-icons';
import styles from './sidebar.module.scss';

export default function Sidebar() {
  const onNewChat = () => {
    window.dispatchEvent(new CustomEvent('pdmd:new-chat'));
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.sidebarLogo}>
        <span className={styles.logoStripeBlue} />
        <span className={styles.logoStripeRed} />
        <span className={styles.logoName}>PDMD-TA</span>
      </div>

      <div className={styles.sidebarSection}>
        <button className={styles.newChatBtn} onClick={onNewChat} type="button">
          <HugeiconsIcon icon={Add01Icon} size={16} color="currentColor" strokeWidth={2} />
          <span>Nuova chat</span>
        </button>

        <div className={styles.sidebarSectionLabel}>Principale</div>

        <button className={`${styles.navItem} ${styles.active}`} type="button" onClick={onNewChat}>
          <HugeiconsIcon icon={AiChat02Icon} size={18} color="currentColor" strokeWidth={1.5} />
          <span>Assistente</span>
        </button>

        <button className={styles.navItem} type="button" disabled>
          <HugeiconsIcon icon={Globe02Icon} size={18} color="currentColor" strokeWidth={1.5} />
          <span>Ricerca Web</span>
        </button>

        <button className={styles.navItem} type="button" disabled>
          <HugeiconsIcon icon={BookOpen01Icon} size={18} color="currentColor" strokeWidth={1.5} />
          <span>Documentazione</span>
        </button>
      </div>

      <div className={styles.sidebarSection}>
        <div className={styles.sidebarSectionLabel}>Sistema</div>
        <button className={styles.navItem} type="button" disabled>
          <HugeiconsIcon icon={Settings02Icon} size={18} color="currentColor" strokeWidth={1.5} />
          <span>Impostazioni</span>
        </button>
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
