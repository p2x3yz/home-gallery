const log = require('@home-gallery/logger')('database.migrate')

const { getMajorMinor, HeaderType } = require('./header')

const { createHash, serialize } = require('@home-gallery/common')

const migrate = (database, cb) => {
  let majorMinor
  try {
    majorMinor = getMajorMinor(database.type)
  } catch (e) {
    return cb(e)
  }
  const [major, minor] = majorMinor
  if (major != 1) {
    return cb(new Error(`Incompatible major version ${major}. Can not migrate database`))
  }
  if (minor < 3) {
    const t0 = Date.now()
    log.debug(`Migrating database from ${major}.${minor}: Adding entry.hash`)
    database.data.forEach(entry => {
      entry.hash = createHash(serialize(entry, 'appliedEventIds'))
    })
    log.info(t0, `Migrated database to 1.3`)
  }
  database.type = HeaderType
  cb(null, database)
}

module.exports = {
  migrate
}