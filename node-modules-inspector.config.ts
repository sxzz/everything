import { defineConfig } from 'node-modules-inspector'

export default defineConfig({
  defaultFilters: {
    sourceType: 'prod',
    excludeWorkspace: true,
  },
  defaultSettings: {
    showPublishTimeBadge: true,
    showInstallSizeBadge: true,
    showFileComposition: true,
  },
  excludeDependenciesOf: [
    'eslint',
    '@typescript-eslint/eslint-plugin',
    '@typescript-eslint/utils',
  ],
  excludePackages: ['typescript', 'pnpm'],
  publint: true,
})
