const test = require('tape')
const currencyService = require('../lib/services/currency')

test('TTD Conversion Specific Tests', (t) => {
  t.test('Test USD to TTD conversion accuracy', (st) => {
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

  t.test('Test conversion validation and error handling', (st) => {
    currencyService.convertToTTD(0, 'USD', 2024, 1, 1)
      .then(() => {
        t.fail('Should reject invalid amount for TTD conversion')
        t.end()
      })
      .catch(err => {
        t.ok(err.message.includes('Invalid amount'), 'Should reject invalid amount for TTD conversion')
        t.end()
      })
  })

  t.test('Test different source currencies to TTD', (st) => {
    const testAmount = 100
    const currencies = ['USD', 'EUR', 'GBP']
    const year = 2024
    const month = 1
    const day = 1

    let completedTests = 0
    currencies.forEach(currency => {
      currencyService.convertToTTD(testAmount, currency, year, month, day)
        .then(result => {
          st.ok(result.success, `Should convert ${currency} to TTD successfully`)
          st.equal(result.originalCurrency, currency, `Should have correct original currency: ${currency}`)
          st.equal(result.targetCurrency, 'TTD', 'Should have TTD as target currency')
          st.ok(result.convertedAmount > 0, `Should have positive converted amount for ${currency}`)
          st.ok(result.conversionRate > 0, `Should have positive conversion rate for ${currency}`)
          
          completedTests++
          if (completedTests === currencies.length) {
            st.end()
          }
        })
        .catch(error => {
          st.fail(`Should not throw error for ${currency}: ${error.message}`)
          completedTests++
          if (completedTests === currencies.length) {
            st.end()
          }
        })
    })
  })

  t.test('Test conversion with various amount ranges', (st) => {
    const amounts = [1, 10, 100, 1000, 10000]
    const fromCurrency = 'USD'
    const year = 2024
    const month = 1
    const day = 1

    let completedTests = 0
    amounts.forEach(amount => {
      currencyService.convertToTTD(amount, fromCurrency, year, month, day)
        .then(result => {
          st.ok(result.success, `Should convert amount ${amount} successfully`)
          st.equal(result.originalAmount, amount, `Should have correct original amount: ${amount}`)
          st.ok(result.convertedAmount > 0, `Should have positive converted amount for ${amount}`)
          
          // Verify conversion rate consistency
          const calculatedRate = result.convertedAmount / result.originalAmount
          st.ok(Math.abs(calculatedRate - result.conversionRate) < 0.01, 'Conversion rate should be consistent')
          
          completedTests++
          if (completedTests === amounts.length) {
            st.end()
          }
        })
        .catch(error => {
          st.fail(`Should not throw error for amount ${amount}: ${error.message}`)
          completedTests++
          if (completedTests === amounts.length) {
            st.end()
          }
        })
    })
  })

  t.test('Test historical TTD conversion rates', (st) => {
    const testAmount = 1000
    const fromCurrency = 'USD'
    const dates = [
      { year: 2020, month: 1, day: 1 },
      { year: 2021, month: 6, day: 15 },
      { year: 2022, month: 12, day: 31 },
      { year: 2023, month: 7, day: 4 },
      { year: 2024, month: 1, day: 1 }
    ]

    let completedTests = 0
    dates.forEach(date => {
      currencyService.convertToTTD(testAmount, fromCurrency, date.year, date.month, date.day)
        .then(result => {
          st.ok(result.success, `Should convert for date ${date.year}-${date.month}-${date.day}`)
          st.equal(result.originalAmount, testAmount, 'Should have correct original amount')
          st.equal(result.targetCurrency, 'TTD', 'Should have TTD as target currency')
          st.ok(result.convertedAmount > 0, 'Should have positive converted amount')
          st.ok(result.conversionRate > 0, 'Should have positive conversion rate')
          
          completedTests++
          if (completedTests === dates.length) {
            st.end()
          }
        })
        .catch(error => {
          st.fail(`Should not throw error for date ${date.year}-${date.month}-${date.day}: ${error.message}`)
          completedTests++
          if (completedTests === dates.length) {
            st.end()
          }
        })
    })
  })
}) 