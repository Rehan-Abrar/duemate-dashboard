import { useEffect, useMemo, useState } from "react";
import { adminInboxApi, ApiClientError } from "../../api";
import type {
  AdminInboxContact,
  AdminInboxMessage,
  AdminInboxSummary,
} from "../../types";
import { Spinner } from "../../components/ui/spinner";

const CONTACT_PAGE_SIZE = 20;
const MESSAGE_PAGE_SIZE = 30;

function formatWaNumber(waId: string): string {
  const digits = (waId || "").replace(/\D/g, "");
  if (digits.startsWith("92") && digits.length >= 12) {
    return `+92 ${digits.slice(2, 5)} ${digits.slice(5)}`;
  }
  if (digits) return `+${digits}`;
  return waId || "—";
}

function startOfLocalDay(d: Date): Date {
  return new Date(d.getFullYear(), d.getMonth(), d.getDate());
}

function formatLastSeen(value?: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const today = startOfLocalDay(new Date());
  const then = startOfLocalDay(d);
  const days = Math.round((today.getTime() - then.getTime()) / 86400000);
  if (days === 0) return "Today";
  if (days === 1) return "Yesterday";
  return d.toLocaleDateString("en-PK", { day: "numeric", month: "short" });
}

function formatFullWhen(value?: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function formatMessageStamp(value?: string | null): string {
  if (!value) return "";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  const date = d.toLocaleDateString("en-PK", { day: "numeric", month: "short" });
  const time = d.toLocaleTimeString("en-PK", { hour: "numeric", minute: "2-digit" });
  return `${date} · ${time}`;
}

function contactLabel(name?: string | null): string {
  return name?.trim() || "Unknown contact";
}

function isRecentlyActive(value?: string | null): boolean {
  if (!value) return false;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return false;
  return Date.now() - d.getTime() < 24 * 60 * 60 * 1000;
}

function groupMessages(items: AdminInboxMessage[]): { label: string; items: AdminInboxMessage[] }[] {
  const groups: { label: string; items: AdminInboxMessage[] }[] = [];
  for (const item of items) {
    const stamp = item.received_at || item.timestamp;
    const d = stamp ? new Date(stamp) : null;
    const label =
      d && !Number.isNaN(d.getTime())
        ? d.toLocaleDateString("en-PK", { day: "numeric", month: "short", year: "numeric" })
        : "Unknown date";
    const last = groups[groups.length - 1];
    if (!last || last.label !== label) {
      groups.push({ label, items: [item] });
    } else {
      last.items.push(item);
    }
  }
  return groups;
}

export function AdminMessages({ initialWaId = null }: { initialWaId?: string | null }) {
  const [summary, setSummary] = useState<AdminInboxSummary | null>(null);
  const [contacts, setContacts] = useState<AdminInboxContact[]>([]);
  const [contactCount, setContactCount] = useState(0);
  const [contactPages, setContactPages] = useState(0);
  const [contactPage, setContactPage] = useState(1);
  const [contactQuery, setContactQuery] = useState("");
  const [debouncedContactQuery, setDebouncedContactQuery] = useState("");
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedWaId, setSelectedWaId] = useState<string | null>(null);
  const [threadName, setThreadName] = useState<string | null>(null);
  const [threadLastSeen, setThreadLastSeen] = useState<string | null>(null);
  const [threadCount, setThreadCount] = useState(0);
  const [messages, setMessages] = useState<AdminInboxMessage[]>([]);
  const [messageCount, setMessageCount] = useState(0);
  const [messagePages, setMessagePages] = useState(0);
  const [messagePage, setMessagePage] = useState(1);
  const [messageQuery, setMessageQuery] = useState("");
  const [debouncedMessageQuery, setDebouncedMessageQuery] = useState("");
  const [since, setSince] = useState("");
  const [until, setUntil] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [activeDetailMessage, setActiveDetailMessage] = useState<AdminInboxMessage | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (initialWaId) {
      setSelectedWaId(initialWaId);
      setMessagePage(1);
      setMessageQuery("");
      setDebouncedMessageQuery("");
      setSince("");
      setUntil("");
      setSort("newest");
    } else {
      setSelectedWaId(null);
    }
  }, [initialWaId]);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedContactQuery(contactQuery.trim()), 300);
    return () => window.clearTimeout(t);
  }, [contactQuery]);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedMessageQuery(messageQuery.trim()), 300);
    return () => window.clearTimeout(t);
  }, [messageQuery]);

  useEffect(() => {
    setContactPage(1);
  }, [debouncedContactQuery]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await adminInboxApi.summary();
        if (!cancelled) setSummary(data);
      } catch {
        /* summary is optional chrome; list errors surface below */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      setLoadingContacts(true);
      setError(null);
      try {
        const data = await adminInboxApi.contacts({
          q: debouncedContactQuery || undefined,
          page: contactPage,
          limit: CONTACT_PAGE_SIZE,
        });
        if (cancelled) return;
        setContacts(data.items || []);
        setContactCount(data.count || 0);
        setContactPages(data.pages || 0);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiClientError ? err.message : "Couldn't load contacts.");
          setContacts([]);
        }
      } finally {
        if (!cancelled) setLoadingContacts(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [debouncedContactQuery, contactPage]);

  useEffect(() => {
    if (!selectedWaId) return;
    let cancelled = false;
    (async () => {
      setLoadingMessages(true);
      setError(null);
      try {
        const data = await adminInboxApi.messages(selectedWaId, {
          q: debouncedMessageQuery || undefined,
          since: since || undefined,
          until: until || undefined,
          sort,
          page: messagePage,
          limit: MESSAGE_PAGE_SIZE,
        });
        if (cancelled) return;
        setThreadName(data.contact.profile_name);
        setThreadLastSeen(data.contact.last_seen);
        setThreadCount(data.contact.message_count);
        setMessages(data.items || []);
        setMessageCount(data.count || 0);
        setMessagePages(data.pages || 0);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiClientError ? err.message : "Couldn't load messages.");
          setMessages([]);
        }
      } finally {
        if (!cancelled) setLoadingMessages(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedWaId, debouncedMessageQuery, since, until, sort, messagePage]);

  const grouped = useMemo(() => groupMessages(messages), [messages]);

  function openContact(contact: AdminInboxContact) {
    setSelectedWaId(contact.wa_id);
    setThreadName(contact.profile_name);
    setThreadLastSeen(contact.last_seen);
    setThreadCount(contact.message_count);
    setMessageQuery("");
    setDebouncedMessageQuery("");
    setSince("");
    setUntil("");
    setSort("newest");
    setMessagePage(1);
    setMessages([]);
  }

  function backToContacts() {
    setSelectedWaId(null);
    setMessages([]);
    setError(null);
    setActiveDetailMessage(null);
  }


  const stats = [
    { label: "Contacts", value: summary?.total_contacts ?? "—" },
    { label: "Messages", value: summary?.total_messages ?? "—" },
    { label: `Active · ${summary?.recent_days ?? 7}d`, value: summary?.recent_contacts ?? "—" },
    { label: "Today", value: summary?.messages_today ?? "—" },
  ];

  return (
    <div className="w-full max-w-5xl mx-auto min-h-screen pb-12 bg-background-base">
      <header className="hidden md:flex bg-background-base w-full top-0 sticky z-40 items-center px-6 h-16">
        <div className="flex flex-col">
          <h1 className="text-[20px] font-bold text-primary">Messages & Contacts</h1>
          <p className="text-[12px] text-on-surface-variant/70 leading-none">
            Monitor WhatsApp conversations and contact activity.
          </p>
        </div>
      </header>

      <main className="px-6 pt-4 space-y-6">
        <section className="neumorphic-raised rounded-[20px] px-5 py-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-x-6 gap-y-4">
            {stats.map((stat, index) => (
              <div
                key={stat.label}
                className={index > 0 ? "md:border-l md:border-white/50 md:pl-6" : ""}
              >
                <p className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
                  {stat.label}
                </p>
                <p className="text-[22px] font-bold text-primary tabular-nums leading-tight mt-1">
                  {stat.value}
                </p>
              </div>
            ))}
          </div>
        </section>

        {error && (
          <div className="neumorphic-inset rounded-2xl p-4 flex items-start gap-3">
            <span className="material-symbols-outlined text-danger text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              error
            </span>
            <p className="text-[13px] text-danger font-medium">{error}</p>
          </div>
        )}

        {!selectedWaId ? (
          <section className="neumorphic-raised rounded-[20px] p-5 space-y-4">
            <div className="flex flex-col md:flex-row md:items-end gap-3">
              <label className="flex-1 flex flex-col gap-2">
                <span className="text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant">
                  Search contacts
                </span>
                <input
                  value={contactQuery}
                  onChange={(e) => setContactQuery(e.target.value)}
                  placeholder="Name or WhatsApp number"
                  className="h-12 px-4 rounded-xl neumorphic-inset border-none bg-[#F6F4F0] text-[15px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </label>
              <p className="text-[12px] text-on-surface-variant md:pb-3">
                {contactCount} {contactCount === 1 ? "contact" : "contacts"}
              </p>
            </div>

            {loadingContacts ? (
              <div className="flex items-center gap-3 py-10 justify-center text-on-surface-variant">
                <Spinner size="sm" color="blue" />
                <span className="text-[14px]">Loading contacts…</span>
              </div>
            ) : contacts.length === 0 ? (
              <p className="text-[14px] text-on-surface-variant py-10 text-center">
                {debouncedContactQuery
                  ? "No contacts match that search."
                  : "No WhatsApp contacts yet."}
              </p>
            ) : (
              <div className="overflow-x-auto -mx-1">
                <table className="w-full min-w-[640px] text-left">
                  <thead>
                    <tr className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant border-b border-white/50">
                      <th className="py-3 pr-3 font-semibold">Name</th>
                      <th className="py-3 pr-3 font-semibold">WhatsApp</th>
                      <th className="py-3 pr-3 font-semibold">Last seen</th>
                      <th className="py-3 pr-3 font-semibold text-right">Messages</th>
                    </tr>
                  </thead>
                  <tbody>
                    {contacts.map((contact) => (
                      <tr
                        key={contact.wa_id}
                        className="border-b border-white/40 last:border-0 hover:bg-white/35 cursor-pointer"
                        onClick={() => openContact(contact)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            openContact(contact);
                          }
                        }}
                        tabIndex={0}
                        role="button"
                      >
                        <td className="py-3.5 pr-3">
                          <div className="flex items-center gap-2.5">
                            <span
                              className={`h-2 w-2 rounded-full shrink-0 ${
                                isRecentlyActive(contact.last_seen) ? "bg-success" : "bg-outline/50"
                              }`}
                              aria-hidden
                            />
                            <div className="min-w-0">
                              <p className="text-[14px] font-semibold text-on-surface truncate">
                                {contactLabel(contact.profile_name)}
                              </p>
                              {contact.latest_text && (
                                <p className="text-[12px] text-on-surface-variant truncate max-w-[280px]">
                                  {contact.latest_text}
                                </p>
                              )}
                            </div>
                          </div>
                        </td>
                        <td className="py-3.5 pr-3 text-[13px] font-medium text-on-surface-variant whitespace-nowrap">
                          {formatWaNumber(contact.wa_id)}
                        </td>
                        <td className="py-3.5 pr-3 text-[13px] text-on-surface-variant whitespace-nowrap">
                          {formatLastSeen(contact.last_seen)}
                        </td>
                        <td className="py-3.5 text-[13px] font-semibold text-on-surface text-right tabular-nums">
                          {contact.message_count}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {contactPages > 1 && (
              <Pager
                page={contactPage}
                pages={contactPages}
                onChange={setContactPage}
              />
            )}
          </section>
        ) : (
          <section className="space-y-4">
            <button
              type="button"
              onClick={backToContacts}
              className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-secondary min-h-11"
            >
              <span className="material-symbols-outlined text-[18px]">arrow_back</span>
              Back to Contacts
            </button>

            <div className="neumorphic-raised rounded-[20px] p-5 space-y-1">
              <h2 className="text-[20px] font-bold text-primary">{contactLabel(threadName)}</h2>
              <p className="text-[14px] font-medium text-on-surface-variant">
                {formatWaNumber(selectedWaId)}
              </p>
              <p className="text-[13px] text-on-surface-variant">
                Last seen: {formatFullWhen(threadLastSeen)} · {threadCount}{" "}
                {threadCount === 1 ? "message" : "messages"}
              </p>
            </div>

            <div className="neumorphic-raised rounded-[20px] p-5 space-y-4">
              <div className="flex items-center justify-between gap-3">
                <h3 className="text-[16px] font-bold text-primary">Message history</h3>
                <span className="text-[12px] text-on-surface-variant">
                  {messageCount} matching
                </span>
              </div>

              <div className="grid md:grid-cols-4 gap-3">
                <label className="md:col-span-2 flex flex-col gap-2">
                  <span className="text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant">
                    Search messages
                  </span>
                  <input
                    value={messageQuery}
                    onChange={(e) => {
                      setMessageQuery(e.target.value);
                      setMessagePage(1);
                    }}
                    placeholder="Find text in this conversation"
                    className="h-12 px-4 rounded-xl neumorphic-inset border-none bg-[#F6F4F0] text-[15px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant">From</span>
                  <input
                    type="date"
                    value={since}
                    onChange={(e) => {
                      setSince(e.target.value);
                      setMessagePage(1);
                    }}
                    className="h-12 px-4 rounded-xl neumorphic-inset border-none bg-[#F6F4F0] text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </label>
                <label className="flex flex-col gap-2">
                  <span className="text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant">To</span>
                  <input
                    type="date"
                    value={until}
                    onChange={(e) => {
                      setUntil(e.target.value);
                      setMessagePage(1);
                    }}
                    className="h-12 px-4 rounded-xl neumorphic-inset border-none bg-[#F6F4F0] text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </label>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    setSort("newest");
                    setMessagePage(1);
                  }}
                  className={`h-9 px-3 rounded-lg text-[12px] font-semibold ${
                    sort === "newest" ? "bg-blue-600/10 text-blue-600" : "text-on-surface-variant"
                  }`}
                >
                  Newest
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setSort("oldest");
                    setMessagePage(1);
                  }}
                  className={`h-9 px-3 rounded-lg text-[12px] font-semibold ${
                    sort === "oldest" ? "bg-blue-600/10 text-blue-600" : "text-on-surface-variant"
                  }`}
                >
                  Oldest
                </button>
              </div>

              {loadingMessages ? (
                <div className="flex items-center gap-3 py-10 justify-center text-on-surface-variant">
                  <Spinner size="sm" color="blue" />
                  <span className="text-[14px]">Loading messages…</span>
                </div>
              ) : messages.length === 0 ? (
                <p className="text-[14px] text-on-surface-variant py-10 text-center">
                  {debouncedMessageQuery || since || until
                    ? "No messages match these filters."
                    : "No messages from this number."}
                </p>
              ) : (
                <div className="space-y-6">
                  {grouped.map((group) => (
                    <div key={group.label} className="space-y-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant">
                        {group.label}
                      </p>
                      <ol className="space-y-3">
                        {group.items.map((item) => (
                          <li
                            key={item.message_id}
                            className="neumorphic-inset rounded-2xl px-4.5 py-3.5 cursor-pointer hover:bg-white/40 transition-colors group relative"
                            onClick={() => setActiveDetailMessage(item)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter" || e.key === " ") {
                                e.preventDefault();
                                setActiveDetailMessage(item);
                              }
                            }}
                            tabIndex={0}
                            role="button"
                          >
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] font-semibold text-on-surface-variant">
                                  {formatMessageStamp(item.received_at || item.timestamp)}
                                </span>
                                {item.intent && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-blue-600/10 text-blue-700 uppercase tracking-wider">
                                    {item.intent}
                                  </span>
                                )}
                                {item.delivery_status && (
                                  <span className="text-[10px] font-medium text-on-surface-variant/70">
                                    • {item.delivery_status}
                                  </span>
                                )}
                              </div>
                              <span className="text-[11px] font-semibold text-blue-600 flex items-center gap-0.5 opacity-80 group-hover:opacity-100 group-hover:translate-x-0.5 transition-all">
                                Details
                                <span className="material-symbols-outlined text-[14px]">chevron_right</span>
                              </span>
                            </div>

                            <div className="space-y-2">
                              <p className="text-[14px] text-on-surface whitespace-pre-wrap break-words font-medium">
                                {item.text || "—"}
                              </p>

                              {item.bot_response ? (
                                <div className="mt-2.5 pt-2 border-t border-black/5 flex items-start gap-2 bg-blue-50/60 dark:bg-blue-950/20 p-2.5 rounded-xl border border-blue-100/80">
                                  <span className="material-symbols-outlined text-blue-600 text-[18px] shrink-0 mt-0.5">
                                    smart_toy
                                  </span>
                                  <div className="min-w-0 flex-1">
                                    <p className="text-[11px] font-bold text-blue-700 uppercase tracking-wider mb-0.5">
                                      Bot Response
                                    </p>
                                    <p className="text-[13px] text-on-surface/90 whitespace-pre-wrap break-words line-clamp-3">
                                      {item.bot_response}
                                    </p>
                                  </div>
                                </div>
                              ) : (
                                <div className="mt-1.5 text-[11px] text-on-surface-variant/60 italic flex items-center gap-1">
                                  <span className="material-symbols-outlined text-[13px]">info</span>
                                  Click to view message details
                                </div>
                              )}
                            </div>
                          </li>
                        ))}
                      </ol>
                    </div>
                  ))}
                </div>
              )}

              {messagePages > 1 && (
                <Pager page={messagePage} pages={messagePages} onChange={setMessagePage} />
              )}
            </div>
          </section>
        )}
      </main>

      {/* Message & Bot Response Inspection Modal */}
      {activeDetailMessage && (
        <div
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto"
          onClick={() => setActiveDetailMessage(null)}
        >
          <div
            className="bg-[#F4F2EE] rounded-[24px] shadow-2xl w-full max-w-2xl overflow-hidden neumorphic-raised border border-white/60 my-8"
            onClick={(e) => e.stopPropagation()}
          >
            <header className="px-6 py-4 bg-white/60 border-b border-black/5 flex items-center justify-between">
              <div>
                <h3 className="text-[18px] font-bold text-primary flex items-center gap-2">
                  <span className="material-symbols-outlined text-blue-600">forum</span>
                  Message Inspection
                </h3>
                <p className="text-[12px] text-on-surface-variant">
                  From {contactLabel(threadName)} ({formatWaNumber(selectedWaId || "")})
                </p>
              </div>
              <button
                type="button"
                onClick={() => setActiveDetailMessage(null)}
                className="h-9 w-9 rounded-full bg-black/5 hover:bg-black/10 flex items-center justify-center text-on-surface-variant transition-colors"
                aria-label="Close"
              >
                <span className="material-symbols-outlined text-[20px]">close</span>
              </button>
            </header>

            <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto">
              {/* Inbound User Message Card */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-bold uppercase tracking-wider text-on-surface-variant flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-emerald-600">person</span>
                    User Message (Inbound)
                  </span>
                  <span className="text-[12px] text-on-surface-variant">
                    {formatFullWhen(activeDetailMessage.received_at || activeDetailMessage.timestamp)}
                  </span>
                </div>
                <div className="neumorphic-inset rounded-2xl p-4 bg-[#EAE8E3]/80 border border-white/40">
                  <p className="text-[14px] text-on-surface font-medium whitespace-pre-wrap break-words select-text leading-relaxed">
                    {activeDetailMessage.text || "—"}
                  </p>
                </div>
              </div>

              {/* Bot Response Card */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-[12px] font-bold uppercase tracking-wider text-blue-700 flex items-center gap-1.5">
                    <span className="material-symbols-outlined text-[16px] text-blue-600">smart_toy</span>
                    Bot Response (Outbound)
                  </span>
                  {activeDetailMessage.bot_response && (
                    <button
                      type="button"
                      onClick={() => {
                        if (activeDetailMessage.bot_response) {
                          navigator.clipboard.writeText(activeDetailMessage.bot_response);
                          setCopied(true);
                          setTimeout(() => setCopied(false), 2000);
                        }
                      }}
                      className="text-[12px] font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1"
                    >
                      <span className="material-symbols-outlined text-[14px]">
                        {copied ? "check" : "content_copy"}
                      </span>
                      {copied ? "Copied!" : "Copy response"}
                    </button>
                  )}
                </div>
                <div className="rounded-2xl p-4 bg-blue-50/80 border border-blue-200/80 shadow-sm">
                  {activeDetailMessage.bot_response ? (
                    <p className="text-[14px] text-on-surface font-medium whitespace-pre-wrap break-words select-text leading-relaxed">
                      {activeDetailMessage.bot_response}
                    </p>
                  ) : (
                    <div className="text-[13px] text-on-surface-variant/70 italic py-2 flex items-center gap-2">
                      <span className="material-symbols-outlined text-amber-500 text-[18px]">warning</span>
                      No bot response recorded for this message.
                    </div>
                  )}
                </div>
              </div>

              {/* Relevant Metadata Grid */}
              <div className="neumorphic-inset rounded-2xl p-4 space-y-3 bg-[#EAE8E3]/40">
                <h4 className="text-[11px] font-bold uppercase tracking-wider text-on-surface-variant">
                  Technical Details & Debugging
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-[12px]">
                  <div>
                    <p className="text-on-surface-variant/70 font-medium">Intent Classification</p>
                    <p className="font-semibold text-primary">{activeDetailMessage.intent || "—"}</p>
                  </div>
                  <div>
                    <p className="text-on-surface-variant/70 font-medium">Action</p>
                    <p className="font-semibold text-primary">{activeDetailMessage.action || "—"}</p>
                  </div>
                  <div>
                    <p className="text-on-surface-variant/70 font-medium">Delivery Status</p>
                    <p className="font-semibold text-primary">{activeDetailMessage.delivery_status || "—"}</p>
                  </div>
                  <div>
                    <p className="text-on-surface-variant/70 font-medium">Message Type</p>
                    <p className="font-semibold text-primary">{activeDetailMessage.type || "text"}</p>
                  </div>
                  <div>
                    <p className="text-on-surface-variant/70 font-medium">Channel Source</p>
                    <p className="font-semibold text-primary">{activeDetailMessage.source_key || "whatsapp"}</p>
                  </div>
                  <div>
                    <p className="text-on-surface-variant/70 font-medium">Forwarded</p>
                    <p className="font-semibold text-primary">
                      {activeDetailMessage.is_forwarded
                        ? `Yes (${activeDetailMessage.forwarded_from || "unknown"})`
                        : "No"}
                    </p>
                  </div>
                </div>
                {activeDetailMessage.message_id && (
                  <div className="pt-2 border-t border-black/5 text-[11px] font-mono text-on-surface-variant/80 truncate">
                    ID: {activeDetailMessage.message_id}
                  </div>
                )}
              </div>
            </div>

            <footer className="px-6 py-3.5 bg-white/40 border-t border-black/5 flex items-center justify-end">
              <button
                type="button"
                onClick={() => setActiveDetailMessage(null)}
                className="h-10 px-5 rounded-xl text-[13px] font-bold bg-blue-600 text-white shadow hover:bg-blue-700 transition-colors"
              >
                Close
              </button>
            </footer>
          </div>
        </div>
      )}
    </div>
  );
}


function Pager({
  page,
  pages,
  onChange,
}: {
  page: number;
  pages: number;
  onChange: (page: number) => void;
}) {
  return (
    <div className="flex items-center justify-between pt-2">
      <button
        type="button"
        disabled={page <= 1}
        onClick={() => onChange(page - 1)}
        className="h-10 px-3 rounded-xl text-[13px] font-semibold text-secondary disabled:opacity-40"
      >
        Previous
      </button>
      <span className="text-[12px] text-on-surface-variant">
        Page {page} of {pages}
      </span>
      <button
        type="button"
        disabled={page >= pages}
        onClick={() => onChange(page + 1)}
        className="h-10 px-3 rounded-xl text-[13px] font-semibold text-secondary disabled:opacity-40"
      >
        Next
      </button>
    </div>
  );
}
