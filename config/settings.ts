function getValue(label: string, defaultValue: string): string {
  try {
    return process.env[label] ?? localStorage[label] ?? defaultValue
  } catch (e) {
    return defaultValue
  }
}

export default {
  qualities: [1080, 720, 480, 360],
  timeline: {
    offset: parseFloat(getValue('NEXT_PUBLIC_TIMELINE_OFFSET', '1')),
    spacing: parseFloat(getValue('NEXT_PUBLIC_TIMELINE_SPACING', '0'))
  },
  player: {
    thumbnails: getValue('NEXT_PUBLIC_PLAYER_THUMBNAILS', 'false') === 'true'
  }
}
