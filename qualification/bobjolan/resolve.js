const { getLine, write, log } = require('../../common/utils')
const api = require('../../common/api')

const filterProjectBySkill = (projects, skills) => {
  return projects.filter(project => {
    for (const skill of skills) {
      if (project.roles.find(role => role.skill === skill.skill && role.level <= skill.level)) {
        return true
      }
    }
  })
}

const pickProject = (projects) => {
  return projects[Math.floor(Math.random() * projects.length)]
}

const processDay = (state) => {
  // console.log('Day', state.day)
  for (let i = 0; i < state.projects.length; i++) {
    const project = state.projects[i]

    if (project.finishesAt === state.day) {
      // console.log('Project', project.name, 'finished')
      project.done = true
    }
  }

  for (let i = 0; i < state.contributors.length; i++) {
    const contributor = state.contributors[i]

    if (contributor.freeAtDay <= state.day && !contributor.stuck && !contributor.busy) {
      const project = pickProject(filterProjectBySkill(state.projects, contributor.skills))

      if (!project) {
        contributor.stuck = true
        continue
      }

      for (const skill of contributor.skills) {
        for (let role of project.roles) {
          if (role.skill === skill.skill && role.level <= skill.level) {
            role.done = true
            role.contributor = contributor
            contributor.busy = true
            // console.log('Assigned', contributor.name, 'to', project.name, 'with skill', role.skill)
            if (role.level === skill.level) {
              skill.level++
            }
          }
        }
      }
    }
  }

  let stuck = true
  for (let i = 0; i < state.projects.length; i++) {
    const project = state.projects[i]

    if (project.started && !project.done) {
      stuck = false
    }
    if (project.done || project.started) {
      continue
    }

    if (!project.started && project.roles.every(role => role.done)) {
      // console.log('Starting project', project.name, 'will complete on day', state.day + project.days)
      project.started = true
      project.finishesAt = state.day + project.days
      for (let j = 0; j < project.roles.length; j++) {
        const contributor = state.contributors.find(contributor => contributor.name === project.roles[j].contributor.name)
        contributor.busy = false
        contributor.freeAtDay = state.day + project.days
      }
      stuck = false
    }
  }
  
  if (stuck) {
    const error = new Error('Stuck, submitting solution...')
    error.state = state
    throw error
  }
  return state
}

const initState = (projects, contributors) => ({
  projects: JSON.parse(JSON.stringify(projects)),
  contributors: JSON.parse(JSON.stringify(contributors)),
  day: 0,
})

const getSolutionScore = ({ projects }) => {
  return projects.filter(project => project.done).reduce((acc, project) => {
    const newValue = acc + (project.bestBeforeDay > project.finishesAt ? project.score : Math.max(0, project.bestBeforeDay - project.finishesAt))
    if (Number.isNaN(newValue)) {
      // console.log('?????', acc, project.bestBeforeDay, project.finishesAt, project.score, Math.max(0, project.bestBeforeDay - project.finishesAt))
    }
    return newValue
  }, 0)
}

const getSolution = ({ projects }) => {
  const done = projects.filter(project => project.done)
  const count = done.length

  let solution = `${count}`
  for (project of done) {
    solution = `${solution}\n${project.name}\n${project.roles.map(role => role.contributor.name).join('\n')}`
  }
  return solution
}

const solve = async (projects, contributors) => {
  let state = initState(projects, contributors)
  while (true) {
    try {
      state = processDay(state)
      state.day++
    } catch (err) {
      // console.error(err)
      if (err.state) {
        const score = getSolutionScore(err.state)
        const solution = getSolution(err.state)
        // console.log(score)
        // console.log(solution)
        return {score, solution}
      }
      state = initState(projects, contributors)
    }
  }
}

// Command:
// node resolve.js < a.txt > a.out.txt
async function main () {
  const [nbContributors, nbProjects] = await getLine({ asInteger: true, asArray: true })
  const contributors = []
  const projects = []

  for (let cIndex = 0; cIndex < nbContributors; cIndex++) {
    const [name, nbSkills] = await getLine({ asInteger: false, asArray: true })
    const contributor = {
      name,
      skills: [],

      freeAtDay: 0
    }

    for (let sIndex = 0; sIndex < +nbSkills; sIndex++) {
      const [skill, level] = await getLine({ asInteger: false, asArray: true })
      contributor.skills.push({ skill, level: +level })
    }

    contributors.push(contributor)
  }

  for (let pIndex = 0; pIndex < nbProjects; pIndex++) {
    const [name, days, score, bestBeforeDay, nbRoles] = await getLine({ asInteger: false, asArray: true })
    const project = {
      name,
      days: +days,
      score: +score,
      bestBeforeDay: +bestBeforeDay,
      roles: [],

      done: false
    }

    for (let rIndex = 0; rIndex < +nbRoles; rIndex++) {
      const [skill, level] = await getLine({ asInteger: false, asArray: true })
      project.roles.push({ skill, level: +level })
    }

    projects.push(project)
  }

  // log({ projects, contributors })


  // let solutions = []
  let bestScore = 0
  let bestSolution = ""
  while (true) {
    const { solution, score } = await solve(projects, contributors)
    if (score > bestScore) {
      bestScore = score
      bestSolution = solution
      console.log('New best solution with score', score)
      console.log(solution)
      try {
        await api.reportBest(bestScore, bestSolution)
      } catch (err) {
        console.error('COULDNT SUBMIT SCORE', err)
      }
    }
    // solutions.push({ solution, score })
  }
}

main().then(() => process.exit(0)).catch(err => console.error(err))
