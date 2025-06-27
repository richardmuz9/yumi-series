export type AnimeEmoji = '📺' | '💖' | '✨' | '🌟' | '🎭' | '🎬' | '🎨' | '🎮' | '📚' | '🎵';

export interface AnimeDiscussion {
  topic: string;
  userResponse?: string;
  yumiResponse?: string;
  mood: number;
  timestamp: number;
}

export interface OtakuPurityTest {
  currentLevel: number;
  discussions: AnimeDiscussion[];
  unlockedAchievements: string[];
  favoriteAnime: string[];
  sharedInterests: string[];
}

export interface AnimeReaction {
  emoji: AnimeEmoji;
  text: string;
  intensity: 1 | 2 | 3;
}

export type AnimeMood = 'excited' | 'emotional' | 'thoughtful' | 'nostalgic' | 'playful'; 