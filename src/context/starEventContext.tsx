import { createContext, useContext, useState } from 'react'

type EventData = {
  id: number
  name: string
  starID: number
  start: number
  attributes: unknown[]
}

type Event = {
  event: boolean
  data: EventData
}

type StarEventContextState = {
  setEvent: (event: boolean, data?: EventData) => void
  getEvent: Event
  getDefault: EventData
}

const StarEventContext = createContext<StarEventContextState | null>(null)

export default function StarEventContextProvider({ children }: { children: React.ReactNode }) {
  const starEventData: EventData = {
    id: 0,
    name: '',
    starID: 0,
    start: 0,
    attributes: []
  }

  const [starEvent, setStarEvent] = useState<Event>({
    event: false,
    data: starEventData
  })

  const handleAddStarEvent = (event: boolean, data: EventData = starEvent.data) => {
    setStarEvent({ event, data })
  }

  return (
    <StarEventContext.Provider
      value={{
        setEvent: handleAddStarEvent,
        getEvent: starEvent,
        getDefault: starEventData
      }}
    >
      {children}
    </StarEventContext.Provider>
  )
}

export function useStarEventContext() {
  const context = useContext(StarEventContext)
  if (context === null) {
    throw new Error('useStarContext must be used within StarEventContextProvider')
  }

  return context
}
