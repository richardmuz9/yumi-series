import { useState, useEffect, useCallback } from 'react';
import { mangaService } from '../services/mangaService';
import { MangaProject, MangaPage, Panel, PanelLayout } from '../types/manga';
import { Character } from '../../anime-chara-helper/types';
import { WritingProject } from '../../writing-helper/types';

export const useManga = (projectId?: string) => {
  const [project, setProject] = useState<MangaProject | null>(null);
  const [currentPage, setCurrentPage] = useState<MangaPage | null>(null);
  const [characters, setCharacters] = useState<Character[]>([]);
  const [layouts, setLayouts] = useState<PanelLayout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load project data
  useEffect(() => {
    if (!projectId) return;

    const loadProject = async () => {
      try {
        setLoading(true);
        const projectData = await mangaService.getProject(projectId);
        setProject(projectData);
        
        // Load first page by default
        if (projectData.chapters[0]?.pages[0]) {
          const pageData = await mangaService.getPage(projectId, 1);
          setCurrentPage(pageData);
        }

        // Load available characters
        const charactersData = await mangaService.getAvailableCharacters();
        setCharacters(charactersData);

        // Load available layouts
        const layoutsData = await mangaService.getLayouts();
        setLayouts(layoutsData);

        setError(null);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load project');
      } finally {
        setLoading(false);
      }
    };

    loadProject();
  }, [projectId]);

  // Project operations
  const createProject = useCallback(async (projectData: Partial<MangaProject>) => {
    try {
      const newProject = await mangaService.createProject(projectData);
      return newProject;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create project');
      throw err;
    }
  }, []);

  const updateProject = useCallback(async (updates: Partial<MangaProject>) => {
    if (!projectId || !project) return;

    try {
      const updatedProject = await mangaService.updateProject(projectId, updates);
      setProject(updatedProject);
      return updatedProject;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update project');
      throw err;
    }
  }, [projectId, project]);

  // Page operations
  const loadPage = useCallback(async (pageNumber: number) => {
    if (!projectId) return;

    try {
      const pageData = await mangaService.getPage(projectId, pageNumber);
      setCurrentPage(pageData);
      return pageData;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load page');
      throw err;
    }
  }, [projectId]);

  const updatePage = useCallback(async (pageNumber: number, pageData: MangaPage) => {
    if (!projectId) return;

    try {
      const updatedPage = await mangaService.updatePage(projectId, pageNumber, pageData);
      setCurrentPage(updatedPage);
      return updatedPage;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update page');
      throw err;
    }
  }, [projectId]);

  // Panel operations
  const updatePanel = useCallback(async (pageNumber: number, panelId: string, panelData: Panel) => {
    if (!projectId || !currentPage) return;

    try {
      const updatedPanel = await mangaService.updatePanel(projectId, pageNumber, panelId, panelData);
      setCurrentPage(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          panels: prev.panels.map(p => p.id === panelId ? updatedPanel : p)
        };
      });
      return updatedPanel;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update panel');
      throw err;
    }
  }, [projectId, currentPage]);

  // Layout operations
  const saveLayout = useCallback(async (layout: PanelLayout) => {
    try {
      const savedLayout = await mangaService.saveLayout(layout);
      setLayouts(prev => [...prev, savedLayout]);
      return savedLayout;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save layout');
      throw err;
    }
  }, []);

  // Integration operations
  const importFromWriting = useCallback(async (writingProject: WritingProject) => {
    try {
      const newProject = await mangaService.importFromWriting(writingProject);
      return newProject;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to import writing project');
      throw err;
    }
  }, []);

  // AI operations
  const generateSceneLayout = useCallback(async (prompt: string) => {
    try {
      const layout = await mangaService.generateSceneLayout(prompt);
      return layout;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate layout');
      throw err;
    }
  }, []);

  const generateDialogue = useCallback(async (context: {
    characters: Character[];
    scene: string;
    style: string;
  }) => {
    try {
      const dialogue = await mangaService.generateDialogue(context);
      return dialogue;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate dialogue');
      throw err;
    }
  }, []);

  return {
    project,
    currentPage,
    characters,
    layouts,
    loading,
    error,
    createProject,
    updateProject,
    loadPage,
    updatePage,
    updatePanel,
    saveLayout,
    importFromWriting,
    generateSceneLayout,
    generateDialogue,
  };
}; 