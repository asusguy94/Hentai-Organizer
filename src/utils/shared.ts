import dayjs from 'dayjs'

export function getUnique<T extends object>(arr: T[], prop: keyof T): T[]
export function getUnique<T>(arr: T[]): T[]
export function getUnique<T>(arr: T[], prop?: keyof T): T[] {
  if (prop !== undefined) {
    return arr.filter((obj, idx) => arr.findIndex(item => item[prop] === obj[prop]) === idx)
  }

  return [...new Set(arr)]
}

export function clamp(value: number, minOrMax: number, max?: number): number {
  if (max === undefined) {
    // min was not supplied, use 0 as default value
    return clamp(value, 0, minOrMax)
  }

  // min was supplied, use regular clamp
  return Math.min(Math.max(value, minOrMax), max)
}

export function escapeRegExp(input: string) {
  return input.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export function getProgress(index: number, total: number) {
  return {
    progress: clamp((index + 1) / (total + 1), 1),
    buffer: clamp((index + 2) / (total + 1), 1)
  }
}

export function calculateTimeCode(seconds: number, timeFormat = 'HH:mm:ss'): string {
  return dayjs(0)
    .hour(0)
    .millisecond(seconds * 1000)
    .format(timeFormat) // use .SSS for milliseconds
}

export async function getResponse<T>(href: string) {
  return fetch(href).then(res => res.json() as Promise<T>)
}
