import fs from 'fs'

import Client from './client'

import { settingsConfig } from '@config'
import { getVideo } from '@utils/server/hanime'
import { dirOnly, extOnly } from '@utils/server/helper'
import { db } from '@utils/server/prisma'

export const dynamic = 'force-dynamic'

//TODO migrate to api
export default async function AddVideoPage() {
  const filesDB = await db.video.findMany()
  const filesArray = filesDB.map(video => video.path)

  const files = await fs.promises.readdir('./media/videos')

  const newFiles = []
  for (let i = 0; newFiles.length < settingsConfig.addFiles.maxFiles && i < files.length; i++) {
    const file = files[i]

    const slug = dirOnly(file).replace(/-\d{3,4}p-[^-]+/, '')
    if (
      !filesArray.includes(file) &&
      (await fs.promises.lstat(`./media/videos/${file}`)).isFile() &&
      extOnly(`./media/videos/${file}`) === '.mp4' // prevent random files to be imported!
    ) {
      const { franchise } = await getVideo(slug)

      const generated = generate(file, slug, franchise)
      if (generated !== undefined) {
        newFiles.push({ ...generated, slug })
      }
    }
  }

  return <Client videos={newFiles} />
}

function generate(path: string, slug: string, franchise: string) {
  //FIXME currently defaults to -1 for bonus episodes or episodes without numbers
  // defaulting to "1" would solve the issue, but might cause duplicate episodes
  // it would also mark every bonus episode as "1"
  //get franchise as a slug (avaliable from api), and then split, probably the best solution

  const episodeNumber = generateEpisode(slug)
  const episodeName = generateTitle(franchise, episodeNumber)

  return {
    path,
    franchise,
    name: episodeName,
    episode: episodeNumber
  }
}

function generateEpisode(slug: string) {
  // check if episode is (bonus|special|extra)-episode
  const episodeString = slug.match(/-(\d+)$/)?.at(1)
  if (episodeString !== undefined) {
    return parseInt(episodeString)
  }

  return -1
}

function generateTitle(franchise: string, episode: number) {
  return `${franchise} Episode ${episode}`
}
