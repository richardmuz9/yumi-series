// API utility function for making authenticated requests
const directApiCall = async (url: string, options: RequestInit = {}) => {
  const baseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
  
  const response = await fetch(`${baseUrl}${url}`, {
    headers: {
      'Content-Type': 'application/json',
      ...options.headers
    },
    credentials: 'include',
    ...options
  })

  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`)
  }

  return response.json()
}

// Types
export interface EJUScores {
  math2?: number
  science?: number
  japanese?: number
  physics?: number
  chemistry?: number
  biology?: number
}

export interface StudyProfile {
  targetUniversity: string
  preferredMajor: string
  ejuScores: EJUScores
  jlptLevel: string
  studyTimeAvailable: number
  targetAdmissionYear: string
  currentGrade?: string
  studyLocation?: string
  budgetRange?: string
  personalityType?: string
}

export interface UniversityRecommendation {
  id: string
  name: string
  nameJapanese: string
  region: string
  type: string
  matchPercentage: number
  recommendation: string
  gapAnalysis: string[]
  major: {
    borderlineEJU: EJUScores
    difficulty: 'Reach' | 'Target' | 'Safety'
    examType: string
    tuitionRange: string
    applicationUrl: string
  }
}

export interface StudyPlan {
  totalWeeks: number
  weeklyHours: number
  subjects: SubjectPlan[]
  milestones: Milestone[]
  dailySchedule: DailySchedule[]
}

export interface SubjectPlan {
  subject: string
  currentScore: number
  targetScore: number
  hoursNeeded: number
  priority: 'High' | 'Medium' | 'Low'
  strategies: string[]
  resources: Resource[]
}

export interface Milestone {
  week: number
  title: string
  description: string
  targetScores: EJUScores
}

export interface DailySchedule {
  day: string
  schedule: ScheduleItem[]
}

export interface ScheduleItem {
  time: string
  subject: string
  activity: string
  duration: number
}

export interface Resource {
  type: 'textbook' | 'app' | 'website' | 'video'
  title: string
  description: string
  url?: string
  price?: string
}

export interface StudySession {
  id: string
  subject: string
  duration: number
  date: string
  notes: string
  scoreImprovement?: number
  mood: 'excellent' | 'good' | 'okay' | 'difficult'
}

export interface ProgressData {
  totalStudyHours: number
  weeklyGoal: number
  currentWeekHours: number
  subjectProgress: Record<string, SubjectProgress>
  recentSessions: StudySession[]
  achievements: Achievement[]
}

export interface SubjectProgress {
  subject: string
  currentScore: number
  targetScore: number
  hoursSpent: number
  improvement: number
  trend: 'improving' | 'stable' | 'declining'
}

export interface Achievement {
  id: string
  title: string
  description: string
  icon: string
  unlockedAt: string
}

export interface InterviewQuestion {
  id: string
  category: 'motivation' | 'academic' | 'personal' | 'future'
  question: string
  tips: string[]
  sampleAnswer?: string
}

export interface InterviewFeedback {
  overallScore: number
  strengths: string[]
  improvements: string[]
  detailedFeedback: Record<string, string>
  suggestedPractice: string[]
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
  context?: any
}

// API Functions
export class StudyAdvisorService {
  
  // University Recommendations
  static async getUniversityRecommendations(profile: StudyProfile): Promise<{
    recommendations: UniversityRecommendation[]
    studyPlan: StudyPlan
    analysis: any
  }> {
    return directApiCall('/api/study-advisor/recommendations', {
      method: 'POST',
      body: JSON.stringify({ profile })
    })
  }

  // Study Plan Generation
  static async generateStudyPlan(profile: StudyProfile, preferences: {
    focusAreas?: string[]
    learningStyle?: string
    schedule?: string
  }): Promise<StudyPlan> {
    return directApiCall('/api/study-advisor/study-plan', {
      method: 'POST', 
      body: JSON.stringify({ profile, preferences })
    })
  }

  // Progress Tracking
  static async getStudyProgress(): Promise<ProgressData> {
    return directApiCall('/api/study-advisor/progress')
  }

  static async logStudySession(session: Omit<StudySession, 'id'>): Promise<{ success: boolean }> {
    return directApiCall('/api/study-advisor/log-session', {
      method: 'POST',
      body: JSON.stringify(session)
    })
  }

  static async updateScores(scores: EJUScores): Promise<{ success: boolean }> {
    return directApiCall('/api/study-advisor/update-scores', {
      method: 'POST',
      body: JSON.stringify({ scores })
    })
  }

  // Textbook Recommendations
  static async getTextbookRecommendations(profile: StudyProfile, subject?: string): Promise<Resource[]> {
    const params = new URLSearchParams()
    if (subject) params.append('subject', subject)
    
    return directApiCall(`/api/study-advisor/textbooks?${params}`, {
      method: 'POST',
      body: JSON.stringify({ profile })
    })
  }

  // Mock Interview
  static async getInterviewQuestions(major: string, difficulty: string = 'medium'): Promise<InterviewQuestion[]> {
    return directApiCall(`/api/study-advisor/interview-questions?major=${major}&difficulty=${difficulty}`)
  }

  static async submitInterviewAnswers(answers: Record<string, string>): Promise<InterviewFeedback> {
    return directApiCall('/api/study-advisor/interview-feedback', {
      method: 'POST',
      body: JSON.stringify({ answers })
    })
  }

  // AI Chat Advisor
  static async chatWithAdvisor(messages: ChatMessage[], context?: any): Promise<{ 
    response: string
    suggestions?: string[]
    resources?: Resource[]
  }> {
    return directApiCall('/api/study-advisor/chat', {
      method: 'POST',
      body: JSON.stringify({ messages, context })
    })
  }

  // Motivation & Wellness
  static async getMotivationalContent(): Promise<{
    quote: string
    tip: string
    successStory: string
  }> {
    return directApiCall('/api/study-advisor/motivation')
  }

  static async getStressManagementTips(): Promise<{
    tips: string[]
    exercises: string[]
    resources: Resource[]
  }> {
    return directApiCall('/api/study-advisor/wellness')
  }

  // Analytics
  static async getDetailedAnalytics(): Promise<{
    timeDistribution: Record<string, number>
    performanceTrends: any[]
    predictions: any
    recommendations: string[]
  }> {
    return directApiCall('/api/study-advisor/analytics')
  }

  // Profile Management
  static async saveProfile(profile: StudyProfile): Promise<{ success: boolean }> {
    return directApiCall('/api/study-advisor/profile', {
      method: 'POST',
      body: JSON.stringify(profile)
    })
  }

  static async getProfile(): Promise<StudyProfile | null> {
    return directApiCall('/api/study-advisor/profile')
  }

  // University Information
  static async getUniversityDetails(universityId: string): Promise<any> {
    return directApiCall(`/api/study-advisor/university/${universityId}`)
  }

  static async searchUniversities(query: string, filters?: any): Promise<any[]> {
    const params = new URLSearchParams({ query })
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value) params.append(key, String(value))
      })
    }
    
    return directApiCall(`/api/study-advisor/search-universities?${params}`)
  }

  // Smart Scheduling
  static async optimizeSchedule(constraints: {
    availableHours: number
    subjectPriorities: Record<string, number>
    preferences: any
  }): Promise<DailySchedule[]> {
    return directApiCall('/api/study-advisor/optimize-schedule', {
      method: 'POST',
      body: JSON.stringify(constraints)
    })
  }

  // Exam Preparation
  static async generatePracticeTest(subject: string, difficulty: string): Promise<{
    questions: any[]
    timeLimit: number
    instructions: string
  }> {
    return directApiCall(`/api/study-advisor/practice-test?subject=${subject}&difficulty=${difficulty}`)
  }

  static async submitPracticeTest(answers: any[], testId: string): Promise<{
    score: number
    breakdown: any
    recommendations: string[]
  }> {
    return directApiCall('/api/study-advisor/submit-test', {
      method: 'POST',
      body: JSON.stringify({ answers, testId })
    })
  }
} 