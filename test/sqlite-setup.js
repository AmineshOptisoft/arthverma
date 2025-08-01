const test = require('tape')
const dbSetup = require('../lib/db-setup')
const db = require('../lib/db')

// Set environment to test
process.env.NODE_ENV = 'test'

test('SQLite Database Setup Tests', (t) => {
  t.test('SQLite table creation during test setup', (st) => {
    dbSetup.initializeTestDatabase((err, message) => {
      st.error(err, 'No error during table creation')
      st.ok(message.includes('successfully'), 'Should return success message')
      
      // Verify table exists
      db.get("SELECT name FROM sqlite_master WHERE type='table' AND name='project'", (err, row) => {
        st.error(err, 'No error checking table existence')
        st.ok(row, 'Project table should exist')
        st.end()
      })
    })
  })

  t.test('Clean and seed SQLite before each test', (st) => {
    dbSetup.cleanupTestDatabase((err) => {
      st.error(err, 'No error during cleanup')
      
      // Verify table is empty
      db.get('SELECT COUNT(*) as count FROM project', (err, row) => {
        st.error(err, 'No error counting records')
        st.equal(row.count, 0, 'Table should be empty after cleanup')
        
        // Now seed data
        dbSetup.loadSeedData((err, message) => {
          st.error(err, 'No error during seeding')
          st.ok(message.includes('successfully'), 'Should return success message')
          
          // Verify data was inserted
          db.get('SELECT COUNT(*) as count FROM project', (err, row) => {
            st.error(err, 'No error counting records after seeding')
            st.ok(row.count > 0, 'Should have inserted seed data')
            st.end()
          })
        })
      })
    })
  })

  t.test('Load seed data from projects.csv and validate insertion', (st) => {
    dbSetup.initializeTestDatabase((err) => {
      st.error(err, 'No error during initialization')
      
      // Check for specific projects from CSV
      const testProjects = [
        'Peking roasted duck Chanel',
        'Choucroute Cartier',
        'Rigua Nintendo',
        'Llapingacho Instagram'
      ]
      
      let completedChecks = 0
      testProjects.forEach(projectName => {
        db.get("SELECT * FROM project WHERE projectName = ?", [projectName], (err, row) => {
          st.error(err, `No error querying ${projectName}`)
          st.ok(row, `Should find ${projectName} project`)
          completedChecks++
          
          if (completedChecks === testProjects.length) {
            st.end()
          }
        })
      })
    })
  })

  t.test('Confirm DB schema and connection initialization work as expected', (st) => {
    dbSetup.initializeTestDatabase((err) => {
      st.error(err, 'No error during initialization')
      
      // Test basic CRUD operations
      db.run('INSERT INTO project (projectId, projectName, year, currency, initialBudgetLocal, budgetUsd, initialScheduleEstimateMonths, adjustedScheduleEstimateMonths, contingencyRate, escalationRate, finalBudgetUsd) VALUES (99999, "Test Project", 2024, "USD", 1000.00, 1000.00, 12, 12, 0.00, 0.00, 1000.00)', (err) => {
        st.error(err, 'No error inserting test record')
        
        db.get('SELECT * FROM project WHERE projectId = 99999', (err, row) => {
          st.error(err, 'No error retrieving test record')
          st.ok(row, 'Should find inserted test record')
          st.equal(row.projectName, 'Test Project', 'Should have correct project name')
          
          db.run('DELETE FROM project WHERE projectId = 99999', (err) => {
            st.error(err, 'No error deleting test record')
            st.end()
          })
        })
      })
    })
  })
}) 