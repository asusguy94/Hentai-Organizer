import { useState } from 'react'

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

import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { createFileRoute } from '@tanstack/react-router'
import capitalize from 'capitalize'

import { createApi } from '@/config'
import { General } from '@/interface'

import styles from './editor.module.css'

type UpdateRef = {
  id: number
  name: string
  videoOnly?: boolean
  starOnly?: boolean
}

type TableKeys = 'attribute' | 'category' | 'outfit'
type OnlyType = 'starOnly' | 'videoOnly'
type WithOnlyType = General & Partial<Record<OnlyType, boolean>>

export const Route = createFileRoute('/editor/')({
  component: () => (
    <Grid container justifyContent='center'>
      <Table name='attribute' obj={['starOnly', 'videoOnly']} />
      <Table name='category' />
      <Table name='outfit' />
    </Grid>
  )
})

type WrapperProps = {
  name: TableKeys
  obj?: OnlyType[]
}

function Table({ name, obj }: WrapperProps) {
  const [input, setInput] = useState('')

  const queryClient = useQueryClient()

  const { api } = createApi(`/${name}`)

  const { data } = useQuery<WithOnlyType[]>({
    queryKey: [name],
    queryFn: () => api.get('')
  })

  const { mutate: mutateCreate } = useMutation<unknown, Error, { name: string }>({
    mutationKey: [name, 'create'],
    mutationFn: payload => api.post('', payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [name] })
  })

  const { mutate: mutateCheckbox } = useMutation<unknown, Error, { name: string; ref: UpdateRef }>({
    mutationKey: [name, 'updateCheckbox'],
    mutationFn: ({ ref, ...payload }) => api.post(`/${ref.id}`, payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: [name] })
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()

    if (input.length > 0 && input.toLowerCase() !== input) {
      mutateCreate({ name: input })
    }
  }

  return (
    <Grid item xs={3} style={{ paddingLeft: 3 * 8, paddingRight: 3 * 8 }}>
      <Grid container justifyContent='center' style={{ marginBottom: 10 }}>
        <Grid item component='form' onSubmit={handleSubmit}>
          <TextField
            variant='standard'
            name={capitalize(name)}
            onChange={e => setInput(e.target.value)}
            style={{ marginLeft: 5, marginRight: 5 }}
          />

          <Button type='submit' variant='contained' color='primary' size='small' style={{ marginTop: 2 }}>
            Add {name}
          </Button>
        </Grid>
      </Grid>

      <TableContainer component={Paper} style={{ overflowX: 'visible' }}>
        <MuiTable size='small' className={styles['table-striped']} stickyHeader>
          <TableHead>
            <MuiTableRow>
              <TableCell>ID</TableCell>
              <TableCell>{capitalize(name)}</TableCell>

              {obj?.map(name => <TableCell key={name}>{name}</TableCell>)}
            </MuiTableRow>
          </TableHead>

          <TableBody>
            {data?.map(item => (
              <TableRow
                key={item.id}
                obj={obj}
                data={item}
                update={(ref, value) => mutateCheckbox({ ref, name: value })}
              />
            ))}
          </TableBody>
        </MuiTable>
      </TableContainer>
    </Grid>
  )
}

type TableRowProps = {
  update: (ref: UpdateRef, value: string) => void
  data: WithOnlyType
  obj?: OnlyType[]
}
function TableRow({ update, data, obj }: TableRowProps) {
  const [edit, setEdit] = useState(false)
  const [input, setInput] = useState('')

  const queryClient = useQueryClient()

  const { api } = createApi(`/attribute/${data.id}`)

  const { mutate } = useMutation<unknown, Error, { label: string; value: boolean }>({
    mutationKey: ['attribute', 'updateName'],
    mutationFn: payload => api.put('', payload),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['attribute'] })
  })

  const save = () => {
    setEdit(false)

    if (input) update(data, input)
  }

  const setCondition = (_ref: UpdateRef, prop: string, value: boolean, checkbox: HTMLInputElement) => {
    mutate({ label: prop, value }, { onError: () => (checkbox.checked = !value) })
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

      {obj?.map(item => (
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
