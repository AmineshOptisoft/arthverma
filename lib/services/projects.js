// External dependencies
const db = require('../db')
const currencyService = require('./currency')

// Constants
const REQUIRED_FIELDS = ['projectId', 'projectName', 'year', 'currency', 'initialBudgetLocal', 'budgetUsd', 'initialScheduleEstimateMonths', 'adjustedScheduleEstimateMonths', 'contingencyRate', 'escalationRate', 'finalBudgetUsd']

// Exports
module.exports = {
  getProjectBudgetById,
  getProjectBudgetWithCurrency,
  createProject,
  updateProject,
  deleteProject
}

// High-level functions (main API functions)
async function getProjectBudgetById (projectId) {
  try {
    const project = await getProjectById(projectId)

    if (!project) {
      return {
        success: false,
        data: null,
        statusCode: 404,
        message: 'Project not found'
      }
    }

    return {
      success: true,
      data: project,
      statusCode: 200
    }
  } catch (error) {
    return {
      success: false,
      data: null,
      statusCode: 500,
      message: error.message
    }
  }
}

async function getProjectBudgetWithCurrency (year, projectName, currency) {
  try {
    const projects = await getProjectsByNameAndYear(projectName, year)

    if (projects.length === 0) {
      return {
        success: false,
        data: [],
        statusCode: 404,
        message: 'No projects found with specified name and year'
      }
    }

    const results = []

    for (const project of projects) {
      let finalBudgetTtd = null

      if (currency === 'TTD') {
        try {
          // Use current date for conversion (you might want to use project date)
          const now = new Date()
          const conversion = await currencyService.convertToTTD(
            project.finalBudgetUsd,
            'USD',
            now.getFullYear(),
            now.getMonth() + 1,
            now.getDate()
          )
          finalBudgetTtd = conversion.convertedAmount
        } catch (conversionError) {
          console.error('Currency conversion failed:', conversionError.message)
          // Continue without conversion
        }
      }

      const result = {
        ...project,
        finalBudgetTtd
      }

      results.push(result)
    }

    return {
      success: true,
      data: results,
      statusCode: 200
    }
  } catch (error) {
    return {
      success: false,
      data: [],
      statusCode: 500,
      message: error.message
    }
  }
}

async function createProject (projectData) {
  try {
    validateProjectData(projectData)

    // Check if project already exists
    const existingProject = await getProjectById(projectData.projectId)
    if (existingProject) {
      return {
        success: false,
        data: null,
        statusCode: 409,
        message: 'Project with this ID already exists'
      }
    }

    const { query, values } = buildInsertQuery(projectData)
    await executeOptimizedWriteQuery(query, values)

    const createdProject = await getProjectById(projectData.projectId)

    return {
      success: true,
      data: createdProject,
      statusCode: 201
    }
  } catch (error) {
    return {
      success: false,
      data: null,
      statusCode: 400,
      message: error.message
    }
  }
}

async function updateProject (projectId, updateData) {
  try {
    // Check if project exists
    const existingProject = await getProjectById(projectId)
    if (!existingProject) {
      return {
        success: false,
        data: null,
        statusCode: 404,
        message: 'Project not found'
      }
    }

    const { query, values } = buildUpdateQuery(projectId, updateData)
    await executeOptimizedWriteQuery(query, values)

    const updatedProject = await getProjectById(projectId)

    return {
      success: true,
      data: updatedProject,
      statusCode: 200
    }
  } catch (error) {
    return {
      success: false,
      data: null,
      statusCode: 400,
      message: error.message
    }
  }
}

async function deleteProject (projectId) {
  try {
    // Check if project exists
    const existingProject = await getProjectById(projectId)
    if (!existingProject) {
      return {
        success: false,
        data: null,
        statusCode: 404,
        message: 'Project not found'
      }
    }

    const query = 'DELETE FROM project WHERE projectId = ?'
    await executeOptimizedWriteQuery(query, [projectId])

    return {
      success: true,
      data: { projectId },
      statusCode: 200,
      message: 'Project deleted successfully'
    }
  } catch (error) {
    return {
      success: false,
      data: null,
      statusCode: 500,
      message: error.message
    }
  }
}

// Optimized query functions using connection pooling
function executeOptimizedQuery (query, values = []) {
  return db.executeOptimizedQuery(query, values)
}

function executeOptimizedWriteQuery (query, values = []) {
  return db.executeOptimizedWriteQuery(query, values)
}

async function getProjectById (projectId) {
  const query = 'SELECT * FROM project WHERE projectId = ?'
  const results = await executeOptimizedQuery(query, [projectId])
  return results.length > 0 ? results[0] : null
}

async function getProjectsByNameAndYear (projectName, year) {
  const query = 'SELECT * FROM project WHERE projectName = ? AND year = ?'
  const results = await executeOptimizedQuery(query, [projectName, year])
  return results
}

function validateProjectData (data) {
  for (const field of REQUIRED_FIELDS) {
    if (data[field] === undefined || data[field] === null) {
      throw new Error(`Missing required field: ${field}`)
    }
  }

  // Additional validation for numeric fields
  if (isNaN(data.projectId) || data.projectId <= 0) {
    throw new Error('Invalid projectId: must be a positive number')
  }

  if (isNaN(data.year) || data.year < 1900 || data.year > 2100) {
    throw new Error('Invalid year: must be between 1900 and 2100')
  }

  if (isNaN(data.initialBudgetLocal) || data.initialBudgetLocal < 0) {
    throw new Error('Invalid initialBudgetLocal: must be a non-negative number')
  }

  if (isNaN(data.budgetUsd) || data.budgetUsd < 0) {
    throw new Error('Invalid budgetUsd: must be a non-negative number')
  }

  if (isNaN(data.finalBudgetUsd) || data.finalBudgetUsd < 0) {
    throw new Error('Invalid finalBudgetUsd: must be a non-negative number')
  }

  return true
}

function buildInsertQuery (projectData) {
  const query = `
    INSERT INTO project (
      projectId, projectName, year, currency, initialBudgetLocal, 
      budgetUsd, initialScheduleEstimateMonths, adjustedScheduleEstimateMonths, 
      contingencyRate, escalationRate, finalBudgetUsd
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
  `

  const values = [
    projectData.projectId,
    projectData.projectName,
    projectData.year,
    projectData.currency,
    projectData.initialBudgetLocal,
    projectData.budgetUsd,
    projectData.initialScheduleEstimateMonths,
    projectData.adjustedScheduleEstimateMonths,
    projectData.contingencyRate,
    projectData.escalationRate,
    projectData.finalBudgetUsd
  ]

  return { query, values }
}

function buildUpdateQuery (projectId, updateData) {
  const query = `
    UPDATE project SET 
      projectName = ?, year = ?, currency = ?, initialBudgetLocal = ?,
      budgetUsd = ?, initialScheduleEstimateMonths = ?, adjustedScheduleEstimateMonths = ?,
      contingencyRate = ?, escalationRate = ?, finalBudgetUsd = ?
    WHERE projectId = ?
  `

  const values = [
    updateData.projectName,
    updateData.year,
    updateData.currency,
    updateData.initialBudgetLocal,
    updateData.budgetUsd,
    updateData.initialScheduleEstimateMonths,
    updateData.adjustedScheduleEstimateMonths,
    updateData.contingencyRate,
    updateData.escalationRate,
    updateData.finalBudgetUsd,
    projectId
  ]

  return { query, values }
}
