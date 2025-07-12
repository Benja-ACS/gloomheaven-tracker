export interface Scenario {
  id: string
  created_at: string
  name: string
  level: number
  user_id: string
}

export interface NPC {
  id: string
  created_at: string
  scenario_id: string
  name: string
  type: 'monster' | 'boss'
  max_health: number
  current_health: number
  conditions: string[]
  abilities: string[]
  position: number
}

export interface MonsterData {
  name: string
  health: { [level: number]: number }
  abilities: string[]
}

export const GLOOMHAVEN_MONSTERS: MonsterData[] = [
  {
    name: 'Bandit Archer',
    health: { 1: 4, 2: 5, 3: 6, 4: 7, 5: 8, 6: 9, 7: 10 },
    abilities: ['Precise Shot', 'Rain of Arrows', 'Poison Arrow']
  },
  {
    name: 'Bandit Guard',
    health: { 1: 6, 2: 7, 3: 8, 4: 10, 5: 12, 6: 14, 7: 16 },
    abilities: ['Shield Bash', 'Retaliate', 'Taunt']
  },
  {
    name: 'Living Bones',
    health: { 1: 5, 2: 6, 3: 7, 4: 8, 5: 10, 6: 12, 7: 14 },
    abilities: ['Bone Spear', 'Reassemble', 'Undead Immunity']
  },
  {
    name: 'Living Corpse',
    health: { 1: 7, 2: 8, 3: 10, 4: 12, 5: 14, 6: 16, 7: 18 },
    abilities: ['Putrid Explosion', 'Zombie Bite', 'Shamble']
  },
  {
    name: 'Giant Viper',
    health: { 1: 3, 2: 4, 3: 5, 4: 6, 5: 7, 6: 8, 7: 9 },
    abilities: ['Poison Bite', 'Slither', 'Constrict']
  },
  {
    name: 'City Guard',
    health: { 1: 8, 2: 10, 3: 12, 4: 14, 5: 16, 6: 18, 7: 20 },
    abilities: ['Sword Strike', 'Shield Wall', 'Rally']
  }
]

export const GLOOMHAVEN_BOSSES: MonsterData[] = [
  {
    name: 'Bandit Commander',
    health: { 1: 16, 2: 20, 3: 24, 4: 28, 5: 32, 6: 36, 7: 40 },
    abilities: ['Command', 'Devastating Strike', 'Rally the Troops', 'Intimidate']
  },
  {
    name: 'Inox Shaman',
    health: { 1: 14, 2: 18, 3: 22, 4: 26, 5: 30, 6: 34, 7: 38 },
    abilities: ['Tribal Medicine', 'Curse', 'Summon Wolf', 'Nature\'s Wrath']
  },
  {
    name: 'Ancient Artillery',
    health: { 1: 18, 2: 22, 3: 26, 4: 30, 5: 34, 6: 38, 7: 42 },
    abilities: ['Cannon Blast', 'Explosive Shot', 'Overcharge', 'Self-Destruct']
  }
]

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
