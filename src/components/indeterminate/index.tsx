import { useState } from 'react'

import { Checkbox, FormControlLabel, FormControlLabelProps } from '@mui/material'

export type HandlerProps = {
  checked: boolean
  indeterminate: boolean
}

export type RegularHandlerProps = {
  checked: boolean
}

const Handler = ({ checked, indeterminate }: HandlerProps) => {
  if (checked) {
    return { indeterminate: true, checked: false }
  } else if (indeterminate) {
    return { indeterminate: false, checked: false }
  } else {
    return { indeterminate: false, checked: true }
  }
}

type ItemProps<T> = {
  label: FormControlLabelProps['label']
  value: string
  item?: T
  callback: (result: HandlerProps, item?: T) => void
}
function Item<T>({ label, value, item, callback }: ItemProps<T>) {
  const [indeterminate, setIndeterminate] = useState(false)
  const [checked, setChecked] = useState(false)

  return (
    <FormControlLabel
      label={label}
      value={value}
      control={
        <Checkbox
          checked={checked}
          indeterminate={indeterminate}
          onChange={() => {
            const result = Handler({ checked, indeterminate })

            setIndeterminate(result.indeterminate)
            setChecked(result.checked)

            callback(result, item)
          }}
        />
      }
    />
  )
}

type RegularItemProps<T> = {
  label: FormControlLabelProps['label']
  value: string
  item?: T
  callback: (result: RegularHandlerProps, item: T) => void
}
export function RegularItem<T>({ label, value, item, callback }: RegularItemProps<T>) {
  const [checked, setChecked] = useState(false)

  return (
    <FormControlLabel
      label={label}
      value={value}
      control={
        <Checkbox
          checked={checked}
          onChange={() => {
            setChecked(checked => {
              const status = !checked

              callback({ checked: status }, item as T)
              return status
            })
          }}
        />
      }
    />
  )
}

export default Item
