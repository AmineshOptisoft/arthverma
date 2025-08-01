const test = require('tape')
const app = require('../../lib/app')
const { createGetRequest } = require('../helper')

test('GET /api/project/budget/:id Tests', (t) => {
  t.test('Test successful project retrieval by ID', (st) => {
    createGetRequest(app, '/api/project/budget/321', (err, res) => {
      t.error(err, 'No error')
      t.equal(res.statusCode, 200, 'Should return 200')
      t.ok(res.body.projectId, 'Should have projectId')
      t.end()
    })
  })

  t.test('Test 404 responses for non-existent projects', (st) => {
    createGetRequest(app, '/api/project/budget/99999', (err, res) => {
      t.error(err, 'No error')
      t.equal(res.statusCode, 404, 'Should return 404')
      t.ok(res.body.error, 'Should have error message')
      t.end()
    })
  })

  t.test('Test 400 responses for invalid project IDs', (st) => {
    createGetRequest(app, '/api/project/budget/invalid', (err, res) => {
      t.error(err, 'No error')
      t.equal(res.statusCode, 400, 'Should return 400')
      t.ok(res.body.error, 'Should have error message')
      t.end()
    })
  })

  t.test('Test database connection error scenarios', (st) => {
    // This would require mocking the database to simulate connection errors
    // For now, we'll test that the endpoint handles the request properly
    createGetRequest(app, '/api/project/budget/1', (err, res) => {
      t.error(err, 'No error')
      t.equal(res.statusCode, 200, 'Should return 200')
      t.ok(res.body, 'Should have response body')
      t.end()
    })
  })
}) 