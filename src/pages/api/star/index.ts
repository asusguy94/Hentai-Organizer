import { NextApiRequest, NextApiResponse } from 'next/types'

import prisma from '@utils/server/prisma'
import { getUnique } from '@utils/shared'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    res.json({
      breast: getUnique(
        (
          await prisma.star.findMany({
            where: { breast: { not: null } },
            orderBy: { breast: 'asc' }
          })
        ).flatMap(({ breast }) => (breast !== null ? [breast] : []))
      ),
      haircolor: getUnique(
        (
          await prisma.star.findMany({
            where: { haircolor: { not: null } },
            orderBy: { haircolor: 'asc' }
          })
        ).flatMap(({ haircolor }) => (haircolor !== null ? [haircolor] : []))
      ),
      hairstyle: getUnique(
        (
          await prisma.star.findMany({
            where: { hairstyle: { not: null } },
            orderBy: { hairstyle: 'asc' }
          })
        ).flatMap(({ hairstyle }) => (hairstyle !== null ? [hairstyle] : []))
      ),
      attribute: (
        await prisma.attribute.findMany({
          where: { videoOnly: false },
          orderBy: { name: 'asc' }
        })
      ).map(({ name: attribute }) => attribute)
    })
  }

  res.status(400)
}
