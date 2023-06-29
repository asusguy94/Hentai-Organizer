import { NextApiRequest, NextApiResponse } from 'next/types'

import prisma from '@utils/server/prisma'
import { getUnique } from '@utils/shared'
import { formatDate } from '@utils/server/helper'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    res.json(
      (
        await prisma.video.findMany({
          orderBy: { name: 'asc' },
          select: {
            id: true,
            noStar: true,
            cen: true,
            height: true,
            franchise: true,
            brand: true,
            name: true,
            date_published: true,
            plays: true,
            cover: true,
            bookmarks: {
              select: {
                category: true,
                outfit: true,
                attributes: { select: { attribute: { select: { name: true } } } }
              }
            },
            stars: {
              select: { star: { select: { attributes: { select: { attribute: { select: { name: true } } } } } } }
            }
          }
        })
      ).map(({ date_published, height, bookmarks, stars, ...video }) => ({
        ...video,
        plays: video.plays.length,
        quality: height,
        attributes: getUnique([
          ...stars.flatMap(({ star }) => star.attributes).map(({ attribute }) => attribute.name),
          ...bookmarks.flatMap(({ attributes }) => attributes).map(({ attribute }) => attribute.name)
        ]),
        published: date_published !== null ? formatDate(date_published, true) : null,
        categories: getUnique(bookmarks.map(({ category }) => category.name)),
        outfits: getUnique(bookmarks.flatMap(({ outfit }) => (outfit !== null ? [outfit.name] : [])))
      }))
    )
  }

  res.status(400)
}
