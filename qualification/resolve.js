const { getLine, write, log } = require('../common/utils')

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

  log({ parsing: 'done' })
  // tri pour opti ?
  // projects.sort((a, b) => a.bestBeforeDay - b.bestBeforeDay)
  projects.sort((a, b) => a.score - b.score)
  // projects.sort((a, b) => a.roles.length - b.roles.length)

  // contributors.sort((a, b) => a.skills.length - b.skills.length)
  
  // max skill level first
  contributors.sort((a, b) => {
    const aSkill = a.skills.sort((a, b) => b.level - a.level)[0]
    const bSkill = b.skills.sort((a, b) => b.level - a.level)[0]

    return aSkill.level - bSkill.level
  })

  const result = []
  let dayForTheLastProject = 0
  let day = 0
  while (true) {
    let projectHasBeenDone = false

    for (const project of projects) {
      if (project.done) {
        continue
      }


      // Constitution de l'equipe =====================
      const freeContributors = contributors
        .filter(c => c.freeAtDay >= day)
      const usedContributors = []
      for (const role of project.roles) {
        const contributorIndex = freeContributors.findIndex(c => isHired(c, role, usedContributors))
        if (contributorIndex === -1) {
          break
        }
        let selectedContributors = freeContributors.splice(contributorIndex, 1)[0]
        selectedContributors.role = role
        usedContributors.push(selectedContributors)
      }
      // ========================================

      // We cannot create a great team :'(
      if (usedContributors.length !== project.roles.length) {
        continue
      }

      for (let contributorIndex = 0; contributorIndex < usedContributors.length; contributorIndex++) {
        const contributor = usedContributors[contributorIndex]

        contributor.freeAtDay += project.days
        usedSkill = contributor.skills.find(s => s.skill === project.roles[contributorIndex].skill)
        if (usedSkill === undefined) {
          contributor.skills.push({skill: contributor.role.skill, level: 1})
        } else if (usedSkill.level <= project.roles[contributorIndex].level) {
          usedSkill.level += 1
        }

        contributor.role = undefined
      }

      if (dayForTheLastProject < day + project.days) {
        dayForTheLastProject = day + project.days
      }
      project.done = true
      projectHasBeenDone = true
      result.push({
        project: project.name,
        contributors: usedContributors.map(c => c.name)
      })
    }

    if (!projectHasBeenDone && dayForTheLastProject <= day) {
      break
    }

    day += 1
    if (day % 100 === 0) {
      log({ day })
    }
  }

  write(`${result.length}\n`)
  for (const project of result) {
    write(project.project + '\n' + project.contributors.join(' ') + '\n')
  }

  log({ projects: projects.length, contributors: contributors.length, result: result.length })
  // log({ projects, contributors, result })
  // log({ result })
}

main().then(() => process.exit(0)).catch(err => console.error(err))


///////////////////////////////
function isHired(contributor, role, team) {
  return hasSkill(contributor, role) || canBeMentored(contributor, role, team)
}

function hasSkill(contributor, role) {
  return contributor.skills.some(sk => sk.skill === role.skill && sk.level >= role.level)
}

function canBeMentored(contributor, role, team) {
  const mentor = team.some(friend => hasSkill(friend, role))
  return mentor && contributor.skills.some(sk => sk.skill === role.skill && sk.level === (role.level - 1))
}
