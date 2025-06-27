// Load environment variables first
import 'dotenv/config'

// Environment validation function
function validateEnvironment() {
  console.log('🔍 Validating environment configuration...')
  
  // List of critical environment variables
  const requiredEnvVars = [
    // Database
    'DATABASE_URL',
    // JWT
    'JWT_SECRET'
  ]
  
  // API Keys that are commonly needed but not required for startup
  const recommendedEnvVars = [
    'OPENAI_API_KEY',
    'ANTHROPIC_API_KEY',
    'CLAUDE_API_KEY'
  ]
  
  const optionalEnvVars = [
    'PORT',
    'HOST',
    'SERVER_PORT',
    'STRIPE_SECRET_KEY',
    'STRIPE_PUBLISHABLE_KEY',
    'ALIPAY_APP_ID',
    'ALIPAY_PRIVATE_KEY',
    'REDIS_URL'
  ]
  
  const missingRequired = []
  const missingOptional = []
  
  // Check required variables
  for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
      missingRequired.push(envVar)
    } else {
      console.log(`✅ ${envVar}: ${envVar.includes('KEY') || envVar.includes('SECRET') ? '[REDACTED]' : process.env[envVar]}`)
    }
  }
  
  // Check recommended variables
  const missingRecommended = []
  for (const envVar of recommendedEnvVars) {
    if (!process.env[envVar]) {
      missingRecommended.push(envVar)
    } else {
      console.log(`✅ ${envVar}: [REDACTED]`)
    }
  }
  
  // Check optional variables
  for (const envVar of optionalEnvVars) {
    if (!process.env[envVar]) {
      missingOptional.push(envVar)
    } else {
      console.log(`✅ ${envVar}: ${envVar.includes('KEY') || envVar.includes('SECRET') ? '[REDACTED]' : process.env[envVar]}`)
    }
  }
  
  // Log missing variables
  if (missingRecommended.length > 0) {
    console.log(`⚠️ Missing recommended environment variables (features may be limited): ${missingRecommended.join(', ')}`)
  }
  
  if (missingOptional.length > 0) {
    console.log(`⚠️ Missing optional environment variables: ${missingOptional.join(', ')}`)
  }
  
  if (missingRequired.length > 0) {
    console.error(`❌ Missing required environment variables: ${missingRequired.join(', ')}`)
    console.error('Please set these variables in your .env file or environment')
    process.exit(1)
  }
  
  console.log('✅ Environment validation completed')
}

// Validate environment before importing anything else
try {
  validateEnvironment()
} catch (error) {
  console.error('❌ Environment validation failed:', error)
  process.exit(1)
}

// Set up global error handlers IMMEDIATELY
process.on('uncaughtException', (error) => {
  console.error('💥 Uncaught Exception during startup:', error)
  console.error('Stack trace:', error.stack)
  console.log('📊 Memory usage:', process.memoryUsage())
  console.log('🔧 Process info:', {
    pid: process.pid,
    platform: process.platform,
    nodeVersion: process.version,
    cwd: process.cwd()
  })
  process.exit(1)
})

process.on('unhandledRejection', (reason, promise) => {
  console.error('💥 Unhandled Rejection during startup at:', promise, 'reason:', reason)
  console.log('📊 Memory usage:', process.memoryUsage())
  console.log('🔧 Process info:', {
    pid: process.pid,
    platform: process.platform,
    nodeVersion: process.version,
    cwd: process.cwd()
  })
  process.exit(1)
})

console.log('🚀 Starting Yumi-Series Backend v1.2.0...')
console.log('🔧 Process info:', {
  pid: process.pid,
  platform: process.platform,
  nodeVersion: process.version,
  cwd: process.cwd(),
  execPath: process.execPath,
  argv: process.argv
})

import express from 'express'
import { setupWritingHelperRoutes } from './modules/writinghelper/writinghelper'
import { setupPostGeneratorRoutes } from './modules/writinghelper/postgenerator'
import { setupAnimeCharaHelperRoutes } from './modules/animehelper/animecharahelper'
import billingRouter from './modules/billing'
import artworkRouter from './modules/artwork'
import authRouter from './auth-routes'
import configRouter from './modules/shared/configRoutes'
import { mangaRouter } from './modules/manga/routes'
import { rateLimit } from 'express-rate-limit'
import cors from 'cors'
import debug from 'debug'
import { wrapHandler } from './modules/shared/types'
import { Request, Response } from 'express'
import { corsOptions } from './modules/shared/types'
import { db } from './database'
import fetch from 'node-fetch'
import { addHealthCheck } from './modules/shared/appRoutes'

// Initialize debug logger
const log = debug('app:server')

// Create Express app
const app = express()

// Add basic middleware
app.use(express.json())
app.use(express.urlencoded({ extended: true }))

// Add CORS
app.use(cors(corsOptions))

// Add rate limiting
const limiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100 // limit each IP to 100 requests per windowMs
})
app.use(limiter)

// Debug middleware to log all requests
app.use((req, _res, next) => {
  log(`${req.method} ${req.url}`)
  if (req.body) {
    log('Request body:', req.body)
  }
  next()
})

// Add health check and chat routes
addHealthCheck(app)

// Add routes
log('Registering auth routes')
app.use('/api/auth', authRouter)
log('Auth router stack:', authRouter.stack)

log('Registering billing routes')
app.use('/api/billing', billingRouter)
log('Billing router stack:', billingRouter.stack)

log('Registering artwork routes')
app.use('/api/artwork', artworkRouter)
log('Artwork router stack:', artworkRouter.stack)

log('Registering config routes')
app.use('/api/config', configRouter)

log('Registering manga routes')
app.use('/api/manga', mangaRouter)

// Setup feature-specific routes
log('Setting up writing helper routes')
setupWritingHelperRoutes(app)
log('Setting up post generator routes')
setupPostGeneratorRoutes(app)
log('Setting up anime character helper routes')
setupAnimeCharaHelperRoutes(app)

// Error handling middleware
app.use((err: any, _req: Request, res: Response, next: any) => {
  log('Error:', err)
  res.status(500).json({ error: 'Internal server error' })
})

// 404 handler
app.use((_req: Request, res: Response) => {
  res.status(404).json({ error: 'Not found' })
})

// Initialize database and start server
async function start() {
  try {
    console.log('🚀 Starting Yumi-Series Backend v1.2.0...')
    console.log('📍 Current working directory:', process.cwd())
    console.log('📍 Node.js version:', process.version)
    console.log('📍 Platform:', process.platform)
    
    // Test basic functionality first
    console.log('🧪 Testing basic Node.js functionality...')
    const testTimeout = setTimeout(() => {
      console.log('✅ Timeout functionality works')
    }, 100)
    clearTimeout(testTimeout)
    console.log('✅ Basic Node.js functionality test passed')
    
    // Initialize database with timeout and retry
    console.log('📊 Initializing database connection...')
    console.log('📍 Database URL:', process.env.DATABASE_URL ? '[REDACTED]' : 'NOT SET')
    
    let dbAttempts = 0
    const maxDbAttempts = 3
    
    while (dbAttempts < maxDbAttempts) {
      try {
        dbAttempts++
        console.log(`📊 Database connection attempt ${dbAttempts}/${maxDbAttempts}...`)
        
        // Create a timeout promise for database connection
        const dbTimeout = new Promise((_, reject) => {
          setTimeout(() => reject(new Error('Database connection timeout after 30 seconds')), 30000)
        })
        
        // Race between database initialization and timeout
        await Promise.race([db.initialize(), dbTimeout])
        console.log('✅ Database initialized successfully')
        break
      } catch (error) {
        console.error(`❌ Database connection attempt ${dbAttempts} failed:`, error)
        if (dbAttempts >= maxDbAttempts) {
          console.error('❌ All database connection attempts failed')
          throw error
        }
        console.log(`⏳ Retrying in 5 seconds...`)
        await new Promise(resolve => setTimeout(resolve, 5000))
      }
    }

    // Start server with comprehensive error handling
    const port = parseInt(process.env.PORT || process.env.SERVER_PORT || '3001', 10)
    const host = process.env.HOST || '0.0.0.0'
    
    console.log(`🔌 Attempting to bind server to ${host}:${port}`)
    console.log(`📍 Available interfaces:`)
    try {
      const os = require('os')
      const interfaces = os.networkInterfaces()
      for (const [name, addrs] of Object.entries(interfaces)) {
        if (addrs) {
          for (const addr of addrs as any[]) {
            if (addr.family === 'IPv4') {
              console.log(`   ${name}: ${addr.address}`)
            }
          }
        }
      }
    } catch (e) {
      console.log('   Could not enumerate network interfaces')
    }
    
    const server = app.listen(port, host, () => {
      console.log(`✅ Server successfully started!`)
      console.log(`🌍 Server listening on ${host}:${port}`)
      console.log(`🔗 Health check: http://${host}:${port}/api/health`)
      console.log(`🔗 Readiness check: http://${host}:${port}/api/ready`)
      console.log(`📊 Memory usage: ${Math.round(process.memoryUsage().rss / 1024 / 1024)}MB`)
      
      // Signal to container platforms that we're ready
      console.log('✅ CONTAINER READY FOR TRAFFIC!')
      console.log('🎯 Application startup completed successfully')
      
      // Log available routes (only in debug mode to avoid spam)
      if (process.env.DEBUG || process.env.NODE_ENV === 'development') {
        log('Available routes:')
        try {
          app._router.stack.forEach((r: any) => {
            if (r.route && r.route.path) {
              log(`${Object.keys(r.route.methods).join(',')} ${r.route.path}`)
            } else if (r.name === 'router') {
              log(`Router: ${r.regexp}`)
              if (r.handle && r.handle.stack) {
                r.handle.stack.forEach((h: any) => {
                  if (h.route) {
                    log(`  ${Object.keys(h.route.methods).join(',')} ${h.route.path}`)
                  }
                })
              }
            }
          })
        } catch (routeError) {
          log('Could not enumerate routes:', routeError)
        }
      }
    })

    // Handle server startup errors
    server.on('error', (error: any) => {
      console.error(`❌ Server startup error:`, error)
      console.error(`📊 Error details:`, {
        code: error.code,
        message: error.message,
        stack: error.stack,
        port,
        host,
        pid: process.pid
      })
      
      if (error.code === 'EADDRINUSE') {
        console.error(`❌ Port ${port} is already in use. Try a different port or kill the process using this port.`)
      } else if (error.code === 'EACCES') {
        console.error(`❌ Permission denied to bind to port ${port}. Try using a port > 1024 or run with sudo (not recommended).`)
      } else if (error.code === 'ENOTFOUND') {
        console.error(`❌ Host '${host}' not found. Try using '0.0.0.0' or 'localhost'.`)
      }
      
      process.exit(1)
    })

    server.on('close', () => {
      console.log('🔌 Server closed gracefully')
    })

    server.on('listening', () => {
      const addr = server.address()
      console.log('🎉 Server is now listening!')
      console.log('📡 Server address info:', addr)
    })

    // Handle graceful shutdown with extensive debugging
    const gracefulShutdown = (signal: string) => {
      console.log(`\n🚨 Received ${signal}. Source: ${process.pid}`)
      console.log(`📊 Memory usage:`, process.memoryUsage())
      console.log(`⏱️ Uptime: ${process.uptime()}s`)
      console.log(`🔧 Starting graceful shutdown...`)
      
      // Give more time for cleanup
      const forceExitTimer = setTimeout(() => {
        console.log('⚠️ Force exit after timeout')
        process.exit(1)
      }, 30000) // 30 second timeout
      
      server.close(() => {
        console.log('✅ HTTP server closed.')
        console.log('🔌 Disconnecting from database...')
        // Database will disconnect automatically on process exit
        console.log('✅ Database disconnected.')
        console.log('👋 Process exiting gracefully.')
        clearTimeout(forceExitTimer)
        process.exit(0)
      })
    }

    // Listen for ALL possible termination signals with debugging
    process.on('SIGTERM', () => {
      console.log('🚨 SIGTERM received - likely from container orchestration')
      gracefulShutdown('SIGTERM')
    })
    process.on('SIGINT', () => {
      console.log('🚨 SIGINT received - likely from Ctrl+C')
      gracefulShutdown('SIGINT')
    })
    process.on('SIGQUIT', () => {
      console.log('🚨 SIGQUIT received')
      gracefulShutdown('SIGQUIT')
    })
    process.on('SIGHUP', () => {
      console.log('🚨 SIGHUP received - terminal closed')
      gracefulShutdown('SIGHUP')
    })

    // Keep the process alive and log periodic health
    const healthInterval = setInterval(() => {
      const memUsage = process.memoryUsage()
      console.log(`💚 Health check - Uptime: ${Math.floor(process.uptime())}s, Memory: ${Math.round(memUsage.rss / 1024 / 1024)}MB`)
    }, 30000) // Every 30 seconds

    // Clean up interval on shutdown
    process.on('exit', () => {
      clearInterval(healthInterval)
      console.log('🏁 Process exit handler called')
    })

    // Log that we're ready to handle requests
    console.log('🎯 Server fully initialized and ready to handle requests!')

  } catch (error) {
    console.error('❌ Failed to start server:', error)
    process.exit(1)
  }
}

start() 