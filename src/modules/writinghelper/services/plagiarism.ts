import axios from 'axios';
import type { CopyleaksSubmitResponse, CopyleaksStatusResponse, CopyleaksReportResponse } from '../../../types/shared';

export interface PlagiarismResult {
  success: boolean;
  report?: {
    results: Array<{
      similarity: number;
      url: string;
      title: string;
    }>;
  };
  error?: string;
}

export async function checkPlagiarism(text: string): Promise<PlagiarismResult> {
  try {
    // Submit text for analysis
    const submitResponse = await axios.post<CopyleaksSubmitResponse>(
      '/api/plagiarism/submit',
      { text }
    );
    const textId = submitResponse.data.data.text.id;

    // Poll for status
    let status = 'pending';
    while (status === 'pending') {
      const statusResponse = await axios.get<CopyleaksStatusResponse>(
        `/api/plagiarism/status/${textId}`
      );
      status = statusResponse.data.data.text.status;
      if (status === 'pending') {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Get report
    const reportResponse = await axios.get<CopyleaksReportResponse>(
      `/api/plagiarism/report/${textId}`
    );
    return {
      success: true,
      report: reportResponse.data.data.text.report
    };
  } catch (error) {
    if (error instanceof Error) {
      return {
        success: false,
        error: error.message
      };
    }
    return {
      success: false,
      error: 'Unknown error occurred'
    };
  }
}

interface PlagiarismSubmitResponse {
  data: {
    text: {
      id: string;
    };
  };
}

interface PlagiarismStatusResponse {
  data: {
    text: {
      status: string;
    };
  };
}

interface PlagiarismReportResponse {
  data: {
    text: {
      report: any; // Replace with proper type if available
    };
  };
}

export async function submitContent(content: string): Promise<string> {
  try {
    const response = await axios.post('/api/plagiarism/submit', { content });
    const data = response.data as PlagiarismSubmitResponse;
    return data.data.text.id;
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Failed to submit content: ${error.message}`);
    }
    throw error;
  }
}

export async function checkStatus(textId: string): Promise<string> {
  const response = await axios.get(`/api/plagiarism/status/${textId}`);
  const data = response.data as PlagiarismStatusResponse;
  return data.data.text.status;
}

export async function getReport(textId: string): Promise<any> {
  const response = await axios.get(`/api/plagiarism/report/${textId}`);
  const data = response.data as PlagiarismReportResponse;
  return data.data.text.report;
} 