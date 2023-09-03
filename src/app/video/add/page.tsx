import fs from 'fs'

import Client from './client'

import { settingsConfig } from '@config'
import { getVideo } from '@utils/server/hanime'
import { dirOnly, extOnly } from '@utils/server/helper'
import prisma from '@utils/server/prisma'

export const dynamic = 'force-dynamic'

export default async function AddVideoPage() {
  const filesDB = await prisma.video.findMany()
  const filesArray = filesDB.map(video => video.path)

  const files = await fs.promises.readdir('./media/videos')

  const newFiles = []
  for (let i = 0; newFiles.length < settingsConfig.addFiles.maxFiles && i < files.length; i++) {
    const file = files[i]

    //TODO slug might contain a invalid part, can be replaced but will still require separate slug-db-field
    // .replace(/-\d{3,4}p-[^-]+/, '')
    const slug = dirOnly(file).replace(/-\d{3,4}p-[^-]+/, '')
    if (
      !filesArray.includes(file) &&
      (await fs.promises.lstat(`./media/videos/${file}`)).isFile() &&
      extOnly(`./media/videos/${file}`) === '.mp4' // prevent random files to be imported!
    ) {
      const { related: relatedVideos, ...apiData } = await getVideo(slug)
      let franchise = apiData.franchise

      for (let j = 0; j < relatedVideos.length; j++) {
        const relatedVideo = relatedVideos[j]

        // check if a previous episode already exists in the database
        const video = filesDB.find(video => {
          return (
            video.slug === relatedVideo.slug ||
            video.path === `${relatedVideo.slug}.mp4` ||
            video.cover === apiData.cover ||
            video.poster === apiData.poster
          )
        })

        if (video !== undefined) {
          franchise = video.franchise
          break
        }
      }

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
