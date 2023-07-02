import Client from './client'

import { Params } from '@interfaces'
import prisma from '@utils/server/prisma'

const StarPage = async ({ params }: Params<'id'>) => {
  const id = parseInt(params.id)

  const star = await prisma.star.findFirstOrThrow({ where: { id } })

  const videos = await prisma.video.findMany({
    select: { id: true, name: true, path: true },
    where: { stars: { some: { starID: id } } },
    orderBy: [{ franchise: 'asc' }, { episode: 'asc' }]
  })

  const attributes = await prisma.starAttributes.findMany({
    where: { starID: star.id },
    include: { attribute: { select: { name: true } } }
  })

  return (
    <Client
      star={{
        id: star.id,
        name: star.name,
        image: star.image,

        info: {
          breast: star.breast ?? '',
          haircolor: star.haircolor ?? '',
          hairstyle: star.hairstyle ?? '',
          attribute: attributes.map(({ attribute }) => attribute.name)
        },
        link: star.starLink
      }}
      videos={videos}
    />
  )
}

export default StarPage
