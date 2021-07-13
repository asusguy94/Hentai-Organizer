export default {
	timeline: {
		offset: 0.88,
		spacing: 2
	},
	maxDurationDiff: 10,
	hls: {
		enabled: false,
		levels: { '1080': 3, '720': 2, '480': 1, '360': 0 },
		maxLevel: 720,
		maxStartLevel: 480
	},
	franchise: {
		title: {
			maxLength: 45
		}
	},
	modal: {
		filter: {
			search: true,
			startsWithOnTop: true
		}
	}
}
