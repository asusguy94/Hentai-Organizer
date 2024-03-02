import fs from 'fs'

import { Params } from '@interfaces'
import { dirOnly, formatDate, noExt, removeCover, removePoster, removePreviews } from '@utils/server/helper'
import { db } from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

export async function GET(req: Request, { params }: Params<'id'>) {
  const { id } = validate(z.object({ id: z.coerce.number() }), params)

  const { height, cen, ...video } = await db.video.findFirstOrThrow({
    where: { id },
    select: {
      id: true,
      slug: true,
      name: true,
      episode: true,
      path: true,
      franchise: true,
      noStar: true,
      duration: true,
      date: true,
      date_published: true,
      brand: true,
      height: true,
      cen: true
    }
  })

  return Response.json({
    ...video,
    quality: height,
    censored: cen,
    path: {
      file: video.path,
      stream: `${noExt(video.path)}/master.m3u8`
    },
    date: {
      added: formatDate(video.date),
      published: video.date_published ? formatDate(video.date_published) : null
    },
    related: (
      await db.video.findMany({
        where: { franchise: video.franchise },
        orderBy: { episode: 'asc' },
        select: {
          id: true,
          name: true,
          cover: true
        }
      })
    ).map(({ cover, ...video }) => ({
      ...video,
      image: cover
    }))
  })
}

export async function PUT(req: Request, { params }: Params<'id'>) {
  const { id } = validate(z.object({ id: z.coerce.number() }), params)

  const { cen, noStar, title, franchise, date, path } = validate(
    z.object({
      cen: z.boolean().optional(),
      noStar: z.boolean().optional(),
      title: z.string().optional(),
      franchise: z.string().optional(),
      date: z.string().optional(),
      path: z.string().optional()
    }),
    await req.json()
  )

  if (cen !== undefined) {
    return Response.json(
      await db.video.update({
        where: { id },
        data: { cen }
      })
    )
  } else if (noStar !== undefined) {
    return Response.json(
      await db.video.update({
        where: { id },
        data: { noStar }
      })
    )
  } else if (title !== undefined) {
    return Response.json(
      await db.video.update({
        where: { id },
        data: { name: title }
      })
    )
  } else if (franchise !== undefined) {
    return Response.json(
      await db.video.update({
        where: { id },
        data: { franchise }
      })
    )
  } else if (date !== undefined) {
    if (!date) {
      return Response.json(
        await db.video.update({
          where: { id },
          data: { date_published: null }
        })
      )
    } else {
      const video = await db.video.update({
        where: { id },
        data: { date_published: new Date(formatDate(date, true)) }
      })

      return Response.json({
        ...video,
        date_published: video.date_published !== null ? formatDate(video.date_published) : null
      })
    }
  } else if (path !== undefined) {
    const video = await db.video.findFirstOrThrow({ where: { id } })

    fs.promises.rename(`./media/videos/${video.path}`, `./media/videos/${path}`)
    fs.promises.rename(`./media/videos/${dirOnly(video.path)}`, `./media/videos/${dirOnly(path)}`)
    //TODO the last one throws if the folder doesn't exist

    // UPDATE DATABASE
    return Response.json(
      await db.video.update({
        where: { id },
        data: { path }
      })
    )
  } else {
    // Refresh Video
    // Update Database
    const result = await db.video.update({
      where: { id },
      data: { duration: 0, height: 0 }
    })

    // DEBUG only used for updating quality >> will require some time to refresh
    // removeStreamFolder(`./media/videos/${dirOnly(video.path)}`)

    // Remove Previews
    await removePreviews(id)
    // Remove Files
    await removeCover(id)
    await removePoster(id)

    return Response.json(result)
  }
}

export function DELETE(req: Request, { params }: Params<'id'>) {
  const { id } = validate(z.object({ id: z.coerce.number() }), params)

  const result = db.video.delete({ where: { id } })

  result.then(async video => {
    await removeCover(id)
    await removePoster(id)
    await removePreviews(id)

    await Promise.allSettled([
      // Remove video-file
      fs.promises.unlink(`./media/videos/${video.path}`),

      // Remove stream-files
      fs.promises.rm(`./media/videos/${dirOnly(video.path)}`, { recursive: true, force: true })
    ])
  })

  return Response.json(result)
}
