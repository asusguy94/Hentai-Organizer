import { z } from 'zod'

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

export default function validate<T>(schema: z.ZodType<T>, body: unknown) {
  if (body === undefined) throw new Error('Request-body is undefined')

  const result = schema.safeParse(body)
  if (!result.success) {
    const issue = result.error.issues[0]

    if (issue.path.length === 1) {
      throw new Error(`${issue.path[0]} -> ${issue.message}`)
    } else if (issue.path.length > 1) {
      throw new Error(`${issue.path.filter(p => typeof p === 'string').join('.')} -> ${issue.message}`)
    }

    throw new Error(issue.message)
  }

  return result.data
}

export { z }
