import { NextApiRequest, NextApiResponse } from 'next/types'

import { z } from 'zod'

import { prisma, validate } from '@utils/server'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    const { id } = req.query

    if (typeof id === 'string') {
      if (id === '0') {
        res.end()
        return
      }

      const star = await prisma.star.findFirstOrThrow({ where: { id: parseInt(id) } })

      res.json({
        id: star.id,
        name: star.name,
        image: star.image,

        info: {
          breast: star.breast ?? '',
          haircolor: star.haircolor ?? '',
          hairstyle: star.hairstyle ?? '',
          attribute: (
            await prisma.starAttributes.findMany({
              where: { starID: star.id },
              include: { attribute: true }
            })
          ).map(({ attribute }) => attribute.name)
        },
        link: star.starLink
      })
    }
  } else if (req.method === 'PUT') {
    const { id } = req.query

    if (typeof id === 'string') {
      const { name, label, value } = validate(
        z.object({
          name: z.string().optional(),
          label: z.string().optional(),
          value: z.string().optional()
        }),

        req.body
      )

      if (name !== undefined) {
        res.json(await prisma.star.update({ where: { id: parseInt(id) }, data: { name } }))
      } else if (label !== undefined && value !== undefined) {
        if (value.length) {
          await prisma.star.update({ where: { id: parseInt(id) }, data: { [label]: value } })
        } else {
          await prisma.star.update({ where: { id: parseInt(id) }, data: { [label]: null } })
        }
      }

      res.end()
    }
  } else if (req.method === 'DELETE') {
    const { id } = req.query

    if (typeof id === 'string') {
      await prisma.star.delete({ where: { id: parseInt(id) } })

      res.end()
    }
  }

  res.status(400)
}
