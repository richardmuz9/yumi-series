// StudyAdvisor Module Data and Configuration
import { University, Textbook } from './types'

// University data with comprehensive information
export const universitiesData: University[] = [
  {
    id: 'todai',
    name: "University of Tokyo",
    nameJapanese: "東京大学",
    region: "Tokyo",
    type: "National",
    majors: {
      engineering: {
        borderlineEJU: { math2: 170, science: 160, japanese: 320, physics: 160, chemistry: 155 },
        difficulty: "Reach",
        examType: "EJU + Written + Interview",
        applicationUrl: "https://www.u-tokyo.ac.jp/admissions",
        tuitionRange: "535,800 yen/year"
      },
      medicine: {
        borderlineEJU: { math2: 180, science: 170, japanese: 340, biology: 165, chemistry: 165 },
        difficulty: "Reach", 
        examType: "EJU + Written + Interview + Medical exam",
        applicationUrl: "https://www.u-tokyo.ac.jp/admissions",
        tuitionRange: "535,800 yen/year"
      }
    }
  },
  {
    id: 'kyodai',
    name: "Kyoto University",
    nameJapanese: "京都大学",
    region: "Kyoto",
    type: "National",
    majors: {
      engineering: {
        borderlineEJU: { math2: 165, science: 155, japanese: 310, physics: 155, chemistry: 150 },
        difficulty: "Reach",
        examType: "EJU + Written + Interview",
        applicationUrl: "https://www.kyoto-u.ac.jp/en/admissions",
        tuitionRange: "535,800 yen/year"
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
        borderlineEJU: { math2: 145, science: 140, japanese: 290, physics: 140, chemistry: 135 },
        difficulty: "Target",
        examType: "EJU + Online Interview",
        applicationUrl: "https://www.osaka-u.ac.jp/en/admissions",
        tuitionRange: "535,800 yen/year"
      }
    }
  },
  {
    id: 'hiroshima',
    name: "Hiroshima University",
    nameJapanese: "広島大学", 
    region: "Hiroshima",
    type: "National",
    majors: {
      engineering: {
        borderlineEJU: { math2: 130, science: 125, japanese: 270, physics: 125, chemistry: 120 },
        difficulty: "Safety",
        examType: "EJU + Document Review",
        applicationUrl: "https://www.hiroshima-u.ac.jp/en/admissions",
        tuitionRange: "535,800 yen/year"
      }
    }
  }
];

// Textbook recommendations by subject
export const textbooksData: { [subject: string]: Textbook[] } = {
  math2: [
    {
      title: "Thorough Practice Math II",
      titleJapanese: "徹底演習数学II",
      publisher: "Kawai Publishing",
      price: "1,500 yen",
      description: "Comprehensive practice problems for EJU Math II",
      subject: "math2",
      level: "intermediate"
    }
  ],
  japanese: [
    {
      title: "New Complete Master Reading",
      titleJapanese: "新完全マスター読解", 
      publisher: "3A Corporation",
      price: "1,200 yen",
      description: "Reading comprehension for academic Japanese",
      subject: "japanese",
      level: "intermediate"
    }
  ],
  science: [
    {
      title: "University Entrance Physics Basics",
      titleJapanese: "大学入試物理基礎",
      publisher: "Tokyo Shuppan", 
      price: "1,600 yen",
      description: "Fundamental physics concepts for EJU",
      subject: "physics",
      level: "beginner"
    }
  ]
};

// Study strategies by subject
export const studyStrategies = {
  math2: [
    "Practice calculations daily to improve speed",
    "Master fundamental formulas first",
    "Use graph paper for coordinate geometry"
  ],
  japanese: [
    "Read Japanese news articles daily",
    "Practice writing essays on academic topics",
    "Build vocabulary through flashcards"
  ],
  physics: [
    "Understand concepts before memorizing formulas",
    "Draw diagrams for mechanics problems",
    "Practice unit conversions regularly"
  ]
}; 