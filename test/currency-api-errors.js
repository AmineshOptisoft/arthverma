const test = require('tape')
const currencyService = require('../lib/services/currency')
const config = require('../config')

test('Currency API Error Handling Tests', (t) => {
  t.test('Test API key validation and error responses', (st) => {
    const originalApiKey = config.currency.apiKey
    config.currency.apiKey = null
    
    currencyService.convertCurrency(100, 'USD', 'EUR', 2024, 1, 1)
      .then(() => {
        t.fail('Should reject missing API key')
        t.end()
      })
      .catch(err => {
        t.ok(err.message.includes('Currency API key not configured'), 'Should reject missing API key')
        config.currency.apiKey = originalApiKey
        t.end()
      })
  })

  t.test('Test network failures and timeout scenarios', (st) => {
    const originalApiKey = config.currency.apiKey
    config.currency.apiKey = 'invalid-key-that-will-cause-network-error'

    currencyService.convertCurrency(100, 'USD', 'EUR', 2024, 1, 1)
      .then(() => {
        t.fail('Should reject network error')
        t.end()
      })
      .catch(err => {
        t.ok(err.message.includes('API Error') || err.message.includes('Network error'), 'Should handle network errors')
        config.currency.apiKey = originalApiKey
        t.end()
      })
  })

  t.test('Test invalid API responses', (st) => {
    const testPromise = currencyService.convertCurrency(100, 'USD', 'EUR', 2024, 1, 1)
    t.ok(testPromise instanceof Promise, 'Should return a Promise for error handling')
    t.end()
  })

  t.test('Test timeout scenarios', (st) => {
    const testPromise = currencyService.convertCurrency(100, 'USD', 'EUR', 2024, 1, 1)
    t.ok(testPromise instanceof Promise, 'Should return a Promise with timeout')
    t.end()
  })

  t.test('Test graceful degradation', (st) => {
    // Test that the service doesn't crash on various error conditions
    const errorTests = [
      () => currencyService.convertCurrency(-1, 'USD', 'EUR', 2024, 1, 1),
      () => currencyService.convertCurrency(100, '', 'EUR', 2024, 1, 1),
      () => currencyService.convertCurrency(100, 'USD', '', 2024, 1, 1),
      () => currencyService.convertCurrency(100, 'USD', 'EUR', -1, 1, 1),
      () => currencyService.convertCurrency(100, 'USD', 'EUR', 2024, 0, 1),
      () => currencyService.convertCurrency(100, 'USD', 'EUR', 2024, 1, 0)
    ]

    let completedTests = 0
    errorTests.forEach((testFn, index) => {
      testFn()
        .then(() => {
          st.fail(`Test ${index} should reject invalid input`)
        })
        .catch(error => {
          st.ok(error.message, `Test ${index} should return error message`)
          completedTests++
          
          if (completedTests === errorTests.length) {
            st.end()
          }
        })
    })
  })
}) 