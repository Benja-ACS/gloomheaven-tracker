'use client'

import { useState } from 'react'
import { X, Plus, Minus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Scenario, GLOOMHAVEN_MONSTERS, GLOOMHAVEN_BOSSES, MonsterData } from '@/types/gloomhaven'

interface ScenarioCreatorProps {
  onScenarioCreated: (scenario: Scenario) => void
  onCancel: () => void
}

interface SelectedNPC {
  monster: MonsterData
  count: number
  type: 'monster' | 'boss'
}

export function ScenarioCreator({ onScenarioCreated, onCancel }: ScenarioCreatorProps) {
  const [scenarioName, setScenarioName] = useState('')
  const [scenarioLevel, setScenarioLevel] = useState(1)
  const [selectedNPCs, setSelectedNPCs] = useState<SelectedNPC[]>([])
  const [isCreating, setIsCreating] = useState(false)

  const handleAddNPC = (monster: MonsterData, type: 'monster' | 'boss') => {
    const existing = selectedNPCs.find(npc => npc.monster.name === monster.name)
    if (existing) {
      setSelectedNPCs(prev => 
        prev.map(npc => 
          npc.monster.name === monster.name 
            ? { ...npc, count: npc.count + 1 }
            : npc
        )
      )
    } else {
      setSelectedNPCs(prev => [...prev, { monster, count: 1, type }])
    }
  }

  const handleRemoveNPC = (monsterName: string) => {
    setSelectedNPCs(prev => 
      prev.map(npc => 
        npc.monster.name === monsterName && npc.count > 1
          ? { ...npc, count: npc.count - 1 }
          : npc
      ).filter(npc => npc.count > 0)
    )
  }

  const handleCreateScenario = async () => {
    if (!scenarioName.trim()) return
    
    setIsCreating(true)
    try {
      // Create scenario
      const { data: scenario, error: scenarioError } = await supabase
        .from('scenarios')
        .insert({
          name: scenarioName,
          level: scenarioLevel,
          user_id: 'demo-user' // In a real app, this would come from auth
        })
        .select()
        .single()

      if (scenarioError) throw scenarioError

      // Create NPCs
      const npcsToCreate = []
      let position = 0

      for (const selectedNPC of selectedNPCs) {
        for (let i = 0; i < selectedNPC.count; i++) {
          const health = selectedNPC.monster.health[scenarioLevel] || selectedNPC.monster.health[1]
          npcsToCreate.push({
            scenario_id: scenario.id,
            name: `${selectedNPC.monster.name} ${i + 1}`,
            type: selectedNPC.type,
            max_health: health,
            current_health: health,
            conditions: [],
            abilities: selectedNPC.monster.abilities,
            position: position++
          })
        }
      }

      if (npcsToCreate.length > 0) {
        const { error: npcsError } = await supabase
          .from('npcs')
          .insert(npcsToCreate)

        if (npcsError) throw npcsError
      }

      onScenarioCreated(scenario)
    } catch (error) {
      console.error('Error creating scenario:', error)
      alert('Failed to create scenario. Please try again.')
    } finally {
      setIsCreating(false)
    }
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-white">Create New Scenario</h2>
        <button
          onClick={onCancel}
          className="text-gray-400 hover:text-white transition-colors"
        >
          <X className="w-6 h-6" />
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Scenario Details */}
        <div className="space-y-4">
          <div>
            <label className="block text-white font-medium mb-2">
              Scenario Name
            </label>
            <input
              type="text"
              value={scenarioName}
              onChange={(e) => setScenarioName(e.target.value)}
              className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-300 focus:outline-none focus:border-purple-400"
              placeholder="Enter scenario name..."
            />
          </div>

          <div>
            <label className="block text-white font-medium mb-2">
              Scenario Level (1-7)
            </label>
            <select
              value={scenarioLevel}
              onChange={(e) => setScenarioLevel(Number(e.target.value))}
              className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:border-purple-400"
            >
              {[1, 2, 3, 4, 5, 6, 7].map(level => (
                <option key={level} value={level} className="bg-gray-800">
                  Level {level}
                </option>
              ))}
            </select>
          </div>

          {/* Selected NPCs */}
          {selectedNPCs.length > 0 && (
            <div>
              <h3 className="text-white font-medium mb-2">Selected NPCs</h3>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {selectedNPCs.map((npc) => (
                  <div
                    key={npc.monster.name}
                    className="flex items-center justify-between bg-white/10 p-3 rounded-lg"
                  >
                    <div>
                      <span className="text-white font-medium">{npc.monster.name}</span>
                      <span className="text-gray-300 ml-2">
                        (Level {scenarioLevel}: {npc.monster.health[scenarioLevel] || npc.monster.health[1]} HP)
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleRemoveNPC(npc.monster.name)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Minus className="w-4 h-4" />
                      </button>
                      <span className="text-white font-medium min-w-[20px] text-center">
                        {npc.count}
                      </span>
                      <button
                        onClick={() => handleAddNPC(npc.monster, npc.type)}
                        className="text-green-400 hover:text-green-300"
                      >
                        <Plus className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Monster/Boss Selection */}
        <div className="space-y-4">
          <div>
            <h3 className="text-white font-medium mb-3">Monsters</h3>
            <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
              {GLOOMHAVEN_MONSTERS.map((monster) => (
                <button
                  key={monster.name}
                  onClick={() => handleAddNPC(monster, 'monster')}
                  className="text-left p-3 bg-white/10 hover:bg-white/20 rounded-lg transition-colors"
                >
                  <div className="text-white font-medium">{monster.name}</div>
                  <div className="text-gray-300 text-sm">
                    HP: {monster.health[scenarioLevel] || monster.health[1]} | 
                    Abilities: {monster.abilities.slice(0, 2).join(', ')}
                    {monster.abilities.length > 2 && '...'}
                  </div>
                </button>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-white font-medium mb-3">Bosses</h3>
            <div className="grid grid-cols-1 gap-2 max-h-40 overflow-y-auto">
              {GLOOMHAVEN_BOSSES.map((boss) => (
                <button
                  key={boss.name}
                  onClick={() => handleAddNPC(boss, 'boss')}
                  className="text-left p-3 bg-yellow-600/20 hover:bg-yellow-600/30 rounded-lg transition-colors border border-yellow-600/50"
                >
                  <div className="text-yellow-200 font-medium">{boss.name}</div>
                  <div className="text-yellow-300 text-sm">
                    HP: {boss.health[scenarioLevel] || boss.health[1]} | 
                    Abilities: {boss.abilities.slice(0, 2).join(', ')}
                    {boss.abilities.length > 2 && '...'}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-4 mt-6">
        <button
          onClick={handleCreateScenario}
          disabled={!scenarioName.trim() || isCreating}
          className="flex-1 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 disabled:from-gray-600 disabled:to-gray-600 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-200 disabled:cursor-not-allowed"
        >
          {isCreating ? 'Creating...' : 'Create Scenario'}
        </button>
        <button
          onClick={onCancel}
          className="px-6 py-3 border border-gray-400 hover:border-gray-300 text-gray-300 hover:text-white rounded-lg font-semibold transition-colors"
        >
          Cancel
        </button>
      </div>
    </div>
  )
}
