import React, { useState } from 'react';
import BeforeAfterSlider from './BeforeAfterSlider';

interface CaseStudy {
  id: string;
  title: string;
  style: string;
  tool: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  before: string;
  after: string;
  notes: string;
  tags: string[];
}

const sampleCaseStudies: CaseStudy[] = [
  {
    id: 'swimsuit-ai-vs-human',
    title: 'Swimsuit: AI vs. Human Final',
    style: 'Swimsuit',
    tool: 'Anime Helper',
    difficulty: 'Intermediate',
    before: '/case-studies/swimsuit-ai.png',
    after: '/case-studies/swimsuit-human.png',
    notes: 'Human artist refined anatomy, added highlights, and improved water effects.',
    tags: ['anatomy', 'lighting', 'water']
  },
  {
    id: 'cyberpunk-chibi',
    title: 'Cyberpunk Chibi: AI vs. Human',
    style: 'Cyberpunk',
    tool: 'Anime Helper',
    difficulty: 'Advanced',
    before: '/case-studies/cyberpunk-ai.png',
    after: '/case-studies/cyberpunk-human.png',
    notes: 'Human added neon glows, fixed perspective, and enhanced color vibrancy.',
    tags: ['color', 'perspective', 'glow']
  },
  {
    id: 'classic-moe',
    title: 'Classic Moe: AI vs. Human',
    style: 'Chibi',
    tool: 'Anime Helper',
    difficulty: 'Beginner',
    before: '/case-studies/moe-ai.png',
    after: '/case-studies/moe-human.png',
    notes: 'Human tweaked facial proportions and added blush for extra cuteness.',
    tags: ['proportion', 'expression', 'blush']
  }
];

const styles = ['All', ...Array.from(new Set(sampleCaseStudies.map(cs => cs.style)))];
const difficulties = ['All', 'Beginner', 'Intermediate', 'Advanced'];

const CaseStudies: React.FC = () => {
  const [search, setSearch] = useState('');
  const [styleFilter, setStyleFilter] = useState('All');
  const [difficultyFilter, setDifficultyFilter] = useState('All');
  const [expanded, setExpanded] = useState<string | null>(null);

  const filtered = sampleCaseStudies.filter(cs =>
    (styleFilter === 'All' || cs.style === styleFilter) &&
    (difficultyFilter === 'All' || cs.difficulty === difficultyFilter) &&
    (cs.title.toLowerCase().includes(search.toLowerCase()) ||
      cs.notes.toLowerCase().includes(search.toLowerCase()) ||
      cs.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase())))
  );

  return (
    <div className="case-studies-modal">
      <div className="case-studies-header">
        <h2>🧑‍🎨 AI + You: Case Studies</h2>
        <div className="filters">
          <input
            type="text"
            placeholder="Search case studies..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="search-input"
          />
          <select value={styleFilter} onChange={e => setStyleFilter(e.target.value)}>
            {styles.map(style => <option key={style}>{style}</option>)}
          </select>
          <select value={difficultyFilter} onChange={e => setDifficultyFilter(e.target.value)}>
            {difficulties.map(diff => <option key={diff}>{diff}</option>)}
          </select>
        </div>
      </div>
      <div className="case-studies-list">
        {filtered.map(cs => (
          <div key={cs.id} className="case-study-card">
            <div className="card-header" onClick={() => setExpanded(expanded === cs.id ? null : cs.id)}>
              <h3>{cs.title}</h3>
              <div className="card-meta">
                <span className="meta style">{cs.style}</span>
                <span className="meta difficulty">{cs.difficulty}</span>
                <span className="meta tool">{cs.tool}</span>
              </div>
              <button className="expand-btn">{expanded === cs.id ? '▲' : '▼'}</button>
            </div>
            {expanded === cs.id && (
              <div className="card-body">
                <BeforeAfterSlider before={cs.before} after={cs.after} />
                <div className="process-notes">
                  <h4>Process Notes</h4>
                  <p>{cs.notes}</p>
                  <div className="tags">
                    {cs.tags.map(tag => <span key={tag} className="tag">#{tag}</span>)}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
        {filtered.length === 0 && <div className="no-results">No case studies found.</div>}
      </div>
    </div>
  );
};

export default CaseStudies; 