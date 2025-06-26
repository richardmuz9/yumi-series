import React, { useState } from 'react';
import { IoChevronBack, IoChevronForward } from 'react-icons/io5';
import Draggable from 'react-draggable';

interface SidebarItem {
  id: string;
  icon: React.ReactNode;
  label: string;
  onClick?: () => void;
}

interface SidebarProps {
  items: SidebarItem[];
  position?: 'left' | 'right';
  defaultCollapsed?: boolean;
  activeItemId?: string;
  onItemClick?: (id: string) => void;
  className?: string;
  style?: React.CSSProperties;
}

export const Sidebar: React.FC<SidebarProps> = ({
  items,
  position = 'left',
  defaultCollapsed = false,
  activeItemId,
  onItemClick,
  className = '',
  style = {}
}) => {
  const [isCollapsed, setIsCollapsed] = useState(defaultCollapsed);
  const [bounds, setBounds] = useState({ left: 0, top: 0, right: 0, bottom: 0 });

  // Update bounds when window resizes
  React.useEffect(() => {
    const updateBounds = () => {
      setBounds({
        left: 0,
        top: 0,
        right: window.innerWidth - (isCollapsed ? 50 : 200),
        bottom: window.innerHeight - 400 // Assuming sidebar height is 400px
      });
    };

    updateBounds();
    window.addEventListener('resize', updateBounds);
    return () => window.removeEventListener('resize', updateBounds);
  }, [isCollapsed]);

  return (
    <Draggable bounds={bounds}>
      <div
        className={`sidebar ${isCollapsed ? 'collapsed' : ''} ${className}`}
        style={{
          position: 'fixed',
          [position]: 0,
          top: '80px',
          width: isCollapsed ? '50px' : '200px',
          backgroundColor: 'rgba(255, 255, 255, 0.9)',
          borderRadius: '8px',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.1)',
          transition: 'width 0.3s ease',
          zIndex: 1000,
          ...style
        }}
      >
        <div className="sidebar-content" style={{ padding: '8px' }}>
          {items.map((item) => (
            <div
              key={item.id}
              className={`sidebar-item ${activeItemId === item.id ? 'active' : ''}`}
              onClick={() => onItemClick?.(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                padding: '8px',
                cursor: 'pointer',
                borderRadius: '4px',
                backgroundColor: activeItemId === item.id ? 'rgba(0, 0, 0, 0.05)' : 'transparent',
                color: activeItemId === item.id ? '#000' : '#666',
                marginBottom: '4px'
              }}
            >
              <div className="icon" style={{ fontSize: '20px' }}>
                {item.icon}
              </div>
              {!isCollapsed && (
                <span style={{ marginLeft: '12px', whiteSpace: 'nowrap' }}>
                  {item.label}
                </span>
              )}
            </div>
          ))}
        </div>
        <button
          onClick={() => setIsCollapsed(!isCollapsed)}
          style={{
            position: 'absolute',
            [position === 'left' ? 'right' : 'left']: '-20px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '20px',
            height: '40px',
            border: 'none',
            borderRadius: position === 'left' ? '0 20px 20px 0' : '20px 0 0 20px',
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#666'
          }}
        >
          {position === 'left' 
            ? (isCollapsed ? <IoChevronForward /> : <IoChevronBack />)
            : (isCollapsed ? <IoChevronBack /> : <IoChevronForward />)
          }
        </button>
      </div>
    </Draggable>
  );
}; 