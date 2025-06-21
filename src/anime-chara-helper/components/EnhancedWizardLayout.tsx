import React, { useState, useEffect, useCallback } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import '../styles/WizardLayout.css'

interface SidebarProps {
  content: React.ReactNode
  collapsed: boolean
  onToggle: () => void
  side: 'left' | 'right'
  title?: string
}

const Sidebar: React.FC<SidebarProps> = ({ content, collapsed, onToggle, side, title }) => {
  return (
    <aside className={`sidebar ${side} ${collapsed ? 'collapsed' : ''}`}>
      {title && (
        <div className="sidebar-header">
          <h2>{title}</h2>
        </div>
      )}
      <button 
        className="collapse-btn" 
        onClick={onToggle}
        aria-label={`${collapsed ? 'Expand' : 'Collapse'} ${side} sidebar`}
        title={`${collapsed ? 'Expand' : 'Collapse'} (Alt + ${side === 'left' ? '[' : ']'})`}
      >
        {side === 'left' ? 
          (collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />) :
          (collapsed ? <ChevronLeft size={16} /> : <ChevronRight size={16} />)
        }
      </button>
      <div className="sidebar-content">
        {content}
      </div>
    </aside>
  )
}

interface EnhancedWizardLayoutProps {
  children: React.ReactNode
  leftSidebarContent: React.ReactNode
  rightSidebarContent: React.ReactNode
  leftSidebarTitle?: string
  rightSidebarTitle?: string
  onLayoutChange?: (layout: { leftCollapsed: boolean; rightCollapsed: boolean }) => void
}

export const EnhancedWizardLayout: React.FC<EnhancedWizardLayoutProps> = ({
  children,
  leftSidebarContent,
  rightSidebarContent,
  leftSidebarTitle,
  rightSidebarTitle,
  onLayoutChange
}) => {
  // Load saved state from localStorage
  const [leftCollapsed, setLeftCollapsed] = useState(() => {
    const saved = localStorage.getItem('wizardLayout.leftCollapsed')
    return saved ? JSON.parse(saved) : false
  })
  
  const [rightCollapsed, setRightCollapsed] = useState(() => {
    const saved = localStorage.getItem('wizardLayout.rightCollapsed')
    return saved ? JSON.parse(saved) : false
  })

  // Save state to localStorage and notify parent
  const updateLayout = useCallback((left: boolean, right: boolean) => {
    localStorage.setItem('wizardLayout.leftCollapsed', JSON.stringify(left))
    localStorage.setItem('wizardLayout.rightCollapsed', JSON.stringify(right))
    setLeftCollapsed(left)
    setRightCollapsed(right)
    onLayoutChange?.({ leftCollapsed: left, rightCollapsed: right })
  }, [onLayoutChange])

  // Keyboard shortcuts
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // Only handle if not typing in an input
    if (event.target instanceof HTMLInputElement || 
        event.target instanceof HTMLTextAreaElement) {
      return
    }

    // Alt + [ to toggle left sidebar
    if (event.altKey && event.key === '[') {
      updateLayout(!leftCollapsed, rightCollapsed)
    }
    // Alt + ] to toggle right sidebar
    else if (event.altKey && event.key === ']') {
      updateLayout(leftCollapsed, !rightCollapsed)
    }
    // Alt + \ to toggle both sidebars
    else if (event.altKey && event.key === '\\') {
      const newState = !(leftCollapsed && rightCollapsed)
      updateLayout(newState, newState)
    }
  }, [leftCollapsed, rightCollapsed, updateLayout])

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [handleKeyPress])

  // Double-click on canvas area to collapse both sidebars
  const handleCanvasDoubleClick = useCallback(() => {
    const newState = !(leftCollapsed && rightCollapsed)
    updateLayout(newState, newState)
  }, [leftCollapsed, rightCollapsed, updateLayout])

  return (
    <div className="wizard-container">
      <Sidebar
        content={leftSidebarContent}
        collapsed={leftCollapsed}
        onToggle={() => updateLayout(!leftCollapsed, rightCollapsed)}
        side="left"
        title={leftSidebarTitle}
      />
      <main 
        className="canvas-area"
        onDoubleClick={handleCanvasDoubleClick}
      >
        {children}
      </main>
      <Sidebar
        content={rightSidebarContent}
        collapsed={rightCollapsed}
        onToggle={() => updateLayout(leftCollapsed, !rightCollapsed)}
        side="right"
        title={rightSidebarTitle}
      />
    </div>
  )
} 