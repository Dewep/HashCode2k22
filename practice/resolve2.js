const { getLine, write, log } = require('../common/utils')

// node resolve.js < a.txt > a.out.txt
async function main () {
  const nbClients = await getLine({ asInteger: true, asArray: false })
  let clients = []
  let ingredients = {}

  for (let clientId = 0; clientId < nbClients; clientId++) {
    const likedIngredients = await getLine({ asInteger: false, asArray: true })
    likedIngredients.shift()

    for (const ingre of likedIngredients) {
      if (!ingredients[ingre]) {
        ingredients[ingre] = {name: ingre, like: [], dislike: []}
      }
      ingredients[ingre].like.push(clientId)
    }

    const dislikedIngredients = await getLine({ asInteger: false, asArray: true })
    dislikedIngredients.shift()

    for (const ingre of dislikedIngredients) {
      if (!ingredients[ingre]) {
        ingredients[ingre] = {name: ingre, like: [], dislike: []}
      }
      ingredients[ingre].dislike.push(clientId)
    }

    clients.push({ likedIngredients, dislikedIngredients })
  }

  let ingres = Object.values(ingredients).sort((a, b) => a.dislike.length - b.dislike.length)
  const selected = []
  while (ingres.length > 0) {
    const ing = ingres[0]
    log(ing)
    selected.push(ing.name)
    clients = clients.filter((cli) => !cli.dislikedIngredients.includes(ing.name))
    log(clients.length)
    ingredients = {}
    for (const [clientId, client] of clients.entries()) {
        for (const ingre of client.dislikedIngredients) {
            if (!ingredients[ingre]) {
                ingredients[ingre] = {name: ingre, like: [], dislike: []}
            }
            ingredients[ingre].dislike.push(clientId)
        }
    }
    log(Object.values(ingredients).map(i => i.name))
    ingres = Object.values(ingredients).sort((a, b) => a.dislike.length - b.dislike.length)
  }

  log(`${selected.length} ${selected.join(' ')}`)
  write(`${selected.length} ${selected.join(' ')}`)
}

main().then(() => process.exit(0)).catch(err => console.error(err))