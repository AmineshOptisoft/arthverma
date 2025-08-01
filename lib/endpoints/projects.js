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

// POST /api/project/budget
router.post('/budget', (req, res) => {
  const {
    projectId,
    projectName,
    year,
    currency,
    initialBudgetLocal,
    budgetUsd,
    initialScheduleEstimateMonths,
    adjustedScheduleEstimateMonths,
    contingencyRate,
    escalationRate,
    finalBudgetUsd
  } = req.body

  // Validate required fields
  if (!projectId || !projectName || !year || !currency || 
      initialBudgetLocal === undefined || budgetUsd === undefined || 
      initialScheduleEstimateMonths === undefined || adjustedScheduleEstimateMonths === undefined ||
      contingencyRate === undefined || escalationRate === undefined || finalBudgetUsd === undefined) {
    return res.status(400).json(errorResponse('Missing required fields'))
  }

  if (isNaN(projectId) || projectId <= 0) {
    return res.status(400).json(errorResponse('Invalid project ID'))
  }

  if (isNaN(year) || year <= 0) {
    return res.status(400).json(errorResponse('Invalid year'))
  }

  // Check if project already exists and insert with transaction support
  db.beginTransaction((err) => {
    if (err) {
      return res.status(500).json(errorResponse('Database error'))
    }

    const checkQuery = 'SELECT projectId FROM project WHERE projectId = ?'
    db.query(checkQuery, [projectId], (err, results) => {
      if (err) {
        return db.rollback(() => {
          res.status(500).json(errorResponse('Database error'))
        })
      }

      if (results.length > 0) {
        return db.rollback(() => {
          res.status(409).json(errorResponse('Project with this ID already exists'))
        })
      }

      // Insert new project
      const insertQuery = `
        INSERT INTO project (
          projectId, projectName, year, currency, initialBudgetLocal,
          budgetUsd, initialScheduleEstimateMonths, adjustedScheduleEstimateMonths,
          contingencyRate, escalationRate, finalBudgetUsd
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `
      
      const values = [
        projectId, projectName, year, currency, initialBudgetLocal,
        budgetUsd, initialScheduleEstimateMonths, adjustedScheduleEstimateMonths,
        contingencyRate, escalationRate, finalBudgetUsd
      ]

      db.query(insertQuery, values, (err, result) => {
        if (err) {
          return db.rollback(() => {
            res.status(500).json(errorResponse('Database error'))
          })
        }

        db.commit((err) => {
          if (err) {
            return db.rollback(() => {
              res.status(500).json(errorResponse('Database error'))
            })
          }

          res.status(201).json(successResponse({
            projectId,
            projectName,
            year,
            currency,
            initialBudgetLocal,
            budgetUsd,
            initialScheduleEstimateMonths,
            adjustedScheduleEstimateMonths,
            contingencyRate,
            escalationRate,
            finalBudgetUsd
          }))
        })
      })
    })
  })
})

// PUT /api/project/budget/:id
router.put('/budget/:id', (req, res) => {
  const projectId = parseInt(req.params.id)
  const {
    projectName,
    year,
    currency,
    initialBudgetLocal,
    budgetUsd,
    initialScheduleEstimateMonths,
    adjustedScheduleEstimateMonths,
    contingencyRate,
    escalationRate,
    finalBudgetUsd
  } = req.body

  // Validate project ID
  if (isNaN(projectId) || projectId <= 0) {
    return res.status(400).json(errorResponse('Invalid project ID'))
  }

  // Validate required fields
  if (!projectName || !year || !currency || 
      initialBudgetLocal === undefined || budgetUsd === undefined || 
      initialScheduleEstimateMonths === undefined || adjustedScheduleEstimateMonths === undefined ||
      contingencyRate === undefined || escalationRate === undefined || finalBudgetUsd === undefined) {
    return res.status(400).json(errorResponse('Missing required fields'))
  }

  if (isNaN(year) || year <= 0) {
    return res.status(400).json(errorResponse('Invalid year'))
  }

  // Check if project exists
  const checkQuery = 'SELECT projectId FROM project WHERE projectId = ?'
  db.query(checkQuery, [projectId], (err, results) => {
    if (err) {
      return res.status(500).json(errorResponse('Database error'))
    }

    if (results.length === 0) {
      return res.status(404).json(errorResponse('Project not found'))
    }

    // Update project
    const updateQuery = `
      UPDATE project SET 
        projectName = ?, year = ?, currency = ?, initialBudgetLocal = ?,
        budgetUsd = ?, initialScheduleEstimateMonths = ?, adjustedScheduleEstimateMonths = ?,
        contingencyRate = ?, escalationRate = ?, finalBudgetUsd = ?
      WHERE projectId = ?
    `
    
    const values = [
      projectName, year, currency, initialBudgetLocal,
      budgetUsd, initialScheduleEstimateMonths, adjustedScheduleEstimateMonths,
      contingencyRate, escalationRate, finalBudgetUsd, projectId
    ]

    db.query(updateQuery, values, (err, result) => {
      if (err) {
        return res.status(500).json(errorResponse('Database error'))
      }

      res.status(200).json(successResponse({
        projectId,
        projectName,
        year,
        currency,
        initialBudgetLocal,
        budgetUsd,
        initialScheduleEstimateMonths,
        adjustedScheduleEstimateMonths,
        contingencyRate,
        escalationRate,
        finalBudgetUsd
      }))
    })
  })
})

// DELETE /api/project/budget/:id
router.delete('/budget/:id', (req, res) => {
  const projectId = parseInt(req.params.id)

  // Validate project ID
  if (isNaN(projectId) || projectId <= 0) {
    return res.status(400).json(errorResponse('Invalid project ID'))
  }

  // Check if project exists
  const checkQuery = 'SELECT projectId FROM project WHERE projectId = ?'
  db.query(checkQuery, [projectId], (err, results) => {
    if (err) {
      return res.status(500).json(errorResponse('Database error'))
    }

    if (results.length === 0) {
      return res.status(404).json(errorResponse('Project not found'))
    }

    // Delete project
    const deleteQuery = 'DELETE FROM project WHERE projectId = ?'
    db.query(deleteQuery, [projectId], (err, result) => {
      if (err) {
        return res.status(500).json(errorResponse('Database error'))
      }

      res.status(200).json(successResponse({
        message: 'Project deleted successfully',
        projectId
      }))
    })
  })
})

module.exports = router 