import { app, BrowserWindow, globalShortcut, clipboard, ipcMain, Menu, Tray, nativeImage } from 'electron';
import * as path from 'path';
import { electronApp, optimizer, is } from '@electron-toolkit/utils';

class LLMDesktopApp {
  private mainWindow: BrowserWindow | null = null;
  private tray: Tray | null = null;
  private isQuitting = false;

  constructor() {
    this.initializeApp();
  }

  private initializeApp() {
    // 当 Electron 完成初始化时触发
    app.whenReady().then(() => {
      this.createWindow();
      this.createTray();
      this.registerGlobalShortcuts();
      this.setupIpcHandlers();
      this.setupAppEvents();
    });

    // 当所有窗口关闭时
    app.on('window-all-closed', () => {
      if (process.platform !== 'darwin') {
        app.quit();
      }
    });

    app.on('activate', () => {
      if (BrowserWindow.getAllWindows().length === 0) {
        this.createWindow();
      }
    });

    app.on('before-quit', () => {
      this.isQuitting = true;
    });
  }

  private createWindow() {
    this.mainWindow = new BrowserWindow({
      width: 1000,
      height: 700,
      minWidth: 800,
      minHeight: 600,
      show: false,
      titleBarStyle: 'hiddenInset', // Mac风格的标题栏
      trafficLightPosition: { x: 20, y: 20 },
      webPreferences: {
        preload: path.join(__dirname, '../preload/preload.js'),
        nodeIntegration: false,
        contextIsolation: true,
        webSecurity: true
      }
    });

    // 加载应用
    if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
      this.mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL']);
    } else {
      this.mainWindow.loadFile(path.join(__dirname, '../renderer/index.html'));
    }

    // 窗口准备就绪时显示
    this.mainWindow.once('ready-to-show', () => {
      this.mainWindow?.show();
    });

    // 关闭窗口时隐藏到托盘（Mac风格）
    this.mainWindow.on('close', (event) => {
      if (!this.isQuitting) {
        event.preventDefault();
        this.mainWindow?.hide();
      }
    });

    // 开发者工具
    if (is.dev) {
      this.mainWindow.webContents.openDevTools();
    }
  }

  private createTray() {
    // 创建托盘图标
    const icon = nativeImage.createFromPath(
      path.join(__dirname, '../../assets/tray-icon.png')
    ).resize({ width: 16, height: 16 });
    
    this.tray = new Tray(icon);
    
    const contextMenu = Menu.buildFromTemplate([
      {
        label: '显示主窗口',
        click: () => {
          this.mainWindow?.show();
        }
      },
      {
        label: '快速翻译',
        accelerator: 'Cmd+Shift+T',
        click: () => {
          this.quickTranslate();
        }
      },
      {
        label: '问AI问题',
        accelerator: 'Cmd+Shift+A',
        click: () => {
          this.quickAskAI();
        }
      },
      { type: 'separator' },
      {
        label: '设置',
        click: () => {
          this.mainWindow?.show();
          this.mainWindow?.webContents.send('navigate-to', '/settings');
        }
      },
      { type: 'separator' },
      {
        label: '退出',
        accelerator: 'Cmd+Q',
        click: () => {
          this.isQuitting = true;
          app.quit();
        }
      }
    ]);

    this.tray.setContextMenu(contextMenu);
    this.tray.setToolTip('LLM Office Assistant');

    // 点击托盘图标显示窗口
    this.tray.on('click', () => {
      this.mainWindow?.show();
    });
  }

  private registerGlobalShortcuts() {
    // 注册全局快捷键
    globalShortcut.register('Cmd+Shift+T', () => {
      this.quickTranslate();
    });

    globalShortcut.register('Cmd+Shift+A', () => {
      this.quickAskAI();
    });

    globalShortcut.register('Cmd+Shift+G', () => {
      this.quickGrammarCheck();
    });

    globalShortcut.register('Cmd+Shift+E', () => {
      this.quickEmailRefine();
    });
  }

  private setupIpcHandlers() {
    // 获取剪贴板内容
    ipcMain.handle('get-clipboard-text', () => {
      return clipboard.readText();
    });

    // 设置剪贴板内容
    ipcMain.handle('set-clipboard-text', (_, text: string) => {
      clipboard.writeText(text);
      return true;
    });

    // 最小化窗口
    ipcMain.handle('minimize-window', () => {
      this.mainWindow?.minimize();
    });

    // 关闭窗口（隐藏到托盘）
    ipcMain.handle('close-window', () => {
      this.mainWindow?.hide();
    });

    // 显示窗口
    ipcMain.handle('show-window', () => {
      this.mainWindow?.show();
      this.mainWindow?.focus();
    });

    // 检查窗口是否可见
    ipcMain.handle('is-window-visible', () => {
      return this.mainWindow?.isVisible() || false;
    });
  }

  private setupAppEvents() {
    app.on('will-quit', () => {
      // 注销所有全局快捷键
      globalShortcut.unregisterAll();
    });
  }

  private async quickTranslate() {
    const text = clipboard.readText();
    if (text && this.isLikelyEnglish(text)) {
      this.showQuickActionWindow('translate', text);
    } else {
      this.showNotification('请先复制英文内容到剪贴板');
    }
  }

  private async quickAskAI() {
    const text = clipboard.readText();
    if (text.trim()) {
      this.showQuickActionWindow('ask_ai', text);
    } else {
      this.showNotification('请先复制内容到剪贴板');
    }
  }

  private async quickGrammarCheck() {
    const text = clipboard.readText();
    if (text && this.isLikelyEnglish(text)) {
      this.showQuickActionWindow('grammar_check', text);
    } else {
      this.showNotification('请先复制英文内容到剪贴板');
    }
  }

  private async quickEmailRefine() {
    const text = clipboard.readText();
    if (text && this.isLikelyEnglish(text)) {
      this.showQuickActionWindow('email_refine', text);
    } else {
      this.showNotification('请先复制英文内容到剪贴板');
    }
  }

  private showQuickActionWindow(action: string, text: string) {
    this.mainWindow?.show();
    this.mainWindow?.focus();
    this.mainWindow?.webContents.send('quick-action', { action, text });
  }

  private showNotification(message: string) {
    // 可以使用 Electron 的 Notification API 或发送到渲染进程
    this.mainWindow?.webContents.send('show-notification', message);
  }

  private isLikelyEnglish(text: string): boolean {
    const cleanText = text.trim();
    if (cleanText.length < 3) return false;

    const englishCharRegex = /[a-zA-Z]/g;
    const chineseCharRegex = /[\u4e00-\u9fa5]/g;
    const englishMatches = cleanText.match(englishCharRegex);
    const chineseMatches = cleanText.match(chineseCharRegex);

    const englishRatio = englishMatches ? englishMatches.length / cleanText.length : 0;
    const chineseRatio = chineseMatches ? chineseMatches.length / cleanText.length : 0;

    return englishRatio > 0.5 && chineseRatio < 0.1;
  }
}

// 启动应用
new LLMDesktopApp(); 