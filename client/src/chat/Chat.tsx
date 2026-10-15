import styles from './chat.module.css';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { useAudio } from '../context/AudioContext.tsx';
import { api, ApiError, isNetworkError } from '../lib/api';
import PixelAvatar from '../components/avatar/PixelAvatar.tsx';
import ReplyTray from './ReplyTray.tsx';

interface ChatDto {
  id: number;
  chatName: string;
  isTrafficker: boolean;
  messages: { messageText: string; isOutgoing: boolean }[];
}

interface GeneratedTurn {
  chatResponse: string;
  option1: string;
  option2: string;
  option3: string;
  dangerLevel1: number;
  dangerLevel2: number;
  dangerLevel3: number;
  updatedDangerLevel: number;
}

interface Contact {
  id: number;
  name: string;
  preview: string;
  unread: boolean;
  isTrafficker: boolean;
}

interface ActiveChat {
  id: number;
  name: string;
  isTrafficker: boolean;
}

interface Message {
  outgoing: boolean;
  text: string;
}

/** The generated replies for one chat, kept so switching chats doesn't regenerate them. */
interface SavedTurn {
  /** The contact message these options answer; stale once the chat moves on. */
  lastMessage: string;
  options: string[];
  dangerLevels: number[];
  dangerLevel: number;
}

// Per tab, so it survives mini-games and reloads but not closing the game.
const SAVED_TURNS_KEY = 'chatSavedTurns';

const loadSavedTurns = (): Record<number, SavedTurn> => {
  try {
    return JSON.parse(sessionStorage.getItem(SAVED_TURNS_KEY) ?? '{}');
  } catch {
    return {};
  }
};

/** New contacts keep reaching out while the player chats, up to this many. */
const MAX_CONTACTS = 8;
const FIRST_ARRIVAL_MS = 40_000;
const ARRIVAL_MIN_MS = 70_000;
const ARRIVAL_MAX_MS = 130_000;
const TOAST_MS = 7_000;

const wait = (ms: number) => new Promise((res) => setTimeout(res, ms));
const randomBetween = (min: number, max: number) =>
  min + Math.random() * (max - min);

/** Splits a reply into sentence-sized chunks so the contact "types" several short messages. */
const toChunks = (text: string) =>
  String(text)
    .replace(/^"|"$/g, '')
    .trim()
    // split before the next sentence only, so trailing emojis stay with theirs
    .split(/(?<=[.!?;])\s+(?=[\p{L}\p{N}])/u)
    .map((c) => c.trim())
    .filter((c) => c.length > 0);

/** Consecutive messages from the same side render as one group. */
const groupMessages = (messages: Message[]) =>
  messages.reduce<{ outgoing: boolean; texts: string[] }[]>((groups, m) => {
    const last = groups[groups.length - 1];
    if (last && last.outgoing === m.outgoing) last.texts.push(m.text);
    else groups.push({ outgoing: m.outgoing, texts: [m.text] });
    return groups;
  }, []);

const Chat: React.FC = () => {
  const { t, i18n } = useTranslation();
  const { userId } = useAuth();
  const navigate = useNavigate();
  const { changeMusic, playMusic, playClick } = useAudio();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [activeChat, setActiveChat] = useState<ActiveChat | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [listOpen, setListOpen] = useState(false);
  const [toast, setToast] = useState<Contact | null>(null);

  const [options, setOptions] = useState<string[]>([]);
  const [dangerLevels, setDangerLevels] = useState<number[]>([]);
  const [updatedDangerLevel, setUpdatedDangerLevel] = useState(0);
  const [busy, setBusy] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [replyError, setReplyError] = useState<string | null>(null);

  // Refs let timers and in-flight requests see the latest state.
  const contactsRef = useRef<Contact[]>([]);
  contactsRef.current = contacts;
  const activeIdRef = useRef<number | null>(null);
  const namesRef = useRef<{ name: string; surname: string }[] | null>(null);
  const retryRef = useRef<() => void>(() => {});
  const savedTurnsRef = useRef<Record<number, SavedTurn>>(loadSavedTurns());
  // Chats whose contact is still "typing" a reply that was already requested.
  const pendingRef = useRef<Set<number>>(new Set());
  const scrollRef = useRef<HTMLDivElement>(null);
  const playClickRef = useRef(playClick);
  playClickRef.current = playClick;

  useEffect(() => {
    changeMusic(5);
    playMusic();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Newest message sits at the bottom; keep it in view.
  useEffect(() => {
    const el = scrollRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [messages, isTyping]);

  const setPreview = (chatId: number, preview: string) =>
    setContacts((prev) =>
      prev.map((c) => (c.id === chatId ? { ...c, preview } : c))
    );

  const replyErrorMessage = (err: unknown) => {
    if (err instanceof ApiError && err.status === 429) {
      return t('chatReply.busy', { seconds: err.retryAfter ?? 30 });
    }
    if (isNetworkError(err)) return t('login.network');
    return t('chatReply.unavailable');
  };

  const requestTurn = (
    lastMessage: string,
    currentDangerLevel: number,
    chat: ActiveChat
  ) =>
    api<GeneratedTurn>('/api/v1/message-generation/generate', {
      method: 'POST',
      body: {
        context: 'A child is chatting with someone online.',
        lastMessage,
        currentDangerLevel,
        isTrafficker: chat.isTrafficker,
        language: i18n.language,
        // Lets the backend give the model the stored conversation history.
        chatId: chat.id,
      },
    });

  const saveTurn = (chatId: number, turn: SavedTurn) => {
    savedTurnsRef.current = { ...savedTurnsRef.current, [chatId]: turn };
    try {
      sessionStorage.setItem(
        SAVED_TURNS_KEY,
        JSON.stringify(savedTurnsRef.current)
      );
    } catch {
      // Storage can be full or blocked; the in-memory copy still works.
    }
  };

  const toSavedTurn = (data: GeneratedTurn, lastMessage: string) => ({
    lastMessage,
    options: [data.option1, data.option2, data.option3].filter(Boolean),
    dangerLevels: [data.dangerLevel1, data.dangerLevel2, data.dangerLevel3],
    dangerLevel: data.updatedDangerLevel || 0,
  });

  const showTurn = (turn: SavedTurn) => {
    setOptions(turn.options);
    setDangerLevels(turn.dangerLevels);
    setUpdatedDangerLevel(turn.dangerLevel);
  };

  /** Only fetches the three reply options, for a chat that ends on their message. */
  const fetchSuggestions = async (
    lastMessage: string,
    dangerLevel: number,
    chat: ActiveChat
  ) => {
    retryRef.current = () => fetchSuggestions(lastMessage, dangerLevel, chat);
    setReplyError(null);
    setBusy(true);
    try {
      const data = await requestTurn(lastMessage, dangerLevel, chat);
      const turn = toSavedTurn(data, lastMessage);
      saveTurn(chat.id, turn);
      if (activeIdRef.current === chat.id) showTurn(turn);
    } catch (err) {
      if (activeIdRef.current === chat.id)
        setReplyError(replyErrorMessage(err));
    } finally {
      if (activeIdRef.current === chat.id) setBusy(false);
    }
  };

  /** Asks for the contact's next message, "types" it into the chat and shows new options. */
  const fetchReply = async (
    lastMessage: string,
    dangerLevel: number,
    chat: ActiveChat
  ) => {
    retryRef.current = () => fetchReply(lastMessage, dangerLevel, chat);
    const isActive = () => activeIdRef.current === chat.id;
    setReplyError(null);
    setBusy(true);
    setIsTyping(true);
    pendingRef.current.add(chat.id);
    try {
      const data = await requestTurn(lastMessage, dangerLevel, chat);
      const chunks = data.chatResponse ? toChunks(data.chatResponse) : [];

      for (let i = 0; i < chunks.length; i++) {
        if (i > 0) await wait(700);
        // simulate typing: 40 ms per character, up to 2 s
        await wait(Math.min(2000, chunks[i].length * 40));
        if (isActive()) {
          setMessages((prev) => [
            ...prev,
            { outgoing: false, text: chunks[i] },
          ]);
        }
        try {
          await api('/api/messages', {
            method: 'POST',
            body: {
              chatId: chat.id,
              isOutgoing: false,
              messageText: chunks[i],
            },
          });
        } catch (err) {
          console.error('Error saving incoming message:', err);
        }
      }
      if (chunks.length > 0) setPreview(chat.id, chunks[chunks.length - 1]);
      // Saved even when the player has switched away, so the options wait for them.
      const turn = toSavedTurn(data, chunks[chunks.length - 1] ?? lastMessage);
      saveTurn(chat.id, turn);
      // Options appear only after the contact has finished typing.
      if (isActive()) showTurn(turn);
    } catch (err) {
      if (isActive()) setReplyError(replyErrorMessage(err));
    } finally {
      pendingRef.current.delete(chat.id);
      if (isActive()) {
        setIsTyping(false);
        setBusy(false);
      }
    }
  };

  const handlePick = async (picked: string) => {
    if (!activeChat) return;
    const text = picked.replace(/^"|"$/g, '').trim();
    setBusy(true);
    setOptions([]);
    // The saved options are used up; keep the danger level for this chat.
    saveTurn(activeChat.id, {
      lastMessage: '',
      options: [],
      dangerLevels: [],
      dangerLevel: updatedDangerLevel,
    });
    setMessages((prev) => [...prev, { outgoing: true, text }]);
    setPreview(activeChat.id, text);
    try {
      await api('/api/messages', {
        method: 'POST',
        body: { chatId: activeChat.id, isOutgoing: true, messageText: text },
      });
    } catch (err) {
      console.error('Error saving outgoing message:', err);
    }
    fetchReply(text, updatedDangerLevel, activeChat);
  };

  const openChat = async (contactId: number) => {
    if (activeIdRef.current === contactId) {
      setListOpen(false);
      return;
    }
    activeIdRef.current = contactId;
    setListOpen(false);
    setToast((current) => (current?.id === contactId ? null : current));
    setContacts((prev) =>
      prev.map((c) => (c.id === contactId ? { ...c, unread: false } : c))
    );
    setMessages([]);
    setOptions([]);
    setDangerLevels([]);
    setIsTyping(false);
    setReplyError(null);
    setBusy(true);
    try {
      const dto = await api<ChatDto>(`/api/chats/${contactId}`);
      if (activeIdRef.current !== contactId) return;
      const chat = {
        id: dto.id,
        name: dto.chatName,
        isTrafficker: dto.isTrafficker,
      };
      setActiveChat(chat);
      const history = (dto.messages ?? []).map((m) => ({
        outgoing: m.isOutgoing,
        text: m.messageText,
      }));
      setMessages(history);

      const saved = savedTurnsRef.current[chat.id];
      const dangerLevel = saved?.dangerLevel ?? 0;
      setUpdatedDangerLevel(dangerLevel);

      // A reply requested earlier is still being typed; it finishes in this chat.
      if (pendingRef.current.has(chat.id)) {
        setIsTyping(true);
        return;
      }

      const last = history[history.length - 1];
      if (!last) {
        // A fresh contact opens the conversation.
        await fetchReply('Hello', 0, chat);
      } else if (!last.outgoing) {
        if (saved?.options.length && saved.lastMessage === last.text) {
          showTurn(saved);
          setBusy(false);
        } else {
          await fetchSuggestions(last.text, dangerLevel, chat);
        }
      } else {
        await fetchReply(last.text, dangerLevel, chat);
      }
    } catch (err) {
      console.error('Error loading chat:', err);
      if (activeIdRef.current === contactId) {
        setReplyError(replyErrorMessage(err));
        setBusy(false);
      }
    }
  };

  /** Creates a contact with a name nobody in the list has yet. */
  const createContact = useCallback(async (): Promise<Contact | null> => {
    try {
      if (!namesRef.current) {
        const res = await fetch('/json/chat_names.json');
        if (!res.ok) throw new Error('Failed to load chat names');
        namesRef.current = await res.json();
      }
      const taken = new Set(contactsRef.current.map((c) => c.name));
      const free = (namesRef.current ?? [])
        .map((n) => `${n.name} ${n.surname}`)
        .filter((n) => !taken.has(n));
      if (free.length === 0) return null;

      // Until a trafficker has shown up, each new contact is more likely to be one.
      const hasTrafficker = contactsRef.current.some((c) => c.isTrafficker);
      const created = await api<ChatDto>('/api/chats', {
        method: 'POST',
        body: {
          chatName: free[Math.floor(Math.random() * free.length)],
          isTrafficker: Math.random() < (hasTrafficker ? 0.2 : 0.5),
        },
      });
      return {
        id: created.id,
        name: created.chatName,
        preview: t('chat.newRequest'),
        unread: true,
        isTrafficker: created.isTrafficker,
      };
    } catch (err) {
      console.error('Failed to create chat:', err);
      return null;
    }
  }, [t]);

  // Load the player's chats, starting with one contact if there are none.
  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    (async () => {
      try {
        const chats = await api<ChatDto[]>(`/api/chats/user/${userId}`);
        let list: Contact[] = chats.map((c) => ({
          id: c.id,
          name: c.chatName,
          preview: c.messages?.[c.messages.length - 1]?.messageText ?? '',
          unread: false,
          isTrafficker: c.isTrafficker,
        }));
        if (list.length === 0) {
          const first = await createContact();
          if (first) list = [first];
        }
        if (cancelled) return;
        // Newest contacts are listed first.
        setContacts([...list].reverse());
        if (list.length > 0) openChat(list[list.length - 1].id);
      } catch (err) {
        console.error('Error fetching chats:', err);
      } finally {
        if (!cancelled) setLoadingContacts(false);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  // Every minute or two someone new sends a message, until the list is full.
  useEffect(() => {
    if (loadingContacts) return;
    let timer: number;
    let cancelled = false;
    const schedule = (delay: number) => {
      timer = window.setTimeout(async () => {
        if (contactsRef.current.length >= MAX_CONTACTS) return;
        const contact = await createContact();
        if (cancelled) return;
        if (contact) {
          setContacts((prev) => [contact, ...prev]);
          setToast(contact);
          playClickRef.current(2);
        }
        schedule(randomBetween(ARRIVAL_MIN_MS, ARRIVAL_MAX_MS));
      }, delay);
    };
    schedule(
      contactsRef.current.length <= 1
        ? FIRST_ARRIVAL_MS
        : randomBetween(ARRIVAL_MIN_MS, ARRIVAL_MAX_MS)
    );
    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [loadingContacts, createContact]);

  useEffect(() => {
    if (!toast) return;
    const id = window.setTimeout(() => setToast(null), TOAST_MS);
    return () => window.clearTimeout(id);
  }, [toast]);

  const groups = groupMessages(messages);

  return (
    <div className={styles.room}>
      <div className={styles.window} data-list-open={listOpen || !activeChat}>
        <header className={styles.titlebar}>
          <h1 className={styles.appName}>
            <span className={styles.appIcon} aria-hidden="true" />
            {t('chat.title')}
          </h1>
          <nav className={styles.titleActions}>
            <Link to="/" className={styles.titleLink}>
              {t('chat.menu')}
            </Link>
            <button
              type="button"
              className="shell-button"
              onClick={() => navigate('/final-select')}
            >
              {t('chat.finish')}
            </button>
          </nav>
        </header>

        <div className={styles.panes}>
          <aside className={styles.contacts} aria-labelledby="contacts-title">
            <h2 id="contacts-title" className={styles.paneTitle}>
              {t('chat.contacts')}
            </h2>
            {loadingContacts ? (
              <p className={styles.paneNote}>{t('chat.loading')}</p>
            ) : (
              <ul className={styles.contactList}>
                {contacts.map((c) => (
                  <li key={c.id}>
                    <button
                      type="button"
                      className={styles.contact}
                      aria-current={
                        activeChat?.id === c.id ? 'true' : undefined
                      }
                      onClick={() => openChat(c.id)}
                    >
                      <PixelAvatar
                        seed={c.name}
                        size={44}
                        className={styles.avatar}
                      />
                      <span className={styles.contactText}>
                        <span className={styles.contactName}>{c.name}</span>
                        <span className={styles.contactPreview}>
                          {c.preview || t('chat.noMessages')}
                        </span>
                      </span>
                      {c.unread && (
                        <span className={styles.unread}>
                          <span className="visually-hidden">
                            {t('chat.unread')}
                          </span>
                        </span>
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </aside>

          <section
            className={styles.conversation}
            aria-label={activeChat?.name}
          >
            {activeChat ? (
              <>
                <div className={styles.conversationTop}>
                  <button
                    type="button"
                    className={styles.backButton}
                    onClick={() => setListOpen(true)}
                    aria-label={t('chat.back')}
                  >
                    <span aria-hidden="true">◀</span>
                  </button>
                  <PixelAvatar
                    seed={activeChat.name}
                    size={40}
                    className={styles.avatar}
                  />
                  <h2 className={styles.conversationName}>{activeChat.name}</h2>
                  {import.meta.env.DEV && (
                    <span className={styles.devInfo}>
                      danger {updatedDangerLevel} · options{' '}
                      {dangerLevels.join('/')} ·{' '}
                      {activeChat.isTrafficker ? 'trafficker' : 'safe'}
                    </span>
                  )}
                </div>

                <div className={styles.messages} ref={scrollRef}>
                  <p className={styles.systemNote}>
                    {t('chat.neverMet', { name: activeChat.name })}
                  </p>
                  {groups.map((g, i) => (
                    <div
                      key={i}
                      className={styles.group}
                      data-side={g.outgoing ? 'out' : 'in'}
                    >
                      {!g.outgoing && (
                        <PixelAvatar
                          seed={activeChat.name}
                          size={32}
                          className={styles.groupAvatar}
                        />
                      )}
                      <div className={styles.bubbles}>
                        {g.texts.map((text, j) => (
                          <p key={j} className={styles.bubble}>
                            {text}
                          </p>
                        ))}
                      </div>
                    </div>
                  ))}
                  {isTyping && (
                    <div className={styles.group} data-side="in">
                      <PixelAvatar
                        seed={activeChat.name}
                        size={32}
                        className={styles.groupAvatar}
                      />
                      <div className={styles.bubbles}>
                        <p
                          className={`${styles.bubble} ${styles.typing}`}
                          aria-label={t('chat.typing', {
                            name: activeChat.name,
                          })}
                        >
                          <span />
                          <span />
                          <span />
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            ) : (
              <p className={styles.paneNote}>
                {loadingContacts ? t('chat.loading') : t('chat.empty')}
              </p>
            )}
          </section>
        </div>

        {activeChat && (
          <div className={styles.tray}>
            <ReplyTray
              status={
                replyError
                  ? 'error'
                  : busy || isTyping || options.length === 0
                    ? 'loading'
                    : 'ready'
              }
              options={options}
              error={replyError ?? undefined}
              onPick={handlePick}
              onRetry={() => retryRef.current()}
            />
          </div>
        )}
      </div>

      <div className={styles.toastRegion} aria-live="polite">
        {toast && (
          <div className={styles.toast}>
            <PixelAvatar
              seed={toast.name}
              size={44}
              className={styles.avatar}
            />
            <p className={styles.toastText}>
              {t('chat.arrived', { name: toast.name })}
            </p>
            <button
              type="button"
              className={styles.toastOpen}
              onClick={() => openChat(toast.id)}
            >
              {t('chat.open')}
            </button>
            <button
              type="button"
              className={styles.toastClose}
              onClick={() => setToast(null)}
              aria-label={t('chat.dismiss')}
            >
              <span aria-hidden="true">✕</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Chat;
