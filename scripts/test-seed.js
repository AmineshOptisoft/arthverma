const dbSetup = require('../lib/db-setup')

// Set environment to test
process.env.NODE_ENV = 'test'

console.log('Starting test database seeding...')

dbSetup.initializeTestDatabase((err, message) => {
  if (err) {
    console.error('Error initializing test database:', err)
    process.exit(1)
  }
  
  console.log(message)
  console.log('Test database seeding completed successfully')
  process.exit(0)
}) 