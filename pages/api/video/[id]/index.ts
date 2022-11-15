import type { NextApiRequest, NextApiResponse } from 'next/types'

import fs from 'fs'
import Joi from 'joi'

import { prisma, validate } from '@utils/server'
import { dirOnly, downloader, formatDate, noExt, removeCover, removePreviews, sendPartial } from '@utils/server/helper'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { id } = req.query

    if (typeof id === 'string') {
      const video = await prisma.video.findFirstOrThrow({ where: { id: parseInt(id) } })

      res.json({
        id: video.id,
        name: video.name,
        episode: video.episode,
        path: {
          file: video.path,
          stream: `${noExt(video.path)}/master.m3u8`
        },
        franchise: video.franchise,
        noStar: video.noStar,
        duration: video.duration,
        date: {
          added: formatDate(video.date),
          published: video.date_published ? formatDate(video.date_published) : null
        },
        brand: video.brand,
        quality: video.height,
        censored: video.cen,
        related: (
          await prisma.video.findMany({
            where: { franchise: video.franchise },
            orderBy: { episode: 'asc' },
            include: { _count: { select: { plays: true } } }
          })
        ).map(({ id, name, cover, _count }) => ({ id, name, image: cover, plays: _count.plays }))
      })
    }
  } else if (req.method === 'PUT') {
    const { id } = req.query

    if (typeof id === 'string') {
      const { cen, noStar, plays, title, brand, franchise, date, path, cover } = validate(
        Joi.object({
          cen: Joi.boolean(),
          noStar: Joi.boolean(),
          plays: Joi.number().integer().min(0),
          title: Joi.string(),
          brand: Joi.string(),
          franchise: Joi.string(),
          date: Joi.string().allow(''),
          path: Joi.string(),
          cover: Joi.string()
        }).max(1),
        req.body
      )

      if (cen !== undefined) {
        res.json(await prisma.video.update({ where: { id: parseInt(id) }, data: { cen: !!parseInt(cen) } }))
      } else if (noStar !== undefined) {
        await prisma.video.update({ where: { id: parseInt(id) }, data: { noStar: !!parseInt(noStar) } })
      } else if (plays !== undefined) {
        if (!plays) {
          await prisma.plays.deleteMany({ where: { id: parseInt(id) } })
        } else {
          // Add PLAYS
          await prisma.plays.create({ data: { videoID: parseInt(id) } })
        }
      } else if (title !== undefined) {
        await prisma.video.update({ where: { id: parseInt(id) }, data: { name: title } })
      } else if (franchise !== undefined) {
        await prisma.video.update({ where: { id: parseInt(id) }, data: { franchise } })
      } else if (brand !== undefined) {
        await prisma.video.update({ where: { id: parseInt(id) }, data: { brand } })
      } else if (date !== undefined) {
        if (!date) {
          res.json(
            await prisma.video.update({
              where: { id: parseInt(id) },
              data: { date_published: null }
            })
          )
        } else {
          const video = await prisma.video.update({
            where: { id: parseInt(id) },
            data: { date_published: new Date(formatDate(date, true)) }
          })

          res.json({
            ...video,
            date_published: video.date_published !== null ? formatDate(video.date_published) : null
          })
        }
      } else if (path !== undefined) {
        const video = await prisma.video.findFirstOrThrow({ where: { id: parseInt(id) } })

        if (typeof path === 'string') {
          fs.promises.rename(`./media/videos/${video.path}`, `./media/videos/${path}`)
          fs.promises.rename(`./media/videos/${dirOnly(video.path)}`, `./media/videos/${dirOnly(path)}`)

          // UPDATE DATABASE
          await prisma.video.update({ where: { id: parseInt(id) }, data: { path } })
        }
      } else if (cover !== undefined) {
        const video = await prisma.video.findFirstOrThrow({ where: { id: parseInt(id) } })
        await downloader(cover, `media/images/videos/${video.id}.png`)

        await prisma.video.update({ where: { id: parseInt(id) }, data: { cover: `${video.id}.png` } })
      } else {
        // Refresh Video
        // Update Database
        await prisma.video.update({ where: { id: parseInt(id) }, data: { duration: 0, height: 0 } })

        // DEBUG only used for updating quality >> will require some time to refresh
        // removeStreamFolder(`./media/videos/${dirOnly(video.path)}`)

        // Remove Previews
        await removePreviews(parseInt(id))
        // Remove Files
        await removeCover(parseInt(id))
      }

      res.end()
    }
  } else if (req.method === 'DELETE') {
    const { id } = req.query

    if (typeof id === 'string') {
      await prisma.video.delete({ where: { id: parseInt(id) } }).then(async video => {
        await removeCover(parseInt(id))
        await removePreviews(parseInt(id))

        // Remove video-file
        fs.promises.unlink(`./media/videos/${video.path}`)

        // Remove stream-files
        fs.promises.rm(`./media/videos/${dirOnly(video.path)}`, {
          recursive: true,
          force: true,
          maxRetries: 20,
          retryDelay: 200
        })
      })
      const video = await prisma.video.findFirstOrThrow({ where: { id: parseInt(id) } })

      await sendPartial(req, res, `./media/videos/${video.path}`)
    }
  }

  res.status(400)
}
