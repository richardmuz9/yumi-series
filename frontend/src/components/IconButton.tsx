import React from 'react'

interface IconButtonProps {
  icon: string
  tooltip: string
  onClick: () => void
  active?: boolean
  disabled?: boolean
  className?: string
}

const IconButton: React.FC<IconButtonProps> = ({ 
  icon, 
  tooltip, 
  onClick, 
  active = false, 
  disabled = false, 
  className = '' 
}) => {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`icon-btn ${active ? 'active' : ''} ${disabled ? 'disabled' : ''} ${className}`}
      title={tooltip}
    >
      <span className="icon">{icon}</span>
    </button>
  )
}

export default IconButton 