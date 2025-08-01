// External dependencies
require('productionize')(require('./package.json').name)

// Internal dependencies
const port = require('./config').server.port

// Constants
const PORT = port || 1337

// Exports
require('./lib/app').listen(PORT, () => {
  console.log(`${require('./package.json').name} listening on port ${PORT}`)
})
