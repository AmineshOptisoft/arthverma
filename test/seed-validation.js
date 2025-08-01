const test = require('tape')
const dbSetup = require('../lib/db-setup')
const db = require('../lib/db')
const fs = require('fs')
const path = require('path')

// Set environment to test
process.env.NODE_ENV = 'test'

test('Seed Data Validation Tests', (t) => {
  t.test('Ensure all entries from CSV are loaded', (st) => {
    // Count lines in CSV file
    const csvPath = path.join(__dirname, '../data/projects.csv')
    const csvContent = fs.readFileSync(csvPath, 'utf8')
    const csvLines = csvContent.split('\n').filter(line => line.trim() && !line.startsWith('Project ID'))
    const expectedCount = csvLines.length
    
    dbSetup.initializeTestDatabase((err) => {
      st.error(err, 'No error during initialization')
      
      db.get('SELECT COUNT(*) as count FROM project', (err, row) => {
        st.error(err, 'No error counting records')
        st.equal(row.count, expectedCount, `Should have loaded all ${expectedCount} entries from CSV`)
        st.end()
      })
    })
  })

  t.test('Validate presence of specific projects', (st) => {
    dbSetup.initializeTestDatabase((err) => {
      st.error(err, 'No error during initialization')
      
      // Test specific projects mentioned in requirements
      const specificProjects = [
        { name: 'Peking roasted duck Chanel', year: 2000 },
        { name: 'Choucroute Cartier', year: 2000 },
        { name: 'Rigua Nintendo', year: 2001 },
        { name: 'Llapingacho Instagram', year: 2000 }
      ]
      
      let completedChecks = 0
      specificProjects.forEach(project => {
        db.get("SELECT * FROM project WHERE projectName = ? AND year = ?", [project.name, project.year], (err, row) => {
          st.error(err, `No error querying ${project.name}`)
          st.ok(row, `Should find ${project.name} project`)
          st.equal(row.year, project.year, `Should have correct year for ${project.name}`)
          completedChecks++
          
          if (completedChecks === specificProjects.length) {
            st.end()
          }
        })
      })
    })
  })

  t.test('Verify data integrity, field types, and row counts match expectations', (st) => {
    dbSetup.initializeTestDatabase((err) => {
      st.error(err, 'No error during initialization')
      
      // Test data types and constraints
      db.get("SELECT * FROM project WHERE projectId = 321", (err, row) => {
        st.error(err, 'No error querying specific project')
        st.ok(row, 'Should find Peking roasted duck Chanel project')
        
        // Validate data types
        st.equal(typeof row.projectId, 'number', 'projectId should be number')
        st.equal(typeof row.projectName, 'string', 'projectName should be string')
        st.equal(typeof row.year, 'number', 'year should be number')
        st.equal(typeof row.currency, 'string', 'currency should be string')
        st.equal(typeof row.initialBudgetLocal, 'number', 'initialBudgetLocal should be number')
        st.equal(typeof row.budgetUsd, 'number', 'budgetUsd should be number')
        st.equal(typeof row.initialScheduleEstimateMonths, 'number', 'initialScheduleEstimateMonths should be number')
        st.equal(typeof row.adjustedScheduleEstimateMonths, 'number', 'adjustedScheduleEstimateMonths should be number')
        st.equal(typeof row.contingencyRate, 'number', 'contingencyRate should be number')
        st.equal(typeof row.escalationRate, 'number', 'escalationRate should be number')
        st.equal(typeof row.finalBudgetUsd, 'number', 'finalBudgetUsd should be number')
        
        // Validate specific values for Peking roasted duck Chanel
        st.equal(row.projectName, 'Peking roasted duck Chanel', 'Should have correct project name')
        st.equal(row.year, 2000, 'Should have correct year')
        st.equal(row.currency, 'GBP', 'Should have correct currency')
        st.equal(row.finalBudgetUsd, 689836.03, 'Should have correct final budget')
        
        st.end()
      })
    })
  })

  t.test('Test row counts match expectations', (st) => {
    dbSetup.initializeTestDatabase((err) => {
      st.error(err, 'No error during initialization')
      
      // Count by year
      db.get("SELECT COUNT(*) as count FROM project WHERE year = 2000", (err, row) => {
        st.error(err, 'No error counting 2000 projects')
        st.ok(row.count > 0, 'Should have projects from 2000')
        
        db.get("SELECT COUNT(*) as count FROM project WHERE year = 2001", (err, row) => {
          st.error(err, 'No error counting 2001 projects')
          st.ok(row.count > 0, 'Should have projects from 2001')
          
          // Count by currency
          db.get("SELECT COUNT(*) as count FROM project WHERE currency = 'USD'", (err, row) => {
            st.error(err, 'No error counting USD projects')
            st.ok(row.count > 0, 'Should have USD projects')
            
            db.get("SELECT COUNT(*) as count FROM project WHERE currency = 'EUR'", (err, row) => {
              st.error(err, 'No error counting EUR projects')
              st.ok(row.count > 0, 'Should have EUR projects')
              
              db.get("SELECT COUNT(*) as count FROM project WHERE currency = 'GBP'", (err, row) => {
                st.error(err, 'No error counting GBP projects')
                st.ok(row.count > 0, 'Should have GBP projects')
                st.end()
              })
            })
          })
        })
      })
    })
  })
}) 