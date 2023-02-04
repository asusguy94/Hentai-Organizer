import { IndexType } from '@interfaces'

export interface HiddenProps<T extends IndexType<any> = IndexType<any>> {
  hidden: T
}

export function isHidden({ hidden }: HiddenProps) {
  for (const prop in hidden) {
    if (Array.isArray(hidden[prop])) {
      if (hidden[prop].length > 0) return true
    } else if (hidden[prop]) {
      return true
    }
  }

  return false
}

export function getVisible<T extends HiddenProps>(arr: T[]) {
  return arr.filter(item => !isHidden(item))
}
