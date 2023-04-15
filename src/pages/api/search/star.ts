import { NextApiRequest, NextApiResponse } from 'next/types'

import prisma from '@utils/server/prisma'
import { formatDate } from '@utils/server/helper'
import { getUnique } from '@utils/shared'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    res.json(
      (
        await prisma.star.findMany({
          orderBy: { name: 'asc' },
          include: {
            attributes: {
              include: { attribute: true }
            },
            videos: {
              include: { video: true }
            }
          }
        })
      ).map(star => {
        const published =
          star.videos.length > 0
            ? star.videos
                .map(({ video }) => video)
                .flatMap(v => (v.date_published !== null ? [v.date_published] : []))
                .sort((a, b) => b.getTime() - a.getTime())[0]
            : null

        return {
          id: star.id,
          name: star.name,
          image: star.image,
          breast: star.breast,
          haircolor: star.haircolor,
          hairstyle: star.hairstyle,
          attributes: getUnique(star.attributes.map(({ attribute }) => attribute.name)),
          videos: {
            total: star.videos.length,
            last: published ? formatDate(published, true) : null
          }
        }
      })
    )
  }

  res.status(400)
}
