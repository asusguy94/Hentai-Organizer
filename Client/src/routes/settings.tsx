import { useEffect, useState } from 'react'

import { Button, Grid, TextField } from '@mui/material'

import { createFileRoute } from '@tanstack/react-router'

import { defaultSettings, useSettings } from '@/components/settings'

import { SetState } from '@/interface'

export const Route = createFileRoute('/settings')({
  component: SettingsPage
})

function SettingsPage() {
  const [changed, setChanged] = useState(false)
  const { localSettings, setLocalSettings } = useSettings()
  const [settings, setSettings] = useState(localSettings)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    setLocalSettings(settings)

    setChanged(false)
  }

  const handleChanged = () => {
    setChanged(true)
  }

  const entries = Object.entries(localSettings)
  const leftSide = entries.filter((_, i) => i % 2 === 0)
  const rightSide = entries.filter((_, i) => i % 2 === 1)

  return (
    <Grid item className='text-center'>
      <Grid container justifyContent='center'>
        <Grid item xs={5} component='form' onSubmit={handleSubmit}>
          <Grid container item xs={12} alignItems='center'>
            {entries.length > 1 ? (
              <>
                <Grid container item xs={6} spacing={1} justifyContent='center'>
                  {leftSide.map(([key, value]) => (
                    <Input key={key} label={key} setting={value} update={setSettings} onChange={handleChanged} />
                  ))}
                </Grid>

                <Grid container item xs={6} spacing={1} justifyContent='center'>
                  {rightSide.map(([key, value]) => (
                    <Input key={key} label={key} setting={value} update={setSettings} onChange={handleChanged} />
                  ))}
                </Grid>
              </>
            ) : (
              <Grid container item xs={12} spacing={1} justifyContent='center'>
                {entries.map(([key, value]) => (
                  <Input key={key} label={key} setting={value} update={setSettings} onChange={handleChanged} />
                ))}
              </Grid>
            )}
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
  setting: (typeof defaultSettings)[keyof typeof defaultSettings]
  update: SetState<typeof defaultSettings>
  onChange: () => void
}

function Input({ label, setting, update, onChange }: InputProps) {
  const [value, setValue] = useState(setting)

  useEffect(() => {
    setValue(setting)
  }, [setting])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = typeof setting === 'number' ? Number(e.target.value) : e.target.value

    setValue(newValue)
    update(prev => ({ ...prev, [label]: newValue }))

    onChange()
  }

  return (
    <Grid item style={{ display: 'flex', gap: 4 }}>
      <TextField type={typeof setting} label={label} value={value} onChange={handleChange} />
    </Grid>
  )
}
