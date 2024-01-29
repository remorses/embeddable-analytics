import useSWR from 'swr'


export default function CurrentVisitors() {
  const currentVisitors = useCurrentVisitors()
  return (
    <div className="flex items-center gap-2">
      <span className="rounded-full h-2 w-2 bg-success" />
      <p className="text-neutral-64 truncate">{`${currentVisitors} current visitor${
        currentVisitors === 1 ? '' : 's'
      }`}</p>
    </div>
  )
}

async function getCurrentVisitors(): Promise<number> {
  return 3
  // const { data } = await querySQL<{ visits: number }>(
  //   `SELECT uniq(session_id) AS visits FROM analytics_hits
  //     WHERE timestamp >= (now() - interval 5 minute) FORMAT JSON`
  // )
  // const [{ visits }] = data
  // return visits
}

function useCurrentVisitors() {
  const { data } = useSWR('currentVisitors', getCurrentVisitors)
  return data ?? 0
}
