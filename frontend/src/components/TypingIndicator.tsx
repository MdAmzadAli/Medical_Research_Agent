export const TypingIndicator = () => (
  <div className="flex items-start gap-3 px-4 py-2">
    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
      M
    </div>
    <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm">
      <div className="flex items-center gap-1.5">
        <span className="text-xs text-slate-400 mr-1">Researching</span>
        {[0, 1, 2].map((i) => (
          <span
            key={i}
            className="w-2 h-2 bg-violet-400 rounded-full animate-bounce"
            style={{ animationDelay: `${i * 0.15}s` }}
          />
        ))}
      </div>
    </div>
  </div>
);