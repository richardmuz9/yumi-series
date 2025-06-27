import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { MangaProject, MangaChapter, MangaPage, Panel, AIAssistantPrompt } from './types';
import { WritingProject } from '../writinghelper/types';
import { Character } from '../../types/shared';
import { aiController } from '../shared/aiController';

const prisma = new PrismaClient();

export class MangaService {
  async createProject(title: string, style: string, metadata: MangaProject['metadata']): Promise<MangaProject> {
    const project = await prisma.mangaProject.create({
      data: {
        id: uuidv4(),
        title,
        style,
        metadata: metadata as any,
        created: new Date().toISOString(),
        modified: new Date().toISOString(),
        settings: {},
        chapters: []
      }
    });

    return project as unknown as MangaProject;
  }

  async getProject(id: string): Promise<MangaProject> {
    const project = await prisma.mangaProject.findUnique({
      where: { id },
      include: {
        chapters: {
          include: {
            pages: {
              include: {
                panels: true
              }
            }
          }
        },
        characters: true
      }
    });

    if (!project) {
      throw new Error('Project not found');
    }

    return project as unknown as MangaProject;
  }

  async updateProject(id: string, data: Partial<MangaProject>): Promise<MangaProject> {
    const project = await prisma.mangaProject.update({
      where: { id },
      data: {
        ...data,
        modified: new Date().toISOString()
      }
    });

    return project as unknown as MangaProject;
  }

  async deleteProject(id: string): Promise<void> {
    await prisma.mangaProject.delete({
      where: { id }
    });
  }

  async addChapter(projectId: string, title: string): Promise<MangaChapter> {
    const chapter = await prisma.mangaChapter.create({
      data: {
        id: uuidv4(),
        title,
        projectId,
        pages: []
      }
    });

    return chapter as unknown as MangaChapter;
  }

  async addPage(chapterId: string, layout: MangaPage['layout']): Promise<MangaPage> {
    const chapter = await prisma.mangaChapter.findUnique({
      where: { id: chapterId },
      include: { pages: true }
    });

    if (!chapter) {
      throw new Error('Chapter not found');
    }

    const page = await prisma.mangaPage.create({
      data: {
        id: uuidv4(),
        pageNumber: (chapter.pages?.length || 0) + 1,
        chapterId,
        layout: layout as any,
        panels: []
      }
    });

    return page as unknown as MangaPage;
  }

  async updatePanel(id: string, data: Partial<Panel>): Promise<Panel> {
    const panel = await prisma.panel.update({
      where: { id },
      data: data as any
    });

    return panel as unknown as Panel;
  }

  async generateAIAssistance(prompt: AIAssistantPrompt): Promise<string> {
    const systemPrompt = `You are a manga creation assistant. Help create ${prompt.type} based on the following context:
    - Style: ${prompt.context?.style || 'default'}
    - Characters: ${prompt.context?.characters?.map(c => c.name).join(', ') || 'none specified'}
    - Mood: ${prompt.context?.mood || 'neutral'}`;

    const response = await aiController.generateText({
      systemPrompt,
      userPrompt: prompt.content,
      temperature: 0.7,
      maxTokens: 500
    });

    return response;
  }

  async importFromWritingProject(writingProject: WritingProject): Promise<MangaProject> {
    // Create a new manga project
    const project = await this.createProject(
      writingProject.title,
      'custom',
      {
        author: writingProject.metadata.author,
        description: writingProject.metadata.description,
        tags: writingProject.metadata.genre || [],
        coverImage: undefined
      }
    );

    // Convert each writing chapter to manga chapter
    for (const chapter of writingProject.chapters) {
      const mangaChapter = await this.addChapter(project.id, chapter.title);

      // Create initial pages based on scenes
      for (const scene of chapter.scenes) {
        const page = await this.addPage(mangaChapter.id, {
          id: uuidv4(),
          name: 'Default Layout',
          rows: 3,
          columns: 2,
          template: 'standard'
        });

        // Generate panel suggestions based on scene content
        await this.generateAIAssistance({
          type: 'scene',
          content: scene.description,
          context: {
            style: project.style,
            mood: scene.mood
          }
        });
      }
    }

    return this.getProject(project.id);
  }
}

export const mangaService = new MangaService(); 