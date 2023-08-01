import { useState } from 'react'

export type Event = {
  event: boolean
  data: EventData
}

export type EventHandler = (event: boolean, data?: EventData) => void

export type EventData = {
  id: number
  name: string
  starID: number
  start: number
  active: boolean
  attributes: unknown[]
}

function useStarEvent() {
  const starEventData = {
    id: 0,
    name: '',
    starID: 0,
    start: 0,
    active: false,
    attributes: []
  }

  const [starEvent, setStarEvent] = useState<Event>({
    event: false,
    data: starEventData
  })

  function handleAddStarEvent(event: boolean, data: EventData = starEvent.data) {
    setStarEvent({ event, data })
  }

  return { setEvent: handleAddStarEvent, getEvent: starEvent, getDefault: starEventData }
}

export default useStarEvent
