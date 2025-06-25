import axios, { AxiosError } from 'axios';
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
    const submitResponse = await axios.post<CopyleaksSubmitResponse>('https://api.copyleaks.com/v3/scans/submit', {
      text
    });
    const textId = submitResponse.data.data.text.id;

    // Poll for status
    let status = 'pending';
    while (status === 'pending') {
      const statusResponse = await axios.get<CopyleaksStatusResponse>(`https://api.copyleaks.com/v3/scans/${textId}/status`);
      status = statusResponse.data.data.text.status;
      if (status === 'pending') {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    // Get report
    const reportResponse = await axios.get<CopyleaksReportResponse>(`https://api.copyleaks.com/v3/scans/${textId}/report`);
    return {
      success: true,
      report: reportResponse.data.data.text.report
    };
  } catch (error) {
    if (error instanceof AxiosError) {
      return {
        success: false,
        error: error.response?.data?.message || error.message
      };
    }
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