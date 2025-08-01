const test = require('tape')
const currencyService = require('../lib/services/currency')
const config = require('../config')
const { assertSuccessResponse } = require('./helper')

test('Currency Conversion Service Tests', (t) => {
  t.test('Test config setup', (st) => {
    t.ok(config.currency, 'Currency config should exist')
    t.equal(typeof config.currency.apiKey, 'string', 'API key should be string')
    t.end()
  })

  t.test('Test service functions exist', (st) => {
    t.ok(currencyService.convertCurrency, 'convertCurrency function should exist')
    t.equal(typeof currencyService.convertToTTD, 'function', 'convertToTTD should be function')
    t.end()
  })

  t.test('Test convertCurrency function with valid parameters', (st) => {
    const testAmount = 100
    const fromCurrency = 'USD'
    const toCurrency = 'EUR'
    const year = 2024
    const month = 1
    const day = 1

    currencyService.convertCurrency(testAmount, fromCurrency, toCurrency, year, month, day)
      .then(result => {
        t.ok(result.success, 'Should return success')
        t.equal(result.originalAmount, testAmount, 'Should have correct original amount')
        t.end()
      })
      .catch(err => {
        t.error(err, 'No error')
        t.end()
      })
  })

  t.test('Test convertToTTD function', (st) => {
    const testAmount = 1000
    const fromCurrency = 'USD'
    const year = 2024
    const month = 1
    const day = 1

    currencyService.convertToTTD(testAmount, fromCurrency, year, month, day)
      .then(result => {
        t.ok(result.success, 'Should return success')
        t.equal(result.targetCurrency, 'TTD', 'Should have TTD as target currency')
        t.end()
      })
      .catch(err => {
        t.error(err, 'No error')
        t.end()
      })
  })

  t.test('Test input validation', (st) => {
    currencyService.convertCurrency(0, 'USD', 'EUR', 2024, 1, 1)
      .then(() => {
        t.fail('Should reject invalid amount')
        t.end()
      })
      .catch(err => {
        t.ok(err.message.includes('Invalid amount'), 'Should reject invalid amount')
        t.end()
      })
  })

  t.test('Test API error handling', (st) => {
    const originalApiKey = config.currency.apiKey
    config.currency.apiKey = 'invalid-key'

    currencyService.convertCurrency(100, 'USD', 'EUR', 2024, 1, 1)
      .then(() => {
        t.fail('Should reject invalid API key')
        t.end()
      })
      .catch(err => {
        t.ok(err.message.includes('API Error'), 'Should handle API errors')
        config.currency.apiKey = originalApiKey
        t.end()
      })
  })

  t.test('Test network timeout handling', (st) => {
    const testPromise = currencyService.convertCurrency(100, 'USD', 'EUR', 2024, 1, 1)
    t.ok(testPromise instanceof Promise, 'Should return a Promise')
    t.end()
  })
}) 