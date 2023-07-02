import Client from './client'

import prisma from '@utils/server/prisma'

export const dynamic = 'force-dynamic'

const VideoSearchPage = async () => {
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
      categories={categories}
      attributes={attributes}
      brands={brands.flatMap(({ brand }) => (brand !== null ? [brand] : []))}
      outfits={outfits}
    />
  )
}

export default VideoSearchPage
