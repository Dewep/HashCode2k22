const fs = require('fs').promises

const _inputs = {
  stdin: ''
}
let _onInput = null
process.stdin.on('data', chunk => {
  _inputs.stdin += chunk.toString().replace(/\r/g, '')
  if (_onInput) {
    _onInput()
    _onInput = null
  }
})

function write (message) {
  process.stdout.write(message)
}

function log (message) {
  process.stderr.write(JSON.stringify(message) + '\n')
}

async function getRawLine (opts = {}) {
  if (_inputs[opts.input] === undefined) {
    _inputs[opts.input] = await fs.readFile(opts.input, { encoding: 'utf-8' })
  }
  let index = _inputs[opts.input].indexOf('\n')
  if (index === -1) {
    if (opts.input === 'stdin') {
      await new Promise(resolve => {
        _onInput = resolve
      })
      return getRawLine(opts)
    }
    index = _inputs[opts.input].length
  }
  const line = _inputs[opts.input].slice(0, index)
  _inputs[opts.input] = _inputs[opts.input].slice(index + 1)
  return line
}

// opts.asArray: split by spaces
// opts.asInteger: convert items in integer
async function getLine (opts = {}) {
  opts.input = opts.input || 'stdin'
  const line = await getRawLine(opts)
  const transfomer = opts.asInteger ? n => +n : n => n
  return opts.asArray ? line.split(' ').map(transfomer) : transfomer(line)
}

module.exports = {
  write,
  log,
  getLine
}
