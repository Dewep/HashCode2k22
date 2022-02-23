const { getLine, write, log } = require('../common/utils')

// node resolve.js < a.txt > a.out.txt
async function main () {
  const nbClients = await getLine({ asInteger: true, asArray: false })
  const clients = []
  let allLikedIngredients = []
  let allDislikedIngredients = []

  for (let clientId = 0; clientId < nbClients; clientId++) {
    const likedIngredients = await getLine({ asInteger: false, asArray: true })
    likedIngredients.shift()

    for (const ingre of likedIngredients) {
      if (!allLikedIngredients.includes(ingre)) {
        allLikedIngredients.push(ingre)
      }
    }

    const dislikedIngredients = await getLine({ asInteger: false, asArray: true })
    dislikedIngredients.shift()

    for (const ingre of dislikedIngredients) {
      if (!allDislikedIngredients.includes(ingre)) {
        allDislikedIngredients.push(ingre)
      }
    }

    clients.push({ likedIngredients, dislikedIngredients })
  }

  const finalIngredients = allLikedIngredients.filter(ingre => !allDislikedIngredients.includes(ingre))

  log(`${finalIngredients.length} ${finalIngredients.join(' ')}`)
  write(`${finalIngredients.length} ${finalIngredients.join(' ')}`)
}

main().then(() => process.exit(0)).catch(err => console.error(err))
