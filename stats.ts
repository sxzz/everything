import { writeFile } from 'node:fs/promises'
import GitHost from 'hosted-git-info'
import ky, { HTTPError } from 'ky'
import pkg from './package.json' with { type: 'json' }

const deps = Object.keys(pkg.dependencies)
const fetch = ky.extend({
  retry: {
    limit: 20,
    delay: () => 1500,
    shouldRetry: ({ error }) => {
      if (error instanceof HTTPError && error.response.status === 429) {
        console.info(`Rate limited, retrying ${error.request.url}...`)
        return true
      }
      return false
    },
  },
})

const data: [Record<string, any>, Record<string, any>][] = []
for (const dep of deps) {
  console.info(`Fetching stats for ${dep}...`)

  const stats = await fetch<Record<string, any>>(
    `https://api.npmjs.org/downloads/point/last-week/${dep}`,
  )
    .json()
    .catch(() => null)
  if (!stats) continue
  const latest = await fetch<Record<string, any>>(
    `https://registry.npmjs.org/${dep}/latest`,
  ).json()
  data.push([stats, latest])
}

const stats = data
  .map(([stats, latest]) => {
    let owner: string | undefined
    const repo = latest.repository?.url || latest.repository
    if (repo) {
      owner = GitHost.fromUrl(repo)?.user
    }
    return sortObject({
      ...stats,
      downloadsText: stats.downloads?.toLocaleString(),
      provenance: latest?._npmUser?.trustedPublisher
        ? 'trusted'
        : !!latest?.dist?.attestations?.provenance,
      owner,
    })
  })
  .toSorted((a, b) => b.downloads - a.downloads)

await writeFile('stats.json', `${JSON.stringify(stats, null, 2)}\n`)

function sortObject(obj: object) {
  return Object.fromEntries(
    Object.entries(obj).toSorted(([keyA], [keyB]) => keyA.localeCompare(keyB)),
  )
}
