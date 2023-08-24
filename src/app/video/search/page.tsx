import Client from './client'

import prisma from '@utils/server/prisma'

export const dynamic = 'force-dynamic'

export default async function VideoSearchPage() {
  const categories = await prisma.category.findMany()
  const outfits = await prisma.outfit.findMany({ orderBy: { name: 'asc' } })
  const attributes = await prisma.attribute.findMany({
    orderBy: { name: 'asc' },
    select: { id: true, name: true, videoOnly: true, starOnly: true }
  })
  const brands = await prisma.video.groupBy({
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
