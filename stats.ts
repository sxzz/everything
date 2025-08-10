import { writeFile } from 'node:fs/promises'
import pkg from './package.json' with { type: 'json' }

const deps = Object.keys(pkg.dependencies)

const data = (
  await Promise.all(
    deps.map((dep) =>
      Promise.all([
        fetch(`https://api.npmjs.org/downloads/point/last-week/${dep}`).then(
          (r) => r.json(),
        ),
        fetch(`https://registry.npmjs.org/${dep}/latest`).then((r) => r.json()),
      ]),
    ),
  )
)
  .filter(([stats]) => !stats.error)
  .map(([stats, latest]) => ({
    downloadsText: stats.downloads?.toLocaleString(),
    ...stats,
    provenance: latest?._npmUser?.trustedPublisher
      ? 'trusted'
      : !!latest?.dist?.attestations?.provenance,
  }))
  .sort((a, b) => b.downloads - a.downloads)

await writeFile('stats.json', `${JSON.stringify(data, null, 2)}\n`)
