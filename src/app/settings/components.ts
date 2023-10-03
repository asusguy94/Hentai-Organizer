import { useReadLocalStorage } from 'usehooks-ts'

export const keys = ['video_count', 'bookmark_spacing'] as const
export const settingsKey = 'settings'

export type SettingKey = (typeof keys)[number]
export type SettingValue = number
export type Settings = Partial<Record<SettingKey, SettingValue>>

export const defaultSettings: Required<Settings> = { video_count: 0, bookmark_spacing: 0 }

export const useSettings = () => useReadLocalStorage<Settings>(settingsKey)
