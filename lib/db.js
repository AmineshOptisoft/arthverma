const config = require('../config')
const mysql = require('mysql2')
const sqlite3 = require('sqlite3').verbose()

const engines = {
  undefined: 'sqlite3',
  test: 'sqlite3',
  development: 'mysql2',
  production: 'mysql2'
}

// Add logging to confirm active DB engine
const currentEnv = process.env.NODE_ENV || 'undefined'
const activeEngine = engines[currentEnv]
console.log(`Database: Using ${activeEngine} engine for NODE_ENV=${currentEnv}`)

const engine = {
  sqlite3: new sqlite3.Database(':memory:'),
  mysql2: mysql.createConnection(config.mysql)
}[engines[process.env.NODE_ENV]]

const db = module.exports = engine

if (engines[process.env.NODE_ENV] === 'mysql2') {
  db.connect(function (err) {
    if (err) {
      console.error('MySQL connection error:', err)
      throw err
    }
    console.log('Connected to MySQL database')
  })
} else if (engines[process.env.NODE_ENV] === 'sqlite3') {
  console.log('SQLite database initialized (in-memory)')
}

db.healthCheck = function (cb) {
  const now = Date.now().toString()
  const createQuery = 'CREATE TABLE IF NOT EXISTS healthCheck (value TEXT)'
  const insertQuery = 'INSERT INTO healthCheck VALUES (?)'

  return executeQuery(createQuery, [], function (err) {
    if (err) return cb(err)
    return executeQuery(insertQuery, [now], function (err) {
      if (err) return cb(err)
      cb(null, now)
    })
  })
}

function executeQuery (query, values, cb) {
  if (engines[process.env.NODE_ENV] === 'mysql2') {
    return db.query(query, values, function (err, data) {
      if (err) return cb(err)
      cb(null, data)
    })
  }

  return db.serialize(function () {
    db.run(query, values, function (err, data) {
      if (err) return cb(err)
      cb(null, data)
    })
  })
}
