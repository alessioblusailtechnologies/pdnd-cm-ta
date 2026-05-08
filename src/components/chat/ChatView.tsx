'use client';

import { useState, useRef, useMemo, useCallback, useEffect, KeyboardEvent, ChangeEvent } from 'react';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Globe02Icon,
  ArrowUp02Icon,
  Search01Icon,
  BookOpen01Icon,
  News01Icon,
  Building01Icon,
} from '@hugeicons/core-free-icons';
import MarkdownRenderer from './MarkdownRenderer';
import Topbar, { type BreadcrumbItem } from '@/components/topbar/Topbar';
import styles from './chat.module.scss';

interface QuickAction {
  label: string;
  icon: typeof Search01Icon;
}

const quickActions: QuickAction[] = [
  { label: 'Servizi al cittadino', icon: Building01Icon },
  { label: 'Normativa', icon: BookOpen01Icon },
  { label: 'Notizie', icon: News01Icon },
  { label: 'Ricerca generica', icon: Search01Icon },
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
    icon: Building01Icon,
    iconBg: '#ebf2fa',
    iconColor: '#00396e',
    title: 'Servizi del Comune',
    description: 'Cerca informazioni aggiornate sui servizi offerti dal Comune di Taranto.',
    prompt: 'Cerca online quali sono gli orari di apertura dell\'anagrafe del Comune di Taranto',
  },
  {
    icon: News01Icon,
    iconBg: '#f5d0d6',
    iconColor: '#b20000',
    title: 'Notizie dal territorio',
    description: 'Trova notizie e aggiornamenti recenti riguardanti la città di Taranto.',
    prompt: 'Quali sono le ultime notizie da Taranto sul tema mobilità urbana?',
  },
];

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

const TOOL_LABELS: Record<string, string> = {
  ricercaWeb: 'Ricerca sul web in corso',
  'ricerca-web': 'Ricerca sul web in corso',
};

function describeTool(toolName: string): string {
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

export default function ChatView() {
  const [message, setMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [sending, setSending] = useState(false);
  const [streaming, setStreaming] = useState(false);
  const [thinkingStatus, setThinkingStatus] = useState<string | null>(null);
  const isIdlePhraseRef = useRef(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const greeting = useMemo(() => {
    const hour = new Date().getHours();
    return hour < 13 ? 'Buongiorno' : 'Buonasera';
  }, []);

  useEffect(() => {
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
  }, []);

  const onInput = useCallback((e: ChangeEvent<HTMLTextAreaElement>) => {
    const target = e.target;
    setMessage(target.value);
    target.style.height = 'auto';
    target.style.height = target.scrollHeight + 'px';
  }, []);

  const sendMessage = useCallback(async (content: string) => {
    if (!content.trim() || sending) return;
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
  }, [sending, chatMessages]);

  const onSend = useCallback(() => {
    sendMessage(message);
  }, [message, sendMessage]);

  const onKeydown = useCallback((e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      onSend();
    }
  }, [onSend]);

  const onQuickAction = useCallback((action: QuickAction) => {
    setMessage(action.label + ': ');
  }, []);

  const onExample = useCallback((example: ExampleCard) => {
    sendMessage(example.prompt);
  }, [sendMessage]);

  const hasMessages = chatMessages.length > 0;

  const chatTitle = useMemo(() => {
    const first = chatMessages.find((m) => m.role === 'user');
    if (!first) return 'Nuova chat';
    return first.content.length > 50 ? first.content.slice(0, 50) + '...' : first.content;
  }, [chatMessages]);

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
              <span className={styles.brandStripeBlue} />
              <span className={styles.brandStripeRed} />
              <span className={styles.brandName}>PDMD-TA</span>
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
          </>
        )}
      </div>
    </div>
    </>
  );
}
