export interface Scenario {
  id: string
  created_at: string
  name: string
  level: number
  user_id: string
  player_count?: number // For boss health multiplier calculation
}

export interface NPC {
  id: string
  created_at: string
  scenario_id: string
  name: string
  type: 'monster' | 'boss'
  monster_type?: 'Normal' | 'Elite' | 'Boss'
  max_health: number
  current_health: number
  conditions: string[]
  abilities: string[]
  position: number
  move?: number
  attack?: string
  range?: string
  special_traits?: string
  immunities?: string[]
  notes?: string
  group_name?: string
}

// Database entities for monsters and bosses
export interface Monster {
  id: number
  name: string
  level: number
  type: 'Normal' | 'Elite'
  hp: number
  move: number
  attack: number
  range: string
  special_traits?: string
  created_at?: string
}

export interface Boss {
  id: number
  name: string
  level: number
  type: string
  hp: string // Format like "8×C"
  move?: number
  attack: string // Can include variables like "3+X"
  range: string
  special_traits?: string
  special_action_1?: string
  special_action_2?: string
  immune_poison: boolean
  immune_wound: boolean
  immune_immobilize: boolean
  immune_disarm: boolean
  immune_knockout: boolean
  immune_confuse: boolean
  immune_curse: boolean
  notes?: string
  created_at?: string
}

// Utility interface for component usage
export interface MonsterData {
  id?: number
  name: string
  level: number
  type: 'Normal' | 'Elite' | 'Boss'
  hp: number | string
  move?: number
  attack: number | string
  range: string
  special_traits?: string
  special_actions?: string[]
  immunities?: string[]
  notes?: string
}

// Interface for monster/boss selection with quantity and type
export interface SelectedCreature {
  monster: MonsterData
  normalCount: number
  eliteCount: number
  creatureType: 'monster' | 'boss'
}

// Group interface for managing NPCs by type
export interface NPCGroup {
  name: string
  type: 'Normal' | 'Elite' | 'Boss'
  npcs: NPC[]
}

export const CONDITIONS = [
  'Poison',
  'Wound',
  'Immobilize',
  'Disarm',
  'Stun',
  'Muddle',
  'Invisible',
  'Strengthen',
  'Bless',
  'Curse'
] as const

export type Condition = typeof CONDITIONS[number]

export const IMMUNITIES = [
  'Poison',
  'Wound',
  'Immobilize', 
  'Disarm',
  'Knockout',
  'Confuse',
  'Curse'
] as const

export type Immunity = typeof IMMUNITIES[number]

// Helper function to calculate boss health with player multiplier
export function calculateBossHealth(bossHp: string, playerCount: number): number {
  if (bossHp.includes('×C')) {
    const baseHp = parseInt(bossHp.replace('×C', ''))
    return baseHp * playerCount
  }
  return parseInt(bossHp) || 0
}

// Helper function to parse special traits into array
export function parseSpecialTraits(traits: string): string[] {
  if (!traits) return []
  return traits.split(',').map(trait => trait.trim()).filter(Boolean)
}

// Helper function to get creature immunities
export function getCreatureImmunities(boss: Boss): string[] {
  const immunities: string[] = []
  if (boss.immune_poison) immunities.push('Poison')
  if (boss.immune_wound) immunities.push('Wound')
  if (boss.immune_immobilize) immunities.push('Immobilize')
  if (boss.immune_disarm) immunities.push('Disarm')
  if (boss.immune_knockout) immunities.push('Knockout')
  if (boss.immune_confuse) immunities.push('Confuse')
  if (boss.immune_curse) immunities.push('Curse')
  return immunities
}
