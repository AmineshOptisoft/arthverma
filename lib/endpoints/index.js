const express = require('express')
const projects = require('./projects')

const router = express.Router()

// Health check endpoint
router.get('/ok', (req, res) => {
  res.status(200).json({ ok: true })
})

// Project budget endpoints
router.use('/project', projects)

module.exports = router 