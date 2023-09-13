import Client from './client'

import { db } from '@utils/server/prisma'

export const dynamic = 'force-dynamic'

export default async function VideoSearchPage() {
  const categories = await db.category.findMany()
  const outfits = await db.outfit.findMany({ orderBy: { name: 'asc' } })
  const attributes = await db.attribute.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, videoOnly: true, starOnly: true }
  })
  const brands = await db.video.groupBy({
    where: { brand: { not: null } },
    by: ['brand'],
    orderBy: { brand: 'asc' }
  })

  return (
    <Client
      videoInfo={{
        categories,
        attributes,
        outfits
      }}
      brands={brands.flatMap(({ brand }) => (brand !== null ? [brand] : []))}
    />
  )
}
