import { Link } from 'react-router-dom'

import { Button, Grid, Typography } from '@material-ui/core'

const ErrorPage = () => (
	<Grid item id='error-page' className='text-center'>
		<Typography variant='h4'>Title</Typography>
		<Typography variant='h6'>Seems like this page is not created yet</Typography>

		<Link to='/'>
			<Button variant='contained' color='primary'>
				Go Back
			</Button>
		</Link>
	</Grid>
)

export default ErrorPage
