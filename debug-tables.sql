-- Run this query in your Supabase SQL Editor to check your tables

-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('monsters', 'bosses', 'scenarios', 'npcs');

-- Check monsters table count
SELECT COUNT(*) as monster_count FROM monsters;

-- Check bosses table count  
SELECT COUNT(*) as boss_count FROM bosses;

-- Check if any scenarios exist
SELECT COUNT(*) as scenario_count FROM scenarios;

-- Check if any npcs exist
SELECT COUNT(*) as npc_count FROM npcs;

-- Sample monster data
SELECT name, level, type, hp, move, attack, range 
FROM monsters 
WHERE level = 0 
ORDER BY name 
LIMIT 5;

-- Sample boss data
SELECT name, level, hp, move, attack, range 
FROM bosses 
WHERE level = 0 
LIMIT 3;
