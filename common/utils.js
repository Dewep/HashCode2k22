let _input = ''
let _onInput = null

function write (message) {
  process.stdout.write(message)
}
function log (message) {
  process.stderr.write(JSON.stringify(message) + '\n')
}
async function getRawLine () {
  const index = _input.indexOf('\n')
  if (index === -1) {
    await new Promise(resolve => {
      _onInput = resolve
    })
    return getRawLine()
  }
  const line = _input.slice(0, index)
  _input = _input.slice(index + 1)
  return line
}
// opts.asArray: split by spaces
// opts.asInteger: convert items in integer
async function getLine (opts = {}) {
  const line = await getRawLine()
  const transfomer = opts.asInteger ? n => +n : n => n
  return opts.asArray ? line.split(' ').map(transfomer) : transfomer(line)
}
process.stdin.on('data', chunk => {
  _input += chunk.toString().replace(/\r/g, '')
  if (_onInput) {
    _onInput()
    _onInput = null
  }
})

exports.default = {
  write,
  log,
  getLine
}
