import fs from 'fs'

import { Params } from '@interfaces'
import { downloader, sendFile } from '@utils/server/helper'
import { db } from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

export async function GET(req: Request, { params }: Params<'id'>) {
  const { id } = validate(z.object({ id: z.coerce.number() }), params)

  const star = await db.star.findFirstOrThrow({ where: { id } })
  if (star.image !== null) {
    return await sendFile(`./media/images/stars/${star.image}`)
  }
}

export async function POST(req: Request, { params }: Params<'id'>) {
  const { id } = validate(z.object({ id: z.coerce.number() }), params)

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

  return Response.json({
    image: `${id}.jpg`
  })
}

export async function DELETE(req: Request, { params }: Params<'id'>) {
  const { id } = validate(z.object({ id: z.coerce.number() }), params)

  const star = await db.star.findFirstOrThrow({ where: { id } })
  if (star.image !== null) {
    const result = await db.star.update({
      where: { id },
      data: { image: null }
    })

    await fs.promises.unlink(`./media/images/stars/${star.image}`)

    return Response.json(result)
  }
}
