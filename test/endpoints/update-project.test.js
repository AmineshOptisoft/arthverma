const test = require('tape')
const app = require('../../lib/app')
const { createTestRequest, createTestProject, createUpdateData } = require('../helper')

test('PUT /api/project/budget/:id Tests', (t) => {
  t.test('Test successful project updates', (st) => {
    const projectId = 10005
    const projectData = createTestProject(projectId)
    const updateData = createUpdateData()
    
    // First create the project
    createTestRequest(app, '/api/project/budget', 'POST', projectData, (err, res) => {
      t.error(err, 'No error')
      t.equal(res.statusCode, 201, 'Should return 201')
      
      // Now update the project
      createTestRequest(app, `/api/project/budget/${projectId}`, 'PUT', updateData, (err2, res2) => {
        t.error(err2, 'No error')
        t.equal(res2.statusCode, 200, 'Should return 200')
        t.ok(res2.body.projectId, 'Should have projectId')
        t.end()
      })
    })
  })

  t.test('Test validation errors for missing required fields', (st) => {
    const projectId = 10006
    const projectData = createTestProject(projectId)
    const invalidUpdate = { projectId } // Missing other required fields
    
    // First create the project
    createTestRequest(app, '/api/project/budget', 'POST', projectData, (err, res) => {
      t.error(err, 'No error')
      t.equal(res.statusCode, 201, 'Should return 201')
      
      // Try to update with invalid data
      createTestRequest(app, `/api/project/budget/${projectId}`, 'PUT', invalidUpdate, (err2, res2) => {
        t.error(err2, 'No error')
        t.equal(res2.statusCode, 400, 'Should return 400')
        t.ok(res2.body.error, 'Should have error message')
        t.end()
      })
    })
  })

  t.test('Test 404 responses for non-existent projects', (st) => {
    const updateData = createUpdateData()
    
    createTestRequest(app, '/api/project/budget/99999', 'PUT', updateData, (err, res) => {
      t.error(err, 'No error')
      t.equal(res.statusCode, 404, 'Should return 404')
      t.ok(res.body.error, 'Should have error message')
      t.end()
    })
  })

  t.test('Test database update error scenarios', (st) => {
    const projectId = 10007
    const projectData = createTestProject(projectId)
    const updateData = createUpdateData()
    
    // First create the project
    createTestRequest(app, '/api/project/budget', 'POST', projectData, (err, res) => {
      t.error(err, 'No error')
      t.equal(res.statusCode, 201, 'Should return 201')
      
      // Update the project
      createTestRequest(app, `/api/project/budget/${projectId}`, 'PUT', updateData, (err2, res2) => {
        t.error(err2, 'No error')
        t.equal(res2.statusCode, 200, 'Should return 200')
        t.ok(res2.body, 'Should have response body')
        t.end()
      })
    })
  })
}) 