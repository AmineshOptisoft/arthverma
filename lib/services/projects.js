const db = require('../db')
const currencyService = require('./currency')

// Helper function to execute SELECT queries based on environment
function executeQuery (query, values = []) {
  return new Promise((resolve, reject) => {
    if (process.env.NODE_ENV === 'development') {
      // MySQL environment
      db.query(query, values, (err, results) => {
        if (err) return reject(err)
        resolve(results)
      })
    } else {
      // SQLite environment
      db.serialize(() => {
        db.all(query, values, (err, rows) => {
          if (err) return reject(err)
          resolve(rows)
        })
      })
    }
  })
}

// Helper function to execute INSERT/UPDATE/DELETE queries based on environment
function executeWriteQuery (query, values = []) {
  return new Promise((resolve, reject) => {
    if (process.env.NODE_ENV === 'development') {
      // MySQL environment
      db.query(query, values, (err, results) => {
        if (err) return reject(err)
        resolve(results)
      })
    } else {
      // SQLite environment
      db.serialize(() => {
        db.run(query, values, function (err) {
          if (err) return reject(err)
          resolve(this)
        })
      })
    }
  })
}

// Helper function to get project by ID
async function getProjectById (projectId) {
  const query = 'SELECT * FROM projects WHERE projectId = ?'
  const results = await executeQuery(query, [projectId])
  return results.length > 0 ? results[0] : null
}

// Helper function to get projects by name and year
async function getProjectsByNameAndYear (projectName, year) {
  const query = 'SELECT * FROM projects WHERE projectName = ? AND year = ?'
  const results = await executeQuery(query, [projectName, year])
  return results
}

// Helper function to validate project data
function validateProjectData (data) {
  const required = ['projectId', 'projectName', 'year', 'currency', 'initialBudgetLocal', 'budgetUsd', 'initialScheduleEstimateMonths', 'adjustedScheduleEstimateMonths', 'contingencyRate', 'escalationRate', 'finalBudgetUsd']
  
  for (const field of required) {
    if (data[field] === undefined || data[field] === null) {
      throw new Error(`Missing required field: ${field}`)
    }
  }
  
  return true
}

// Get project budget by ID
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

// Get project budget with currency conversion
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

// Create new project
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
    
    const query = `
      INSERT INTO projects (
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
    
    await executeWriteQuery(query, values)
    
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

// Update project
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
    
    const query = `
      UPDATE projects SET 
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
    
    await executeWriteQuery(query, values)
    
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

// Delete project
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
    
    const query = 'DELETE FROM projects WHERE projectId = ?'
    await executeWriteQuery(query, [projectId])
    
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

module.exports = {
  getProjectBudgetById,
  getProjectBudgetWithCurrency,
  createProject,
  updateProject,
  deleteProject
} 