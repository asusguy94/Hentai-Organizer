import { NextApiRequest, NextApiResponse } from 'next/types'

import socket from '@utils/pusher/server'
import { extractVtt } from '@utils/server/ffmpeg'
import { fileExists } from '@utils/server/helper'
import { db } from '@utils/server/prisma'
import { getProgress } from '@utils/shared'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const videos = await db.video.findMany({ where: { duration: { gt: 0 }, height: { gt: 0 } } })

    const generatePath = (video: (typeof videos)[number]) => {
      const videoPath = `videos/${video.path}`
      const imagePath = `vtt/${video.id}.jpg`
      const vttPath = `vtt/${video.id}.vtt`

      const absoluteVideoPath = `./media/${videoPath}`
      const absoluteImagePath = `./media/${imagePath}`
      const absoluteVttPath = `./media/${vttPath}`

      return {
        videoPath: absoluteVideoPath,
        imagePath: absoluteImagePath,
        vttPath: absoluteVttPath
      }
    }

    const missingVtt: typeof videos = []
    for await (const video of videos) {
      const { imagePath, videoPath, vttPath } = generatePath(video)

      if ((await fileExists(videoPath)) && (!(await fileExists(vttPath)) || !(await fileExists(imagePath)))) {
        missingVtt.push(video)
      }
    }

    socket.trigger('ffmpeg', 'vtt', { progress: 0 })
    for (let i = 0; i < missingVtt.length; i++) {
      const video = missingVtt[i]

      const { progress } = getProgress(i, missingVtt.length)
      const { imagePath, videoPath } = generatePath(video)

      socket.trigger('ffmpeg', 'vtt', { progress })
      await extractVtt(videoPath, imagePath, video.id)
    }
    socket.trigger('ffmpeg', 'vtt', { progress: 1 })

    res.end()
  }

  res.status(400)
}
