'use client'

import { useState } from 'react'
import { Plus, Sword, Shield } from 'lucide-react'
import { ScenarioCreator } from '@/components/ScenarioCreator'
import { ScenarioManager } from '@/components/ScenarioManager'
import { Scenario } from '@/types/gloomhaven'

export default function Home() {
  const [currentScenario, setCurrentScenario] = useState<Scenario | null>(null)
  const [showCreator, setShowCreator] = useState(false)

  const handleScenarioCreated = (scenario: Scenario) => {
    setCurrentScenario(scenario)
    setShowCreator(false)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <Sword className="text-yellow-400" />
            Gloomhaven Tracker
            <Shield className="text-blue-400" />
          </h1>
          <p className="text-gray-300">
            Manage your scenarios, monsters, and bosses with ease
          </p>
        </div>

        {/* Main Content */}
        {!currentScenario && !showCreator ? (
          <div className="text-center">
            <div className="bg-white/10 backdrop-blur-sm rounded-xl p-8 max-w-md mx-auto">
              <h2 className="text-2xl font-semibold text-white mb-4">
                Welcome to your Gloomhaven Tracker
              </h2>
              <p className="text-gray-300 mb-6">
                Create a new scenario to start tracking monsters, bosses, and their conditions.
              </p>
              <button
                onClick={() => setShowCreator(true)}
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2 mx-auto"
              >
                <Plus className="w-5 h-5" />
                Create New Scenario
              </button>
            </div>
          </div>
        ) : showCreator ? (
          <ScenarioCreator
            onScenarioCreated={handleScenarioCreated}
            onCancel={() => setShowCreator(false)}
          />
        ) : currentScenario ? (
          <ScenarioManager
            scenario={currentScenario}
            onNewScenario={() => {
              setCurrentScenario(null)
              setShowCreator(true)
            }}
          />
        ) : null}
      </div>
    </div>
  )
}
