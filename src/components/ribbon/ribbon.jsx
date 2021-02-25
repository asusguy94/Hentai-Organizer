import './ribbon.scss'

const Ribbon = ({ label }) => (label ? <span className='ribbon'>{label}</span> : null)

export default Ribbon
