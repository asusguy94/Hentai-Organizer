import { db } from '@utils/server/prisma'
import { getUnique } from '@utils/shared'

export const dynamic = 'force-dynamic'

export async function GET() {
  return Response.json({
    breast: getUnique(
      (
        await db.star.findMany({
          where: { breast: { not: null } },
          orderBy: { breast: 'asc' }
        })
      ).flatMap(({ breast }) => (breast !== null ? [breast] : []))
    ),
    haircolor: getUnique(
      (
        await db.star.findMany({
          where: { haircolor: { not: null } },
          orderBy: { haircolor: 'asc' }
        })
      ).flatMap(({ haircolor }) => (haircolor !== null ? [haircolor] : []))
    ),
    hairstyle: getUnique(
      (
        await db.star.findMany({
          where: { hairstyle: { not: null } },
          orderBy: { hairstyle: 'asc' }
        })
      ).flatMap(({ hairstyle }) => (hairstyle !== null ? [hairstyle] : []))
    ),
    attribute: (
      await db.attribute.findMany({
        where: { videoOnly: false },
        orderBy: { name: 'asc' }
      })
    ).map(({ name: attribute }) => attribute)
  })
}
