import './ribbon.scss'

const Ribbon = ({ label }: any) => (label ? <span className='ribbon unselectable'>{label}</span> : null)

export default Ribbon
