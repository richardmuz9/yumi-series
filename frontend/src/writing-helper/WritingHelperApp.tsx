import React from 'react';
import WritingScreen from './WritingScreen';

interface WritingHelperAppProps {
  onBack?: () => void;
}

const WritingHelperApp: React.FC<WritingHelperAppProps> = ({ onBack }) => {
  return <WritingScreen onBack={onBack || (() => {})} />;
};

export default WritingHelperApp; 