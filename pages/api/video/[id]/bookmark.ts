import type { NextApiRequest, NextApiResponse } from 'next/types'

import { z } from 'zod'

import { prisma, validate } from '@utils/server'
import { getUnique } from '@utils/server/helper'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { id } = req.query

    if (typeof id === 'string') {
      res.json(
        (
          await prisma.bookmark.findMany({
            where: { videoID: parseInt(id) },
            orderBy: { start: 'asc' },
            include: {
              category: true,
              outfit: true,
              attributes: { include: { attribute: { select: { id: true, name: true } } } },
              star: {
                include: { attributes: { include: { attribute: { select: { id: true, name: true } } } } }
              }
            }
          })
        ).map(({ id, category, outfit, star, attributes, start }) => {
          const starAttributes = star?.attributes.map(({ attribute }) => attribute) ?? []
          const bookmarkAttributes = attributes.map(({ attribute }) => attribute)

          return {
            id,
            name: category.name,
            outfit: outfit?.name ?? null,
            attributes: getUnique([...starAttributes, ...bookmarkAttributes], 'id'),
            starID: star?.id ?? 0,
            starImage: star?.image ?? null,
            start
          }
        })
      )
    }
  } else if (req.method === 'POST') {
    const { id } = req.query

    if (typeof id === 'string') {
      const { categoryID, time, starID } = validate(
        z.object({
          categoryID: z.number().int().min(1),
          time: z.number().int().min(1),
          starID: z.number().int().min(1).optional()
        }),
        req.body
      )

      if (starID !== undefined) {
        // create or update bookmark with starID
        const bookmark = await prisma.bookmark.upsert({
          where: { videoID_start: { videoID: parseInt(id), start: time } },
          create: {
            video: { connect: { id: parseInt(id) } },
            category: { connect: { id: categoryID } },
            start: time,
            star: { connect: { id: starID } }
          },
          update: {
            star: { connect: { id: starID } }
          },
          select: {
            id: true,
            videoID: true,
            categoryID: true,
            start: true,
            starID: true,
            star: {
              select: {
                image: true,
                attributes: { select: { attribute: { select: { id: true, name: true } } } }
              }
            },
            attributes: { select: { attribute: { select: { id: true, name: true } } } }
          }
        })

        res.json({
          id: bookmark.id,
          videoID: bookmark.videoID,
          categoryID: bookmark.categoryID,
          time: bookmark.start,
          starID: bookmark.starID,
          starImage: bookmark.star?.image ?? null,
          attributes: getUnique(
            [
              ...bookmark.attributes.map(({ attribute }) => attribute),
              ...(bookmark.star?.attributes.map(({ attribute }) => attribute) ?? [])
            ],
            'id'
          )
        })
      } else {
        // create bookmark without star
        const bookmark = await prisma.bookmark.create({
          data: {
            video: { connect: { id: parseInt(id) } },
            category: { connect: { id: categoryID } },
            start: time
          },
          select: {
            id: true,
            videoID: true,
            categoryID: true,
            start: true,
            starID: true
          }
        })

        res.json({
          id: bookmark.id,
          videoID: bookmark.videoID,
          categoryID: bookmark.categoryID,
          time: bookmark.start,
          starID: 0,
          starImage: null,
          attributes: []
        })
      }
    }
  }

  res.status(400)
}
