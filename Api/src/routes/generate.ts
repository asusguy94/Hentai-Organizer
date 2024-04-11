import { FastifyInstance } from 'fastify'

import { fileExists, getClosestQ } from '../lib'
import { extractVtt, getDuration, getHeight, rebuildVideoFile } from '../lib/ffmpeg'
import { db } from '../lib/prisma'

export default async function generateRoutes(fastify: FastifyInstance) {
  fastify.post('/meta', async () => {
    const videos = await db.video.findMany({ where: { OR: [{ duration: 0 }, { height: 0 }] } })

    for await (const video of videos) {
      const videoPath = `videos/${video.path}`
      const absoluteVideoPath = `./media/${videoPath}`

      if (await fileExists(absoluteVideoPath)) {
        console.log(`Rebuilding ${video.path}`)

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

    console.log('Finished generating metadata')
  })

  fastify.post('/vtt', async () => {
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

    for await (const video of missingVtt) {
      const { imagePath, videoPath } = generatePath(video)

      console.log(`Generating VTT ${video.path}`)
      await extractVtt(videoPath, imagePath, video.id)
    }

    console.log('Finished generating VTT')
  })
}
