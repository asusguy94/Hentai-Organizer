import { NextPage } from 'next/types'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/router'

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

import { IGeneral } from '@interfaces'
import { serverConfig } from '@config'

import styles from './editor.module.scss'

interface IUpdateRef {
  id: number
  name: string
  videoOnly?: boolean
  starOnly?: boolean
}

type IOnlyType = 'starOnly' | 'videoOnly'
type IWithOnlyType = IGeneral & { videoOnly?: boolean; starOnly?: boolean }

const EditorPage: NextPage = () => (
  <Grid container justifyContent='center'>
    <Wrapper label='attributes' name='attribute' obj={['starOnly', 'videoOnly']} />
    <Wrapper label='categories' name='category' />
    <Wrapper label='outfits' name='outfit' />
  </Grid>
)

const Wrapper = ({ label, name, obj = [] }: { label: string; name: string; obj?: IOnlyType[] }) => {
  const router = useRouter()

  const [input, setInput] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setInput(e.target.value)

  const handleSubmit = () => {
    if (input.length) {
      if (input.toLowerCase() === input) return

      axios.post(`${serverConfig.api}/${name}`, { name: input }).then(() => {
        router.reload()
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

interface TableWrapperProps {
  label: string
  obj: IOnlyType[]
}
const TableWrapper = ({ label, obj = [] }: TableWrapperProps) => {
  const [data, setData] = useState<IWithOnlyType[]>([])

  useEffect(() => {
    axios.get<IWithOnlyType[]>(`${serverConfig.api}/${label}`).then(({ data }) => {
      setData(data.sort((a, b) => a.id - b.id))
    })
  }, [label])

  const updateItem = (ref: IUpdateRef, value: string) => {
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
            <TableItem
              key={item.id}
              obj={obj}
              data={item}
              update={(ref: IUpdateRef, value: string) => updateItem(ref, value)}
            />
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  )
}

interface TableItemProps {
  update: (ref: IUpdateRef, value: string) => void
  data: IWithOnlyType
  obj: IOnlyType[]
}
const TableItem = ({ update, data, obj }: TableItemProps) => {
  const [edit, setEdit] = useState(false)
  const [value, setValue] = useState<null | string>(null)

  const save = () => {
    setEdit(false)

    if (value) update(data, value)
  }

  const setCondition = (ref: IUpdateRef, prop: string, value: boolean, checkbox: HTMLInputElement) => {
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
            onKeyPress={e => {
              if (e.key === 'Enter') save()
            }}
            onChange={e => setValue(e.currentTarget.value)}
          />
        ) : (
          <span onClick={() => setEdit(true)}>{data.name}</span>
        )}
      </TableCell>

      {obj.map(item => {
        return (
          <TableCell key={item} className='py-0'>
            <Checkbox
              defaultChecked={data[item]}
              onChange={e => setCondition(data, item, e.currentTarget.checked, e.currentTarget)}
            />
          </TableCell>
        )
      })}
    </TableRow>
  )
}

export default EditorPage
