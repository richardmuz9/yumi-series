import { useState, useEffect, useCallback } from 'react';
import { WritingContent, WritingStats, AIAssistConfig } from './types';

// Hook for managing writing content with autosave
export const useWritingContent = (initialContent: string = '') => {
  const [content, setContent] = useState<WritingContent>({
    text: initialContent,
    type: 'creative',
    metadata: {
      createdAt: new Date(),
      updatedAt: new Date()
    }
  });

  // Autosave to localStorage
  useEffect(() => {
    const savedContent = localStorage.getItem('writing-content');
    if (savedContent) {
      setContent(JSON.parse(savedContent));
    }
  }, []);

  const updateContent = useCallback((newContent: Partial<WritingContent>) => {
    setContent(prev => {
      const updated = {
        ...prev,
        ...newContent,
        metadata: {
          ...prev.metadata,
          updatedAt: new Date()
        }
      };
      localStorage.setItem('writing-content', JSON.stringify(updated));
      return updated;
    });
  }, []);

  return { content, updateContent };
};

// Hook for AI assistance
export const useAIAssist = (config: AIAssistConfig) => {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);

  const analyzeParagraph = useCallback(async (text: string) => {
    if (!config.enabled || !text.trim()) return;
    
    setIsAnalyzing(true);
    try {
      // Call your AI service here
      // const result = await aiService.analyze(text);
      // setSuggestions(result.suggestions);
    } catch (error) {
      console.error('AI analysis error:', error);
    } finally {
      setIsAnalyzing(false);
    }
  }, [config.enabled]);

  return { isAnalyzing, suggestions, analyzeParagraph };
};

// Hook for writing statistics
export const useWritingStats = (text: string) => {
  const [stats, setStats] = useState<WritingStats>({
    wordCount: 0,
    readingTime: 0,
    sentiment: 0,
    complexity: 0
  });

  useEffect(() => {
    const words = text.trim().split(/\s+/).length;
    setStats({
      wordCount: words,
      readingTime: Math.ceil(words / 200), // Average reading speed
      sentiment: 0, // Calculate with sentiment analysis
      complexity: 0 // Calculate with readability score
    });
  }, [text]);

  return stats;
}; 