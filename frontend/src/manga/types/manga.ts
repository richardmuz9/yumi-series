import { Character } from '../../anime-chara-helper/types';
import { WritingProject } from '../../writing-helper/types';

export type MangaStyle = 'shounen' | 'shoujo' | 'seinen' | 'josei' | 'horror' | 'custom';

export interface PanelLayout {
  id: string;
  name: string;
  rows: number;
  columns: number;
  template: string; // CSS grid template
  isCustom?: boolean;
}

export interface DialogueBubble {
  id: string;
  type: 'normal' | 'shout' | 'whisper' | 'thought' | 'monologue';
  content: string;
  position: { x: number; y: number };
  style?: {
    fontSize?: number;
    fontFamily?: string;
    color?: string;
  };
}

export interface Panel {
  id: string;
  background?: {
    type: 'image' | 'ai-generated';
    url?: string;
    prompt?: string;
  };
  characters: Array<{
    character: Character;
    position: { x: number; y: number };
    scale: number;
    expression: string;
    flipped?: boolean;
  }>;
  dialogues: DialogueBubble[];
  effects: Array<{
    type: string;
    position: { x: number; y: number };
    style?: Record<string, any>;
  }>;
}

export interface MangaPage {
  id: string;
  pageNumber: number;
  layout: PanelLayout;
  panels: Panel[];
  notes?: string;
}

export interface MangaChapter {
  id: string;
  title: string;
  pages: MangaPage[];
  writingSource?: {
    project: WritingProject;
    chapterId: string;
  };
}

export interface MangaProject {
  id: string;
  title: string;
  style: MangaStyle;
  chapters: MangaChapter[];
  characters: Character[];
  created: string;
  modified: string;
  metadata: {
    author: string;
    description?: string;
    tags: string[];
    coverImage?: string;
  };
  settings: {
    defaultLayout?: PanelLayout;
    defaultBubbleStyle?: Partial<DialogueBubble['style']>;
    customStyles?: Record<string, any>;
  };
}

export interface AIAssistantPrompt {
  type: 'layout' | 'dialogue' | 'scene' | 'composition';
  content: string;
  context?: {
    characters?: Character[];
    style?: MangaStyle;
    mood?: string;
  };
}

export interface LayoutTemplate {
  id: string;
  name: string;
  preview: string;
  layout: PanelLayout;
  tags: string[];
  category: 'basic' | 'action' | 'dialogue' | 'custom';
} 