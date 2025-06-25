import { ExamType, TestPrompt, EssaySubmission, FeedbackReport } from '../writing-helper/components/TestWriting/types';
import { api } from './api';

export const getPrompt = async (examType: ExamType): Promise<TestPrompt> => {
  try {
    const response = await api.get(`/api/test-writing/prompts/${examType}`);
    return response.data;
  } catch (error) {
    console.error('Failed to fetch prompt:', error);
    throw error;
  }
};

export const submitEssay = async (submission: EssaySubmission): Promise<FeedbackReport> => {
  try {
    const response = await api.post('/api/test-writing/submit', submission);
    return response.data;
  } catch (error) {
    console.error('Failed to submit essay:', error);
    throw error;
  }
};

export const getHistory = async (): Promise<{
  submissions: Array<{
    id: string;
    examType: ExamType;
    promptTitle: string;
    submittedAt: string;
    score: number;
    maxScore: number;
  }>;
}> => {
  try {
    const response = await api.get('/api/test-writing/history');
    return response.data;
  } catch (error) {
    console.error('Failed to fetch history:', error);
    throw error;
  }
}; 