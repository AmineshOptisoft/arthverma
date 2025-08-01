const fs = require('fs')
const path = require('path')
const db = require('./db')

const createTableSql = `
  CREATE TABLE IF NOT EXISTS project (
    projectId INT PRIMARY KEY,
    projectName VARCHAR(255),
    year INT,
    currency VARCHAR(3),
    initialBudgetLocal DECIMAL(10, 2),
    budgetUsd DECIMAL(10, 2),
    initialScheduleEstimateMonths INT,
    adjustedScheduleEstimateMonths INT,
    contingencyRate DECIMAL(5, 2),
    escalationRate DECIMAL(5, 2),
    finalBudgetUsd DECIMAL(10, 2)
  )
`

function initializeTestDatabase (callback) {
  if (process.env.NODE_ENV !== 'test') {
    return callback(new Error('Database initialization only allowed in test environment'))
  }

  db.serialize(() => {
    // Create table
    db.run(createTableSql, (err) => {
      if (err) return callback(err)
      
      // Clear existing data
      db.run('DELETE FROM project', (err) => {
        if (err) return callback(err)
        
        // Load seed data
        loadSeedData(callback)
      })
    })
  })
}

function loadSeedData (callback) {
  const csvPath = path.join(__dirname, '../data/projects.csv')
  const stream = fs.createReadStream(csvPath)
  let data = ''

  stream.on('data', (chunk) => {
    data += chunk.toString()
  })

  stream.on('end', () => {
    const lines = data.split('\n')
    
    lines.forEach((line, index) => {
      if (index === 0) return // Skip header
      if (!line.trim()) return // Skip empty lines

      const values = line.split(',')
      if (values.length < 11) return // Skip invalid lines

      const parsedValues = values.map((value, idx) => {
        if (value === 'NULL') return null
        if (idx === 0 || idx === 2) return parseInt(value) || 0 // projectId, year
        if (idx === 6 || idx === 7) return parseInt(value) || 0 // months
        if (!isNaN(value)) return parseFloat(value) || 0
        return `"${value}"`
      })

      const insertSql = `INSERT INTO project VALUES (${parsedValues.join(',')})`
      
      db.run(insertSql, (err) => {
        if (err) {
          console.error('Error inserting Project ID:', values[0], err)
        }
      })
    })

    callback(null, 'Test database initialized successfully')
  })

  stream.on('error', (err) => {
    callback(err)
  })
}

function cleanupTestDatabase (callback) {
  if (process.env.NODE_ENV !== 'test') {
    return callback(new Error('Database cleanup only allowed in test environment'))
  }

  db.run('DELETE FROM project', (err) => {
    if (err) return callback(err)
    callback(null, 'Test database cleaned up successfully')
  })
}

module.exports = {
  initializeTestDatabase,
  loadSeedData,
  cleanupTestDatabase
} 