import axios from 'axios';
import type { CrossrefResponse } from '../../../types/shared';

export interface Citation {
  title: string;
  authors: string[];
  journal: string;
  year: number;
  doi: string;
  url: string;
}

function mapCrossrefToCitation(item: CrossrefResponse['message']['items'][0]): Citation {
  return {
    title: item.title[0],
    authors: item.author.map(a => `${a.given} ${a.family}`),
    journal: item['container-title'][0],
    year: item.published['date-parts'][0][0],
    doi: item.DOI,
    url: item.URL
  };
}

export async function searchCitations(query: string): Promise<Citation[]> {
  try {
    const response = await axios.get<CrossrefResponse>(`https://api.crossref.org/works?query=${encodeURIComponent(query)}`);
    return response.data.message.items.map(mapCrossrefToCitation);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Citation search failed: ${error.message}`);
    }
    throw new Error('Citation search failed with unknown error');
  }
} 