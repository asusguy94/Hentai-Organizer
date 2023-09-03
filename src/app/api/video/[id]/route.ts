import { NextResponse } from 'next/server'

import fs from 'fs'

import { Params } from '@interfaces'
import { dirOnly, formatDate, removeCover, removePoster, removePreviews } from '@utils/server/helper'
import prisma from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

//NEXT /video/[id]
export async function PUT(req: Request, { params }: Params<'id'>) {
  const id = parseInt(params.id)

  const { cen, noStar, plays, title, franchise, date, path } = validate(
    z.object({
      cen: z.boolean().optional(),
      noStar: z.boolean().optional(),
      plays: z.number().int().nonnegative().optional(),
      title: z.string().optional(),
      franchise: z.string().optional(),
      date: z.string().optional(),
      path: z.string().optional()
    }),
    await req.json()
  )

  if (cen !== undefined) {
    return NextResponse.json(
      await prisma.video.update({
        where: { id },
        data: { cen }
      })
    )
  } else if (noStar !== undefined) {
    return NextResponse.json(
      await prisma.video.update({
        where: { id },
        data: { noStar }
      })
    )
  } else if (plays !== undefined) {
    if (!plays) {
      return NextResponse.json(
        await prisma.plays.deleteMany({
          where: { id }
        })
      )
    } else {
      // Add PLAYS
      return NextResponse.json(
        await prisma.plays.create({
          data: { videoID: id }
        })
      )
    }
  } else if (title !== undefined) {
    return NextResponse.json(
      await prisma.video.update({
        where: { id },
        data: { name: title }
      })
    )
  } else if (franchise !== undefined) {
    return NextResponse.json(
      await prisma.video.update({
        where: { id },
        data: { franchise }
      })
    )
  } else if (date !== undefined) {
    if (!date) {
      return NextResponse.json(
        await prisma.video.update({
          where: { id },
          data: { date_published: null }
        })
      )
    } else {
      const video = await prisma.video.update({
        where: { id },
        data: { date_published: new Date(formatDate(date, true)) }
      })

      return NextResponse.json({
        ...video,
        date_published: video.date_published !== null ? formatDate(video.date_published) : null
      })
    }
  } else if (path !== undefined) {
    const video = await prisma.video.findFirstOrThrow({ where: { id } })

    fs.promises.rename(`./media/videos/${video.path}`, `./media/videos/${path}`)
    fs.promises.rename(`./media/videos/${dirOnly(video.path)}`, `./media/videos/${dirOnly(path)}`)
    //TODO the last one throws if the folder doesn't exist

    // UPDATE DATABASE
    return NextResponse.json(
      await prisma.video.update({
        where: { id },
        data: { path }
      })
    )
  } else {
    // Refresh Video
    // Update Database
    const result = await prisma.video.update({
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

    return NextResponse.json(result)
  }
}

//NEXT /video/[id]
export function DELETE(req: Request, { params }: Params<'id'>) {
  const id = parseInt(params.id)

  const result = prisma.video.delete({ where: { id } })

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

  return NextResponse.json(result)
}
