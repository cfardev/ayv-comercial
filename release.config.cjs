/** @type {import('semantic-release').Options} */
module.exports = {
	branches: ['main', 'master'],
	plugins: [
		'@semantic-release/commit-analyzer',
		'@semantic-release/release-notes-generator',
		['@semantic-release/changelog', { changelogFile: 'CHANGELOG.md' }],
		['@semantic-release/npm', { npmPublish: false }],
		[
			'@semantic-release/exec',
			{
				prepareCmd: 'node ./scripts/sync-workspace-versions.mjs',
			},
		],
		[
			'@semantic-release/git',
			{
				assets: [
					'CHANGELOG.md',
					'package.json',
					'apps/api/package.json',
					'apps/client/package.json',
				],
				message: 'chore(release): ${nextRelease.version} [skip ci]',
			},
		],
	],
}
