import type { NextApiRequest, NextApiResponse } from 'next/types'

import { prisma } from '@utils/server'
import { fileExists } from '@utils/server/helper'
import { extractVtt } from 'utils/server/ffmpeg'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const videos = await prisma.video.findMany({ where: { duration: { gt: 0 }, height: { gt: 0 } } })

    console.log('Generating VTT')
    for await (const video of videos) {
      const videoPath = `videos/${video.path}`
      const imagePath = `vtt//${video.id}.jpg`
      const vttPath = `vtt/${video.id}.vtt`

      const absoluteVideoPath = `./media/${videoPath}`
      const absoluteImagePath = `./media/${imagePath}`
      const absoluteVttPath = `./media/${vttPath}`

      if ((await fileExists(absoluteVideoPath)) && !(await fileExists(absoluteVttPath))) {
        console.log(`Generating VTT: ${video.id}`)
        await extractVtt(absoluteVideoPath, absoluteImagePath, video.id)
      }
    }
    console.log('Finished generating VTT')

    res.end()
  }

  res.status(400)
}