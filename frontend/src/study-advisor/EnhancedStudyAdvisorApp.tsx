import React, { useState, useEffect, useCallback } from 'react'
import { StudyAdvisorService, StudyProfile, UniversityRecommendation, StudyPlan, ProgressData, ChatMessage, InterviewQuestion, InterviewFeedback } from '../services/studyAdvisorApi'
import studyAdvisorData from '../data/studyAdvisorData.json'
import './EnhancedStudyAdvisor.css'

interface EnhancedStudyAdvisorAppProps {
  onComplete?: (data: any) => void
}

type ViewMode = 'dashboard' | 'profile' | 'recommendations' | 'study-plan' | 'progress' | 'interview' | 'chat' | 'data-center' | 'learning-engine'

// Enhanced interfaces for new features
interface LiveAdmissionsData {
  university: string
  examDates: Date[]
  applicationDeadlines: Date[]
  requiredDocuments: string[]
  scoreRequirements: Record<string, number>
  availableScholarships: string[]
  lastUpdated: Date
}

interface AdaptiveLearningProfile {
  learningStyle: 'visual' | 'auditory' | 'kinesthetic' | 'mixed'
  performanceMetrics: Record<string, number>
  weakAreas: string[]
  strengths: string[]
  recommendedDifficulty: 'beginner' | 'intermediate' | 'advanced'
  studySessionData: StudySession[]
}

interface StudySession {
  subject: string
  duration: number
  accuracy: number
  completedAt: Date
  difficultyLevel: number
}

interface DetailedStudentProfile extends StudyProfile {
  academicBackground: {
    currentEducation: string
    grades: Record<string, string>
    extracurriculars: string[]
    workExperience: string[]
  }
  personalInfo: {
    birthCountry: string
    languagesSpoken: string[]
    hobbies: string[]
    careerGoals: string[]
  }
  preferences: {
    studyEnvironment: 'quiet' | 'collaborative' | 'mixed'
    timeOfDay: 'morning' | 'afternoon' | 'evening' | 'flexible'
    learningPace: 'slow' | 'moderate' | 'fast'
  }
}

interface ControlCenterModule {
  id: string
  title: string
  icon: string
  position: { x: number; y: number }
  size: { width: number; height: number }
  isActive: boolean
  isExpanded: boolean
}

const EnhancedStudyAdvisorApp: React.FC<EnhancedStudyAdvisorAppProps> = ({ onComplete }) => {
  // Core state
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard')
  const [profile, setProfile] = useState<DetailedStudentProfile>({
    targetUniversity: '',
    preferredMajor: 'engineering',
    ejuScores: {},
    jlptLevel: 'N2',
    studyTimeAvailable: 20,
    targetAdmissionYear: '2025',
    academicBackground: {
      currentEducation: '',
      grades: {},
      extracurriculars: [],
      workExperience: []
    },
    personalInfo: {
      birthCountry: '',
      languagesSpoken: [],
      hobbies: [],
      careerGoals: []
    },
    preferences: {
      studyEnvironment: 'mixed',
      timeOfDay: 'flexible',
      learningPace: 'moderate'
    }
  })
  
  // Enhanced features state
  const [liveAdmissionsData, setLiveAdmissionsData] = useState<LiveAdmissionsData[]>([])
  const [adaptiveLearningProfile, setAdaptiveLearningProfile] = useState<AdaptiveLearningProfile | null>(null)
  const [controlCenterModules, setControlCenterModules] = useState<ControlCenterModule[]>([])
  const [currentLanguage, setCurrentLanguage] = useState<string>('en')
  const [isControlCenterActive, setIsControlCenterActive] = useState(false)
  
  // AI-powered features state
  const [recommendations, setRecommendations] = useState<UniversityRecommendation[]>([])
  const [studyPlan, setStudyPlan] = useState<StudyPlan | null>(null)
  const [progressData, setProgressData] = useState<ProgressData | null>(null)
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([])
  const [interviewQuestions, setInterviewQuestions] = useState<InterviewQuestion[]>([])
  const [interviewFeedback, setInterviewFeedback] = useState<InterviewFeedback | null>(null)
  
  // UI state
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [aiInsights, setAiInsights] = useState<string | null>(null)
  const [chatInput, setChatInput] = useState('')
  const [interviewAnswers, setInterviewAnswers] = useState<Record<string, string>>({})

  // Translation system
  const translations_data: Record<string, Record<string, string>> = {
    en: {
      dashboard: 'Dashboard',
      profile: 'Profile',
      universities: 'Universities',
      studyPlan: 'Study Plan',
      progress: 'Progress',
      interview: 'Interview',
      chat: 'AI Advisor',
      dataCenter: 'Live Data',
      learningEngine: 'Adaptive Learning',
      welcomeTitle: 'AI University Advisor',
      welcomeSubtitle: 'Your personalized guide to Japanese university admission'
    },
    ja: {
      dashboard: 'ダッシュボード',
      profile: 'プロフィール', 
      universities: '大学',
      studyPlan: '学習計画',
      progress: '進捗',
      interview: '面接',
      chat: 'AI アドバイザー',
      dataCenter: 'ライブデータ',
      learningEngine: '適応学習',
      welcomeTitle: 'AI大学アドバイザー',
      welcomeSubtitle: '日本の大学入学への個人化されたガイド'
    },
    zh: {
      dashboard: '仪表板',
      profile: '个人资料',
      universities: '大学',
      studyPlan: '学习计划',
      progress: '进展',
      interview: '面试',
      chat: 'AI顾问',
      dataCenter: '实时数据',
      learningEngine: '自适应学习',
      welcomeTitle: 'AI大学顾问',
      welcomeSubtitle: '您的日本大学入学个性化指南'
    },
    ko: {
      dashboard: '대시보드',
      profile: '프로필',
      universities: '대학교',
      studyPlan: '학습 계획',
      progress: '진행 상황',
      interview: '면접',
      chat: 'AI 어드바이저',
      dataCenter: '실시간 데이터',
      learningEngine: '적응형 학습',
      welcomeTitle: 'AI 대학 어드바이저',
      welcomeSubtitle: '일본 대학 입학을 위한 개인화된 가이드'
    }
  }

  // Translate function
  const t = useCallback((key: string) => {
    return translations_data[currentLanguage]?.[key] || translations_data.en[key] || key
  }, [currentLanguage])

  // Load initial data and initialize enhanced features
  useEffect(() => {
    loadProfileAndProgress()
    initializeControlCenter()
    loadLiveAdmissionsData()
    initializeAdaptiveLearning()
    
    // Listen for global language changes
    const handleLanguageChange = (event: CustomEvent) => {
      console.log('🌍 Study Advisor received language change:', event.detail.language)
      setCurrentLanguage(event.detail.language)
      // Reinitialize control center with new language
      setTimeout(() => {
        initializeControlCenter()
      }, 100)
    }
    
    const handleForceRerender = () => {
      console.log('🔄 Study Advisor force re-render triggered')
      // Force component update
      setCurrentLanguage(prev => prev) // Trigger re-render
    }
    
    window.addEventListener('languageChanged', handleLanguageChange as EventListener)
    window.addEventListener('forceRerender', handleForceRerender)
    
    return () => {
      window.removeEventListener('languageChanged', handleLanguageChange as EventListener)
      window.removeEventListener('forceRerender', handleForceRerender)
    }
  }, [])

  // Initialize control center modules
  const initializeControlCenter = () => {
    const modules: ControlCenterModule[] = [
      {
        id: 'dashboard',
        title: t('dashboard'),
        icon: '📊',
        position: { x: 10, y: 10 },
        size: { width: 200, height: 150 },
        isActive: true,
        isExpanded: false
      },
      {
        id: 'profile',
        title: t('profile'),
        icon: '👤',
        position: { x: 220, y: 10 },
        size: { width: 200, height: 150 },
        isActive: true,
        isExpanded: false
      },
      {
        id: 'universities',
        title: t('universities'),
        icon: '🏫',
        position: { x: 430, y: 10 },
        size: { width: 200, height: 150 },
        isActive: true,
        isExpanded: false
      }
    ]
    setControlCenterModules(modules)
  }

  // Load live admissions data
  const loadLiveAdmissionsData = async () => {
    try {
      const mockLiveData: LiveAdmissionsData[] = [
        {
          university: 'University of Tokyo',
          examDates: [new Date('2024-06-15'), new Date('2024-11-15')],
          applicationDeadlines: [new Date('2024-05-01'), new Date('2024-10-01')],
          requiredDocuments: ['EJU Scores', 'High School Transcripts', 'Personal Statement'],
          scoreRequirements: { math2: 170, science: 160, japanese: 320 },
          availableScholarships: ['MEXT', 'Todai Fellowship'],
          lastUpdated: new Date()
        }
      ]
      setLiveAdmissionsData(mockLiveData)
    } catch (error) {
      console.error('Failed to load live admissions data:', error)
    }
  }

  // Initialize adaptive learning
  const initializeAdaptiveLearning = () => {
    const mockAdaptiveProfile: AdaptiveLearningProfile = {
      learningStyle: 'mixed',
      performanceMetrics: {
        math2: 65,
        science: 70,
        japanese: 60,
        overallProgress: 65
      },
      weakAreas: ['japanese reading', 'advanced calculus'],
      strengths: ['basic chemistry', 'physics mechanics'],
      recommendedDifficulty: 'intermediate',
      studySessionData: []
    }
    setAdaptiveLearningProfile(mockAdaptiveProfile)
  }

  const loadProfileAndProgress = async () => {
    try {
      setLoading(true)
      const [savedProfile, progress] = await Promise.all([
        StudyAdvisorService.getProfile(),
        StudyAdvisorService.getStudyProgress()
      ])
      
      if (savedProfile) {
        // Merge saved profile with enhanced structure, handling type compatibility
        setProfile(prev => ({ 
          ...prev, 
          ...savedProfile,
          academicBackground: (savedProfile as any).academicBackground || prev.academicBackground,
          personalInfo: (savedProfile as any).personalInfo || prev.personalInfo,
          preferences: (savedProfile as any).preferences || prev.preferences
        }))
      }
      setProgressData(progress)
    } catch (err) {
      console.error('Failed to load data:', err)
    } finally {
      setLoading(false)
    }
  }

  // Generate AI recommendations
  const generateRecommendations = async () => {
    try {
      setLoading(true)
      setError(null)
      
      const result = await StudyAdvisorService.getUniversityRecommendations(profile)
      setRecommendations(result.recommendations)
      setStudyPlan(result.studyPlan)
      setAiInsights(result.analysis?.aiInsights || null)
      
      setCurrentView('recommendations')
    } catch (err) {
      setError('Failed to generate recommendations. Please try again.')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  // Chat with AI advisor
  const sendChatMessage = async () => {
    if (!chatInput.trim()) return

    const newMessage: ChatMessage = {
      role: 'user',
      content: chatInput,
      timestamp: new Date().toISOString()
    }

    const updatedMessages = [...chatMessages, newMessage]
    setChatMessages(updatedMessages)
    setChatInput('')

    try {
      const response = await StudyAdvisorService.chatWithAdvisor(updatedMessages, {
        profile,
        currentScores: profile.ejuScores,
        targetMajor: profile.preferredMajor
      })

      const aiMessage: ChatMessage = {
        role: 'assistant',
        content: response.response,
        timestamp: new Date().toISOString()
      }

      setChatMessages([...updatedMessages, aiMessage])
    } catch (err) {
      console.error('Chat error:', err)
    }
  }

  // Load interview questions
  const loadInterviewQuestions = async () => {
    try {
      setLoading(true)
      const questions = await StudyAdvisorService.getInterviewQuestions(profile.preferredMajor)
      setInterviewQuestions(questions)
      setCurrentView('interview')
    } catch (err) {
      setError('Failed to load interview questions')
    } finally {
      setLoading(false)
    }
  }

  // Submit interview answers
  const submitInterviewAnswers = async () => {
    try {
      setLoading(true)
      const feedback = await StudyAdvisorService.submitInterviewAnswers(interviewAnswers)
      setInterviewFeedback(feedback)
    } catch (err) {
      setError('Failed to get interview feedback')
    } finally {
      setLoading(false)
    }
  }

  // Save profile
  const saveProfile = async () => {
    try {
      await StudyAdvisorService.saveProfile(profile)
      // Show success message
    } catch (err) {
      setError('Failed to save profile')
    }
  }

  // Language switching with reload
  const switchLanguage = async (newLang: string) => {
    setCurrentLanguage(newLang)
    // Reinitialize control center with new language
    initializeControlCenter()
  }

  // Enhanced navigation with control center and language switching
  const renderNavigation = () => (
    <div className="advisor-nav">
      <div className="nav-header">
        <button 
          className={`control-center-toggle ${isControlCenterActive ? 'active' : ''}`}
          onClick={() => setIsControlCenterActive(!isControlCenterActive)}
        >
          🎛️ Control Center
        </button>
        <div className="nav-language">
          <select value={currentLanguage} onChange={(e) => switchLanguage(e.target.value)}>
            <option value="en">🇺🇸 EN</option>
            <option value="ja">🇯🇵 JA</option>
            <option value="zh">🇨🇳 ZH</option>
            <option value="ko">🇰🇷 KO</option>
          </select>
        </div>
      </div>
      
      {!isControlCenterActive && (
        <div className="nav-tabs">
          {[
            { id: 'dashboard', icon: '📊', label: t('dashboard') },
            { id: 'profile', icon: '👤', label: t('profile') },
            { id: 'recommendations', icon: '🏫', label: t('universities') },
            { id: 'study-plan', icon: '📅', label: t('studyPlan') },
            { id: 'progress', icon: '📈', label: t('progress') },
            { id: 'interview', icon: '🎤', label: t('interview') },
            { id: 'chat', icon: '💬', label: t('chat') },
            { id: 'data-center', icon: '🌐', label: t('dataCenter') },
            { id: 'learning-engine', icon: '🧠', label: t('learningEngine') }
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setCurrentView(tab.id as ViewMode)}
              className={`nav-tab ${currentView === tab.id ? 'active' : ''}`}
            >
              <span className="tab-icon">{tab.icon}</span>
              <span className="tab-label">{tab.label}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  )

  // Enhanced dashboard with live data integration
  const renderDashboard = () => (
    <div className="dashboard-view">
      <div className="dashboard-header">
        <h1>🎓 {t('welcomeTitle')}</h1>
        <p>{t('welcomeSubtitle')}</p>
      </div>

      <div className="dashboard-cards">
        <div className="dashboard-card enhanced">
          <h3>📋 Profile Status</h3>
          <p>{profile.ejuScores.math2 ? 'Complete' : 'Incomplete'}</p>
          <div className="card-metrics">
            <span>📊 Completion: {Object.keys(profile.ejuScores).length * 33}%</span>
            <span>🎯 Adaptive Score: {adaptiveLearningProfile?.performanceMetrics.overallProgress || 0}%</span>
          </div>
          <button onClick={() => setCurrentView('profile')} className="card-action">
            {profile.ejuScores.math2 ? 'Update Profile' : 'Complete Profile'}
          </button>
        </div>

        <div className="dashboard-card enhanced">
          <h3>🏫 University Match</h3>
          <p>{recommendations.length} AI recommendations</p>
          <div className="card-metrics">
            <span>🌐 Live data: {liveAdmissionsData.length} universities</span>
            <span>⏰ Next deadline: {liveAdmissionsData[0]?.applicationDeadlines[0]?.toLocaleDateString()}</span>
          </div>
          <button onClick={generateRecommendations} className="card-action" disabled={loading}>
            {loading ? 'Analyzing...' : 'Get AI Recommendations'}
          </button>
        </div>

        <div className="dashboard-card">
          <h3>📚 Study Progress</h3>
          <p>{progressData?.totalStudyHours || 0} hours logged</p>
          <button onClick={() => setCurrentView('progress')} className="card-action">
            View Progress
          </button>
        </div>

        <div className="dashboard-card">
          <h3>💬 AI Advisor</h3>
          <p>Get instant study advice</p>
          <button onClick={() => setCurrentView('chat')} className="card-action">
            Start Chat
          </button>
        </div>
      </div>

      {aiInsights && (
        <div className="ai-insights-card">
          <h3>🤖 AI Insights</h3>
          <div className="insights-content">
            {aiInsights}
          </div>
        </div>
      )}
    </div>
  )

  // Render profile form
  const renderProfile = () => (
    <div className="profile-view">
      <h2>📋 Student Profile</h2>
      
      <div className="profile-form">
        <div className="form-section">
          <h3>Academic Information</h3>
          <div className="form-grid">
            <div className="form-group">
              <label>Preferred Major</label>
              <select 
                value={profile.preferredMajor}
                onChange={(e) => setProfile({...profile, preferredMajor: e.target.value})}
              >
                {studyAdvisorData.majorOptions.map(option => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label>Target Admission Year</label>
              <select 
                value={profile.targetAdmissionYear}
                onChange={(e) => setProfile({...profile, targetAdmissionYear: e.target.value})}
              >
                <option value="2025">2025</option>
                <option value="2026">2026</option>
                <option value="2027">2027</option>
              </select>
            </div>
          </div>
        </div>

        <div className="form-section">
          <h3>EJU Scores</h3>
          <div className="scores-grid">
            {Object.entries(studyAdvisorData.ejuScoreRanges).map(([subject, range]) => (
              <div key={subject} className="score-group">
                <label>{subject.charAt(0).toUpperCase() + subject.slice(1)}</label>
                <input 
                  type="number"
                  min={range.min}
                  max={range.max}
                  placeholder={`${range.min}-${range.max}`}
                  value={profile.ejuScores[subject as keyof typeof profile.ejuScores] || ''}
                  onChange={(e) => setProfile({
                    ...profile, 
                    ejuScores: {
                      ...profile.ejuScores, 
                      [subject]: e.target.value ? Number(e.target.value) : undefined
                    }
                  })}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="form-section">
          <h3>Study Preferences</h3>
          <div className="form-group">
            <label>Study Time Available (hours/week)</label>
            <input 
              type="range"
              min={studyAdvisorData.studyTimeRange.min}
              max={studyAdvisorData.studyTimeRange.max}
              value={profile.studyTimeAvailable}
              onChange={(e) => setProfile({...profile, studyTimeAvailable: Number(e.target.value)})}
            />
            <span className="range-value">{profile.studyTimeAvailable} hours/week</span>
          </div>
        </div>

        <button onClick={saveProfile} className="save-profile-btn">
          💾 Save Profile
        </button>
      </div>
    </div>
  )

  // Render university recommendations
  const renderRecommendations = () => (
    <div className="recommendations-view">
      <h2>🏫 University Recommendations</h2>
      
      {recommendations.length === 0 ? (
        <div className="no-recommendations">
          <p>Generate AI recommendations to see university matches!</p>
          <button onClick={generateRecommendations} className="generate-btn" disabled={loading}>
            {loading ? 'Analyzing...' : '🔍 Generate Recommendations'}
          </button>
        </div>
      ) : (
        <div className="recommendations-grid">
          {recommendations.map((rec, index) => (
            <div key={index} className={`university-card ${rec.major.difficulty.toLowerCase()}`}>
              <div className="university-header">
                <div className="university-info">
                  <h4>{rec.name}</h4>
                  <p className="japanese-name">{rec.nameJapanese}</p>
                  <span className={`difficulty-badge ${rec.major.difficulty.toLowerCase()}`}>
                    {rec.major.difficulty}
                  </span>
                </div>
                <div className="match-percentage">
                  <div className="percentage">{rec.matchPercentage}%</div>
                  <div className="match-label">Match</div>
                </div>
              </div>
              
              <p className="recommendation">{rec.recommendation}</p>
              
              {rec.gapAnalysis.length > 0 && (
                <div className="gap-analysis">
                  <h5>📊 Score Gaps</h5>
                  <ul>
                    {rec.gapAnalysis.map((gap, i) => (
                      <li key={i}>{gap}</li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="university-details">
                <div className="detail-item">
                  <strong>Exam:</strong> {rec.major.examType}
                </div>
                <div className="detail-item">
                  <strong>Tuition:</strong> {rec.major.tuitionRange}
                </div>
                <div className="detail-item">
                  <strong>Region:</strong> {rec.region}
                </div>
              </div>

              <a 
                href={rec.major.applicationUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                className="application-link"
              >
                📝 Application Info
              </a>
            </div>
          ))}
        </div>
      )}
    </div>
  )

  // Render study plan
  const renderStudyPlan = () => (
    <div className="study-plan-view">
      <h2>📅 AI Study Plan</h2>
      
      {!studyPlan ? (
        <div className="no-plan">
          <p>Generate recommendations first to get your personalized study plan!</p>
          <button onClick={generateRecommendations} className="generate-btn">
            🔍 Generate Study Plan
          </button>
        </div>
      ) : (
        <div className="study-plan-content">
          <div className="plan-overview">
            <div className="overview-stats">
              <div className="stat-card">
                <h4>{studyPlan.totalWeeks}</h4>
                <p>Weeks</p>
              </div>
              <div className="stat-card">
                <h4>{studyPlan.weeklyHours}</h4>
                <p>Hours/Week</p>
              </div>
              <div className="stat-card">
                <h4>{studyPlan.subjects.length}</h4>
                <p>Subjects</p>
              </div>
            </div>
          </div>

          <div className="subjects-section">
            <h3>📚 Subject Plans</h3>
            <div className="subjects-grid">
              {studyPlan.subjects.map((subject, index) => (
                <div key={index} className={`subject-card priority-${subject.priority.toLowerCase()}`}>
                  <h4>{subject.subject}</h4>
                  <div className="score-progress">
                    <span>{subject.currentScore} → {subject.targetScore}</span>
                    <div className="priority-badge">{subject.priority} Priority</div>
                  </div>
                  <div className="hours-needed">{subject.hoursNeeded} hours needed</div>
                  
                  <div className="strategies">
                    <h5>Study Strategies:</h5>
                    <ul>
                      {subject.strategies.map((strategy, i) => (
                        <li key={i}>{strategy}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="milestones-section">
            <h3>🎯 Milestones</h3>
            <div className="milestones-timeline">
              {studyPlan.milestones.map((milestone, index) => (
                <div key={index} className="milestone-card">
                  <div className="milestone-week">Week {milestone.week}</div>
                  <h4>{milestone.title}</h4>
                  <p>{milestone.description}</p>
                  <div className="target-scores">
                    {Object.entries(milestone.targetScores).map(([subject, score]) => (
                      <span key={subject} className="score-target">
                        {subject}: {score}
                      </span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )

  // Render progress tracking
  const renderProgress = () => (
    <div className="progress-view">
      <h2>📈 Study Progress</h2>
      
      {!progressData ? (
        <div className="loading">Loading progress...</div>
      ) : (
        <div className="progress-content">
          <div className="progress-stats">
            <div className="stat-card">
              <h4>{progressData.totalStudyHours}</h4>
              <p>Total Hours</p>
            </div>
            <div className="stat-card">
              <h4>{progressData.currentWeekHours}/{progressData.weeklyGoal}</h4>
              <p>This Week</p>
            </div>
            <div className="stat-card">
              <h4>{progressData.achievements.length}</h4>
              <p>Achievements</p>
            </div>
          </div>

          <div className="recent-sessions">
            <h3>📝 Recent Study Sessions</h3>
            {progressData.recentSessions.length === 0 ? (
              <p>No study sessions logged yet. Start studying and log your progress!</p>
            ) : (
              <div className="sessions-list">
                {progressData.recentSessions.map((session, index) => (
                  <div key={session.id || index} className="session-card">
                    <div className="session-header">
                      <h4>{session.subject}</h4>
                      <span className="duration">{session.duration}h</span>
                    </div>
                    <p className="session-notes">{session.notes}</p>
                    <div className="session-date">{new Date(session.date).toLocaleDateString()}</div>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="achievements-section">
            <h3>🏆 Achievements</h3>
            <div className="achievements-grid">
              {progressData.achievements.map((achievement) => (
                <div key={achievement.id} className="achievement-card">
                  <div className="achievement-icon">{achievement.icon}</div>
                  <h4>{achievement.title}</h4>
                  <p>{achievement.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )

  // Render interview practice
  const renderInterview = () => (
    <div className="interview-view">
      <h2>🎤 Mock Interview Practice</h2>
      
      {interviewQuestions.length === 0 ? (
        <div className="no-questions">
          <p>Practice common university admission interview questions!</p>
          <button onClick={loadInterviewQuestions} className="load-questions-btn" disabled={loading}>
            {loading ? 'Loading...' : '📝 Start Interview Practice'}
          </button>
        </div>
      ) : (
        <div className="interview-content">
          {!interviewFeedback ? (
            <div className="questions-section">
              <h3>Answer these questions:</h3>
              {interviewQuestions.map((question, index) => (
                <div key={question.id} className="question-card">
                  <h4>Q{index + 1}: {question.question}</h4>
                  <div className="question-tips">
                    <h5>💡 Tips:</h5>
                    <ul>
                      {question.tips.map((tip, i) => (
                        <li key={i}>{tip}</li>
                      ))}
                    </ul>
                  </div>
                  <textarea
                    placeholder="Your answer..."
                    value={interviewAnswers[question.id] || ''}
                    onChange={(e) => setInterviewAnswers({
                      ...interviewAnswers,
                      [question.id]: e.target.value
                    })}
                    className="answer-input"
                  />
                </div>
              ))}
              <button 
                onClick={submitInterviewAnswers} 
                className="submit-answers-btn"
                disabled={loading || Object.keys(interviewAnswers).length === 0}
              >
                {loading ? 'Analyzing...' : '🤖 Get AI Feedback'}
              </button>
            </div>
          ) : (
            <div className="feedback-section">
              <h3>🎯 Interview Feedback</h3>
              <div className="overall-score">
                <h4>Overall Score: {interviewFeedback.overallScore}/100</h4>
              </div>
              
              <div className="feedback-details">
                <div className="strengths">
                  <h4>✅ Strengths:</h4>
                  <ul>
                    {interviewFeedback.strengths.map((strength, i) => (
                      <li key={i}>{strength}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="improvements">
                  <h4>📈 Areas for Improvement:</h4>
                  <ul>
                    {interviewFeedback.improvements.map((improvement, i) => (
                      <li key={i}>{improvement}</li>
                    ))}
                  </ul>
                </div>
                
                <div className="practice-suggestions">
                  <h4>🎯 Suggested Practice:</h4>
                  <ul>
                    {interviewFeedback.suggestedPractice.map((suggestion, i) => (
                      <li key={i}>{suggestion}</li>
                    ))}
                  </ul>
                </div>
              </div>
              
              <button 
                onClick={() => {
                  setInterviewFeedback(null)
                  setInterviewAnswers({})
                  setInterviewQuestions([])
                }}
                className="retry-btn"
              >
                🔄 Practice Again
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  )

  // Render AI chat
  const renderChat = () => (
    <div className="chat-view">
      <h2>💬 AI Study Advisor</h2>
      
      <div className="chat-container">
        <div className="chat-messages">
          {chatMessages.length === 0 ? (
            <div className="chat-welcome">
              <h3>👋 Welcome to your AI Study Advisor!</h3>
              <p>Ask me anything about:</p>
              <ul>
                <li>University admission strategies</li>
                <li>EJU preparation tips</li>
                <li>Study planning and time management</li>
                <li>Motivation and stress management</li>
              </ul>
            </div>
          ) : (
            chatMessages.map((message, index) => (
              <div key={index} className={`chat-message ${message.role}`}>
                <div className="message-content">
                  {message.content}
                </div>
                <div className="message-time">
                  {new Date(message.timestamp).toLocaleTimeString()}
                </div>
              </div>
            ))
          )}
        </div>
        
        <div className="chat-input-container">
          <input
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
            placeholder="Ask your AI advisor..."
            className="chat-input"
          />
          <button onClick={sendChatMessage} className="send-btn" disabled={!chatInput.trim()}>
            📤
          </button>
        </div>
      </div>
    </div>
  )

  // Enhanced live data center view
  const renderLiveDataCenter = () => (
    <div className="live-data-center">
      <div className="data-header">
        <h2>🌐 {t('dataCenter')}</h2>
        <p>Real-time admissions data from MEXT and universities</p>
      </div>
      
      <div className="data-grid">
        {liveAdmissionsData.map(data => (
          <div key={data.university} className="data-card">
            <h3>{data.university}</h3>
            <div className="data-section">
              <h4>📅 Upcoming Exam Dates</h4>
              <ul>
                {data.examDates.map(date => (
                  <li key={date.toISOString()}>{date.toLocaleDateString()}</li>
                ))}
              </ul>
            </div>
            <div className="data-section">
              <h4>⏰ Application Deadlines</h4>
              <ul>
                {data.applicationDeadlines.map(deadline => (
                  <li key={deadline.toISOString()}>{deadline.toLocaleDateString()}</li>
                ))}
              </ul>
            </div>
            <div className="data-section">
              <h4>📋 Required Documents</h4>
              <ul>
                {data.requiredDocuments.map(doc => (
                  <li key={doc}>{doc}</li>
                ))}
              </ul>
            </div>
            <div className="data-section">
              <h4>🎓 Available Scholarships</h4>
              <ul>
                {data.availableScholarships.map(scholarship => (
                  <li key={scholarship}>{scholarship}</li>
                ))}
              </ul>
            </div>
            <div className="data-footer">
              <small>Last updated: {data.lastUpdated.toLocaleString()}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  )

  // Enhanced adaptive learning engine view
  const renderAdaptiveLearningEngine = () => (
    <div className="adaptive-learning-engine">
      <div className="learning-header">
        <h2>🧠 {t('learningEngine')}</h2>
        <p>AI-powered personalized learning adaptation</p>
      </div>
      
      {adaptiveLearningProfile && (
        <div className="learning-dashboard">
          <div className="learning-metrics">
            <h3>📊 Performance Metrics</h3>
            <div className="metrics-grid">
              {Object.entries(adaptiveLearningProfile.performanceMetrics).map(([subject, score]) => (
                <div key={subject} className="metric-card">
                  <h4>{subject}</h4>
                  <div className="metric-bar">
                    <div className="metric-fill" style={{ width: `${score}%` }}></div>
                  </div>
                  <span>{score}%</span>
                </div>
              ))}
            </div>
          </div>
          
          <div className="learning-analysis">
            <div className="analysis-section">
              <h3>💪 Strengths</h3>
              <ul>
                {adaptiveLearningProfile.strengths.map(strength => (
                  <li key={strength} className="strength-item">✅ {strength}</li>
                ))}
              </ul>
            </div>
            
            <div className="analysis-section">
              <h3>🎯 Areas for Improvement</h3>
              <ul>
                {adaptiveLearningProfile.weakAreas.map(area => (
                  <li key={area} className="weak-area-item">🎯 {area}</li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="learning-recommendations">
            <h3>🚀 AI Recommendations</h3>
            <div className="recommendation-cards">
              <div className="rec-card">
                <h4>📚 Study Style</h4>
                <p>Your learning style: <strong>{adaptiveLearningProfile.learningStyle}</strong></p>
                <p>Recommended approach: Interactive practice with visual aids</p>
              </div>
              <div className="rec-card">
                <h4>⚡ Difficulty Level</h4>
                <p>Current level: <strong>{adaptiveLearningProfile.recommendedDifficulty}</strong></p>
                <p>Next milestone: Focus on weak areas with targeted practice</p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )

  // Enhanced control center UI
  const renderControlCenter = () => (
    <div className={`control-center ${isControlCenterActive ? 'active' : ''}`}>
      <div className="control-center-header">
        <h2>🎛️ Control Center</h2>
        <div className="language-selector">
          <select value={currentLanguage} onChange={(e) => switchLanguage(e.target.value)}>
            <option value="en">🇺🇸 English</option>
            <option value="ja">🇯🇵 日本語</option>
            <option value="zh">🇨🇳 中文</option>
            <option value="ko">🇰🇷 한국어</option>
          </select>
        </div>
      </div>
      
      <div className="modules-container">
        {controlCenterModules.map(module => (
          <div
            key={module.id}
            className={`control-module ${module.isActive ? 'active' : ''} ${module.isExpanded ? 'expanded' : ''}`}
            style={{
              left: module.position.x,
              top: module.position.y,
              width: module.isExpanded ? module.size.width * 2 : module.size.width,
              height: module.isExpanded ? module.size.height * 2 : module.size.height
            }}
            onClick={() => {
              if (module.isExpanded) {
                setCurrentView(module.id as ViewMode)
              } else {
                // Expand module
                const updatedModules = controlCenterModules.map(m =>
                  m.id === module.id ? { ...m, isExpanded: !m.isExpanded } : { ...m, isExpanded: false }
                )
                setControlCenterModules(updatedModules)
              }
            }}
          >
            <div className="module-header">
              <span className="module-icon">{module.icon}</span>
              <span className="module-title">{module.title}</span>
            </div>
            {module.isExpanded && (
              <div className="module-content">
                <p>Click to expand {module.id}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )

  // Main render with enhanced control center
  return (
    <div className="enhanced-study-advisor">
      {renderNavigation()}
      
      {isControlCenterActive && renderControlCenter()}
      
      <div className={`advisor-content ${isControlCenterActive ? 'control-center-active' : ''}`}>
        {error && (
          <div className="error-banner">
            <span>⚠️ {error}</span>
            <button onClick={() => setError(null)}>✕</button>
          </div>
        )}
        
        {currentView === 'dashboard' && renderDashboard()}
        {currentView === 'profile' && renderProfile()}
        {currentView === 'recommendations' && renderRecommendations()}
        {currentView === 'study-plan' && renderStudyPlan()}
        {currentView === 'progress' && renderProgress()}
        {currentView === 'interview' && renderInterview()}
        {currentView === 'chat' && renderChat()}
        {currentView === 'data-center' && renderLiveDataCenter()}
        {currentView === 'learning-engine' && renderAdaptiveLearningEngine()}
      </div>
    </div>
  )
}

export default EnhancedStudyAdvisorApp 