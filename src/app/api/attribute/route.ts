import { db } from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

export async function GET() {
  return Response.json(
    await db.attribute.findMany({
      select: { id: true, name: true, videoOnly: true, starOnly: true },
      orderBy: { name: 'asc' }
    })
  )
}

export async function POST(req: Request) {
  const { name } = validate(
    z.object({
      name: z.string().min(3)
    }),
    await req.json()
  )

  return Response.json(
    await db.attribute.create({
      data: { name }
    })
  )
}
