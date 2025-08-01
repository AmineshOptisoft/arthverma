// External dependencies
const https = require('https')
const config = require('../../config')

// Exports
module.exports = {
  convertCurrency,
  convertToTTD
}

// High-level functions
function convertCurrency (amount, fromCurrency, toCurrency, year, month, day) {
  return new Promise((resolve, reject) => {
    try {
      validateConversionInputs(amount, fromCurrency, toCurrency, year, month, day)
      const apiKey = getApiKey()
      const url = buildConversionUrl(apiKey, fromCurrency, toCurrency, year, month, day, amount)

      makeConversionRequest(url, resolve, reject)
    } catch (error) {
      reject(error)
    }
  })
}

function convertToTTD (amount, fromCurrency, year, month, day) {
  return convertCurrency(amount, fromCurrency, 'TTD', year, month, day)
}

// Utility functions
function validateConversionInputs (amount, fromCurrency, toCurrency, year, month, day) {
  if (!amount || amount <= 0) {
    throw new Error('Invalid amount: must be greater than 0')
  }
  if (!fromCurrency || !toCurrency) {
    throw new Error('Invalid currency codes')
  }
  if (!year || !month || !day) {
    throw new Error('Invalid date parameters')
  }
}

function getApiKey () {
  const apiKey = config.currency.apiKey
  if (!apiKey) {
    throw new Error('Currency API key not configured')
  }
  return apiKey
}

function buildConversionUrl (apiKey, fromCurrency, toCurrency, year, month, day, amount) {
  const formattedMonth = month.toString().padStart(2, '0')
  const formattedDay = day.toString().padStart(2, '0')

  return `https://v6.exchangerate-api.com/v6/${apiKey}/history/${fromCurrency}/${year}/${formattedMonth}/${formattedDay}/${amount}`
}

function makeConversionRequest (url, resolve, reject) {
  const request = https.get(url, (res) => {
    let data = ''

    res.on('data', (chunk) => {
      data += chunk
    })

    res.on('end', () => {
      try {
        const response = JSON.parse(data)

        if (response.result === 'success') {
          resolve({
            success: true,
            originalAmount: response.original_amount,
            originalCurrency: response.base_currency,
            convertedAmount: response.conversion_result.converted_amount,
            targetCurrency: response.target_currency,
            conversionRate: response.conversion_rate,
            date: response.date
          })
        } else {
          reject(new Error(`API Error: ${response.error_type || 'Unknown error'}`))
        }
      } catch (error) {
        reject(new Error(`Failed to parse API response: ${error.message}`))
      }
    })
  })

  // Add timeout and retry logic
  request.setTimeout(10000, () => {
    request.destroy()
    reject(new Error('Request timeout'))
  })

  request.on('error', (error) => {
    reject(new Error(`Network error: ${error.message}`))
  })
}
