import Client from './client'

import prisma from '@utils/server/prisma'
import { getUnique } from '@utils/shared'

export const dynamic = 'force-dynamic'

export default async function StarSearchPage() {
  const breasts = await prisma.star.findMany({ where: { breast: { not: null } }, orderBy: { breast: 'asc' } })
  const haircolors = await prisma.star.findMany({ where: { haircolor: { not: null } }, orderBy: { haircolor: 'asc' } })
  const hairstyles = await prisma.star.findMany({ where: { hairstyle: { not: null } }, orderBy: { hairstyle: 'asc' } })
  const attributes = await prisma.attribute.findMany({ where: { videoOnly: false }, orderBy: { name: 'asc' } })

  return (
    <Client
      breasts={getUnique(breasts.flatMap(({ breast }) => (breast !== null ? [breast] : [])))}
      haircolors={getUnique(haircolors.flatMap(({ haircolor }) => (haircolor !== null ? [haircolor] : [])))}
      hairstyles={getUnique(hairstyles.flatMap(({ hairstyle }) => (hairstyle !== null ? [hairstyle] : [])))}
      attributes={getUnique(attributes.map(({ name: attribute }) => attribute))}
    />
  )
}
