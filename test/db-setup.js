const test = require('tape')
const dbSetup = require('../lib/db-setup')
const db = require('../lib/db')

// Set environment to test
process.env.NODE_ENV = 'test'

test('Database Setup Tests', (t) => {
  t.test('SQLite table creation', (st) => {
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

  t.test('Seed data insertion', (st) => {
    dbSetup.loadSeedData((err, message) => {
      st.error(err, 'No error during seed data loading')
      st.ok(message.includes('successfully'), 'Should return success message')
      
      // Verify data was inserted
      db.get('SELECT COUNT(*) as count FROM project', (err, row) => {
        st.error(err, 'No error counting records')
        st.ok(row.count > 0, 'Should have inserted seed data')
        st.end()
      })
    })
  })

  t.test('Database cleanup functionality', (st) => {
    dbSetup.cleanupTestDatabase((err, message) => {
      st.error(err, 'No error during cleanup')
      st.ok(message.includes('successfully'), 'Should return success message')
      
      // Verify data was cleaned up
      db.get('SELECT COUNT(*) as count FROM project', (err, row) => {
        st.error(err, 'No error counting records after cleanup')
        st.equal(row.count, 0, 'Should have cleaned up all data')
        st.end()
      })
    })
  })

  t.test('Specific project data validation', (st) => {
    dbSetup.initializeTestDatabase((err) => {
      st.error(err, 'No error during initialization')
      
      // Check for specific projects mentioned in requirements
      db.get("SELECT * FROM project WHERE projectName = 'Peking roasted duck Chanel'", (err, row) => {
        st.error(err, 'No error querying specific project')
        st.ok(row, 'Should find Peking roasted duck Chanel project')
        st.equal(row.year, 2000, 'Should have correct year')
        st.end()
      })
    })
  })
}) 