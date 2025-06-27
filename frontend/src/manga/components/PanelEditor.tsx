import React, { useState, useRef, useEffect } from 'react';
import { Panel, PanelLayout, DialogueBubble } from '../types/manga';
import { Character } from '../../anime-chara-helper/types';
import './PanelEditor.css';

interface PanelEditorProps {
  panel: Panel;
  layout: PanelLayout;
  characters: Character[];
  onPanelUpdate: (updatedPanel: Panel) => void;
}

export const PanelEditor: React.FC<PanelEditorProps> = ({
  panel,
  layout,
  characters,
  onPanelUpdate,
}) => {
  const [selectedCharacter, setSelectedCharacter] = useState<Character | null>(null);
  const [selectedBubble, setSelectedBubble] = useState<DialogueBubble | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const panelRef = useRef<HTMLDivElement>(null);

  const handleCharacterDragStart = (e: React.MouseEvent, character: Character) => {
    setSelectedCharacter(character);
    setIsDragging(true);
    if (panelRef.current) {
      const rect = panelRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleDragMove = (e: React.MouseEvent) => {
    if (!isDragging || !selectedCharacter || !panelRef.current) return;

    const rect = panelRef.current.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    const updatedPanel = {
      ...panel,
      characters: panel.characters.map(char => {
        if (char.character.id === selectedCharacter.id) {
          return {
            ...char,
            position: { x, y },
          };
        }
        return char;
      }),
    };

    onPanelUpdate(updatedPanel);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setSelectedCharacter(null);
  };

  const handleBubbleClick = (bubble: DialogueBubble) => {
    setSelectedBubble(bubble);
  };

  const handleBubbleTextChange = (text: string) => {
    if (!selectedBubble) return;

    const updatedPanel = {
      ...panel,
      dialogues: panel.dialogues.map(bubble => {
        if (bubble.id === selectedBubble.id) {
          return {
            ...bubble,
            content: text,
          };
        }
        return bubble;
      }),
    };

    onPanelUpdate(updatedPanel);
  };

  const addNewBubble = () => {
    const newBubble: DialogueBubble = {
      id: `bubble-${Date.now()}`,
      type: 'normal',
      content: '',
      position: { x: 50, y: 50 },
    };

    const updatedPanel = {
      ...panel,
      dialogues: [...panel.dialogues, newBubble],
    };

    onPanelUpdate(updatedPanel);
    setSelectedBubble(newBubble);
  };

  return (
    <div className="panel-editor">
      <div className="panel-canvas" 
        ref={panelRef}
        onMouseMove={handleDragMove}
        onMouseUp={handleDragEnd}
        onMouseLeave={handleDragEnd}
        style={{
          gridTemplateColumns: layout.template,
        }}
      >
        {panel.background?.url && (
          <img 
            src={panel.background.url} 
            alt="Panel background" 
            className="panel-background"
          />
        )}

        {panel.characters.map(char => (
          <div
            key={char.character.id}
            className={`character-element ${selectedCharacter?.id === char.character.id ? 'selected' : ''}`}
            style={{
              left: `${char.position.x}%`,
              top: `${char.position.y}%`,
              transform: `translate(-50%, -50%) scale(${char.scale})${char.flipped ? ' scaleX(-1)' : ''}`,
            }}
            onMouseDown={(e) => handleCharacterDragStart(e, char.character)}
          >
            <img src={char.character.imageUrl} alt={char.character.name} />
          </div>
        ))}

        {panel.dialogues.map(bubble => (
          <div
            key={bubble.id}
            className={`dialogue-bubble ${bubble.type} ${selectedBubble?.id === bubble.id ? 'selected' : ''}`}
            style={{
              left: `${bubble.position.x}%`,
              top: `${bubble.position.y}%`,
              ...bubble.style,
            }}
            onClick={() => handleBubbleClick(bubble)}
          >
            <div className="bubble-content" contentEditable
              onBlur={(e) => handleBubbleTextChange(e.currentTarget.textContent || '')}
              suppressContentEditableWarning
            >
              {bubble.content}
            </div>
          </div>
        ))}
      </div>

      <div className="panel-toolbar">
        <div className="character-list">
          <h4>Characters</h4>
          <div className="character-thumbnails">
            {characters.map(char => (
              <div
                key={char.id}
                className="character-thumb"
                draggable
                onDragStart={(e) => handleCharacterDragStart(e, char)}
              >
                <img src={char.imageUrl} alt={char.name} />
                <span>{char.name}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bubble-controls">
          <h4>Dialogue</h4>
          <button onClick={addNewBubble}>Add Speech Bubble</button>
          {selectedBubble && (
            <div className="bubble-style-controls">
              <select
                value={selectedBubble.type}
                onChange={(e) => {
                  const updatedPanel = {
                    ...panel,
                    dialogues: panel.dialogues.map(bubble => {
                      if (bubble.id === selectedBubble.id) {
                        return {
                          ...bubble,
                          type: e.target.value as DialogueBubble['type'],
                        };
                      }
                      return bubble;
                    }),
                  };
                  onPanelUpdate(updatedPanel);
                }}
              >
                <option value="normal">Normal</option>
                <option value="shout">Shout</option>
                <option value="whisper">Whisper</option>
                <option value="thought">Thought</option>
                <option value="monologue">Monologue</option>
              </select>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}; 