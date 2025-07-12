'use client'

import { useState } from 'react'
import { Heart, Minus, Plus, Trash2, Eye, EyeOff } from 'lucide-react'
import { NPC, CONDITIONS, Condition } from '@/types/gloomhaven'
import clsx from 'clsx'

interface NPCCardProps {
  npc: NPC
  onUpdateHealth: (newHealth: number) => void
  onToggleCondition: (condition: Condition) => void
  onDelete: () => void
}

export function NPCCard({ npc, onUpdateHealth, onToggleCondition, onDelete }: NPCCardProps) {
  const [showAbilities, setShowAbilities] = useState(false)
  const [showConditions, setShowConditions] = useState(false)

  const healthPercentage = (npc.current_health / npc.max_health) * 100
  const isDead = npc.current_health === 0
  const isInjured = healthPercentage <= 50 && !isDead
  const isCritical = healthPercentage <= 25 && !isDead

  const getHealthColor = () => {
    if (isDead) return 'bg-red-600'
    if (isCritical) return 'bg-red-500'
    if (isInjured) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const getCardBorder = () => {
    if (npc.type === 'boss') return 'border-yellow-500/50'
    return 'border-white/20'
  }

  return (
    <div className={clsx(
      'bg-white/10 backdrop-blur-sm rounded-xl p-4 border-2 transition-all duration-200',
      getCardBorder(),
      isDead && 'opacity-75'
    )}>
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className={clsx(
            'font-bold text-lg',
            npc.type === 'boss' ? 'text-yellow-300' : 'text-white'
          )}>
            {npc.name}
          </h3>
          <p className="text-gray-400 text-sm capitalize">{npc.type}</p>
        </div>
        <button
          onClick={onDelete}
          className="text-gray-400 hover:text-red-400 transition-colors"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>

      {/* Health Bar */}
      <div className="mb-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-white font-medium flex items-center gap-1">
            <Heart className="w-4 h-4" />
            Health
          </span>
          <span className="text-white">
            {npc.current_health} / {npc.max_health}
          </span>
        </div>
        
        <div className="bg-gray-700 rounded-full h-3 overflow-hidden">
          <div
            className={clsx(
              'h-full transition-all duration-300',
              getHealthColor()
            )}
            style={{ width: `${healthPercentage}%` }}
          />
        </div>

        {/* Health Controls */}
        <div className="flex items-center justify-center gap-2 mt-2">
          <button
            onClick={() => onUpdateHealth(npc.current_health - 1)}
            disabled={npc.current_health <= 0}
            className="bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-1 rounded"
          >
            <Minus className="w-4 h-4" />
          </button>
          
          <input
            type="number"
            value={npc.current_health}
            onChange={(e) => onUpdateHealth(parseInt(e.target.value) || 0)}
            className="w-16 px-2 py-1 bg-white/20 border border-white/30 rounded text-white text-center text-sm focus:outline-none focus:border-purple-400"
            min="0"
            max={npc.max_health}
          />
          
          <button
            onClick={() => onUpdateHealth(npc.current_health + 1)}
            disabled={npc.current_health >= npc.max_health}
            className="bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white p-1 rounded"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="flex gap-2 mb-4">
        <button
          onClick={() => onUpdateHealth(0)}
          className="flex-1 bg-red-600 hover:bg-red-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
        >
          Defeat
        </button>
        <button
          onClick={() => onUpdateHealth(npc.max_health)}
          className="flex-1 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded text-sm font-medium transition-colors"
        >
          Heal Full
        </button>
      </div>

      {/* Conditions */}
      <div className="mb-3">
        <button
          onClick={() => setShowConditions(!showConditions)}
          className="flex items-center justify-between w-full text-white font-medium mb-2"
        >
          <span>Conditions ({npc.conditions.length})</span>
          {showConditions ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
        
        {npc.conditions.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {npc.conditions.map((condition) => (
              <span
                key={condition}
                onClick={() => onToggleCondition(condition as Condition)}
                className="bg-purple-600 text-white px-2 py-1 rounded text-xs cursor-pointer hover:bg-purple-700 transition-colors"
              >
                {condition}
              </span>
            ))}
          </div>
        )}

        {showConditions && (
          <div className="grid grid-cols-2 gap-1">
            {CONDITIONS.map((condition) => (
              <button
                key={condition}
                onClick={() => onToggleCondition(condition as Condition)}
                className={clsx(
                  'px-2 py-1 rounded text-xs font-medium transition-colors',
                  npc.conditions.includes(condition)
                    ? 'bg-purple-600 text-white'
                    : 'bg-white/20 text-gray-300 hover:bg-white/30'
                )}
              >
                {condition}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Abilities */}
      <div>
        <button
          onClick={() => setShowAbilities(!showAbilities)}
          className="flex items-center justify-between w-full text-white font-medium mb-2"
        >
          <span>Abilities ({npc.abilities.length})</span>
          {showAbilities ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
        
        {showAbilities && (
          <div className="space-y-1">
            {npc.abilities.map((ability, index) => (
              <div
                key={index}
                className="bg-white/10 px-2 py-1 rounded text-sm text-gray-300"
              >
                {ability}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
