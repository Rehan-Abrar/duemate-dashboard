import { useEffect, useState } from "react";
import { adminUsersApi, ApiClientError } from "../../api";
import type { AdminUserDetail, AdminUserRow, AdminUsersSummary } from "../../types";
import { Spinner } from "../../components/ui/spinner";

const PAGE_SIZE = 20;

function formatWaNumber(waId?: string | null): string {
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

function formatRelative(value?: string | null): string {
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

function dash(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  return String(value);
}

function displayName(name?: string | null): string {
  return name?.trim() || "Unknown";
}

function sourceLabel(source?: string | null): string {
  if (source === "official") return "Official";
  if (source === "self_upload") return "Self-upload";
  if (source === "none") return "None";
  return "—";
}

function settingValue(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "boolean") return value ? "Yes" : "No";
  if (typeof value === "object") return JSON.stringify(value);
  return String(value);
}

export function AdminUsers({
  onViewMessages,
}: {
  onViewMessages?: (waId: string) => void;
}) {
  const [summary, setSummary] = useState<AdminUsersSummary | null>(null);
  const [items, setItems] = useState<AdminUserRow[]>([]);
  const [count, setCount] = useState(0);
  const [pages, setPages] = useState(0);
  const [page, setPage] = useState(1);
  const [query, setQuery] = useState("");
  const [debouncedQuery, setDebouncedQuery] = useState("");
  const [university, setUniversity] = useState("");
  const [program, setProgram] = useState("");
  const [semester, setSemester] = useState("");
  const [section, setSection] = useState("");
  const [source, setSource] = useState("");
  const [sort, setSort] = useState("last_seen");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [detail, setDetail] = useState<AdminUserDetail | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  useEffect(() => {
    const t = window.setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => window.clearTimeout(t);
  }, [query]);

  useEffect(() => {
    setPage(1);
  }, [debouncedQuery, university, program, semester, section, source, sort]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const data = await adminUsersApi.summary();
        if (!cancelled) setSummary(data);
      } catch {
        /* list errors surface below */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  useEffect(() => {
    if (selectedId) return;
    let cancelled = false;
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await adminUsersApi.list({
          q: debouncedQuery || undefined,
          university: university || undefined,
          program: program || undefined,
          semester: semester || undefined,
          section: section || undefined,
          timetable_source: source || undefined,
          sort,
          page,
          limit: PAGE_SIZE,
        });
        if (cancelled) return;
        setItems(data.items || []);
        setCount(data.count || 0);
        setPages(data.pages || 0);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiClientError ? err.message : "Couldn't load users.");
          setItems([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedId, debouncedQuery, university, program, semester, section, source, sort, page]);

  useEffect(() => {
    if (!selectedId) return;
    let cancelled = false;
    (async () => {
      setLoadingDetail(true);
      setError(null);
      try {
        const data = await adminUsersApi.detail(selectedId);
        if (!cancelled) setDetail(data);
      } catch (err) {
        if (!cancelled) {
          setError(err instanceof ApiClientError ? err.message : "Couldn't load this user.");
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
    { label: "Users", value: summary?.total_users ?? "—" },
    { label: `Active · ${summary?.recent_days ?? 7}d`, value: summary?.active_users ?? "—" },
    { label: "Official TT", value: summary?.official_timetable ?? "—" },
    { label: "Self-upload", value: summary?.self_uploaded_timetable ?? "—" },
    { label: "No timetable", value: summary?.no_timetable ?? "—" },
  ];

  return (
    <div className="w-full max-w-6xl mx-auto min-h-screen pb-12 bg-background-base">
      <header className="hidden md:flex bg-background-base w-full top-0 sticky z-40 items-center px-6 h-16">
        <div className="flex flex-col">
          <h1 className="text-[20px] font-bold text-primary">Users</h1>
          <p className="text-[12px] text-on-surface-variant/70 leading-none">
            Student accounts, academic identity, and activity.
          </p>
        </div>
      </header>

      <main className="px-6 pt-4 space-y-6">
        <section className="neumorphic-raised rounded-[20px] px-5 py-4">
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
            <div className="grid md:grid-cols-4 gap-3">
              <label className="md:col-span-2 flex flex-col gap-2">
                <span className="text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant">Search</span>
                <input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Name, phone, or user ID"
                  className="h-11 px-4 rounded-xl neumorphic-inset border-none bg-[#F6F4F0] text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant">University</span>
                <input
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  placeholder="riphah"
                  className="h-11 px-4 rounded-xl neumorphic-inset border-none bg-[#F6F4F0] text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant">Program</span>
                <input
                  value={program}
                  onChange={(e) => setProgram(e.target.value)}
                  placeholder="BSCS"
                  className="h-11 px-4 rounded-xl neumorphic-inset border-none bg-[#F6F4F0] text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant">Semester</span>
                <input
                  value={semester}
                  onChange={(e) => setSemester(e.target.value)}
                  placeholder="7"
                  className="h-11 px-4 rounded-xl neumorphic-inset border-none bg-[#F6F4F0] text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant">Section</span>
                <input
                  value={section}
                  onChange={(e) => setSection(e.target.value)}
                  placeholder="BSCS-7B"
                  className="h-11 px-4 rounded-xl neumorphic-inset border-none bg-[#F6F4F0] text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant">Timetable</span>
                <select
                  value={source}
                  onChange={(e) => setSource(e.target.value)}
                  className="h-11 px-4 rounded-xl neumorphic-inset border-none bg-[#F6F4F0] text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="">All sources</option>
                  <option value="official">Official</option>
                  <option value="self_upload">Self-upload</option>
                  <option value="none">None</option>
                </select>
              </label>
              <label className="flex flex-col gap-2">
                <span className="text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant">Sort</span>
                <select
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                  className="h-11 px-4 rounded-xl neumorphic-inset border-none bg-[#F6F4F0] text-[14px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
                >
                  <option value="last_seen">Last seen</option>
                  <option value="newest">Newest</option>
                  <option value="oldest">Oldest</option>
                </select>
              </label>
            </div>

            <p className="text-[12px] text-on-surface-variant">{count} {count === 1 ? "user" : "users"}</p>

            {loading ? (
              <div className="flex items-center gap-3 py-10 justify-center text-on-surface-variant">
                <Spinner size="sm" color="blue" />
                <span className="text-[14px]">Loading users…</span>
              </div>
            ) : items.length === 0 ? (
              <p className="text-[14px] text-on-surface-variant py-10 text-center">
                {debouncedQuery || university || program || semester || section || source
                  ? "No users match these filters."
                  : "No student users yet."}
              </p>
            ) : (
              <div className="overflow-x-auto -mx-1">
                <table className="w-full min-w-[920px] text-left">
                  <thead>
                    <tr className="text-[11px] font-semibold uppercase tracking-wider text-on-surface-variant border-b border-white/50">
                      <th className="py-3 pr-3 font-semibold">Name</th>
                      <th className="py-3 pr-3 font-semibold">Phone</th>
                      <th className="py-3 pr-3 font-semibold">Section</th>
                      <th className="py-3 pr-3 font-semibold">Timetable</th>
                      <th className="py-3 pr-3 font-semibold">Last seen</th>
                      <th className="py-3 pr-3 font-semibold text-right">Msgs</th>
                      <th className="py-3 font-semibold text-right">Tasks</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map((user) => (
                      <tr
                        key={user.user_id}
                        className="border-b border-white/40 last:border-0 hover:bg-white/35 cursor-pointer"
                        onClick={() => setSelectedId(user.user_id)}
                        onKeyDown={(event) => {
                          if (event.key === "Enter" || event.key === " ") {
                            event.preventDefault();
                            setSelectedId(user.user_id);
                          }
                        }}
                        tabIndex={0}
                        role="button"
                      >
                        <td className="py-3.5 pr-3">
                          <p className="text-[14px] font-semibold text-on-surface">{displayName(user.profile_name)}</p>
                          <p className="text-[11px] text-on-surface-variant font-mono">{user.user_id}</p>
                        </td>
                        <td className="py-3.5 pr-3 text-[13px] font-medium text-on-surface-variant whitespace-nowrap">
                          {formatWaNumber(user.phone_number || user.wa_id)}
                        </td>
                        <td className="py-3.5 pr-3 text-[13px] text-on-surface-variant whitespace-nowrap">
                          {dash(user.section)}
                          {user.program || user.semester != null ? (
                            <span className="block text-[11px]">
                              {[user.program, user.semester].filter((v) => v !== null && v !== undefined && v !== "").join(" · ")}
                            </span>
                          ) : null}
                        </td>
                        <td className="py-3.5 pr-3 text-[13px] font-semibold text-on-surface whitespace-nowrap">
                          {sourceLabel(user.timetable_source)}
                        </td>
                        <td className="py-3.5 pr-3 text-[13px] text-on-surface-variant whitespace-nowrap">
                          <span className="block">{formatRelative(user.last_seen)}</span>
                          <span className="block text-[11px]">{formatExact(user.last_seen)}</span>
                        </td>
                        <td className="py-3.5 pr-3 text-[13px] font-semibold text-right tabular-nums">{user.message_count}</td>
                        <td className="py-3.5 text-[13px] font-semibold text-right tabular-nums">{user.task_count}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {pages > 1 && <Pager page={page} pages={pages} onChange={setPage} />}
          </section>
        ) : (
          <UserDetail
            detail={detail}
            loading={loadingDetail}
            onBack={() => {
              setSelectedId(null);
              setDetail(null);
            }}
            onViewMessages={onViewMessages}
          />
        )}
      </main>
    </div>
  );
}

function UserDetail({
  detail,
  loading,
  onBack,
  onViewMessages,
}: {
  detail: AdminUserDetail | null;
  loading: boolean;
  onBack: () => void;
  onViewMessages?: (waId: string) => void;
}) {
  if (loading || !detail) {
    return (
      <section className="neumorphic-raised rounded-[20px] p-8 flex items-center justify-center gap-3 text-on-surface-variant">
        <Spinner size="sm" color="blue" />
        <span className="text-[14px]">Loading user…</span>
      </section>
    );
  }

  const settingRows = Object.entries(detail.settings || {});
  const waId = detail.contact.wa_id || detail.wa_id || detail.phone_number;

  return (
    <section className="space-y-4">
      <button
        type="button"
        onClick={onBack}
        className="inline-flex items-center gap-1.5 text-[13px] font-semibold text-secondary min-h-11"
      >
        <span className="material-symbols-outlined text-[18px]">arrow_back</span>
        Back to Users
      </button>

      <div className="neumorphic-raised rounded-[20px] p-5 space-y-3">
        <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
          <div>
            <h2 className="text-[20px] font-bold text-primary">{displayName(detail.profile_name)}</h2>
            <p className="text-[14px] font-medium text-on-surface-variant">{formatWaNumber(detail.phone_number)}</p>
            <p className="text-[12px] font-mono text-on-surface-variant mt-1">{detail.user_id}</p>
          </div>
          {waId && onViewMessages && (
            <button
              type="button"
              onClick={() => onViewMessages(waId)}
              className="h-11 px-4 rounded-xl bg-secondary text-white text-[13px] font-bold"
            >
              View Messages
            </button>
          )}
        </div>
        <p className="text-[13px] text-on-surface-variant">
          WhatsApp contact: {detail.contact.linked ? displayName(detail.contact.profile_name) : "No matching contact"}
          {detail.contact.wa_id ? ` · ${formatWaNumber(detail.contact.wa_id)}` : ""}
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-4">
        <div className="neumorphic-raised rounded-[20px] p-5 space-y-2">
          <h3 className="text-[16px] font-bold text-primary">Academic</h3>
          <InfoRow label="University" value={dash(detail.university)} />
          <InfoRow label="Program" value={dash(detail.program)} />
          <InfoRow label="Semester" value={dash(detail.semester)} />
          <InfoRow label="Section" value={dash(detail.section)} />
          <InfoRow label="Academic term" value={dash(detail.academic_term)} />
          <InfoRow label="Timetable" value={sourceLabel(detail.timetable_source)} />
          <InfoRow
            label="Resolved source"
            value={
              detail.timetable.has_timetable
                ? `${sourceLabel(detail.timetable.source)}${detail.timetable.version != null ? ` · v${detail.timetable.version}` : ""}`
                : "—"
            }
          />
        </div>
        <div className="neumorphic-raised rounded-[20px] p-5 space-y-2">
          <h3 className="text-[16px] font-bold text-primary">Activity</h3>
          <InfoRow label="Created" value={formatExact(detail.created_at)} />
          <InfoRow label="Last seen" value={`${formatRelative(detail.last_seen)} · ${formatExact(detail.last_seen)}`} />
          <InfoRow label="Updated" value={formatExact(detail.updated_at)} />
          <InfoRow label="Messages" value={String(detail.message_count)} />
          <InfoRow label="Tasks" value={String(detail.task_count)} />
        </div>
      </div>

      <div className="neumorphic-raised rounded-[20px] p-5 space-y-3">
        <h3 className="text-[16px] font-bold text-primary">Settings</h3>
        {settingRows.length === 0 ? (
          <p className="text-[14px] text-on-surface-variant">No non-sensitive settings stored.</p>
        ) : (
          <dl className="grid md:grid-cols-2 gap-x-6 gap-y-2">
            {settingRows.map(([key, value]) => (
              <div key={key} className="flex justify-between gap-3 border-b border-white/40 py-2">
                <dt className="text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant">{key}</dt>
                <dd className="text-[13px] text-on-surface text-right break-all">{settingValue(value)}</dd>
              </div>
            ))}
          </dl>
        )}
      </div>

      <div className="neumorphic-raised rounded-[20px] p-5 space-y-3">
        <h3 className="text-[16px] font-bold text-primary">Recent tasks</h3>
        {detail.recent_tasks.length === 0 ? (
          <p className="text-[14px] text-on-surface-variant">No tasks saved for this user.</p>
        ) : (
          <ul className="space-y-2">
            {detail.recent_tasks.map((task) => (
              <li key={task.id} className="neumorphic-inset rounded-xl px-4 py-3">
                <p className="text-[14px] font-semibold text-on-surface">{task.title || "Untitled task"}</p>
                <p className="text-[12px] text-on-surface-variant">
                  {[task.course, task.task_type, task.status, task.due_date ? formatExact(task.due_date) : null]
                    .filter(Boolean)
                    .join(" · ")}
                </p>
              </li>
            ))}
          </ul>
        )}
      </div>
    </section>
  );
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 border-b border-white/40 last:border-0">
      <span className="text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant">{label}</span>
      <span className="text-[13px] text-on-surface text-right">{value}</span>
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
