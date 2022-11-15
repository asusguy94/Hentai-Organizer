import { useState } from 'react'

export interface IEvent {
  event: boolean
  data: IEventData
}

export type IEventHandler = (event: boolean, data?: IEventData) => void

export interface IEventData {
  id: number
  name: string
  starID: number
  start: number
  active: boolean
  attributes: any[]
}

const useStarEvent = () => {
  const starEventData = {
    id: 0,
    name: '',
    starID: 0,
    start: 0,
    active: false,
    attributes: []
  }

  const [starEvent, setStarEvent] = useState<IEvent>({
    event: false,
    data: starEventData
  })

  const handleAddStarEvent = (event: boolean, data: IEventData = starEvent.data) => {
    setStarEvent({ event, data })
  }

  return { setEvent: handleAddStarEvent, getEvent: starEvent, getDefault: starEventData }
}

export default useStarEvent
