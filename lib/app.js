// External dependencies
const express = require('express')

// Internal dependencies
const mw = require('./mw')
const endpoints = require('./endpoint')

// Constants
const app = express()

// Exports
module.exports = app

// Middleware setup
app.use(mw.cors)
app.use(mw.logger)
app.use(mw.bodyParser)
app.use(mw.health)

app.use('/api', endpoints)

app.options('*', mw.cors)

// Error handling
app.use('*', (_req, res) => {
  res.status(404).send({ error: 'Not found' })
})

app.use((error, _req, res) => {
  res.status(500).send({ error })
})
