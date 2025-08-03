'use client'

import { useState, useEffect } from 'react'
import { getCreatureImageWithFallback, getFailsafeImageUrl } from '@/lib/storage'
import { Shield, Zap } from 'lucide-react'

interface CreatureImageProps {
  creatureName: string
  type: 'monster' | 'boss'
  className?: string
  size?: 'sm' | 'md' | 'lg' | 'xl'
  showFallback?: boolean
}

export function CreatureImage({ 
  creatureName, 
  type, 
  className = '', 
  size = 'md',
  showFallback = true 
}: CreatureImageProps) {
  const [imageUrl, setImageUrl] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)
  const [triedFailsafe, setTriedFailsafe] = useState(false)

  useEffect(() => {
    const loadImage = async () => {
      setLoading(true)
      setError(false)
      setTriedFailsafe(false)
      
      try {
        let url = await getCreatureImageWithFallback(creatureName, type)
        
        // If no specific image found and no failsafe was returned, try to get failsafe directly
        if (!url) {
          url = getFailsafeImageUrl(type)
          setTriedFailsafe(true)
        }
        
        setImageUrl(url)
      } catch (err) {
        console.error('Error loading creature image:', err)
        // Try failsafe image as last resort
        try {
          const failsafeUrl = getFailsafeImageUrl(type)
          setImageUrl(failsafeUrl)
          setTriedFailsafe(true)
        } catch (failsafeError) {
          console.error('Error loading failsafe image:', failsafeError)
          setError(true)
        }
      } finally {
        setLoading(false)
      }
    }

    if (creatureName) {
      loadImage()
    }
  }, [creatureName, type])

  const handleImageError = () => {
    if (!triedFailsafe) {
      // Try the failsafe image if we haven't already
      try {
        const failsafeUrl = getFailsafeImageUrl(type)
        setImageUrl(failsafeUrl)
        setTriedFailsafe(true)
      } catch (err) {
        console.error('Error loading failsafe image on error:', err)
        setError(true)
      }
    } else {
      // If failsafe also failed, show icon fallback
      setError(true)
    }
  }

  const sizeClasses = {
    sm: 'w-8 h-8',
    md: 'w-12 h-12',
    lg: 'w-16 h-16',
    xl: 'w-20 h-20'
  }

  if (loading) {
    return (
      <div className={`${sizeClasses[size]} bg-gray-700 rounded-lg animate-pulse ${className}`} />
    )
  }

  if (!imageUrl || error) {
    if (!showFallback) return null
    
    return (
      <div className={`${sizeClasses[size]} bg-gradient-to-br ${
        type === 'boss' 
          ? 'from-yellow-600 to-orange-600' 
          : 'from-blue-600 to-purple-600'
      } rounded-lg flex items-center justify-center ${className}`}>
        {type === 'boss' ? (
          <Zap className="w-1/2 h-1/2 text-white" />
        ) : (
          <Shield className="w-1/2 h-1/2 text-white" />
        )}
      </div>
    )
  }

  return (
    <div className={`${sizeClasses[size]} rounded-lg overflow-hidden ${className}`}>
      <img
        src={imageUrl}
        alt={creatureName}
        className="w-full h-full object-cover"
        onError={handleImageError}
      />
    </div>
  )
}
