# Supabase Storage Integ### **4. `conditions` Bucket**
Contains condition icons for status effects:
- **File naming convention**: `{condition-name}.png` (lowercase)
- **Example**: `poison.png` for "Poison" condition
- **Supported conditions**: Poison, Wound, Immobilize, Disarm, Stun, Muddle, Invisible, Strengthen, Bless, Curse
- **Usage**: Icons appear next to condition names in the NPCCard component

## UI/UX Features

### **Quick Add Monster Buttons**
- Monster groups display "Add Normal" and "Add Elite" buttons in group headers
- Allows fast addition of monsters to existing groups without using main "Add Monster" flow
- Boss groups don't show these buttons (single boss per scenario design)
- Improves workflow for adding multiple monsters of same type

This document outlines the integration of Supabase storage buckets into the Gloomhaven Tracker application.

## Storage Buckets

### 1. `themes` Bucket
Contains theme assets for the application:
- **Background images**: Files containing "background" or "bg" in the name
- **Logo**: Files containing "logo" in the name
- Used to dynamically theme the entire application

### 2. `monsters` Bucket
Contains monster images:
- **File naming convention**: `gh-{monster-name}.png`
- **Example**: `gh-city-guard.png` for "City Guard" monsters
- **Matching logic**: Normalizes monster names by removing special characters and converting to lowercase with hyphens

### 3. `bosses` Bucket
Contains boss images:
- **File naming convention**: `gh-{boss-name}.png`
- **Example**: `gh-jekserah.png` for "Jekserah" boss
- **Matching logic**: Same as monsters - normalizes names for matching

### 4. `conditions` Bucket
Contains condition icons for status effects:
- **File naming convention**: `{condition-name}.png` (lowercase)
- **Example**: `poison.png` for "Poison" condition
- **Supported conditions**: Poison, Wound, Immobilize, Disarm, Stun, Muddle, Invisible, Strengthen, Bless, Curse
- **Usage**: Icons appear next to condition names in the NPCCard component

## Implementation Details

### File Structure
```
src/
├── lib/
│   └── storage.ts          # Supabase storage utilities
├── contexts/
│   └── ThemeContext.tsx    # Theme management context
├── components/
│   └── ui/
│       ├── CreatureImage.tsx    # Component for monster/boss images
│       ├── ConditionIcon.tsx    # Component for condition icons
│       └── BackgroundWrapper.tsx # Dynamic background component
```

### Key Functions

#### `storage.ts`
- `getStorageUrl()`: Gets public URL for storage files
- `getConditionIconUrl()`: Gets condition icon URL from conditions bucket
- `getThemeAssets()`: Loads theme background and logo
- `getCreatureImageWithFallback()`: Smart creature image loading with fallback
- `listBucketFiles()`: Lists files in a storage bucket

#### `ConditionIcon.tsx`
- Displays condition icons with fallback to first letter
- Supports multiple sizes (sm/md/lg)
- Handles image loading errors gracefully

#### `CreatureImage.tsx`
- Displays monster/boss images with loading states
- Provides fallback icons when images aren't found
- Supports multiple sizes (sm, md, lg)

#### `ThemeContext.tsx`
- Manages global theme state
- Loads background and logo from themes bucket
- Provides theme data to all components

## Usage Examples

### Adding Creature Images
```tsx
import { CreatureImage } from '@/components/ui/CreatureImage'

<CreatureImage 
  creatureName="City Guard"
  type="monster"
  size="md"
/>
```

### Using Theme Context
```tsx
import { useTheme } from '@/contexts/ThemeContext'

function MyComponent() {
  const { background, logo, isLoading } = useTheme()
  
  return (
    <div>
      {logo && <img src={logo} alt="Logo" />}
      {/* Component content */}
    </div>
  )
}
```

## Image Matching Logic

The system automatically matches creature names to image files:

1. **Normalization**: Convert creature name to lowercase, remove special characters, replace spaces with hyphens
2. **Exact Match**: Look for files containing the normalized name
3. **Partial Match**: If no exact match, try matching individual words (minimum 3 characters)
4. **Fallback**: Show icon-based fallback if no image found

### Examples:
- "City Guard" → looks for files containing "city-guard"
- "Jekserah" → looks for files containing "jekserah"
- "Bandit Guard" → looks for files containing "bandit-guard"

## Features Integrated

### Scenario Creator
- ✅ Monster selection shows creature images
- ✅ Boss selection shows creature images
- ✅ Selected creatures display with images

### Scenario Manager
- ✅ Group headers show creature images
- ✅ Individual NPC cards show creature images
- ✅ Add monster modal shows creature images

### Main Application
- ✅ Dynamic background from themes bucket
- ✅ Logo integration in header
- ✅ Responsive image loading with fallbacks

## Performance Considerations

- **Lazy Loading**: Images load on-demand
- **Fallback Handling**: Graceful degradation when images fail to load
- **Caching**: Browser automatically caches loaded images
- **Optimization**: Consider using Next.js Image component for production optimization

## File Upload Guidelines

### For Themes Bucket:
- Use descriptive names like "gloomhaven-background.jpg" or "gloomhaven-logo.png"
- Recommended background size: 1920x1080 or higher
- Logo should be transparent PNG for best results

### For Monster/Boss Buckets:
- Follow naming convention: `gh-{creature-name}.png`
- Use consistent image dimensions (e.g., 256x256 or 512x512)
- PNG format recommended for transparency support
- Creature names should match database entries exactly (case-insensitive)
