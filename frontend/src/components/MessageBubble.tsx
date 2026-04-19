import { useState } from "react";
import type { Message, Citation, AIResponse, Section } from "../types/chat";
import { ReferenceModal } from "./ReferenceModal";

const SECTION_COLORS: Record<string, string> = {
  Overview: "border-violet-200 bg-violet-50/50",
  "Key Insights": "border-indigo-200 bg-indigo-50/50",
  "Clinical Relevance": "border-emerald-200 bg-emerald-50/50",
  Limitations: "border-amber-200 bg-amber-50/50",
};

const SECTION_HEADING_COLORS: Record<string, string> = {
  Overview: "text-violet-700",
  "Key Insights": "text-indigo-700",
  "Clinical Relevance": "text-emerald-700",
  Limitations: "text-amber-700",
};

interface Props {
  message: Message;
}

export const MessageBubble = ({ message }: Props) => {
  const [activeCitation, setActiveCitation] = useState<Citation | null>(null);

  if (message.role === "user") {
    return (
      <div className="flex justify-end px-4 py-2">
        <div className="max-w-[75%] bg-gradient-to-br from-violet-600 to-indigo-600 text-white rounded-2xl rounded-tr-none px-4 py-3 shadow-md">
          <p className="text-sm leading-relaxed">{message.content as string}</p>
        </div>
      </div>
    );
  }

  // Assistant message
  const response = message.content as AIResponse;

  if (!response?.sections) {
    return (
      <div className="flex items-start gap-3 px-4 py-2">
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0">
          M
        </div>
        <div className="bg-white border border-slate-200 rounded-2xl rounded-tl-none px-4 py-3 shadow-sm max-w-[80%]">
          <p className="text-sm text-slate-600">
            {typeof message.content === "string" ? message.content : "Unable to display response."}
          </p>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="flex items-start gap-3 px-4 py-2">
        {/* Avatar */}
        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-white text-xs font-bold shrink-0 mt-1">
          M
        </div>

        {/* Content */}
        <div className="max-w-[80%] space-y-3">
          {response.sections.map((section: Section, si: number) => (
            <div
              key={si}
              className={`rounded-xl border px-4 py-3 ${SECTION_COLORS[section.heading] || "border-slate-200 bg-white"}`}
            >
              {/* Section heading */}
              <h4 className={`text-xs font-bold uppercase tracking-wider mb-2 ${SECTION_HEADING_COLORS[section.heading] || "text-slate-600"}`}>
                {section.heading}
              </h4>

              {/* Sentences */}
              <div className="space-y-1.5">
                {section.sentences.map((sentence, sni: number) => (
                  <p key={sni} className="text-sm text-slate-700 leading-relaxed">
                    {sentence.text}
                    {/* Citation badges */}
                    {sentence.citations?.map((citation, ci: number) => (
                      <button
                        key={ci}
                        onClick={() => setActiveCitation(citation)}
                        className="inline-flex items-center ml-1 bg-violet-100 hover:bg-violet-200 text-violet-700 text-[10px] font-bold px-1.5 py-0.5 rounded-full transition-colors cursor-pointer align-middle"
                        title={citation.title}
                      >
                        {citation.ref}
                      </button>
                    ))}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reference Modal */}
      <ReferenceModal
        citation={activeCitation}
        onClose={() => setActiveCitation(null)}
      />
    </>
  );
};