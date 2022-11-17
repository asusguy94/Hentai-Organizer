import type { NextApiRequest, NextApiResponse } from 'next/types'

import { prisma } from '@utils/server'
import { noExt, sendFile } from '@utils/server/helper'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { id } = req.query

    if (typeof id === 'string') {
      const video = await prisma.video.findFirstOrThrow({ where: { id: parseInt(id) } })

      await sendFile(res, `./media/videos/${noExt(video.path)}/master.m3u8`)
    }
  }

  res.status(400)
}