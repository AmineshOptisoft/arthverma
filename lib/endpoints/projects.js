const express = require('express')
const db = require('../db')
const currencyService = require('../services/currency')
const { successResponse, errorResponse, standardizeProjectResponse } = require('../utils/response')

const router = express.Router()

// GET /api/project/budget/:id
router.get('/budget/:id', (req, res) => {
  const projectId = parseInt(req.params.id)
  
  if (isNaN(projectId) || projectId <= 0) {
    return res.status(400).json(errorResponse('Invalid project ID'))
  }

  const query = 'SELECT * FROM project WHERE projectId = ?'
  
  db.query(query, [projectId], (err, results) => {
    if (err) {
      return res.status(500).json(errorResponse('Database error'))
    }

    if (results.length === 0) {
      return res.status(404).json(errorResponse('Project not found'))
    }

    const project = results[0]
    res.status(200).json(standardizeProjectResponse(project))
  })
})

// POST /api/project/budget/currency
router.post('/budget/currency', (req, res) => {
  const { year, projectName, currency } = req.body

  // Validate required fields
  if (!year || !projectName || !currency) {
    return res.status(400).json(errorResponse('Missing required fields: year, projectName, currency'))
  }

  if (isNaN(year) || year <= 0) {
    return res.status(400).json(errorResponse('Invalid year'))
  }

  // Find project by name and year
  const query = 'SELECT * FROM project WHERE projectName = ? AND year = ?'
  
  db.query(query, [projectName, year], (err, results) => {
    if (err) {
      return res.status(500).json(errorResponse('Database error'))
    }

    if (results.length === 0) {
      return res.status(404).json(errorResponse('Project not found'))
    }

    const project = results[0]
    
    // Convert to requested currency
    const convertToRequestedCurrency = async () => {
      try {
        // For now, we'll convert USD to the requested currency
        // In a real implementation, you'd convert from the project's original currency
        const conversion = await currencyService.convertCurrency(
          project.finalBudgetUsd,
          'USD',
          currency,
          project.year,
          1, // January
          1  // 1st day
        )

                 return {
           success: true,
           data: [{
             ...standardizeProjectResponse(project),
             finalBudgetTtd: currency === 'TTD' ? conversion.convertedAmount : null
           }]
         }
             } catch (error) {
         return errorResponse(`Currency conversion failed: ${error.message}`)
       }
    }

    convertToRequestedCurrency()
      .then(result => {
        if (result.success) {
          res.status(200).json(result)
        } else {
          res.status(400).json(result)
        }
      })
      .catch(error => {
        res.status(500).json(errorResponse(`Currency conversion error: ${error.message}`))
      })
  })
})

module.exports = router 