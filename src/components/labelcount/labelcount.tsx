import { isHidden } from '@components/search/helper'

interface ILabelCount {
	obj: any[]
	label: string
	prop: string
}
const LabelCount = ({ obj, label, prop }: ILabelCount) => {
	const getPropCount = (visibleOnly = false) => {
		const filtered = obj.filter((item) => item[prop].includes(label) && !(isHidden(item) && visibleOnly))

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
