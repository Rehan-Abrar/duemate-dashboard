import { useEffect, useMemo, useRef, useState } from "react";
import { adminTimetableApi, ApiClientError } from "../../api";
import type {
  AdminTimetableReviewResponse,
  AdminTimetableUploadResponse,
  AdminTimetableVersion,
} from "../../types";
import { Spinner } from "../../components/ui/spinner";

const UNIVERSITIES = [{ id: "riphah", label: "Riphah International University" }];
const TERM_PRESETS = ["Fall 2026", "Spring 2027", "Summer 2027"];

function formatWhen(value?: string | null): string {
  if (!value) return "—";
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return value;
  return d.toLocaleString("en-PK", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function isCurrentPublished(item: AdminTimetableVersion): boolean {
  return item.status === "published" && !item.effective_to;
}

export function AdminTimetable() {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [universityId, setUniversityId] = useState("riphah");
  const [academicTerm, setAcademicTerm] = useState("Fall 2026");
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [rollingBack, setRollingBack] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [draft, setDraft] = useState<AdminTimetableUploadResponse | null>(null);
  const [review, setReview] = useState<AdminTimetableReviewResponse | null>(null);
  const [versions, setVersions] = useState<AdminTimetableVersion[]>([]);
  const [loadingVersions, setLoadingVersions] = useState(true);

  async function loadVersions() {
    setLoadingVersions(true);
    try {
      const res = await adminTimetableApi.versions();
      setVersions(res.items || []);
    } catch (err) {
      setError(err instanceof ApiClientError ? err.message : "Couldn't load timetable versions.");
    } finally {
      setLoadingVersions(false);
    }
  }

  useEffect(() => {
    loadVersions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const current = useMemo(
    () => versions.find(isCurrentPublished) || null,
    [versions]
  );

  function handleError(err: unknown, fallback: string) {
    setNotice(null);
    setError(err instanceof ApiClientError ? err.message : fallback);
  }

  async function handleUpload() {
    if (!file || !academicTerm.trim()) return;
    setUploading(true);
    setError(null);
    setNotice(null);
    try {
      const uploaded = await adminTimetableApi.upload(file, universityId, academicTerm.trim());
      setDraft(uploaded);
      const reviewed = await adminTimetableApi.review(uploaded.version_id);
      setReview(reviewed);
      setNotice(`Draft v${uploaded.version} created. Review the sections, then publish.`);
      await loadVersions();
    } catch (err) {
      handleError(err, "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handlePublish() {
    if (!draft) return;
    setPublishing(true);
    setError(null);
    try {
      const published = await adminTimetableApi.publish(draft.version_id);
      setNotice(`Published version ${published.version}. Students on matching sections will use it automatically.`);
      setDraft(null);
      setReview(null);
      setFile(null);
      await loadVersions();
    } catch (err) {
      handleError(err, "Publish failed.");
    } finally {
      setPublishing(false);
    }
  }

  async function handleRollback(versionId: string) {
    setRollingBack(versionId);
    setError(null);
    try {
      const result = await adminTimetableApi.rollback(versionId);
      setNotice(`Rolled back to version ${result.version}.`);
      setDraft(null);
      setReview(null);
      await loadVersions();
    } catch (err) {
      handleError(err, "Rollback failed.");
    } finally {
      setRollingBack(null);
    }
  }

  const diff = review?.diff || draft?.diff;
  const sections = review?.detected_sections || draft?.detected_sections || [];

  return (
    <div className="w-full max-w-5xl mx-auto min-h-screen pb-12 bg-background-base">
      <header className="hidden md:flex bg-background-base w-full top-0 sticky z-40 items-center px-6 h-16">
        <div className="flex flex-col">
          <h1 className="text-[20px] font-bold text-primary">Timetable Management</h1>
          <p className="text-[12px] text-on-surface-variant/70 leading-none">Official university timetable</p>
        </div>
      </header>

      <main className="px-6 pt-4 space-y-6">
        {error && (
          <div className="neumorphic-inset rounded-2xl p-4 flex items-start gap-3">
            <span className="material-symbols-outlined text-danger text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>error</span>
            <p className="text-[13px] text-danger font-medium">{error}</p>
          </div>
        )}
        {notice && (
          <div className="neumorphic-inset rounded-2xl p-4 flex items-start gap-3">
            <span className="material-symbols-outlined text-success text-[20px]" style={{ fontVariationSettings: "'FILL' 1" }}>check_circle</span>
            <p className="text-[13px] text-on-surface font-medium">{notice}</p>
          </div>
        )}

        {/* Current published */}
        <section className="neumorphic-raised rounded-[20px] p-5 space-y-3">
          <h2 className="text-[16px] font-bold text-primary">Current published</h2>
          {loadingVersions && !current ? (
            <p className="text-[14px] text-on-surface-variant">Loading…</p>
          ) : current ? (
            <div className="space-y-2">
              <div className="flex flex-wrap gap-2">
                <span className="text-[12px] font-semibold uppercase tracking-wider bg-highlight-soft text-secondary px-3 py-1 rounded-full">
                  v{current.version}
                </span>
                <span className="text-[12px] font-semibold uppercase tracking-wider bg-highlight-soft text-secondary px-3 py-1 rounded-full">
                  {current.academic_term}
                </span>
              </div>
              <p className="text-[14px] text-on-surface-variant">
                Effective {formatWhen(current.effective_from)} · {current.detected_sections?.length || 0} sections
              </p>
              <p className="text-[13px] text-on-surface font-medium">
                {(current.detected_sections || []).join(", ") || "No sections"}
              </p>
            </div>
          ) : (
            <p className="text-[14px] text-on-surface-variant">No official timetable is published yet.</p>
          )}
        </section>

        {/* Upload */}
        <section className="neumorphic-raised rounded-[20px] p-5 space-y-4">
          <h2 className="text-[16px] font-bold text-primary">Upload new timetable</h2>
          <p className="text-[13px] text-on-surface-variant">
            Upload creates a draft. Students only see it after you publish.
          </p>

          <div className="grid md:grid-cols-2 gap-4">
            <label className="flex flex-col gap-2">
              <span className="text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant">University</span>
              <select
                value={universityId}
                onChange={(e) => setUniversityId(e.target.value)}
                className="h-12 px-4 rounded-xl neumorphic-inset border-none bg-[#F6F4F0] text-[15px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                {UNIVERSITIES.map((u) => (
                  <option key={u.id} value={u.id}>{u.label}</option>
                ))}
              </select>
            </label>
            <label className="flex flex-col gap-2">
              <span className="text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant">Academic term</span>
              <input
                list="admin-terms"
                value={academicTerm}
                onChange={(e) => setAcademicTerm(e.target.value)}
                placeholder="Fall 2026"
                className="h-12 px-4 rounded-xl neumorphic-inset border-none bg-[#F6F4F0] text-[15px] font-medium focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
              <datalist id="admin-terms">
                {TERM_PRESETS.map((t) => (
                  <option key={t} value={t} />
                ))}
              </datalist>
            </label>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="w-full min-h-24 rounded-2xl neumorphic-inset border-2 border-dashed border-outline/30 flex flex-col items-center justify-center gap-1 py-6"
          >
            <span className="material-symbols-outlined text-secondary text-[32px]">upload_file</span>
            <span className="text-[14px] font-semibold text-on-surface">
              {file ? file.name : "Choose PDF"}
            </span>
            {file && (
              <span className="text-[12px] text-on-surface-variant">{(file.size / 1024).toFixed(0)} KB</span>
            )}
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="sr-only"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />

          <button
            type="button"
            disabled={!file || !academicTerm.trim() || uploading}
            onClick={handleUpload}
            className="w-full h-12 bg-secondary text-white rounded-xl font-bold text-[16px] flex items-center justify-center gap-2 disabled:opacity-40"
          >
            {uploading ? (
              <>
                <Spinner size="sm" color="white" />
                Parsing…
              </>
            ) : (
              "Upload as draft"
            )}
          </button>
        </section>

        {/* Draft review */}
        {draft && (
          <section className="neumorphic-raised rounded-[20px] p-5 space-y-4">
            <div className="flex items-center justify-between gap-3">
              <h2 className="text-[16px] font-bold text-primary">Draft review · v{draft.version}</h2>
              <span className="text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant">
                Not live
              </span>
            </div>

            <div>
              <p className="text-[12px] font-semibold uppercase tracking-wider text-on-surface-variant mb-2">
                Detected sections ({sections.length})
              </p>
              <div className="flex flex-wrap gap-2">
                {sections.map((s) => (
                  <span key={s} className="px-3 py-1 rounded-full bg-highlight-soft text-secondary text-[13px] font-semibold">
                    {s}
                    {review?.slot_counts?.[s] != null ? ` · ${review.slot_counts[s]} slots` : ""}
                  </span>
                ))}
              </div>
            </div>

            {diff && (
              <div className="grid grid-cols-3 gap-3">
                <div className="neumorphic-inset rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-primary">{diff.counts?.changed ?? 0}</p>
                  <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">Changed</p>
                </div>
                <div className="neumorphic-inset rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-success">{diff.counts?.added ?? 0}</p>
                  <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">Added</p>
                </div>
                <div className="neumorphic-inset rounded-xl p-3 text-center">
                  <p className="text-lg font-bold text-danger">{diff.counts?.removed ?? 0}</p>
                  <p className="text-[10px] uppercase tracking-wider text-on-surface-variant font-semibold">Removed</p>
                </div>
              </div>
            )}

            {diff && (diff.added.length > 0 || diff.removed.length > 0) && (
              <div className="text-[13px] text-on-surface-variant space-y-1">
                {diff.added.length > 0 && <p>New: {diff.added.join(", ")}</p>}
                {diff.removed.length > 0 && <p>Removed: {diff.removed.join(", ")}</p>}
              </div>
            )}

            <button
              type="button"
              disabled={publishing || sections.length === 0}
              onClick={handlePublish}
              className="w-full h-12 bg-secondary text-white rounded-xl font-bold text-[16px] flex items-center justify-center gap-2 disabled:opacity-40"
            >
              {publishing ? (
                <>
                  <Spinner size="sm" color="white" />
                  Publishing…
                </>
              ) : (
                `Publish version ${draft.version}`
              )}
            </button>
          </section>
        )}

        {/* Version history */}
        <section className="neumorphic-raised rounded-[20px] p-5 space-y-4">
          <h2 className="text-[16px] font-bold text-primary">Versions</h2>
          {loadingVersions ? (
            <p className="text-[14px] text-on-surface-variant">Loading versions…</p>
          ) : versions.length === 0 ? (
            <p className="text-[14px] text-on-surface-variant">No uploads yet.</p>
          ) : (
            <ul className="space-y-3">
              {versions.map((item) => {
                const live = isCurrentPublished(item);
                return (
                  <li key={item.version_id} className="neumorphic-inset rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-[15px] font-bold text-primary">
                        v{item.version} · {item.academic_term}
                      </p>
                      <p className="text-[12px] text-on-surface-variant">
                        {item.status}{live ? " · live" : ""} · uploaded {formatWhen(item.uploaded_at)}
                      </p>
                      <p className="text-[12px] text-on-surface-variant truncate">
                        {(item.detected_sections || []).join(", ")}
                      </p>
                    </div>
                    {item.status === "published" && !live && (
                      <button
                        type="button"
                        disabled={rollingBack === item.version_id}
                        onClick={() => handleRollback(item.version_id)}
                        className="shrink-0 h-10 px-4 rounded-xl neumorphic-button-secondary text-secondary text-[13px] font-bold"
                      >
                        {rollingBack === item.version_id ? "Rolling back…" : "Rollback"}
                      </button>
                    )}
                    {live && (
                      <span className="text-[11px] font-bold uppercase tracking-wider text-success">Current</span>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}
