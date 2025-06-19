import sqlite3 from 'sqlite3'
import { promisify } from 'util'
import path from 'path'

// Database interface
export interface User {
  id: number
  email: string
  username: string
  passwordHash: string
  tokensRemaining: number
  totalTokensUsed: number
  freeTokensUsedThisMonth: number
  freeTokensResetDate: Date
  subscriptionStatus: 'free' | 'premium_monthly' | 'paid_tokens'
  subscriptionId?: string
  stripeCustomerId?: string
  dailyTokenLimit?: number
  lastDailyReset?: Date
  createdAt: Date
  updatedAt: Date
}

export interface TokenTransaction {
  id: number
  userId: number
  type: 'purchase' | 'usage' | 'bonus'
  amount: number
  model?: string
  description: string
  stripePaymentId?: string
  createdAt: Date
}

export interface ChatHistory {
  id: number
  userId: number
  sessionId: string
  messages: string // JSON string of messages
  provider: string
  model: string
  mode: 'agent' | 'assistant'
  tokensUsed: number
  createdAt: Date
}

class Database {
  private db: sqlite3.Database
  private runAsync: (sql: string, params?: any[]) => Promise<sqlite3.RunResult>
  private getAsync: (sql: string, params?: any[]) => Promise<any>
  private allAsync: (sql: string, params?: any[]) => Promise<any[]>

  constructor() {
    const dbPath = path.join(__dirname, '../database.sqlite')
    console.log('📂 Database path:', dbPath)
    console.log('📁 Current working directory:', process.cwd())
    console.log('📁 __dirname:', __dirname)
    
    this.db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('❌ SQLite connection error:', err)
      } else {
        console.log('✅ SQLite database connected successfully')
      }
    })
    
    // Promisify methods
    this.runAsync = promisify(this.db.run.bind(this.db))
    this.getAsync = promisify(this.db.get.bind(this.db))
    this.allAsync = promisify(this.db.all.bind(this.db))
  }

  async initialize() {
    await this.createTables()
    await this.testDatabaseAccess()
  }
  
  private async testDatabaseAccess() {
    try {
      console.log('🧪 Testing database write access...')
      
      // Test if we can write to the database
      const testResult = await this.runAsync(
        'INSERT OR IGNORE INTO users (email, username, passwordHash) VALUES (?, ?, ?)',
        ['test@system.local', 'system_test', 'test_hash']
      )
      
      console.log('📊 Database write test result:', {
        hasResult: !!testResult,
        lastID: testResult?.lastID,
        changes: testResult?.changes
      })
      
      // Clean up test user
      if (testResult?.lastID) {
        await this.runAsync('DELETE FROM users WHERE id = ?', [testResult.lastID])
        console.log('✅ Database write test successful - cleaned up test user')
      } else {
        console.warn('⚠️  Database write test did not return expected result')
      }
    } catch (error) {
      console.error('❌ Database write test failed:', error)
    }
  }

  private async createTables() {
    // Users table
    await this.runAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        email TEXT UNIQUE NOT NULL,
        username TEXT UNIQUE NOT NULL,
        passwordHash TEXT NOT NULL,
        tokensRemaining INTEGER DEFAULT 0,
        totalTokensUsed INTEGER DEFAULT 0,
        freeTokensUsedThisMonth INTEGER DEFAULT 0,
        freeTokensResetDate DATETIME DEFAULT (date('now', '+1 month')),
        subscriptionStatus TEXT DEFAULT 'free',
        subscriptionId TEXT,
        stripeCustomerId TEXT,
        dailyTokenLimit INTEGER,
        lastDailyReset DATETIME,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        updatedAt DATETIME DEFAULT CURRENT_TIMESTAMP
      )
    `)

    // Token transactions table
    await this.runAsync(`
      CREATE TABLE IF NOT EXISTS token_transactions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        type TEXT NOT NULL,
        amount INTEGER NOT NULL,
        model TEXT,
        description TEXT NOT NULL,
        stripePaymentId TEXT,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (id)
      )
    `)

    // Chat history table
    await this.runAsync(`
      CREATE TABLE IF NOT EXISTS chat_history (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userId INTEGER NOT NULL,
        sessionId TEXT NOT NULL,
        messages TEXT NOT NULL,
        provider TEXT NOT NULL,
        model TEXT NOT NULL,
        mode TEXT NOT NULL,
        tokensUsed INTEGER DEFAULT 0,
        createdAt DATETIME DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (userId) REFERENCES users (id)
      )
    `)

    console.log('Database tables initialized successfully')
  }

  // User methods
  async createUser(email: string, username: string, passwordHash: string): Promise<User> {
    try {
      console.log('🔍 Attempting to create user:', { email, username })
      
      const result = await this.runAsync(
        'INSERT INTO users (email, username, passwordHash) VALUES (?, ?, ?)',
        [email, username, passwordHash]
      )
      
      console.log('📊 Database INSERT result:', { 
        hasResult: !!result, 
        lastID: result?.lastID, 
        changes: result?.changes 
      })
      
      if (!result || !result.lastID) {
        console.error('❌ Database INSERT failed - no lastID returned')
        throw new Error('Failed to insert user into database')
      }
      
      const user = await this.getUserById(result.lastID)
      if (!user) {
        console.error('❌ Failed to retrieve user after creation, ID:', result.lastID)
        throw new Error('Failed to retrieve created user')
      }
      
      console.log('✅ User created successfully:', { id: user.id, email: user.email })
      return user
    } catch (error) {
      console.error('💥 Database createUser error:', error)
      throw error
    }
  }

  async getUserById(id: number): Promise<User | null> {
    return await this.getAsync('SELECT * FROM users WHERE id = ?', [id])
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return await this.getAsync('SELECT * FROM users WHERE email = ?', [email])
  }

  async getAllUsers(): Promise<User[]> {
    return await this.allAsync('SELECT * FROM users ORDER BY id')
  }

  async updateUserTokens(userId: number, tokensRemaining: number, totalTokensUsed: number): Promise<void> {
    await this.runAsync(
      'UPDATE users SET tokensRemaining = ?, totalTokensUsed = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [tokensRemaining, totalTokensUsed, userId]
    )
  }

  async updateUserStripeInfo(userId: number, stripeCustomerId: string, subscriptionId?: string): Promise<void> {
    await this.runAsync(
      'UPDATE users SET stripeCustomerId = ?, subscriptionId = ?, updatedAt = CURRENT_TIMESTAMP WHERE id = ?',
      [stripeCustomerId, subscriptionId, userId]
    )
  }

  // Token transaction methods
  async addTokenTransaction(
    userId: number, 
    type: 'purchase' | 'usage' | 'bonus', 
    amount: number, 
    description: string,
    model?: string,
    stripePaymentId?: string
  ): Promise<TokenTransaction> {
    try {
      console.log('🔍 Adding token transaction:', { userId, type, amount, description, model })
      
      const result = await this.runAsync(
        'INSERT INTO token_transactions (userId, type, amount, model, description, stripePaymentId) VALUES (?, ?, ?, ?, ?, ?)',
        [userId, type, amount, model, description, stripePaymentId]
      )
      
      console.log('📊 Token transaction INSERT result:', {
        hasResult: !!result,
        lastID: result?.lastID,
        changes: result?.changes
      })
      
      if (!result || !result.lastID) {
        console.error('❌ Token transaction INSERT failed - no lastID returned')
        throw new Error('Failed to insert token transaction')
      }
      
      const transaction = await this.getAsync('SELECT * FROM token_transactions WHERE id = ?', [result.lastID])
      if (!transaction) {
        console.error('❌ Failed to retrieve token transaction after creation, ID:', result.lastID)
        throw new Error('Failed to retrieve created token transaction')
      }
      
      console.log('✅ Token transaction created successfully:', { id: transaction.id, type, amount })
      return transaction
    } catch (error) {
      console.error('💥 Database addTokenTransaction error:', error)
      throw error
    }
  }

  async getUserTokenTransactions(userId: number, limit: number = 50): Promise<TokenTransaction[]> {
    return await this.allAsync(
      'SELECT * FROM token_transactions WHERE userId = ? ORDER BY createdAt DESC LIMIT ?',
      [userId, limit]
    )
  }

  // Chat history methods
  async saveChatHistory(
    userId: number,
    sessionId: string,
    messages: any[],
    provider: string,
    model: string,
    mode: 'agent' | 'assistant',
    tokensUsed: number
  ): Promise<ChatHistory> {
    const result = await this.runAsync(
      'INSERT INTO chat_history (userId, sessionId, messages, provider, model, mode, tokensUsed) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [userId, sessionId, JSON.stringify(messages), provider, model, mode, tokensUsed]
    )
    
    return await this.getAsync('SELECT * FROM chat_history WHERE id = ?', [result.lastID])
  }

  async getUserChatHistory(userId: number, limit: number = 50): Promise<ChatHistory[]> {
    return await this.allAsync(
      'SELECT * FROM chat_history WHERE userId = ? ORDER BY createdAt DESC LIMIT ?',
      [userId, limit]
    )
  }

  // Public method for running raw SQL (needed for auth functions)
  async runRawSQL(sql: string, params?: any[]): Promise<sqlite3.RunResult> {
    return this.runAsync(sql, params)
  }

  async close() {
    return new Promise<void>((resolve, reject) => {
      this.db.close((err) => {
        if (err) reject(err)
        else resolve()
      })
    })
  }
}

export const db = new Database() 