export interface Citation {
  ref: number;
  id: string;
  title: string;
  authors: string[];
  year: number | null;
  source: string;
  type: string;
  url: string;
}

export interface Sentence {
  text: string;
  citations: Citation[];
}

export interface Section {
  heading: string;
  sentences: Sentence[];
}

export interface AIResponse {
  sections: Section[];
  status: string;
}

export interface Message {
  role: "user" | "assistant";
  content: string | AIResponse;
  timestamp?: string;
}