import React, { useState, useEffect } from 'react'
import { StudyAdvisorService, StudyProfile, UniversityRecommendation, StudyPlan, ProgressData, ChatMessage, InterviewQuestion, InterviewFeedback } from '../services/studyAdvisorApi'
import studyAdvisorData from '../data/studyAdvisorData.json'
import './EnhancedStudyAdvisor.css'

interface EnhancedStudyAdvisorAppProps {
  onComplete?: (data: any) => void
}

type ViewMode = 'dashboard' | 'profile' | 'recommendations' | 'study-plan' | 'progress' | 'interview' | 'chat'

const EnhancedStudyAdvisorApp: React.FC<EnhancedStudyAdvisorAppProps> = ({ onComplete }) => {
  // Core state
  const [currentView, setCurrentView] = useState<ViewMode>('dashboard')
  const [profile, setProfile] = useState<StudyProfile>({
    targetUniversity: '',
    preferredMajor: 'engineering',
    ejuScores: {},
    jlptLevel: 'N2',
    studyTimeAvailable: 20,
    targetAdmissionYear: '2025'
  })
  
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

  // Load initial data
  useEffect(() => {
    loadProfileAndProgress()
  }, [])

  const loadProfileAndProgress = async () => {
    try {
      setLoading(true)
      const [savedProfile, progress] = await Promise.all([
        StudyAdvisorService.getProfile(),
        StudyAdvisorService.getStudyProgress()
      ])
      
      if (savedProfile) {
        setProfile(savedProfile)
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

  // Render navigation
  const renderNavigation = () => (
    <div className="advisor-nav">
      <div className="nav-tabs">
        {[
          { id: 'dashboard', icon: '📊', label: 'Dashboard' },
          { id: 'profile', icon: '👤', label: 'Profile' },
          { id: 'recommendations', icon: '🏫', label: 'Universities' },
          { id: 'study-plan', icon: '📅', label: 'Study Plan' },
          { id: 'progress', icon: '📈', label: 'Progress' },
          { id: 'interview', icon: '🎤', label: 'Interview' },
          { id: 'chat', icon: '💬', label: 'AI Advisor' }
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
    </div>
  )

  // Render dashboard overview
  const renderDashboard = () => (
    <div className="dashboard-view">
      <div className="dashboard-header">
        <h1>🎓 AI University Advisor</h1>
        <p>Your personalized guide to Japanese university admission</p>
      </div>

      <div className="dashboard-cards">
        <div className="dashboard-card">
          <h3>📋 Profile Status</h3>
          <p>{profile.ejuScores.math2 ? 'Complete' : 'Incomplete'}</p>
          <button onClick={() => setCurrentView('profile')} className="card-action">
            {profile.ejuScores.math2 ? 'Update Profile' : 'Complete Profile'}
          </button>
        </div>

        <div className="dashboard-card">
          <h3>🏫 University Match</h3>
          <p>{recommendations.length} recommendations</p>
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

  // Main render
  return (
    <div className="enhanced-study-advisor">
      {renderNavigation()}
      
      <div className="advisor-content">
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
      </div>
    </div>
  )
}

export default EnhancedStudyAdvisorApp 