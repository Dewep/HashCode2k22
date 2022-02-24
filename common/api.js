const axios = require('axios')
const config = require('../config')

const reportBest = async (bestScore, bestSolution) => {
  const payload = {
    method: 'POST',
    url: `http${config.api.ssl ? 's' : ''}://${config.api.host}/best/${process.env.ALGORITHM_ID}`,
    data: {
      bestScore,
      bestSolution
    },
    json: true
  }
  console.log('Reporting scores', JSON.stringify(payload, null, 2))
  return axios(payload)
}

const reportScores = async (scores) => {
  const payload = {
    method: 'POST',
    url: `http${config.api.ssl ? 's' : ''}://${config.api.host}/score/${process.env.ALGORITHM_ID}`,
    data: {
      scores
    },
    json: true
  }
  console.log('Reporting scores', JSON.stringify(payload, null, 2))
  return axios(payload)
}

module.exports = {
  reportBest,
  reportScores
}
