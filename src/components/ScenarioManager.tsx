'use client'

import { useState, useEffect, useCallback } from 'react'
import { Settings, Plus, Heart, Shield, Zap, UserPlus } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Scenario, NPC, Condition, MonsterData } from '@/types/gloomhaven'
import { fetchUniqueMonsters, fetchUniqueBosses, getMonsterByNameAndLevel, getBossByNameAndLevel } from '@/lib/creatures'
import { NPCCard } from './NPCCard'

interface ScenarioManagerProps {
  scenario: Scenario
  onNewScenario: () => void
}

export function ScenarioManager({ scenario, onNewScenario }: ScenarioManagerProps) {
  const [npcs, setNpcs] = useState<NPC[]>([])
  const [loading, setLoading] = useState(true)
  const [showAddMonster, setShowAddMonster] = useState(false)
  const [uniqueMonsters, setUniqueMonsters] = useState<string[]>([])
  const [uniqueBosses, setUniqueBosses] = useState<string[]>([])
  const [addingMonster, setAddingMonster] = useState(false)

  const loadNPCs = useCallback(async () => {
    try {
      const { data, error } = await supabase
        .from('npcs')
        .select('*')
        .eq('scenario_id', scenario.id)
        .order('position')

      if (error) throw error
      setNpcs(data || [])
    } catch (error) {
      console.error('Error loading NPCs:', error)
    } finally {
      setLoading(false)
    }
  }, [scenario.id])

  useEffect(() => {
    loadNPCs()
    
    // Load creature names for adding monsters
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
      }
    }

    loadCreatureNames()
  }, [loadNPCs])

  const updateNPC = async (npcId: string, updates: Partial<NPC>) => {
    try {
      const { error } = await supabase
        .from('npcs')
        .update(updates)
        .eq('id', npcId)

      if (error) throw error

      setNpcs(prev => 
        prev.map(npc => 
          npc.id === npcId ? { ...npc, ...updates } : npc
        )
      )
    } catch (error) {
      console.error('Error updating NPC:', error)
    }
  }

  const updateHealth = (npcId: string, newHealth: number) => {
    const npc = npcs.find(n => n.id === npcId)
    if (!npc) return

    const clampedHealth = Math.max(0, Math.min(newHealth, npc.max_health))
    updateNPC(npcId, { current_health: clampedHealth })
  }

  const toggleCondition = (npcId: string, condition: Condition) => {
    const npc = npcs.find(n => n.id === npcId)
    if (!npc) return

    const newConditions = npc.conditions.includes(condition)
      ? npc.conditions.filter(c => c !== condition)
      : [...npc.conditions, condition]

    updateNPC(npcId, { conditions: newConditions })
  }

  const deleteNPC = async (npcId: string) => {
    try {
      const { error } = await supabase
        .from('npcs')
        .delete()
        .eq('id', npcId)

      if (error) throw error

      setNpcs(prev => prev.filter(npc => npc.id !== npcId))
    } catch (error) {
      console.error('Error deleting NPC:', error)
    }
  }

  const addMonsterToScenario = async (monsterName: string, monsterType: 'Normal' | 'Elite', creatureType: 'monster' | 'boss', quantity: number = 1) => {
    setAddingMonster(true)
    try {
      let monsterData: MonsterData | null = null
      
      if (creatureType === 'monster') {
        monsterData = await getMonsterByNameAndLevel(monsterName, scenario.level, monsterType)
      } else {
        monsterData = await getBossByNameAndLevel(monsterName, scenario.level)
      }

      if (!monsterData) {
        console.error('Monster data not found')
        return
      }

      // Calculate health for bosses
      const health = typeof monsterData.hp === 'string' 
        ? (monsterData.type === 'Boss' && scenario.player_count 
            ? parseInt(monsterData.hp.replace('×C', '')) * scenario.player_count 
            : parseInt(monsterData.hp) || 0)
        : monsterData.hp

      // Get the next position for this NPC
      const maxPosition = npcs.length > 0 ? Math.max(...npcs.map(npc => npc.position)) : 0

      // Get existing ALIVE monsters of the same type to determine numbering (exclude defeated ones)
      const existingMonstersOfSameType = npcs.filter(npc => 
        npc.group_name === monsterData.name && npc.current_health > 0
      )
      
      // Extract existing numbers from monster names
      const existingNumbers = existingMonstersOfSameType
        .map(npc => {
          // Extract number from names like "Bandit Guard Normal 1", "Bandit Guard Elite 2", etc.
          const match = npc.name.match(/(\d+)$/)
          return match ? parseInt(match[1]) : 0
        })
        .filter(num => num > 0)
        .sort((a, b) => a - b)

      // Find available numbers (fill gaps first, then continue sequence)
      const getAvailableNumbers = (count: number): number[] => {
        const available: number[] = []
        let currentNumber = 1

        // First, fill any gaps in existing numbering
        for (let i = 0; i < existingNumbers.length && available.length < count; i++) {
          while (currentNumber < existingNumbers[i] && available.length < count) {
            available.push(currentNumber)
            currentNumber++
          }
          currentNumber = existingNumbers[i] + 1
        }

        // Then continue with next available numbers
        while (available.length < count) {
          if (!existingNumbers.includes(currentNumber)) {
            available.push(currentNumber)
          }
          currentNumber++
        }

        return available
      }

      const availableNumbers = getAvailableNumbers(quantity)

      // Create multiple NPCs based on quantity
      const newNPCs = []
      for (let i = 0; i < quantity; i++) {
        const monsterNumber = availableNumbers[i]
        
        // Create appropriate name based on type with proper numbering
        let npcName = monsterData.name
        if (creatureType === 'monster') {
          npcName = `${monsterData.name} ${monsterType} ${monsterNumber}`
        } else {
          npcName = `${monsterData.name} ${monsterNumber}`
        }

        const newNPC = {
          scenario_id: scenario.id,
          name: npcName,
          type: creatureType,
          monster_type: monsterData.type,
          max_health: health,
          current_health: health,
          conditions: [],
          abilities: monsterData.special_actions || [],
          position: maxPosition + 1 + i,
          move: monsterData.move || '',
          attack: String(monsterData.attack || ''),
          range: monsterData.range || '',
          special_traits: monsterData.special_traits || '',
          immunities: monsterData.immunities || [],
          notes: monsterData.notes || '',
          group_name: monsterData.name, // Group by monster name only, not by type (Normal/Elite)
        }
        newNPCs.push(newNPC)
      }

      const { data, error } = await supabase
        .from('npcs')
        .insert(newNPCs)
        .select()

      if (error) throw error

      // Add the new NPCs and then re-sort the entire list to maintain proper ordering
      const updatedNPCs = [...npcs, ...data].sort((a, b) => {
        // First sort by group_name
        if (a.group_name !== b.group_name) {
          return (a.group_name || '').localeCompare(b.group_name || '')
        }
        
        // Within the same group, sort by the number in the name
        const getNumberFromName = (name: string) => {
          const match = name.match(/(\d+)$/)
          return match ? parseInt(match[1]) : 0
        }
        
        const aNumber = getNumberFromName(a.name)
        const bNumber = getNumberFromName(b.name)
        
        // If both have numbers, sort by number
        if (aNumber > 0 && bNumber > 0) {
          return aNumber - bNumber
        }
        
        // Fallback to name comparison
        return a.name.localeCompare(b.name)
      })

      setNpcs(updatedNPCs)
      setShowAddMonster(false)
    } catch (error) {
      console.error('Error adding monster:', error)
    } finally {
      setAddingMonster(false)
    }
  }

  const monsters = npcs.filter(npc => npc.type === 'monster')
  const bosses = npcs.filter(npc => npc.type === 'boss')
  const aliveNPCs = npcs.filter(npc => npc.current_health > 0)
  const deadNPCs = npcs.filter(npc => npc.current_health === 0)

  // Group NPCs by group_name for better organization
  const groupedNPCs = npcs.reduce((groups, npc) => {
    const groupName = npc.group_name || 'Other'
    if (!groups[groupName]) {
      groups[groupName] = []
    }
    groups[groupName].push(npc)
    return groups
  }, {} as Record<string, NPC[]>)

  // Load unique monsters and bosses for adding new NPCs
  useEffect(() => {
    const loadUniqueMonstersAndBosses = async () => {
      try {
        const monsters = await fetchUniqueMonsters()
        const bosses = await fetchUniqueBosses()
        setUniqueMonsters(monsters)
        setUniqueBosses(bosses)
      } catch (error) {
        console.error('Error fetching unique monsters or bosses:', error)
      }
    }

    loadUniqueMonstersAndBosses()
  }, [])

  if (loading) {
    return (
      <div className="text-center text-white">
        <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent rounded-full"></div>
        <p className="mt-2">Loading scenario...</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Scenario Header */}
      <div className="bg-white/10 backdrop-blur-sm rounded-xl p-6">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">{scenario.name}</h1>
            <p className="text-gray-300">
              Level {scenario.level} • {aliveNPCs.length} alive, {deadNPCs.length} defeated
            </p>
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={onNewScenario}
              className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" />
              New Scenario
            </button>
            <button className="bg-white/20 hover:bg-white/30 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Settings
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-4">
          <div className="bg-white/10 p-3 rounded-lg text-center">
            <div className="flex items-center justify-center gap-2 text-blue-400 mb-1">
              <Shield className="w-4 h-4" />
              <span className="text-sm font-medium">Monsters</span>
            </div>
            <p className="text-white text-xl font-bold">{monsters.length}</p>
          </div>
          
          <div className="bg-white/10 p-3 rounded-lg text-center">
            <div className="flex items-center justify-center gap-2 text-yellow-400 mb-1">
              <Zap className="w-4 h-4" />
              <span className="text-sm font-medium">Bosses</span>
            </div>
            <p className="text-white text-xl font-bold">{bosses.length}</p>
          </div>
          
          <div className="bg-white/10 p-3 rounded-lg text-center">
            <div className="flex items-center justify-center gap-2 text-green-400 mb-1">
              <Heart className="w-4 h-4" />
              <span className="text-sm font-medium">Alive</span>
            </div>
            <p className="text-white text-xl font-bold">{aliveNPCs.length}</p>
          </div>
          
          <div className="bg-white/10 p-3 rounded-lg text-center">
            <div className="flex items-center justify-center gap-2 text-red-400 mb-1">
              <Heart className="w-4 h-4" />
              <span className="text-sm font-medium">Defeated</span>
            </div>
            <p className="text-white text-xl font-bold">{deadNPCs.length}</p>
          </div>
        </div>
      </div>

      {/* NPCs Grid - Grouped by type */}
      {npcs.length === 0 ? (
        <div className="text-center text-gray-300 py-12">
          <p>No NPCs in this scenario yet.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedNPCs).map(([groupName, groupNPCs]) => {
            const aliveInGroup = groupNPCs.filter(npc => npc.current_health > 0)
            const deadInGroup = groupNPCs.filter(npc => npc.current_health === 0)
            
            return (
              <div key={groupName} className="bg-white/5 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-white">{groupName}</h3>
                  <div className="text-sm text-gray-300">
                    {aliveInGroup.length} alive • {deadInGroup.length} defeated
                  </div>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {/* Sort NPCs within group by number, then show alive first, dead last */}
                  {[...aliveInGroup, ...deadInGroup]
                    .sort((a, b) => {
                      // Extract number from name for sorting
                      const getNumberFromName = (name: string) => {
                        const match = name.match(/(\d+)$/)
                        return match ? parseInt(match[1]) : 0
                      }
                      
                      const aNumber = getNumberFromName(a.name)
                      const bNumber = getNumberFromName(b.name)
                      
                      // If both have numbers, sort by number
                      if (aNumber > 0 && bNumber > 0) {
                        return aNumber - bNumber
                      }
                      
                      // Fallback to name comparison
                      return a.name.localeCompare(b.name)
                    })
                    .map((npc) => {
                      const isDead = npc.current_health === 0
                      return isDead ? (
                        <div key={npc.id} className="opacity-50">
                          <NPCCard
                            npc={npc}
                            onUpdateHealth={(newHealth: number) => updateHealth(npc.id, newHealth)}
                            onToggleCondition={(condition: Condition) => toggleCondition(npc.id, condition)}
                            onDelete={() => deleteNPC(npc.id)}
                          />
                        </div>
                      ) : (
                        <NPCCard
                          key={npc.id}
                          npc={npc}
                          onUpdateHealth={(newHealth: number) => updateHealth(npc.id, newHealth)}
                          onToggleCondition={(condition: Condition) => toggleCondition(npc.id, condition)}
                          onDelete={() => deleteNPC(npc.id)}
                        />
                      )
                    })}
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Add Monster/Boss Section */}
      {showAddMonster && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
          <div className="bg-gray-900 rounded-xl p-6 max-w-lg w-full mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-xl font-bold text-white mb-4">Add Monster/Boss</h3>
            
            <div className="space-y-4">
              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Creature Type
                </label>
                <select
                  id="creatureType"
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  defaultValue="monster"
                  onChange={(e) => {
                    const monsterTypeDiv = document.getElementById('monsterTypeDiv');
                    if (e.target.value === 'boss') {
                      monsterTypeDiv!.style.display = 'none';
                    } else {
                      monsterTypeDiv!.style.display = 'block';
                    }
                  }}
                >
                  <option value="monster" className="bg-gray-800 text-white">Monster</option>
                  <option value="boss" className="bg-gray-800 text-white">Boss</option>
                </select>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Creature Name
                </label>
                <select
                  id="creatureName"
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="" className="bg-gray-800 text-white">Select a creature...</option>
                  {uniqueMonsters.map(name => (
                    <option key={`monster-${name}`} value={name} className="bg-gray-800 text-white">{name}</option>
                  ))}
                  {uniqueBosses.map(name => (
                    <option key={`boss-${name}`} value={name} className="bg-gray-800 text-white">{name}</option>
                  ))}
                </select>
              </div>

              <div id="monsterTypeDiv">
                <label className="block text-white text-sm font-medium mb-2">
                  Monster Type
                </label>
                <select
                  id="monsterVariant"
                  className="w-full bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                >
                  <option value="Normal" className="bg-gray-800 text-white">Normal</option>
                  <option value="Elite" className="bg-gray-800 text-white">Elite</option>
                </select>
              </div>

              <div>
                <label className="block text-white text-sm font-medium mb-2">
                  Quantity
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById('quantity') as HTMLInputElement;
                      const current = parseInt(input.value) || 1;
                      if (current > 1) input.value = String(current - 1);
                    }}
                    className="bg-gray-700 hover:bg-gray-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold"
                  >
                    -
                  </button>
                  <input
                    id="quantity"
                    type="number"
                    min="1"
                    max="20"
                    defaultValue="1"
                    className="w-20 bg-gray-800 border border-gray-600 rounded-lg px-3 py-2 text-white text-center focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      const input = document.getElementById('quantity') as HTMLInputElement;
                      const current = parseInt(input.value) || 1;
                      if (current < 20) input.value = String(current + 1);
                    }}
                    className="bg-gray-700 hover:bg-gray-600 text-white w-8 h-8 rounded-lg flex items-center justify-center font-bold"
                  >
                    +
                  </button>
                </div>
                <p className="text-gray-400 text-xs mt-1">Maximum 20 monsters at once</p>
              </div>
            </div>

            <div className="flex justify-end gap-3 mt-6">
              <button
                onClick={() => setShowAddMonster(false)}
                className="bg-gray-700 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={async () => {
                  const creatureType = (document.getElementById('creatureType') as HTMLSelectElement).value as 'monster' | 'boss'
                  const creatureName = (document.getElementById('creatureName') as HTMLSelectElement).value
                  const monsterVariant = (document.getElementById('monsterVariant') as HTMLSelectElement).value as 'Normal' | 'Elite'
                  const quantity = parseInt((document.getElementById('quantity') as HTMLInputElement).value) || 1
                  
                  if (!creatureName) {
                    alert('Please select a creature')
                    return
                  }
                  
                  if (quantity < 1 || quantity > 20) {
                    alert('Quantity must be between 1 and 20')
                    return
                  }
                  
                  await addMonsterToScenario(creatureName, monsterVariant, creatureType, quantity)
                }}
                disabled={addingMonster}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 disabled:opacity-50 text-white px-4 py-2 rounded-lg font-semibold transition-all duration-200 flex items-center gap-2"
              >
                {addingMonster ? (
                  <div className="animate-spin inline-block w-4 h-4 border-4 border-current border-t-transparent rounded-full"></div>
                ) : (
                  <Plus className="w-4 h-4" />
                )}
                Add Creature(s)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add Monster Button - Always visible */}
      <div className="fixed bottom-4 right-4">
        <button
          onClick={() => setShowAddMonster(true)}
          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-6 py-4 rounded-full shadow-xl transition-all duration-200 flex items-center gap-3 text-lg font-semibold hover:scale-105"
        >
          <UserPlus className="w-6 h-6" />
          Add Monster
        </button>
      </div>
    </div>
  )
}
