import { createContext, useContext, useState } from 'react'

export type Modal = {
  visible: boolean
  title: string
  data: React.ReactNode
  filter: boolean
}

type ModalHandler = (title?: Modal['title'], data?: Modal['data'], filter?: Modal['filter']) => void

type ActiveContextState = {
  modal: Modal
  setModal: ModalHandler
}

const ModalContext = createContext<ActiveContextState | null>(null)

export default function ModalContextProvider({ children }: { children: React.ReactNode }) {
  const [modal, setModal] = useState<Modal>({
    visible: false,
    title: '',
    data: null,
    filter: false
  })

  const handleModal: ModalHandler = (title = '', data = null, filter = false) => {
    setModal(prevModal => ({
      title,
      data,
      visible: !prevModal.visible,
      filter
    }))
  }

  return <ModalContext.Provider value={{ modal, setModal: handleModal }}>{children}</ModalContext.Provider>
}

export function useModalContext() {
  const context = useContext(ModalContext)
  if (context === null) {
    throw new Error('useModalContext must be used within ModalContextProvider')
  }

  return context
}
