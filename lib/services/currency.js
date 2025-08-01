const https = require('https')
const config = require('../../config')

function convertCurrency (amount, fromCurrency, toCurrency, year, month, day) {
  return new Promise((resolve, reject) => {
    const apiKey = config.currency.apiKey
    if (!apiKey) {
      return reject(new Error('Currency API key not configured'))
    }

    // Validate inputs
    if (!amount || amount <= 0) {
      return reject(new Error('Invalid amount: must be greater than 0'))
    }
    if (!fromCurrency || !toCurrency) {
      return reject(new Error('Invalid currency codes'))
    }
    if (!year || !month || !day) {
      return reject(new Error('Invalid date parameters'))
    }

    // Format date components
    const formattedMonth = month.toString().padStart(2, '0')
    const formattedDay = day.toString().padStart(2, '0')
    
    const url = `https://v6.exchangerate-api.com/v6/${apiKey}/history/${fromCurrency}/${year}/${formattedMonth}/${formattedDay}/${amount}`
    
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
              originalAmount: amount,
              originalCurrency: fromCurrency,
              convertedAmount: response.conversion_result.converted_amount,
              targetCurrency: toCurrency,
              conversionRate: response.conversion_rate,
              date: `${year}-${formattedMonth}-${formattedDay}`
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
  })
}

function convertToTTD (amount, fromCurrency, year, month, day) {
  return convertCurrency(amount, fromCurrency, 'TTD', year, month, day)
}

module.exports = {
  convertCurrency,
  convertToTTD
} 