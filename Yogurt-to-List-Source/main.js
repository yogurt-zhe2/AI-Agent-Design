// Electron main process — Yogurt to List Agent
const { app, BrowserWindow, Menu } = require('electron');
const path = require('path');

// 隐藏 Mac 默认菜单栏（HTML 里自定义工具栏）
Menu.setApplicationMenu(null);

let mainWindow = null;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 900,
    height: 700,
    minWidth: 700,
    minHeight: 500,
    title: 'Yogurt to List Agent',
    // hiddenInset: 保留红绿灯按钮，标题栏融入内容
    // 工具栏用 CSS -webkit-app-region: drag 实现拖拽
    titleBarStyle: 'hiddenInset',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true
    }
  });

  mainWindow.loadFile('src/index.html');

  // 内容安全策略：限制资源加载来源
  mainWindow.webContents.session.webRequest.onHeadersReceived((details, callback) => {
    callback({
      responseHeaders: {
        ...details.responseHeaders,
        'Content-Security-Policy': [
          "default-src 'self'; " +
          "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; " +
          "font-src 'self' https://fonts.gstatic.com; " +
          "connect-src 'self' https://api.deepseek.com https://open.bigmodel.cn https://api.moonshot.cn https://dashscope.aliyuncs.com https://ark.cn-beijing.volces.com; " +
          "script-src 'self'; " +
          "img-src 'self' data:;"
        ]
      }
    });
  });

  // 关闭时最小化到后台（Mac 体验优化）
  mainWindow.on('close', (e) => {
    if (!app.isQuitting) {
      e.preventDefault();
      mainWindow.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

// 防止 Mac 上关闭所有窗口后 app 退出
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  } else {
    mainWindow.show();
  }
});

// 真正退出时设置标记
app.on('before-quit', () => {
  app.isQuitting = true;
});

app.whenReady().then(createWindow);
