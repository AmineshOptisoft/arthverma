const test = require('tape')
const app = require('../lib/app')
const { createTestRequest, createGetRequest, createCurrencyRequest } = require('./helper')

test('API Endpoint Tests', (t) => {
  t.test('Test POST /api/project/budget/currency endpoint', (st) => {
    const currencyRequest = createCurrencyRequest()
    
    createTestRequest(app, '/api/project/budget/currency', 'POST', currencyRequest, (err, res) => {
      t.error(err, 'No error')
      t.equal(res.statusCode, 200, 'Should return 200')
      t.ok(res.body.success, 'Should return success')
      t.end()
    })
  })

  t.test('Test GET /api/project/budget/:id endpoint', (st) => {
    createGetRequest(app, '/api/project/budget/321', (err, res) => {
      t.error(err, 'No error')
      t.equal(res.statusCode, 200, 'Should return 200')
      t.ok(res.body.projectId, 'Should have projectId')
      t.end()
    })
  })

  t.test('Test GET /api/ok health endpoint', (st) => {
    createGetRequest(app, '/api/ok', (err, res) => {
      t.error(err, 'No error')
      t.equal(res.statusCode, 200, 'Should return 200')
      t.ok(res.body.ok, 'Should return ok true')
      t.end()
    })
  })

  t.test('Test currency conversion with invalid project', (st) => {
    const invalidRequest = createCurrencyRequest('NonExistentProject', 9999)
    
    createTestRequest(app, '/api/project/budget/currency', 'POST', invalidRequest, (err, res) => {
      t.error(err, 'No error')
      t.equal(res.statusCode, 404, 'Should return 404')
      t.ok(res.body.error, 'Should have error message')
      t.end()
    })
  })

  t.test('Test currency conversion with missing fields', (st) => {
    const invalidRequest = { year: 2000 } // Missing projectName and currency
    
    createTestRequest(app, '/api/project/budget/currency', 'POST', invalidRequest, (err, res) => {
      t.error(err, 'No error')
      t.equal(res.statusCode, 400, 'Should return 400')
      t.ok(res.body.error, 'Should have error message')
      t.end()
    })
  })

  t.test('Test GET project with invalid ID', (st) => {
    createGetRequest(app, '/api/project/budget/99999', (err, res) => {
      t.error(err, 'No error')
      t.equal(res.statusCode, 404, 'Should return 404')
      t.ok(res.body.error, 'Should have error message')
      t.end()
    })
  })
}) 