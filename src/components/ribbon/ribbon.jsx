import './ribbon.scss'

const Ribbon = ({ label }) => (label ? <span className='ribbon unselectable'>{label}</span> : null)

export default Ribbon
