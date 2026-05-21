import { mastra } from '@/mastra';
import Topbar from '@/components/topbar/Topbar';
import AgentsGrid, { type AgentInfo } from '@/components/settings/AgentsGrid';
import styles from '@/components/settings/settings.module.scss';

export const metadata = {
  title: 'Demo Platform — Impostazioni',
};

const AGENT_IDS_VISIBLE = ['assistente', 'tributi', 'utility', 'indicatori'] as const;

function modelLabel(model: unknown): string {
  if (typeof model === 'string') return model;
  if (model && typeof model === 'object' && 'modelId' in model) {
    const m = (model as { modelId?: unknown }).modelId;
    if (typeof m === 'string') return m;
  }
  return 'n/d';
}

async function buildAgentInfos(): Promise<AgentInfo[]> {
  const out: AgentInfo[] = [];

  for (const id of AGENT_IDS_VISIBLE) {
    const agent = mastra.getAgent(id);
    if (!agent) continue;

    const tools = await agent.listTools();
    const subAgents = await agent.listAgents();

    out.push({
      id: agent.id,
      name: agent.name,
      description: agent.getDescription() || '',
      model: modelLabel(agent.model),
      tools: Object.values(tools ?? {})
        .map((t) => {
          const obj = t as { id?: unknown; description?: unknown };
          if (typeof obj?.id !== 'string' || typeof obj?.description !== 'string') return null;
          return { id: obj.id, description: obj.description };
        })
        .filter((t): t is { id: string; description: string } => t !== null),
      subAgents: Object.values(subAgents ?? {}).map((a) => ({ id: a.id, name: a.name })),
    });
  }

  return out;
}

export default async function ImpostazioniPage() {
  const agents = await buildAgentInfos();

  return (
    <>
      <Topbar breadcrumbs={[{ label: 'Impostazioni' }]} />
      <div className={styles.page}>
        <div className={styles.container}>
          <header className={styles.header}>
            <h1 className={styles.title}>Impostazioni</h1>
            <p className={styles.subtitle}>
              Agenti attivi sulla piattaforma e relativi strumenti.
            </p>
          </header>

          <AgentsGrid agents={agents} />
        </div>
      </div>
    </>
  );
}
