import { fetchPubmed } from "./sources/pubmed.service.js";
import { fetchOpenAlex } from "./sources/openalex.service.js";
import { fetchTrials } from "./sources/clinicalTrials.service.js";
import { fetchWithRetry } from "../utils/fetchWithRetry.js";

const QUERY_DELAY_MS = 300;  // stagger requests by 300ms to avoid rate limits

const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

// fetchAllData.ts
export const fetchAllData = async (queries: string[], disease: string) => {
  const paperResults: any[] = [];

  try {
    // Papers — PubMed only (OpenAlex disabled due to irrelevant results)
    for (let i = 0; i < queries.length; i++) {
      const query = queries[i];
      if (i > 0) await delay(400);

      const pubmed = await fetchWithRetry(() => fetchPubmed(query));
      // console.log(`[PubMed] "${query}" → ${pubmed.length} papers`);
      // pubmed.forEach((p: any) => console.log(`  - ${p.title?.slice(0, 70)}`));

      paperResults.push(...pubmed);
    }

    // Trials — still active, fetch once using disease
    // console.log(`[Trials] fetching for disease: "${disease || queries[0]}"`);
    const trials = await fetchWithRetry(() =>
      fetchTrials(disease || queries[0])
    );
    console.log(`[Trials] returned ${trials.length} trials`);
    trials.forEach((t: any) => console.log(`  - ${t.title?.slice(0, 70)}`));

    // Deduplicate by id
    const seen = new Set<string>();
    return [...paperResults, ...trials].filter(item => {
      if (seen.has(item.id)) return false;
      seen.add(item.id);
      return true;
    });

  } catch (error) {
    console.error("Retrieval Error:", error);
    return [];
  }
};