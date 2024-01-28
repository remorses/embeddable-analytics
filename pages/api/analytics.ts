import { NextRequest, NextResponse } from 'next/server'
import { getData } from '../../server/route'

const token = `p.eyJ1IjogIjJlNDUyMzlmLTliZDItNGE5YS1iMDkwLTJmNjMyY2EwODJkZiIsICJpZCI6ICIxMzJjNjU4Ny00MzcxLTRmMzUtYTM4Mi02NzUxMzk4Zjc3YTIiLCAiaG9zdCI6ICJldV9zaGFyZWQifQ.pHGknDiZ8BbNK-IZ_XqwUjCg6NsR5JuNov_QYmYveXs`

export default async function route(req: NextRequest) {
  const json = await req.json()
  const namespace: string = json.namespace
  // do auth here
  const data = await getData({ ...json, token, namespace })
//   console.log(data)
  return NextResponse.json(data)
}

export const runtime = 'edge'
