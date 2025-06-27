import { api } from '../../services/api';
import { MangaProject, MangaPage, Panel, PanelLayout } from '../types/manga';
import { Character } from '../../anime-chara-helper/types';
import { WritingProject } from '../../writing-helper/types';

export const mangaService = {
  // Project Management
  async getProjects(): Promise<MangaProject[]> {
    const response = await api.get('/api/manga/projects');
    return response.data;
  },

  async getProject(projectId: string): Promise<MangaProject> {
    const response = await api.get(`/api/manga/projects/${projectId}`);
    return response.data;
  },

  async createProject(project: Partial<MangaProject>): Promise<MangaProject> {
    const response = await api.post('/api/manga/projects', project);
    return response.data;
  },

  async updateProject(projectId: string, updates: Partial<MangaProject>): Promise<MangaProject> {
    const response = await api.put(`/api/manga/projects/${projectId}`, updates);
    return response.data;
  },

  // Page Management
  async getPage(projectId: string, pageNumber: number): Promise<MangaPage> {
    const response = await api.get(`/api/manga/projects/${projectId}/pages/${pageNumber}`);
    return response.data;
  },

  async updatePage(projectId: string, pageNumber: number, page: MangaPage): Promise<MangaPage> {
    const response = await api.put(`/api/manga/projects/${projectId}/pages/${pageNumber}`, page);
    return response.data;
  },

  async updatePanel(
    projectId: string,
    pageNumber: number,
    panelId: string,
    panel: Panel
  ): Promise<Panel> {
    const response = await api.put(
      `/api/manga/projects/${projectId}/pages/${pageNumber}/panels/${panelId}`,
      panel
    );
    return response.data;
  },

  // Layout Management
  async saveLayout(layout: PanelLayout): Promise<PanelLayout> {
    const response = await api.post('/api/manga/layouts', layout);
    return response.data;
  },

  async getLayouts(): Promise<PanelLayout[]> {
    const response = await api.get('/api/manga/layouts');
    return response.data;
  },

  // Integration with Writing Helper
  async importFromWriting(writingProject: WritingProject): Promise<MangaProject> {
    const response = await api.post('/api/manga/import/writing', { writingProject });
    return response.data;
  },

  // Integration with Anime Chara Helper
  async getAvailableCharacters(): Promise<Character[]> {
    const response = await api.get('/api/manga/characters');
    return response.data;
  },

  // AI Assistant
  async generateSceneLayout(prompt: string): Promise<PanelLayout> {
    const response = await api.post('/api/manga/ai/layout', { prompt });
    return response.data;
  },

  async generateDialogue(context: {
    characters: Character[];
    scene: string;
    style: string;
  }): Promise<string> {
    const response = await api.post('/api/manga/ai/dialogue', context);
    return response.data;
  },

  async generateComposition(prompt: string): Promise<{
    description: string;
    suggestions: string[];
  }> {
    const response = await api.post('/api/manga/ai/composition', { prompt });
    return response.data;
  },

  // Export
  async exportProject(projectId: string, format: 'png' | 'pdf' | 'web'): Promise<string> {
    const response = await api.post(`/api/manga/projects/${projectId}/export`, { format });
    return response.data.url;
  },
}; 