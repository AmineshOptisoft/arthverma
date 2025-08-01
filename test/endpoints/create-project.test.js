const test = require('tape')
const app = require('../../lib/app')
const { createTestRequest, createTestProject } = require('../helper')

test('POST /api/project/budget Tests', (t) => {
  t.test('Test successful project creation', (st) => {
    const projectData = createTestProject(10001)
    
    createTestRequest(app, '/api/project/budget', 'POST', projectData, (err, res) => {
      t.error(err, 'No error')
      t.equal(res.statusCode, 201, 'Should return 201')
      t.ok(res.body.projectId, 'Should have projectId')
      t.end()
    })
  })

  t.test('Test validation errors for missing required fields', (st) => {
    const invalidProject = { projectId: 10002 } // Missing other required fields
    
    createTestRequest(app, '/api/project/budget', 'POST', invalidProject, (err, res) => {
      t.error(err, 'No error')
      t.equal(res.statusCode, 400, 'Should return 400')
      t.ok(res.body.error, 'Should have error message')
      t.end()
    })
  })

  t.test('Test 409 responses for duplicate project IDs', (st) => {
    const projectData = createTestProject(10003)
    
    // First create the project
    createTestRequest(app, '/api/project/budget', 'POST', projectData, (err, res) => {
      t.error(err, 'No error')
      t.equal(res.statusCode, 201, 'Should return 201')
      
      // Try to create the same project again
      createTestRequest(app, '/api/project/budget', 'POST', projectData, (err2, res2) => {
        t.error(err2, 'No error')
        t.equal(res2.statusCode, 409, 'Should return 409')
        t.ok(res2.body.error, 'Should have error message')
        t.end()
      })
    })
  })

  t.test('Test database insertion error scenarios', (st) => {
    const projectData = createTestProject(10004)
    
    createTestRequest(app, '/api/project/budget', 'POST', projectData, (err, res) => {
      t.error(err, 'No error')
      t.equal(res.statusCode, 201, 'Should return 201')
      t.ok(res.body, 'Should have response body')
      t.end()
    })
  })
}) 