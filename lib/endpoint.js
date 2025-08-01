// External dependencies
const express = require('express')

// Internal dependencies
const projectsService = require('./services/projects')

// Constants
const endpoints = express.Router()

// Exports
module.exports = endpoints

// Route handlers
endpoints.get('/ok', (req, res) => {
  res.status(200).json({ ok: true })
})

// GET /api/project/budget/:id - Get project budget by ID
endpoints.get('/project/budget/:id', async (req, res) => {
  try {
    const projectId = parseInt(req.params.id)

    if (isNaN(projectId)) {
      return res.status(400).json({
        success: false,
        data: null,
        statusCode: 400,
        message: 'Invalid project ID'
      })
    }

    const result = await projectsService.getProjectBudgetById(projectId)
    res.status(result.statusCode).json(result)
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      statusCode: 500,
      message: error.message
    })
  }
})

// POST /api/project/budget/currency - Get project budget with currency conversion
endpoints.post('/project/budget/currency', async (req, res) => {
  try {
    const { year, projectName, currency } = req.body

    // Validate required fields
    if (!year || !projectName || !currency) {
      return res.status(400).json({
        success: false,
        data: [],
        statusCode: 400,
        message: 'Missing required fields: year, projectName, currency'
      })
    }

    if (isNaN(year) || year < 1900 || year > 2100) {
      return res.status(400).json({
        success: false,
        data: [],
        statusCode: 400,
        message: 'Invalid year value'
      })
    }

    const result = await projectsService.getProjectBudgetWithCurrency(year, projectName, currency)
    res.status(result.statusCode).json(result)
  } catch (error) {
    res.status(500).json({
      success: false,
      data: [],
      statusCode: 500,
      message: error.message
    })
  }
})

// POST /api/project/budget - Create new project
endpoints.post('/project/budget', async (req, res) => {
  try {
    const projectData = req.body

    const result = await projectsService.createProject(projectData)
    res.status(result.statusCode).json(result)
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      statusCode: 500,
      message: error.message
    })
  }
})

// PUT /api/project/budget/:id - Update project
endpoints.put('/project/budget/:id', async (req, res) => {
  try {
    const projectId = parseInt(req.params.id)
    const updateData = req.body

    if (isNaN(projectId)) {
      return res.status(400).json({
        success: false,
        data: null,
        statusCode: 400,
        message: 'Invalid project ID'
      })
    }

    const result = await projectsService.updateProject(projectId, updateData)
    res.status(result.statusCode).json(result)
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      statusCode: 500,
      message: error.message
    })
  }
})

// DELETE /api/project/budget/:id - Delete project
endpoints.delete('/project/budget/:id', async (req, res) => {
  try {
    const projectId = parseInt(req.params.id)

    if (isNaN(projectId)) {
      return res.status(400).json({
        success: false,
        data: null,
        statusCode: 400,
        message: 'Invalid project ID'
      })
    }

    const result = await projectsService.deleteProject(projectId)
    res.status(result.statusCode).json(result)
  } catch (error) {
    res.status(500).json({
      success: false,
      data: null,
      statusCode: 500,
      message: error.message
    })
  }
})
