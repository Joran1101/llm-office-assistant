// 浏览器兼容性处理工具
class BrowserCompat {
  constructor() {
    this.browserType = this.detectBrowser();
    this.api = this.getBrowserAPI();
    
    console.log(`🌐 检测到浏览器类型: ${this.browserType}`);
  }

  // 检测浏览器类型
  detectBrowser() {
    const userAgent = navigator.userAgent.toLowerCase();
    
    if (userAgent.includes('edg/') || userAgent.includes('edge/')) {
      return 'edge';
    } else if (userAgent.includes('chrome') && !userAgent.includes('edg')) {
      return 'chrome';
    } else if (userAgent.includes('firefox')) {
      return 'firefox';
    } else if (userAgent.includes('safari') && !userAgent.includes('chrome')) {
      return 'safari';
    }
    
    return 'unknown';
  }

  // 获取浏览器API对象
  getBrowserAPI() {
    // Edge和Chrome都使用chrome API
    if (typeof chrome !== 'undefined' && chrome.runtime) {
      return chrome;
    }
    // Firefox使用browser API
    if (typeof browser !== 'undefined' && browser.runtime) {
      return browser;
    }
    
    throw new Error('不支持的浏览器环境');
  }

  // 统一的存储API
  async getStorage(keys) {
    return new Promise((resolve, reject) => {
      this.api.storage.sync.get(keys, (result) => {
        if (this.api.runtime.lastError) {
          reject(new Error(this.api.runtime.lastError.message));
        } else {
          resolve(result);
        }
      });
    });
  }

  async setStorage(items) {
    return new Promise((resolve, reject) => {
      this.api.storage.sync.set(items, () => {
        if (this.api.runtime.lastError) {
          reject(new Error(this.api.runtime.lastError.message));
        } else {
          resolve();
        }
      });
    });
  }

  // 统一的消息传递API
  async sendMessage(message) {
    return new Promise((resolve, reject) => {
      this.api.runtime.sendMessage(message, (response) => {
        if (this.api.runtime.lastError) {
          reject(new Error(this.api.runtime.lastError.message));
        } else {
          resolve(response);
        }
      });
    });
  }

  // 统一的标签页API
  async sendTabMessage(tabId, message) {
    return new Promise((resolve, reject) => {
      this.api.tabs.sendMessage(tabId, message, (response) => {
        if (this.api.runtime.lastError) {
          reject(new Error(this.api.runtime.lastError.message));
        } else {
          resolve(response);
        }
      });
    });
  }

  // 统一的通知API
  showNotification(title, message, options = {}) {
    const notificationOptions = {
      type: 'basic',
      iconUrl: 'icons/icon48.png',
      title: title,
      message: message,
      ...options
    };

    if (this.api.notifications) {
      this.api.notifications.create(notificationOptions);
    } else {
      // 降级到基本通知
      console.log(`通知: ${title} - ${message}`);
    }
  }

  // Edge特定优化
  getEdgeOptimizations() {
    if (this.browserType !== 'edge') {
      return {};
    }

    return {
      // Edge特定的API调用优化
      enhancedPermissions: true,
      improvedContentScriptInjection: true,
      betterStorageSync: true
    };
  }

  // 获取浏览器特定配置
  getBrowserConfig() {
    const baseConfig = {
      maxStorageSize: 100 * 1024, // 100KB
      apiTimeout: 30000, // 30秒
      retryAttempts: 3
    };

    switch (this.browserType) {
      case 'edge':
        return {
          ...baseConfig,
          maxStorageSize: 1024 * 1024, // Edge支持更大存储
          improvedPerformance: true,
          nativeIntegration: true
        };
      
      case 'chrome':
        return {
          ...baseConfig,
          syncStorage: true,
          unlimitedStorage: true
        };
      
      default:
        return baseConfig;
    }
  }
}

// 创建全局实例
if (typeof window !== 'undefined') {
  window.browserCompat = new BrowserCompat();
} else if (typeof globalThis !== 'undefined') {
  globalThis.browserCompat = new BrowserCompat();
} 