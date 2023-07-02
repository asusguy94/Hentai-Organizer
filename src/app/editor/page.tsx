'use client'

import { useRouter } from 'next/navigation'
import { NextPage } from 'next/types'
import { useState, useEffect } from 'react'

import {
  Grid,
  Button,
  Table,
  TableContainer,
  TableHead,
  TableRow,
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

import styles from './editor.module.scss'

type UpdateRef = {
  id: number
  name: string
  videoOnly?: boolean
  starOnly?: boolean
}

type OnlyType = 'starOnly' | 'videoOnly'
type WithOnlyType = General & { videoOnly?: boolean; starOnly?: boolean }

//NEXT can be migrated to server-component
const EditorPage: NextPage = () => (
  <Grid container justifyContent='center'>
    <Wrapper label='attributes' name='attribute' obj={['starOnly', 'videoOnly']} />
    <Wrapper label='categories' name='category' />
    <Wrapper label='outfits' name='outfit' />
  </Grid>
)

type WrapperProps = {
  label: string
  name: string
  obj?: OnlyType[]
}

const Wrapper = ({ label, name, obj = [] }: WrapperProps) => {
  const router = useRouter()

  const [input, setInput] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)

  const handleSubmit = () => {
    if (input.length) {
      if (input.toLowerCase() === input) return

      axios.post(`${serverConfig.api}/${name}`, { name: input }).then(() => {
        router.refresh()
      })
    }
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault()
      handleSubmit()
    }
  }

  return (
    <Grid item xs={3} style={{ paddingLeft: 3 * 8, paddingRight: 3 * 8 }}>
      <Grid container justifyContent='center' style={{ marginBottom: 10 }}>
        <Grid item component='h2'>
          {capitalize(label)}
        </Grid>

        <Grid item>
          <TextField
            variant='standard'
            onChange={handleChange}
            //TODO deprecated
            onKeyPress={handleKeyPress}
            style={{ marginLeft: 5, marginRight: 5 }}
          />

          <Button variant='contained' color='primary' size='small' onClick={handleSubmit} style={{ marginTop: 2 }}>
            Add {capitalize(name)}
          </Button>
        </Grid>
      </Grid>

      <TableWrapper label={name} obj={obj} />
    </Grid>
  )
}

type TableWrapperProps = {
  label: string
  obj: OnlyType[]
}
const TableWrapper = ({ label, obj = [] }: TableWrapperProps) => {
  const [data, setData] = useState<WithOnlyType[]>([])

  useEffect(() => {
    axios.get<WithOnlyType[]>(`${serverConfig.api}/${label}`).then(({ data }) => {
      setData(data.sort((a, b) => a.id - b.id))
    })
  }, [label])

  const updateItem = (ref: UpdateRef, value: string) => {
    axios.put(`${serverConfig.api}/${label}/${ref.id}`, { value }).then(() => {
      setData(data.map(item => ({ ...item, name: ref.id === item.id ? value : item.name })))
    })
  }

  return (
    <TableContainer component={Paper} style={{ overflowX: 'visible' }}>
      <Table size='small' className={styles['table-striped']} stickyHeader>
        <TableHead>
          <TableRow>
            <TableCell>ID</TableCell>
            <TableCell>{capitalize(label)}</TableCell>

            {obj.map(label => (
              <TableCell key={label}>{label}</TableCell>
            ))}
          </TableRow>
        </TableHead>

        <TableBody>
          {data.map(item => (
            <TableItem key={item.id} obj={obj} data={item} update={updateItem} />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

type TableItemProps = {
  update: (ref: UpdateRef, value: string) => void
  data: WithOnlyType
  obj: OnlyType[]
}
const TableItem = ({ update, data, obj }: TableItemProps) => {
  const [edit, setEdit] = useState(false)
  const [value, setValue] = useState<null | string>(null)

  const save = () => {
    setEdit(false)

    if (value) update(data, value)
  }

  const setCondition = (ref: UpdateRef, prop: string, value: boolean, checkbox: HTMLInputElement) => {
    axios.put(`${serverConfig.api}/attribute/${ref.id}`, { label: prop, value }).catch(() => {
      checkbox.checked = !value
    })
  }

  return (
    <TableRow>
      <TableCell>{data.id}</TableCell>
      <TableCell>
        {edit ? (
          <TextField
            type='text'
            defaultValue={data.name}
            autoFocus
            onBlur={save}
            //TODO deprecated
            onKeyPress={e => {
              if (e.key === 'Enter') save()
            }}
            onChange={e => setValue(e.currentTarget.value)}
          />
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
    </TableRow>
  )
}

export default EditorPage
