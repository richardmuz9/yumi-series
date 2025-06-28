import type { GeneratedImage } from '../anime-chara-helper/types';
import { api } from './api';

export const generateCharacter = async (prompt: string): Promise<GeneratedImage> => {
  return api.post<GeneratedImage>('/anime-character', { prompt }).then((response) => response.data);
};

export const getCharacterSuggestions = async (input: string): Promise<string[]> => {
  return api.get<string[]>(`/anime-character/suggestions?input=${input}`).then((response) => response.data);
};

export const saveCharacter = async (character: GeneratedImage): Promise<void> => {
  return api.post('/anime-character/save', character).then(() => undefined);
}; 