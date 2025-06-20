import React, { useRef, useState } from 'react';

interface DraggableResizableImageProps {
  src: string;
  initialX?: number;
  initialY?: number;
  initialScale?: number;
  onConfirm: (x: number, y: number, scale: number) => void;
  onCancel: () => void;
}

const DraggableResizableImage: React.FC<DraggableResizableImageProps> = ({
  src,
  initialX = 0,
  initialY = 0,
  initialScale = 1,
  onConfirm,
  onCancel
}) => {
  const [x, setX] = useState(initialX);
  const [y, setY] = useState(initialY);
  const [scale, setScale] = useState(initialScale);
  const dragging = useRef(false);
  const lastPos = useRef({ x: 0, y: 0 });
  const lastTouchDist = useRef<number | null>(null);

  // Mouse drag
  const onMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    lastPos.current = { x: e.clientX - x, y: e.clientY - y };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };
  const onMouseMove = (e: MouseEvent) => {
    if (!dragging.current) return;
    setX(e.clientX - lastPos.current.x);
    setY(e.clientY - lastPos.current.y);
  };
  const onMouseUp = () => {
    dragging.current = false;
    window.removeEventListener('mousemove', onMouseMove);
    window.removeEventListener('mouseup', onMouseUp);
  };

  // Touch drag/zoom
  const onTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 1) {
      dragging.current = true;
      lastPos.current = { x: e.touches[0].clientX - x, y: e.touches[0].clientY - y };
    } else if (e.touches.length === 2) {
      lastTouchDist.current = getTouchDist(e);
    }
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 1 && dragging.current) {
      setX(e.touches[0].clientX - lastPos.current.x);
      setY(e.touches[0].clientY - lastPos.current.y);
    } else if (e.touches.length === 2) {
      const dist = getTouchDist(e);
      if (lastTouchDist.current) {
        setScale(s => Math.max(0.2, Math.min(5, s * (dist / lastTouchDist.current!))));
      }
      lastTouchDist.current = dist;
    }
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    dragging.current = false;
    lastTouchDist.current = null;
  };
  function getTouchDist(e: React.TouchEvent) {
    const a = e.touches[0];
    const b = e.touches[1];
    return Math.sqrt((a.clientX - b.clientX) ** 2 + (a.clientY - b.clientY) ** 2);
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0, left: 0, right: 0, bottom: 0,
      zIndex: 1000,
      background: 'rgba(0,0,0,0.3)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ position: 'relative', width: '100vw', height: '100vh' }}>
        <img
          src={src}
          alt="Outline"
          style={{
            position: 'absolute',
            left: x,
            top: y,
            transform: `scale(${scale})`,
            opacity: 0.5,
            touchAction: 'none',
            maxWidth: '90vw',
            maxHeight: '90vh',
            cursor: 'move',
            border: '2px dashed #888',
            background: '#fff'
          }}
          onMouseDown={onMouseDown}
          onTouchStart={onTouchStart}
          onTouchMove={onTouchMove}
          onTouchEnd={onTouchEnd}
          draggable={false}
        />
        <div style={{ position: 'absolute', bottom: 40, left: '50%', transform: 'translateX(-50%)', zIndex: 2 }}>
          <button onClick={() => onConfirm(x, y, scale)} style={{ marginRight: 16 }}>Confirm</button>
          <button onClick={onCancel}>Cancel</button>
        </div>
      </div>
    </div>
  );
};

export default DraggableResizableImage; 