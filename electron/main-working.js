const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const express = require('express');
const cors = require('cors');
const { Low } = require('lowdb');
const { JSONFile } = require('lowdb/node');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');

const isDev = !app.isPackaged;
let mainWindow;
let server;

function log(message) {
  console.log(`[App] ${message}`);
}

function logError(message, error) {
  console.error(`[App Error] ${message}`, error);
}

// Database setup
const appDataPath = app.getPath('userData');
log(`App data path: ${appDataPath}`);

const dbDir = path.join(appDataPath, 'data');
if (!fs.existsSync(dbDir)) {
  fs.mkdirSync(dbDir, { recursive: true });
}

const dbFile = path.join(dbDir, 'db.json');
const adapter = new JSONFile(dbFile);
const defaultData = {
  users: [],
  transactions: [],
  automaticRules: []
};

let db;

async function initializeDatabase() {
  try {
    log('Initializing database...');
    const database = new Low(adapter, defaultData);
    await database.read();
    if (!database.data) {
      database.data = defaultData;
      await database.write();
    }
    return database;
  } catch (error) {
    logError('Failed to initialize database', error);
    throw error;
  }
}

function createServer() {
  log('Creating Express server...');
  const expressApp = express();
  const PORT = 3000;

  expressApp.use(cors());
  expressApp.use(express.json());

  // Serve static files from electron directory
  expressApp.use(express.static(__dirname));
  
  // Serve HTML file
  expressApp.get('/', (req, res) => {
    log('Serving HTML page');
    res.sendFile(path.join(__dirname, 'index.html'));
  });

  // Database middleware
  expressApp.use(async (req, res, next) => {
    req.db = db;
    log(`API Request: ${req.method} ${req.path}`);
    next();
  });

  // Transaction routes
  expressApp.post('/api/transactions', async (req, res) => {
    try {
      const { type, amount, category, description } = req.body;
      const userId = req.headers.authorization || 'default-user';

      const newTransaction = {
        id: uuidv4(),
        userId,
        type,
        amount: parseFloat(amount),
        category,
        description: description || '',
        date: new Date().toISOString(),
        isAutomatic: false
      };
      
      log(`Adding transaction: ${JSON.stringify(newTransaction)}`);
      db.data.transactions.push(newTransaction);
      await db.write();
      log(`Transaction added successfully. Total transactions: ${db.data.transactions.length}`);
      
      res.status(201).json(newTransaction);
    } catch (error) {
      logError('Error adding transaction', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  expressApp.get('/api/transactions', async (req, res) => {
    try {
      const userId = req.headers.authorization || 'default-user';
      const transactions = db.data.transactions.filter(t => t.userId === userId);
      res.json(transactions);
    } catch (error) {
      logError('Error getting transactions', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  expressApp.delete('/api/transactions/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.headers.authorization || 'default-user';

      const index = db.data.transactions.findIndex(t => t.id === id && t.userId === userId);
      if (index !== -1) {
        db.data.transactions.splice(index, 1);
        await db.write();
        res.json({ message: 'Transaction deleted' });
      } else {
        res.status(404).json({ error: 'Transaction not found' });
      }
    } catch (error) {
      logError('Error deleting transaction', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  expressApp.get('/api/transactions/balance', async (req, res) => {
    try {
      const userId = req.headers.authorization || 'default-user';
      const userTransactions = db.data.transactions.filter(t => t.userId === userId);
      const income = userTransactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
      const expense = userTransactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
      
      res.json({ income, expense, balance: income - expense });
    } catch (error) {
      logError('Error getting balance', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Automatic rules routes
  expressApp.post('/api/automatic-rules', async (req, res) => {
    try {
      const { type, amount, category, description, frequency, dayOfWeek, dayOfMonth } = req.body;
      const userId = req.headers.authorization || 'default-user';

      const newRule = {
        id: uuidv4(),
        userId,
        type,
        amount: parseFloat(amount),
        category,
        description: description || '',
        frequency,
        dayOfWeek: dayOfWeek ? parseInt(dayOfWeek) : undefined,
        dayOfMonth: dayOfMonth ? parseInt(dayOfMonth) : undefined,
        startDate: new Date().toISOString(),
        nextExecution: new Date().toISOString(),
        isActive: true
      };
      
      log(`Adding automatic rule: ${JSON.stringify(newRule)}`);
      db.data.automaticRules.push(newRule);
      await db.write();
      log(`Automatic rule added successfully. Total rules: ${db.data.automaticRules.length}`);
      
      res.status(201).json(newRule);
    } catch (error) {
      logError('Error adding automatic rule', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  expressApp.get('/api/automatic-rules', async (req, res) => {
    try {
      const userId = req.headers.authorization || 'default-user';
      const rules = db.data.automaticRules.filter(r => r.userId === userId);
      res.json(rules);
    } catch (error) {
      logError('Error getting automatic rules', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  expressApp.delete('/api/automatic-rules/:id', async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.headers.authorization || 'default-user';

      const index = db.data.automaticRules.findIndex(r => r.id === id && r.userId === userId);
      if (index !== -1) {
        db.data.automaticRules.splice(index, 1);
        await db.write();
        res.json({ message: 'Rule deleted' });
      } else {
        res.status(404).json({ error: 'Rule not found' });
      }
    } catch (error) {
      logError('Error deleting automatic rule', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  expressApp.post('/api/automatic-rules/execute', async (req, res) => {
    try {
      const userId = req.headers.authorization || 'default-user';
      const now = new Date();
      const dueRules = db.data.automaticRules.filter(
        r => r.userId === userId && r.isActive && new Date(r.nextExecution) <= now
      );
      
      log(`Executing ${dueRules.length} automatic rules`);
      const executedTransactions = [];
      
      for (const rule of dueRules) {
        const transaction = {
          id: uuidv4(),
          userId: rule.userId,
          type: rule.type,
          amount: rule.amount,
          category: rule.category,
          description: rule.description,
          date: new Date().toISOString(),
          isAutomatic: true,
          automaticRuleId: rule.id
        };
        
        db.data.transactions.push(transaction);
        executedTransactions.push(transaction);
        
        // Update next execution
        const nextDate = new Date(rule.nextExecution);
        if (rule.frequency === 'weekly') {
          nextDate.setDate(nextDate.getDate() + 7);
        } else {
          nextDate.setMonth(nextDate.getMonth() + 1);
        }
        rule.nextExecution = nextDate.toISOString();
      }
      
      await db.write();
      
      res.json({
        message: `Executed ${executedTransactions.length} automatic transactions`,
        transactions: executedTransactions
      });
    } catch (error) {
      logError('Error executing automatic rules', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  expressApp.get('/health', (req, res) => {
    log('Health check requested');
    res.json({ status: 'OK', transactions: db.data.transactions.length, rules: db.data.automaticRules.length });
  });

  return new Promise((resolve, reject) => {
    server = expressApp.listen(PORT, () => {
      log(`Server running on port ${PORT}`);
      resolve();
    });
    
    server.on('error', (error) => {
      logError('Server error', error);
      reject(error);
    });
  });
}

function createWindow() {
  try {
    log('Creating main window...');
    mainWindow = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false
      }
    });

    mainWindow.loadURL('http://localhost:3000');

    mainWindow.on('closed', () => {
      log('Main window closed');
      mainWindow = null;
    });
    
    mainWindow.webContents.on('did-finish-load', () => {
      log('Page loaded successfully');
    });
    
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      logError('Failed to load content', { errorCode, errorDescription });
    });
  } catch (error) {
    logError('Failed to create window', error);
    throw error;
  }
}

app.whenReady().then(async () => {
  try {
    log('App ready, initializing...');
    
    db = await initializeDatabase();
    await createServer();
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
    
    log('App initialized successfully');
  } catch (error) {
    logError('Error initializing app', error);
    const { dialog } = require('electron');
    dialog.showErrorBox('Error de Inicialización', 
      `La aplicación no pudo iniciarse: ${error.message}\n\nDetalles: ${error.stack}`);
    app.quit();
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    if (server) {
      server.close();
    }
    app.quit();
  }
});

app.on('before-quit', () => {
  if (server) {
    server.close();
  }
});

ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});