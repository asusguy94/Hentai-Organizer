import { NextPage } from 'next/types'
import { useEffect, useState } from 'react'

import { Button, Grid, TextField } from '@mui/material'

import { useLocalStorage } from 'usehooks-ts'

import { SetState } from '@interfaces'
import { clamp } from '@utils/shared'

const SettingsPage: NextPage = () => {
  type Settings = Record<string, number>

  const [rawSettings, setRawSettings] = useLocalStorage<Settings>('settings', {})
  const [localSettings, setLocalSettings] = useState<Settings>({})
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
        <Grid item xs={2}>
          {/* <WebsiteList
            websites={websites.filter(w => !localWebsites.some(wsite => wsite.label === w.name))}
            addWebsite={handleAddWebsite}
          /> */}
        </Grid>

        <Grid item xs={5} component='form' onSubmit={handleSubmit}>
          <Grid container item xs={12} alignItems='center'>
            <Grid container item xs={6} spacing={1} justifyContent='center'>
              {Object.keys(localSettings)
                .filter((_, i) => i % 2 === 0)
                .map(label => (
                  <Input
                    key={label}
                    label={label}
                    setting={localSettings[label]}
                    update={setLocalSettings}
                    max={9999}
                    onChange={handleChanged}
                  />
                ))}
            </Grid>

            <Grid container item xs={6} spacing={1} justifyContent='center'>
              {Object.keys(localSettings)
                .filter((_, i) => i % 2 !== 0)
                .map(label => (
                  <Input
                    key={label}
                    label={label}
                    setting={localSettings[label]}
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
  label: string
  setting: number
  update: SetState<Record<string, number>>
  max?: number
  onChange: () => void
}
const Input = ({ label, setting, update, max = 0, onChange }: InputProps) => {
  const [count, setCount] = useState(setting)

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = clamp(parseInt(e.target.value), max)

    setCount(value)
    update(prev => ({ ...prev, [label]: value }))

    // trigger change
    onChange()
  }

  return (
    <Grid item style={{ display: 'flex', gap: 4 }}>
      <TextField label={label} type='number' value={count} onChange={handleChange} />
    </Grid>
  )
}

export default SettingsPage
