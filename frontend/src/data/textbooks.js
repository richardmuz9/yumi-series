export const textbooksData = {
  math2: {
    beginner: [
      {
        title: "Basic Math II for EJU",
        titleJapanese: "EJU数学II基礎",
        publisher: "Kawai Publishing",
        price: "1,200 yen",
        description: "Foundation concepts for Math II",
        difficulty: "★★☆☆☆",
        practiceProblems: 200,
        recommended: true
      }
    ],
    intermediate: [
      {
        title: "Thorough Practice Math II",
        titleJapanese: "徹底演習数学II",
        publisher: "Kawai Publishing",
        price: "1,500 yen",
        description: "Comprehensive practice problems for EJU Math II",
        difficulty: "★★★☆☆",
        practiceProblems: 400,
        recommended: true
      },
      {
        title: "EJU Math Practice Collection",
        titleJapanese: "EJU数学実戦問題集",
        publisher: "Obunsha",
        price: "1,800 yen",
        description: "Real exam problems with detailed solutions",
        difficulty: "★★★☆☆",
        practiceProblems: 300
      }
    ]
  },

  japanese: {
    beginner: [
      {
        title: "EJU Japanese Reading Basics",
        titleJapanese: "EJU日本語読解基礎",
        publisher: "3A Corporation",
        price: "1,100 yen",
        isbn: "978-4-88319-777-4",
        description: "Foundation reading skills for academic Japanese",
        difficulty: "★★☆☆☆",
        chapters: ["Basic Reading", "Vocabulary", "Grammar Review"],
        practiceProblems: 100,
        jlptLevel: "N3-N2"
      }
    ],
    intermediate: [
      {
        title: "New Complete Master Reading",
        titleJapanese: "新完全マスター読解",
        publisher: "3A Corporation",
        price: "1,200 yen",
        description: "Reading comprehension for academic Japanese",
        difficulty: "★★★☆☆",
        jlptLevel: "N2-N1",
        recommended: true
      },
      {
        title: "Japanese Summary Collection",
        titleJapanese: "日本語総まとめ",
        publisher: "Ask Publishing",
        price: "1,400 yen",
        description: "Complete review of academic Japanese",
        difficulty: "★★★☆☆"
      }
    ],
    advanced: [
      {
        title: "EJU Japanese Intensive Training",
        titleJapanese: "EJU日本語集中特訓",
        publisher: "Kawai Publishing",
        price: "1,800 yen",
        isbn: "978-4-7772-2223-7",
        description: "Advanced Japanese for top university admission",
        difficulty: "★★★★☆",
        chapters: ["Advanced Reading", "Essay Writing", "Critical Thinking"],
        practiceProblems: 150,
        jlptLevel: "N1+"
      }
    ]
  },

  physics: {
    beginner: [
      {
        title: "Physics Fundamentals for EJU",
        titleJapanese: "EJU物理基礎",
        publisher: "Tokyo Shuppan",
        price: "1,300 yen",
        isbn: "978-4-489-02156-6",
        description: "Basic physics concepts with clear explanations",
        difficulty: "★★☆☆☆",
        chapters: ["Mechanics", "Waves", "Electricity"],
        practiceProblems: 180
      }
    ],
    intermediate: [
      {
        title: "University Entrance Physics Basics",
        titleJapanese: "大学入試物理基礎",
        publisher: "Tokyo Shuppan",
        price: "1,600 yen",
        description: "Fundamental physics concepts for EJU",
        difficulty: "★★★☆☆",
        practiceProblems: 250,
        recommended: true
      },
      {
        title: "EJU Physics Practice Problems",
        titleJapanese: "EJU物理問題演習",
        publisher: "Suken Publishing",
        price: "1,700 yen",
        isbn: "978-4-410-14089-2",
        description: "Extensive problem practice for physics",
        difficulty: "★★★☆☆",
        practiceProblems: 300
      }
    ],
    advanced: [
      {
        title: "Advanced Physics Problem Solving",
        titleJapanese: "物理重要問題集",
        publisher: "Suken Publishing",
        price: "2,000 yen",
        isbn: "978-4-410-14090-8",
        description: "Challenging physics problems for top universities",
        difficulty: "★★★★☆",
        practiceProblems: 200,
        targetUniversities: ["東京大学", "京都大学", "東工大"]
      }
    ]
  },

  chemistry: {
    beginner: [
      {
        title: "Chemistry Basics for EJU",
        titleJapanese: "EJU化学基礎",
        publisher: "Tokyo Shuppan",
        price: "1,200 yen",
        isbn: "978-4-489-02234-1",
        description: "Introduction to chemistry concepts",
        difficulty: "★★☆☆☆",
        chapters: ["Atomic Structure", "Chemical Bonds", "Basic Reactions"],
        practiceProblems: 150
      }
    ],
    intermediate: [
      {
        title: "Chemistry Important Problems",
        titleJapanese: "化学重要問題集",
        publisher: "Suken Publishing",
        price: "1,700 yen",
        description: "Essential chemistry problems collection",
        difficulty: "★★★☆☆",
        practiceProblems: 280,
        recommended: true
      },
      {
        title: "EJU Chemistry Comprehensive Study",
        titleJapanese: "EJU化学総合学習",
        publisher: "Kawai Publishing",
        price: "1,500 yen",
        isbn: "978-4-7772-2189-6",
        description: "Complete chemistry preparation",
        difficulty: "★★★☆☆",
        practiceProblems: 220
      }
    ],
    advanced: [
      {
        title: "Advanced Chemistry Mastery",
        titleJapanese: "化学完全マスター",
        publisher: "Tokyo Shuppan",
        price: "1,900 yen",
        isbn: "978-4-489-02235-8",
        description: "High-level chemistry for competitive exams",
        difficulty: "★★★★☆",
        practiceProblems: 180,
        targetUniversities: ["東京大学", "京都大学", "医学部"]
      }
    ]
  },

  biology: {
    beginner: [
      {
        title: "Biology Fundamentals",
        titleJapanese: "生物基礎",
        publisher: "Tokyo Shuppan",
        price: "1,400 yen",
        isbn: "978-4-489-02167-2",
        description: "Basic biological concepts and processes",
        difficulty: "★★☆☆☆",
        chapters: ["Cell Biology", "Genetics", "Ecology"],
        practiceProblems: 160
      }
    ],
    intermediate: [
      {
        title: "EJU Biology Complete Guide",
        titleJapanese: "EJU生物完全ガイド",
        publisher: "Suken Publishing",
        price: "1,800 yen",
        description: "Comprehensive biology preparation",
        difficulty: "★★★☆☆",
        practiceProblems: 240,
        recommended: true
      }
    ],
    advanced: [
      {
        title: "Advanced Biology Problems",
        titleJapanese: "生物重要問題集",
        publisher: "Suken Publishing",
        price: "1,900 yen",
        isbn: "978-4-410-14092-2",
        description: "Challenging biology problems for medical schools",
        difficulty: "★★★★☆",
        practiceProblems: 200,
        targetUniversities: ["医学部", "薬学部", "獣医学部"]
      }
    ]
  }
};

export const getTextbooksBySubject = (subject, level = 'all') => {
  const subjectBooks = textbooksData[subject];
  if (!subjectBooks) return [];
  
  if (level === 'all') {
    return [...(subjectBooks.beginner || []), ...(subjectBooks.intermediate || []), ...(subjectBooks.advanced || [])];
  }
  
  return subjectBooks[level] || [];
};

export const getRecommendedTextbooks = (subject) => {
  const books = getTextbooksBySubject(subject);
  return books.filter(book => book.recommended);
};

export const getTextbooksByTarget = (targetUniversities) => {
  const allBooks = [];
  Object.values(textbooksData).forEach(subject => {
    Object.values(subject).forEach(level => {
      level.forEach(book => {
        if (book.targetUniversities && book.targetUniversities.some(uni => 
          targetUniversities.some(target => target.includes(uni) || uni.includes(target))
        )) {
          allBooks.push(book);
        }
      });
    });
  });
  return allBooks;
};

export const studyMaterials = {
  onlineResources: [
    {
      name: "JASSO EJU Official Site",
      url: "https://www.jasso.go.jp/ryugaku/study_j/eju/",
      type: "Official",
      description: "Official EJU information and sample questions"
    },
    {
      name: "EJU Past Papers",
      url: "https://www.jasso.go.jp/ryugaku/study_j/eju/examinee/pastexam_question.html",
      type: "Practice",
      description: "Official past examination papers"
    },
    {
      name: "Khan Academy Japanese",
      url: "https://ja.khanacademy.org/",
      type: "Learning",
      description: "Free online courses in mathematics and science"
    }
  ],
  
  studyApps: [
    {
      name: "EJU Practice",
      platform: ["iOS", "Android"],
      price: "Free",
      description: "Practice questions for all EJU subjects"
    },
    {
      name: "Japanese Grammar",
      platform: ["iOS", "Android"],
      price: "500 yen",
      description: "Comprehensive Japanese grammar practice"
    }
  ],

  studyScheduleTemplates: {
    "6months": {
      description: "6-month intensive preparation",
      monthlyGoals: [
        "Month 1-2: Foundation building",
        "Month 3-4: Practice problems",
        "Month 5: Mock tests",
        "Month 6: Final review"
      ],
      weeklyHours: 25
    },
    "1year": {
      description: "1-year comprehensive preparation", 
      monthlyGoals: [
        "Month 1-3: Basic concepts",
        "Month 4-6: Intermediate practice",
        "Month 7-9: Advanced problems",
        "Month 10-12: Test preparation"
      ],
      weeklyHours: 15
    }
  }
}; 