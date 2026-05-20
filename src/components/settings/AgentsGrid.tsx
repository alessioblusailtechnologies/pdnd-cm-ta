'use client';

import { useState } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  AiChat02Icon,
  ChartLineData02Icon,
  Wrench02Icon,
  MoneyBag02Icon,
  CursorMagicSelection03Icon,
  ArrowDown01Icon,
} from '@hugeicons/core-free-icons';
import styles from './settings.module.scss';

interface ToolInfo {
  id: string;
  description: string;
}

interface SubAgentInfo {
  id: string;
  name: string;
}

export interface AgentInfo {
  id: string;
  name: string;
  description: string;
  model: string;
  tools: ToolInfo[];
  subAgents: SubAgentInfo[];
}

const AGENT_ICONS: Record<string, typeof AiChat02Icon> = {
  assistente: CursorMagicSelection03Icon,
  tributi: MoneyBag02Icon,
  utility: Wrench02Icon,
  indicatori: ChartLineData02Icon,
};

const AGENT_BADGES: Record<string, string> = {
  assistente: 'Router',
  tributi: 'Specialista',
  utility: 'Specialista',
  indicatori: 'Specialista',
};

interface Props {
  agents: AgentInfo[];
}

export default function AgentsGrid({ agents }: Props) {
  const [openIds, setOpenIds] = useState<Set<string>>(new Set());

  const toggle = (id: string) => {
    setOpenIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  return (
    <ul className={styles.list}>
      {agents.map((agent) => {
        const Icon = AGENT_ICONS[agent.id] ?? AiChat02Icon;
        const badge = AGENT_BADGES[agent.id] ?? '';
        const isRouter = agent.subAgents.length > 0;
        const open = openIds.has(agent.id);
        const count = isRouter ? agent.subAgents.length : agent.tools.length;
        const countLabel = isRouter ? 'agenti delegati' : 'strumenti';

        return (
          <li key={agent.id} className={styles.item}>
            <button
              type="button"
              className={styles.itemHeader}
              onClick={() => toggle(agent.id)}
              aria-expanded={open}
              aria-controls={`agent-panel-${agent.id}`}
            >
              <div className={styles.iconWrap}>
                <HugeiconsIcon
                  icon={Icon}
                  size={20}
                  color="currentColor"
                  strokeWidth={1.5}
                />
              </div>

              <div className={styles.itemTitleBlock}>
                <div className={styles.itemTitleRow}>
                  <h2 className={styles.itemTitle}>{agent.name}</h2>
                  {badge && <span className={styles.badge}>{badge}</span>}
                  <span className={styles.model}>{agent.model}</span>
                </div>
                {agent.description && (
                  <p className={styles.itemDescription}>{agent.description}</p>
                )}
              </div>

              <div className={styles.itemMeta}>
                <span className={styles.counter}>
                  {count} {countLabel}
                </span>
                <span className={`${styles.chevron} ${open ? styles.chevronOpen : ''}`}>
                  <HugeiconsIcon
                    icon={ArrowDown01Icon}
                    size={18}
                    color="currentColor"
                    strokeWidth={1.5}
                  />
                </span>
              </div>
            </button>

            {open && (
              <div id={`agent-panel-${agent.id}`} className={styles.panel}>
                {isRouter ? (
                  <ul className={styles.subList}>
                    {agent.subAgents.map((sa) => (
                      <li key={sa.id} className={styles.subItem}>
                        <span className={styles.subItemTitle}>{sa.name}</span>
                        <span className={styles.subItemId}>agent-{sa.id}</span>
                      </li>
                    ))}
                  </ul>
                ) : agent.tools.length === 0 ? (
                  <p className={styles.empty}>Nessuno strumento configurato.</p>
                ) : (
                  <ul className={styles.subList}>
                    {agent.tools.map((t) => (
                      <li key={t.id} className={styles.subItem}>
                        <div className={styles.subItemHead}>
                          <span className={styles.subItemTitle}>{t.id}</span>
                        </div>
                        <p className={styles.subItemDesc}>{t.description}</p>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            )}
          </li>
        );
      })}
    </ul>
  );
}
