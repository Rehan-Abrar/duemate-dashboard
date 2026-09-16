import { useEffect, useState } from "react";
import { adminAiApi, ApiClientError } from "../../api";
import type { AdminAiCallDetail, AdminAiCallRow, AdminAiSummary } from "../../types";
import { Spinner } from "../../components/ui/spinner";

const PAGE_SIZE = 20;

function todayInputValue(): string {
  const d = new Date();
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

function dash(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

function displayName(name?: string | null, userId?: string | null): string {
  if (name?.trim()) return name.trim();
  return userId || "Unknown";
}

function formatTime(value?: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleTimeString("en-PK", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function formatExact(value?: string | null): string {
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

function formatLatency(ms?: number | null): string {
  if (ms === null || ms === undefined || Number.isNaN(ms)) return "—";
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)}s`;
  return `${Math.round(ms)}ms`;
}

function formatCount(value?: number | null): string {
  if (value === null || value === undefined) return "—";
  return value.toLocaleString("en-PK");
}

function shortModel(model?: string | null): string {
  if (!model) return "—";
  const slug = model.split("/").pop() || model;
  if (slug.includes("gpt-oss")) return "GPT-OSS";
  return slug;
}

function stageLabel(stage?: string | null): string {
  if (stage === "nlu") return "NLU";
  if (stage === "response") return "Response";
  if (stage === "task") return "Task";
  if (stage === "intent") return "Intent";
  return dash(stage);
}

function intentLabel(row: Pick<AdminAiCallRow, "intent" | "action" | "query_type">): string {
  if (row.intent === "task_action" && row.action) return `${row.intent} · ${row.action}`;
  if (row.intent === "schedule_query" && row.query_type) return `${row.intent} · ${row.query_type}`;
  return dash(row.intent);
}

const SELECT_CLASS =
  "h-11 px-4 rounded-xl neumorphic-inset border-none bg-[#F6F4F0] text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-600";

export function AdminAiMonitor({
  onViewMessages,
}: {
  onViewMessages?: (waId: string) => void;
}) {
  const [summary, setSummary] = useState<AdminAiSummary | null>(null);
  const [items, setItems] = useState<AdminAiCallRow[]>([]);
  const [count, setCount] = useState(0);
  const [pages, setPages] = useState(0);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [since, setSince] = useState(todayInputValue);
  const [until, setUntil] = useState(todayInputValue);
  const [user, setUser] = useState("");
  const [provider, setProvider] = useState("");
  const [model, setModel] = useState("");
  const [stage, setStage] = useState("");
  const [success, setSuccess] = useState("");
  const [intent, setIntent] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminAiCallDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const filters = {
    q: debouncedQuery || undefined,
    user: user.trim() || undefined,
    provider: provider || undefined,
    model: model.trim() || undefined,
    stage: stage || undefined,
    success: success || undefined,
    intent: intent.trim() || undefined,
    since: since || undefined,
    until: until || undefined,
  };

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => window.clearTimeout(t);
  }, [query]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, since, until, user, provider, model, stage, success, intent]);

  useEffect(() => {
    if (selectedId) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await adminAiApi.summary(filters);
        if (!cancelled) setSummary(data);
      } catch {
        /* list errors surface below */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedId, debouncedQuery, since, until, user, provider, model, stage, success, intent]);

  useEffect(() => {
    if (selectedId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await adminAiApi.list({
          ...filters,
          page,
          limit: PAGE_SIZE,
        });
        if (cancelled) return;
        setItems(data.items || []);
        setCount(data.count || 0);
        setPages(data.pages || 0);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiClientError ? err.message : "Couldn't load AI requests.");
          setItems([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedId, debouncedQuery, since, until, user, provider, model, stage, success, intent, page]);

  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    (async () => {
      setLoadingDetail(true);
      setError(null);
      try {
        const data = await adminAiApi.detail(selectedId);
        if (!cancelled) setDetail(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiClientError ? err.message : "Couldn't load this request.");
          setDetail(null);
        }
      } finally {
        if (!cancelled) setLoadingDetail(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedId]);

  const stats = [
    { label: "Requests", value: formatCount(summary?.requests) },
    { label: "Successful", value: formatCount(summary?.successful) },
    { label: "Failed", value: formatCount(summary?.failed) },
    { label: "Avg latency", value: formatLatency(summary?.avg_latency_ms) },
    { label: "Fallbacks", value: formatCount(summary?.fallbacks) },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto min-h-screen pb-12 bg-background-base">
      <header className="hidden md:flex bg-background-base w-full top-0 sticky z-40 items-center px-6 h-16">
        <div className="flex flex-col">
          <h1 className="text-[20px] font-bold text-primary">AI Monitor</h1>
          <p className="text-[12px] text-on-surface-variant/70 leading-none">
            LLM requests, fallbacks, and per-call debugging.
          </p>
        </div>
      </header>

      <main className="px-6 pt-4 space-y-6">
        {!selectedId && (
          <>
            <section className="neumorphic-raised rounded-[20px] px-5 py-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant mb-3">
                {since && until && since === until ? `Today · ${since}` : "Selected range"}
              </p>
              <div className="grid grid-cols-2 md:grid-cols-5 gap-x-6 gap-y-4">
                {stats.map((stat, index) => (
                  <div key={stat.label} className={index > 0 ? "md:border-l md:border-white/50 md:pl-6" : ""}>
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

            <section className="neumorphic-raised rounded-[20px] p-5 space-y-3">
              <h2 className="text-[16px] font-bold text-primary">Providers / Models</h2>
              {!summary ? (
                <p className="text-[14px] text-on-surface-variant">Loading providers…</p>
              ) : (summary.providers || []).length === 0 ? (
                <p className="text-[14px] text-on-surface-variant">No AI requests in this range.</p>
              ) : (
                <ul className="space-y-2">
                  {summary.providers.map((row) => (
                    <li
                      key={`${row.label}-${row.model}-${row.credential_slot}`}
                      className="flex items-baseline justify-between gap-4 py-1.5 border-b border-white/40 last:border-0"
                    >
                      <div>
                        <p className="text-[14px] font-semibold text-on-surface">{row.label}</p>
                        <p className="text-[12px] font-mono text-on-surface-variant">{dash(row.model)}</p>
                      </div>
                      <p className="text-[15px] font-bold text-primary tabular-nums">{formatCount(row.count)}</p>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}

        {error && (
          <div className="neumorphic-inset rounded-2xl p-4 flex items-start gap-3">
            <span className="material-symbols-outlined text-danger text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>
              error
            </span>
            <p className="text-[13px] text-danger font-medium">{error}</p>
          </div>
        )}

        {!selectedId ? (
          <section className="neumorphic-raised rounded-[20px] p-5 space-y-4">
            <h2 className="text-[16px] font-bold text-primary">Recent requests</h2>
            <div className="grid md:grid-cols-4 gap-3">
              <label className="md:col-span-2 flex flex-col gap-2">
                <span className="text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant">Search</span>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Name, user ID, model, or intent"
                  className={SELECT_CLASS}
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant">From</span>
                <input type="date" value={since} onChange={(e) => setSince(e.target.value)} className={SELECT_CLASS} />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant">To</span>
                <input type="date" value={until} onChange={(e) => setUntil(e.target.value)} className={SELECT_CLASS} />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant">User</span>
                <input
                  value={user}
                  onChange={(e) => setUser(e.target.value)}
                  placeholder="wa:923…"
                  className={SELECT_CLASS}
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant">Provider</span>
                <select value={provider} onChange={(e) => setProvider(e.target.value)} className={SELECT_CLASS}>
                  <option value="">All providers</option>
                  <option value="groq">Groq</option>
                  <option value="gemini">Gemini</option>
                </select>
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant">Model</span>
                <input
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  placeholder="openai/gpt-oss-20b"
                  className={SELECT_CLASS}
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant">Stage</span>
                <select value={stage} onChange={(e) => setStage(e.target.value)} className={SELECT_CLASS}>
                  <option value="">All stages</option>
                  <option value="nlu">NLU</option>
                  <option value="response">Response</option>
                  <option value="task">Task</option>
                  <option value="intent">Intent</option>
                </select>
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant">Status</span>
                <select value={success} onChange={(e) => setSuccess(e.target.value)} className={SELECT_CLASS}>
                  <option value="">All</option>
                  <option value="true">Successful</option>
                  <option value="false">Failed</option>
                </select>
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant">Intent</span>
                <input
                  value={intent}
                  onChange={(e) => setIntent(e.target.value)}
                  placeholder="task_action"
                  className={SELECT_CLASS}
                />
              </label>
            </div>

            <p className="text-[12px] text-on-surface-variant">{count} {count === 1 ? "request" : "requests"}</p>

            {loading ? (
              <div className="flex items-center gap-3 py-10 justify-center text-on-surface-variant">
                <Spinner size="sm" color="blue" />
                <span className="text-[14px]">Loading AI requests…</span>
              </div>
            ) : items.length === 0 ? (
              <p className="text-[14px] text-on-surface-variant py-10 text-center">
                {debouncedQuery || user || provider || model || stage || success || intent
                  ? "No AI requests match these filters."
                  : "No AI requests logged for this range."}
              </p>
            ) : (
              <div className="overflow-x-auto -mx-1">
                <table className="w-full min-w-[920px] text-left">
                  <thead>
                    <tr className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant border-b border-white/50">
                      <th className="py-3 pr-3 font-semibold">Time</th>
                      <th className="py-3 pr-3 font-semibold">User</th>
                      <th className="py-3 pr-3 font-semibold">Stage</th>
                      <th className="py-3 pr-3 font-semibold">Intent</th>
                      <th className="py-3 pr-3 font-semibold">Model</th>
                      <th className="py-3 pr-3 font-semibold">Status</th>
                      <th className="py-3 font-semibold text-right">Latency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((row) => (
                      <tr
                        key={row.call_id}
                        className="border-b border-white/40 last:border-0 hover:bg-white/35 cursor-pointer"
                        onClick={() => setSelectedId(row.call_id)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setSelectedId(row.call_id);
                          }
                        }}
                        tabIndex={0}
                        role="button"
                      >
                        <td className="py-3.5 pr-3 text-[13px] font-medium text-on-surface whitespace-nowrap">
                          {formatTime(row.created_at)}
                        </td>
                        <td className="py-3.5 pr-3">
                          <p className="text-[14px] font-semibold text-on-surface">
                            {displayName(row.profile_name, row.user_id)}
                          </p>
                          {row.used_fallback ? (
                            <p className="text-[11px] text-on-surface-variant">{row.provider_label}</p>
                          ) : null}
                        </td>
                        <td className="py-3.5 pr-3 text-[13px] text-on-surface-variant whitespace-nowrap">
                          {stageLabel(row.stage)}
                        </td>
                        <td className="py-3.5 pr-3 text-[13px] text-on-surface-variant">
                          {intentLabel(row)}
                        </td>
                        <td className="py-3.5 pr-3 text-[13px] font-semibold text-on-surface whitespace-nowrap">
                          {shortModel(row.model)}
                        </td>
                        <td className="py-3.5 pr-3 text-[13px] font-semibold whitespace-nowrap">
                          <span className={row.success ? "text-success" : "text-danger"}>
                            {row.success ? "OK" : "Failed"}
                          </span>
                        </td>
                        <td className="py-3.5 text-[13px] font-semibold text-right tabular-nums">
                          {formatLatency(row.latency_ms)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {pages > 1 && <Pager page={page} pages={pages} onChange={setPage} />}
          </section>
        ) : (
          <CallDetail
            detail={detail}
            loading={loadingDetail}
            onBack={() => {
              setSelectedId(null);
              setDetail(null);
            }}
            onViewMessages={onViewMessages}
            onOpenRelated={setSelectedId}
          />
        )}
      </main>
    </div>
  );
}

function CallDetail({
  detail,
  loading,
  onBack,
  onViewMessages,
  onOpenRelated,
}: {
  detail: AdminAiCallDetail | null;
  loading: boolean;
  onBack: () => void;
  onViewMessages?: (waId: string) => void;
  onOpenRelated: (callId: string) => void;
}) {
  if (loading || !detail) {
    return (
      <section className="neumorphic-raised rounded-[20px] p-8 flex items-center justify-center gap-3 text-on-surface-variant">
        <Spinner size="sm" color="blue" />
        <span className="text-[14px]">Loading request…</span>
      </section>
    );
  }

  return (
    <section className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-secondary min-h-11"
      >
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Back to AI Monitor
      </button>

      <div className="neumorphic-raised rounded-[20px] p-5 space-y-3">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
          <div>
            <h2 className="text-[20px] font-bold text-primary">
              {displayName(detail.profile_name, detail.user_id)}
            </h2>
            <p className="text-[12px] font-mono text-on-surface-variant mt-1">{dash(detail.user_id)}</p>
            <p className="text-[12px] text-on-surface-variant">{formatExact(detail.created_at)}</p>
          </div>
          {detail.wa_id && onViewMessages && (
            <button
              type="button"
              onClick={() => onViewMessages(detail.wa_id as string)}
              className="h-11 px-4 rounded-xl bg-secondary text-white text-[13px] font-bold"
            >
              View Messages
            </button>
          )}
        </div>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="neumorphic-raised rounded-[20px] p-5 space-y-2">
          <h3 className="text-[16px] font-bold text-primary">Routing</h3>
          <InfoRow label="Stage" value={stageLabel(detail.stage)} />
          <InfoRow label="Intent" value={dash(detail.intent)} />
          <InfoRow label="Action" value={dash(detail.action)} />
          <InfoRow label="Query type" value={dash(detail.query_type)} />
          <InfoRow label="Channel" value={dash(detail.channel)} />
          <InfoRow label="Caller" value={dash(detail.caller)} />
        </div>
        <div className="neumorphic-raised rounded-[20px] p-5 space-y-2">
          <h3 className="text-[16px] font-bold text-primary">Provider</h3>
          <InfoRow label="Provider" value={detail.provider_label} />
          <InfoRow label="Model" value={dash(detail.model)} />
          <InfoRow label="Credential" value={dash(detail.credential_slot)} />
          <InfoRow label="Fallback" value={detail.used_fallback ? "Yes" : "No"} />
          <InfoRow label="Fallback attempts" value={String(detail.fallback_attempts ?? 0)} />
          <InfoRow label="Fallback reason" value={dash(detail.fallback_reason)} />
          <InfoRow label="Error type" value={dash(detail.error_type)} />
          <InfoRow label="Parse method" value={dash(detail.parse_method)} />
        </div>
      </div>

      <div className="neumorphic-raised rounded-[20px] p-5 space-y-2">
        <h3 className="text-[16px] font-bold text-primary">Result</h3>
        <InfoRow label="Status" value={detail.success ? "Success" : "Failed"} />
        <InfoRow label="Latency" value={formatLatency(detail.latency_ms)} />
        <InfoRow label="Tokens" value={`${detail.input_tokens} in · ${detail.output_tokens} out · ${detail.total_tokens} total`} />
        <InfoRow label="Confidence" value={detail.confidence == null ? "—" : String(detail.confidence)} />
        <InfoRow label="Prompt" value={dash(detail.prompt_version)} />
        <InfoRow label="Message length" value={String(detail.user_message_len)} />
        {detail.error ? <InfoRow label="Error" value={detail.error} /> : null}
      </div>

      {detail.related.length > 0 && (
        <div className="neumorphic-raised rounded-[20px] p-5 space-y-3">
          <h3 className="text-[16px] font-bold text-primary">Same request</h3>
          <ul className="space-y-2">
            {detail.related.map((row) => (
              <li key={row.call_id}>
                <button
                  type="button"
                  onClick={() => onOpenRelated(row.call_id)}
                  className="w-full text-left neumorphic-inset rounded-xl px-4 py-3"
                >
                  <p className="text-[14px] font-semibold text-on-surface">
                    {stageLabel(row.stage)} · {row.provider_label} · {row.success ? "OK" : "Failed"}
                  </p>
                  <p className="text-[12px] text-on-surface-variant">
                    {dash(row.model)} · {formatLatency(row.latency_ms)}
                  </p>
                </button>
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 border-b border-white/40 last:border-0">
      <span className="text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant">{label}</span>
      <span className="text-[13px] text-on-surface text-right break-all">{value}</span>
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
