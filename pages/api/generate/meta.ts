import { NextApiRequest, NextApiResponse } from 'next/types'

import { prisma } from '@utils/server'
import { fileExists, getClosestQ, rebuildVideoFile } from '@utils/server/helper'
import { getDuration as videoDuration, getHeight as videoHeight } from 'utils/server/ffmpeg'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const videos = await prisma.video.findMany({ where: { OR: [{ duration: 0 }, { height: 0 }] } })

    console.log('Updating METADATA')
    for await (const video of videos) {
      const videoPath = `videos/${video.path}`
      const absoluteVideoPath = `./media/${videoPath}`

      if (await fileExists(absoluteVideoPath)) {
        console.log(`Rebuilding: ${video.id}`)
        await rebuildVideoFile(absoluteVideoPath).then(async () => {
          const height = await videoHeight(absoluteVideoPath)
          const duration = await videoDuration(absoluteVideoPath)

          console.log(`Refreshing ${video.path}`)
          await prisma.video.update({
            where: { id: video.id },
            data: { duration, height: getClosestQ(height) }
          })
        })
      }
    }
    console.log('Finished updating METADATA')

    res.end()
  }

  res.status(400)
}
