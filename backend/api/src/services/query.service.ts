import axios from "axios";
import { ENV } from "../config/env.js";

/**
 * Call Python AI service for disease extraction
 */
const extractDiseaseWithLLM = async (query: string): Promise<string | null> => {
  try {
    const res = await axios.post(`${ENV.AI_SERVICE_URL}/extract-disease`, {
      query,
    });

    return res.data.disease || null;
  } catch (error) {
    console.error("LLM disease extraction failed:", error);
    return null;
  }
};

export const expandQuery = async (query: string): Promise<string[]> => {
  try {
    const res = await axios.post(`${ENV.AI_SERVICE_URL}/expand-query`, { query });
    return res.data.queries;  // ["query1", "query2", "query3"]
  } catch {
    return [query];  // fallback
  }
};

let diseases:string[]=[];

const quickDetectDisease = (query: string): string | null => {
  const words = query.toLowerCase();
  for (const disease of diseases) {
  if (words.includes(disease.toLowerCase())) return disease;
}
  return null;
};


export const detectDisease = async (
  query: string,
  context: { disease?: string }
): Promise<string | null> => {
  // 1️⃣ Try fast detection
  const quick = quickDetectDisease(query);
  if (quick) return quick;

  // 2️⃣ Fallback to LLM
  const llmDisease = await extractDiseaseWithLLM(query);
  if (llmDisease) {
    diseases.push(llmDisease);
    return llmDisease;

   }

  // 3️⃣ Fallback to existing context
  return null;
};

/**
 * Build final query
 */
const STOPWORDS = new Set([
  "tell", "me", "about", "what", "is", "are", "the", "of", "for", "in",
  "a", "an", "how", "does", "do", "and", "or", "to", "with", "can",
  "could", "would", "should", "its", "their", "which", "that", "give",
  "explain", "describe", "show", "list", "find", "get", "please", "i",
  "want", "know", "information", "details", "regarding", "related",
  "latest", "research", "studies", "papers", "on", "by", "at",
]);

const cleanQuery = (query: string): string => {
  return query
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")        // remove special chars except hyphen
    .split(/\s+/)
    .filter(word => word.length > 1 && !STOPWORDS.has(word))
    .join(" ")
    .trim();
};

export const buildFinalQuery = (
  userQuery: string,
  context: { disease?: string },
  newDisease: string | null
): string => {

  const cleanedQuery = userQuery;
  // cleanQuery(userQuery);
 
  // If new disease detected in this query, don't append context disease
  if (newDisease) {
    return cleanedQuery;
  }

  // No context disease at all — return cleaned query as is
  if (!context.disease) {
    return cleanedQuery;
  }

  const cleanedDisease = context.disease.toLowerCase().trim();

  // Context disease already present in cleaned query — no need to append
  if (cleanedQuery.includes(cleanedDisease)) {
    return cleanedQuery;
  }

  // Append context disease for continuity
  return `${cleanedQuery} ${cleanedDisease}`.trim();
};


