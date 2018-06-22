const {app, BrowserWindow} = require('electron');
const path=require('path');
const Sails = require('sails').constructor;
const sailsApp = new Sails();
var mainWindow;
//let create a browser window
function createWindow () {
    const{screen}= require('electron');
  let mainScreen = screen.getPrimaryDisplay();
     let dimensions = mainScreen.size;
     let shouldQuit = makeSingleInstance()
      if (shouldQuit) return app.quit()
      mainWindow = new BrowserWindow({
        width: dimensions.width,
        height: dimensions.height,
        title: "DesktopApp",
        center: true
      });

      mainWindow.on('closed', function () {
        mainWindow = null
      });
//   mainWindow.webContents.openDevTools();
  mainWindow.setMenu(null);

  initialize()
}

//lift sails app
function initialize(){
   sailsApp.lift({
    "paths": {
         "public": "assets"
        },
        "appPath":__dirname
     }, function (err) {
  if (err) {
    console.log('Error occurred loading Sails app:', err);
    return;
  }

   console.log('Sails app loaded successfully!');
 //after lifting load url
   mainWindow.loadURL('http://localhost:1340');
   mainWindow.webContents.on('did-finish-load', function() {
   mainWindow.focus();
   })
  });
 }

app.disableHardwareAcceleration();
//app closed shut down sails app
app.on('quit', function () {
  sailsApp.lower(
  function (err) {
    if (err) {
      return console.log("A ocurrido un error, cerrar la aplicacion en los procesos windows ", err);
    }

     process.exit(err ? 1 : 0);
    console.log("Aplicación Funcionando");
  }

)
});
app.on('ready',function(){
    createWindow()
})
app.on('window-all-closed', function () {
  if (process.platform !== 'win32') {
    app.quit()
  }

});

app.on('activate', function () {
  if (mainWindow === null) {
    createWindow()
  }

});
//if app is already opened dont open again
function makeSingleInstance () {
  if (process.mas) return false

  return app.makeSingleInstance(function () {
    if (mainWindow) {
      if (mainWindow.isMinimized()) mainWindow.restore()
      mainWindow.focus()
    }

  })
}