import { NextRequest, NextResponse } from 'next/server'

import { trackEvent } from '../server/route'

const token = `p.eyJ1IjogIjJlNDUyMzlmLTliZDItNGE5YS1iMDkwLTJmNjMyY2EwODJkZiIsICJpZCI6ICIxMzJjNjU4Ny00MzcxLTRmMzUtYTM4Mi02NzUxMzk4Zjc3YTIiLCAiaG9zdCI6ICJldV9zaGFyZWQifQ.pHGknDiZ8BbNK-IZ_XqwUjCg6NsR5JuNov_QYmYveXs`

export default async function route(req: NextRequest) {
  const json = await req.json()

  await trackEvent({ json, token })
  return NextResponse.json({ ok: true })
}

export const runtime = 'edge'
