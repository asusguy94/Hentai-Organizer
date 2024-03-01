import { NextApiRequest, NextApiResponse } from 'next/types'

import socket from '@utils/pusher/server'
import { rebuildVideoFile, getDuration, getHeight } from '@utils/server/ffmpeg'
import { fileExists, getClosestQ } from '@utils/server/helper'
import { db } from '@utils/server/prisma'
import { getProgress } from '@utils/shared'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const videos = await db.video.findMany({ where: { OR: [{ duration: 0 }, { height: 0 }] } })

    socket.trigger('ffmpeg', 'generate-video', { progress: 0 })
    for (let i = 0; i < videos.length; i++) {
      const video = videos[i]

      const { progress } = getProgress(i, videos.length)

      const videoPath = `videos/${video.path}`
      const absoluteVideoPath = `./media/${videoPath}`

      if (await fileExists(absoluteVideoPath)) {
        socket.trigger('ffmpeg', 'generate-video', { progress })
        await rebuildVideoFile(absoluteVideoPath).then(async () => {
          const height = await getHeight(absoluteVideoPath)
          const duration = await getDuration(absoluteVideoPath)

          await db.video.update({
            where: { id: video.id },
            data: { duration, height: getClosestQ(height) }
          })
        })
      }
    }
    socket.trigger('ffmpeg', 'generate-video', { progress: 1 })

    res.end()
  }

  res.status(400)
}
