import { FormControl, FormControlLabel, MenuItem, Radio, RadioGroup, Select, SelectChangeEvent } from '@mui/material'

import capitalize from 'capitalize'

import { RegularHandlerProps, RegularItem } from '@components/indeterminate'
import Spinner from '@components/spinner'

import { DefaultObj } from './sort'

import { useSearchParam } from '@hooks/search'
import { General } from '@interfaces'

import styles from './filter.module.css'

type FilterRadioProps = {
  data?: string[]
  label: string
  callback: (item: string) => void
  globalCallback?: () => void
  nullCallback?: () => void
  defaultObj: DefaultObj
}
export function FilterRadio({ data, label, callback, globalCallback, nullCallback, defaultObj }: FilterRadioProps) {
  const { currentValue, defaultValue } = useSearchParam(defaultObj, label)

  if (data === undefined) return <Spinner />

  return (
    <>
      <h2>{capitalize(label, true)}</h2>

      <FormControl>
        <RadioGroup name={label} defaultValue={currentValue !== '' ? currentValue : defaultValue}>
          {globalCallback !== undefined && (
            <FormControlLabel
              value={defaultValue}
              label={<div className={styles.global}>ALL</div>}
              onChange={globalCallback}
              control={<Radio />}
            />
          )}

          {nullCallback !== undefined && (
            <FormControlLabel
              value='NULL'
              label={<div className={styles.global}>NULL</div>}
              onChange={nullCallback}
              control={<Radio />}
            />
          )}

          {data.map(item => (
            <FormControlLabel
              key={item}
              value={item}
              onChange={() => callback(item)}
              label={item}
              control={<Radio />}
            />
          ))}
        </RadioGroup>
      </FormControl>
    </>
  )
}

type FilterCheckboxProps<T extends string | General> = {
  data?: T[]
  label: string
  callback: (ref: RegularHandlerProps, item: T) => void
  nullCallback?: (e: RegularHandlerProps) => void
  defaultNull?: boolean
  defaultObj: DefaultObj
}
export function FilterCheckbox<T extends string | General>({
  data,
  label,
  callback,
  nullCallback,
  defaultNull = false,
  defaultObj
}: FilterCheckboxProps<T>) {
  const { currentValue, defaultValue } = useSearchParam(defaultObj, label)
  const currentArrayValue = currentValue.split(',')

  if (data === undefined) return <Spinner />

  return (
    <>
      <h2>{capitalize(label, true)}</h2>

      <FormControl>
        {nullCallback !== undefined && (
          <RegularItem
            label={<div className={styles.global}>NULL</div>}
            value='NULL'
            callback={nullCallback}
            defaultChecked={defaultNull}
            softDisabled={currentValue !== defaultValue}
          />
        )}

        {data.map(item => {
          const key = typeof item === 'string' ? item : item.id
          const value = typeof item === 'string' ? item : item.name

          return (
            <RegularItem
              key={key}
              label={value}
              value={value}
              item={item}
              callback={callback}
              defaultChecked={currentArrayValue.includes(value)}
              softDisabled={defaultNull}
            />
          )
        })}
      </FormControl>
    </>
  )
}

type FilterDropdownProps = {
  data?: string[]
  label: string
  callback: (e: SelectChangeEvent) => void
  defaultObj: DefaultObj
}
export function FilterDropdown({ data, label, callback, defaultObj }: FilterDropdownProps) {
  const { currentValue, defaultValue } = useSearchParam(defaultObj, label)

  if (data === undefined) return <Spinner />

  return (
    <>
      <h2>{capitalize(label, true)}</h2>

      <FormControl>
        <Select
          variant='standard'
          id={label}
          defaultValue={currentValue !== '' ? currentValue : defaultValue}
          onChange={callback}
        >
          <MenuItem value='ALL'>All</MenuItem>

          {data.map(item => (
            <MenuItem key={item} value={item}>
              {item}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  )
}

export function isDefault<T extends DefaultObj>(value: string, defaultValue: T[keyof T]) {
  return value === defaultValue
}
