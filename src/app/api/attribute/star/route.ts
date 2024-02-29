import { db } from '@utils/server/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  return Response.json(
    await db.attribute.findMany({
      select: { id: true, name: true },
      where: { videoOnly: false },
      orderBy: { name: 'asc' }
    })
  )
}
