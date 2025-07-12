'use client'

import { useState, useEffect, useCallback } from 'react'
import { Settings, Plus, Heart, Shield, Zap } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Scenario, NPC, Condition } from '@/types/gloomhaven'
import { NPCCard } from './NPCCard'

interface ScenarioManagerProps {
  scenario: Scenario
  onNewScenario: () => void
}

export function ScenarioManager({ scenario, onNewScenario }: ScenarioManagerProps) {
  const [npcs, setNpcs] = useState<NPC[]>([])
  const [loading, setLoading] = useState(true)

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
                  {/* Alive NPCs first */}
                  {aliveInGroup.map((npc) => (
                    <NPCCard
                      key={npc.id}
                      npc={npc}
                      onUpdateHealth={(newHealth: number) => updateHealth(npc.id, newHealth)}
                      onToggleCondition={(condition: Condition) => toggleCondition(npc.id, condition)}
                      onDelete={() => deleteNPC(npc.id)}
                    />
                  ))}
                  
                  {/* Dead NPCs last, with reduced opacity */}
                  {deadInGroup.map((npc) => (
                    <div key={npc.id} className="opacity-50">
                      <NPCCard
                        npc={npc}
                        onUpdateHealth={(newHealth: number) => updateHealth(npc.id, newHealth)}
                        onToggleCondition={(condition: Condition) => toggleCondition(npc.id, condition)}
                        onDelete={() => deleteNPC(npc.id)}
                      />
                    </div>
                  ))}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
