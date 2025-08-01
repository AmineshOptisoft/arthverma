const express = require('express')
const router = express.Router()

// Currency conversion endpoint
router.post('/conversion', async (req, res) => {
  try {
    const { baseCurrency, targetCurrency, amount } = req.body

    // Validate required fields
    if (!baseCurrency || !targetCurrency || !amount) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: baseCurrency, targetCurrency, amount'
      })
    }

    // Validate currency codes (basic validation)
    if (typeof baseCurrency !== 'string' || typeof targetCurrency !== 'string') {
      return res.status(400).json({
        success: false,
        error: 'Currency codes must be strings'
      })
    }

    // Validate amount
    if (typeof amount !== 'number' || amount <= 0) {
      return res.status(400).json({
        success: false,
        error: 'Amount must be a positive number'
      })
    }

    // Mock conversion for testing (in real app, this would call ExchangeRate API)
    const conversionRates = {
      USD: { TTD: 6.8, EUR: 0.85, GBP: 0.73 },
      EUR: { TTD: 8.0, USD: 1.18, GBP: 0.86 },
      TTD: { USD: 0.15, EUR: 0.125, GBP: 0.107 },
      GBP: { USD: 1.37, EUR: 1.16, TTD: 9.32 }
    }

    const rate = conversionRates[baseCurrency]?.[targetCurrency]
    
    if (!rate) {
      return res.status(400).json({
        success: false,
        error: `Conversion from ${baseCurrency} to ${targetCurrency} not supported`
      })
    }

    const convertedAmount = amount * rate

    res.status(200).json({
      success: true,
      data: {
        baseCurrency,
        targetCurrency,
        amount,
        convertedAmount: Math.round(convertedAmount * 100) / 100,
        rate
      }
    })

  } catch (error) {
    console.error('Currency conversion error:', error)
    res.status(500).json({
      success: false,
      error: 'Internal server error'
    })
  }
})

module.exports = router 