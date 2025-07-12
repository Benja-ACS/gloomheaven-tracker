'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Minus, Users } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { fetchUniqueMonsters, fetchUniqueBosses, getMonsterByNameAndLevel, getBossByNameAndLevel } from '@/lib/creatures'
import { Scenario, MonsterData, SelectedCreature, calculateBossHealth } from '@/types/gloomhaven'

interface ScenarioCreatorProps {
  onScenarioCreated: (scenario: Scenario) => void
  onCancel: () => void
}

export function ScenarioCreator({ onScenarioCreated, onCancel }: ScenarioCreatorProps) {
  const [scenarioName, setScenarioName] = useState('')
  const [scenarioLevel, setScenarioLevel] = useState(1)
  const [playerCount, setPlayerCount] = useState(2)
  const [selectedCreatures, setSelectedCreatures] = useState<SelectedCreature[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [uniqueMonsters, setUniqueMonsters] = useState<string[]>([])
  const [uniqueBosses, setUniqueBosses] = useState<string[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const loadCreatureNames = async () => {
      try {
        const [monsters, bosses] = await Promise.all([
          fetchUniqueMonsters(),
          fetchUniqueBosses()
        ])
        setUniqueMonsters(monsters)
        setUniqueBosses(bosses)
      } catch (error) {
        console.error('Error loading creature names:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCreatureNames()
  }, [])

  const handleAddCreature = async (name: string, creatureType: 'monster' | 'boss', monsterType?: 'Normal' | 'Elite') => {
    try {
      let creatureData: MonsterData | null = null
      
      if (creatureType === 'monster' && monsterType) {
        creatureData = await getMonsterByNameAndLevel(name, scenarioLevel, monsterType)
      } else if (creatureType === 'boss') {
        creatureData = await getBossByNameAndLevel(name, scenarioLevel)
      }

      if (!creatureData) return

      const existing = selectedCreatures.find(sc => 
        sc.monster.name === name && sc.creatureType === creatureType
      )

      if (existing) {
        setSelectedCreatures(prev => 
          prev.map(sc => {
            if (sc.monster.name === name && sc.creatureType === creatureType) {
              if (creatureType === 'monster' && monsterType === 'Normal') {
                return { ...sc, normalCount: sc.normalCount + 1 }
              } else if (creatureType === 'monster' && monsterType === 'Elite') {
                return { ...sc, eliteCount: sc.eliteCount + 1 }
              } else {
                return { ...sc, normalCount: sc.normalCount + 1 } // Bosses use normalCount
              }
            }
            return sc
          })
        )
      } else {
        const newCreature: SelectedCreature = {
          monster: creatureData,
          normalCount: (creatureType === 'boss' || monsterType === 'Normal') ? 1 : 0,
          eliteCount: (monsterType === 'Elite') ? 1 : 0,
          creatureType
        }
        setSelectedCreatures(prev => [...prev, newCreature])
      }
    } catch (error) {
      console.error('Error adding creature:', error)
    }
  }

  const handleRemoveCreature = (name: string, creatureType: 'monster' | 'boss', monsterType: 'Normal' | 'Elite' | 'Boss') => {
    setSelectedCreatures(prev => 
      prev.map(sc => {
        if (sc.monster.name === name && sc.creatureType === creatureType) {
          if (monsterType === 'Normal' && sc.normalCount > 0) {
            return { ...sc, normalCount: sc.normalCount - 1 }
          } else if (monsterType === 'Elite' && sc.eliteCount > 0) {
            return { ...sc, eliteCount: sc.eliteCount - 1 }
          }
        }
        return sc
      }).filter(sc => sc.normalCount > 0 || sc.eliteCount > 0)
    )
  }

  const calculateHealth = (creature: MonsterData): number => {
    if (typeof creature.hp === 'string') {
      // Boss health with multiplier
      return calculateBossHealth(creature.hp, playerCount)
    }
    return creature.hp
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
          user_id: 'demo-user', // In a real app, this would come from auth
          player_count: playerCount
        })
        .select()
        .single()

      if (scenarioError) throw scenarioError

      // Create NPCs
      const npcsToCreate = []
      let position = 0

      for (const selectedCreature of selectedCreatures) {
        const { monster, normalCount, eliteCount, creatureType } = selectedCreature
        
        // Add Normal type creatures
        for (let i = 0; i < normalCount; i++) {
          const health = calculateHealth(monster)
          const groupName = `${monster.name} (${creatureType === 'boss' ? 'Boss' : 'Normal'})`
          
          npcsToCreate.push({
            scenario_id: scenario.id,
            name: `${monster.name} ${creatureType === 'boss' ? '' : 'Normal '}${i + 1}`,
            type: creatureType,
            monster_type: creatureType === 'boss' ? 'Boss' : 'Normal',
            max_health: health,
            current_health: health,
            conditions: [],
            abilities: monster.special_actions || [],
            position: position++,
            move: monster.move,
            attack: monster.attack?.toString(),
            range: monster.range,
            special_traits: monster.special_traits,
            immunities: monster.immunities || [],
            notes: monster.notes,
            group_name: groupName
          })
        }

        // Add Elite type creatures (only for monsters)
        for (let i = 0; i < eliteCount; i++) {
          // Fetch elite version
          const eliteData = await getMonsterByNameAndLevel(monster.name, scenarioLevel, 'Elite')
          if (eliteData) {
            const health = calculateHealth(eliteData)
            const groupName = `${monster.name} (Elite)`
            
            npcsToCreate.push({
              scenario_id: scenario.id,
              name: `${monster.name} Elite ${i + 1}`,
              type: creatureType,
              monster_type: 'Elite',
              max_health: health,
              current_health: health,
              conditions: [],
              abilities: eliteData.special_actions || [],
              position: position++,
              move: eliteData.move,
              attack: eliteData.attack?.toString(),
              range: eliteData.range,
              special_traits: eliteData.special_traits,
              immunities: eliteData.immunities || [],
              notes: eliteData.notes,
              group_name: groupName
            })
          }
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

  if (loading) {
    return (
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 max-w-4xl mx-auto">
        <div className="text-center text-white">
          <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent rounded-full"></div>
          <p className="mt-2">Loading creatures...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6 max-w-6xl mx-auto">
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

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-white font-medium mb-2">
                Scenario Level (0-7)
              </label>
              <select
                value={scenarioLevel}
                onChange={(e) => setScenarioLevel(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:border-purple-400"
              >
                {[0, 1, 2, 3, 4, 5, 6, 7].map(level => (
                  <option key={level} value={level} className="bg-gray-800">
                    Level {level}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-white font-medium mb-2 flex items-center gap-2">
                <Users className="w-4 h-4" />
                Players (2-4)
              </label>
              <select
                value={playerCount}
                onChange={(e) => setPlayerCount(Number(e.target.value))}
                className="w-full px-3 py-2 bg-white/20 border border-white/30 rounded-lg text-white focus:outline-none focus:border-purple-400"
              >
                {[2, 3, 4].map(count => (
                  <option key={count} value={count} className="bg-gray-800">
                    {count} Players
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Selected Creatures */}
          {selectedCreatures.length > 0 && (
            <div>
              <h3 className="text-white font-medium mb-2">Selected Creatures</h3>
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {selectedCreatures.map((sc) => (
                  <div
                    key={`${sc.monster.name}-${sc.creatureType}`}
                    className="bg-white/10 p-3 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-white font-medium">{sc.monster.name}</span>
                        <span className="text-gray-300 ml-2 text-sm">
                          ({sc.creatureType === 'boss' ? 'Boss' : 'Monster'})
                        </span>
                      </div>
                    </div>
                    
                    {sc.creatureType === 'monster' && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {/* Normal Type */}
                        <div className="flex items-center justify-between bg-white/5 p-2 rounded">
                          <span className="text-blue-300 text-sm">Normal</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleRemoveCreature(sc.monster.name, sc.creatureType, 'Normal')}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-white text-sm min-w-[20px] text-center">
                              {sc.normalCount}
                            </span>
                            <button
                              onClick={() => handleAddCreature(sc.monster.name, sc.creatureType, 'Normal')}
                              className="text-green-400 hover:text-green-300"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>

                        {/* Elite Type */}
                        <div className="flex items-center justify-between bg-yellow-600/20 p-2 rounded">
                          <span className="text-yellow-300 text-sm">Elite</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleRemoveCreature(sc.monster.name, sc.creatureType, 'Elite')}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-white text-sm min-w-[20px] text-center">
                              {sc.eliteCount}
                            </span>
                            <button
                              onClick={() => handleAddCreature(sc.monster.name, sc.creatureType, 'Elite')}
                              className="text-green-400 hover:text-green-300"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                      </div>
                    )}

                    {sc.creatureType === 'boss' && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between bg-red-600/20 p-2 rounded">
                          <span className="text-red-300 text-sm">Boss Count</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleRemoveCreature(sc.monster.name, sc.creatureType, 'Boss')}
                              className="text-red-400 hover:text-red-300"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-white text-sm min-w-[20px] text-center">
                              {sc.normalCount}
                            </span>
                            <button
                              onClick={() => handleAddCreature(sc.monster.name, sc.creatureType)}
                              className="text-green-400 hover:text-green-300"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        </div>
                        <div className="text-xs text-gray-400 mt-1">
                          HP: {calculateHealth(sc.monster)} ({sc.monster.hp})
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Creature Selection */}
        <div className="space-y-4">
          <div>
            <h3 className="text-white font-medium mb-3">Monsters</h3>
            <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
              {uniqueMonsters.map((monsterName) => (
                <div key={monsterName} className="bg-white/10 rounded-lg p-3">
                  <div className="text-white font-medium mb-2">{monsterName}</div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => handleAddCreature(monsterName, 'monster', 'Normal')}
                      className="text-left p-2 bg-blue-600/20 hover:bg-blue-600/30 rounded transition-colors text-sm"
                    >
                      <div className="text-blue-200">Add Normal</div>
                    </button>
                    <button
                      onClick={() => handleAddCreature(monsterName, 'monster', 'Elite')}
                      className="text-left p-2 bg-yellow-600/20 hover:bg-yellow-600/30 rounded transition-colors text-sm"
                    >
                      <div className="text-yellow-200">Add Elite</div>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-white font-medium mb-3">Bosses</h3>
            <div className="grid grid-cols-1 gap-2 max-h-60 overflow-y-auto">
              {uniqueBosses.map((bossName) => (
                <button
                  key={bossName}
                  onClick={() => handleAddCreature(bossName, 'boss')}
                  className="text-left p-3 bg-red-600/20 hover:bg-red-600/30 rounded-lg transition-colors border border-red-600/50"
                >
                  <div className="text-red-200 font-medium">{bossName}</div>
                  <div className="text-red-300 text-sm">Boss Creature</div>
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
