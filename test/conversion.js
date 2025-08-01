process.env.NODE_ENV = 'test'

const http = require('http')
const test = require('tape')
const servertest = require('servertest')
const app = require('../lib/app')
const { createTestRequest } = require('./helper')

const server = http.createServer(app)

// Test successful currency conversion
test('POST /api/conversion should convert USD to TTD successfully', function (t) {
  const requestBody = {
    baseCurrency: 'USD',
    targetCurrency: 'TTD',
    amount: 100
  }

  createTestRequest(server, '/api/conversion', 'POST', requestBody, function (err, res) {
    t.error(err, 'No error')
    t.equal(res.statusCode, 200, 'Should return 200')
    t.ok(res.body.success, 'Should return success true')
    t.end()
  })
})

// Test missing required fields
test('POST /api/conversion should return 400 for missing fields', function (t) {
  const requestBody = {
    baseCurrency: 'USD',
    amount: 100
  }

  createTestRequest(server, '/api/conversion', 'POST', requestBody, function (err, res) {
    t.error(err, 'No error')
    t.equal(res.statusCode, 400, 'Should return 400')
    t.end()
  })
})

// Test invalid currency conversion
test('POST /api/conversion should return 400 for unsupported conversion', function (t) {
  const requestBody = {
    baseCurrency: 'USD',
    targetCurrency: 'INVALID',
    amount: 100
  }

  createTestRequest(server, '/api/conversion', 'POST', requestBody, function (err, res) {
    t.error(err, 'No error')
    t.equal(res.statusCode, 400, 'Should return 400')
    t.end()
  })
})

// Test invalid amount
test('POST /api/conversion should return 400 for invalid amount', function (t) {
  const requestBody = {
    baseCurrency: 'USD',
    targetCurrency: 'TTD',
    amount: -100
  }

  createTestRequest(server, '/api/conversion', 'POST', requestBody, function (err, res) {
    t.error(err, 'No error')
    t.equal(res.statusCode, 400, 'Should return 400')
    t.end()
  })
})

// Test EUR to TTD conversion
test('POST /api/conversion should convert EUR to TTD successfully', function (t) {
  const requestBody = {
    baseCurrency: 'EUR',
    targetCurrency: 'TTD',
    amount: 50
  }

  createTestRequest(server, '/api/conversion', 'POST', requestBody, function (err, res) {
    t.error(err, 'No error')
    t.equal(res.statusCode, 200, 'Should return 200')
    t.ok(res.body.success, 'Should return success true')
    t.end()
  })
})

// Test TTD to USD conversion
test('POST /api/conversion should convert TTD to USD successfully', function (t) {
  const requestBody = {
    baseCurrency: 'TTD',
    targetCurrency: 'USD',
    amount: 680
  }

  createTestRequest(server, '/api/conversion', 'POST', requestBody, function (err, res) {
    t.error(err, 'No error')
    t.equal(res.statusCode, 200, 'Should return 200')
    t.ok(res.body.success, 'Should return success true')
    t.end()
  })
}) 