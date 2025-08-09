'use client'

import { useState, useEffect } from 'react'
import { X, Plus, Minus, Users, Search } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { fetchUniqueMonsters, fetchUniqueBosses, getMonsterByNameAndLevel, getBossByNameAndLevel } from '@/lib/creatures'
import { Scenario, MonsterData, SelectedCreature, calculateBossHealth } from '@/types/gloomhaven'
import { Button } from '@/components/ui/Button'
import { Card, CardHeader, CardTitle } from '@/components/ui/Card'
import { Loading } from '@/components/ui/Loading'
import { CreatureImage } from '@/components/ui/CreatureImage'

interface ScenarioCreatorProps {
  onScenarioCreated: (scenario: Scenario) => void
  onCancel: () => void
  initialConfig?: {
    name: string
    level: number
    playerCount: number
  }
}

export function ScenarioCreator({ onScenarioCreated, onCancel, initialConfig }: ScenarioCreatorProps) {
  const [scenarioName, setScenarioName] = useState(initialConfig?.name || '')
  const [scenarioLevel, setScenarioLevel] = useState(initialConfig?.level || 1)
  const [playerCount, setPlayerCount] = useState(initialConfig?.playerCount || 2)
  const [selectedCreatures, setSelectedCreatures] = useState<SelectedCreature[]>([])
  const [isCreating, setIsCreating] = useState(false)
  const [uniqueMonsters, setUniqueMonsters] = useState<string[]>([])
  const [uniqueBosses, setUniqueBosses] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [monsterSearch, setMonsterSearch] = useState('')
  const [bossSearch, setBossSearch] = useState('')

  useEffect(() => {
    const loadCreatures = async () => {
      try {
        const [monsters, bosses] = await Promise.all([
          fetchUniqueMonsters(),
          fetchUniqueBosses()
        ])
        
        setUniqueMonsters(monsters)
        setUniqueBosses(bosses)
      } catch (error) {
        console.error('Error loading creatures:', error)
      } finally {
        setLoading(false)
      }
    }

    loadCreatures()
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
              if (creatureType === 'monster' && monsterType === 'Elite') {
                return { ...sc, eliteCount: sc.eliteCount + 1 }
              } else {
                return { ...sc, normalCount: sc.normalCount + 1 }
              }
            }
            return sc
          })
        )
      } else {
        const normalCount = creatureType === 'monster' && monsterType === 'Elite' ? 0 : 1
        const eliteCount = creatureType === 'monster' && monsterType === 'Elite' ? 1 : 0
        
        setSelectedCreatures(prev => [...prev, {
          monster: creatureData!,
          creatureType,
          normalCount,
          eliteCount
        }])
      }
    } catch (error) {
      console.error(`Error adding ${creatureType}:`, error)
    }
  }

  const handleRemoveCreature = (name: string, creatureType: 'monster' | 'boss', monsterType?: 'Normal' | 'Elite' | 'Boss') => {
    const existingIndex = selectedCreatures.findIndex(
      (sc) => sc.monster.name === name && sc.creatureType === creatureType
    )

    if (existingIndex !== -1) {
      const updated = [...selectedCreatures]
      const creature = updated[existingIndex]

      if (creatureType === 'monster' && monsterType === 'Elite') {
        creature.eliteCount = Math.max(0, creature.eliteCount - 1)
      } else {
        creature.normalCount = Math.max(0, creature.normalCount - 1)
      }

      if (creature.normalCount === 0 && creature.eliteCount === 0) {
        updated.splice(existingIndex, 1)
      }

      setSelectedCreatures(updated)
    }
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
      const { data: scenarioData, error: scenarioError } = await supabase
        .from('scenarios')
        .insert({
          name: scenarioName,
          level: scenarioLevel,
          created_at: new Date().toISOString(),
          player_count: playerCount,
          user_id: 'demo-user' // In a real app, this would come from auth
        })
        .select()
        .single()

      if (scenarioError) throw scenarioError

      // Create NPCs with proper numbering
      let currentPosition = 1
      
      for (const sc of selectedCreatures) {
        // Track numbers for this monster group
        let monsterNumber = 1
        
        // Add normal creatures (monsters) or bosses
        for (let i = 0; i < sc.normalCount; i++) {
          let creatureData = sc.monster
          
          // For bosses, refresh data with current scenario level
          if (sc.creatureType === 'boss') {
            const refreshedBossData = await getBossByNameAndLevel(sc.monster.name, scenarioLevel)
            if (refreshedBossData) {
              creatureData = refreshedBossData
            }
          }
          
          const npcName = sc.creatureType === 'monster' 
            ? `${creatureData.name} Normal ${monsterNumber}`
            : `${creatureData.name} ${monsterNumber}`
            
          const { error } = await supabase
            .from('npcs')
            .insert({
              scenario_id: scenarioData.id,
              name: npcName,
              max_health: calculateHealth(creatureData),
              current_health: calculateHealth(creatureData),
              type: sc.creatureType,
              monster_type: sc.creatureType === 'monster' ? 'Normal' : 'Boss',
              position: currentPosition,
              move: creatureData.move || '',
              attack: String(creatureData.attack || ''),
              range: creatureData.range || '',
              special_traits: creatureData.special_traits || '',
              conditions: [],
              abilities: creatureData.special_actions || [],
              immunities: [],
              notes: creatureData.notes || '',
              group_name: creatureData.name // Each monster type gets its own group
            })

          if (error) throw error
          monsterNumber++
          currentPosition++
        }

        // Add elite creatures for monsters
        if (sc.creatureType === 'monster' && sc.eliteCount > 0) {
          const eliteData = await getMonsterByNameAndLevel(sc.monster.name, scenarioLevel, 'Elite')
          if (eliteData) {
            for (let i = 0; i < sc.eliteCount; i++) {
              const npcName = `${eliteData.name} Elite ${monsterNumber}`
              
              const { error } = await supabase
                .from('npcs')
                .insert({
                  scenario_id: scenarioData.id,
                  name: npcName,
                  max_health: calculateHealth(eliteData),
                  current_health: calculateHealth(eliteData),
                  type: 'monster',
                  monster_type: 'Elite',
                  position: currentPosition,
                  move: eliteData.move || '',
                  attack: String(eliteData.attack || ''),
                  range: eliteData.range || '',
                  special_traits: eliteData.special_traits || '',
                  conditions: [],
                  abilities: eliteData.special_actions || [],
                  immunities: [],
                  notes: eliteData.notes || '',
                  group_name: sc.monster.name // Same group as normal monsters
                })

              if (error) throw error
              monsterNumber++
              currentPosition++
            }
          }
        }
      }

      onScenarioCreated(scenarioData)
    } catch (error) {
      console.error('Error creating scenario:', error)
    } finally {
      setIsCreating(false)
    }
  }

  const filteredMonsters = uniqueMonsters.filter(monster =>
    monster.toLowerCase().includes(monsterSearch.toLowerCase())
  )

  const filteredBosses = uniqueBosses.filter(boss =>
    boss.toLowerCase().includes(bossSearch.toLowerCase())
  )

  if (loading) {
    return <Loading />
  }

  return (
    <Card className="max-w-7xl mx-auto animate-scale-in" variant="elevated" padding="lg">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle>Create New Scenario</CardTitle>
          <Button
            onClick={onCancel}
            variant="ghost"
            size="icon"
          >
            <X className="w-6 h-6" />
          </Button>
        </div>
      </CardHeader>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column - Monster/Boss Selection */}
        <div className="space-y-4">
          {/* Only show configuration fields if not using initialConfig */}
          {!initialConfig && (
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10 mb-6">
              <h3 className="text-lg font-semibold text-white mb-4">Scenario Configuration</h3>
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
              </div>
            </div>
          )}

          {/* Monsters Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-medium">Monsters</h3>
              <span className="text-gray-400 text-sm">
                {filteredMonsters.length} of {uniqueMonsters.length}
              </span>
            </div>
            
            {/* Monster Search */}
            <div className="mb-3 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={monsterSearch}
                onChange={(e) => setMonsterSearch(e.target.value)}
                placeholder="Search monsters..."
                className="w-full pl-10 pr-10 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
              />
              {monsterSearch && (
                <button
                  onClick={() => setMonsterSearch('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
              {filteredMonsters.length === 0 && monsterSearch ? (
                <div className="text-gray-400 text-center py-4">
                  No monsters found matching &ldquo;{monsterSearch}&rdquo;
                </div>
              ) : (
                filteredMonsters.map((monsterName) => (
                <div key={monsterName} className="bg-white/10 rounded-lg p-3">
                  <div className="flex items-center gap-3 mb-2">
                    <CreatureImage 
                      creatureName={monsterName}
                      type="monster"
                      size="lg"
                    />
                    <span className="text-white font-medium">{monsterName}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => handleAddCreature(monsterName, 'monster', 'Normal')}
                      variant="secondary"
                      size="sm"
                      className="text-blue-300 border-blue-500/50 hover:bg-blue-600/20"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Normal
                    </Button>
                    <Button
                      onClick={() => handleAddCreature(monsterName, 'monster', 'Elite')}
                      variant="secondary"
                      size="sm"
                      className="text-yellow-300 border-yellow-500/50 hover:bg-yellow-600/20"
                    >
                      <Plus className="w-3 h-3 mr-1" />
                      Elite
                    </Button>
                  </div>
                </div>
              )))}
            </div>
          </div>

          {/* Bosses Section */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-white font-medium">Bosses</h3>
              <span className="text-gray-400 text-sm">
                {filteredBosses.length} of {uniqueBosses.length}
              </span>
            </div>
            
            {/* Boss Search */}
            <div className="mb-3 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <input
                type="text"
                value={bossSearch}
                onChange={(e) => setBossSearch(e.target.value)}
                placeholder="Search bosses..."
                className="w-full pl-10 pr-10 py-2 bg-white/20 border border-white/30 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-purple-400"
              />
              {bossSearch && (
                <button
                  onClick={() => setBossSearch('')}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto">
              {filteredBosses.length === 0 && bossSearch ? (
                <div className="text-gray-400 text-center py-4">
                  No bosses found matching &ldquo;{bossSearch}&rdquo;
                </div>
              ) : (
                filteredBosses.map((bossName) => (
                <button
                  key={bossName}
                  onClick={() => handleAddCreature(bossName, 'boss')}
                  className="text-left p-3 bg-red-600/20 hover:bg-red-600/30 rounded-lg transition-colors border border-red-600/50"
                >
                  <div className="flex items-center gap-3">
                    <CreatureImage 
                      creatureName={bossName}
                      type="boss"
                      size="lg"
                    />
                    <span className="text-white font-medium">{bossName}</span>
                  </div>
                </button>
              )))}
            </div>
          </div>
        </div>

        {/* Right Column - Selected Creatures */}
        <div className="space-y-4">
          {/* Selected Creatures */}
          {selectedCreatures.length > 0 && (
            <div>
              <h3 className="text-white font-medium mb-2">Selected Creatures</h3>
              <div className="space-y-2 max-h-screen overflow-y-auto">
                {selectedCreatures.map((sc) => (
                  <div
                    key={`${sc.monster.name}-${sc.creatureType}`}
                    className="bg-white/10 p-3 rounded-lg"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <CreatureImage 
                          creatureName={sc.monster.name}
                          type={sc.creatureType}
                          size="lg"
                        />
                        <div>
                          <h4 className="text-white font-medium">{sc.monster.name}</h4>
                          <p className="text-gray-400 text-sm">
                            HP: {calculateHealth(sc.monster)} | Attack: {sc.monster.attack}
                          </p>
                        </div>
                      </div>
                      <button
                        onClick={() => handleRemoveCreature(sc.monster.name, sc.creatureType)}
                        className="text-gray-400 hover:text-red-400 transition-colors p-1"
                        title="Remove this creature completely"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                    
                    {sc.creatureType === 'monster' && (
                      <div className="grid grid-cols-2 gap-2 mt-2">
                        {/* Normal Type */}
                        <div className="flex items-center justify-between bg-white/5 p-2 rounded">
                          <span className="text-blue-300 text-sm">Normal</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleRemoveCreature(sc.monster.name, sc.creatureType, 'Normal')}
                              className="text-red-400 hover:text-red-300 p-1"
                            >
                              <Minus className="w-5 h-5" />
                            </button>
                            <span className="text-white text-sm min-w-[20px] text-center">
                              {sc.normalCount}
                            </span>
                            <button
                              onClick={() => handleAddCreature(sc.monster.name, sc.creatureType, 'Normal')}
                              className="text-green-400 hover:text-green-300 p-1"
                            >
                              <Plus className="w-5 h-5" />
                            </button>
                          </div>
                        </div>

                        {/* Elite Type */}
                        <div className="flex items-center justify-between bg-yellow-600/20 p-2 rounded">
                          <span className="text-yellow-300 text-sm">Elite</span>
                          <div className="flex items-center gap-2">
                            <button
                              onClick={() => handleRemoveCreature(sc.monster.name, sc.creatureType, 'Elite')}
                              className="text-red-400 hover:text-red-300 p-1"
                            >
                              <Minus className="w-5 h-5" />
                            </button>
                            <span className="text-white text-sm min-w-[20px] text-center">
                              {sc.eliteCount}
                            </span>
                            <button
                              onClick={() => handleAddCreature(sc.monster.name, sc.creatureType, 'Elite')}
                              className="text-green-400 hover:text-green-300 p-1"
                            >
                              <Plus className="w-5 h-5" />
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
                              className="text-red-400 hover:text-red-300 p-1"
                            >
                              <Minus className="w-5 h-5" />
                            </button>
                            <span className="text-white text-sm min-w-[20px] text-center">
                              {sc.normalCount}
                            </span>
                            <button
                              onClick={() => handleAddCreature(sc.monster.name, sc.creatureType)}
                              className="text-green-400 hover:text-green-300 p-1"
                            >
                              <Plus className="w-5 h-5" />
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

          {selectedCreatures.length === 0 && (
            <div className="text-center text-gray-400 py-8">
              <div className="bg-white/5 rounded-xl p-6 border border-white/10">
                <h3 className="text-lg font-medium text-white mb-2">No Creatures Selected</h3>
                <p className="text-sm">Select monsters and bosses from the left panel to add them to your scenario.</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex justify-end gap-4 mt-6 pt-6 border-t border-white/20">
        <Button
          onClick={handleCreateScenario}
          disabled={!scenarioName.trim() || selectedCreatures.length === 0 || isCreating}
          variant="default"
          size="lg"
        >
          {isCreating ? 'Creating...' : 'Create Scenario'}
        </Button>
        
        <Button
          onClick={onCancel}
          variant="outline"
          size="lg"
        >
          Cancel
        </Button>
      </div>
    </Card>
  )
}
