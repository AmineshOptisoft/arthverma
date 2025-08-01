process.env.NODE_ENV = 'test'

const http = require('http')
const test = require('tape')
const servertest = require('servertest')
const app = require('../lib/app')
const helper = require('./helper')
const dbSetup = require('../lib/db-setup')

const server = http.createServer(app)

// Initialize database before running tests
test('Database Setup', (t) => {
  dbSetup.initializeTestDatabase((err) => {
    t.error(err, 'Database should initialize successfully')
    t.end()
  })
})

// ✅ Health check test
test('GET /health should return 200', function (t) {
  servertest(server, '/health', { encoding: 'json' }, function (err, res) {
    t.error(err, 'No error')
    t.equal(res.statusCode, 200, 'Should return 200')
    t.end()
  })
})

// ✅ Basic API test
test('GET /api/ok should return 200', function (t) {
  servertest(server, '/api/ok', { encoding: 'json' }, function (err, res) {
    t.error(err, 'No error')
    t.equal(res.statusCode, 200, 'Should return 200')
    t.ok(res.body.ok, 'Should return a body')
    t.end()
  })
})

// ✅ Invalid route test
test('GET /nonexistent should return 404', function (t) {
  servertest(server, '/nonexistent', { encoding: 'json' }, function (err, res) {
    t.error(err, 'No error')
    t.equal(res.statusCode, 404, 'Should return 404')
    t.end()
  })
})

// ✅ GET valid project budget
test('GET /api/project/budget/1 should return 200', function (t) {
  helper.createGetRequest(server, '/api/project/budget/1', function (err, res) {
    t.error(err, 'No error')
    t.equal(res.statusCode, 200, 'Should return 200')
    t.ok(res.body.success, 'Should return success response')
    t.ok(res.body.data, 'Should return project data')
    t.end()
  })
})

// ✅ GET invalid project budget
test('GET /api/project/budget/invalid should return 400', function (t) {
  helper.createGetRequest(server, '/api/project/budget/invalid', function (err, res) {
    t.error(err, 'No error')
    t.equal(res.statusCode, 400, 'Should return 400 for invalid project ID')
    t.end()
  })
})

// ✅ GET non-existent project budget
test('GET /api/project/budget/99999 should return 404', function (t) {
  helper.createGetRequest(server, '/api/project/budget/99999', function (err, res) {
    t.error(err, 'No error')
    t.equal(res.statusCode, 404, 'Should return 404 for non-existent project')
    t.end()
  })
})

test('/api/project/budget/currency should return 400 for missing required fields', function (t) {
  const requestBody = {
    year: 2000,
    projectName: 'Humitas Hewlett Packard'
  }
  helper.createTestRequest(server, '/api/project/budget/currency', 'POST', requestBody, function (err, res) {
    t.error(err, 'No error')
    t.equal(res.statusCode, 400, 'Should return 400')
    t.end()
  })
})

// 2. GET /api/project/budget/:id tests
test('GET /api/project/budget/:id tests', function (t) {
  t.test('should successfully get project by ID', function (t) {
    helper.createGetRequest(server, '/api/project/budget/512', function (err, res) {
      t.error(err, 'No error')
      t.equal(res.statusCode, 200, 'Should return 200')
      t.ok(res.body.projectId, 'Should have projectId')
      t.end()
    })
  })

  t.test('should return 404 for non-existent project ID', function (t) {
    helper.createGetRequest(server, '/api/project/budget/99999', function (err, res) {
      t.error(err, 'No error')
      t.equal(res.statusCode, 404, 'Should return 404')
      t.end()
    })
  })

  t.test('should return 400 for invalid project ID', function (t) {
    helper.createGetRequest(server, '/api/project/budget/invalid', function (err, res) {
      t.error(err, 'No error')
      t.equal(res.statusCode, 400, 'Should return 400')
      t.end()
    })
  })
})

// 3. POST /api/project/budget tests
test('POST /api/project/budget tests', function (t) {
  t.test('should successfully create new project', function (t) {
    const newProject = {
      projectId: 10001,
      projectName: 'Test Project',
      year: 2024,
      currency: 'EUR',
      initialBudgetLocal: 316974.5,
      budgetUsd: 233724.23,
      initialScheduleEstimateMonths: 13,
      adjustedScheduleEstimateMonths: 12,
      contingencyRate: 2.19,
      escalationRate: 3.46,
      finalBudgetUsd: 247106.75
    }

    helper.createTestRequest(server, '/api/project/budget', 'POST', newProject, function (err, res) {
      t.error(err, 'No error')
      t.equal(res.statusCode, 201, 'Should return 201')
      t.ok(res.body.projectId, 'Should return projectId')
      t.end()
    })
  })

  t.test('should return 400 for missing required fields', function (t) {
    const incompleteProject = {
      projectId: 10002,
      projectName: 'Incomplete Project'
    }

    helper.createTestRequest(server, '/api/project/budget', 'POST', incompleteProject, function (err, res) {
      t.error(err, 'No error')
      t.equal(res.statusCode, 400, 'Should return 400')
      t.end()
    })
  })

  t.test('should return 409 for duplicate project ID', function (t) {
    const duplicateProject = {
      projectId: 512,
      projectName: 'Duplicate Project',
      year: 2024,
      currency: 'EUR',
      initialBudgetLocal: 316974.5,
      budgetUsd: 233724.23,
      initialScheduleEstimateMonths: 13,
      adjustedScheduleEstimateMonths: 12,
      contingencyRate: 2.19,
      escalationRate: 3.46,
      finalBudgetUsd: 247106.75
    }

    helper.createTestRequest(server, '/api/project/budget', 'POST', duplicateProject, function (err, res) {
      t.error(err, 'No error')
      t.equal(res.statusCode, 409, 'Should return 409')
      t.end()
    })
  })
})

// 4. PUT /api/project/budget/:id tests
test('PUT /api/project/budget/:id tests', function (t) {
  t.test('should successfully update existing project', function (t) {
    const updateData = {
      projectName: 'Updated Project Name',
      year: 2025,
      currency: 'EUR',
      initialBudgetLocal: 316974.5,
      budgetUsd: 233724.23,
      initialScheduleEstimateMonths: 13,
      adjustedScheduleEstimateMonths: 12,
      contingencyRate: 2.19,
      escalationRate: 3.46,
      finalBudgetUsd: 247106.75
    }

    helper.createTestRequest(server, '/api/project/budget/512', 'PUT', updateData, function (err, res) {
      t.error(err, 'No error')
      t.equal(res.statusCode, 200, 'Should return 200')
      t.ok(res.body.success, 'Should return success true')
      t.end()
    })
  })

  t.test('should return 404 for non-existent project ID', function (t) {
    const updateData = {
      projectName: 'Updated Project Name',
      year: 2025,
      currency: 'EUR',
      initialBudgetLocal: 316974.5,
      budgetUsd: 233724.23,
      initialScheduleEstimateMonths: 13,
      adjustedScheduleEstimateMonths: 12,
      contingencyRate: 2.19,
      escalationRate: 3.46,
      finalBudgetUsd: 247106.75
    }

    helper.createTestRequest(server, '/api/project/budget/99999', 'PUT', updateData, function (err, res) {
      t.error(err, 'No error')
      t.equal(res.statusCode, 404, 'Should return 404')
      t.end()
    })
  })

  t.test('should return 400 for invalid project ID', function (t) {
    const updateData = {
      projectName: 'Updated Project Name',
      year: 2025,
      currency: 'EUR',
      initialBudgetLocal: 316974.5,
      budgetUsd: 233724.23,
      initialScheduleEstimateMonths: 13,
      adjustedScheduleEstimateMonths: 12,
      contingencyRate: 2.19,
      escalationRate: 3.46,
      finalBudgetUsd: 247106.75
    }

    helper.createTestRequest(server, '/api/project/budget/invalid', 'PUT', updateData, function (err, res) {
      t.error(err, 'No error')
      t.equal(res.statusCode, 400, 'Should return 400')
      t.end()
    })
  })
})

// 5. DELETE /api/project/budget/:id tests
test('DELETE /api/project/budget/:id tests', function (t) {
  t.test('should successfully delete existing project', function (t) {
    helper.createDeleteRequest(server, '/api/project/budget/10001', function (err, res) {
      t.error(err, 'No error')
      t.equal(res.statusCode, 200, 'Should return 200')
      t.ok(res.body.success, 'Should return success true')
      t.end()
    })
  })

  t.test('should return 404 for non-existent project ID', function (t) {
    helper.createDeleteRequest(server, '/api/project/budget/99999', function (err, res) {
      t.error(err, 'No error')
      t.equal(res.statusCode, 404, 'Should return 404')
      t.end()
    })
  })

  t.test('should return 400 for invalid project ID', function (t) {
    helper.createDeleteRequest(server, '/api/project/budget/invalid', function (err, res) {
      t.error(err, 'No error')
      t.equal(res.statusCode, 400, 'Should return 400')
      t.end()
    })
  })
})

// ==================== SPECIFIC PROJECT TTD CONVERSION TESTS ====================

// Test for Peking roasted duck Chanel
test('TTD conversion for Peking roasted duck Chanel', function (t) {
  const requestBody = {
    year: 2000,
    projectName: 'Peking roasted duck Chanel',
    currency: 'TTD'
  }

  helper.createTestRequest(server, '/api/project/budget/currency', 'POST', requestBody, function (err, res) {
    t.error(err, 'No error')
    t.equal(res.statusCode, 200, 'Should return 200')
    t.ok(res.body.success, 'Should return success true')
    t.end()
  })
})

// Test for Choucroute Cartier
test('TTD conversion for Choucroute Cartier', function (t) {
  const requestBody = {
    year: 2000,
    projectName: 'Choucroute Cartier',
    currency: 'TTD'
  }

  helper.createTestRequest(server, '/api/project/budget/currency', 'POST', requestBody, function (err, res) {
    t.error(err, 'No error')
    t.equal(res.statusCode, 200, 'Should return 200')
    t.ok(res.body.success, 'Should return success true')
    t.end()
  })
})

// Test for Rigua Nintendo
test('TTD conversion for Rigua Nintendo', function (t) {
  const requestBody = {
    year: 2001,
    projectName: 'Rigua Nintendo',
    currency: 'TTD'
  }

  helper.createTestRequest(server, '/api/project/budget/currency', 'POST', requestBody, function (err, res) {
    t.error(err, 'No error')
    t.equal(res.statusCode, 200, 'Should return 200')
    t.ok(res.body.success, 'Should return success true')
    t.end()
  })
})

// Test for Llapingacho Instagram
test('TTD conversion for Llapingacho Instagram', function (t) {
  const requestBody = {
    year: 2000,
    projectName: 'Llapingacho Instagram',
    currency: 'TTD'
  }

  helper.createTestRequest(server, '/api/project/budget/currency', 'POST', requestBody, function (err, res) {
    t.error(err, 'No error')
    t.equal(res.statusCode, 200, 'Should return 200')
    t.ok(res.body.success, 'Should return success true')
    t.end()
  })
})

// ==================== INTEGRATION TESTS ====================

test('Integration tests for full CRUD cycle', function (t) {
  t.test('should complete full CRUD cycle for a project', function (t) {
    const testProject = {
      projectId: 99999,
      projectName: 'Integration Test Project',
      year: 2024,
      currency: 'EUR',
      initialBudgetLocal: 100000.0,
      budgetUsd: 120000.0,
      initialScheduleEstimateMonths: 12,
      adjustedScheduleEstimateMonths: 10,
      contingencyRate: 5.0,
      escalationRate: 2.0,
      finalBudgetUsd: 125000.0
    }

    helper.createTestRequest(server, '/api/project/budget', 'POST', testProject, function (err, res) {
      t.error(err, 'No error creating project')
      t.equal(res.statusCode, 201, 'Should return 201 for creation')

      helper.createGetRequest(server, '/api/project/budget/99999', function (err, res) {
        t.error(err, 'No error reading project')
        t.equal(res.statusCode, 200, 'Should return 200 for reading')

        const updateData = {
          projectName: 'Updated Integration Test Project',
          year: 2025,
          currency: 'USD',
          initialBudgetLocal: 150000.0,
          budgetUsd: 180000.0,
          initialScheduleEstimateMonths: 15,
          adjustedScheduleEstimateMonths: 12,
          contingencyRate: 6.0,
          escalationRate: 3.0,
          finalBudgetUsd: 190000.0
        }

        helper.createTestRequest(server, '/api/project/budget/99999', 'PUT', updateData, function (err, res) {
          t.error(err, 'No error updating project')
          t.equal(res.statusCode, 200, 'Should return 200 for updating')

          helper.createDeleteRequest(server, '/api/project/budget/99999', function (err, res) {
            t.error(err, 'No error deleting project')
            t.equal(res.statusCode, 200, 'Should return 200 for deleting')
            t.end()
          })
        })
      })
    })
  })
})

// Clean up database after tests
test('Database Cleanup', (t) => {
  dbSetup.cleanupTestDatabase((err) => {
    t.error(err, 'Database should cleanup successfully')
    t.end()
  })
})
