import { useState, useRef, type KeyboardEvent } from "react";

interface Props {
  onSend: (query: string) => void;
  loading: boolean;
}

export const InputBar = ({ onSend, loading }: Props) => {
  const [value, setValue] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  const handleSend = () => {
    if (!value.trim() || loading) return;
    onSend(value.trim());
    setValue("");
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
    }
  };

  const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleInput = () => {
    const el = textareaRef.current;
    if (!el) return;
    el.style.height = "auto";
    el.style.height = `${Math.min(el.scrollHeight, 160)}px`;
  };

  return (
    <div className="border-t border-slate-200 bg-white/80 backdrop-blur-md px-4 py-4">
      <div className="max-w-3xl mx-auto">
        <div className={`flex items-end gap-3 bg-white border rounded-2xl px-4 py-3 shadow-lg transition-all duration-200 ${
          loading ? "border-violet-300" : "border-slate-200 hover:border-violet-300 focus-within:border-violet-400 focus-within:shadow-violet-100"
        }`}>
          {/* Textarea */}
          <textarea
            ref={textareaRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            onKeyDown={handleKeyDown}
            onInput={handleInput}
            placeholder="Ask about any medical condition, symptoms, treatments..."
            disabled={loading}
            rows={1}
            className="flex-1 resize-none outline-none text-sm text-slate-700 placeholder-slate-400 bg-transparent max-h-40 leading-relaxed disabled:opacity-50"
          />

          {/* Send button */}
          <button
            onClick={handleSend}
            disabled={!value.trim() || loading}
            className={`shrink-0 w-9 h-9 rounded-xl flex items-center justify-center transition-all duration-200 ${
              value.trim() && !loading
                ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            {loading ? (
              <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : (
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M12 5l7 7-7 7" />
              </svg>
            )}
          </button>
        </div>
        <p className="text-center text-[10px] text-slate-400 mt-2">
          Press Enter to send · Shift+Enter for new line
        </p>
      </div>
    </div>
  );
};