import Client from './client'

import { Params } from '@interfaces'
import { db } from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

//TODO migrate to api
export default async function StarPage({ params }: Params<'id'>) {
  const { id } = validate(z.object({ id: z.coerce.number() }), params)

  const star = await db.star.findFirstOrThrow({ where: { id } })

  const videos = await db.video.findMany({
    select: { id: true, name: true, path: true },
    where: { stars: { some: { starID: id } } },
    orderBy: [{ franchise: 'asc' }, { episode: 'asc' }]
  })

  const attributes = await db.starAttributes.findMany({
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
