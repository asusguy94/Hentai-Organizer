import App from '@/App'

import { renderWithRouter } from '@/test-utils'

test('bad-url', () => {
	const { container: bad } = renderWithRouter(<App />, { route: '/something-that-does-not-match' })
	const { container: good } = renderWithRouter(<App />, { route: '/test' })

	expect(bad.getElementsByTagName('h4')[0]).toHaveTextContent('Oops!')
	expect(good.getElementsByTagName('h4')[0]).not.toHaveTextContent('Oops!')
})
