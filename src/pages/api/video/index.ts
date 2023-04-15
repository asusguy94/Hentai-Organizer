import { NextApiRequest, NextApiResponse } from 'next/types'

import fs from 'fs'

import prisma from '@utils/server/prisma'
import { extOnly } from '@utils/server/helper'
import { generateEpisode, generateFranchise, generateName } from '@utils/server/generate'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    const filesDB = await prisma.video.findMany()
    const filesArray = filesDB.map(video => video.path)

    const files = await fs.promises.readdir('./media/videos')

    const maxFiles = 10
    const newFiles = []
    for (let idx = 0, fileCount = 0; fileCount < maxFiles && idx < files.length; idx++) {
      const file = files[idx]

      if (fileCount < maxFiles) {
        if (
          !filesArray.includes(file) &&
          (await fs.promises.lstat(`./media/videos/${file}`)).isFile() &&
          extOnly(`./media/videos/${file}`) === '.mp4' // prevent random files to be imported!
        ) {
          newFiles.push({
            path: file,
            franchise: generateFranchise(file),
            episode: generateEpisode(file),
            name: generateName(file)
          })

          fileCount++
        }
      }
    }

    res.json(newFiles)
  }

  res.status(400)
}
