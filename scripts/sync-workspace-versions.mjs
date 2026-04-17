#!/usr/bin/env node
/**
 * Aligns `version` in workspace apps with the root `package.json` after semantic-release bumps it.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const rootPkgPath = join(root, 'package.json')
const rootPkg = JSON.parse(readFileSync(rootPkgPath, 'utf8'))
const { version } = rootPkg

if (!version || typeof version !== 'string') {
	console.error('sync-workspace-versions: root package.json has no valid version field')
	process.exit(1)
}

const targets = ['apps/api/package.json', 'apps/client/package.json']

for (const rel of targets) {
	const path = join(root, rel)
	const pkg = JSON.parse(readFileSync(path, 'utf8'))
	pkg.version = version
	writeFileSync(path, `${JSON.stringify(pkg, null, '\t')}\n`)
}
