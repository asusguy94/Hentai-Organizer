import { NextResponse } from 'next/server'

import { db } from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

//NEXT /video/add
export async function POST(req: Request) {
  const { videos } = validate(
    z.object({
      videos: z.array(
        z.object({
          name: z.string(),
          path: z.string(),
          episode: z.number().int(),
          franchise: z.string(),
          slug: z.string()
        })
      )
    }),
    await req.json()
  )

  const res = []
  for await (const video of videos) {
    res.push(
      await db.video.create({
        data: {
          name: video.name,
          path: video.path,
          episode: video.episode,
          franchise: video.franchise,
          slug: video.slug
        }
      })
    )
  }

  return NextResponse.json(res)
}
