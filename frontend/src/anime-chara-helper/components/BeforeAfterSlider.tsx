import React, { useRef, useState } from 'react';

interface BeforeAfterSliderProps {
  before: string;
  after: string;
  height?: number;
}

const BeforeAfterSlider: React.FC<BeforeAfterSliderProps> = ({ before, after, height = 280 }) => {
  const [sliderPos, setSliderPos] = useState(0.5); // 0 (left) to 1 (right)
  const containerRef = useRef<HTMLDivElement>(null);
  const dragging = useRef(false);

  const handleDrag = (e: React.MouseEvent | React.TouchEvent) => {
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    let pos = (clientX - rect.left) / rect.width;
    pos = Math.max(0, Math.min(1, pos));
    setSliderPos(pos);
  };

  const startDrag = () => { dragging.current = true; };
  const stopDrag = () => { dragging.current = false; };

  const onMove = (e: any) => {
    if (dragging.current) handleDrag(e);
  };

  return (
    <div
      className="before-after-slider"
      ref={containerRef}
      style={{ position: 'relative', width: '100%', height }}
      onMouseMove={onMove}
      onMouseUp={stopDrag}
      onMouseLeave={stopDrag}
      onTouchMove={onMove}
      onTouchEnd={stopDrag}
    >
      <img src={before} alt="Before" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height, objectFit: 'cover', borderRadius: 8 }} />
      <img src={after} alt="After" style={{ position: 'absolute', top: 0, left: 0, width: `${sliderPos * 100}%`, height, objectFit: 'cover', borderRadius: 8, clipPath: `inset(0 ${100 - sliderPos * 100}% 0 0)` }} />
      <div
        className="slider-handle"
        style={{
          position: 'absolute',
          left: `calc(${sliderPos * 100}% - 12px)`,
          top: 0,
          height: '100%',
          width: 24,
          cursor: 'ew-resize',
          zIndex: 2,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
        onMouseDown={startDrag}
        onTouchStart={startDrag}
      >
        <div style={{ width: 4, height: height - 16, background: '#fff', borderRadius: 2, boxShadow: '0 0 4px #0002' }} />
      </div>
      {/* Overlay for drag events */}
      {dragging.current && <div style={{ position: 'fixed', inset: 0, zIndex: 10, cursor: 'ew-resize' }} onMouseMove={onMove} onMouseUp={stopDrag} onTouchMove={onMove} onTouchEnd={stopDrag} />}
    </div>
  );
};

export default BeforeAfterSlider; 