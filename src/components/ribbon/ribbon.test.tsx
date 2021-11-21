import { render } from '@testing-library/react'

import Ribbon from './ribbon'

test('ribbon without label', () => {
	const { container: ribbon } = render(<Ribbon />)
	expect(ribbon.firstChild).toBeNull()
})

test('ribbon with label', () => {
	const { container: ribbon } = render(<Ribbon label='TestLabel' />)
	expect(ribbon.firstChild).toHaveTextContent('TestLabel')
})
