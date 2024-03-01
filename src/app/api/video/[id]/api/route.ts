import { Params } from '@interfaces'
import { getVideo } from '@utils/server/hanime'
import { downloader } from '@utils/server/helper'
import { db } from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

//NEXT /video/[id]
export async function PUT(req: Request, { params }: Params<'id'>) {
  const id = parseInt(params.id)

  const { slug, brand, date, cover, poster } = validate(
    z.object({
      slug: z.string().optional(),
      brand: z.literal(true).optional(),
      date: z.literal(true).optional(),
      cover: z.literal(true).optional(),
      poster: z.literal(true).optional()
    }),
    await req.json()
  )

  const video = await db.video.findFirstOrThrow({ where: { id } })

  if (slug !== undefined) {
    // Update date and brand
    try {
      const { released, brand } = await getVideo(slug)

      return Response.json(
        await db.video.update({
          data: { date_published: new Date(released.date), brand, slug },
          where: { id }
        })
      )
    } catch (e) {
      return Response.json({
        error: 'invalid slug'
      })
    }
  } else if (brand) {
    if (video.slug !== null) {
      const { brand } = await getVideo(video.slug)

      return Response.json(
        await db.video.update({
          data: { brand },
          where: { id }
        })
      )
    }
  } else if (date) {
    if (video.slug !== null) {
      const { released } = await getVideo(video.slug)

      return Response.json(
        await db.video.update({
          data: { date_published: new Date(released.date) },
          where: { id }
        })
      )
    }
  } else if (cover) {
    if (video.slug !== null) {
      const { cover } = await getVideo(video.slug)

      downloader(cover, `media/images/videos/cover/${video.id}.png`)

      return Response.json(
        await db.video.update({
          data: { cover },
          where: { id }
        })
      )
    }
  } else if (poster) {
    if (video.slug !== null) {
      const { poster } = await getVideo(video.slug)

      downloader(poster, `media/images/videos/poster/${video.id}.png`)

      return Response.json(
        await db.video.update({
          data: { poster },
          where: { id }
        })
      )
    }
  }
}
