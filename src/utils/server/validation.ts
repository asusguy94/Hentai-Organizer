import { z } from 'zod'

const validate = <T>(schema: z.ZodType<T>, body: unknown): T => schema.parse(body)

export { z }
export default validate
