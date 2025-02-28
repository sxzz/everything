import { writeFile } from 'node:fs/promises'
import pkg from './package.json' with { type: 'json' }

const deps = Object.keys(pkg.dependencies)

const data = (
  await Promise.all(
    deps.map((dep) =>
      fetch(`https://api.npmjs.org/downloads/point/last-week/${dep}`).then(
        (r) => r.json(),
      ),
    ),
  )
)
  .filter((item) => !item.error)
  .map((item) => ({
    downloadsText: item.downloads?.toLocaleString(),
    ...item,
  }))
  .sort((a, b) => b.downloads - a.downloads)

await writeFile('stats.json', `${JSON.stringify(data, null, 2)}\n`)
