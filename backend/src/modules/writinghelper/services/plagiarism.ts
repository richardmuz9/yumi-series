import axios from 'axios';
import { PlagiarismResult } from '../types';

// Custom error class for plagiarism service
export class PlagiarismError extends Error {
  constructor(
    public readonly code: 'API_ERROR' | 'VALIDATION_ERROR' | 'TIMEOUT_ERROR' | 'CONFIG_ERROR',
    message: string,
    public readonly originalError?: any
  ) {
    super(message);
    this.name = 'PlagiarismError';
  }
}

export class PlagiarismService {
  private readonly pcheckApiToken: string;
  private readonly edenaiApiKey: string;
  private readonly pcheckBaseUrl = 'https://plagiarismcheck.org/api/v1';
  private readonly edenaiBaseUrl = 'https://api.eden.ai/v1/ai';
  private readonly maxTextLength = 50000; // Maximum text length to check
  private readonly timeout = 30000; // 30 seconds timeout for API calls

  constructor() {
    this.pcheckApiToken = process.env.PCHECK_API_TOKEN || '';
    this.edenaiApiKey = process.env.EDENAI_PLAG_KEY || '';

    if (!this.pcheckApiToken || !this.edenaiApiKey) {
      throw new PlagiarismError(
        'CONFIG_ERROR',
        'Missing required API keys for plagiarism checking services'
      );
    }
  }

  private validateText(text: string): void {
    if (!text || typeof text !== 'string') {
      throw new PlagiarismError(
        'VALIDATION_ERROR',
        'Text must be a non-empty string'
      );
    }

    if (text.length > this.maxTextLength) {
      throw new PlagiarismError(
        'VALIDATION_ERROR',
        `Text length (${text.length}) exceeds maximum allowed length (${this.maxTextLength})`
      );
    }
  }

  private handleApiError(error: any, service: string): never {
    if (error && error.response && error.request) {
      // This is an axios error
      if (error.code === 'ECONNABORTED') {
        throw new PlagiarismError(
          'TIMEOUT_ERROR',
          `${service} API request timed out`,
          error
        );
      }
      throw new PlagiarismError(
        'API_ERROR',
        `${service} API error: ${error.response?.data?.error || error.message}`,
        error
      );
    }
    throw new PlagiarismError(
      'API_ERROR',
      `${service} error: ${error.message || 'Unknown error'}`,
      error
    );
  }

  async checkPlagiarismWithPCheck(text: string): Promise<PlagiarismResult> {
    try {
      this.validateText(text);

      // Submit text for checking
      const submitResponse = await axios.post(
        `${this.pcheckBaseUrl}/text`,
        { text, language: 'en' },
        {
          headers: {
            'X-API-TOKEN': this.pcheckApiToken,
            'Content-Type': 'application/json'
          },
          timeout: this.timeout
        }
      );

      const submitData = submitResponse.data as { data: { text: { id: string } } };
      const textId = submitData.data.text.id;

      // Poll for status until complete
      let status = 'processing';
      let attempts = 0;
      const maxAttempts = 10;
      
      while (status === 'processing' && attempts < maxAttempts) {
        const statusResponse = await axios.get(
          `${this.pcheckBaseUrl}/text/${textId}`,
          {
            headers: {
              'X-API-TOKEN': this.pcheckApiToken
            },
            timeout: this.timeout
          }
        );

        const statusData = statusResponse.data as { data: { text: { status: string } } };
        status = statusData.data.text.status;
        if (status === 'processing') {
          await new Promise(resolve => setTimeout(resolve, 2000)); // Wait 2 seconds before next poll
          attempts++;
        }
      }

      if (status !== 'completed') {
        throw new PlagiarismError(
          'TIMEOUT_ERROR',
          'Plagiarism check timed out or failed'
        );
      }

      // Get the report
      const reportResponse = await axios.get(
        `${this.pcheckBaseUrl}/text/report/${textId}`,
        {
          headers: {
            'X-API-TOKEN': this.pcheckApiToken
          },
          timeout: this.timeout
        }
      );

      const reportData = reportResponse.data as { data: any };
      const report = reportData.data;
      return {
        score: report.percent,
        matches: report.matches.map((match: any) => ({
          text: match.text,
          source: match.source_url,
          similarity: match.percent
        }))
      };
    } catch (error) {
      this.handleApiError(error, 'PlagiarismCheck.org');
    }
  }

  async checkPlagiarismWithEdenAI(text: string): Promise<PlagiarismResult> {
    try {
      this.validateText(text);

      const response = await axios.post(
        `${this.edenaiBaseUrl}/text/plagiarism`,
        {
          text,
          providers: 'copyleaks' // Using Copyleaks through Eden AI
        },
        {
          headers: {
            'Authorization': `Bearer ${this.edenaiApiKey}`,
            'Content-Type': 'application/json'
          },
          timeout: this.timeout
        }
      );

      const responseData = response.data as { copyleaks: any };
      const result = responseData.copyleaks;
      return {
        score: result.plagiarism_score,
        matches: result.items.map((item: any) => ({
          text: item.matched_text,
          source: item.url,
          similarity: item.similarity_score
        }))
      };
    } catch (error) {
      this.handleApiError(error, 'Eden AI');
    }
  }

  async checkPlagiarism(text: string): Promise<PlagiarismResult> {
    try {
      this.validateText(text);

      // Run both services in parallel
      const [pcheckResult, edenaiResult] = await Promise.all([
        this.checkPlagiarismWithPCheck(text).catch(error => {
          console.warn('PlagiarismCheck.org service failed:', error);
          return null;
        }),
        this.checkPlagiarismWithEdenAI(text).catch(error => {
          console.warn('Eden AI service failed:', error);
          return null;
        })
      ]);

      // If both services failed, throw an error
      if (!pcheckResult && !edenaiResult) {
        throw new PlagiarismError(
          'API_ERROR',
          'All plagiarism checking services failed'
        );
      }

      // If one service failed, use the result from the other
      if (!pcheckResult) return edenaiResult!;
      if (!edenaiResult) return pcheckResult;

      // Combine and average the results
      const combinedScore = (pcheckResult.score + edenaiResult.score) / 2;
      const combinedMatches = [
        ...pcheckResult.matches,
        ...edenaiResult.matches
      ].sort((a, b) => b.similarity - a.similarity); // Sort by similarity descending

      return {
        score: combinedScore,
        matches: combinedMatches
      };
    } catch (error) {
      if (error instanceof PlagiarismError) {
        throw error;
      }
      throw new PlagiarismError(
        'API_ERROR',
        'Failed to check plagiarism',
        error
      );
    }
  }
} 