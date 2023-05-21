import { NextApiRequest, NextApiResponse } from 'next/types'

import prisma from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { id } = req.query

    if (typeof id === 'string') {
      res.json(
        (
          await prisma.star.findMany({
            where: { videos: { some: { videoID: parseInt(id) } } },
            select: {
              id: true,
              name: true,
              image: true,
              attributes: { select: { attribute: { select: { id: true, name: true } } } }
            }
          })
        ).map(({ attributes, ...star }) => ({
          ...star,
          attributes: attributes.map(({ attribute }) => attribute)
        }))
      )
    }
  } else if (req.method === 'POST') {
    const { id } = req.query

    if (typeof id === 'string') {
      const { name } = validate(
        z.object({
          name: z.string().min(2)
        }),
        req.body
      )

      const star = await prisma.star.upsert({
        where: { name },
        create: { name },
        update: {},
        include: { attributes: { select: { attribute: { select: { id: true, name: true } } } } }
      })
      await prisma.videoStars.create({ data: { starID: star.id, videoID: parseInt(id) } })

      res.json({
        ...star,
        attributes: star.attributes.map(({ attribute }) => attribute)
      })
    }
  }

  res.status(400)
}