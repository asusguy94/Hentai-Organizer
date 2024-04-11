import { FastifyInstance } from 'fastify'

import fs from 'fs'

import {
  dirOnly,
  downloader,
  escapeRegExp,
  extOnly,
  formatDate,
  getUnique,
  noExt,
  removeCover,
  removePoster,
  removePreviews,
  sendFile,
  sendPartial
} from '../lib'
import generate from '../lib/generate'
import { getVideo } from '../lib/hanime'
import { db } from '../lib/prisma'
import validate, { z } from '../lib/validate'

export default async function videoRoutes(fastify: FastifyInstance) {
  fastify.get('/', async () => {
    const limit = 7

    const noBookmarkStar = await db.video.findMany({
      select: { id: true, name: true },
      where: { noStar: false, bookmarks: { some: { star: null } } },
      orderBy: [{ date_published: 'desc' }, { id: 'desc' }],
      take: limit
    })

    const noStarImage = await db.video.findMany({
      select: { id: true, name: true },
      where: { noStar: false, stars: { some: { star: { image: null } } } },
      take: limit
    })

    const noBookmarks = await db.video.findMany({
      select: { id: true, name: true },
      where: { noStar: false, bookmarks: { none: {} } },
      take: limit
    })

    const noStars = await db.video.findMany({
      select: { id: true, name: true },
      where: { noStar: false, stars: { none: {} } },
      take: limit
    })

    const slugMissmatch = (
      await db.video.findMany({
        where: { slug: { not: null }, OR: [{ noStar: true }, { bookmarks: { some: {} } }] }
      })
    )
      .filter(video => `${video.slug}.mp4` !== video.path)
      .slice(0, limit)

    return {
      video: { noBookmarks, noStars, slugMissmatch, unusedStar: [] },
      stars: { noImage: noStarImage },
      bookmarks: { noStar: noBookmarkStar }
    }
  })

  fastify.get('/home/:label/:limit', async req => {
    const { label, limit } = validate(
      z.object({
        label: z.enum(['recent', 'newest', 'popular']),
        limit: z.coerce.number()
      }),
      req.params
    )

    switch (label) {
      case 'recent':
        return (
          await db.video.findMany({
            where: { noStar: false },
            select: { id: true, name: true, cover: true },
            orderBy: { id: 'desc' },
            take: limit
          })
        ).map(({ cover, ...video }) => ({
          ...video,
          image: cover
        }))

      case 'newest':
        return (
          await db.video.findMany({
            where: { noStar: false },
            select: { id: true, name: true, cover: true },
            orderBy: { date_published: 'desc' },
            take: limit
          })
        ).map(({ cover, ...video }) => ({
          ...video,
          image: cover
        }))

      case 'popular':
        return (
          await db.video.findMany({
            include: { _count: { select: { plays: true } } },
            orderBy: [{ plays: { _count: 'desc' } }, { date: 'desc' }],
            take: limit
          })
        ).map(({ cover, _count, ...video }) => ({
          ...video,
          image: cover,
          total: _count.plays
        }))
    }
  })

  fastify.get('/add', async () => {
    const filesDB = await db.video.findMany()
    const filesArray = filesDB.map(video => video.path)

    const files = await fs.promises.readdir('./media/videos')

    const newFiles = []
    for (let i = 0; i < files.length; i++) {
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

    return newFiles
  })

  fastify.post('/add', async req => {
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
      req.body
    )

    return await db.video.createMany({
      data: videos
    })
  })

  fastify.get('/:id', async req => {
    const { id } = validate(
      z.object({
        id: z.coerce.number()
      }),
      req.params
    )

    const { height, cen, validated, ...video } = await db.video.findFirstOrThrow({
      where: { id },
      select: {
        id: true,
        slug: true,
        name: true,
        episode: true,
        path: true,
        franchise: true,
        noStar: true,
        duration: true,
        date: true,
        date_published: true,
        brand: true,
        height: true,
        cen: true,
        validated: true
      }
    })

    // check if title matches api
    const isValid = {
      title: true,
      fname: video.slug !== null && video.slug === dirOnly(video.path) // fname is invalid if slug=null, or slug!=path
    }

    if (!validated && video.slug !== null) {
      try {
        const { name } = await getVideo(video.slug)
        const countChars = (str: string, char: string) => (str.match(new RegExp(escapeRegExp(char), 'g')) ?? []).length
        const specialChars = ['%', '*', '?', ':'] // "%" can be removed, when finished processing all files, as it not an illegal character
        // check validity of title
        isValid.title = !specialChars.some(char => {
          const countApiTitle = countChars(name, char)
          const countVideoTitle = countChars(video.name, char)
          return countApiTitle !== countVideoTitle
        })
        // Update if title is valid
        if (isValid.title) {
          await db.video.update({
            where: { id },
            data: { validated: true }
          })
        }
      } catch (e) {
        //
      }
    }

    return {
      ...video,
      quality: height,
      censored: cen,
      path: {
        file: video.path,
        stream: `${noExt(video.path)}/master.m3u8`
      },
      date: {
        added: formatDate(video.date),
        published: video.date_published ? formatDate(video.date_published) : null
      },
      related: (
        await db.video.findMany({
          where: { franchise: video.franchise },
          orderBy: { episode: 'asc' },
          select: {
            id: true,
            name: true,
            cover: true,
            _count: { select: { plays: true } }
          }
        })
      ).map(({ cover, _count, ...video }) => ({
        ...video,
        image: cover,
        plays: _count.plays
      })),
      isValid
    }
  })

  fastify.put('/:id', async req => {
    const { id } = validate(
      z.object({
        id: z.coerce.number()
      }),
      req.params
    )

    const { cen, noStar, plays, title, franchise, date, path } = validate(
      z.object({
        cen: z.boolean().optional(),
        noStar: z.boolean().optional(),
        plays: z.number().int().nonnegative().optional(),
        title: z.string().optional(),
        franchise: z.string().optional(),
        date: z.string().optional(),
        path: z.string().optional()
      }),
      req.body
    )

    if (cen !== undefined) {
      return await db.video.update({
        where: { id },
        data: { cen }
      })
    } else if (noStar !== undefined) {
      return await db.video.update({
        where: { id },
        data: { noStar }
      })
    } else if (plays !== undefined) {
      if (!plays) {
        return await db.plays.deleteMany({
          where: { id }
        })
      } else {
        // Add PLAYS
        return await db.plays.create({
          data: { videoID: id }
        })
      }
    } else if (title !== undefined) {
      return await db.video.update({
        where: { id },
        data: { name: title }
      })
    } else if (franchise !== undefined) {
      return await db.video.update({
        where: { id },
        data: { franchise }
      })
    } else if (date !== undefined) {
      if (!date) {
        return await db.video.update({
          where: { id },
          data: { date_published: null }
        })
      } else {
        const video = await db.video.update({
          where: { id },
          data: { date_published: new Date(formatDate(date, true)) }
        })

        return {
          ...video,
          date_published: video.date_published !== null ? formatDate(video.date_published) : null
        }
      }
    } else if (path !== undefined) {
      const video = await db.video.findFirstOrThrow({ where: { id } })

      await fs.promises.rename(`./media/videos/${video.path}`, `./media/videos/${path}`)
      await fs.promises.rename(`./media/videos/${dirOnly(video.path)}`, `./media/videos/${dirOnly(path)}`)
      //FIXME the last one throws if the folder doesn't exist

      // UPDATE DATABASE
      return await db.video.update({
        where: { id },
        data: { path }
      })
    } else {
      // Refresh Video
      // Update Database
      const result = await db.video.update({
        where: { id },
        data: { duration: 0, height: 0 }
      })

      // DEBUG only used for updating quality >> will require some time to refresh
      // removeStreamFolder(`./media/videos/${dirOnly(video.path)}`)

      // Remove Previews
      await removePreviews(id)

      // Remove Files
      await removeCover(id)
      await removePoster(id)

      return result
    }
  })

  fastify.delete('/:id', { schema: { hide: true } }, async req => {
    const { id } = validate(
      z.object({
        id: z.coerce.number()
      }),
      req.params
    )

    const result = db.video.delete({
      where: { id }
    })

    result.then(async video => {
      await removeCover(id)
      await removePoster(id)
      await removePreviews(id)

      await Promise.allSettled([
        // Remove video-file
        fs.promises.unlink(`./media/videos/${video.path}`),

        // Remove stream-files
        fs.promises.rm(`./media/videos/${dirOnly(video.path)}`, { recursive: true, force: true })
      ])
    })
  })

  fastify.get('/:id/bookmark', async req => {
    const { id } = validate(
      z.object({
        id: z.coerce.number()
      }),
      req.params
    )

    const bookmarks = await db.bookmark.findMany({
      where: { videoID: id },
      orderBy: { start: 'asc' },
      select: {
        id: true,
        start: true,
        category: true,
        outfit: true,
        attributes: { include: { attribute: { select: { id: true, name: true } } } },
        star: {
          include: { attributes: { include: { attribute: { select: { id: true, name: true } } } } }
        }
      }
    })

    return bookmarks.map(({ category, star, ...bookmark }) => {
      const starAttributes = star?.attributes.map(({ attribute }) => attribute) ?? []
      const bookmarkAttributes = bookmark.attributes.map(({ attribute }) => attribute)

      return {
        ...bookmark,
        name: category.name,
        outfit: bookmark.outfit?.name ?? null,
        attributes: getUnique([...starAttributes, ...bookmarkAttributes], 'id'),
        starID: star?.id ?? 0,
        starImage: star?.image ?? undefined
      }
    })
  })

  fastify.post('/:id/bookmark', async req => {
    const { id } = validate(
      z.object({
        id: z.coerce.number()
      }),
      req.params
    )

    const { categoryID, time, starID } = validate(
      z.object({
        categoryID: z.number().int().positive(),
        time: z.number().int().positive(),
        starID: z.number().int().positive().optional()
      }),
      req.body
    )

    if (starID !== undefined) {
      // create or update bookmark with starID
      const bookmark = await db.bookmark.upsert({
        where: { videoID_start: { videoID: id, start: time } },
        create: {
          video: { connect: { id } },
          category: { connect: { id: categoryID } },
          start: time,
          star: { connect: { id: starID } }
        },
        update: {
          star: { connect: { id: starID } }
        },
        select: {
          id: true,
          videoID: true,
          categoryID: true,
          start: true,
          starID: true,
          star: {
            select: {
              image: true,
              attributes: { select: { attribute: { select: { id: true, name: true } } } }
            }
          },
          attributes: { select: { attribute: { select: { id: true, name: true } } } }
        }
      })

      return {
        id: bookmark.id,
        videoID: bookmark.videoID,
        categoryID: bookmark.categoryID,
        time: bookmark.start,
        starID: bookmark.starID,
        starImage: bookmark.star?.image ?? null,
        attributes: getUnique(
          [
            ...bookmark.attributes.map(({ attribute }) => attribute),
            ...(bookmark.star?.attributes.map(({ attribute }) => attribute) ?? [])
          ],
          'id'
        )
      }
    } else {
      // create bookmark without star
      const bookmark = await db.bookmark.create({
        data: {
          video: { connect: { id } },
          category: { connect: { id: categoryID } },
          start: time
        },
        select: {
          id: true,
          videoID: true,
          categoryID: true,
          start: true,
          starID: true
        }
      })

      return {
        id: bookmark.id,
        videoID: bookmark.videoID,
        categoryID: bookmark.categoryID,
        time: bookmark.start,
        starID: 0,
        starImage: null,
        attributes: []
      }
    }
  })

  fastify.get('/:id/poster', { schema: { hide: true } }, async req => {
    const { id } = validate(
      z.object({
        id: z.coerce.number()
      }),
      req.params
    )

    return await sendFile(`./media/images/videos/poster/${id}.png`)
  })

  fastify.get('/:id/cover', { schema: { hide: true } }, async req => {
    const { id } = validate(
      z.object({
        id: z.coerce.number()
      }),
      req.params
    )

    return await sendFile(`./media/images/videos/cover/${id}.png`)
  })

  fastify.get('/:id/vtt', { schema: { hide: true } }, async req => {
    const { id } = validate(
      z.object({
        id: z.coerce.number()
      }),
      req.params
    )

    return await sendFile(`./media/vtt/${id}.vtt`)
  })

  fastify.get('/:id/vtt/thumb', { schema: { hide: true } }, async req => {
    const { id } = validate(
      z.object({
        id: z.coerce.number()
      }),
      req.params
    )

    return await sendFile(`./media/vtt/${id}.jpg`)
  })

  fastify.get('/:id/hls', { schema: { hide: true } }, async req => {
    const { id } = validate(
      z.object({
        id: z.coerce.number()
      }),
      req.params
    )

    const video = await db.video.findFirstOrThrow({
      where: { id }
    })

    return await sendFile(`./media/videos/${noExt(video.path)}/master.m3u8`)
  })

  fastify.get('/:id/related/star', async req => {
    const { id } = validate(
      z.object({
        id: z.coerce.number()
      }),
      req.params
    )
    const video = await db.video.findFirstOrThrow({
      where: { id }
    })

    return await db.star.findMany({
      where: { videos: { some: { video: { franchise: video.franchise } } } },
      select: { id: true, name: true }
    })
  })

  fastify.get('/:id/:stream/playlist.m3u8', { schema: { hide: true } }, async req => {
    const { id, stream } = validate(
      z.object({
        id: z.coerce.number(),
        stream: z.string().regex(/^stream\d+$/)
      }),
      req.params
    )

    const video = await db.video.findFirstOrThrow({
      where: { id }
    })

    return await sendFile(`./media/videos/${noExt(video.path)}/${stream}/playlist.m3u8`)
  })

  fastify.get('/:id/:stream/:streamId', { schema: { hide: true } }, async req => {
    const { id, stream, streamId } = validate(
      z.object({
        id: z.coerce.number(),
        stream: z.string().regex(/^stream\d+$/),
        streamId: z.string().regex(/^\d{4}\.ts$/)
      }),
      req.params
    )

    const video = await db.video.findFirstOrThrow({
      where: { id }
    })

    return await sendFile(`./media/videos/${noExt(video.path)}/${stream}/${streamId}`)
  })

  fastify.get('/:id/star', async req => {
    const { id } = validate(
      z.object({
        id: z.coerce.number()
      }),
      req.params
    )

    const stars = await db.star.findMany({
      where: { videos: { some: { videoID: id } } },
      select: {
        id: true,
        name: true,
        image: true,
        attributes: { include: { attribute: { select: { id: true, name: true } } } }
      }
    })

    return stars.map(star => ({
      ...star,
      attributes: star.attributes.map(({ attribute }) => attribute)
    }))
  })

  fastify.post('/:id/star', async req => {
    const { id } = validate(
      z.object({
        id: z.coerce.number()
      }),
      req.params
    )

    const { name } = validate(
      z.object({
        name: z.string().min(2)
      }),
      req.body
    )

    const star = await db.star.upsert({
      where: { name },
      create: { name },
      update: {},
      include: { attributes: { select: { attribute: { select: { id: true, name: true } } } } }
    })

    await db.videoStars.create({
      data: { starID: star.id, videoID: id }
    })

    return {
      ...star,
      attributes: star.attributes.map(({ attribute }) => attribute)
    }
  })

  fastify.delete('/:id/star/:starID', async req => {
    const { id, starID } = validate(
      z.object({
        id: z.coerce.number(),
        starID: z.coerce.number()
      }),
      req.params
    )

    return await db.videoStars.delete({
      where: { starID_videoID: { videoID: id, starID: starID } }
    })
  })

  // FIXME mp4 is never used
  fastify.get('/:id/file', { schema: { hide: true } }, async req => {
    const { id } = validate(
      z.object({
        id: z.coerce.number()
      }),
      req.params
    )

    const video = await db.video.findFirstOrThrow({
      where: { id }
    })

    return await sendPartial(req, `./media/videos/${video.path}`)
  })

  fastify.put('/:id/api', async req => {
    const { id } = validate(
      z.object({
        id: z.coerce.number()
      }),
      req.params
    )

    const { slug, brand, date, cover, poster } = validate(
      z.object({
        slug: z.string().optional(),
        brand: z.literal(true).optional(),
        date: z.literal(true).optional(),
        cover: z.literal(true).optional(),
        poster: z.literal(true).optional()
      }),
      req.body
    )

    const video = await db.video.findFirstOrThrow({
      where: { id }
    })

    if (slug !== undefined) {
      // Update date and brand
      const { released, brand } = await getVideo(slug)

      return await db.video.update({
        data: { date_published: new Date(released.date), brand, slug },
        where: { id }
      })
    } else if (brand) {
      if (video.slug !== null) {
        const { brand } = await getVideo(video.slug)

        return await db.video.update({
          data: { brand },
          where: { id }
        })
      }
    } else if (date) {
      if (video.slug !== null) {
        const { released } = await getVideo(video.slug)

        return await db.video.update({
          data: { date_published: new Date(released.date) },
          where: { id }
        })
      }
    } else if (cover) {
      if (video.slug !== null) {
        const { cover } = await getVideo(video.slug)

        await downloader(cover, `media/images/videos/cover/${video.id}.png`)

        return await db.video.update({
          data: { cover },
          where: { id }
        })
      }
    } else if (poster) {
      if (video.slug !== null) {
        const { poster } = await getVideo(video.slug)

        await downloader(poster, `media/images/videos/poster/${video.id}.png`)

        return await db.video.update({
          data: { poster },
          where: { id }
        })
      }
    }
  })
}
