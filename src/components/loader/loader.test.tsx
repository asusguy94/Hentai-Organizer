import { render } from '@testing-library/react'
import Loader from './loader'

test('ribbon without label or props', () => {
	const { container: loader } = render(<Loader />)
	expect(loader.firstChild).toHaveAttribute('id', 'loader')
	expect(loader.firstChild).toBeEmptyDOMElement()
})
