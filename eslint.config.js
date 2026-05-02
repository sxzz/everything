import { sxzz } from '@sxzz/eslint-config'

export default sxzz({
  pnpm: true,
  baseline: {
    ignoreFeatures: ['top-level-await'],
  },
})
