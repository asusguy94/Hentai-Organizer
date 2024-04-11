import { z } from 'zod'

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
