// Modules to control application life and create native browser window
const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');
const { spawn } = require('child_process');

let childProcess;

function createMenu() {
  return new Menu();
}

function startServer() {
  return new Promise((resolve, reject) => {
    // Instantiate express server
    const clientDir = path.join(__dirname, '../client');
    const server = path.join(__dirname, '../build/app/index.js');
    childProcess = spawn('node', [server, '--client', path.join(clientDir, 'dist/client')], { shell: true });
    childProcess.stdout.on('data', message => {
      message = message.toString();
      console.log(message);
      if (message.trim() === 'Server start') {
        console.log('Server has started!');
        resolve();
      }
    });
    childProcess.stderr.on('data', message => console.log('Error:\n\r' + message));
    childProcess.on('exit', message => {
      console.log('Child process exited with code: ', message);
      reject();
    });
  });
}

async function createWindow() {
  const dirname = path.join(__dirname, '.');
  await startServer();

  // Create the browser window.
  const mainWindow = new BrowserWindow({
    // show: false,
    width: 1024,
    height: 768,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: true,
      webSecurity: false
    }
  });

  // and load the index.html of the app.
  mainWindow.loadURL('http://localhost:8000');

  // Open the DevTools.
  // mainWindow.webContents.openDevTools();

  Menu.setApplicationMenu(createMenu());
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow();

  app.on('activate', function() {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function() {
  console.log('app closing...');
  if (childProcess) childProcess.kill('SIGINT');
  setTimeout(() => {
    if (process.platform !== 'darwin') app.quit();
  }, 10);
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.
