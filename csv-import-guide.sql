-- CSV Import Script for Supabase
-- Run these commands in your Supabase SQL Editor

-- First, run the database schema from database-tables.sql

-- Then, import your CSV data:

-- 1. MONSTERS TABLE IMPORT
-- Go to your Supabase dashboard → Table Editor → monsters table
-- Click "Insert" → "Import data from CSV"
-- Upload your monsters_rows.csv file
-- Map the columns as follows:
--   CSV Column -> Database Column
--   id -> id
--   name -> name  
--   level -> level
--   type -> type (Normal/Elite)
--   hp -> hp
--   move -> move
--   attack -> attack
--   range -> range
--   special_traits -> special_traits

-- OR use SQL COPY command (if you have direct database access):
/*
COPY monsters(id, name, level, type, hp, move, attack, range, special_traits)
FROM '/path/to/monsters_rows.csv'
DELIMITER ','
CSV HEADER;
*/

-- 2. BOSSES TABLE IMPORT  
-- Go to your Supabase dashboard → Table Editor → bosses table
-- Click "Insert" → "Import data from CSV"
-- Upload your bosses_rows.csv file
-- Map the columns as follows:
--   CSV Column -> Database Column
--   id -> id
--   name -> name
--   level -> level
--   type -> type
--   hp -> hp
--   move -> move
--   attack -> attack
--   range -> range
--   special_traits -> special_traits
--   special_action_1 -> special_action_1
--   special_action_2 -> special_action_2
--   immune_poison -> immune_poison
--   immune_wound -> immune_wound
--   immune_immobilize -> immune_immobilize
--   immune_disarm -> immune_disarm
--   immune_knockout -> immune_knockout
--   immune_confuse -> immune_confuse
--   immune_curse -> immune_curse
--   notes -> notes

-- OR use SQL COPY command:
/*
COPY bosses(id, name, level, type, hp, move, attack, range, special_traits, 
           special_action_1, special_action_2, immune_poison, immune_wound, 
           immune_immobilize, immune_disarm, immune_knockout, immune_confuse, 
           immune_curse, notes)
FROM '/path/to/bosses_rows.csv'
DELIMITER ','
CSV HEADER;
*/

-- 3. VERIFICATION QUERIES
-- Run these to verify your data was imported correctly:

-- Check monsters count
SELECT COUNT(*) as total_monsters, 
       COUNT(DISTINCT name) as unique_monsters,
       COUNT(DISTINCT level) as levels
FROM monsters;

-- Check bosses count  
SELECT COUNT(*) as total_bosses,
       COUNT(DISTINCT name) as unique_bosses,
       COUNT(DISTINCT level) as levels
FROM bosses;

-- Sample monsters by type
SELECT name, level, type, hp, move, attack, range, special_traits
FROM monsters 
WHERE level = 0 
ORDER BY name, type
LIMIT 10;

-- Sample bosses
SELECT name, level, hp, move, attack, range, special_action_1, notes
FROM bosses
WHERE level = 0
ORDER BY name
LIMIT 5;
