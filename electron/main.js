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

// Simple detection for development vs production
const isDev = !app.isPackaged;

let mainWindow;
let server;

// Enhanced logging
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
  log(`Created database directory: ${dbDir}`);
}

const dbFile = path.join(dbDir, 'db.json');
log(`Database file: ${dbFile}`);

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
      log('Database initialized with default data');
    } else {
      log('Database loaded successfully');
    }
    return database;
  } catch (error) {
    logError('Failed to initialize database', error);
    throw error;
  }
}

// Express server setup
function createServer() {
  log('Creating Express server...');
  const expressApp = express();
  const PORT = 3000;

  expressApp.use(cors());
  expressApp.use(express.json());

  // Serve static files from frontend
  const frontendPath = path.join(__dirname, '../frontend/dist');
  log(`Frontend path: ${frontendPath}, exists: ${fs.existsSync(frontendPath)}`);
  
  if (fs.existsSync(frontendPath)) {
    expressApp.use(express.static(frontendPath));
    log('Static files configured');
    
    // Also serve index.html for root route
    expressApp.get('/', (req, res) => {
      const indexPath = path.join(frontendPath, 'index.html');
      if (fs.existsSync(indexPath)) {
        log('Serving index.html from root route');
        res.sendFile(indexPath);
      } else {
        log('index.html not found, serving test HTML');
        res.send(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Test Page</title>
            <style>
              body { font-family: Arial, sans-serif; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
              .container { max-width: 800px; margin: 0 auto; background: white; color: #333; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
              h1 { color: #667eea; }
              .status { padding: 10px; margin: 10px 0; border-radius: 5px; }
              .success { background: #d4edda; color: #155724; }
              .info { background: #d1ecf1; color: #0c5460; }
            </style>
          </head>
          <body>
            <div class="container">
              <h1>🎉 Gestión de Finanzas - Test Page</h1>
              <div class="status success">✅ Servidor Express funcionando correctamente</div>
              <div class="status info">ℹ️ Esta es una página de prueba para verificar que la aplicación funciona</div>
              <p>Si puedes ver esto, significa que:</p>
              <ul>
                <li>El servidor Express está corriendo en el puerto 3000</li>
                <li>Los archivos estáticos se están sirviendo correctamente</li>
                <li>La ventana de Electron se está cargando</li>
              </ul>
              <p><strong>Próximo paso:</strong> Cargar la aplicación React completa</p>
            </div>
          </body>
          </html>
        `);
      }
    });
  } else {
    log('Frontend directory not found, serving test HTML');
    expressApp.get('/', (req, res) => {
      res.send(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Test Page</title>
          <style>
            body { font-family: Arial, sans-serif; padding: 20px; background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; }
            .container { max-width: 800px; margin: 0 auto; background: white; color: #333; padding: 30px; border-radius: 10px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
            h1 { color: #667eea; }
            .status { padding: 10px; margin: 10px 0; border-radius: 5px; }
            .error { background: #f8d7da; color: #721c24; }
            .info { background: #d1ecf1; color: #0c5460; }
          </style>
        </head>
        <body>
          <div class="container">
            <h1>⚠️ Gestión de Finanzas - Frontend Not Found</h1>
            <div class="status error">❌ No se encontraron los archivos del frontend</div>
            <div class="status info">ℹ️ Ruta buscada: ${frontendPath}</div>
            <p>El servidor Express está funcionando pero no puede encontrar los archivos compilados del frontend.</p>
          </div>
        </body>
        </html>
      `);
    });
  }

  // Database middleware
  expressApp.use(async (req, res, next) => {
    req.db = db;
    next();
  });

  // Auth middleware
  const authenticateToken = (req, res, next) => {
    const authHeader = req.headers.authorization;
    
    if (!authHeader) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // In Electron, we use the userId directly
    // In web, we use JWT token
    if (authHeader.startsWith('Bearer ')) {
      const token = authHeader.substring(7);
      try {
        const decoded = jwt.verify(token, 'your-secret-key-change-in-production');
        req.userId = decoded.userId;
        next();
      } catch (error) {
        return res.status(401).json({ error: 'Invalid token' });
      }
    } else {
      // Electron mode: userId directly
      req.userId = authHeader;
      next();
    }
  };

  // Auth routes
  expressApp.post('/api/auth/register', async (req, res) => {
    try {
      const { username, email, password } = req.body;
      
      if (!username || !email || !password) {
        return res.status(400).json({ error: 'All fields are required' });
      }

      const existingUser = db.data.users.find(user => user.email === email);
      if (existingUser) {
        return res.status(400).json({ error: 'User already exists' });
      }

      const hashedPassword = await bcrypt.hash(password, 10);
      const newUser = {
        id: uuidv4(),
        username,
        email,
        password: hashedPassword,
        createdAt: new Date().toISOString()
      };
      
      db.data.users.push(newUser);
      await db.write();

      const token = jwt.sign({ userId: newUser.id }, 'your-secret-key-change-in-production', { expiresIn: '7d' });
      
      res.status(201).json({
        user: {
          id: newUser.id,
          username: newUser.username,
          email: newUser.email
        },
        token
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  expressApp.post('/api/auth/login', async (req, res) => {
    try {
      const { email, password } = req.body;
      
      if (!email || !password) {
        return res.status(400).json({ error: 'Email and password are required' });
      }

      const user = db.data.users.find(user => user.email === email);
      if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const isValidPassword = await bcrypt.compare(password, user.password);
      if (!isValidPassword) {
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const token = jwt.sign({ userId: user.id }, 'your-secret-key-change-in-production', { expiresIn: '7d' });
      
      res.json({
        user: {
          id: user.id,
          username: user.username,
          email: user.email
        },
        token
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Transaction routes
  expressApp.post('/api/transactions', authenticateToken, async (req, res) => {
    try {
      const { type, amount, category, description } = req.body;
      const userId = req.userId;

      const newTransaction = {
        id: uuidv4(),
        userId,
        type,
        amount,
        category,
        description: description || '',
        date: new Date().toISOString(),
        isAutomatic: false
      };
      
      db.data.transactions.push(newTransaction);
      await db.write();
      
      res.status(201).json(newTransaction);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  expressApp.get('/api/transactions', authenticateToken, async (req, res) => {
    try {
      const userId = req.userId;
      const transactions = db.data.transactions.filter(t => t.userId === userId);
      res.json(transactions);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  expressApp.delete('/api/transactions/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.userId;

      const index = db.data.transactions.findIndex(t => t.id === id && t.userId === userId);
      if (index !== -1) {
        db.data.transactions.splice(index, 1);
        await db.write();
        res.json({ message: 'Transaction deleted' });
      } else {
        res.status(404).json({ error: 'Transaction not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  expressApp.get('/api/transactions/balance', authenticateToken, async (req, res) => {
    try {
      const userId = req.userId;
      const userTransactions = db.data.transactions.filter(t => t.userId === userId);
      const income = userTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + t.amount, 0);
      const expense = userTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + t.amount, 0);
      
      res.json({
        income,
        expense,
        balance: income - expense
      });
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  // Automatic rules routes
  expressApp.post('/api/automatic-rules', authenticateToken, async (req, res) => {
    try {
      const { type, amount, category, description, frequency, dayOfWeek, dayOfMonth } = req.body;
      const userId = req.userId;

      const newRule = {
        id: uuidv4(),
        userId,
        type,
        amount,
        category,
        description: description || '',
        frequency,
        dayOfWeek,
        dayOfMonth,
        startDate: new Date().toISOString(),
        nextExecution: new Date().toISOString(),
        isActive: true
      };
      
      db.data.automaticRules.push(newRule);
      await db.write();
      
      res.status(201).json(newRule);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  expressApp.get('/api/automatic-rules', authenticateToken, async (req, res) => {
    try {
      const userId = req.userId;
      const rules = db.data.automaticRules.filter(r => r.userId === userId);
      res.json(rules);
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  expressApp.delete('/api/automatic-rules/:id', authenticateToken, async (req, res) => {
    try {
      const { id } = req.params;
      const userId = req.userId;

      const index = db.data.automaticRules.findIndex(r => r.id === id && r.userId === userId);
      if (index !== -1) {
        db.data.automaticRules.splice(index, 1);
        await db.write();
        res.json({ message: 'Rule deleted' });
      } else {
        res.status(404).json({ error: 'Rule not found' });
      }
    } catch (error) {
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  expressApp.post('/api/automatic-rules/execute', authenticateToken, async (req, res) => {
    try {
      const userId = req.userId;
      const now = new Date();
      const dueRules = db.data.automaticRules.filter(
        r => r.userId === userId && r.isActive && new Date(r.nextExecution) <= now
      );
      
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
      res.status(500).json({ error: 'Internal server error' });
    }
  });

  expressApp.get('/health', (req, res) => {
    res.json({ status: 'OK' });
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
        nodeIntegration: false,
        contextIsolation: true,
        preload: path.join(__dirname, 'preload.js')
      }
    });

    // Cargar la aplicación
    if (isDev) {
      log('Loading development URL');
      mainWindow.loadURL('http://localhost:5173');
      mainWindow.webContents.openDevTools();
    } else {
      // In production, try to load from bundled files
      log('Attempting to load production build');
      
      // Try multiple approaches to find and load the HTML file
      const possiblePaths = [
        path.join(__dirname, '../frontend/dist/index.html'),
        path.join(__dirname, 'frontend/dist/index.html'),
        path.join(__dirname, '../../frontend/dist/index.html'),
        path.join(process.resourcesPath, 'app.asar/frontend/dist/index.html'),
        path.join(process.resourcesPath, 'frontend/dist/index.html'),
        path.join(process.resourcesPath, 'app.asar.unpacked/frontend/dist/index.html')
      ];
      
      let foundPath = null;
      for (const testPath of possiblePaths) {
        log(`Testing path: ${testPath}, exists: ${fs.existsSync(testPath)}`);
        if (fs.existsSync(testPath)) {
          foundPath = testPath;
          log(`Found file at: ${foundPath}`);
          break;
        }
      }
      
      if (foundPath) {
        log(`Loading file: ${foundPath}`);
        mainWindow.loadFile(foundPath);
      } else {
        // If file not found, try loading from local server
        log('HTML file not found, trying local server');
        mainWindow.loadURL('http://localhost:3000');
      }
    }

    mainWindow.on('closed', () => {
      log('Main window closed');
      mainWindow = null;
    });
    
    mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
      logError('Failed to load content', { errorCode, errorDescription });
      
      // If HTML file fails, try the local server
      if (!isDev) {
        log('HTML load failed, trying local server as fallback');
        mainWindow.loadURL('http://localhost:3000');
      }
    });
    
    mainWindow.webContents.on('did-finish-load', () => {
      log('Page loaded successfully');
    });
    
    mainWindow.webContents.on('did-frame-finish-load', () => {
      log('Frame loaded successfully');
    });
    
    mainWindow.webContents.on('console-message', (event, level, message) => {
      log(`Renderer console [${level}]: ${message}`);
    });
    
    mainWindow.webContents.on('dom-ready', () => {
      log('DOM is ready');
    });
  } catch (error) {
    logError('Failed to create window', error);
    throw error;
  }
}

app.whenReady().then(async () => {
  try {
    log('App ready, initializing...');
    
    // Initialize database
    db = await initializeDatabase();
    
    // Start server
    await createServer();
    
    // Create window
    createWindow();

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        createWindow();
      }
    });
    
    log('App initialized successfully');
  } catch (error) {
    logError('Error initializing app', error);
    // Show error dialog
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

// IPC handlers para comunicación con el renderer
ipcMain.handle('get-app-version', () => {
  return app.getVersion();
});