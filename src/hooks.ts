import { useCallback, useEffect, useState, useRef } from 'react'

export const useRefWithEffect = () => {
	const [refValue, setRefValue] = useState()
	const ref = useCallback((node) => setRefValue(node), [])

	return [ref, refValue]
}

export const useWindowSize = () => {
	const [windowSize, setWindowSize] = useState({ width: 0, height: 0 })

	useEffect(() => {
		const handleResize = () => setWindowSize({ width: window.innerWidth, height: window.innerHeight })

		// Add event listener
		window.addEventListener('resize', handleResize)

		// Get initial values
		handleResize()

		// Remove event listener
		return () => window.removeEventListener('resize', handleResize)
	}, [])

	return windowSize
}

export const usePrevious = (value: any): any => {
	// Store current value in ref
	const ref = useRef()

	useEffect(() => {
		ref.current = value
	}, [value]) // Only re-run if value changes

	// Return previous value (happens before update in useEffect above)
	return ref.current
}
