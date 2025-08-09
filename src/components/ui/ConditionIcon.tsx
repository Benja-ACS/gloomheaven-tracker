'use client'

import { useState } from 'react'
import { getConditionIconUrl } from '@/lib/storage'

interface ConditionIconProps {
  conditionName: string
  className?: string
  size?: 'sm' | 'md' | 'lg'
}

export function ConditionIcon({ 
  conditionName, 
  className = '',
  size = 'md' // Changed from 'sm' to 'md' for bigger icons
}: ConditionIconProps) {
  const [imageError, setImageError] = useState(false) // Back to normal - try images first
  
  const sizeClasses = {
    sm: 'w-4 h-4',
    md: 'w-6 h-6', 
    lg: 'w-8 h-8'
  }

  const iconUrl = getConditionIconUrl(conditionName)

  if (imageError) {
    // Fallback to first letter if image fails to load
    return (
      <div className={`${sizeClasses[size]} ${className} bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold`}>
        {conditionName.charAt(0).toUpperCase()}
      </div>
    )
  }

  return (
    <img
      src={iconUrl}
      alt={`${conditionName} condition`}
      className={`${sizeClasses[size]} ${className} object-contain`}
      onError={() => setImageError(true)}
    />
  )
}
