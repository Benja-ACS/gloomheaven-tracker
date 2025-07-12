# CSV Data Import Guide for Gloomhaven Tracker

This guide will help you upload your monster and boss CSV data to Supabase.

## Prerequisites

1. You should have already run the `database-tables.sql` script in your Supabase SQL Editor
2. You have your `monsters_rows.csv` and `bosses_rows.csv` files ready

## Step 1: Update Database Schema

First, make sure your database has the latest schema by running the `database-tables.sql` file:

1. Go to your Supabase dashboard
2. Navigate to **SQL Editor**
3. Create a new query
4. Copy and paste the contents of `database-tables.sql`
5. Click **Run**

## Step 2: Import Monsters Data

### Option A: Using Supabase Dashboard (Recommended)

1. Go to your Supabase dashboard
2. Navigate to **Table Editor**
3. Click on the **monsters** table
4. Click the **Insert** button (+ icon)
5. Select **Import data from CSV**
6. Upload your `monsters_rows.csv` file
7. Map the CSV columns to database columns:
   - `id` → `id`
   - `name` → `name`
   - `level` → `level`
   - `type` → `type`
   - `hp` → `hp`
   - `move` → `move`
   - `attack` → `attack`
   - `range` → `range`
   - `special_traits` → `special_traits`
8. Click **Import**

### Option B: Using SQL Copy Command

If you have direct database access, run this in SQL Editor:

```sql
COPY monsters(id, name, level, type, hp, move, attack, range, special_traits)
FROM '/path/to/monsters_rows.csv'
DELIMITER ','
CSV HEADER;
```

## Step 3: Import Bosses Data

### Option A: Using Supabase Dashboard (Recommended)

1. In **Table Editor**, click on the **bosses** table
2. Click **Insert** → **Import data from CSV**
3. Upload your `bosses_rows.csv` file
4. Map the CSV columns to database columns:
   - `id` → `id`
   - `name` → `name`
   - `level` → `level`
   - `type` → `type`
   - `hp` → `hp`
   - `move` → `move`
   - `attack` → `attack`
   - `range` → `range`
   - `special_traits` → `special_traits`
   - `special_action_1` → `special_action_1`
   - `special_action_2` → `special_action_2`
   - `immune_poison` → `immune_poison`
   - `immune_wound` → `immune_wound`
   - `immune_immobilize` → `immune_immobilize`
   - `immune_disarm` → `immune_disarm`
   - `immune_knockout` → `immune_knockout`
   - `immune_confuse` → `immune_confuse`
   - `immune_curse` → `immune_curse`
   - `notes` → `notes`
5. Click **Import**

### Option B: Using SQL Copy Command

```sql
COPY bosses(id, name, level, type, hp, move, attack, range, special_traits, 
           special_action_1, special_action_2, immune_poison, immune_wound, 
           immune_immobilize, immune_disarm, immune_knockout, immune_confuse, 
           immune_curse, notes)
FROM '/path/to/bosses_rows.csv'
DELIMITER ','
CSV HEADER;
```

## Step 4: Verify Data Import

Run these queries in your SQL Editor to verify the import was successful:

### Check Monsters
```sql
-- Total counts
SELECT COUNT(*) as total_monsters, 
       COUNT(DISTINCT name) as unique_monsters,
       COUNT(DISTINCT level) as levels
FROM monsters;

-- Sample data
SELECT name, level, type, hp, move, attack, range 
FROM monsters 
WHERE level = 0 
ORDER BY name, type
LIMIT 10;
```

### Check Bosses
```sql
-- Total counts
SELECT COUNT(*) as total_bosses,
       COUNT(DISTINCT name) as unique_bosses,
       COUNT(DISTINCT level) as levels
FROM bosses;

-- Sample data
SELECT name, level, hp, move, attack, range, special_action_1
FROM bosses
WHERE level = 0
ORDER BY name
LIMIT 5;
```

## Step 5: Test the Application

After importing the data:

1. Deploy your updated code to Vercel (if you haven't already)
2. Create a new scenario
3. Try adding monsters with both Normal and Elite types
4. Try adding bosses
5. Verify that player count affects boss health calculation

## Expected Data Counts

Based on your CSV files:
- **Monsters**: 609 entries (each monster has Normal and Elite variants across levels 0-7)
- **Bosses**: Multiple boss entries across levels 0-7

## Important Data Types

### **Special Values in CSV:**
- **`range` column**: Contains `"-"` for melee attacks and numbers for ranged attacks  
- **`move` column**: Contains `"-"` for immobile creatures (like Ancient Artillery) and numbers for mobile creatures
- **`hp` column (bosses)**: Contains multiplier formulas like `"8×C"` for boss health calculation
- **`attack` column (bosses)**: Can contain variables like `"3+X"` or `"V"` for special attacks

These are all handled correctly by the database schema (TEXT columns where needed).

## Troubleshooting

### Common Issues:

1. **Column mismatch**: Make sure CSV column headers match exactly
2. **Data type errors**: Ensure numeric fields contain valid numbers
3. **Missing required fields**: All non-nullable columns must have values

### If import fails:

1. Check the CSV file format (ensure proper UTF-8 encoding)
2. Remove any special characters that might cause parsing issues
3. Try importing a smaller subset first to test
4. Check Supabase logs for specific error messages

## Application Features

Once data is imported, your app will support:

✅ **Normal/Elite Monster Selection**: Choose between Normal and Elite variants
✅ **Boss Health Multipliers**: Boss health automatically calculates based on player count
✅ **Grouped NPC Management**: NPCs are grouped by type for easier management
✅ **Comprehensive Stats**: Display move, attack, range, special traits, and immunities
✅ **Level-based Scaling**: All creatures scale with scenario level (0-7)

## Next Steps

After successful import:
1. Test creating scenarios with various monster/boss combinations
2. Verify health calculations for bosses with different player counts
3. Check that all monster abilities and immunities display correctly
4. Test the grouped display functionality in the scenario manager
