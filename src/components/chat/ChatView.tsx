'use client';

import { useState, useRef, useMemo, useCallback, useEffect, KeyboardEvent, ChangeEvent } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Globe02Icon,
  ArrowUp02Icon,
  Search01Icon,
  MoneyBag02Icon,
  ChartLineData02Icon,
  FileEditIcon,
  Pdf02Icon,
  Doc02Icon,
  Xls02Icon,
  Download01Icon,
  InformationCircleIcon,
} from '@hugeicons/core-free-icons';
import MarkdownRenderer from './MarkdownRenderer';
import Topbar, { type BreadcrumbItem } from '@/components/topbar/Topbar';
import styles from './chat.module.scss';

interface QuickAction {
  label: string;
  icon: typeof Search01Icon;
  prompt: string;
}

const quickActions: QuickAction[] = [
  { label: 'Posizione tributaria', icon: MoneyBag02Icon, prompt: 'Posizione tributaria del codice fiscale ' },
  { label: 'Indicatori del Comune', icon: ChartLineData02Icon, prompt: 'Indicatori ' },
  { label: 'Genera documento', icon: FileEditIcon, prompt: 'Genera un PDF su ' },
  { label: 'Ricerca sul web', icon: Search01Icon, prompt: 'Cerca ' },
];

interface ExampleCard {
  icon: typeof Search01Icon;
  iconBg: string;
  iconColor: string;
  title: string;
  description: string;
  prompt: string;
}

const examples: ExampleCard[] = [
  {
    icon: MoneyBag02Icon,
    iconBg: '#dbe7f5',
    iconColor: '#00396e',
    title: 'Consulta posizione tributaria',
    description: 'IMU, TARI, avvisi, versamenti e accertamenti del contribuente.',
    prompt: 'Mostrami la posizione TARI del contribuente con codice fiscale RSSMRA80A01H501U',
  },
  {
    icon: ChartLineData02Icon,
    iconBg: '#d8ecdf',
    iconColor: '#1f6e43',
    title: 'Indicatori del Comune',
    description: 'KPI di bilancio, personale, digitalizzazione e dinamica demografica.',
    prompt: 'Dammi gli indicatori finanziari principali del Comune di Taranto',
  },
];

interface DemoSoggetto {
  cf: string;
  descrizione: string;
}

const demoSoggetti: DemoSoggetto[] = [
  { cf: 'RSSMRA80A01H501U', descrizione: 'Mario Rossi — persona fisica' },
  { cf: 'VRDLGI75B15H501Z', descrizione: 'Luigi Verdi — persona fisica' },
  { cf: '12345678901', descrizione: 'Acme Tarantina S.r.l. — persona giuridica' },
];

type AttachmentKind = 'pdf' | 'word' | 'excel';

interface MessageAttachment {
  kind: AttachmentKind;
  filename: string;
  url: string;
  file_id: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  attachments?: MessageAttachment[];
}

export interface InitialMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  attachments?: MessageAttachment[];
}

export interface InitialChat {
  id: string;
  title: string;
  messages: InitialMessage[];
}

const TOOL_LABELS: Record<string, string> = {
  ricercaWeb: 'Ricerca sul web in corso',
  'ricerca-web': 'Ricerca sul web in corso',
  generaPdf: 'Generazione PDF in corso',
  'genera-pdf': 'Generazione PDF in corso',
  generaWord: 'Generazione documento Word in corso',
  'genera-word': 'Generazione documento Word in corso',
  generaExcel: 'Generazione foglio Excel in corso',
  'genera-excel': 'Generazione foglio Excel in corso',
  inviaMail: 'Invio mail in corso',
  'invia-mail': 'Invio mail in corso',
};

const ATTACHMENT_META: Record<AttachmentKind, { label: string; icon: typeof Pdf02Icon; color: string; bg: string }> = {
  pdf:   { label: 'PDF',   icon: Pdf02Icon, color: '#b20000', bg: '#f5d0d6' },
  word:  { label: 'Word',  icon: Doc02Icon, color: '#00396e', bg: '#dbe7f5' },
  excel: { label: 'Excel', icon: Xls02Icon, color: '#1f6e43', bg: '#d8ecdf' },
};

function describeTool(toolName: string): string {
  if (toolName.startsWith('agent-')) {
    const sub = toolName.slice('agent-'.length);
    return `Delego all'agente ${sub}`;
  }
  return TOOL_LABELS[toolName] || 'Elaborazione in corso';
}

const IDLE_PHRASES: readonly string[] = [
  'Ragionamento in corso',
  'Analisi della richiesta',
  'Valutazione del contesto',
  'Elaborazione delle informazioni',
  'Preparazione della risposta',
];

function randomIdlePhrase(exclude?: string | null): string {
  const pool = exclude ? IDLE_PHRASES.filter((p) => p !== exclude) : IDLE_PHRASES;
  return pool[Math.floor(Math.random() * pool.length)];
}

interface Props {
  initialChat?: InitialChat;
}

export default function ChatView({ initialChat }: Props) {
  const router = useRouter();
  const [message, setMessage] = useState('');
  // chatId è derivato dalle props: quando si naviga tra chat, ChatView viene
  // re-montato con un'initialChat diversa (vedi key={chat.id} in page.tsx),
  // quindi non serve uno useState aggiornabile.
  const chatId = initialChat?.id ?? null;
  const [chatTitle, setChatTitle] = useState<string>(initialChat?.title ?? 'Nuova chat');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(
    initialChat?.messages.map((m) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      attachments: m.attachments,
    })) ?? [],
  );
  const [sending, setSending] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [thinkingStatus, setThinkingStatus] = useState<string | null>(null);
  const isIdlePhraseRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    return hour < 13 ? 'Buongiorno' : 'Buonasera';
  }, []);

  // "Nuova chat" event dalla sidebar — reset stato locale quando siamo già
  // su /. Se siamo su /chat/[id], il click sul link sidebar fa la navigazione
  // via Next.js router, ChatView verrà smontato (key cambia) e i nuovi stati
  // partiranno da initialChat = undefined.
  useEffect(() => {
    if (chatId) return;
    const handler = () => {
      setChatMessages([]);
      setMessage('');
      setThinkingStatus(null);
      setStreaming(false);
      setSending(false);
      isIdlePhraseRef.current = false;
    };
    window.addEventListener('pdmd:new-chat', handler);
    return () => window.removeEventListener('pdmd:new-chat', handler);
  }, [chatId]);

  const onInput = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    const target = e.target;
    setMessage(target.value);
    target.style.height = 'auto';
    target.style.height = target.scrollHeight + 'px';
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || sending) return;

    // Se non abbiamo ancora una chat (siamo su /): crea la chat, stasha il
    // messaggio in sessionStorage, naviga a /chat/[id]. La pagina di
    // destinazione monterà ChatView con chatId valido e riprenderà il
    // messaggio pendente per far partire lo stream lì. Questo evita di
    // manipolare manualmente la history e tiene il router Next.js in sync.
    if (!chatId) {
      setSending(true);
      try {
        const res = await fetch('/api/chats', { method: 'POST' });
        if (!res.ok) throw new Error('Errore creazione chat');
        const { chat } = (await res.json()) as { chat: { id: string; title: string } };
        sessionStorage.setItem('pdmd:pendingChatId', chat.id);
        sessionStorage.setItem('pdmd:pendingMessage', content.trim());
        window.dispatchEvent(new CustomEvent('pdmd:chats-updated'));
        router.replace(`/chat/${chat.id}`);
      } catch {
        setSending(false);
      }
      return;
    }

    setSending(true);

    const userMsg: ChatMessage = {
      id: crypto.randomUUID(),
      role: 'user',
      content: content.trim(),
    };

    const previousMessages = chatMessages;
    setChatMessages((prev) => [...prev, userMsg]);
    setMessage('');
    requestAnimationFrame(() => {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
    });
    isIdlePhraseRef.current = true;
    setThinkingStatus(randomIdlePhrase());

    const idleRotationTimer = setInterval(() => {
      if (isIdlePhraseRef.current) {
        setThinkingStatus((prev) => randomIdlePhrase(prev));
      }
    }, 2200);

    const botId = crypto.randomUUID();
    setChatMessages((prev) => [
      ...prev,
      { id: botId, role: 'assistant', content: '' },
    ]);
    setStreaming(true);

    let receivedText = '';
    let streamDone = false;

    const QUIET_MS = 700;
    let idleReturnTimer: ReturnType<typeof setTimeout> | null = null;
    const cancelIdleReturn = () => {
      if (idleReturnTimer) {
        clearTimeout(idleReturnTimer);
        idleReturnTimer = null;
      }
    };
    const scheduleIdleReturn = () => {
      cancelIdleReturn();
      idleReturnTimer = setTimeout(() => {
        if (!streamDone) {
          isIdlePhraseRef.current = true;
          setThinkingStatus(randomIdlePhrase());
        }
      }, QUIET_MS);
    };

    let lastFlushedLen = 0;

    const tick = () => {
      if (receivedText.length > lastFlushedLen) {
        lastFlushedLen = receivedText.length;
        const snapshot = receivedText;
        setChatMessages((prev) =>
          prev.map((m) => (m.id === botId ? { ...m, content: snapshot } : m)),
        );
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }

      if (streamDone && lastFlushedLen >= receivedText.length) {
        clearInterval(idleRotationTimer);
        cancelIdleReturn();
        setStreaming(false);
        setSending(false);
        isIdlePhraseRef.current = false;
        setThinkingStatus(null);
        return;
      }

      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: previousMessages.map((m) => ({ role: m.role, content: m.content })),
          message: content.trim(),
          chat_id: chatId,
        }),
      });

      if (!res.ok) throw new Error('Errore nella risposta');

      const reader = res.body?.getReader();
      const decoder = new TextDecoder();

      if (reader) {
        let sseBuffer = '';
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;

          sseBuffer += decoder.decode(value, { stream: true });
          const lines = sseBuffer.split('\n\n');
          sseBuffer = lines.pop() || '';

          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'text') {
                receivedText += data.content;
                if (receivedText.length > 0) {
                  isIdlePhraseRef.current = false;
                  setThinkingStatus(null);
                  scheduleIdleReturn();
                }
              } else if (data.type === 'tool_call') {
                cancelIdleReturn();
                isIdlePhraseRef.current = false;
                setThinkingStatus(describeTool(data.tool_name || ''));
              } else if (data.type === 'attachment' && data.attachment) {
                setChatMessages((prev) =>
                  prev.map((m) =>
                    m.id === botId
                      ? { ...m, attachments: [...(m.attachments || []), data.attachment as MessageAttachment] }
                      : m,
                  ),
                );
              } else if (data.type === 'title' && typeof data.title === 'string') {
                setChatTitle(data.title);
                window.dispatchEvent(new CustomEvent('pdmd:chats-updated'));
              } else if (data.type === 'error') {
                receivedText += `\n\nErrore: ${data.content}`;
              }
            } catch {
              // skip malformed JSON
            }
          }
        }
      }
    } catch {
      receivedText = receivedText || 'Mi dispiace, si è verificato un errore. Riprova.';
    } finally {
      streamDone = true;
    }
  }, [sending, chatMessages, chatId, router]);

  const onSend = useCallback(() => {
    sendMessage(message);
  }, [message, sendMessage]);

  // Drena un eventuale messaggio "pendente" salvato dalla home: quando
  // sendMessage è stato chiamato senza chatId, abbiamo creato la chat,
  // navigato qui e stashato il contenuto in sessionStorage. Lo recuperiamo
  // e facciamo partire lo stream sulla nuova route.
  useEffect(() => {
    if (!chatId) return;
    if (typeof window === 'undefined') return;
    const pendingChatId = window.sessionStorage.getItem('pdmd:pendingChatId');
    const pendingMessage = window.sessionStorage.getItem('pdmd:pendingMessage');
    if (pendingChatId !== chatId || !pendingMessage) return;
    window.sessionStorage.removeItem('pdmd:pendingChatId');
    window.sessionStorage.removeItem('pdmd:pendingMessage');
    // eslint-disable-next-line react-hooks/set-state-in-effect -- drain del messaggio pendente passato dalla home tramite sessionStorage
    sendMessage(pendingMessage);
  }, [chatId, sendMessage]);

  const onKeydown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  }, [onSend]);

  const onQuickAction = useCallback((action: QuickAction) => {
    setMessage(action.prompt);
  }, []);

  const onExample = useCallback((example: ExampleCard) => {
    sendMessage(example.prompt);
  }, [sendMessage]);

  const hasMessages = chatMessages.length > 0;

  const breadcrumbs = useMemo(() => {
    const items: BreadcrumbItem[] = [{ label: 'Assistente', href: '/' }];
    if (hasMessages) items.push({ label: chatTitle });
    return items;
  }, [hasMessages, chatTitle]);

  return (
    <>
      <Topbar breadcrumbs={breadcrumbs} />
      <div className={`${styles.assistantPage} ${hasMessages ? styles.chatMode : ''}`}>
      <div className={styles.assistantContainer}>
        {!hasMessages && (
          <>
            <div className={styles.brandHeader}>
              <Image
                src="/logo-comune-taranto.png"
                alt="Stemma Comune di Taranto"
                width={90}
                height={115}
                className={styles.brandLogo}
                priority
              />
            </div>
            <div className={styles.greetingSection}>
              <h1 className={styles.greetingTitle}>{greeting}</h1>
              <p className={styles.greetingSubtitle}>
                Sono l&apos;assistente del Comune di Taranto. Come posso aiutarti?
              </p>
            </div>
          </>
        )}

        {hasMessages && (
          <div className={styles.chatArea}>
            {chatMessages.map((msg, idx) => {
              const isActiveStream = streaming && msg.role === 'assistant' && idx === chatMessages.length - 1;
              return (
                <div key={msg.id} className={`${styles.chatBubble} ${styles[msg.role]}`}>
                  {msg.role === 'user' ? (
                    <div className={`${styles.chatBubbleContent} ${styles.chatBubbleContentUser}`}>
                      {msg.content}
                    </div>
                  ) : (
                    <div className={styles.chatBubbleContent}>
                      {msg.content ? <MarkdownRenderer content={msg.content} /> : null}
                      {isActiveStream && thinkingStatus && (
                        <div className={styles.thinkingStatus}>
                          <span className={styles.thinkingDot} />
                          <span className={styles.thinkingText}>{thinkingStatus}</span>
                        </div>
                      )}
                      {msg.attachments && msg.attachments.length > 0 && (
                        <div className={styles.attachmentsList}>
                          {msg.attachments.map((att) => {
                            const meta = ATTACHMENT_META[att.kind];
                            return (
                              <a
                                key={att.file_id}
                                href={att.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                download={att.filename}
                                className={styles.attachmentItem}
                              >
                                <div className={styles.attachmentIcon} style={{ background: meta.bg, color: meta.color }}>
                                  <HugeiconsIcon icon={meta.icon} size={20} color="currentColor" strokeWidth={1.5} />
                                </div>
                                <div className={styles.attachmentInfo}>
                                  <div className={styles.attachmentName}>{att.filename}</div>
                                  <div className={styles.attachmentMeta}>{meta.label} · Clicca per scaricare</div>
                                </div>
                                <div className={styles.attachmentDownload}>
                                  <HugeiconsIcon icon={Download01Icon} size={16} color="currentColor" strokeWidth={1.5} />
                                </div>
                              </a>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
            <div ref={messagesEndRef} />
          </div>
        )}

        <div className={`${styles.inputSection} ${hasMessages ? styles.inputSectionChat : ''}`}>
          <div className={styles.inputBox}>
            <textarea
              className={styles.chatInput}
              placeholder="Scrivi una domanda..."
              value={message}
              onChange={onInput}
              onKeyDown={onKeydown}
              rows={1}
            />
            <div className={styles.inputActions}>
              <div className={styles.inputActionsLeft}>
                <button className={styles.actionBtn} type="button">
                  <HugeiconsIcon icon={Globe02Icon} size={16} color="currentColor" strokeWidth={1.5} />
                  <span>Ricerca Web</span>
                </button>
              </div>
              <button
                className={`${styles.sendBtn} ${message.trim().length > 0 ? styles.active : ''}`}
                onClick={onSend}
                disabled={sending}
                type="button"
              >
                <HugeiconsIcon icon={ArrowUp02Icon} size={18} color="currentColor" strokeWidth={2} />
              </button>
            </div>
          </div>
        </div>

        {!hasMessages && (
          <>
            <div className={styles.quickActions}>
              {quickActions.map((action) => (
                <button key={action.label} className={styles.chip} onClick={() => onQuickAction(action)} type="button">
                  <HugeiconsIcon icon={action.icon} size={15} color="currentColor" strokeWidth={1.5} />
                  {action.label}
                </button>
              ))}
            </div>

            <div className={styles.examples}>
              {examples.map((example) => (
                <button
                  key={example.title}
                  className={styles.exampleCard}
                  onClick={() => onExample(example)}
                  type="button"
                >
                  <div className={styles.exampleIcon} style={{ background: example.iconBg, color: example.iconColor }}>
                    <HugeiconsIcon icon={example.icon} size={22} color="currentColor" strokeWidth={1.5} />
                  </div>
                  <div className={styles.exampleContent}>
                    <div className={styles.exampleTitle}>{example.title}</div>
                    <div className={styles.exampleDesc}>{example.description}</div>
                    <div className={styles.examplePrompt}>
                      <span className={styles.examplePromptLabel}>Prova:</span> &ldquo;{example.prompt}&rdquo;
                    </div>
                  </div>
                </button>
              ))}
            </div>

            <div className={styles.demoNotice}>
              <div className={styles.demoNoticeIcon}>
                <HugeiconsIcon icon={InformationCircleIcon} size={18} color="currentColor" strokeWidth={1.5} />
              </div>
              <div className={styles.demoNoticeBody}>
                <div className={styles.demoNoticeTitle}>Ambiente dimostrativo</div>
                <p className={styles.demoNoticeText}>
                  I dati non sono reali. Le funzioni tributarie rispondono solo per i
                  seguenti codici fiscali di prova:
                </p>
                <ul className={styles.demoNoticeList}>
                  {demoSoggetti.map((s) => (
                    <li key={s.cf} className={styles.demoNoticeItem}>
                      <code className={styles.demoNoticeCf}>{s.cf}</code>
                      <span className={styles.demoNoticeDesc}>{s.descrizione}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
    </>
  );
}
