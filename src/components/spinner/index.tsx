import { useEffect, useState } from 'react'

import styles from './loader.module.css'

type SpinnerProps = {
  delay?: number
}

export default function Spinner({ delay = 300 }: SpinnerProps) {
  const [showSpinner, setShowSpinner] = useState(false)

  useEffect(() => {
    const timer = setTimeout(() => setShowSpinner(true), delay)

    return () => clearTimeout(timer)
  }, [delay])

  if (!showSpinner) return false

  return <div id={styles.loader}></div>
}
