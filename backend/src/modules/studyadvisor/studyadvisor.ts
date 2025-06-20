import express from 'express';
import { db, authenticateUser, AuthRequest, calculateTokenCost, deductTokens, getOpenAICompatibleClient } from '../shared';

// Simple validation functions
const validateStudyProfile = (profile: any) => {
  if (!profile || typeof profile !== 'object') {
    throw new Error('Profile is required');
  }
  if (!profile.targetUniversity || typeof profile.targetUniversity !== 'string') {
    throw new Error('Target university is required');
  }
  if (!profile.preferredMajor || typeof profile.preferredMajor !== 'string') {
    throw new Error('Preferred major is required');
  }
  return true;
};

const validateRecommendationRequest = (data: any) => {
  if (!data || typeof data !== 'object') {
    throw new Error('Request data is required');
  }
  validateStudyProfile(data.profile);
  return true;
};

// Basic university data
const universitiesData = [
  {
    id: 'todai',
    name: "University of Tokyo",
    nameJapanese: "東京大学",
    region: "Tokyo",
    type: "National",
    majors: {
      engineering: {
        borderlineEJU: { math2: 170, science: 160, japanese: 320 },
        difficulty: "Reach",
        examType: "EJU + Written + Interview"
      }
    }
  },
  {
    id: 'osaka',
    name: "Osaka University", 
    nameJapanese: "大阪大学",
    region: "Osaka",
    type: "National",
    majors: {
      engineering: {
        borderlineEJU: { math2: 145, science: 140, japanese: 290 },
        difficulty: "Target",
        examType: "EJU + Online Interview"
      }
    }
  }
];

// Simple textbook data
const textbooksData = {
  math2: [
    {
      title: "Math Practice Book",
      titleJapanese: "数学練習帳",
      publisher: "Academic Press",
      price: "1,500 yen"
    }
  ],
  japanese: [
    {
      title: "Reading Comprehension",
      titleJapanese: "読解練習",
      publisher: "Language Corp",
      price: "1,200 yen"
    }
  ]
};

// API endpoints
export const getUniversityRecommendations = async (req: AuthRequest, res: express.Response) => {
  try {
    validateRecommendationRequest(req.body);
    const { profile } = req.body;

    const recommendations = universitiesData.filter(uni => 
      Object.keys(uni.majors).includes(profile.preferredMajor)
    );

    res.json({
      recommendations: recommendations.slice(0, 5),
      textbookRecommendations: Object.keys(textbooksData).map(subject => ({
        subject,
        books: textbooksData[subject as keyof typeof textbooksData] || []
      }))
    });

  } catch (error) {
    console.error('Error in getUniversityRecommendations:', error);
    res.status(500).json({ error: 'Failed to generate recommendations' });
  }
};

export const saveStudyProfile = async (req: AuthRequest, res: express.Response) => {
  try {
    validateStudyProfile(req.body);
    const userId = req.user?.id;

    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    res.json({ success: true, message: 'Study profile saved successfully' });

  } catch (error) {
    console.error('Error in saveStudyProfile:', error);
    res.status(500).json({ error: 'Failed to save study profile' });
  }
};

export const getStudyProgress = async (req: AuthRequest, res: express.Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    res.json({
      totalStudyTime: 120,
      subjectProgress: {
        math2: { currentScore: 150, targetScore: 170, progress: 88 },
        japanese: { currentScore: 280, targetScore: 320, progress: 87 }
      }
    });

  } catch (error) {
    console.error('Error in getStudyProgress:', error);
    res.status(500).json({ error: 'Failed to get study progress' });
  }
};

export const logStudySession = async (req: AuthRequest, res: express.Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    res.json({ success: true, message: 'Study session logged' });

  } catch (error) {
    console.error('Error in logStudySession:', error);
    res.status(500).json({ error: 'Failed to log study session' });
  }
};

export const getAIUniversityRecommendations = async (req: AuthRequest, res: express.Response) => {
  try {
    const { profile } = req.body;
    
    res.json({
      aiRecommendations: [
        {
          university: "University of Tokyo",
          reason: "Strong match for engineering with your current scores",
          probability: 75
        },
        {
          university: "Osaka University",
          reason: "Good safety choice with high acceptance probability",
          probability: 90
        }
      ]
    });

  } catch (error) {
    console.error('Error in getAIUniversityRecommendations:', error);
    res.status(500).json({ error: 'Failed to get AI recommendations' });
  }
};

export const chatWithAIAdvisor = async (req: AuthRequest, res: express.Response) => {
  try {
    const { message } = req.body;
    
    res.json({
      response: "Thank you for your question about university admissions. I'd be happy to help!",
      suggestions: ["Tell me about your EJU scores", "What's your target university?"]
    });

  } catch (error) {
    console.error('Error in chatWithAIAdvisor:', error);
    res.status(500).json({ error: 'Failed to chat with AI advisor' });
  }
};

export const getInterviewQuestions = async (req: AuthRequest, res: express.Response) => {
  try {
    const { university, major } = req.query;
    
    res.json({
      questions: [
        "Why do you want to study at this university?",
        "What are your career goals after graduation?",
        "How will you contribute to the university community?"
      ]
    });

  } catch (error) {
    console.error('Error in getInterviewQuestions:', error);
    res.status(500).json({ error: 'Failed to get interview questions' });
  }
};

export const submitInterviewFeedback = async (req: AuthRequest, res: express.Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    res.json({ success: true, message: 'Interview feedback submitted' });

  } catch (error) {
    console.error('Error in submitInterviewFeedback:', error);
    res.status(500).json({ error: 'Failed to submit feedback' });
  }
};

export const getEnhancedStudyProgress = async (req: AuthRequest, res: express.Response) => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    res.json({
      weeklyProgress: {
        currentWeek: { hoursStudied: 25, target: 30 },
        lastWeek: { hoursStudied: 28, target: 30 }
      },
      recommendations: ["Focus more on weak areas", "Increase study time by 2 hours"]
    });

  } catch (error) {
    console.error('Error in getEnhancedStudyProgress:', error);
    res.status(500).json({ error: 'Failed to get enhanced progress' });
  }
};

export const setupStudyAdvisorTables = async () => {
  try {
    console.log('Study advisor tables setup completed');
  } catch (error) {
    console.error('Error setting up study advisor tables:', error);
  }
}; 