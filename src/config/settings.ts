function getValue(label: string, defaultValue: string): string {
  if (!label.startsWith('NEXT_PUBLIC_')) label = `NEXT_PUBLIC_${label}`

  try {
    return process.env[label] ?? localStorage[label] ?? defaultValue
  } catch (e) {
    return defaultValue
  }
}

export default {
  qualities: [1080, 720, 480, 360],
  player: {
    thumbnails: getValue('PLAYER_THUMBNAILS', 'false') === 'true',
    quality: {
      max: parseInt(getValue('PLAYER_QUALITY_MAX', '1080'))
    }
  },
  debug: getValue('DEBUG', 'false') === 'true'
}
