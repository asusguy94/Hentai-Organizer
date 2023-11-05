function getValueWithType<T>(label: string, defaultValue: T): T {
  try {
    const value = process.env[label] ?? localStorage.getItem(`NEXT_PUBLIC_${label}`)

    if (value !== null) {
      try {
        // Always attempt JSON parsing first
        return JSON.parse(value) as T
      } catch {
        // If it fails, treat the value as a raw string
        if (typeof defaultValue === 'string') {
          return value as T
        }
      }
    }

    return defaultValue
  } catch {
    return defaultValue
  }
}

export default {
  qualities: [1080, 720, 480, 360],
  player: {
    thumbnails: getValueWithType<boolean>('PLAYER_THUMBNAILS', false),
    quality: {
      max: getValueWithType<number>('PLAYER_QUALITY_MAX', 1080)
    }
  },
  addFiles: {
    maxFiles: getValueWithType<number>('ADD_FILES_MAX', 10)
  },
  pusher: {
    appId: process.env['PUSHER_APP_ID'] ?? '',
    key: getValueWithType('PUSHER_KEY', ''),
    secret: process.env['PUSHER_SECRET'] ?? '',
    cluster: getValueWithType('PUSHER_CLUSTER', 'eu')
  },
  debug: getValueWithType<boolean>('DEBUG', false)
}
