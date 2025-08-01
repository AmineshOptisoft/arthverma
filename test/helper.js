const servertest = require('servertest')

function createTestRequest (server, endpoint, method, requestBody, callback) {
  const json = JSON.stringify(requestBody || {})
  const stream = servertest(server, endpoint, {
    method,
    encoding: 'json',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': Buffer.byteLength(json)
    }
  }, callback)
  stream.end(json)
}

function createGetRequest (server, endpoint, callback) {
  return servertest(server, endpoint, {
    method: 'GET',
    encoding: 'json'
  }, callback)
}

function createDeleteRequest (server, endpoint, callback) {
  return servertest(server, endpoint, {
    method: 'DELETE',
    encoding: 'json'
  }, callback)
}

// Additional utility functions for better test organization
function validateProjectResponse (t, res, expectedFields = []) {
  t.ok(res.body, 'Response should have body')
  if (expectedFields.length > 0) {
    expectedFields.forEach(field => {
      t.ok(res.body[field] !== undefined, `Response should have ${field}`)
    })
  }
}

function validateErrorResponse (t, res, expectedStatusCode, expectedMessage = null) {
  t.equal(res.statusCode, expectedStatusCode, `Should return ${expectedStatusCode}`)
  if (expectedMessage) {
    t.ok(res.body.message && res.body.message.includes(expectedMessage), 'Should have appropriate error message')
  }
}

// Test data generators
function generateTestProject (overrides = {}) {
  return {
    projectId: 99999,
    projectName: 'Test Project',
    year: 2024,
    currency: 'EUR',
    initialBudgetLocal: 316974.5,
    budgetUsd: 233724.23,
    initialScheduleEstimateMonths: 13,
    adjustedScheduleEstimateMonths: 12,
    contingencyRate: 2.19,
    escalationRate: 3.46,
    finalBudgetUsd: 247106.75,
    ...overrides
  }
}

function generateCurrencyRequest (overrides = {}) {
  return {
    year: 2000,
    projectName: 'Test Project',
    currency: 'TTD',
    ...overrides
  }
}

module.exports = {
  createTestRequest,
  createGetRequest,
  createDeleteRequest,
  validateProjectResponse,
  validateErrorResponse,
  generateTestProject,
  generateCurrencyRequest
}
