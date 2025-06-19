export const universitiesData = [
  // Imperial Universities (最難関)
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
        tuitionRange: "535,800 yen/year",
        scholarships: ["MEXT", "Todai Fellowship", "Need-based aid"]
      },
      medicine: {
        borderlineEJU: { math2: 180, science: 170, japanese: 340, biology: 165, chemistry: 165 },
        difficulty: "Reach",
        examType: "EJU + Written + Interview + Medical exam",
        applicationUrl: "https://www.u-tokyo.ac.jp/admissions",
        tuitionRange: "535,800 yen/year"
      },
      economics: {
        borderlineEJU: { math2: 165, japanese: 330 },
        difficulty: "Reach",
        examType: "EJU + Written + Interview",
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
      },
      medicine: {
        borderlineEJU: { math2: 175, science: 165, japanese: 320, biology: 160, chemistry: 160 },
        difficulty: "Reach",
        examType: "EJU + Written + Interview + Medical exam",
        applicationUrl: "https://www.kyoto-u.ac.jp/en/admissions",
        tuitionRange: "535,800 yen/year"
      }
    }
  },

  // Top Tier National Universities
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
      },
      medicine: {
        borderlineEJU: { math2: 160, science: 155, japanese: 310, biology: 155, chemistry: 150 },
        difficulty: "Reach",
        examType: "EJU + Written + Interview",
        applicationUrl: "https://www.osaka-u.ac.jp/en/admissions",
        tuitionRange: "535,800 yen/year"
      }
    }
  },

  {
    id: 'tohoku',
    name: "Tohoku University",
    nameJapanese: "東北大学",
    region: "Sendai",
    type: "National",
    majors: {
      engineering: {
        borderlineEJU: { math2: 140, science: 135, japanese: 280, physics: 135, chemistry: 130 },
        difficulty: "Target",
        examType: "EJU + Written Test",
        applicationUrl: "https://www.tohoku.ac.jp/en/admissions",
        tuitionRange: "535,800 yen/year"
      }
    }
  },

  {
    id: 'nagoya',
    name: "Nagoya University",
    nameJapanese: "名古屋大学",
    region: "Nagoya",
    type: "National",
    majors: {
      engineering: {
        borderlineEJU: { math2: 138, science: 133, japanese: 275, physics: 133, chemistry: 128 },
        difficulty: "Target",
        examType: "EJU + Interview",
        applicationUrl: "https://www.nagoya-u.ac.jp/en/admissions",
        tuitionRange: "535,800 yen/year"
      }
    }
  },

  // Regional National Universities (Safety Options)
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
  },

  {
    id: 'okayama',
    name: "Okayama University",
    nameJapanese: "岡山大学",
    region: "Okayama",
    type: "National",
    majors: {
      engineering: {
        borderlineEJU: { math2: 125, science: 120, japanese: 260, physics: 120, chemistry: 115 },
        difficulty: "Safety",
        examType: "EJU + Document Review",
        applicationUrl: "https://www.okayama-u.ac.jp/en/admissions",
        tuitionRange: "535,800 yen/year"
      }
    }
  },

  // Top Private Universities
  {
    id: 'waseda',
    name: "Waseda University",
    nameJapanese: "早稲田大学",
    region: "Tokyo",
    type: "Private",
    majors: {
      engineering: {
        borderlineEJU: { math2: 150, science: 145, japanese: 300, physics: 145, chemistry: 140 },
        difficulty: "Target",
        examType: "EJU + Written + Interview",
        applicationUrl: "https://www.waseda.jp/inst/admission/en/",
        tuitionRange: "1,200,000 yen/year",
        scholarships: ["Waseda University Scholarship", "International Student Support"]
      },
      business: {
        borderlineEJU: { japanese: 320, math2: 140 },
        difficulty: "Target",
        examType: "EJU + Essay + Interview",
        applicationUrl: "https://www.waseda.jp/inst/admission/en/",
        tuitionRange: "1,100,000 yen/year"
      }
    }
  },

  {
    id: 'keio',
    name: "Keio University",
    nameJapanese: "慶應義塾大学",
    region: "Tokyo",
    type: "Private",
    majors: {
      engineering: {
        borderlineEJU: { math2: 155, science: 150, japanese: 310, physics: 150, chemistry: 145 },
        difficulty: "Target",
        examType: "EJU + Written + Interview",
        applicationUrl: "https://www.keio.ac.jp/en/admissions/",
        tuitionRange: "1,300,000 yen/year"
      },
      medicine: {
        borderlineEJU: { math2: 170, science: 165, japanese: 330, biology: 165, chemistry: 160 },
        difficulty: "Reach",
        examType: "EJU + Written + Interview + Medical exam",
        applicationUrl: "https://www.keio.ac.jp/en/admissions/",
        tuitionRange: "3,500,000 yen/year"
      }
    }
  },

  {
    id: 'sophia',
    name: "Sophia University",
    nameJapanese: "上智大学",
    region: "Tokyo",
    type: "Private",
    majors: {
      engineering: {
        borderlineEJU: { math2: 135, science: 130, japanese: 280, physics: 130, chemistry: 125 },
        difficulty: "Target",
        examType: "EJU + Interview",
        applicationUrl: "https://www.sophia.ac.jp/eng/admissions/",
        tuitionRange: "1,100,000 yen/year"
      },
      international: {
        borderlineEJU: { japanese: 290 },
        difficulty: "Target",
        examType: "EJU + Essay + Interview",
        applicationUrl: "https://www.sophia.ac.jp/eng/admissions/",
        tuitionRange: "1,000,000 yen/year"
      }
    }
  },

  // Specialized Universities
  {
    id: 'titech',
    name: "Tokyo Institute of Technology",
    nameJapanese: "東京工業大学",
    region: "Tokyo",
    type: "National",
    majors: {
      engineering: {
        borderlineEJU: { math2: 160, science: 155, japanese: 290, physics: 155, chemistry: 150 },
        difficulty: "Reach",
        examType: "EJU + Written + Interview",
        applicationUrl: "https://www.titech.ac.jp/english/admissions",
        tuitionRange: "535,800 yen/year",
        specialties: ["AI", "Robotics", "Materials Science"]
      }
    }
  },

  {
    id: 'hitotsubashi',
    name: "Hitotsubashi University",
    nameJapanese: "一橋大学",
    region: "Tokyo",
    type: "National",
    majors: {
      business: {
        borderlineEJU: { japanese: 340, math2: 150 },
        difficulty: "Reach",
        examType: "EJU + Written + Interview",
        applicationUrl: "https://www.hit-u.ac.jp/admissions/",
        tuitionRange: "535,800 yen/year"
      },
      economics: {
        borderlineEJU: { japanese: 330, math2: 145 },
        difficulty: "Reach",
        examType: "EJU + Written + Interview",
        applicationUrl: "https://www.hit-u.ac.jp/admissions/",
        tuitionRange: "535,800 yen/year"
      }
    }
  }
];

export const getUniversitiesByMajor = (major) => {
  return universitiesData.filter(uni => 
    Object.keys(uni.majors).some(m => 
      m.toLowerCase().includes(major.toLowerCase()) || 
      major.toLowerCase().includes(m.toLowerCase())
    )
  );
};

export const getUniversitiesByRegion = (region) => {
  return universitiesData.filter(uni => 
    uni.region.toLowerCase().includes(region.toLowerCase())
  );
};

export const getUniversityById = (id) => {
  return universitiesData.find(uni => uni.id === id);
}; 