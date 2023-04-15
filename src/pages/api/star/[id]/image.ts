import { NextApiRequest, NextApiResponse } from 'next/types'

import fs from 'fs'
import { z } from 'zod'

import { prisma, validate } from '@utils/server'
import { downloader, sendFile } from '@utils/server/helper'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { id } = req.query

    if (typeof id === 'string') {
      const star = await prisma.star.findFirstOrThrow({ where: { id: parseInt(id) } })
      if (star.image !== null) {
        await sendFile(res, `./media/images/stars/${star.image}`)
      }
    }
  } else if (req.method === 'POST') {
    const { id } = req.query

    if (typeof id === 'string') {
      const { url } = validate(
        z.object({
          url: z.string().url()
        }),
        req.body
      )

      // Update Database
      await prisma.star.update({ where: { id: parseInt(id) }, data: { image: `${id}.jpg` } })

      // Download Image
      await downloader(url, `media/images/stars/${id}.jpg`)

      res.json({ image: `${id}.jpg` })
    }
  } else if (req.method === 'DELETE') {
    const { id } = req.query

    if (typeof id === 'string') {
      const star = await prisma.star.findFirstOrThrow({ where: { id: parseInt(id) } })
      if (star.image !== null) {
        await prisma.star.update({ where: { id: parseInt(id) }, data: { image: null } })

        await fs.promises.unlink(`./media/images/stars/${star.image}`)

        res.end()
      }
    }
  }

  res.status(400)
}
