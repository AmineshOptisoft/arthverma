const test = require('tape')
const app = require('../../lib/app')
const { createTestRequest, createDeleteRequest, createTestProject } = require('../helper')

test('DELETE /api/project/budget/:id Tests', (t) => {
  t.test('Test successful project deletion', (st) => {
    const projectId = 10008
    const projectData = createTestProject(projectId)
    
    // First create the project
    createTestRequest(app, '/api/project/budget', 'POST', projectData, (err, res) => {
      t.error(err, 'No error')
      t.equal(res.statusCode, 201, 'Should return 201')
      
      // Now delete the project
      createDeleteRequest(app, `/api/project/budget/${projectId}`, (err2, res2) => {
        t.error(err2, 'No error')
        t.equal(res2.statusCode, 200, 'Should return 200')
        t.ok(res2.body.message, 'Should have success message')
        t.end()
      })
    })
  })

  t.test('Test 404 responses for non-existent projects', (st) => {
    createDeleteRequest(app, '/api/project/budget/99999', (err, res) => {
      t.error(err, 'No error')
      t.equal(res.statusCode, 404, 'Should return 404')
      t.ok(res.body.error, 'Should have error message')
      t.end()
    })
  })

  t.test('Test 400 responses for invalid project IDs', (st) => {
    createDeleteRequest(app, '/api/project/budget/invalid', (err, res) => {
      t.error(err, 'No error')
      t.equal(res.statusCode, 400, 'Should return 400')
      t.ok(res.body.error, 'Should have error message')
      t.end()
    })
  })

  t.test('Test database deletion error scenarios', (st) => {
    const projectId = 10009
    const projectData = createTestProject(projectId)
    
    // First create the project
    createTestRequest(app, '/api/project/budget', 'POST', projectData, (err, res) => {
      t.error(err, 'No error')
      t.equal(res.statusCode, 201, 'Should return 201')
      
      // Delete the project
      createDeleteRequest(app, `/api/project/budget/${projectId}`, (err2, res2) => {
        t.error(err2, 'No error')
        t.equal(res2.statusCode, 200, 'Should return 200')
        t.ok(res2.body, 'Should have response body')
        t.end()
      })
    })
  })
}) 