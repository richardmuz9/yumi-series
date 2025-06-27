import { PrismaClient } from '@prisma/client';
import { v4 as uuidv4 } from 'uuid';
import { MangaProject, MangaChapter, MangaPage, Panel, AIAssistantPrompt, MangaStyle } from './types';
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
        metadata: JSON.stringify(metadata),
        created: new Date(),
        modified: new Date(),
        settings: JSON.stringify({}),
        characters: JSON.stringify([])
      }
    });

    return {
      ...project,
      metadata: JSON.parse(project.metadata),
      settings: JSON.parse(project.settings),
      characters: JSON.parse(project.characters),
      chapters: []
    } as MangaProject;
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
        }
      }
    });

    if (!project) {
      throw new Error('Project not found');
    }

    return {
      ...project,
      metadata: JSON.parse(project.metadata),
      settings: JSON.parse(project.settings),
      characters: JSON.parse(project.characters),
      chapters: project.chapters.map(chapter => ({
        ...chapter,
        writingSource: chapter.writingSource ? JSON.parse(chapter.writingSource) : null,
        pages: chapter.pages.map(page => ({
          ...page,
          layout: JSON.parse(page.layout),
          panels: page.panels.map(panel => ({
            ...panel,
            background: panel.background ? JSON.parse(panel.background) : null,
            characters: JSON.parse(panel.characters),
            dialogues: JSON.parse(panel.dialogues),
            effects: JSON.parse(panel.effects)
          }))
        }))
      }))
    } as MangaProject;
  }

  async updateProject(id: string, data: Partial<MangaProject>): Promise<MangaProject> {
    const { chapters, ...rest } = data;
    
    const updateData = {
      ...rest,
      modified: new Date(),
      metadata: data.metadata ? JSON.stringify(data.metadata) : undefined,
      settings: data.settings ? JSON.stringify(data.settings) : undefined,
      characters: data.characters ? JSON.stringify(data.characters) : undefined
    };

    const project = await prisma.mangaProject.update({
      where: { id },
      data: updateData,
      include: {
        chapters: {
          include: {
            pages: {
              include: {
                panels: true
              }
            }
          }
        }
      }
    });

    return {
      ...project,
      metadata: JSON.parse(project.metadata),
      settings: JSON.parse(project.settings),
      characters: JSON.parse(project.characters),
      chapters: project.chapters.map(chapter => ({
        ...chapter,
        writingSource: chapter.writingSource ? JSON.parse(chapter.writingSource) : null,
        pages: chapter.pages.map(page => ({
          ...page,
          layout: JSON.parse(page.layout),
          panels: page.panels.map(panel => ({
            ...panel,
            background: panel.background ? JSON.parse(panel.background) : null,
            characters: JSON.parse(panel.characters),
            dialogues: JSON.parse(panel.dialogues),
            effects: JSON.parse(panel.effects)
          }))
        }))
      }))
    } as MangaProject;
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
        writingSource: null
      }
    });

    return {
      ...chapter,
      writingSource: null,
      pages: []
    } as MangaChapter;
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
        layout: JSON.stringify(layout),
        notes: null
      }
    });

    return {
      ...page,
      layout: JSON.parse(page.layout),
      panels: []
    } as MangaPage;
  }

  async updatePanel(id: string, data: Partial<Panel>): Promise<Panel> {
    const updateData = {
      background: data.background ? JSON.stringify(data.background) : undefined,
      characters: data.characters ? JSON.stringify(data.characters) : undefined,
      dialogues: data.dialogues ? JSON.stringify(data.dialogues) : undefined,
      effects: data.effects ? JSON.stringify(data.effects) : undefined
    };

    const panel = await prisma.panel.update({
      where: { id },
      data: updateData
    });

    return {
      ...panel,
      background: panel.background ? JSON.parse(panel.background) : null,
      characters: JSON.parse(panel.characters),
      dialogues: JSON.parse(panel.dialogues),
      effects: JSON.parse(panel.effects)
    } as Panel;
  }

  async generateAIAssistance(prompt: AIAssistantPrompt): Promise<string> {
    const systemPrompt = `You are a manga creation assistant. Help create ${prompt.type} based on the following context:
    - Style: ${prompt.context?.style || 'custom'}
    - Characters: ${prompt.context?.characters?.map(c => c.name).join(', ') || 'none specified'}
    - Mood: ${prompt.context?.mood || 'neutral'}`;

    // Using any here temporarily until we properly type the aiController
    const response = await (aiController as any).generateText({
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
            style: 'custom' as MangaStyle,
            mood: scene.mood
          }
        });
      }
    }

    return this.getProject(project.id);
  }
}

export const mangaService = new MangaService(); 