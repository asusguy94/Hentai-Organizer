import { NextResponse } from 'next/server'

import fs from 'fs'

import { Params } from '@interfaces'
import { downloader, sendFile } from '@utils/server/helper'
import { db } from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

//NEXT /star/[id] && /star/search && /video/[id]
export async function GET(req: Request, { params }: Params<'id'>) {
  const id = parseInt(params.id)

  const star = await db.star.findFirstOrThrow({ where: { id } })
  if (star.image !== null) {
    return await sendFile(`./media/images/stars/${star.image}`)
  }
}

//NEXT /star/[id]
export async function POST(req: Request, { params }: Params<'id'>) {
  const id = parseInt(params.id)

  const { url } = validate(
    z.object({
      url: z.string().url()
    }),
    await req.json()
  )

  // Update Database
  await db.star.update({
    where: { id },
    data: { image: `${id}.jpg` }
  })

  // Download Image
  await downloader(url, `media/images/stars/${id}.jpg`)

  return NextResponse.json({
    image: `${id}.jpg`
  })
}

//NEXT /star/[id]
export async function DELETE(req: Request, { params }: Params<'id'>) {
  const id = parseInt(params.id)

  const star = await db.star.findFirstOrThrow({ where: { id } })
  if (star.image !== null) {
    const result = await db.star.update({
      where: { id },
      data: { image: null }
    })

    await fs.promises.unlink(`./media/images/stars/${star.image}`)

    return NextResponse.json(result)
  }
}
