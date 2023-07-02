import fs from 'fs'

import Client from './client'

import { generateEpisode, generateFranchise, generateName } from '@utils/server/generate'
import { extOnly } from '@utils/server/helper'
import prisma from '@utils/server/prisma'

export const dynamic = 'force-dynamic'

const AddVideoPage = async () => {
  const filesDB = await prisma.video.findMany()
  const filesArray = filesDB.map(video => video.path)

  const files = await fs.promises.readdir('./media/videos')

  const maxFiles = 10
  const newFiles = []
  for (let idx = 0; newFiles.length < maxFiles && idx < files.length; idx++) {
    const file = files[idx]

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
    }
  }

  return <Client videos={newFiles} />
}

export default AddVideoPage
