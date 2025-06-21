import React from 'react';
import { Mode } from '../types';

interface ModeSwitcherProps {
  mode: Mode;
  onChange: (mode: Mode) => void;
}

export default function ModeSwitcher({ mode, onChange }: ModeSwitcherProps) {
  return (
    <div className="mode-switcher">
      <button
        className={`mode-button ${mode === 'creative' ? 'active' : ''}`}
        onClick={() => onChange('creative')}
      >
        <span className="icon">✏️</span>
        <span className="label">Creative</span>
      </button>
      <button
        className={`mode-button ${mode === 'ai' ? 'active' : ''}`}
        onClick={() => onChange('ai')}
      >
        <span className="icon">🤖</span>
        <span className="label">AI-Generate</span>
      </button>
    </div>
  );
} 