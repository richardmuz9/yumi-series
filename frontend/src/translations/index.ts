export interface Translation {
  // Header and navigation
  settings: string;
  modelGuide: string;
  language: string;
  
  // Title and subtitle
  title: string;
  subtitle: string;
  
  // Main sections
  modes: string;
  charge: string;
  tokens: string;
  
  // Mode titles and descriptions
  webBuilder: string;
  webBuilderDesc: string;
  postGenerator: string;
  postGeneratorDesc: string;
  reportWriter: string;
  reportWriterDesc: string;
  animeCharaHelper: string;
  animeCharaHelperDesc: string;
  studyAdvisor: string;
  studyAdvisorDesc: string;
  
  // Status and actions
  comingSoon: string;
  footer: string;
  
  // Layout customization
  customizeLayout: string;
  customizeLayoutDesc: string;
  
  // Model introduction
  welcomeToYumi: string;
  yumiDescription: string;
  availableModels: string;
  gpt4: string;
  gpt4oMini: string;
  claude35Sonnet: string;
  gemini15Pro: string;
  
  // Charge page
  chargePageTitle: string;
  currentBalance: string;
  addTokens: string;
  tokenPackages: string;
  basicPack: string;
  popularPack: string;
  proPack: string;
  proceedToPayment: string;
  
  // Layout customizer
  customizeWorkspace: string;
  dragAndResize: string;
  backgroundThemes: string;
  panelVisibility: string;
  layoutActions: string;
  exportLayout: string;
  importLayout: string;
  resetDefaults: string;
  saveChanges: string;
  closeCustomizer: string;
}

export const translations: Record<string, Translation> = {
  en: {
    // Title and subtitle
    title: 'Yumi Series',
    subtitle: 'Your AI-powered productivity suite for content creation, web development, and learning',
    
    // Header and navigation
    settings: 'Settings',
    modelGuide: 'Model Guide',
    language: 'Language',
    
    // Main sections
    modes: 'Modes',
    charge: 'Charge',
    tokens: 'tokens',
    
    // Mode titles and descriptions
    webBuilder: 'Web Builder',
    webBuilderDesc: 'AI-powered website creation and management with intelligent design assistance',
    postGenerator: 'Post Generator',
    postGeneratorDesc: 'Create viral social media content with anime personas and trending insights',
    reportWriter: 'Report Writer',
    reportWriterDesc: 'Generate comprehensive reports and documents with AI assistance',
    animeCharaHelper: 'Anime Character Designer',
    animeCharaHelperDesc: 'AI-powered anime character creation with guided design assistance and iterative refinement',
    studyAdvisor: 'Study Advisor',
    studyAdvisorDesc: 'Personalized learning paths and study recommendations powered by AI',
    
    // Status and actions
    comingSoon: 'Coming Soon',
    footer: 'Choose your AI assistant to get started',
    
    // Layout customization
    customizeLayout: 'Customize Layout & Theme',
    customizeLayoutDesc: 'Personalize your workspace by adjusting panel layout and background themes',
    
    // Model introduction
    welcomeToYumi: 'Welcome to Yumi Series',
    yumiDescription: 'Your AI-powered creative assistant for web development, content creation, and productivity.',
    availableModels: 'Available AI Models',
    gpt4: 'GPT-4 - Most capable model for complex tasks',
    gpt4oMini: 'GPT-4o Mini - Fast and efficient for everyday tasks',
    claude35Sonnet: 'Claude 3.5 Sonnet - Excellent for creative writing',
    gemini15Pro: 'Gemini 1.5 Pro - Advanced reasoning and analysis',
    
    // Charge page
    chargePageTitle: 'Add Tokens',
    currentBalance: 'Current Balance',
    addTokens: 'Add Tokens',
    tokenPackages: 'Token Packages',
    basicPack: 'Basic Pack - 1,000 tokens',
    popularPack: 'Popular Pack - 5,000 tokens',
    proPack: 'Pro Pack - 20,000 tokens',
    proceedToPayment: 'Proceed to Payment',
    
    // Layout customizer
    customizeWorkspace: 'Customize Your Workspace',
    dragAndResize: 'Drag and resize panels to personalize your layout',
    backgroundThemes: 'Background Themes',
    panelVisibility: 'Panel Visibility',
    layoutActions: 'Layout Actions',
    exportLayout: 'Export Layout',
    importLayout: 'Import Layout',
    resetDefaults: 'Reset to Defaults',
    saveChanges: 'Save Changes',
    closeCustomizer: 'Close Customizer'
  },

  zh: {
    // Title and subtitle
    title: 'Yumi 系列',
    subtitle: '您的 AI 驱动生产力套件，用于内容创作、网站开发和学习',
    
    // Header and navigation
    settings: '设置',
    modelGuide: '模型指南',
    language: '语言',
    
    // Main sections
    modes: '模式',
    charge: '充值',
    tokens: '代币',
    
    // Mode titles and descriptions
    webBuilder: '网站构建器',
    webBuilderDesc: 'AI 驱动的网站创建和管理，提供智能设计辅助',
    postGenerator: '帖子生成器',
    postGeneratorDesc: '使用动漫角色和热门洞察创建病毒式社交媒体内容',
    reportWriter: '报告撰写器',
    reportWriterDesc: '使用 AI 辅助生成综合报告和文档',
    animeCharaHelper: '动漫角色设计师',
    animeCharaHelperDesc: 'AI 驱动的动漫角色创作，提供引导式设计协助和迭代优化',
    studyAdvisor: '学习顾问',
    studyAdvisorDesc: '由 AI 驱动的个性化学习路径和学习建议',
    
    // Status and actions
    comingSoon: '即将推出',
    footer: '选择您的 AI 助手开始使用',
    
    // Layout customization
    customizeLayout: '自定义布局和主题',
    customizeLayoutDesc: '通过调整面板布局和背景主题来个性化您的工作空间',
    
    // Model introduction
    welcomeToYumi: '欢迎使用由美系列',
    yumiDescription: '您的 AI 驱动创意助手，用于网页开发、内容创作和提高生产力。',
    availableModels: '可用的 AI 模型',
    gpt4: 'GPT-4 - 处理复杂任务的最强模型',
    gpt4oMini: 'GPT-4o Mini - 日常任务的快速高效模型',
    claude35Sonnet: 'Claude 3.5 Sonnet - 创意写作的优秀选择',
    gemini15Pro: 'Gemini 1.5 Pro - 高级推理和分析',
    
    // Charge page
    chargePageTitle: '添加代币',
    currentBalance: '当前余额',
    addTokens: '添加代币',
    tokenPackages: '代币套餐',
    basicPack: '基础套餐 - 1,000 代币',
    popularPack: '热门套餐 - 5,000 代币',
    proPack: '专业套餐 - 20,000 代币',
    proceedToPayment: '前往付款',
    
    // Layout customizer
    customizeWorkspace: '自定义您的工作空间',
    dragAndResize: '拖拽和调整面板大小以个性化您的布局',
    backgroundThemes: '背景主题',
    panelVisibility: '面板可见性',
    layoutActions: '布局操作',
    exportLayout: '导出布局',
    importLayout: '导入布局',
    resetDefaults: '重置为默认',
    saveChanges: '保存更改',
    closeCustomizer: '关闭自定义器'
  },

  ja: {
    // Title and subtitle
    title: 'Yumi シリーズ',
    subtitle: 'コンテンツ作成、ウェブ開発、学習のためのAI駆動生産性スイート',
    
    // Header and navigation
    settings: '設定',
    modelGuide: 'モデルガイド',
    language: '言語',
    
    // Main sections
    modes: 'モード',
    charge: 'チャージ',
    tokens: 'トークン',
    
    // Mode titles and descriptions
    webBuilder: 'ウェブビルダー',
    webBuilderDesc: 'インテリジェントデザインアシスタンス付きAI駆動ウェブサイト作成・管理',
    postGenerator: 'ポストジェネレーター',
    postGeneratorDesc: 'アニメペルソナとトレンドインサイトでバイラルSNSコンテンツを作成',
    reportWriter: 'レポートライター',
    reportWriterDesc: 'AIアシスタンスで包括的なレポートや文書を生成',
    animeCharaHelper: 'アニメキャラクターデザイナー',
    animeCharaHelperDesc: 'AI支援によるアニメキャラクター作成とガイド付きデザインアシスタンス',
    studyAdvisor: 'スタディアドバイザー',
    studyAdvisorDesc: 'AI駆動のパーソナライズされた学習パスと学習推奨',
    
    // Status and actions
    comingSoon: '近日公開',
    footer: 'AIアシスタントを選んで始めましょう',
    
    // Layout customization
    customizeLayout: 'レイアウトとテーマをカスタマイズ',
    customizeLayoutDesc: 'パネルレイアウトと背景テーマを調整してワークスペースをパーソナライズ',
    
    // Model introduction
    welcomeToYumi: 'Yumiシリーズへようこそ',
    yumiDescription: 'ウェブ開発、コンテンツ作成、生産性向上のためのAI駆動クリエイティブアシスタント。',
    availableModels: '利用可能なAIモデル',
    gpt4: 'GPT-4 - 複雑なタスクに最も適したモデル',
    gpt4oMini: 'GPT-4o Mini - 日常的なタスクに高速で効率的',
    claude35Sonnet: 'Claude 3.5 Sonnet - 創作活動に優れた選択',
    gemini15Pro: 'Gemini 1.5 Pro - 高度な推論と分析',
    
    // Charge page
    chargePageTitle: 'トークンを追加',
    currentBalance: '現在の残高',
    addTokens: 'トークンを追加',
    tokenPackages: 'トークンパッケージ',
    basicPack: 'ベーシックパック - 1,000トークン',
    popularPack: '人気パック - 5,000トークン',
    proPack: 'プロパック - 20,000トークン',
    proceedToPayment: '支払いに進む',
    
    // Layout customizer
    customizeWorkspace: 'ワークスペースをカスタマイズ',
    dragAndResize: 'パネルをドラッグしてサイズを変更し、レイアウトをパーソナライズしてください',
    backgroundThemes: '背景テーマ',
    panelVisibility: 'パネルの表示',
    layoutActions: 'レイアウトアクション',
    exportLayout: 'レイアウトをエクスポート',
    importLayout: 'レイアウトをインポート',
    resetDefaults: 'デフォルトにリセット',
    saveChanges: '変更を保存',
    closeCustomizer: 'カスタマイザーを閉じる'
  },

  ko: {
    // Title and subtitle
    title: 'Yumi 시리즈',
    subtitle: '콘텐츠 제작, 웹 개발 및 학습을 위한 AI 기반 생산성 도구 모음',
    
    // Header and navigation
    settings: '설정',
    modelGuide: '모델 가이드',
    language: '언어',
    
    // Main sections
    modes: '모드',
    charge: '충전',
    tokens: '토큰',
    
    // Mode titles and descriptions
    webBuilder: '웹 빌더',
    webBuilderDesc: '지능형 디자인 지원이 포함된 AI 기반 웹사이트 생성 및 관리',
    postGenerator: '포스트 생성기',
    postGeneratorDesc: '애니메 페르소나와 트렌드 인사이트로 바이럴 소셜 미디어 콘텐츠 생성',
    reportWriter: '보고서 작성기',
    reportWriterDesc: 'AI 지원으로 포괄적인 보고서 및 문서 생성',
    animeCharaHelper: '애니메 캐릭터 디자이너',
    animeCharaHelperDesc: 'AI 기반 애니메 캐릭터 생성과 가이드형 디자인 지원 및 반복 개선',
    studyAdvisor: '학습 어드바이저',
    studyAdvisorDesc: 'AI 기반 개인화된 학습 경로 및 학습 추천',
    
    // Status and actions
    comingSoon: '곧 출시',
    footer: 'AI 어시스턴트를 선택하여 시작하세요',
    
    // Layout customization
    customizeLayout: '레이아웃 및 테마 사용자 정의',
    customizeLayoutDesc: '패널 레이아웃과 배경 테마를 조정하여 작업 공간을 개인화하세요',
    
    // Model introduction
    welcomeToYumi: 'Yumi 시리즈에 오신 것을 환영합니다',
    yumiDescription: '웹 개발, 콘텐츠 제작 및 생산성을 위한 AI 기반 창의적 어시스턴트입니다.',
    availableModels: '사용 가능한 AI 모델',
    gpt4: 'GPT-4 - 복잡한 작업에 가장 적합한 모델',
    gpt4oMini: 'GPT-4o Mini - 일상적인 작업에 빠르고 효율적',
    claude35Sonnet: 'Claude 3.5 Sonnet - 창의적 글쓰기에 뛰어난 선택',
    gemini15Pro: 'Gemini 1.5 Pro - 고급 추론 및 분석',
    
    // Charge page
    chargePageTitle: '토큰 추가',
    currentBalance: '현재 잔액',
    addTokens: '토큰 추가',
    tokenPackages: '토큰 패키지',
    basicPack: '기본 패키지 - 1,000 토큰',
    popularPack: '인기 패키지 - 5,000 토큰',
    proPack: '프로 패키지 - 20,000 토큰',
    proceedToPayment: '결제 진행',
    
    // Layout customizer
    customizeWorkspace: '작업 공간 사용자 정의',
    dragAndResize: '패널을 드래그하고 크기를 조정하여 레이아웃을 개인화하세요',
    backgroundThemes: '배경 테마',
    panelVisibility: '패널 표시',
    layoutActions: '레이아웃 작업',
    exportLayout: '레이아웃 내보내기',
    importLayout: '레이아웃 가져오기',
    resetDefaults: '기본값으로 재설정',
    saveChanges: '변경사항 저장',
    closeCustomizer: '사용자 정의 도구 닫기'
  }
};

export const getTranslation = (language: string): Translation => {
  return translations[language] || translations.en;
};
