'use client'

import { useState, useEffect } from 'react'

import {
  Grid,
  Button,
  Table as MuiTable,
  TableContainer,
  TableHead,
  TableRow as MuiTableRow,
  TableCell,
  TableBody,
  TextField,
  Paper,
  Checkbox
} from '@mui/material'

import axios from 'axios'
import capitalize from 'capitalize'

import { serverConfig } from '@config'
import { General } from '@interfaces'

import styles from './editor.module.css'

type UpdateRef = {
  id: number
  name: string
  videoOnly?: boolean
  starOnly?: boolean
}

type OnlyType = 'starOnly' | 'videoOnly'
type WithOnlyType = General & { videoOnly?: boolean; starOnly?: boolean }

export default function EditorPage() {
  return (
    <Grid container justifyContent='center'>
      <Wrapper name='Attribute' obj={['starOnly', 'videoOnly']} />
      <Wrapper name='Category' />
      <Wrapper name='Outfit' />
    </Grid>
  )
}

type WrapperProps = {
  name: string
  obj?: OnlyType[]
}

function Wrapper({ name, obj = [] }: WrapperProps) {
  const [input, setInput] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (input.length > 0 && input.toLowerCase() !== input) {
      axios.post(`${serverConfig.api}/${name.toLowerCase()}`, { name: input }).then(() => {
        location.reload()
      })
    }
  }

  return (
    <Grid item xs={3} style={{ paddingLeft: 3 * 8, paddingRight: 3 * 8 }}>
      <Grid container justifyContent='center' style={{ marginBottom: 10 }}>
        <Grid item component='form' onSubmit={handleSubmit}>
          <TextField
            variant='standard'
            label={name}
            onChange={handleChange}
            style={{ marginLeft: 5, marginRight: 5 }}
          />

          <Button type='submit' variant='contained' color='primary' size='small' style={{ marginTop: 2 }}>
            Add {name}
          </Button>
        </Grid>
      </Grid>

      <Table name={name.toLowerCase()} obj={obj} />
    </Grid>
  )
}

type TableProps = {
  name: string
  obj: OnlyType[]
}
function Table({ name, obj = [] }: TableProps) {
  const [data, setData] = useState<WithOnlyType[]>([])

  useEffect(() => {
    axios.get<WithOnlyType[]>(`${serverConfig.api}/${name}`).then(({ data }) => {
      setData(data.sort((a, b) => a.id - b.id))
    })
  }, [name])

  const updateItem = (ref: UpdateRef, value: string) => {
    axios.put(`${serverConfig.api}/${name}/${ref.id}`, { value }).then(() => {
      setData(data.map(item => ({ ...item, name: ref.id === item.id ? value : item.name })))
    })
  }

  return (
    <TableContainer component={Paper} style={{ overflowX: 'visible' }}>
      <MuiTable size='small' className={styles['table-striped']} stickyHeader>
        <TableHead>
          <MuiTableRow>
            <TableCell>ID</TableCell>
            <TableCell>{capitalize(name)}</TableCell>

            {obj.map(label => (
              <TableCell key={label}>{label}</TableCell>
            ))}
          </MuiTableRow>
        </TableHead>

        <TableBody>
          {data.map(item => (
            <TableRow key={item.id} obj={obj} data={item} update={updateItem} />
          ))}
        </TableBody>
      </MuiTable>
    </TableContainer>
  )
}

type TableRowProps = {
  update: (ref: UpdateRef, value: string) => void
  data: WithOnlyType
  obj: OnlyType[]
}
function TableRow({ update, data, obj }: TableRowProps) {
  const [edit, setEdit] = useState(false)
  const [input, setInput] = useState('')

  const save = () => {
    setEdit(false)

    if (input) update(data, input)
  }

  const setCondition = (ref: UpdateRef, prop: string, value: boolean, checkbox: HTMLInputElement) => {
    axios.put(`${serverConfig.api}/attribute/${ref.id}`, { label: prop, value }).catch(() => {
      checkbox.checked = !value
    })
  }

  return (
    <MuiTableRow>
      <TableCell>{data.id}</TableCell>
      <TableCell>
        {edit ? (
          <form onSubmit={save}>
            <TextField
              type='text'
              defaultValue={data.name}
              onChange={e => setInput(e.target.value)}
              autoFocus
              onBlur={save}
            />
          </form>
        ) : (
          <span onClick={() => setEdit(true)}>{data.name}</span>
        )}
      </TableCell>

      {obj.map(item => (
        <TableCell key={item} className='py-0'>
          <Checkbox
            defaultChecked={data[item]}
            onChange={e => setCondition(data, item, e.currentTarget.checked, e.currentTarget)}
          />
        </TableCell>
      ))}
    </MuiTableRow>
  )
}
