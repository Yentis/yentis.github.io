import fs from 'node:fs/promises'

async function main() {
  const filesToRemove = [
    '../css',
    '../fonts',
    '../icons',
    '../js',
    '../mangalist',
    '../mangareader',
    '../mudae',
    '../p5sfusion',
    '../emotes/index.html',
    '../404.html',
    '../favicon.ico',
    '../index.html',
  ]

  for (const file of filesToRemove) {
    await fs.rm(file, { force: true, recursive: true })
  }

  const filesToMove = [
    ['dist/ssg/', '../'],
  ]

  for (const [source, destination] of filesToMove) {
    await fs.cp(source, destination, { recursive: true })
  }
}

main().catch(error => {
  console.error('Copy failed:', error)
  process.exitCode = 1
})
