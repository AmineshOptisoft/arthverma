process.env.NODE_ENV = 'test'

const test = require('tape')
const servertest = require('servertest')
const http = require('http')
const app = require('../lib/app')
const budgetService = require('../lib/services/budget')
const dbSetup = require('../lib/db-setup')
const { createTestRequest, createGetRequest, createDeleteRequest } = require('./helper')

const server = http.createServer(app)

// Initialize database before tests
test('Database Setup', function (t) {
  dbSetup.initializeTestDatabase((err) => {
    t.error(err, 'No error during database initialization')
    
    // Verify database is working
    const db = require('../lib/db')
    db.get('SELECT COUNT(*) as count FROM project', (err, result) => {
      t.error(err, 'No error checking project count')
      t.ok(result.count > 0, 'Should have projects in database')
      t.end()
    })
  })
})

// Test data
const testProject = {
  projectId: 99999,
  projectName: 'Test Project',
  year: 2024,
  currency: 'USD',
  initialBudgetLocal: 100000,
  budgetUsd: 100000,
  initialScheduleEstimateMonths: 12,
  adjustedScheduleEstimateMonths: 12,
  contingencyRate: 2.0,
  escalationRate: 3.0,
  finalBudgetUsd: 105000
}

// Test GET /api/project/budget/:id
test('GET /api/project/budget/:id - successful retrieval', function (t) {
  createGetRequest(server, '/api/project/budget/38', function (err, res) {
    t.error(err, 'No error')
    t.equal(res.statusCode, 200, 'Should return 200')
    t.ok(res.body.data && res.body.data[0] && res.body.data[0].projectId, 'Should return project data')
    t.end()
  })
})

test('GET /api/project/budget/:id - project not found', function (t) {
  createGetRequest(server, '/api/project/budget/999999', function (err, res) {
    t.error(err, 'No error')
    t.equal(res.statusCode, 404, 'Should return 404')
    t.end()
  })
})

test('GET /api/project/budget/:id - invalid ID', function (t) {
  createGetRequest(server, '/api/project/budget/invalid', function (err, res) {
    t.error(err, 'No error')
    t.equal(res.statusCode, 400, 'Should return 400')
    t.end()
  })
})

// Test POST /api/project/budget/currency
test('POST /api/project/budget/currency - successful conversion', function (t) {
  const requestBody = {
    year: 2000,
    projectName: 'Peking roasted duck Chanel',
    currency: 'TTD'
  }

  createTestRequest(server, '/api/project/budget/currency', 'POST', requestBody, function (err, res) {
    console.log('Currency conversion response:', JSON.stringify(res.body, null, 2))
    t.error(err, 'No error')
    t.equal(res.statusCode, 200, 'Should return 200')
    t.ok(res.body.success, 'Should return success true')
    t.ok(res.body.data, 'Should return data array')
    t.end()
  })
})

test('POST /api/project/budget/currency - project not found', function (t) {
  const requestBody = {
    year: 2024,
    projectName: 'Non Existent Project',
    currency: 'TTD'
  }

  createTestRequest(server, '/api/project/budget/currency', 'POST', requestBody, function (err, res) {
    t.error(err, 'No error')
    t.equal(res.statusCode, 404, 'Should return 404')
    t.end()
  })
})

test('POST /api/project/budget/currency - missing fields', function (t) {
  const requestBody = {
    year: 2024,
    projectName: 'Test Project'
    // Missing currency
  }

  createTestRequest(server, '/api/project/budget/currency', 'POST', requestBody, function (err, res) {
    t.error(err, 'No error')
    t.equal(res.statusCode, 400, 'Should return 400')
    t.end()
  })
})

// Test POST /api/project/budget (create)
test('POST /api/project/budget - successful creation', function (t) {
  createTestRequest(server, '/api/project/budget', 'POST', testProject, function (err, res) {
    t.error(err, 'No error')
    t.equal(res.statusCode, 201, 'Should return 201')
    t.ok(res.body.success, 'Should return success true')
    t.end()
  })
})

test('POST /api/project/budget - duplicate project ID', function (t) {
  createTestRequest(server, '/api/project/budget', 'POST', testProject, function (err, res) {
    t.error(err, 'No error')
    t.equal(res.statusCode, 409, 'Should return 409')
    t.end()
  })
})

test('POST /api/project/budget - missing fields', function (t) {
  const invalidProject = {
    projectId: 99998,
    projectName: 'Test Project'
    // Missing required fields
  }

  createTestRequest(server, '/api/project/budget', 'POST', invalidProject, function (err, res) {
    t.error(err, 'No error')
    t.equal(res.statusCode, 400, 'Should return 400')
    t.end()
  })
})

// Test PUT /api/project/budget/:id (update)
test('PUT /api/project/budget/:id - successful update', function (t) {
  const updateData = {
    projectName: 'Updated Test Project',
    year: 2025,
    currency: 'EUR',
    initialBudgetLocal: 110000,
    budgetUsd: 110000,
    initialScheduleEstimateMonths: 13,
    adjustedScheduleEstimateMonths: 13,
    contingencyRate: 2.5,
    escalationRate: 3.5,
    finalBudgetUsd: 115000
  }

  createTestRequest(server, '/api/project/budget/99999', 'PUT', updateData, function (err, res) {
    t.error(err, 'No error')
    t.equal(res.statusCode, 200, 'Should return 200')
    t.ok(res.body.success, 'Should return success true')
    t.end()
  })
})

test('PUT /api/project/budget/:id - project not found', function (t) {
  const updateData = {
    projectName: 'Updated Test Project',
    year: 2025,
    currency: 'EUR',
    initialBudgetLocal: 110000,
    budgetUsd: 110000,
    initialScheduleEstimateMonths: 13,
    adjustedScheduleEstimateMonths: 13,
    contingencyRate: 2.5,
    escalationRate: 3.5,
    finalBudgetUsd: 115000
  }

  createTestRequest(server, '/api/project/budget/999998', 'PUT', updateData, function (err, res) {
    t.error(err, 'No error')
    t.equal(res.statusCode, 404, 'Should return 404')
    t.end()
  })
})

test('PUT /api/project/budget/:id - invalid ID', function (t) {
  const updateData = {
    projectName: 'Updated Test Project',
    year: 2025,
    currency: 'EUR',
    initialBudgetLocal: 110000,
    budgetUsd: 110000,
    initialScheduleEstimateMonths: 13,
    adjustedScheduleEstimateMonths: 13,
    contingencyRate: 2.5,
    escalationRate: 3.5,
    finalBudgetUsd: 115000
  }

  createTestRequest(server, '/api/project/budget/invalid', 'PUT', updateData, function (err, res) {
    t.error(err, 'No error')
    t.equal(res.statusCode, 400, 'Should return 400')
    t.end()
  })
})

// Test DELETE /api/project/budget/:id
test('DELETE /api/project/budget/:id - successful deletion', function (t) {
  createDeleteRequest(server, '/api/project/budget/99999', function (err, res) {
    t.error(err, 'No error')
    t.equal(res.statusCode, 200, 'Should return 200')
    t.ok(res.body.success, 'Should return success true')
    t.end()
  })
})

test('DELETE /api/project/budget/:id - project not found', function (t) {
  createDeleteRequest(server, '/api/project/budget/999997', function (err, res) {
    t.error(err, 'No error')
    t.equal(res.statusCode, 404, 'Should return 404')
    t.end()
  })
})

test('DELETE /api/project/budget/:id - invalid ID', function (t) {
  createDeleteRequest(server, '/api/project/budget/invalid', function (err, res) {
    t.error(err, 'No error')
    t.equal(res.statusCode, 400, 'Should return 400')
    t.end()
  })
})

// Test specific projects with TTD conversion
test('POST /api/project/budget/currency - Peking roasted duck Chanel TTD conversion', function (t) {
  const requestBody = {
    year: 2000,
    projectName: 'Peking roasted duck Chanel',
    currency: 'TTD'
  }

  createTestRequest(server, '/api/project/budget/currency', 'POST', requestBody, function (err, res) {
    t.error(err, 'No error')
    t.equal(res.statusCode, 200, 'Should return 200')
    t.ok(res.body.success, 'Should return success true')
    t.ok(res.body.data[0].finalBudgetTtd, 'Should have finalBudgetTtd field')
    t.end()
  })
})

test('POST /api/project/budget/currency - Choucroute Cartier TTD conversion', function (t) {
  const requestBody = {
    year: 2000,
    projectName: 'Choucroute Cartier',
    currency: 'TTD'
  }

  createTestRequest(server, '/api/project/budget/currency', 'POST', requestBody, function (err, res) {
    t.error(err, 'No error')
    t.equal(res.statusCode, 200, 'Should return 200')
    t.ok(res.body.success, 'Should return success true')
    t.ok(res.body.data[0].finalBudgetTtd, 'Should have finalBudgetTtd field')
    t.end()
  })
})

test('POST /api/project/budget/currency - Rigua Nintendo TTD conversion', function (t) {
  const requestBody = {
    year: 2001,
    projectName: 'Rigua Nintendo',
    currency: 'TTD'
  }

  createTestRequest(server, '/api/project/budget/currency', 'POST', requestBody, function (err, res) {
    t.error(err, 'No error')
    t.equal(res.statusCode, 200, 'Should return 200')
    t.ok(res.body.success, 'Should return success true')
    t.ok(res.body.data[0].finalBudgetTtd, 'Should have finalBudgetTtd field')
    t.end()
  })
})

test('POST /api/project/budget/currency - Llapingacho Instagram TTD conversion', function (t) {
  const requestBody = {
    year: 2000,
    projectName: 'Llapingacho Instagram',
    currency: 'TTD'
  }

  createTestRequest(server, '/api/project/budget/currency', 'POST', requestBody, function (err, res) {
    t.error(err, 'No error')
    t.equal(res.statusCode, 200, 'Should return 200')
    t.ok(res.body.success, 'Should return success true')
    t.ok(res.body.data[0].finalBudgetTtd, 'Should have finalBudgetTtd field')
    t.end()
  })
})

// Test budget service functions directly
test('budgetService.getProjectById - successful retrieval', function (t) {
  budgetService.getProjectById(38)
    .then(project => {
      t.ok(project.projectId, 'Should return project data')
      t.equal(project.projectName, 'Llapingacho Instagram', 'Should have correct project name')
      t.end()
    })
    .catch(err => {
      t.error(err, 'Should not have error')
      t.end()
    })
})

test('budgetService.getProjectById - project not found', function (t) {
  budgetService.getProjectById(999999)
    .then(project => {
      t.fail('Should not succeed')
      t.end()
    })
    .catch(err => {
      t.equal(err.message, 'Project not found', 'Should return correct error message')
      t.end()
    })
})

test('budgetService.getProjectByCurrency - successful conversion', function (t) {
  budgetService.getProjectByCurrency(2000, 'Peking roasted duck Chanel', 'TTD')
    .then(result => {
      t.ok(result.success, 'Should return success true')
      t.ok(result.data[0].finalBudgetTtd, 'Should have finalBudgetTtd field')
      t.end()
    })
    .catch(err => {
      t.error(err, 'Should not have error')
      t.end()
    })
})

test('budgetService.createProject - successful creation', function (t) {
  const newProject = {
    projectId: 99996,
    projectName: 'New Test Project',
    year: 2024,
    currency: 'USD',
    initialBudgetLocal: 100000,
    budgetUsd: 100000,
    initialScheduleEstimateMonths: 12,
    adjustedScheduleEstimateMonths: 12,
    contingencyRate: 2.0,
    escalationRate: 3.0,
    finalBudgetUsd: 105000
  }

  budgetService.createProject(newProject)
    .then(project => {
      t.ok(project.projectId, 'Should return created project')
      t.equal(project.projectName, 'New Test Project', 'Should have correct project name')
      t.end()
    })
    .catch(err => {
      t.error(err, 'Should not have error')
      t.end()
    })
})

test('budgetService.updateProject - successful update', function (t) {
  const updateData = {
    projectName: 'Updated New Test Project',
    year: 2025,
    currency: 'EUR',
    initialBudgetLocal: 110000,
    budgetUsd: 110000,
    initialScheduleEstimateMonths: 13,
    adjustedScheduleEstimateMonths: 13,
    contingencyRate: 2.5,
    escalationRate: 3.5,
    finalBudgetUsd: 115000
  }

  budgetService.updateProject(99996, updateData)
    .then(project => {
      t.ok(project.projectId, 'Should return updated project')
      t.equal(project.projectName, 'Updated New Test Project', 'Should have updated project name')
      t.end()
    })
    .catch(err => {
      t.error(err, 'Should not have error')
      t.end()
    })
})

test('budgetService.deleteProject - successful deletion', function (t) {
  budgetService.deleteProject(99996)
    .then(result => {
      t.ok(result.message, 'Should return success message')
      t.equal(result.projectId, 99996, 'Should return correct project ID')
      t.end()
    })
    .catch(err => {
      t.error(err, 'Should not have error')
      t.end()
    })
}) 