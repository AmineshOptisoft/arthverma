// External dependencies
const mysql = require('mysql2')
const sqlite3 = require('sqlite3').verbose()

// Internal dependencies
const config = require('../config')

// Constants
const engines = {
  undefined: 'sqlite3',
  test: 'sqlite3',
  development: 'mysql2',
  production: 'mysql2'
}

// Connection pool for MySQL
const mysqlPool = mysql.createPool({
  ...config.mysql,
  connectionLimit: 10,
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true
})

const engine = {
  sqlite3: new sqlite3.Database(':memory:'),
  mysql2: mysqlPool
}[engines[process.env.NODE_ENV]]

// Exports
const db = module.exports = engine

// Database initialization
if (engines[process.env.NODE_ENV] === 'mysql2') {
  mysqlPool.getConnection((err, connection) => {
    if (err) {
      console.error('Error connecting to MySQL:', err)
      throw err
    }
    console.log('Connected to MySQL database with connection pool')
    connection.release()
  })
}

// Health check function
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

// Utility functions
function executeQuery (query, values, cb) {
  if (engines[process.env.NODE_ENV] === 'mysql2') {
    return mysqlPool.query(query, values, function (err, data) {
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

// Optimized query execution with connection pooling
function executeOptimizedQuery (query, values = []) {
  return new Promise((resolve, reject) => {
    if (engines[process.env.NODE_ENV] === 'mysql2') {
      // Use connection pool for better performance
      mysqlPool.query(query, values, (err, results) => {
        if (err) return reject(err)
        resolve(results)
      })
    } else {
      // SQLite environment
      db.serialize(() => {
        db.all(query, values, (err, rows) => {
          if (err) return reject(err)
          resolve(rows)
        })
      })
    }
  })
}

// Optimized write query execution
function executeOptimizedWriteQuery (query, values = []) {
  return new Promise((resolve, reject) => {
    if (engines[process.env.NODE_ENV] === 'mysql2') {
      // Use connection pool for better performance
      mysqlPool.query(query, values, (err, results) => {
        if (err) return reject(err)
        resolve(results)
      })
    } else {
      // SQLite environment
      db.serialize(() => {
        db.run(query, values, function (err) {
          if (err) return reject(err)
          resolve(this)
        })
      })
    }
  })
}

// Export optimized functions
module.exports.executeOptimizedQuery = executeOptimizedQuery
module.exports.executeOptimizedWriteQuery = executeOptimizedWriteQuery
