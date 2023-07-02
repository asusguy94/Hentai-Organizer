import { NextApiRequest } from 'next/types'

import { NextApiResponseWithSocket } from '@interfaces/socket'
import { rebuildVideoFile, getDuration as videoDuration, getHeight as videoHeight } from '@utils/server/ffmpeg'
import { fileExists, getClosestQ, logger } from '@utils/server/helper'
import prisma from '@utils/server/prisma'

//NEXT /video/add (SOCKET)
export default async function handler(req: NextApiRequest, res: NextApiResponseWithSocket) {
  if (req.method === 'POST') {
    const videos = await prisma.video.findMany({ where: { OR: [{ duration: 0 }, { height: 0 }] } })

    logger('Updating METADATA')
    for await (const video of videos) {
      const videoPath = `videos/${video.path}`
      const absoluteVideoPath = `./media/${videoPath}`

      if (await fileExists(absoluteVideoPath)) {
        logger(`Rebuilding: ${video.id}`)
        await rebuildVideoFile(absoluteVideoPath).then(async () => {
          const height = await videoHeight(absoluteVideoPath)
          const duration = await videoDuration(absoluteVideoPath)

          logger(`Refreshing ${video.path}`, 'meta', res.socket.server.io)
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
