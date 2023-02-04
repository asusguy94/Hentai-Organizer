import { useState } from 'react'
import { ToggleButton, ToggleButtonGroup } from '@mui/material'
import capitalize from 'capitalize'

interface FilterButtonProps {
  defaultValue: string
  data: string[]
  label: string
  labelPlural?: string
  callback: (data: any) => void
  disabled?: boolean
}
export const FilterButton = ({ defaultValue, data, label, callback, disabled = false }: FilterButtonProps) => {
  const [selection, setSelection] = useState(defaultValue)

  if (!data.includes(defaultValue)) {
    throw new Error(`'${defaultValue}' must be included in data`)
  }

  const handleChange = (e: React.MouseEvent<HTMLElement>, data: string) => {
    setSelection(data)
    callback(data)
  }

  if (disabled) return null

  return (
    <>
      <h2>{capitalize(label, true)}</h2>

      <ToggleButtonGroup color='primary' size='small' exclusive value={selection} onChange={handleChange}>
        {data.map(item => (
          <ToggleButton key={item} value={item}>
            {item}
          </ToggleButton>
        ))}
      </ToggleButtonGroup>
    </>
  )
}
