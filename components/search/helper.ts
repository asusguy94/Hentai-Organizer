import { IndexType } from '@interfaces'

export interface HiddenProps {
  hidden: IndexType
}

export const isHidden = ({ hidden }: HiddenProps) => {
  for (const prop in hidden) {
    if (Array.isArray(hidden[prop])) {
      if (hidden[prop].length > 0) return true
    } else if (hidden[prop]) {
      return true
    }
  }

  return false
}

export const getVisible = (arr: any[]) => arr.filter((item: any) => !isHidden(item) && item)
