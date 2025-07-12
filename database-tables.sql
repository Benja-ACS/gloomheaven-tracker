-- SQL to create comprehensive monsters and bosses tables in Supabase

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Drop existing tables if they exist
DROP TABLE IF EXISTS npcs;
DROP TABLE IF EXISTS scenarios;
DROP TABLE IF EXISTS monsters;
DROP TABLE IF EXISTS bosses;

-- Create monsters table with full Gloomhaven data
CREATE TABLE monsters (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  level INTEGER NOT NULL CHECK (level >= 0 AND level <= 7),
  type TEXT NOT NULL CHECK (type IN ('Normal', 'Elite')),
  hp INTEGER NOT NULL,
  move TEXT NOT NULL, -- Can be "-" for immobile or a number like "3", "4", etc.
  attack INTEGER NOT NULL,
  range TEXT NOT NULL, -- Can be "-" for melee or a number like "3", "4", etc.
  special_traits TEXT, -- Comma-separated traits like "POISON, WOUND"
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, level, type)
);

-- Create bosses table with full Gloomhaven data
CREATE TABLE bosses (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  level INTEGER NOT NULL CHECK (level >= 0 AND level <= 7),
  type TEXT NOT NULL DEFAULT 'Boss',
  hp TEXT NOT NULL, -- Format like "8×C" for boss multiplier
  move TEXT, -- Can be "-" for immobile or a number like "3", "4", etc.
  attack TEXT NOT NULL, -- Can include variables like "3+X" or "V"
  range TEXT NOT NULL,
  special_traits TEXT,
  special_action_1 TEXT,
  special_action_2 TEXT,
  immune_poison BOOLEAN DEFAULT false,
  immune_wound BOOLEAN DEFAULT false,
  immune_immobilize BOOLEAN DEFAULT false,
  immune_disarm BOOLEAN DEFAULT false,
  immune_knockout BOOLEAN DEFAULT false,
  immune_confuse BOOLEAN DEFAULT false,
  immune_curse BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(name, level)
);

-- Create scenarios table if it doesn't exist
CREATE TABLE IF NOT EXISTS scenarios (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  level INTEGER NOT NULL CHECK (level >= 0 AND level <= 7),
  player_count INTEGER NOT NULL CHECK (player_count >= 2 AND player_count <= 4),
  user_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create NPCs table with all necessary columns
CREATE TABLE IF NOT EXISTS npcs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  scenario_id UUID REFERENCES scenarios(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('monster', 'boss')),
  monster_type TEXT CHECK (monster_type IN ('Normal', 'Elite', 'Boss')),
  max_health INTEGER NOT NULL,
  current_health INTEGER NOT NULL,
  conditions TEXT[] DEFAULT '{}',
  abilities TEXT[] DEFAULT '{}',
  position INTEGER NOT NULL DEFAULT 0,
  move TEXT, -- Can be "-" for immobile or a number
  attack TEXT, -- Can be variable like "3+X" or numeric
  range TEXT, -- Can be "-" for melee or a number
  special_traits TEXT,
  immunities TEXT[] DEFAULT '{}',
  notes TEXT,
  group_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_monsters_name_level ON monsters(name, level);
CREATE INDEX idx_monsters_type ON monsters(type);
CREATE INDEX idx_bosses_name_level ON bosses(name, level);
CREATE INDEX idx_scenarios_user_id ON scenarios(user_id);
CREATE INDEX idx_npcs_scenario_id ON npcs(scenario_id);
CREATE INDEX idx_npcs_group_name ON npcs(group_name);
CREATE INDEX idx_npcs_monster_type ON npcs(monster_type);

-- Enable Row Level Security
ALTER TABLE monsters ENABLE ROW LEVEL SECURITY;
ALTER TABLE bosses ENABLE ROW LEVEL SECURITY;
ALTER TABLE scenarios ENABLE ROW LEVEL SECURITY;
ALTER TABLE npcs ENABLE ROW LEVEL SECURITY;

-- Create policies (allow all operations for now)
CREATE POLICY "Allow all operations on monsters" ON monsters FOR ALL USING (true);
CREATE POLICY "Allow all operations on bosses" ON bosses FOR ALL USING (true);
CREATE POLICY "Allow all operations on scenarios" ON scenarios FOR ALL USING (true);
CREATE POLICY "Allow all operations on npcs" ON npcs FOR ALL USING (true);
