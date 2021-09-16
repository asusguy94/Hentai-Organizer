export const isHidden = ({ hidden }: any) => {
	for (let prop in hidden) {
		if (Array.isArray(hidden[prop])) {
			if (hidden[prop].length > 0) return true
		} else if (hidden[prop]) {
			return true
		}
	}

	return false
}

export const getCount = (obj: any) => {
	let count = obj.length

	obj.forEach(({ hidden }: any) => {
		let value = 0
		for (const prop in hidden) {
			if (Array.isArray(hidden[prop])) {
				value += Number(hidden[prop].length > 0)
			} else {
				value += Number(hidden[prop])
			}
		}
		if (value) count--
	})
	return count
}

export const getVisible = (arr: any[]) => arr.filter((item: any) => (!isHidden(item) ? item : null))
