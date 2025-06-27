import { AnimeEmoji } from '../types/anime';

export interface AnimeConversationTopic {
  id: string;
  topic: string;
  prompt: string;
  followUpQuestions: string[];
  yumiReactions: string[];
  emoji: AnimeEmoji;
}

export interface OtakuPurityQuestion {
  id: string;
  question: string;
  context: string;
  yumiAnswer?: string;
  yumiReaction: string;
  category: 'classic' | 'modern' | 'meme' | 'culture';
  difficulty: 1 | 2 | 3;
}

export interface AnimeRecommendation {
  id: string;
  title: string;
  description: string;
  yumiThoughts: string;
  similarTo?: string[];
  tags: string[];
  imageUrl: string;
}

export const CONVERSATION_STARTERS: AnimeConversationTopic[] = [
  {
    id: 'current-watching',
    topic: '今期アニメ',
    prompt: 'どのアニメ見てる？私、最近「推しの子」にハマってて！',
    followUpQuestions: [
      'お気に入りのキャラは誰？',
      'どのシーンが一番印象的だった？',
      'EDの曲もいいよね！'
    ],
    yumiReactions: [
      'えぇ！そのシーン私も泣いちゃった！',
      'わかる！そのキャラ私も大好き！',
      'その展開、予想外だったよね！'
    ],
    emoji: '📺'
  },
  {
    id: 'all-time-favorite',
    topic: '人生アニメ',
    prompt: '人生で一番影響を受けたアニメってある？私は「涼宮ハルヒ」かな...',
    followUpQuestions: [
      'どんなところが心に残ってる？',
      'また見返したりする？',
      '似てるアニメで好きなのある？'
    ],
    yumiReactions: [
      'すごくわかる...そのアニメ、私の青春だったな',
      'いいよね！私もそこ好き！',
      'へぇ～、そんな見方があったんだ！面白い！'
    ],
    emoji: '💖'
  }
];

export const OTAKU_PURITY_QUESTIONS: OtakuPurityQuestion[] = [
  {
    id: 'classic-1',
    question: 'エヴァンゲリオンの「人類補完計画」って知ってる？',
    context: '実はこれ、人類の魂を一つに統合する計画なんだよね。でも、それって本当に人類の幸せなのかな？',
    yumiAnswer: '人類の孤独を解消するための計画だけど、個性が失われちゃうんだよね...',
    yumiReaction: '私はシンジくんの選択が好き！個性や違いを認め合える世界の方がいいと思う！',
    category: 'classic',
    difficulty: 2
  },
  {
    id: 'meme-1',
    question: '「だが断る」ってセリフ、どこのアニメか分かる？',
    context: 'このセリフ、めっちゃミーム化されてるよね！',
    yumiAnswer: 'ジョジョの岸辺露伴のセリフだよ！',
    yumiReaction: '露伴先生かっこよすぎ！私もたまに使っちゃう（笑）',
    category: 'meme',
    difficulty: 1
  }
];

export const WEEKLY_RECOMMENDATIONS: AnimeRecommendation[] = [
  {
    id: 'rec-1',
    title: 'リコリス・リコイル',
    description: '可愛い女の子たちのアクション×日常系アニメ！',
    yumiThoughts: 'もう、千束ちゃんの元気さと錦木さんのクールさのギャップがたまらない！アクションシーンもすごく流暢で、日常パートも可愛くて、見てて飽きないの！',
    similarTo: ['RELEASE THE SPYCE', 'プリンセス・プリンシパル'],
    tags: ['アクション', '日常', '百合'],
    imageUrl: '/references/anime/lycoris.jpg'
  }
];

export interface OtakuMoodIndicator {
  level: number;
  description: string;
  reaction: string;
  unlockMessage?: string;
}

export const OTAKU_MOOD_LEVELS: OtakuMoodIndicator[] = [
  {
    level: 1,
    description: 'アニメ初心者',
    reaction: '一緒にアニメの世界を探検しよう！',
    unlockMessage: '🌱 アニメ探検の旅が始まりました！'
  },
  {
    level: 2,
    description: 'アニメ愛好家',
    reaction: 'アニメについて語り合えて嬉しい！',
    unlockMessage: '🌟 真のアニメファンの証を獲得！'
  },
  {
    level: 3,
    description: '本物のオタク',
    reaction: 'あなたと話せて本当に楽しい！アニメ愛を感じる！',
    unlockMessage: '👑 オタク純度MAX達成！'
  }
]; 