import React, { useState } from 'react';
import { IoArrowBack, IoPencil, IoDocument } from 'react-icons/io5';
import { Sidebar } from '../shared/components/Sidebar';

interface WritingScreenProps {
  onBack: () => void;
}

type WritingMode = 'writing' | 'report';

export const WritingScreen: React.FC<WritingScreenProps> = ({ onBack }) => {
  const [mode, setMode] = useState<WritingMode>('writing');
  const [content, setContent] = useState('');

  const sidebarItems = [
    {
      id: 'writing',
      icon: <IoPencil />,
      label: '✍️ Writing',
    },
    {
      id: 'report',
      icon: <IoDocument />,
      label: '📊 Report',
    }
  ];

  const handleModeChange = (id: string) => {
    setMode(id as WritingMode);
  };

  const getTheme = () => {
    return mode === 'writing' 
      ? {
          primary: '#ff69b4',
          secondary: '#ffb6c1',
          background: '#fff0f5',
          text: '#4a4a4a'
        }
      : {
          primary: '#2c5282',
          secondary: '#4299e1',
          background: '#ebf8ff',
          text: '#2d3748'
        };
  };

  const theme = getTheme();

  return (
    <div style={{ 
      backgroundColor: theme.background,
      minHeight: '100vh',
      color: theme.text
    }}>
      {/* Fixed Header */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        height: '60px',
        backgroundColor: theme.primary,
        display: 'flex',
        alignItems: 'center',
        padding: '0 20px',
        color: 'white',
        zIndex: 1000,
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <button 
          onClick={onBack}
          style={{
            background: 'transparent',
            border: 'none',
            color: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer',
            fontSize: '16px'
          }}
        >
          <IoArrowBack /> Back to Modes
        </button>
        <div style={{ 
          marginLeft: 'auto',
          fontSize: '18px',
          fontWeight: 500
        }}>
          {mode === 'writing' ? '✍️ Writing Helper' : '📊 Report Writer'}
        </div>
      </div>

      {/* Sidebar */}
      <Sidebar
        items={sidebarItems}
        activeItemId={mode}
        onItemClick={handleModeChange}
        position="left"
        defaultCollapsed={false}
      />

      {/* Main Content Area */}
      <div style={{
        marginTop: '80px',
        marginLeft: '220px',
        padding: '20px',
        maxWidth: '800px'
      }}>
        <textarea
          value={content}
          onChange={(e) => setContent(e.target.value)}
          placeholder={mode === 'writing' 
            ? "Start writing your creative piece here..."
            : "Begin your professional report here..."
          }
          style={{
            width: '100%',
            minHeight: '500px',
            padding: '20px',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
            border: `1px solid ${theme.secondary}`,
            borderRadius: '8px',
            fontSize: '16px',
            lineHeight: '1.6',
            color: theme.text,
            resize: 'vertical'
          }}
        />
      </div>
    </div>
  );
}; 