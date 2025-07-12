'use client'

import { useState, useEffect } from 'react'
import { Settings, Plus, Heart, Shield, Zap } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Scenario, NPC, CONDITIONS, Condition } from '@/types/gloomhaven'
import { NPCCard } from './NPCCard'

interface ScenarioManagerProps {
  scenario: Scenario
  onNewScenario: () => void
}

export function ScenarioManager({ scenario, onNewScenario }: ScenarioManagerProps) {
  const [npcs, setNpcs] = useState<NPC[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadNPCs()
  }, [scenario.id])

  const loadNPCs = async () => {
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
  }

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

      {/* NPCs Grid */}
      {npcs.length === 0 ? (
        <div className="text-center text-gray-300 py-12">
          <p>No NPCs in this scenario yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Alive NPCs first */}
          {aliveNPCs.map((npc) => (
            <NPCCard
              key={npc.id}
              npc={npc}
              onUpdateHealth={(newHealth: number) => updateHealth(npc.id, newHealth)}
              onToggleCondition={(condition: Condition) => toggleCondition(npc.id, condition)}
              onDelete={() => deleteNPC(npc.id)}
            />
          ))}
          
          {/* Dead NPCs last, with reduced opacity */}
          {deadNPCs.map((npc) => (
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
      )}
    </div>
  )
}
