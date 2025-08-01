const test = require('tape')
const app = require('../../lib/app')
const { createTestRequest, createCurrencyRequest } = require('../helper')

test('POST /api/project/budget/currency Tests', (t) => {
  t.test('Test successful currency conversion requests', (st) => {
    const currencyRequest = createCurrencyRequest()
    
    createTestRequest(app, '/api/project/budget/currency', 'POST', currencyRequest, (err, res) => {
      t.error(err, 'No error')
      t.equal(res.statusCode, 200, 'Should return 200')
      t.ok(res.body.success, 'Should return success')
      t.end()
    })
  })

  t.test('Test validation errors for missing required fields', (st) => {
    const invalidRequest = { year: 2000 } // Missing projectName and currency
    
    createTestRequest(app, '/api/project/budget/currency', 'POST', invalidRequest, (err, res) => {
      t.error(err, 'No error')
      t.equal(res.statusCode, 400, 'Should return 400')
      t.ok(res.body.error, 'Should have error message')
      t.end()
    })
  })

  t.test('Test 404 responses for non-existent projects', (st) => {
    const invalidRequest = createCurrencyRequest('NonExistentProject', 9999)
    
    createTestRequest(app, '/api/project/budget/currency', 'POST', invalidRequest, (err, res) => {
      t.error(err, 'No error')
      t.equal(res.statusCode, 404, 'Should return 404')
      t.ok(res.body.error, 'Should have error message')
      t.end()
    })
  })

  t.test('Test currency conversion error scenarios', (st) => {
    const currencyRequest = createCurrencyRequest('Peking roasted duck Chanel', 2000)
    
    createTestRequest(app, '/api/project/budget/currency', 'POST', currencyRequest, (err, res) => {
      t.error(err, 'No error')
      t.equal(res.statusCode, 200, 'Should return 200')
      t.ok(res.body.success, 'Should return success')
      t.end()
    })
  })
}) 