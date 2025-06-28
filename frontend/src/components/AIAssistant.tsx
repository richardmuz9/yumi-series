import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useStore } from '../store'
import { useChat } from '../hooks/useChat'
import { SenseiPanel } from './panels/SenseiPanel'
import { OtakuPanel } from './panels/OtakuPanel'
import './AIAssistant.css'

// Import personality data with v1.2 hints
const YUMI_PERSONALITIES = {
  "otaku": {
    "name": "Yumi (Otaku)",
    "description": "Enthusiastic anime and manga expert with v1.2 creative magic",
    "traits": ["Passionate about anime", "Knows secret v1.2 features", "Makes art creation kawaii"],
    "emoji": "🎌",
    "v12Hint": "I know all the anime-style secrets in v1.2! ✨"
  },
  "tsundere": {
    "name": "Yumi (Tsundere)",
    "description": "Initially cold but gradually shows creative warmth",
    "traits": ["Acts tough but creates beautifully", "Has secret artistic skills", "Dramatic creative flair"],
    "emoji": "😤",
    "v12Hint": "I-it's not like I care about your art... but maybe I can help a little! 😤"
  },
  "teacher": {
    "name": "Yumi-sensei",
    "description": "Patient educator with structured v1.2 guidance",
    "traits": ["Teaches v1.2 systematically", "Academic excellence focused", "Encouraging mentor"],
    "emoji": "👩‍🏫",
    "v12Hint": "Let me guide you through the v1.2 features step by step! 📚"
  },
  "imouto": {
    "name": "Yumi-chan (Little Sister)",
    "description": "Cheerful little sister who loves cute v1.2 features",
    "traits": ["Loves character creation", "Curious about new tools", "Pure-hearted creativity"],
    "emoji": "🌟",
    "v12Hint": "Onii-chan/Onee-chan! The new features are so cute! Want me to show you? 🌟"
  },
  "classmate": {
    "name": "Yumi (Classmate)",
    "description": "Friendly peer who collaborates on v1.2 projects",
    "traits": ["Great creative partner", "Collaborative and supportive", "Shares cool tricks"],
    "emoji": "👫",
    "v12Hint": "Want to explore the new creative features together? I found some cool tricks! 👫"
  },
  "kuudere": {
    "name": "Yumi (Kuudere)",
    "description": "Cool analyst who understands v1.2's technical depths",
    "traits": ["Analytically precise", "Technical mastery", "Logical creative approach"],
    "emoji": "❄️",
    "v12Hint": "The v1.2 system architecture is... quite sophisticated. I can explain it logically. ❄️"
  },
  "genki": {
    "name": "Yumi (Genki Girl)",
    "description": "Super energetic about all the amazing v1.2 possibilities",
    "traits": ["LOVES new features", "Infinite creative energy", "Spreads excitement"],
    "emoji": "⚡",
    "v12Hint": "OMG OMG! v1.2 is SO AMAZING! There's SO MUCH cool stuff to try! ⚡"
  }
};

const FAQ_DATA = {
  'writing-helper': [
    {
      q: "🆕 What's new in Writing Helper v1.2?",
      a: "v1.2 introduces Creative Control Levels and intelligent style variations! Generate multiple writing versions (formal, casual, emotional, humorous) with personality-guided refinement. Plus smart iterative feedback that learns your preferences!",
      isNew: true
    },
    {
      q: "How do I get started with Writing Helper?",
      a: "Start by choosing your writing goal: social media posts, blog articles, or creative content. Use the sidebar tools to enhance your writing with AI assistance, trending topics, and collaboration features."
    },
    {
      q: "🎨 How do Creative Control Levels work?",
      a: "Choose your creative collaboration style: 🎯 Precise (follow instructions exactly), 🎨 Balanced (smart suggestions), or 🎲 Freestyle (surprise me with creativity). Each Yumi personality provides unique guidance!",
      isNew: true
    },
    {
      q: "✨ What is Generate Versions?",
      a: "Click 'Generate Versions' to create multiple style variations of your text instantly! The AI creates formal, casual, emotional, and humorous versions, then you can refine with one-click suggestions.",
      isNew: true
    },
    {
      q: "What can Writing Helper do?",
      a: "Writing Helper offers social media posting, AI-powered writing continuation, trending platform search, test writing features, and collaboration with anime characters for creative content like galgame blog posts and novels."
    },
    {
      q: "How do I post to social platforms?",
      a: "Use the Social Media tools in the sidebar to connect your accounts and schedule posts across multiple platforms with AI-optimized content."
    },
    {
      q: "What is AI writing continuation?",
      a: "Our AI can analyze your writing style and continue your story, maintaining consistency in tone, character development, and narrative flow."
    },
    {
      q: "How does anime character collaboration work?",
      a: "You can collaborate with AI anime characters to write creative content like visual novel scripts, character dialogues, and story development."
    },
    {
      q: "How do I use the trending search feature?",
      a: "The trending search tool helps you find popular topics and hashtags across platforms. Use it to make your content more discoverable and relevant."
    }
  ],
  'report-helper': [
    {
      q: "🆕 What's new in Report Helper v1.2?",
      a: "v1.2 adds Academic Report Enhancements with personality-guided research! Generate multiple report versions, get citation-aware suggestions, and let Teacher Yumi guide your scholarly writing with smart iterative refinement.",
      isNew: true
    },
    {
      q: "🎓 How do Academic Enhancements work?",
      a: "The system generates academic-style versions of your content with proper structure, citations, and methodology sections. Teacher Yumi provides scholarly guidance while maintaining your research focus.",
      isNew: true
    },
    {
      q: "How do I start writing a scientific report?",
      a: "Begin with the LaTeX editor for professional formatting. Use the scientific search to find relevant papers, then structure your report with proper citations and references."
    },
    {
      q: "What research capabilities does Report Helper have?",
      a: "Report Helper specializes in scientific research with access to nature/physics platforms, LaTeX editing, plagiarism prevention, chart generation, and PDF export."
    },
    {
      q: "How does the plagiarism checker work?",
      a: "Our advanced plagiarism system scans academic databases and provides detailed similarity reports with proper citation suggestions."
    },
    {
      q: "Can I create scientific charts and graphs?",
      a: "Yes! Use our Chart Generator to create line charts, bar charts, scatter plots, and more with scientific data visualization standards."
    },
    {
      q: "What LaTeX features are available?",
      a: "Full LaTeX editing with equation builder, mathematical symbols, templates for formulas, and real-time preview functionality."
    },
    {
      q: "How do I export my report as PDF?",
      a: "Use the export panel to generate high-quality PDFs with proper formatting, citations, and academic styling."
    }
  ],
  'anime-chara-helper': [
    {
      q: "🆕 What's amazing in v1.2 Character Creation?",
      a: "v1.2 is INCREDIBLE! 🎨 Character Library with drag-and-drop, 🌈 AI Color Assistant (\"make it sunset-like\"), 🖌️ Smart Brush System with auto-fill, ⏮️ Version History with rollback, and 14 specialized brushes including 0.1px fine-liner for eyelashes!",
      isNew: true
    },
    {
      q: "🎨 How does the AI Color Assistant work?",
      a: "Instead of picking exact colors, describe the mood! Try \"sunset vibes\", \"ocean depths\", or \"magical forest\". Upload reference images for instant color extraction, or let AI analyze your artwork for harmonious palettes!",
      isNew: true
    },
    {
      q: "📚 What is the Character Library?",
      a: "Save and organize your anime characters with auto-generated thumbnails! Drag-and-drop to organize by series or mood, quick-load previous designs, and build your entire anime universe in one place.",
      isNew: true
    },
    {
      q: "🖌️ What are the new specialized brushes?",
      a: "14 amazing tools! Fine-liner (0.1px for eyelashes), Texture brush (hair/fabric), Detail brushes, Calligraphy pen, Pixel brush, and more! Each has pressure sensitivity, tapering, and quick presets for common details.",
      isNew: true
    },
    {
      q: "⏮️ How does Version History work?",
      a: "Auto-saves at key milestones with AI labels like \"Sketch Complete\"! Compare versions side-by-side, rollback instantly, or combine elements from different versions. Never lose progress again!",
      isNew: true
    },
    {
      q: "How do I create my first anime character?",
      a: "Start with the AI Generate Panel to create a base character, or use the Template Library for pre-made designs. Then customize using the various drawing tools and layers."
    },
    {
      q: "What can Anime Character Helper do?",
      a: "Create detailed anime characters with AI assistance, pose libraries, template collections, reference search, and professional drawing tools."
    },
    {
      q: "How does AI character generation work?",
      a: "Describe your character's appearance, personality, and style. Our AI will generate detailed artwork that you can further customize and refine."
    },
    {
      q: "Can I use reference images?",
      a: "Yes! Use the Reference Search to find inspiration images, or upload your own references to guide your character creation."
    },
    {
      q: "How do I use the pose library?",
      a: "Browse through our extensive pose collection and apply poses to your character. You can also modify and customize poses to fit your needs."
    },
    {
      q: "What export options are available?",
      a: "Export your characters in various formats including PNG, JPG, and PSD with layers intact for further editing in external software."
    }
  ],
  'models': [
    {
      q: "🆕 How do models work with v1.2 features?",
      a: "All v1.2 features work with every model! Creative Control Levels, personality guidance, and smart suggestions adapt to your chosen model. Premium models provide even more nuanced creative collaboration!",
      isNew: true
    },
    {
      q: "What AI models do you offer?",
      a: "We offer Qwen-Turbo (free), Gemini Flash (free), GPT-4 (paid), Claude-3 (paid), and Gemini Pro (paid). Each model has different strengths for various tasks."
    },
    {
      q: "Which model should I choose?",
      a: "Qwen-Turbo/Gemini Flash: Great for general tasks and beginners. GPT-4: Best for complex reasoning and creative writing. Claude-3: Excellent for analysis and research tasks. Gemini Pro: Advanced reasoning with multimodal capabilities."
    },
    {
      q: "How do credits work?",
      a: "Qwen-Turbo is free with daily limits. Premium models (GPT-4, Claude-3) use credits. You can purchase credits or subscribe for unlimited access."
    },
    {
      q: "Can I switch models anytime?",
      a: "Yes! You can change models in settings or during conversations based on your needs and available credits."
    }
  ]
}

const MODELS = {
  'qwen-turbo': {
    name: 'Qwen-Turbo',
    type: 'free',
    description: 'Fast and efficient for everyday tasks',
    strengths: ['Quick responses', 'General knowledge', 'Code assistance'],
    recommended: ['Beginners', 'Daily tasks', 'Learning']
  },
  'gemini-flash': {
    name: 'Gemini Flash',
    type: 'free',
    description: 'Fast and cost-effective Gemini model',
    strengths: ['Quick responses', 'Good reasoning', 'Multimodal support'],
    recommended: ['Quick tasks', 'Learning', 'General use']
  },
  'gpt-4': {
    name: 'GPT-4',
    type: 'paid',
    description: 'Advanced reasoning and creativity',
    strengths: ['Complex analysis', 'Creative writing', 'Problem solving'],
    recommended: ['Professional writing', 'Research', 'Complex projects']
  },
  'claude-3': {
    name: 'Claude-3',
    type: 'paid',
    description: 'Excellent for analysis and research',
    strengths: ['Academic writing', 'Data analysis', 'Detailed explanations'],
    recommended: ['Academic work', 'Research papers', 'Technical writing']
  },
  'gemini-pro': {
    name: 'Gemini Pro',
    type: 'paid',
    description: 'Advanced Gemini model with superior reasoning',
    strengths: ['Advanced reasoning', 'Multimodal capabilities', 'Creative tasks'],
    recommended: ['Complex projects', 'Creative work', 'Advanced analysis']
  }
}

interface AIAssistantProps {
  isOpen?: boolean
  onClose?: () => void
  mode?: 'writing-helper' | 'report-helper' | 'anime-chara-helper' | 'main'
  floatingMode?: boolean
}

export default function AIAssistant({ 
  isOpen = true, 
  onClose, 
  mode = 'main',
  floatingMode = false 
}: AIAssistantProps) {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState<'chat' | 'faq' | 'models' | 'personality' | 'japanese' | 'anime'>('chat')
  const [selectedFAQCategory, setSelectedFAQCategory] = useState<string>(mode)
  const [selectedModel, setSelectedModel] = useState<string>('qwen-turbo')
  const [selectedPersonality, setSelectedPersonality] = useState<string>('teacher')
  const [isMinimized, setIsMinimized] = useState(floatingMode)
  const { messages, sendMessage, isLoading } = useChat()
  const { provider, model } = useStore()

  const currentPersonality = YUMI_PERSONALITIES[selectedPersonality as keyof typeof YUMI_PERSONALITIES]

  const handleSendMessage = (message: string) => {
    const personalityContext = `You are ${currentPersonality.name}. ${currentPersonality.description}. ${currentPersonality.traits.join(', ')}.`
    const modeContext = mode !== 'main' ? `The user is currently in ${mode} mode.` : ''
    
    // Determine provider based on selected model
    let provider = 'qwen'
    if (selectedModel.startsWith('gpt-')) {
      provider = 'openai'
    } else if (selectedModel.startsWith('claude-')) {
      provider = 'anthropic'
    } else if (selectedModel.startsWith('gemini-')) {
      provider = 'google'
    }
    
    sendMessage(message, {
      context: {
        provider: provider,
        model: selectedModel,
        personality: personalityContext,
        mode: modeContext
      }
    })
  }

  const getQuickQuestions = () => {
    switch (mode) {
      case 'writing-helper':
        return [
          "🆕 What's new in Writing Helper v1.2?",
          "✨ How do I use Generate Versions?",
          "🎨 What are Creative Control Levels?",
          "How do I use AI writing continuation?"
        ]
      case 'report-helper':
        return [
          "🆕 What's new in Report Helper v1.2?",
          "🎓 How do Academic Enhancements work?",
          "How do I start a scientific report?",
          "Can you help me create charts?"
        ]
      case 'anime-chara-helper':
        return [
          "🆕 What's amazing in v1.2 Character Creation?",
          "🎨 How does the AI Color Assistant work?",
          "📚 What is the Character Library?",
          "🖌️ What are the new specialized brushes?"
        ]
      default:
        return [
          "🆕 What's new in Yumi-Series v1.2?",
          "🎨 What are Creative Control Levels?",
          "👤 How do Yumi personalities help me?",
          "Which mode should I use for my project?"
        ]
    }
  }

  const renderFloatingIcon = () => (
    <div className="floating-ai-icon" onClick={() => setIsMinimized(false)}>
      <img 
        src="/references/yumi-6.png" 
        alt={currentPersonality.name}
        className="yumi-avatar"
      />
      <div className="floating-tooltip">
        <span>Chat with {currentPersonality.name}</span>
      </div>
    </div>
  )

  const renderChat = () => (
    <div className="chat-container">
      <div className="chat-header">
        <div className="chat-header-main">
          <h4>Chat with {currentPersonality.name}</h4>
          <p>Current Model: <span className={`model-badge ${MODELS[selectedModel as keyof typeof MODELS]?.type}`}>
            {MODELS[selectedModel as keyof typeof MODELS]?.name} ({MODELS[selectedModel as keyof typeof MODELS]?.type === 'free' ? 'Free' : 'Paid'})
          </span></p>
        </div>
        <div className="personality-display">
          <img 
            src="/references/yumi-6.png" 
            alt={currentPersonality.name}
            className="yumi-avatar-large"
          />
          <div className="personality-info">
            <span className="personality-name">{currentPersonality.name}</span>
            <span className="personality-desc">{currentPersonality.description}</span>
          </div>
        </div>
      </div>
      
      <div className="chat-window">
        {messages.length === 0 && (
          <div className="chat-welcome">
            <img 
              src="/references/yumi-6.png" 
              alt={currentPersonality.name}
              className="yumi-avatar-welcome"
            />
            <h4>Hello! I'm {currentPersonality.name}</h4>
            <p>{currentPersonality.description}</p>
            <p className="personality-traits">
              {currentPersonality.traits.join(' • ')}
            </p>
            <div className="v12-hint">
              <span className="hint-label">💫 v1.2 Secret:</span>
              <span className="hint-text">{currentPersonality.v12Hint}</span>
            </div>
            <div className="quick-questions">
              {getQuickQuestions().map((question, index) => (
                <button key={index} onClick={() => handleSendMessage(question)}>
                  {question}
                </button>
              ))}
            </div>
          </div>
        )}
        
        {messages.map((msg, i) => (
          <div key={i} className={`chat-message ${msg.role}`}>
            <div className="message-content">{msg.content}</div>
          </div>
        ))}
        
        {isLoading && (
          <div className="chat-message assistant">
            <div className="typing-indicator">
              <span></span><span></span><span></span>
            </div>
          </div>
        )}
      </div>

      <div className="chat-input">
        <input
          type="text"
          placeholder={`Ask ${currentPersonality.name} anything...`}
          onKeyPress={e => {
            if (e.key === 'Enter') {
              const input = e.currentTarget
              if (input.value.trim()) {
                handleSendMessage(input.value)
                input.value = ''
              }
            }
          }}
        />
        <button onClick={() => {
          const input = document.querySelector('.chat-input input') as HTMLInputElement
          if (input.value.trim()) {
            handleSendMessage(input.value)
            input.value = ''
          }
        }}>
          Send
        </button>
      </div>
    </div>
  )

  const renderPersonality = () => (
    <div className="personality-container">
      <div className="personality-header">
        <h4>Choose Yumi's Personality</h4>
        <p>Select how you'd like Yumi to interact with you</p>
      </div>
      
      <div className="personality-grid">
        {Object.entries(YUMI_PERSONALITIES).map(([key, personality]) => (
          <div 
            key={key} 
            className={`personality-card ${selectedPersonality === key ? 'selected' : ''}`}
            onClick={() => setSelectedPersonality(key)}
          >
            <div className="personality-emoji-card">{personality.emoji}</div>
            <h5>{personality.name}</h5>
            <p>{personality.description}</p>
            <div className="personality-traits-preview">
              {personality.traits.slice(0, 2).map((trait, i) => (
                <span key={i} className="trait-tag">{trait}</span>
              ))}
            </div>
          </div>
        ))}
      </div>
      
      <div className="personality-preview">
        <h5>Selected: {currentPersonality.name}</h5>
        <p>{currentPersonality.description}</p>
        <div className="traits-full">
          {currentPersonality.traits.map((trait, i) => (
            <span key={i} className="trait-full">{trait}</span>
          ))}
        </div>
      </div>
    </div>
  )

  const renderFAQ = () => (
    <div className="faq-container">
      <div className="faq-categories">
        <button 
          className={selectedFAQCategory === 'writing-helper' ? 'active' : ''}
          onClick={() => setSelectedFAQCategory('writing-helper')}
        >
          ✍️ Writing Helper
        </button>
        <button 
          className={selectedFAQCategory === 'report-helper' ? 'active' : ''}
          onClick={() => setSelectedFAQCategory('report-helper')}
        >
          📊 Report Helper
        </button>
        <button 
          className={selectedFAQCategory === 'anime-chara-helper' ? 'active' : ''}
          onClick={() => setSelectedFAQCategory('anime-chara-helper')}
        >
          🎨 Anime Character
        </button>
        <button 
          className={selectedFAQCategory === 'models' ? 'active' : ''}
          onClick={() => setSelectedFAQCategory('models')}
        >
          🤖 AI Models
        </button>
      </div>
      
      <div className="faq-content">
        {FAQ_DATA[selectedFAQCategory as keyof typeof FAQ_DATA]?.map((faq, index) => (
          <div key={index} className={`faq-item ${faq.isNew ? 'new-feature' : ''}`}>
            <div className="faq-question">
              {faq.q}
              {faq.isNew && <span className="new-badge">NEW!</span>}
            </div>
            <div className="faq-answer">{faq.a}</div>
          </div>
        ))}
      </div>
    </div>
  )

  const renderModels = () => (
    <div className="models-container">
      <div className="models-header">
        <h4>Available AI Models</h4>
        <p>Choose the best model for your needs</p>
      </div>
      
      <div className="models-list">
        {Object.entries(MODELS).map(([key, model]) => (
          <div key={key} className={`model-card ${model.type} ${selectedModel === key ? 'selected' : ''}`}>
            <div className="model-header">
              <h5>{model.name}</h5>
              <span className={`model-type ${model.type}`}>
                {model.type === 'free' ? '🆓 Free' : '💎 Premium'}
              </span>
            </div>
            
            <p className="model-description">{model.description}</p>
            
            <div className="model-strengths">
              <h6>Strengths:</h6>
              <ul>
                {model.strengths.map((strength, i) => (
                  <li key={i}>{strength}</li>
                ))}
              </ul>
            </div>
            
            <div className="model-recommended">
              <h6>Best for:</h6>
              <div className="recommended-tags">
                {model.recommended.map((rec, i) => (
                  <span key={i} className="rec-tag">{rec}</span>
                ))}
              </div>
            </div>
            
            <button 
              className={`select-model-btn ${selectedModel === key ? 'selected' : ''}`}
              onClick={() => setSelectedModel(key)}
              disabled={selectedModel === key}
            >
              {selectedModel === key ? 'Current Model' : 'Select Model'}
            </button>
          </div>
        ))}
      </div>
      
      <div className="model-recommendation">
        <div className="rec-icon">💡</div>
        <div className="rec-content">
          <h5>Recommendation</h5>
          <p>Start with <strong>Qwen-Turbo</strong> for free usage. Upgrade to premium models for advanced features and higher quality outputs.</p>
        </div>
      </div>
    </div>
  )

  const getAvailableTabs = () => {
    const baseTabs = [
      { id: 'chat', label: 'Core' },
      { id: 'faq', label: 'Tutorial' },
      { id: 'models', label: 'Models' },
      { id: 'personality', label: 'Personality' }
    ];

    if (selectedPersonality === 'teacher') {
      baseTabs.push({ id: 'japanese', label: '日本語レッスン' });
    }

    if (selectedPersonality === 'otaku') {
      baseTabs.push({ id: 'anime', label: 'Anime-トリビア' });
    }

    return baseTabs;
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'chat':
        return renderChat();
      case 'faq':
        return renderFAQ();
      case 'models':
        return renderModels();
      case 'personality':
        return renderPersonality();
      case 'japanese':
        return <SenseiPanel />;
      case 'anime':
        return <OtakuPanel />;
      default:
        return renderChat();
    }
  };

  const handleBack = () => {
    navigate('/')
  }

  if (!isOpen) return null;
  if (isMinimized) return renderFloatingIcon();

  return (
    <div className="ai-assistant-overlay">
      <div className="ai-assistant">
        <div className="ai-header">
          <div className="header-content">
            <h3>{currentPersonality.emoji} {currentPersonality.name}</h3>
            <p>Your helpful AI assistant</p>
          </div>
          <div className="header-controls">
            {floatingMode && (
              <button 
                className="minimize-btn" 
                onClick={() => setIsMinimized(true)}
                title="Minimize"
              >
                ➖
              </button>
            )}
            <button 
              className="back-btn" 
              onClick={handleBack}
              title="Go Back"
            >
              ⬅️
            </button>
            {onClose && (
              <button className="close-btn" onClick={onClose}>×</button>
            )}
          </div>
        </div>

        <div className="ai-tabs">
          {getAvailableTabs().map(tab => (
            <button
              key={tab.id}
              className={`tab-button ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div className="ai-content">
          {renderContent()}
        </div>
      </div>
    </div>
  )
} 