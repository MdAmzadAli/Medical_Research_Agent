import axios from "axios";
import { XMLParser } from "fast-xml-parser"; // npm install fast-xml-parser

const parser = new XMLParser({
  ignoreAttributes: false,
  attributeNamePrefix: "@_",
  isArray: (name) =>
    ["Author", "AbstractText", "PubmedArticle"].includes(name),
});

// ---- Helpers ----

const parseAbstract = (abstractNode: any): string => {
  if (!abstractNode) return "";

  const texts = abstractNode.AbstractText;
  if (!texts) return "";

  // AbstractText can be array (structured abstract) or plain string
  if (Array.isArray(texts)) {
    return texts
      .map((t: any) => {
        // structured abstract has Label attribute: OBJECTIVE, METHODS etc.
        const label = t["@_Label"];
        const text = typeof t === "string" ? t : t["#text"] ?? t;
        return label ? `${label}: ${text}` : String(text);
      })
      .filter(Boolean)
      .join(" ");
  }

  // plain string abstract
  return typeof texts === "string" ? texts : texts["#text"] ?? "";
};

const parseAuthors = (authorListNode: any): string[] => {
  if (!authorListNode?.Author) return [];

  const authors = Array.isArray(authorListNode.Author)
    ? authorListNode.Author
    : [authorListNode.Author];

  return authors
    .map((a: any) => {
      const last = a.LastName ?? "";
      const fore = a.ForeName ?? a.Initials ?? "";
      return `${fore} ${last}`.trim();
    })
    .filter(Boolean);
};

const parseYear = (pubDateNode: any): number | null => {
  if (!pubDateNode) return null;

  // Structured: <Year>2023</Year>
  if (pubDateNode.Year) return parseInt(pubDateNode.Year, 10);

  // String form: <MedlineDate>2023 Jan-Feb</MedlineDate>
  if (pubDateNode.MedlineDate) {
    const match = String(pubDateNode.MedlineDate).match(/\d{4}/);
    return match ? parseInt(match[0], 10) : null;
  }

  return null;
};

// ---- Main fetch function ----

export const fetchPubmed = async (query: string, retmax = 5) => {
  try {
    // Step 1: Search — get PMIDs
      const searchTerm = `${query}[Title/Abstract]`;
      console.log(`[PubMed] term="${searchTerm}"`);

    const searchRes = await axios.get(
      "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi",
      {
        params: {
  db: "pubmed",
  term: `${query}[Title/Abstract]`,
  retmax: 8,
  sort: "relevance",
  retmode: "json",
  api_key: process.env.PUBMED_API_KEY, 
        },
        timeout: 10000,
      }
    );

    const ids: string[] = searchRes.data.esearchresult.idlist;
    if (!ids.length) return [];

    // Step 2: Fetch full XML records for all IDs in one call
    const fetchRes = await axios.get(
      "https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi",
      {
        params: {
          db: "pubmed",
          id: ids.join(","),
          retmode: "xml",
          rettype: "abstract",
        },
        // timeout: 10000,
      }
    );

    // Step 3: Parse XML
    const parsed = parser.parse(fetchRes.data);
    const articles =
      parsed?.PubmedArticleSet?.PubmedArticle ?? [];

    return articles.map((entry: any) => {
      const citation = entry.MedlineCitation;
      const article = citation?.Article;
      const pmid = String(citation?.PMID?.["#text"] ?? citation?.PMID ?? "");

      const abstract = parseAbstract(article?.Abstract);
      const authors = parseAuthors(article?.AuthorList);
      const year = parseYear(
        article?.Journal?.JournalIssue?.PubDate ?? citation?.DateCompleted
      );
      const title = article?.ArticleTitle?.["#text"] ?? article?.ArticleTitle ?? "";

      return {
        id: pmid,
        title: String(title).replace(/\.$/, "").trim(),
        abstract: abstract.trim(),
        authors,
        year,
        source: "pubmed",
        type: "paper",
        url: `https://pubmed.ncbi.nlm.nih.gov/${pmid}/`,
      };
    });
  } catch (error) {
    console.error("PubMed Error:", error);
    return [];
  }
};