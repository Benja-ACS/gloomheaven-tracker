'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'
import { getThemeAssets } from '@/lib/storage'

interface ThemeContextType {
  background: string | null
  logo: string | null
  isLoading: boolean
}

const ThemeContext = createContext<ThemeContextType>({
  background: null,
  logo: null,
  isLoading: true,
})

export const useTheme = () => useContext(ThemeContext)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [background, setBackground] = useState<string | null>(null)
  const [logo, setLogo] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const loadTheme = async () => {
      try {
        const assets = await getThemeAssets()
        setBackground(assets.background)
        setLogo(assets.logo)
      } catch (error) {
        console.error('Error loading theme:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadTheme()
  }, [])

  return (
    <ThemeContext.Provider value={{ background, logo, isLoading }}>
      {children}
    </ThemeContext.Provider>
  )
}
