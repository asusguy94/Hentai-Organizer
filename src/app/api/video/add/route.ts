import fs from 'fs'

import { settingsConfig } from '@config'
import { getVideo } from '@utils/server/hanime'
import { dirOnly, extOnly } from '@utils/server/helper'
import { db } from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

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

export async function GET() {
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
      newFiles.push({ ...generated, slug })
    }
  }
}

export async function POST(req: Request) {
  const { videos } = validate(
    z.object({
      videos: z.array(
        z.object({
          name: z.string(),
          path: z.string(),
          episode: z.number().int(),
          franchise: z.string(),
          slug: z.string()
        })
      )
    }),
    await req.json()
  )

  const res = []
  for await (const video of videos) {
    res.push(
      await db.video.create({
        data: {
          name: video.name,
          path: video.path,
          episode: video.episode,
          franchise: video.franchise,
          slug: video.slug
        }
      })
    )
  }

  return Response.json(res)
}
