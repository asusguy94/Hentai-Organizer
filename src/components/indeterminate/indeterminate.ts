interface IHandler {
	checked: boolean
	indeterminate: boolean
}
export const handler = ({ checked, indeterminate }: IHandler) => {
	if (checked) {
		return { indeterminate: true, checked: false }
	} else if (indeterminate) {
		return { indeterminate: false, checked: false }
	} else {
		return { indeterminate: false, checked: true }
	}
}
