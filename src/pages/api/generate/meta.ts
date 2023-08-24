import { NextApiRequest, NextApiResponse } from 'next/types'

import { rebuildVideoFile, getDuration, getHeight } from '@utils/server/ffmpeg'
import { fileExists, getClosestQ, logger } from '@utils/server/helper'
import prisma from '@utils/server/prisma'

//NEXT /video/add
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const videos = await prisma.video.findMany({ where: { OR: [{ duration: 0 }, { height: 0 }] } })

    logger('Updating METADATA')
    for await (const video of videos) {
      const videoPath = `videos/${video.path}`
      const absoluteVideoPath = `./media/${videoPath}`

      if (await fileExists(absoluteVideoPath)) {
        logger(`Rebuilding: ${video.id}`)
        await rebuildVideoFile(absoluteVideoPath).then(async () => {
          const height = await getHeight(absoluteVideoPath)
          const duration = await getDuration(absoluteVideoPath)

          logger(`Refreshing ${video.path}`)
          await prisma.video.update({
            where: { id: video.id },
            data: { duration, height: getClosestQ(height) }
          })
        })
      }
    }
    logger('Finished updating METADATA')

    res.end()
  }

  res.status(400)
}
