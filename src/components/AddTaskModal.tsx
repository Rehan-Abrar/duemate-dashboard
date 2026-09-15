import { useEffect, useId, useRef, useState } from "react";
import { tasksApi } from "../api";
import { RoundSpinner } from "./ui/spinner";

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function AddTaskModal({ isOpen, onClose, onSuccess }: AddTaskModalProps) {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const dialogRef = useRef<HTMLDialogElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);
  const titleId = useId();
  const descId = useId();
  const errorId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      restoreFocusRef.current = document.activeElement as HTMLElement | null;
      if (!dialog.open) dialog.showModal();
      requestAnimationFrame(() => textareaRef.current?.focus());
    } else if (dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const onClickBackdrop = (event: MouseEvent) => {
      if (event.target === dialog) onClose();
    };

    dialog.addEventListener("click", onClickBackdrop);
    return () => dialog.removeEventListener("click", onClickBackdrop);
  }, [onClose]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim() || loading) return;

    setLoading(true);
    setError(null);

    try {
      await tasksApi.extract(message.trim());
      setMessage("");
      onSuccess();
      onClose();
    } catch (err: any) {
      console.error("Extraction failed", err);
      setError(
        err.message ||
          "Failed to extract task details. Please ensure the message contains assignment or quiz details and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <dialog
      ref={dialogRef}
      className="duemate-dialog"
      aria-labelledby={titleId}
      aria-describedby={descId}
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClose={() => {
        restoreFocusRef.current?.focus?.();
      }}
    >
      <div
        className="w-full max-w-lg bg-background-base rounded-[28px] border border-white/60 p-6 md:p-8 space-y-6 shadow-[10px_10px_20px_#c3cbd6,-10px_-10px_20px_#ffffff]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center gap-3">
          <div className="flex items-center gap-2 min-w-0">
            <span className="material-symbols-outlined text-blue-600 text-2xl" aria-hidden="true">
              auto_awesome
            </span>
            <h2 id={titleId} className="text-xl font-bold text-slate-900">
              Add Task via AI
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="min-w-11 min-h-11 rounded-full neumorphic-raised flex items-center justify-center text-slate-500 hover:text-slate-900 active:scale-90 transition-transform"
            aria-label="Close add task dialog"
          >
            <span className="material-symbols-outlined text-lg" aria-hidden="true">
              close
            </span>
          </button>
        </div>

        <p id={descId} className="text-xs font-semibold text-slate-500 uppercase tracking-widest leading-relaxed">
          Paste the announcement or message exactly as you received it (e.g. from WhatsApp, LMS, or email).
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="neumorphic-inset p-0.5 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-600/30 transition-all">
            <label htmlFor="add-task-message" className="sr-only">
              Task announcement
            </label>
            <textarea
              id="add-task-message"
              ref={textareaRef}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={loading}
              placeholder="Example: 'Aga Khan announced CN Assignment 3 due next Monday at 11:59 PM...'"
              className="w-full h-36 bg-transparent border-none focus:ring-0 text-sm font-medium p-4 placeholder:text-slate-400 text-slate-800 resize-none outline-none"
              required
              aria-invalid={error ? true : undefined}
              aria-describedby={error ? errorId : undefined}
            />
          </div>

          {error && (
            <div id={errorId} role="alert" className="p-3.5 rounded-xl bg-rose-50 border border-rose-200/50 flex items-start gap-2.5">
              <span className="material-symbols-outlined text-rose-500 text-[18px]" aria-hidden="true">
                error
              </span>
              <p className="text-xs font-bold text-rose-700 leading-relaxed">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 min-h-11 py-3.5 neumorphic-raised text-xs font-bold text-slate-600 uppercase tracking-wider rounded-xl hover:bg-slate-100/50 transition-all active:scale-95 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="flex-1 min-h-11 py-3.5 bg-secondary text-white shadow-[4px_4px_10px_rgba(49,107,243,0.3)] text-xs font-bold uppercase tracking-wider rounded-xl hover:brightness-110 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RoundSpinner size="xs" color="white" />
                  <span>Extracting...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm" aria-hidden="true">
                    auto_awesome
                  </span>
                  <span>Extract Task</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </dialog>
  );
}
