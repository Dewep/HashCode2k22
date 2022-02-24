const { exec } = require('child_process')

async function main () {
  const letter = process.argv[2] || 'a'
  const resolve = process.argv[3] || 'resolve.js'

  await cmd(['node', resolve, '<', `${letter}.txt`, '>', `${letter}.out.txt`])
  // await cmd(['node', 'score.js', `${letter}.out.txt`, '<', `${letter}.txt`])
}

async function cmd (command) {
  console.log('\x1b[34m%s\x1b[0m', '$> ' + command.join(' '))

  const { stdout, stderr } = await new Promise((resolve, reject) => {
    exec(command.join(' '), (error, stdout, stderr) => {
      if (error) {
        return reject(new Error(`Exec error: ${error}`))
      }
      resolve({ stdout, stderr })
    })
  })

  if (stdout) {
    console.log('\x1b[36m%s\x1b[0m', stdout)
  }
  if (stderr) {
    console.log('\x1b[33m%s\x1b[0m', stderr)
  }

  return { stdout, stderr }
}

main().then(() => process.exit(0)).catch(err => console.error(err))
