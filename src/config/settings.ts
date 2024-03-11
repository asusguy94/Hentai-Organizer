function getValueWithType<T>(label: string, defaultValue: T): T {
  try {
    const value = import.meta.env[label] ?? localStorage.getItem(label)

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
  pusher: {
    key: getValueWithType('PUSHER_KEY', ''),
    cluster: getValueWithType('PUSHER_CLUSTER', 'eu')
  }
}
