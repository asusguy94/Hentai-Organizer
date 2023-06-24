import { NextPage } from 'next/types'
import { useEffect, useState } from 'react'

import { Button, Grid, TextField } from '@mui/material'

import { useLocalStorage, useReadLocalStorage } from 'usehooks-ts'

import { SetState } from '@interfaces'
import { clamp } from '@utils/shared'

type SettingKey = (typeof keys)[number]
type SettingValue = number
type Settings = Partial<Record<SettingKey, SettingValue>>
const settingsKey = 'settings'

const keys = ['video_count', 'bookmark_spacing'] as const
export const defaultSettings: Required<Settings> = { video_count: 0, bookmark_spacing: 0 }

export const useSettings = () => useReadLocalStorage<Settings>(settingsKey)
const SettingsPage: NextPage = () => {
  const [rawSettings, setRawSettings] = useLocalStorage<Settings>(settingsKey, defaultSettings)
  const [localSettings, setLocalSettings] = useState<Settings>(defaultSettings)
  const [changed, setChanged] = useState(false)

  useEffect(() => {
    setLocalSettings(rawSettings)
  }, [rawSettings])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    // update browser-storage
    setRawSettings(localSettings)

    // Reset Changes
    setChanged(false)
  }

  const handleChanged = () => {
    setChanged(true)
  }

  return (
    <Grid item className='text-center'>
      <Grid container justifyContent='center'>
        <Grid item xs={5} component='form' onSubmit={handleSubmit}>
          <Grid container item xs={12} alignItems='center'>
            <Grid container item xs={6} spacing={1} justifyContent='center'>
              {keys
                .filter((_, i) => i % 2 === 0)
                .map(key => (
                  <Input
                    key={key}
                    label={key}
                    setting={localSettings[key]}
                    update={setLocalSettings}
                    max={9999}
                    onChange={handleChanged}
                  />
                ))}
            </Grid>

            <Grid container item xs={6} spacing={1} justifyContent='center'>
              {keys
                .filter((_, i) => i % 2 !== 0)
                .map(key => (
                  <Input
                    key={key}
                    label={key}
                    setting={localSettings[key]}
                    update={setLocalSettings}
                    max={9999}
                    onChange={handleChanged}
                  />
                ))}
            </Grid>
          </Grid>

          <Button variant='contained' disabled={!changed} type='submit' style={{ marginTop: 10 }}>
            Save Changes
          </Button>
        </Grid>
      </Grid>
    </Grid>
  )
}

type InputProps = {
  label: SettingKey
  setting?: SettingValue
  update: SetState<Settings>
  max?: number
  onChange: () => void
}
const Input = ({ label, setting, update, max = 0, onChange }: InputProps) => {
  const [count, setCount] = useState<SettingValue>()

  useEffect(() => {
    setCount(setting)
  }, [setting])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = clamp(parseInt(e.target.value), max)

    setCount(value)
    update(prev => ({ ...prev, [label]: value }))

    // trigger change
    onChange()
  }

  if (count === undefined) return null

  return (
    <Grid item style={{ display: 'flex', gap: 4 }}>
      <TextField label={label} type='number' value={count} onChange={handleChange} />
    </Grid>
  )
}

export default SettingsPage
