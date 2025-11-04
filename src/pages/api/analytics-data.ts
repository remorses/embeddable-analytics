import { NextRequest, NextResponse } from 'next/server'

import { getData } from '../../server/route'

const token = `p.eyJ1IjogIjJlNDUyMzlmLTliZDItNGE5YS1iMDkwLTJmNjMyY2EwODJkZiIsICJpZCI6ICIxMzJjNjU4Ny00MzcxLTRmMzUtYTM4Mi02NzUxMzk4Zjc3YTIiLCAiaG9zdCI6ICJldV9zaGFyZWQifQ.pHGknDiZ8BbNK-IZ_XqwUjCg6NsR5JuNov_QYmYveXs`

import type { NextApiRequest, NextApiResponse } from 'next'

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' })
    return
  }

  const json = req.body
  const namespace: string = json.namespace
  // do auth here
  const data = await getData({ ...json, token, namespace })
  res.status(200).json(data)
}
