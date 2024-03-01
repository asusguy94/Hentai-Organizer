import { Params } from '@interfaces'
import { db } from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'
import { getUnique } from '@utils/shared'

export async function GET(req: Request, { params }: Params<'id'>) {
  const { id } = validate(z.object({ id: z.coerce.number() }), params)

  const bookmarks = await db.bookmark.findMany({
    where: { videoID: id },
    orderBy: { start: 'asc' },
    select: {
      id: true,
      start: true,
      category: true,
      outfit: true,
      attributes: { include: { attribute: { select: { id: true, name: true } } } },
      star: {
        include: { attributes: { include: { attribute: { select: { id: true, name: true } } } } }
      }
    }
  })

  return Response.json(
    bookmarks.map(({ category, star, ...bookmark }) => {
      const starAttributes = star?.attributes.map(({ attribute }) => attribute) ?? []
      const bookmarkAttributes = bookmark.attributes.map(({ attribute }) => attribute)

      return {
        ...bookmark,
        name: category.name,
        outfit: bookmark.outfit?.name ?? null,
        attributes: getUnique([...starAttributes, ...bookmarkAttributes], 'id'),
        starID: star?.id ?? 0,
        starImage: star?.image ?? undefined
      }
    })
  )
}

export async function POST(req: Request, { params }: Params<'id'>) {
  const { id } = validate(z.object({ id: z.coerce.number() }), params)

  const { categoryID, time, starID } = validate(
    z.object({
      categoryID: z.number().int().positive(),
      time: z.number().int().positive(),
      starID: z.number().int().positive().optional()
    }),
    await req.json()
  )

  if (starID !== undefined) {
    // create or update bookmark with starID
    const bookmark = await db.bookmark.upsert({
      where: { videoID_start: { videoID: id, start: time } },
      create: {
        video: { connect: { id } },
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

    return Response.json({
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
    const bookmark = await db.bookmark.create({
      data: {
        video: { connect: { id } },
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

    return Response.json({
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
