import type { Citation } from "../types/chat";

interface Props {
  citation: Citation | null;
  onClose: () => void;
}

export const ReferenceModal = ({ citation, onClose }: Props) => {
  if (!citation) return null;

  return (
    <div
      className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-6 animate-in fade-in zoom-in duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <span className="bg-violet-100 text-violet-700 text-xs font-bold px-2 py-1 rounded-full">
              [{citation.ref}]
            </span>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              citation.type === "trial"
                ? "bg-emerald-100 text-emerald-700"
                : "bg-blue-100 text-blue-700"
            }`}>
              {citation.type === "trial" ? "Clinical Trial" : "Research Paper"}
            </span>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 transition-colors text-xl leading-none"
          >
            ×
          </button>
        </div>

        {/* Title */}
        <h3 className="font-semibold text-slate-800 text-sm leading-snug mb-3">
          {citation.title}
        </h3>

        {/* Meta */}
        <div className="space-y-2 text-xs text-slate-500">
          {citation.authors?.length > 0 && (
            <p>
              <span className="font-medium text-slate-600">Authors: </span>
              {citation.authors.slice(0, 4).join(", ")}
              {citation.authors.length > 4 && " et al."}
            </p>
          )}
          {citation.year && (
            <p>
              <span className="font-medium text-slate-600">Year: </span>
              {citation.year}
            </p>
          )}
          <p>
            <span className="font-medium text-slate-600">Source: </span>
            {citation.source.charAt(0).toUpperCase() + citation.source.slice(1)}
          </p>
        </div>

        {/* Link */}
        {citation.url && citation.url !== "undefined" && (
          
          <a  href={citation.url}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 flex items-center gap-2 text-xs text-violet-600 hover:text-violet-800 font-medium transition-colors"
          >
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
            </svg>
            View Source
          </a>
        )}
      </div>
    </div>
  );
};