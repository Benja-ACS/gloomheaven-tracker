import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

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
    }
  }
}
