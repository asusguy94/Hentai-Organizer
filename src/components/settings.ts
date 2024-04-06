import { useLocalStorage } from 'react-use'

export const defaultSettings = {
  video_count: 0,
  bookmark_spacing: 0,
  foo: 'bar'
}

export type Settings = typeof defaultSettings

export function useSettings() {
  const [storedSettings, setStoredSettings] = useLocalStorage<Partial<Settings>>('settings', defaultSettings)

  const localSettings = { ...defaultSettings, ...storedSettings }

  const setLocalSettings = (newSettings: Partial<Settings>) => {
    setStoredSettings(prev => {
      const updatedSettings = { ...prev, ...newSettings }

      Object.keys(updatedSettings).forEach(key => {
        const settingsKey = key as keyof Settings

        if (updatedSettings[settingsKey] === defaultSettings[settingsKey]) {
          delete updatedSettings[settingsKey]
        }
      })

      return updatedSettings
    })
  }

  return { localSettings, setLocalSettings }
}
