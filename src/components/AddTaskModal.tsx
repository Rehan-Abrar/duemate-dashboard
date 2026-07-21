import { useState } from "react";
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

  if (!isOpen) return null;

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
        "Failed to extract task details. Please ensure the message contains assignment or quiz details and try again."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/40 backdrop-blur-sm animate-fade-in">
      <div 
        className="w-full max-w-lg bg-background-base rounded-[28px] border border-white/60 p-6 md:p-8 space-y-6 shadow-[10px_10px_20px_#c3cbd6,-10px_-10px_20px_#ffffff]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-600 text-2xl">auto_awesome</span>
            <h2 className="text-xl font-bold text-slate-900">Add Task via AI</h2>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full neumorphic-raised flex items-center justify-center text-slate-500 hover:text-slate-900 active:scale-90 transition-transform"
            aria-label="Close modal"
          >
            <span className="material-symbols-outlined text-lg">close</span>
          </button>
        </div>

        <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest leading-relaxed">
          Paste the announcement or message exactly as you received it (e.g. from WhatsApp, LMS, or email).
        </p>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="neumorphic-inset p-0.5 rounded-2xl overflow-hidden focus-within:ring-2 focus-within:ring-blue-600/30 transition-all">
            <textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              disabled={loading}
              placeholder="Example: 'Aga Khan announced CN Assignment 3 due next Monday at 11:59 PM...'"
              className="w-full h-36 bg-transparent border-none focus:ring-0 text-sm font-medium p-4 placeholder:text-slate-400 text-slate-800 resize-none outline-none"
              required
            />
          </div>

          {error && (
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200/50 flex items-start gap-2.5">
              <span className="material-symbols-outlined text-rose-500 text-[18px]">error</span>
              <p className="text-xs font-bold text-rose-700 leading-relaxed">{error}</p>
            </div>
          )}

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 py-3.5 neumorphic-raised text-xs font-bold text-slate-600 uppercase tracking-wider rounded-xl hover:bg-slate-100/50 transition-all active:scale-95 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || !message.trim()}
              className="flex-1 py-3.5 bg-secondary text-white shadow-[4px_4px_10px_rgba(49,107,243,0.3)] text-xs font-bold uppercase tracking-wider rounded-xl hover:brightness-110 transition-all active:scale-95 flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? (
                <>
                  <RoundSpinner size="xs" color="white" />
                  <span>Extracting...</span>
                </>
              ) : (
                <>
                  <span className="material-symbols-outlined text-sm">auto_awesome</span>
                  <span>Extract Task</span>
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
