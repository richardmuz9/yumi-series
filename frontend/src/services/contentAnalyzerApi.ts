import { apiClient } from './api';
import { AxiosResponse } from 'axios';

const API_BASE = import.meta.env.VITE_API_URL || (import.meta.env.DEV ? 'http://localhost:3000' : 'https://137.184.89.215:3001');

export interface ReadabilityMetrics {
  score: number;
  grade: string;
  suggestions: string[];
}

export interface SEOMetrics {
  score: number;
  keywords: string[];
  suggestions: string[];
}

export interface ContentMetrics {
  readability: ReadabilityMetrics;
  seo: SEOMetrics;
  sentiment: string;
}

export interface UserPreferences {
  preferredAIProvider: string;
  languagePreference: string;
  writingStyle: string;
  seoPreferences: {
    targetKeywords: string[];
    targetReadingLevel: string;
  };
}

export interface AnalyticsData {
  totalAnalyses: number;
  averageReadabilityScore: number;
  averageSeoScore: number;
  aiUsageByProvider: Record<string, number>;
  aiUsageByPurpose: Record<string, number>;
  successRate: number;
}

export const contentAnalyzerApi = {
  async analyzeContent(content: string): Promise<ContentMetrics> {
    const response: AxiosResponse<ContentMetrics> = await apiClient.post('/api/content/analyze', {
      content
    });
    return response.data;
  },

  async getUserPreferences(): Promise<UserPreferences> {
    const response: AxiosResponse<UserPreferences> = await apiClient.get('/api/content/preferences');
    return response.data;
  },

  async updateUserPreferences(preferences: UserPreferences): Promise<UserPreferences> {
    const response: AxiosResponse<UserPreferences> = await apiClient.put('/api/content/preferences', preferences);
    return response.data;
  },

  async getAnalytics(): Promise<AnalyticsData> {
    const response: AxiosResponse<AnalyticsData> = await apiClient.get('/api/content/analytics');
    return response.data;
  }
}; 