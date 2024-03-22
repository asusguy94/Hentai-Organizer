/* eslint-disable @typescript-eslint/no-unsafe-assignment */

/* eslint-disable @typescript-eslint/no-unsafe-call */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import React, { useEffect, useState } from 'react'

import { Button, Card, Modal as MUIModal, Typography } from '@mui/material'

import { useKey } from 'react-use'

import { useModalContext } from '@/context/modalContext'

import styles from './modal.module.scss'

export default function ModalComponent() {
  const { modal, setModal } = useModalContext()

  const [query, setQuery] = useState('')

  useEffect(() => {
    setQuery('')
  }, [modal.filter])

  const isLetter = (e: KeyboardEvent) => /^Key([A-Z])$/.test(e.code)
  const isSpace = (e: KeyboardEvent) => e.code === 'Space'
  const isBackspace = (e: KeyboardEvent) => e.code === 'Backspace'

  useKey(
    e => modal.filter && (isLetter(e) || isSpace(e) || isBackspace(e)),
    e => {
      if (isBackspace(e)) {
        setQuery(prevQuery => prevQuery.slice(0, -1))
      } else {
        setQuery(prevQuery => prevQuery + e.key)
      }
    }
  )

  if (!modal.visible) return null

  return (
    <ModalChild title={modal.title} query={query} onClose={setModal} filter={modal.filter}>
      {modal.data}
    </ModalChild>
  )
}

type ModalChildProps = {
  title: string
  children: React.ReactNode
  query: string
  filter: boolean
  onClose: () => void
}

function ModalChild({ title, filter, children, query, onClose }: ModalChildProps) {
  const handleFilter = () => {
    return React.Children.toArray(children)
      .flatMap(child => {
        if (!React.isValidElement(child)) return []

        return typeof child.props.children === 'string' ? [child as React.ReactElement] : []
      })
      .filter(item => item.props.children.toLowerCase().includes(query))
      .sort((a, b) => {
        const valA: string = a.props.children.toLowerCase()
        const valB: string = b.props.children.toLowerCase()

        if (query.length > 0) {
          if (valA.startsWith(query) && valB.startsWith(query)) return 0
          else if (valA.startsWith(query)) return -1
          else if (valB.startsWith(query)) return 1
        }

        return valA.localeCompare(valB)
      })
  }

  return (
    <MUIModal open={true} onClose={onClose}>
      <Card id={styles.modal}>
        <div id={styles.header}>
          <Typography variant='h5' id={styles.label}>
            {title}
          </Typography>
          {query.length > 0 && <Typography id={styles.query}>{query}</Typography>}
        </div>

        <div id={styles.body}>
          <div id={styles.content}>{filter ? handleFilter() : children}</div>
          <div id={styles.actions}>
            <Button size='small' variant='contained' color='error' onClick={onClose}>
              Close
            </Button>
          </div>
        </div>
      </Card>
    </MUIModal>
  )
}
