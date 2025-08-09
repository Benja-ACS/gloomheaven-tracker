'use client'

import { getConditionIconUrl } from '@/lib/storage'
import { CONDITIONS } from '@/types/gloomhaven'

export function ConditionDebug() {
  console.log('=== CONDITION ICON URLS ===')
  CONDITIONS.forEach(condition => {
    const url = getConditionIconUrl(condition)
    console.log(`${condition} -> ${url}`)
  })

  return (
    <div className="p-4 bg-black/50 text-white">
      <h3>Condition URL Debug (check console)</h3>
      <div className="grid grid-cols-2 gap-2 mt-2">
        {CONDITIONS.map(condition => {
          const url = getConditionIconUrl(condition)
          return (
            <div key={condition} className="text-xs">
              <div>{condition}</div>
              <div className="text-gray-400 break-all">{url}</div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
