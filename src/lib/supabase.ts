import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Create a placeholder client for build time, real client for runtime
export const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : createClient('https://placeholder.supabase.co', 'placeholder')

export type Database = {
  public: {
    Tables: {
      scenarios: {
        Row: {
          id: string
          created_at: string
          name: string
          level: number
          user_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          level: number
          user_id: string
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          level?: number
          user_id?: string
        }
      }
      npcs: {
        Row: {
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
        Insert: {
          id?: string
          created_at?: string
          scenario_id: string
          name: string
          type: 'monster' | 'boss'
          max_health: number
          current_health: number
          conditions?: string[]
          abilities?: string[]
          position: number
        }
        Update: {
          id?: string
          created_at?: string
          scenario_id?: string
          name?: string
          type?: 'monster' | 'boss'
          max_health?: number
          current_health?: number
          conditions?: string[]
          abilities?: string[]
          position?: number
        }
      }
      monsters: {
        Row: {
          id: string
          created_at: string
          name: string
          health_level_1: number
          health_level_2: number
          health_level_3: number
          health_level_4: number
          health_level_5: number
          health_level_6: number
          health_level_7: number
          abilities: string[]
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          health_level_1: number
          health_level_2: number
          health_level_3: number
          health_level_4: number
          health_level_5: number
          health_level_6: number
          health_level_7: number
          abilities?: string[]
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          health_level_1?: number
          health_level_2?: number
          health_level_3?: number
          health_level_4?: number
          health_level_5?: number
          health_level_6?: number
          health_level_7?: number
          abilities?: string[]
        }
      }
      bosses: {
        Row: {
          id: string
          created_at: string
          name: string
          health_level_1: number
          health_level_2: number
          health_level_3: number
          health_level_4: number
          health_level_5: number
          health_level_6: number
          health_level_7: number
          abilities: string[]
        }
        Insert: {
          id?: string
          created_at?: string
          name: string
          health_level_1: number
          health_level_2: number
          health_level_3: number
          health_level_4: number
          health_level_5: number
          health_level_6: number
          health_level_7: number
          abilities?: string[]
        }
        Update: {
          id?: string
          created_at?: string
          name?: string
          health_level_1?: number
          health_level_2?: number
          health_level_3?: number
          health_level_4?: number
          health_level_5?: number
          health_level_6?: number
          health_level_7?: number
          abilities?: string[]
        }
      }
    }
  }
}
