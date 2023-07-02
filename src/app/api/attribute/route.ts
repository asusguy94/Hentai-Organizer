import { NextResponse } from 'next/server'

import prisma from '@utils/server/prisma'
import validate, { z } from '@utils/server/validation'

//NEXT /editor
export async function GET() {
  return NextResponse.json(
    await prisma.attribute.findMany({
      orderBy: { name: 'asc' }
    })
  )
}

//NEXT /editor
export async function POST(req: Request) {
  const { name } = validate(
    z.object({
      name: z.string().min(3)
    }),
    await req.json()
  )

  return NextResponse.json(
    await prisma.attribute.create({
      data: { name }
    })
  )
}
