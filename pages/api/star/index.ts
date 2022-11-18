import type { NextApiRequest, NextApiResponse } from 'next/types'

import { prisma } from '@utils/server'
import { getUnique } from '@utils/server/helper'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'GET') {
    res.json({
      breast: getUnique(
        (await prisma.star.findMany({ where: { breast: { not: null } }, orderBy: { breast: 'asc' } })).map(
          ({ breast }) => breast!
        )
      ),
      haircolor: getUnique(
        (await prisma.star.findMany({ where: { haircolor: { not: null } }, orderBy: { haircolor: 'asc' } })).map(
          ({ haircolor }) => haircolor!
        )
      ),
      hairstyle: getUnique(
        (await prisma.star.findMany({ where: { hairstyle: { not: null } }, orderBy: { hairstyle: 'asc' } })).map(
          ({ hairstyle }) => hairstyle!
        )
      ),
      attribute: (await prisma.attribute.findMany({ where: { videoOnly: false }, orderBy: { name: 'asc' } })).map(
        ({ name: attribute }) => attribute
      )
    })
  }

  res.status(400)
}
