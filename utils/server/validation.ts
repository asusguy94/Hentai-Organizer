import { NextRequest } from 'next/server'
// import Joi from 'joi'
import { z } from 'zod'

// export const joiValidation = (schema: Joi.Schema, body: NextRequest['body']) => {
//   const { error, value } = schema.validate(body ?? {})
//   if (error) throw new Error(error.details[0].message)

//   return value
// }

const zodValidation = <T>(schema: z.ZodType<T>, body: NextRequest['body']): T => schema.parse(body)

export default zodValidation
