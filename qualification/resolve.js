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

  projects.sort((a, b) => a.bestBeforeDay - b.bestBeforeDay)

  const result = []
  let day = 0
  while (true) {
    for (const project of projects) {
      if (project.done) {
        continue
      }

      const freeContributors = contributors
        .filter(c => c.freeAtDay >= day)
        .map(c => ({
          ...c,
          used: false
        }))
      for (const skill of project.roles) {
        const freeContributorsBySkill = freeContributors.filter(c => !c.used && c.skills.find(s => s.skill === skill.skill && s.level >= skill.level))
        if (freeContributorsBySkill.length > 0) {
          const contributor = freeContributorsBySkill[0]
          contributor.freeAtDay += project.days
          contributor.skills.push(skill)
          project.done = true
          result.push(`${contributor.name} ${project.name}`)
          break
        }
      }
    }

    day += 1
  }

  log({ projects, contributors })
}

main().then(() => process.exit(0)).catch(err => console.error(err))
