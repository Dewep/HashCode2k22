const { getLine, log, readRootFile } = require('../common/utils')

async function main () {
  const outIngredients = await getLine({ asInteger: false, asArray: true, input: process.argv[2] })
  outIngredients.shift()

  const nbClients = await getLine({ asInteger: true, asArray: false })
  let score = 0

  for (let clientId = 0; clientId < nbClients; clientId++) {
    const likedIngredients = await getLine({ asInteger: false, asArray: true })
    likedIngredients.shift()

    const dislikedIngredients = await getLine({ asInteger: false, asArray: true })
    dislikedIngredients.shift()

    if (likedIngredients.some(ingredient => !outIngredients.includes(ingredient))) {
      continue
    }

    if (dislikedIngredients.some(ingredient => outIngredients.includes(ingredient))) {
      continue
    }

    score += 1
  }

  log({ score })
}

main().then(() => process.exit(0)).catch(err => console.error(err))
