import type { ExamType, TestPrompt, EssaySubmission, FeedbackReport } from '../writing-helper/components/TestWriting/types';
import { api } from './api';

export const generateTest = async (examType: ExamType): Promise<TestPrompt> => {
  return api.post<TestPrompt>('/api/test/generate', { examType }).then((response) => response.data);
};

export const submitEssay = async (submission: EssaySubmission): Promise<FeedbackReport> => {
  return api.post<FeedbackReport>('/api/test/submit', submission).then((response) => response.data);
};

export const getPrompt = async (examType: ExamType): Promise<TestPrompt> => {
  try {
    const response = await api.get(`/api/test-writing/prompts/${examType}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch prompt:', error);
    throw error;
  }
};

export const getHistory = async (): Promise<EssaySubmission[]> => {
  return api.get<EssaySubmission[]>('/api/test/history').then((response) => response.data);
}; 