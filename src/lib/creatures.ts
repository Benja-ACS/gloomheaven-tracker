import { supabase } from './supabase'
import { Monster, Boss, MonsterData, getCreatureImmunities } from '@/types/gloomhaven'

// Fetch monsters from database for a specific level
export async function fetchMonsters(level: number): Promise<MonsterData[]> {
  try {
    const { data, error } = await supabase
      .from('monsters')
      .select('*')
      .eq('level', level)
      .order('name')

    if (error) throw error

    // Group by name and include both Normal and Elite types
    const monsterMap = new Map<string, MonsterData[]>()
    
    ;(data || []).forEach((monster: Monster) => {
      const key = monster.name
      if (!monsterMap.has(key)) {
        monsterMap.set(key, [])
      }
      
      monsterMap.get(key)!.push({
        id: monster.id,
        name: monster.name,
        level: monster.level,
        type: monster.type,
        hp: monster.hp,
        move: monster.move,
        attack: monster.attack,
        range: monster.range,
        special_traits: monster.special_traits,
      })
    })

    // Flatten and return all monster variants
    return Array.from(monsterMap.values()).flat()
  } catch (error) {
    console.error('Error fetching monsters:', error)
    return []
  }
}

// Fetch bosses from database for a specific level
export async function fetchBosses(level: number): Promise<MonsterData[]> {
  try {
    const { data, error } = await supabase
      .from('bosses')
      .select('*')
      .eq('level', level)
      .order('name')

    if (error) throw error

    return (data || []).map((boss: Boss) => ({
      id: boss.id,
      name: boss.name,
      level: boss.level,
      type: 'Boss' as const,
      hp: boss.hp,
      move: boss.move,
      attack: boss.attack,
      range: boss.range,
      special_traits: boss.special_traits,
      special_actions: [boss.special_action_1, boss.special_action_2].filter(Boolean) as string[],
      immunities: getCreatureImmunities(boss),
      notes: boss.notes,
    }))
  } catch (error) {
    console.error('Error fetching bosses:', error)
    return []
  }
}

// Fetch both monsters and bosses for a specific level
export async function fetchAllCreatures(level: number): Promise<{ monsters: MonsterData[], bosses: MonsterData[] }> {
  const [monsters, bosses] = await Promise.all([
    fetchMonsters(level),
    fetchBosses(level)
  ])

  return { monsters, bosses }
}

// Get unique monster names (for selection interface)
export async function fetchUniqueMonsters(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('monsters')
      .select('name')
      .eq('level', 0) // Get base level for unique names
      .order('name')

    if (error) throw error

    return [...new Set((data || []).map(monster => monster.name))]
  } catch (error) {
    console.error('Error fetching unique monsters:', error)
    return []
  }
}

// Get unique boss names (for selection interface) 
export async function fetchUniqueBosses(): Promise<string[]> {
  try {
    const { data, error } = await supabase
      .from('bosses')
      .select('name')
      .eq('level', 0) // Get base level for unique names
      .order('name')

    if (error) throw error

    return [...new Set((data || []).map(boss => boss.name))]
  } catch (error) {
    console.error('Error fetching unique bosses:', error)
    return []
  }
}

// Get monster data by name and level
export async function getMonsterByNameAndLevel(name: string, level: number, type: 'Normal' | 'Elite'): Promise<MonsterData | null> {
  try {
    const { data, error } = await supabase
      .from('monsters')
      .select('*')
      .eq('name', name)
      .eq('level', level)
      .eq('type', type)
      .single()

    if (error) throw error

    return {
      id: data.id,
      name: data.name,
      level: data.level,
      type: data.type,
      hp: data.hp,
      move: data.move,
      attack: data.attack,
      range: data.range,
      special_traits: data.special_traits,
    }
  } catch (error) {
    console.error('Error fetching monster:', error)
    return null
  }
}

// Get boss data by name and level
export async function getBossByNameAndLevel(name: string, level: number): Promise<MonsterData | null> {
  try {
    const { data, error } = await supabase
      .from('bosses')
      .select('*')
      .eq('name', name)
      .eq('level', level)
      .single()

    if (error) throw error

    return {
      id: data.id,
      name: data.name,
      level: data.level,
      type: 'Boss',
      hp: data.hp,
      move: data.move,
      attack: data.attack,
      range: data.range,
      special_traits: data.special_traits,
      special_actions: [data.special_action_1, data.special_action_2].filter(Boolean) as string[],
      immunities: getCreatureImmunities(data),
      notes: data.notes,
    }
  } catch (error) {
    console.error('Error fetching boss:', error)
    return null
  }
}
