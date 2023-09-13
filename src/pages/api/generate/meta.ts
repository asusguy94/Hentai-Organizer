import { NextApiRequest, NextApiResponse } from 'next/types'

import { rebuildVideoFile, getDuration, getHeight } from '@utils/server/ffmpeg'
import { fileExists, getClosestQ, logger } from '@utils/server/helper'
import { db } from '@utils/server/prisma'

//NEXT /video/add
export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const videos = await db.video.findMany({ where: { OR: [{ duration: 0 }, { height: 0 }] } })

    logger('Updating METADATA')
    for await (const video of videos) {
      const videoPath = `videos/${video.path}`
      const absoluteVideoPath = `./media/${videoPath}`

      if (await fileExists(absoluteVideoPath)) {
        logger(`Refreshing id=${video.id},path="${video.path}"`)
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
    logger('Finished updating METADATA')

    res.end()
  }

  res.status(400)
}
