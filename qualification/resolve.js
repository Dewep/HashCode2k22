const { getLine, write, log } = require('../common/utils')

// node resolve.js < a.txt > a.out.txt
async function main () {
  const nbClients = await getLine({ asInteger: true, asArray: false })
  const clients = []

  for (let clientId = 0; clientId < nbClients; clientId++) {
    const likedIngredients = await getLine({ asInteger: false, asArray: true })
    likedIngredients.shift()
  }

  log(`${clients.length} ${clients.join(' ')}`)
  write(`${clients.length} ${clients.join(' ')}`)
}

main().then(() => process.exit(0)).catch(err => console.error(err))
