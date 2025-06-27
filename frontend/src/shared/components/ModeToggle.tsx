import React from 'react';
import './ModeToggle.css';

export type YumiMode = '戦おう一緒に' | '面倒いけどすごい' | '任せて';

interface ModeToggleProps {
  mode: YumiMode;
  onChange: (mode: YumiMode) => void;
  domain: 'writing' | 'anime';
}

export const ModeToggle: React.FC<ModeToggleProps> = ({ mode, onChange, domain }) => {
  const getPlaceholder = (currentMode: YumiMode) => {
    switch (currentMode) {
      case '戦おう一緒に':
        return 'アイデアとあらすじを入力…';
      case '面倒いけどすごい':
        return 'できるだけ詳細に説明してください…';
      case '任せて':
        return 'アイデアだけを入力してください…';
    }
  };

  const getApiStrategy = (currentMode: YumiMode, domain: 'writing' | 'anime') => {
    if (domain === 'writing') {
      switch (currentMode) {
        case '戦おう一緒に':
          return 'refine-3';
        case '面倒いけどすごい':
          return 'detail-amplify';
        case '任せて':
          return 'outline-5';
      }
    } else {
      switch (currentMode) {
        case '戦おう一緒に':
          return '３デザイン提案';
        case '面倒いけどすごい':
          return '詳細バリエーション';
        case '任せて':
          return '５キャラプロンプト＋配色';
      }
    }
  };

  return (
    <div className={`mode-toggle-container ${domain}`}>
      <div className="mode-toggle-buttons">
        {(['戦おう一緒に', '面倒いけどすごい', '任せて'] as YumiMode[]).map((m) => (
          <button
            key={m}
            onClick={() => onChange(m)}
            className={`mode-toggle-button ${mode === m ? 'active' : ''}`}
          >
            {m}
          </button>
        ))}
      </div>
    </div>
  );
}; 