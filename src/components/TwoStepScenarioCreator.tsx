'use client'

import { useState } from 'react'
import { ArrowLeft, ArrowRight, Users } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Scenario } from '@/types/gloomhaven'
import { ScenarioCreator } from './ScenarioCreator'

interface TwoStepScenarioCreatorProps {
  onScenarioCreated: (scenario: Scenario) => void
  onCancel: () => void
}

export function TwoStepScenarioCreator({ onScenarioCreated, onCancel }: TwoStepScenarioCreatorProps) {
  const [step, setStep] = useState<'config' | 'creatures'>('config')
  const [scenarioConfig, setScenarioConfig] = useState({
    name: '',
    level: 1,
    playerCount: 2
  })

  const handleContinueToCreatures = () => {
    if (isConfigValid()) {
      setStep('creatures')
    }
  }

  const handleBackToConfig = () => {
    setStep('config')
  }

  const isConfigValid = () => {
    return (
      scenarioConfig.name.trim() !== '' && 
      scenarioConfig.level >= 1 && 
      scenarioConfig.level <= 7 && 
      scenarioConfig.playerCount >= 1 && 
      scenarioConfig.playerCount <= 4
    )
  }

  if (step === 'config') {
    return (
      <Card className="max-w-4xl mx-auto animate-scale-in" variant="elevated" padding="lg">
        <CardHeader>
          <CardTitle>Step 1: Scenario Configuration</CardTitle>
        </CardHeader>

        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Scenario Name *
              </label>
              <input
                type="text"
                value={scenarioConfig.name}
                onChange={(e) => setScenarioConfig(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Enter scenario name..."
                className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
                autoFocus
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Scenario Level * (1-7)
              </label>
              <select
                value={scenarioConfig.level}
                onChange={(e) => setScenarioConfig(prev => ({ ...prev, level: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:border-purple-400"
              >
                {[1, 2, 3, 4, 5, 6, 7].map(level => (
                  <option key={level} value={level} className="bg-gray-800">
                    Level {level}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-2">
                Player Count * (1-4)
              </label>
              <select
                value={scenarioConfig.playerCount}
                onChange={(e) => setScenarioConfig(prev => ({ ...prev, playerCount: parseInt(e.target.value) }))}
                className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:border-purple-400"
              >
                {[1, 2, 3, 4].map(count => (
                  <option key={count} value={count} className="bg-gray-800">
                    {count} Player{count !== 1 ? 's' : ''}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
              <Users className="w-5 h-5" />
              Configuration Summary
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-300">Scenario:</span>
                <p className="text-white font-medium">{scenarioConfig.name.trim() || 'Not set'}</p>
              </div>
              <div>
                <span className="text-gray-300">Level:</span>
                <p className="text-white font-medium">Level {scenarioConfig.level}</p>
              </div>
              <div>
                <span className="text-gray-300">Players:</span>
                <p className="text-white font-medium">{scenarioConfig.playerCount} player{scenarioConfig.playerCount !== 1 ? 's' : ''}</p>
              </div>
            </div>
          </div>

          <div className="flex justify-between">
            <Button
              onClick={onCancel}
              variant="ghost"
            >
              Cancel
            </Button>
            <Button
              onClick={handleContinueToCreatures}
              disabled={!isConfigValid()}
              variant="default"
              size="lg"
            >
              Continue to Add Creatures
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        </div>
      </Card>
    )
  }

  // Step 2: Use existing ScenarioCreator with pre-filled config
  return (
    <div className="space-y-4">
      <Card className="max-w-4xl mx-auto bg-gradient-to-r from-purple-600/20 to-blue-600/20 border-purple-400/30" variant="elevated" padding="md">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Button
              onClick={handleBackToConfig}
              variant="secondary"
              size="default"
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 border-0"
            >
              <ArrowLeft className="w-5 h-5 mr-2" />
              Back to Configuration
            </Button>
            <div className="bg-white/10 backdrop-blur-sm rounded-lg px-4 py-2 border border-white/20">
              <div className="text-sm font-semibold text-white">
                Step 2: Add creatures to &ldquo;{scenarioConfig.name}&rdquo;
              </div>
              <div className="text-xs text-purple-200">
                Level {scenarioConfig.level} • {scenarioConfig.playerCount} player{scenarioConfig.playerCount !== 1 ? 's' : ''}
              </div>
            </div>
          </div>
        </div>
      </Card>
      
      <ScenarioCreatorWithConfig
        config={scenarioConfig}
        onScenarioCreated={onScenarioCreated}
        onCancel={onCancel}
      />
    </div>
  )
}

// Wrapper component that passes the pre-configured values to ScenarioCreator
interface ScenarioCreatorWithConfigProps {
  config: { name: string; level: number; playerCount: number }
  onScenarioCreated: (scenario: Scenario) => void
  onCancel: () => void
}

function ScenarioCreatorWithConfig({ config, onScenarioCreated, onCancel }: ScenarioCreatorWithConfigProps) {
  return (
    <ScenarioCreator
      initialConfig={config}
      onScenarioCreated={onScenarioCreated}
      onCancel={onCancel}
    />
  )
}
