import { contextBridge, ipcRenderer } from 'electron';

// 暴露安全的API给渲染进程
const electronAPI = {
  // 剪贴板操作
  getClipboardText: () => ipcRenderer.invoke('get-clipboard-text'),
  setClipboardText: (text: string) => ipcRenderer.invoke('set-clipboard-text', text),

  // 窗口操作
  minimizeWindow: () => ipcRenderer.invoke('minimize-window'),
  closeWindow: () => ipcRenderer.invoke('close-window'),
  showWindow: () => ipcRenderer.invoke('show-window'),
  isWindowVisible: () => ipcRenderer.invoke('is-window-visible'),

  // 监听事件
  onQuickAction: (callback: (data: { action: string; text: string }) => void) => {
    ipcRenderer.on('quick-action', (_, data) => callback(data));
  },

  onShowNotification: (callback: (message: string) => void) => {
    ipcRenderer.on('show-notification', (_, message) => callback(message));
  },

  onNavigateTo: (callback: (route: string) => void) => {
    ipcRenderer.on('navigate-to', (_, route) => callback(route));
  },

  // 移除监听器
  removeAllListeners: (channel: string) => {
    ipcRenderer.removeAllListeners(channel);
  }
};

contextBridge.exposeInMainWorld('electronAPI', electronAPI);

// 类型声明
declare global {
  interface Window {
    electronAPI: typeof electronAPI;
  }
} 