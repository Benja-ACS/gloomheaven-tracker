'use client'

import { useState } from 'react'
import { Plus, Sword, Shield, Menu, House, BookOpen, Settings } from 'lucide-react'
import { ScenarioCreator } from '@/components/ScenarioCreator'
import { ScenarioManager } from '@/components/ScenarioManager'
import { BackgroundWrapper } from '@/components/ui/BackgroundWrapper'
import { Button } from '@/components/ui/Button'
import { Scenario } from '@/types/gloomhaven'
import { useTheme } from '@/contexts/ThemeContext'

export default function Home() {
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null)
  const [showCreator, setShowCreator] = useState(false)
  const [showMobileMenu, setShowMobileMenu] = useState(false)
  const { logo } = useTheme()

  const handleScenarioCreated = (scenario: Scenario) => {
    setCurrentScenario(scenario)
    setShowCreator(false)
  }

  const handleNewScenario = () => {
    setCurrentScenario(null)
    setShowCreator(true)
  }

  const handleHome = () => {
    setCurrentScenario(null)
    setShowCreator(false)
  }

  return (
    <BackgroundWrapper>
      {/* Enhanced Header with Navigation */}
      <header className="bg-black/20 backdrop-blur-md border-b border-white/10 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo/Title */}
            <div className="flex items-center gap-3">
              <div className="relative">
                {logo ? (
                  <img 
                    src={logo} 
                    alt="Gloomhaven Logo" 
                    className="w-16 h-16 sm:w-20 sm:h-20 md:w-24 md:h-24 object-contain"
                  />
                ) : (
                  <>
                    <Sword className="text-yellow-400 w-12 h-12 sm:w-14 sm:h-14 md:w-16 md:h-16" />
                    <Shield className="text-blue-400 w-7 h-7 sm:w-8 sm:h-8 md:w-9 md:h-9 absolute -top-1 -right-1" />
                  </>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">Gloomhaven Tracker</h1>
                <p className="text-gray-400 text-sm hidden sm:block">Scenario & Monster Management</p>
              </div>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-4">
              <button
                onClick={handleHome}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  !currentScenario && !showCreator
                    ? 'bg-white/20 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <House className="w-4 h-4" />
                Home
              </button>
              
              <button
                onClick={handleNewScenario}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all duration-200 ${
                  showCreator
                    ? 'bg-white/20 text-white'
                    : 'text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                <Plus className="w-4 h-4" />
                New Scenario
              </button>

              {currentScenario && (
                <button
                  className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/20 text-white"
                >
                  <BookOpen className="w-4 h-4" />
                  {currentScenario.name}
                </button>
              )}

              <button className="flex items-center gap-2 px-4 py-2 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200">
                <Settings className="w-4 h-4" />
                Settings
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setShowMobileMenu(!showMobileMenu)}
              className="md:hidden p-2 rounded-lg text-white hover:bg-white/10 transition-colors"
            >
              <Menu className="w-6 h-6" />
            </button>
          </div>

          {/* Mobile Navigation */}
          {showMobileMenu && (
            <div className="md:hidden mt-4 pt-4 border-t border-white/10">
              <nav className="space-y-2">
                <button
                  onClick={() => {
                    handleHome()
                    setShowMobileMenu(false)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    !currentScenario && !showCreator
                      ? 'bg-white/20 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <House className="w-5 h-5" />
                  Home
                </button>
                
                <button
                  onClick={() => {
                    handleNewScenario()
                    setShowMobileMenu(false)
                  }}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                    showCreator
                      ? 'bg-white/20 text-white'
                      : 'text-gray-300 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Plus className="w-5 h-5" />
                  New Scenario
                </button>

                {currentScenario && (
                  <div className="w-full flex items-center gap-3 px-4 py-3 rounded-lg bg-white/20 text-white">
                    <BookOpen className="w-5 h-5" />
                    {currentScenario.name}
                  </div>
                )}

                <button className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-all duration-200">
                  <Settings className="w-5 h-5" />
                  Settings
                </button>
              </nav>
            </div>
          )}
        </div>
      </header>

      <div className="container mx-auto px-4 py-8">

        {/* Main Content with Animations */}
        <main className="space-y-8">
          {!currentScenario && !showCreator ? (
            <div className="min-h-[60vh] flex items-center justify-center">
              <div className="text-center animate-fade-in">
                <div className="bg-gradient-to-r from-white/10 to-white/5 backdrop-blur-sm rounded-2xl p-8 max-w-lg mx-auto border border-white/20 shadow-2xl">
                  <div className="mb-6">
                    <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <Sword className="w-8 h-8 text-white" />
                    </div>
                    <h2 className="text-3xl font-bold text-white mb-3">
                      Welcome Back, Adventurer!
                    </h2>
                    <p className="text-gray-300 text-lg leading-relaxed">
                      Ready to embark on your next Gloomhaven adventure? Create a new scenario to track monsters, bosses, and manage combat encounters.
                    </p>
                  </div>
                  
                  <div className="space-y-4">
                    <Button
                      onClick={() => setShowCreator(true)}
                      size="lg"
                      className="w-full"
                    >
                      <Plus className="w-5 h-5" />
                      Create New Scenario
                    </Button>
                    
                    <div className="grid grid-cols-3 gap-3 pt-4">
                      <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
                        <Shield className="w-6 h-6 text-blue-400 mx-auto mb-1" />
                        <span className="text-xs text-gray-400">Track Health</span>
                      </div>
                      <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
                        <BookOpen className="w-6 h-6 text-green-400 mx-auto mb-1" />
                        <span className="text-xs text-gray-400">Manage NPCs</span>
                      </div>
                      <div className="text-center p-3 bg-white/5 rounded-lg border border-white/10">
                        <Settings className="w-6 h-6 text-purple-400 mx-auto mb-1" />
                        <span className="text-xs text-gray-400">Auto Calculate</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : showCreator ? (
            <div className="animate-slide-in-up">
              <ScenarioCreator
                onScenarioCreated={handleScenarioCreated}
                onCancel={() => setShowCreator(false)}
              />
            </div>
          ) : currentScenario ? (
            <div className="animate-slide-in-up">
              <ScenarioManager
                scenario={currentScenario}
                onNewScenario={() => {
                  setCurrentScenario(null)
                  setShowCreator(true)
                }}
              />
            </div>
          ) : null}
        </main>
      </div>
    </BackgroundWrapper>
  )
}
