const assert = require("assert")
const fetch = require('node-fetch')

const { generateId, runCliAsync, getStorageDir, getDatabaseFilename, getEventsFilename } = require('../utils')

const servers = {}

const wait = async ms => new Promise(resolve => setTimeout(resolve, ms))

const waitForUrl = async (url, timeout) => {
  const max = Date.now() + timeout

  const next = async () => {
    if (Date.now() < timeout) {
      throw new Error(`Timeout exceeded`)
    }
    return fetch(url)
      .catch(() => wait(200).then(next))
  }

  return next()
}

step("Start server", async () => {
  const serverId = generateId(4)
  const port = 38000 + +(Math.random() * 999).toFixed()
  const cb = () => {}
  const child = runCliAsync(['server', '-s', getStorageDir(), '-d', getDatabaseFilename(), '-e', getEventsFilename(), '--port', port], cb)

  servers[serverId] = {
    child,
    port
  }
  gauge.dataStore.scenarioStore.put('serverId', serverId)

  return waitForUrl(`http://localhost:${port}`, 10 * 1000)
})

step("Stop server", async () => {
  const serverId = gauge.dataStore.scenarioStore.get('serverId')
  const server = servers[serverId]
  assert(!!server, `Server ${serverId} not found`)

  return new Promise(resolve => {
    server.child.on('exit', resolve)
    server.child.kill('SIGTERM')
    delete servers[serverId]
  })
})

step("Server has file <file>", async (file) => {
  const serverId = gauge.dataStore.scenarioStore.get('serverId')
  const server = servers[serverId]
  assert(!!server, `Server ${serverId} not found`)

  const url = `http://localhost:${server.port}${file}`
  return fetch(url)
    .then(res => {
      if (!res.ok) {
        throw new Error(`Could not fetch ${file}`)
      }
    })
})