const test = require('tape')
const db = require('../lib/db')

// Test environment switching
test('Environment-based DB Switching Tests', (t) => {
  t.test('NODE_ENV=test should use SQLite', (st) => {
    process.env.NODE_ENV = 'test'
    
    // Re-require db to get fresh instance
    delete require.cache[require.resolve('../lib/db')]
    const testDb = require('../lib/db')
    
    st.ok(testDb, 'Database should be initialized')
    st.equal(testDb.constructor.name, 'Database', 'Should be SQLite Database instance')
    st.end()
  })

  t.test('NODE_ENV=development should use MySQL2', (st) => {
    process.env.NODE_ENV = 'development'
    
    // Re-require db to get fresh instance
    delete require.cache[require.resolve('../lib/db')]
    const devDb = require('../lib/db')
    
    st.ok(devDb, 'Database should be initialized')
    st.ok(devDb.query, 'Should have query method (MySQL2)')
    st.end()
  })

  t.test('Missing NODE_ENV should default to SQLite', (st) => {
    delete process.env.NODE_ENV
    
    // Re-require db to get fresh instance
    delete require.cache[require.resolve('../lib/db')]
    const defaultDb = require('../lib/db')
    
    st.ok(defaultDb, 'Database should be initialized')
    st.equal(defaultDb.constructor.name, 'Database', 'Should be SQLite Database instance')
    st.end()
  })

  t.test('Invalid NODE_ENV should default to SQLite', (st) => {
    process.env.NODE_ENV = 'invalid'
    
    // Re-require db to get fresh instance
    delete require.cache[require.resolve('../lib/db')]
    const invalidDb = require('../lib/db')
    
    st.ok(invalidDb, 'Database should be initialized')
    st.equal(invalidDb.constructor.name, 'Database', 'Should be SQLite Database instance')
    st.end()
  })
}) 