interface IRelated {
	id: number
	name: string
	plays: number
}

export interface IVideo {
	id: number
	name: string
	franchise: string
	brand: string
	episode: number
	duration: number
	nextID: number
	noStar: number
	censored: boolean
	path: { file: string; stream: string }
	date: { added: string; published: string }
	quality: number
	related: IRelated[]
}

export interface IAttribute {
	id: number
	name: string
}

export interface ICategory {
	id: number
	name: string
}

export interface IVideoStar {
	id: number
	name: string
	image?: string
	attributes: IAttribute[]
}

export interface IBookmark {
	id: number
	name: string
	starImage?: string
	starID: number
	start: number
	active: boolean
	attributes: IAttribute[]
}

export interface IKeyPress extends React.KeyboardEvent {
	target: HTMLInputElement
}
