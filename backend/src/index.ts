import { createApp, addHealthCheck, db } from './modules/shared'
import { setupWebBuilderRoutes } from './modules/webbuilder'
import { setupReportWriterRoutes } from './modules/reportwriter'
import { setupPostGeneratorRoutes } from './modules/postgenerator'
import { setupWritingHelperRoutes } from './modules/writinghelper'
import { getAIUniversityRecommendations, chatWithAIAdvisor, getInterviewQuestions, submitInterviewFeedback, getEnhancedStudyProgress, logStudySession, saveStudyProfile, setupStudyAdvisorTables } from './modules/studyadvisor'
import billingRoutes from './modules/billing'
import { setupAnimeCharaHelperRoutes } from './modules/animecharahelper'
import YumiPersonalityManager from './modules/yumiPersonality'
import { authenticateUser, hashPassword, comparePassword, generateToken, AuthRequest } from './auth'

// Initialize database
db.initialize().catch(console.error)

// Create Express app with shared configuration
const app = createApp()
const port = Number(process.env.PORT) || 3000

// Add health check endpoint
addHealthCheck(app)

// Root health check for Railway
app.get('/', (req, res) => {
  res.json({ 
    status: 'OK',
    service: 'Yumi Series Backend',
    timestamp: new Date().toISOString()
  })
})

// Authentication endpoints
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, username, password } = req.body

    if (!email || !username || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email, username, and password are required'
      })
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        error: 'Invalid email format'
      })
    }

    // Validate password strength
    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        error: 'Password must be at least 6 characters long'
      })
    }

    // Check if user already exists
    const existingUserByEmail = await db.getUserByEmail(email)
    if (existingUserByEmail) {
      return res.status(409).json({
        success: false,
        error: 'User with this email already exists'
      })
    }

    // Hash password and create user
    const passwordHash = await hashPassword(password)
    const user = await db.createUser(email, username, passwordHash)

    // Generate token
    const token = generateToken(user.id)

    // Set cookie and return response
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        tokensRemaining: user.tokensRemaining,
        subscriptionStatus: user.subscriptionStatus
      },
      token
    })
  } catch (error) {
    console.error('Signup error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to create account'
    })
  }
})

app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        error: 'Email and password are required'
      })
    }

    // Find user by email
    const user = await db.getUserByEmail(email)
    if (!user) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      })
    }

    // Verify password
    const isPasswordValid = await comparePassword(password, user.passwordHash)
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      })
    }

    // Generate token
    const token = generateToken(user.id)

    // Set cookie and return response
    res.cookie('authToken', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 7 * 24 * 60 * 60 * 1000 // 7 days
    })

    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        tokensRemaining: user.tokensRemaining,
        subscriptionStatus: user.subscriptionStatus
      },
      token
    })
  } catch (error) {
    console.error('Login error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to login'
    })
  }
})

app.post('/api/auth/logout', (req, res) => {
  res.clearCookie('authToken')
  res.json({
    success: true,
    message: 'Logged out successfully'
  })
})

app.get('/api/auth/profile', authenticateUser, async (req: AuthRequest, res) => {
  try {
    const user = req.user!
    res.json({
      success: true,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        tokensRemaining: user.tokensRemaining,
        totalTokensUsed: user.totalTokensUsed,
        freeTokensUsedThisMonth: user.freeTokensUsedThisMonth,
        subscriptionStatus: user.subscriptionStatus,
        createdAt: user.createdAt
      }
    })
  } catch (error) {
    console.error('Profile error:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get profile'
    })
  }
})

// Initialize Yumi Personality Manager
const yumiPersonality = new YumiPersonalityManager()

// Setup module routes
setupWebBuilderRoutes(app)
setupReportWriterRoutes(app)
setupPostGeneratorRoutes(app)
setupWritingHelperRoutes(app)
app.use('/api/billing', billingRoutes)
setupAnimeCharaHelperRoutes(app)

// Setup Study Advisor Routes
app.post('/api/study-advisor/recommendations', getAIUniversityRecommendations)
app.post('/api/study-advisor/chat', chatWithAIAdvisor)
app.get('/api/study-advisor/interview-questions', getInterviewQuestions)
app.post('/api/study-advisor/interview-feedback', submitInterviewFeedback)
app.get('/api/study-advisor/progress', getEnhancedStudyProgress)
app.post('/api/study-advisor/log-session', logStudySession)
app.post('/api/study-advisor/profile', saveStudyProfile)

// Initialize Study Advisor tables
setupStudyAdvisorTables()

// Add Yumi Personality endpoints
app.get('/api/yumi/personalities', authenticateUser, async (req, res) => {
  try {
    const personalities = yumiPersonality.getAvailablePersonalities()
    const personalityDetails = personalities.map(type => ({
      type,
      details: yumiPersonality.getPersonalityDetails(type)
    }))
    
    res.json({
      success: true,
      personalities: personalityDetails
    })
  } catch (error) {
    console.error('Error fetching personalities:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to fetch personalities'
    })
  }
})

app.post('/api/yumi/chat', authenticateUser, async (req, res) => {
  try {
    const { 
      personalityType, 
      message, 
      conversationHistory = [],
      contextualInfo = {}
    } = req.body

    if (!personalityType || !message) {
      return res.status(400).json({
        success: false,
        error: 'Personality type and message are required'
      })
    }

    const response = await yumiPersonality.generatePersonalityResponse(
      personalityType,
      message,
      conversationHistory,
      contextualInfo
    )

    res.json({
      success: true,
      response,
      personality: personalityType
    })
  } catch (error) {
    console.error('Error generating personality response:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to generate response'
    })
  }
})

app.post('/api/yumi/analyze', authenticateUser, async (req, res) => {
  try {
    const { personalityType, message } = req.body

    if (!personalityType || !message) {
      return res.status(400).json({
        success: false,
        error: 'Personality type and message are required'
      })
    }

    const analysis = await yumiPersonality.analyzeMessageForPersonality(
      personalityType,
      message
    )

    res.json({
      success: true,
      analysis
    })
  } catch (error) {
    console.error('Error analyzing message:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to analyze message'
    })
  }
})

app.post('/api/yumi/mood', authenticateUser, async (req, res) => {
  try {
    const { personalityType, contextualInfo = {} } = req.body

    if (!personalityType) {
      return res.status(400).json({
        success: false,
        error: 'Personality type is required'
      })
    }

    const mood = yumiPersonality.getPersonalityMood(personalityType, contextualInfo)

    res.json({
      success: true,
      mood
    })
  } catch (error) {
    console.error('Error getting personality mood:', error)
    res.status(500).json({
      success: false,
      error: 'Failed to get personality mood'
    })
  }
})

app.post('/api/yumi/switch-personality', authenticateUser, async (req, res) => {
  try {
    const { fromPersonality, toPersonality, reason } = req.body

    if (!fromPersonality || !toPersonality) {
      return res.status(400).json({
        success: false,
        error: 'Both personality types are required'
      })
    }

    const transitionMessage = await yumiPersonality.switchPersonality(
      fromPersonality,
      toPersonality,
      reason
    )

    res.json({
      success: true,
      transitionMessage,
      newPersonality: toPersonality
    })
  } catch (error) {
    console.error('Error switching personality:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to switch personality'
    })
  }
})

// AI Website Editor endpoint
app.post('/api/edit-website', authenticateUser, async (req, res) => {
  try {
    const { instructions } = req.body

    if (!instructions || typeof instructions !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Instructions are required'
      })
    }

    const response = await yumiPersonality.processWebsiteEditingInstructions(instructions)

    res.json({
      success: true,
      response
    })
  } catch (error) {
    console.error('Error processing website editing instructions:', error)
    res.status(500).json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to process website editing instructions'
    })
  }
})

// Error handling middleware
app.use((error: any, req: any, res: any, next: any) => {
  console.error('Unhandled error:', error)
  res.status(500).json({ 
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? error.message : undefined
  })
})

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' })
})

// Start server
app.listen(port, '0.0.0.0', () => {
  console.log(`🚀 Yumi Series Backend running on port ${port}`)
  console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`)
  console.log(`🌐 CORS Origins: ${process.env.CORS_ORIGINS || 'all origins'}`)
  console.log(`💡 Available modules: Web Builder, Post Generator, Report Writer, Billing, Anime Character Helper`)
  
  // Log available providers
  try {
    const modelsConfig = JSON.parse(require('fs').readFileSync(require('path').join(__dirname, '../config/models.json'), 'utf8'))
    const enabledProviders = Object.entries(modelsConfig.providers)
      .filter(([_, provider]: [string, any]) => provider.enabled)
      .map(([name, _]: [string, any]) => name)
    
    console.log(`🤖 AI Providers: ${enabledProviders.join(', ')}`)
  } catch (error) {
    console.log(`⚠️  Could not load AI provider information`)
  }
  
  console.log(`🔗 Health check: http://localhost:${port}/api/health`)
}) 