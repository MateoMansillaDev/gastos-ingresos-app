const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

function createWindow() {
  console.log('Creating simple window...');
  
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false
    }
  });

  // Load simple HTML content
  mainWindow.loadURL('data:text/html;charset=utf-8,' + encodeURIComponent(`
    <!DOCTYPE html>
    <html>
    <head>
      <title>Simple Test</title>
      <style>
        body { 
          font-family: Arial, sans-serif; 
          padding: 20px; 
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
          color: white; 
          display: flex;
          align-items: center;
          justify-content: center;
          height: 100vh;
          margin: 0;
        }
        .container { 
          background: white; 
          color: #333; 
          padding: 30px; 
          border-radius: 10px; 
          box-shadow: 0 4px 6px rgba(0,0,0,0.1);
          text-align: center;
        }
        h1 { color: #667eea; margin-top: 0; }
        .success { 
          background: #d4edda; 
          color: #155724; 
          padding: 15px; 
          border-radius: 5px; 
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <h1>🎉 ¡Funciona!</h1>
        <div class="success">✅ Electron está funcionando correctamente</div>
        <p>Esta es una versión simplificada para verificar que Electron funciona.</p>
        <p><strong>Si puedes ver esto, significa que:</strong></p>
        <ul style="text-align: left;">
          <li>Electron se está ejecutando correctamente</li>
          <li>La ventana se crea sin problemas</li>
          <li>El contenido HTML se carga</li>
        </ul>
      </div>
    </body>
    </html>
  `));

  mainWindow.on('closed', () => {
    console.log('Window closed');
    mainWindow = null;
  });
  
  console.log('Simple window created');
}

app.whenReady().then(() => {
  console.log('App ready');
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

console.log('Simple Electron app started');