'use client'

import { useTheme } from '@/contexts/ThemeContext'

interface BackgroundWrapperProps {
  children: React.ReactNode
}

export function BackgroundWrapper({ children }: BackgroundWrapperProps) {
  const { background, isLoading } = useTheme()

  return (
    <div className="min-h-screen relative">
      {/* Background Image */}
      {background && !isLoading && (
        <div 
          className="fixed inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ 
            backgroundImage: `url(${background})`,
            backgroundAttachment: 'fixed'
          }}
        />
      )}
      
      {/* Background Overlay */}
      <div className="fixed inset-0 z-0 bg-black/50" />
      
      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  )
}
