import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { cpSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'

const root = process.cwd()
const staticFiles = ['robots.txt', 'sitemap.xml', 'LICENSE', 'google5d333e381e9804fd.html', 'yandex_7a573b93f6197c00.html']

const copySiteAssets = {
  name: 'copy-site-assets',
  apply: 'build',
  writeBundle() {
    const output = resolve(root, 'dist')
    const assets = resolve(root, 'assets')
    if (existsSync(assets)) cpSync(assets, resolve(output, 'assets'), { recursive: true })
    for (const file of staticFiles) {
      const source = resolve(root, file)
      if (existsSync(source)) cpSync(source, resolve(output, file))
    }
  },
}

export default defineConfig({
  base: '/about-german/',
  plugins: [vue(), copySiteAssets],
  publicDir: false,
  build: { outDir: 'dist', emptyOutDir: true },
})
