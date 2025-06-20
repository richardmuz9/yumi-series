// StudyAdvisor Module Types and Interfaces

export interface EJUScores {
  math2?: number
  science?: number
  japanese?: number
  physics?: number
  chemistry?: number
  biology?: number
  english?: number
}

export interface StudyProfile {
  targetUniversity: string
  preferredMajor: string
  ejuScores: EJUScores
  currentGrade?: string
  studyHoursPerWeek?: number
  weakSubjects?: string[]
  targetTestDate?: string
  isRetaking?: boolean
}

export interface University {
  id: string
  name: string
  nameJapanese: string
  region: string
  type: 'National' | 'Private' | 'Public'
  majors: { [key: string]: MajorInfo }
}

export interface MajorInfo {
  borderlineEJU: EJUScores
  difficulty: 'Safety' | 'Target' | 'Reach'
  examType: string
  applicationUrl: string
  tuitionRange: string
  scholarships?: string[]
  admissionRate?: number
}

export interface UniversityRecommendation extends University {
  matchPercentage: number
  recommendation: string
  gapAnalysis: string[]
  strengthsAnalysis: string[]
  improvementPlan: string[]
}

export interface StudyPlan {
  subjects: SubjectPlan[]
  totalWeeksUntilTest: number
  weeklySchedule: DailySchedule[]
  milestones: Milestone[]
  recommendedResources: Textbook[]
}

export interface SubjectPlan {
  subject: string
  currentScore: number
  targetScore: number
  pointsNeeded: number
  priority: 'high' | 'medium' | 'low'
  weeklyHours: number
  studyStrategy: string[]
  practice: PracticeSession[]
}

export interface DailySchedule {
  day: string
  sessions: StudySession[]
  totalHours: number
  focus: string
}

export interface StudySession {
  subject: string
  topic: string
  duration: number
  type: 'study' | 'practice' | 'review'
  materials: string[]
}

export interface Milestone {
  week: number
  targetScores: EJUScores
  description: string
  checkpoints: string[]
}

export interface Textbook {
  title: string
  titleJapanese: string
  publisher: string
  price: string
  description: string
  subject: string
  level: 'beginner' | 'intermediate' | 'advanced'
  rating?: number
}

export interface PracticeSession {
  type: 'mock-exam' | 'problem-set' | 'review'
  duration: number
  materials: string[]
  frequency: 'daily' | 'weekly' | 'biweekly'
}

export interface InterviewQuestion {
  id: string
  question: string
  category: 'motivation' | 'academic' | 'personal' | 'future-plans'
  difficulty: 'basic' | 'intermediate' | 'advanced'
  tips: string[]
  sampleAnswers?: string[]
}

export interface InterviewFeedback {
  questionId: string
  userAnswer: string
  rating: number
  feedback: string
  improvements: string[]
  timestamp: string
}

export interface StudyProgressData {
  weeklyProgress: WeeklyProgress[]
  subjectProgress: SubjectProgress[]
  mockTestScores: MockTestScore[]
  studyStreak: number
  totalStudyHours: number
  strengthsAreas: string[]
  improvementAreas: string[]
  nextMilestone: Milestone
}

export interface WeeklyProgress {
  week: string
  hoursStudied: number
  topicsCompleted: number
  practiceTestsCompleted: number
  averageScore: number
}

export interface SubjectProgress {
  subject: string
  currentLevel: number
  targetLevel: number
  progressPercentage: number
  lastStudied: string
  nextReview: string
  weakTopics: string[]
  strongTopics: string[]
}

export interface MockTestScore {
  date: string
  subject: string
  score: number
  maxScore: number
  percentile: number
  timeCompleted: number
  improvements: string[]
}

export interface AIRecommendationRequest {
  profile: StudyProfile
  currentProgress?: StudyProgressData
  preferences?: {
    studyStyle: 'intensive' | 'steady' | 'flexible'
    timeAvailable: number
    focusAreas: string[]
  }
}

export interface ChatMessage {
  role: 'user' | 'assistant'
  content: string
  timestamp: string
}

export interface AdvisorChatRequest {
  message: string
  chatHistory?: ChatMessage[]
  userProfile?: StudyProfile
  context?: string
} 