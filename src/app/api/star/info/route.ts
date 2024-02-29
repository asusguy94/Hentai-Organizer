import { db } from '@utils/server/prisma'

export const dynamic = 'force-dynamic'

export async function GET() {
  const breasts = await db.star.groupBy({
    where: { breast: { not: null } },
    by: ['breast'],
    orderBy: { breast: 'asc' }
  })

  const haircolors = await db.star.groupBy({
    where: { haircolor: { not: null } },
    by: ['haircolor'],
    orderBy: { haircolor: 'asc' }
  })

  const hairstyles = await db.star.groupBy({
    where: { hairstyle: { not: null } },
    by: ['hairstyle'],
    orderBy: { hairstyle: 'asc' }
  })

  return Response.json({
    breasts: breasts.map(({ breast }) => breast),
    haircolors: haircolors.map(({ haircolor }) => haircolor),
    hairstyles: hairstyles.map(({ hairstyle }) => hairstyle)
  })
}
