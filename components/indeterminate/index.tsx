import { useState } from 'react'

import { Checkbox, FormControlLabel, FormControlLabelProps } from '@mui/material'

export interface HandlerProps {
  checked: boolean
  indeterminate: boolean
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

interface ItemProps {
  label: FormControlLabelProps['label']
  value: string
  item?: any
  callback: (result: HandlerProps, item: string | undefined) => void
}
function Item({ label, value, item, callback }: ItemProps) {
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

export default Item
