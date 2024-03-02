import { useCallback } from 'react'

import { defaultSettings, useSettings } from 'src/app/settings/components'

export default function useCollisionCheck() {
  const localSettings = useSettings()

  const collisionCheck = useCallback(
    (a: HTMLElement | null, b: HTMLElement | null) => {
      if (a === null || b === null) return false

      const bookmarkSpacing = localSettings?.bookmark_spacing ?? defaultSettings.bookmark_spacing

      const aRect = a.getBoundingClientRect()
      const bRect = b.getBoundingClientRect()

      return aRect.x + aRect.width >= bRect.x - bookmarkSpacing && aRect.x - bookmarkSpacing <= bRect.x + bRect.width
    },
    [localSettings?.bookmark_spacing]
  )

  return { collisionCheck }
}
