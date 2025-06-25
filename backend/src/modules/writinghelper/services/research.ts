import axios from 'axios';
import { Citation, PlagiarismResult } from '../types';
import { PrismaClient } from '@prisma/client';
import { EquationsService } from './equations';
import { FiguresService } from './figures';
import { PlagiarismService } from './plagiarism';

const prisma = new PrismaClient();
const equationsService = new EquationsService();
const figuresService = new FiguresService();
const plagiarismService = new PlagiarismService();

// API endpoints for different sources
const API_ENDPOINTS = {
  crossref: 'https://api.crossref.org/works',
  arxiv: 'http://export.arxiv.org/api/query',
  pubmed: 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi'
};

export class ResearchService {
  async searchLiterature(query: string, source: 'crossref' | 'arxiv' | 'pubmed'): Promise<Citation[]> {
    try {
      switch (source) {
        case 'crossref':
          return await this.searchCrossref(query);
        case 'arxiv':
          return await this.searchArxiv(query);
        case 'pubmed':
          return await this.searchPubmed(query);
        default:
          throw new Error(`Unsupported source: ${source}`);
      }
    } catch (err) {
      console.error(`Error searching ${source}:`, err);
      throw err;
    }
  }

  private async searchCrossref(query: string): Promise<Citation[]> {
    const response = await axios.get(API_ENDPOINTS.crossref, {
      params: {
        query,
        rows: 10,
        select: 'DOI,title,author,published-print,URL'
      }
    });

    const responseData = response.data as { message: { items: any[] } };
    return responseData.message.items.map(this.mapCrossrefToCitation);
  }

  private async searchArxiv(query: string): Promise<Citation[]> {
    const response = await axios.get(API_ENDPOINTS.arxiv, {
      params: {
        search_query: query,
        max_results: 10
      }
    });

    // Parse XML response and map to citations
    // TODO: Implement XML parsing
    return [];
  }

  private async searchPubmed(query: string): Promise<Citation[]> {
    const response = await axios.get(API_ENDPOINTS.pubmed, {
      params: {
        db: 'pubmed',
        term: query,
        retmax: 10,
        retmode: 'json'
      }
    });

    // TODO: Implement PubMed response mapping
    return [];
  }

  private mapCrossrefToCitation(item: any): Citation {
    return {
      id: item.DOI,
      type: 'article',
      title: item.title[0],
      authors: item.author?.map((a: any) => `${a.given} ${a.family}`) || [],
      year: new Date(item['published-print']?.['date-parts']?.[0]?.[0]).getFullYear(),
      source: 'Crossref',
      doi: item.DOI,
      url: item.URL,
      bibtex: '', // TODO: Generate BibTeX
      inTextCitation: '', // TODO: Generate in-text citation
      bibliography: '' // TODO: Generate bibliography entry
    };
  }

  async extractCitationsFromFile(file: Express.Multer.File): Promise<Citation[]> {
    // TODO: Implement file parsing based on file type
    return [];
  }

  async generateBibliography(citations: Citation[], style: string): Promise<string> {
    // Format citations according to the specified style
    const formattedCitations = await Promise.all(citations.map(async (citation) => {
      const formatted = await this.formatCitation(citation, style)
      return formatted
    }))

    // Join all formatted citations with newlines
    return formattedCitations.join('\n\n')
  }

  async checkPlagiarism(text: string): Promise<PlagiarismResult> {
    return await plagiarismService.checkPlagiarism(text);
  }

  async saveCitation(userId: string, citation: Citation): Promise<Citation> {
    const dbCitation = await prisma.citation.create({
      data: {
        userId,
        title: citation.title,
        authorsJson: JSON.stringify(citation.authors),
        year: citation.year,
        doi: citation.doi || null,
        url: citation.url || null,
        citationStyle: 'apa', // Default style
        type: citation.type,
        source: citation.source,
        bibtex: citation.bibtex,
        inTextCitation: citation.inTextCitation,
        bibliography: citation.bibliography
      }
    });

    return {
      id: dbCitation.id,
      type: dbCitation.type as Citation['type'],
      title: dbCitation.title,
      authors: JSON.parse(dbCitation.authorsJson),
      year: dbCitation.year,
      source: dbCitation.source,
      doi: dbCitation.doi || undefined,
      url: dbCitation.url || undefined,
      bibtex: dbCitation.bibtex,
      inTextCitation: dbCitation.inTextCitation,
      bibliography: dbCitation.bibliography
    };
  }

  async getCitations(userId: string): Promise<Citation[]> {
    const dbCitations = await prisma.citation.findMany({
      where: { userId }
    });

    return dbCitations.map((dbCitation: {
      id: string;
      type: string;
      title: string;
      authorsJson: string;
      year: number;
      source: string;
      doi: string | null;
      url: string | null;
      bibtex: string;
      inTextCitation: string;
      bibliography: string;
    }) => ({
      id: dbCitation.id,
      type: dbCitation.type as Citation['type'],
      title: dbCitation.title,
      authors: JSON.parse(dbCitation.authorsJson),
      year: dbCitation.year,
      source: dbCitation.source,
      doi: dbCitation.doi || undefined,
      url: dbCitation.url || undefined,
      bibtex: dbCitation.bibtex,
      inTextCitation: dbCitation.inTextCitation,
      bibliography: dbCitation.bibliography
    }));
  }

  async deleteCitation(userId: string, citationId: string): Promise<void> {
    await prisma.citation.delete({
      where: {
        id_userId: {
          id: citationId,
          userId
        }
      }
    });
  }

  async updateCitationStyle(citations: Citation[], style: string): Promise<Citation[]> {
    // Update each citation's format according to the new style
    const updatedCitations = await Promise.all(citations.map(async (citation) => {
      const formattedText = await this.formatCitation(citation, style)
      return {
        ...citation,
        formattedText
      }
    }))

    return updatedCitations
  }

  // Delegate equation methods to EquationsService
  async convertSpeechToLatex(text: string): Promise<string> {
    return await equationsService.convertSpeechToLatex(text);
  }

  async saveEquation(userId: string, equation: any): Promise<any> {
    return await equationsService.saveEquation(userId, equation);
  }

  async getEquations(userId: string): Promise<any[]> {
    return await equationsService.getEquations(userId);
  }

  async updateEquation(userId: string, id: string, equation: any): Promise<any> {
    return await equationsService.updateEquation(userId, id, equation);
  }

  async deleteEquation(userId: string, id: string): Promise<void> {
    await equationsService.deleteEquation(userId, id);
  }

  // Delegate figure methods to FiguresService
  async saveFigure(userId: string, figure: any): Promise<any> {
    return await figuresService.saveFigure(userId, figure);
  }

  async getFigures(userId: string): Promise<any[]> {
    return await figuresService.getFigures(userId);
  }

  async updateFigure(userId: string, id: string, figure: any): Promise<any> {
    return await figuresService.updateFigure(userId, id, figure);
  }

  async deleteFigure(userId: string, id: string): Promise<void> {
    await figuresService.deleteFigure(userId, id);
  }

  async exportFigure(id: string, format: 'png' | 'svg' | 'pdf' | 'json'): Promise<string> {
    return await figuresService.exportFigure(id, format);
  }

  private async formatCitation(citation: Citation, style: string): Promise<string> {
    // TODO: Implement proper citation formatting based on style
    switch (style.toLowerCase()) {
      case 'apa':
        return this.formatAPA(citation);
      case 'mla':
        return this.formatMLA(citation);
      case 'chicago':
        return this.formatChicago(citation);
      case 'ieee':
        return this.formatIEEE(citation);
      default:
        return this.formatAPA(citation); // Default to APA
    }
  }

  private formatAPA(citation: Citation): string {
    const authors = citation.authors.length > 0 
      ? citation.authors.join(', ') 
      : 'No author';
    return `${authors} (${citation.year}). ${citation.title}. ${citation.source}.${citation.doi ? ` doi:${citation.doi}` : ''}`;
  }

  private formatMLA(citation: Citation): string {
    const authors = citation.authors.length > 0 
      ? citation.authors.join(', ') 
      : 'No author';
    return `${authors}. "${citation.title}." ${citation.source}, ${citation.year}.`;
  }

  private formatChicago(citation: Citation): string {
    const authors = citation.authors.length > 0 
      ? citation.authors.join(' and ') 
      : 'No author';
    return `${authors}. "${citation.title}." ${citation.source} (${citation.year}).`;
  }

  private formatIEEE(citation: Citation): string {
    const authors = citation.authors.length > 0 
      ? citation.authors.join(', ') 
      : 'No author';
    return `${authors}, "${citation.title}," ${citation.source}, ${citation.year}.`;
  }
} 