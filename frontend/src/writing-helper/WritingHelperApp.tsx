import React, { useState, useEffect } from 'react';
import { useStore } from '../store';
import { getTranslation } from '../translations';
import WritingHelper from '../components/writing-helper/WritingHelper';
import './WritingHelper.css';

interface WritingHelperAppProps {
  onBackToMain: () => void;
}

const WritingHelperApp: React.FC<WritingHelperAppProps> = ({ onBackToMain }) => {
  const { language } = useStore();
  // const t = getTranslation(language); // Translations available if needed
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Smooth entrance animation
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleBack = () => {
    setIsVisible(false);
    // Small delay for exit animation
    setTimeout(onBackToMain, 300);
  };

  return (
    <div 
      className={`writing-helper-app ${isVisible ? 'visible' : ''}`}
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        position: 'relative',
        overflow: 'hidden',
        transition: 'all 0.3s ease'
      }}
    >
      {/* Animated Background Elements */}
      <div className="bg-decorations">
        <div className="floating-icon" style={{ top: '10%', left: '10%', animationDelay: '0s' }}>✍️</div>
        <div className="floating-icon" style={{ top: '20%', right: '15%', animationDelay: '1s' }}>📝</div>
        <div className="floating-icon" style={{ bottom: '20%', left: '20%', animationDelay: '2s' }}>🎨</div>
        <div className="floating-icon" style={{ bottom: '15%', right: '10%', animationDelay: '3s' }}>💡</div>
        <div className="floating-icon" style={{ top: '50%', left: '5%', animationDelay: '4s' }}>🎭</div>
        <div className="floating-icon" style={{ top: '70%', right: '5%', animationDelay: '5s' }}>📖</div>
      </div>

      {/* Back Button */}
      <button
        onClick={handleBack}
        className="back-button"
        style={{
          position: 'absolute',
          top: '20px',
          left: '20px',
          zIndex: 1000,
          padding: '12px 24px',
          background: 'rgba(255, 255, 255, 0.95)',
          border: '2px solid rgba(102, 126, 234, 0.3)',
          borderRadius: '25px',
          color: '#667eea',
          fontWeight: 'bold',
          cursor: 'pointer',
          fontSize: '0.9rem',
          transition: 'all 0.3s ease',
          boxShadow: '0 4px 15px rgba(0, 0, 0, 0.1)',
          backdropFilter: 'blur(10px)'
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = '#667eea';
          e.currentTarget.style.color = 'white';
          e.currentTarget.style.transform = 'translateX(-5px) scale(1.05)';
          e.currentTarget.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.3)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'rgba(255, 255, 255, 0.95)';
          e.currentTarget.style.color = '#667eea';
          e.currentTarget.style.transform = 'translateX(0) scale(1)';
          e.currentTarget.style.boxShadow = '0 4px 15px rgba(0, 0, 0, 0.1)';
        }}
      >
        ← Back to Main
      </button>

      {/* Header Section */}
      <div 
        className="app-header"
        style={{
          textAlign: 'center',
          padding: '80px 20px 40px',
          color: 'white'
        }}
      >
        <h1 
          style={{
            fontSize: '3rem',
            fontWeight: 'bold',
            marginBottom: '10px',
            textShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
            background: 'linear-gradient(45deg, #ffd700, #ffed4e)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            backgroundClip: 'text'
          }}
        >
          ✒️ Writing Helper
        </h1>
        <h2 
          style={{
            fontSize: '1.2rem',
            fontWeight: '600',
            margin: '0 0 15px 0',
            opacity: 0.95
          }}
        >
          書き助 - Your Creative Writing Companion
        </h2>
        <div 
          style={{
            fontSize: '1rem',
            opacity: 0.9,
            maxWidth: '800px',
            margin: '0 auto',
            lineHeight: '1.6'
          }}
        >
          <p style={{ margin: '10px 0' }}>
            <strong>🧠 Human + AI Synergy:</strong>
          </p>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '30px', flexWrap: 'wrap', margin: '15px 0' }}>
            <span>👤 <strong>You:</strong> 0→1 (spark) + 99→100 (polish)</span>
            <span>🤖 <strong>AI:</strong> 1→99 (tireless continuation)</span>
          </div>
          <p style={{ margin: '10px 0', fontSize: '0.95rem', opacity: 0.8 }}>
            Perfect for galgame scripts, creative writing, blog posts, social content & more!
          </p>
        </div>
      </div>

      {/* Main Content */}
      <div 
        className="content-wrapper"
        style={{
          background: 'rgba(255, 255, 255, 0.95)',
          margin: '0 20px',
          borderRadius: '20px 20px 0 0',
          minHeight: 'calc(100vh - 200px)',
          boxShadow: '0 -10px 30px rgba(0, 0, 0, 0.2)',
          backdropFilter: 'blur(10px)'
        }}
      >
        <WritingHelper />
      </div>

      <style>{`
        .writing-helper-app {
          opacity: 0;
          transform: translateY(20px);
        }
        
        .writing-helper-app.visible {
          opacity: 1;
          transform: translateY(0);
        }
        
        .floating-icon {
          position: absolute;
          font-size: 2rem;
          opacity: 0.1;
          animation: float 6s ease-in-out infinite;
          pointer-events: none;
        }
        
        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          25% { transform: translateY(-20px) rotate(90deg); }
          50% { transform: translateY(-10px) rotate(180deg); }
          75% { transform: translateY(-30px) rotate(270deg); }
        }
        
        @media (max-width: 768px) {
          .app-header h1 {
            font-size: 2.2rem !important;
          }
          
          .app-header h2 {
            font-size: 1rem !important;
          }
          
          .back-button {
            top: 10px !important;
            left: 10px !important;
            padding: 10px 20px !important;
            font-size: 0.8rem !important;
          }
          
          .content-wrapper {
            margin: 0 10px !important;
          }
          
          .floating-icon {
            display: none;
          }
        }
      `}</style>
    </div>
  );
};

export default WritingHelperApp; 