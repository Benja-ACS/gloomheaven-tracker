import { supabase } from './supabase'

/**
 * Get the public URL for a file in a Supabase storage bucket
 */
export function getStorageUrl(bucket: string, path: string): string {
  const { data } = supabase.storage.from(bucket).getPublicUrl(path)
  return data.publicUrl
}

/**
 * Get theme assets from the themes bucket
 */
export async function getThemeAssets() {
  try {
    const { data, error } = await supabase.storage
      .from('themes')
      .list()

    if (error) throw error

    const assets = {
      background: null as string | null,
      logo: null as string | null,
    }

    // Find background and logo files
    data?.forEach(file => {
      if (file.name.toLowerCase().includes('background') || file.name.toLowerCase().includes('bg')) {
        assets.background = getStorageUrl('themes', file.name)
      }
      if (file.name.toLowerCase().includes('logo')) {
        assets.logo = getStorageUrl('themes', file.name)
      }
    })

    return assets
  } catch (error) {
    console.error('Error fetching theme assets:', error)
    return { background: null, logo: null }
  }
}

/**
 * Get creature image URL by matching the creature name with file names
 */
export function getCreatureImageUrl(creatureName: string, type: 'monster' | 'boss'): string | null {
  if (!creatureName) return null

  // Convert creature name to lowercase and remove special characters for matching
  const normalizedName = creatureName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, '-')

  // Construct the expected filename pattern
  const bucket = type === 'boss' ? 'bosses' : 'monsters'
  const filename = `gh-${normalizedName}.png`
  
  return getStorageUrl(bucket, filename)
}

/**
 * Get the failsafe image URL
 */
export function getFailsafeImageUrl(type: 'monster' | 'boss'): string {
  const bucket = type === 'boss' ? 'bosses' : 'monsters'
  return getStorageUrl(bucket, 'gh-poti.png')
}

/**
 * List all files in a storage bucket
 */
export async function listBucketFiles(bucket: string) {
  try {
    const { data, error } = await supabase.storage
      .from(bucket)
      .list()

    if (error) throw error
    return data || []
  } catch (error) {
    console.error(`Error listing files in bucket ${bucket}:`, error)
    return []
  }
}

/**
 * Get creature image with fallback handling
 */
export async function getCreatureImageWithFallback(creatureName: string, type: 'monster' | 'boss'): Promise<string | null> {
  try {
    const bucket = type === 'boss' ? 'bosses' : 'monsters'
    const files = await listBucketFiles(bucket)
    
    // Try to find a matching file
    const normalizedName = creatureName
      .toLowerCase()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-')
    
    // Look for exact match first
    let matchingFile = files.find(file => 
      file.name.toLowerCase().includes(normalizedName)
    )
    
    // If no exact match, try partial matching
    if (!matchingFile) {
      const nameWords = normalizedName.split('-')
      matchingFile = files.find(file =>
        nameWords.some(word => 
          word.length > 2 && file.name.toLowerCase().includes(word)
        )
      )
    }
    
    // If still no match, use the failsafe image
    if (!matchingFile) {
      matchingFile = files.find(file => file.name === 'gh-poti.png')
    }
    
    if (matchingFile) {
      return getStorageUrl(bucket, matchingFile.name)
    }
    
    return null
  } catch (error) {
    console.error('Error getting creature image:', error)
    return null
  }
}
