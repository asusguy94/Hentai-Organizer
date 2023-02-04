import { IndexType } from '@interfaces'
import { HiddenProps, isHidden } from '../search/helper'

interface LabelCountProps<T> {
  obj: T[]
  label: string
  prop: string
}

function LabelCount<T extends IndexType<any> & HiddenProps>({ obj, label, prop }: LabelCountProps<T>) {
  const getPropCount = (visibleOnly = false) => {
    const filtered = obj.filter(item => item[prop]?.includes(label) && !(isHidden(item) && visibleOnly))

    return filtered.length
  }

  return (
    <>
      ({getPropCount(true)}
      <span className='divider'>|</span>
      {getPropCount()})
    </>
  )
}

export default LabelCount
