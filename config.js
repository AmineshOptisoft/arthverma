// External dependencies
require('dotenv').config()

// Exports
module.exports = {
  server: {
    port: process.env.PORT || 1337
  },
  mysql: {
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASS,
    database: process.env.DB_NAME || 'budget'
  },
  currency: {
    apiKey: process.env.CURRENCY_API_KEY || 'a0426cd75e068086aa6de9ae'
  }
}
