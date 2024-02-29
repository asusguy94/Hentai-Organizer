import { db } from '@utils/server/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const brands = await db.video.groupBy({
    where: { brand: { not: null } },
    by: ['brand'],
    orderBy: { brand: 'asc' }
  })

  return Response.json(brands.map(({ brand }) => brand))
}
