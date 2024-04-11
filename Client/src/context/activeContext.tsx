import { createContext, useContext, useState } from 'react'

import { Attribute, SetState, VideoStar } from '@/interface'

type ActiveContextState = {
  active: {
    star: VideoStar | null
    attribute: Attribute | null
    outfit: string | null
  }
  setActive: {
    star: SetState<VideoStar | null>
    attribute: SetState<Attribute | null>
    outfit: SetState<string | null>
  }
}

const ActiveContext = createContext<ActiveContextState | null>(null)

export default function ActiveContextProvider({ children }: { children: React.ReactNode }) {
  const [star, setStar] = useState<VideoStar | null>(null)
  const [attribute, setAttribute] = useState<Attribute | null>(null)
  const [outfit, setOutfit] = useState<string | null>(null)

  return (
    <ActiveContext.Provider
      value={{
        active: {
          star,
          attribute,
          outfit
        },
        setActive: {
          star: setStar,
          attribute: setAttribute,
          outfit: setOutfit
        }
      }}
    >
      {children}
    </ActiveContext.Provider>
  )
}

export function useActiveContext() {
  const context = useContext(ActiveContext)
  if (context === null) {
    throw new Error('useActiveContext must be used within ActiveContextProvider')
  }

  return context
}
