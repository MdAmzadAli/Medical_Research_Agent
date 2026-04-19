import axios from "axios";

export const fetchOpenAlex = async (query: string) => {
  try {
     console.log(`[OpenAlex] search="${query}"`);
    const res = await axios.get("https://api.openalex.org/works", {
      params: {
           search: query,
  filter: [
    "type:article",
    "publication_year:>2010",
    "cited_by_count:<5000"  // ← exclude mega-cited guidelines/GBD papers
  ].join(","),
  sort: "relevance_score:desc",
  per_page: 5,
      },
    });

    return res.data.results.map((item: any) => ({
      id: item.id,
      title: item.title,
      abstract: item.abstract_inverted_index
        ? Object.keys(item.abstract_inverted_index).join(" ")
        : "",
      authors: item.authorships?.map((a: any) => a.author.display_name),
      year: item.publication_year,
      source: "openalex",
      type: "paper",
      url: item.id,
    }));
  } catch (error) {
    console.error("OpenAlex Error:", error);
    return [];
  }
};