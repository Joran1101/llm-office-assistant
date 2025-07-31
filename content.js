// Content Script - 页面内容脚本
class LLMContentScript {
  constructor() {
    this.isEmailPage = false;
    this.currentPromptBox = null;
    this.currentResultBox = null;
    this.currentQuestionBox = null; // 新增：问题编辑框
    
    // 剪切板权限管理
    this.clipboardPermissionGranted = false;
    this.clipboardPermissionRequested = false;
    
    this.initEventListeners();
    this.injectStyles();
    this.initClipboardPermissions();
  }

  initEventListeners() {
    // 监听复制事件
    document.addEventListener('copy', this.handleCopyEvent.bind(this));
    
    // 监听来自background script的消息
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      this.handleMessage(message, sender, sendResponse);
    });
  }

  // 剪切板权限管理
  async initClipboardPermissions() {
    try {
      console.log('🔄 初始化剪切板权限检查...');
      
      // 从存储中检查权限状态
      const storage = await this.getStorageData(['clipboardPermissionGranted', 'clipboardPermissionRequested']);
      
      if (storage.clipboardPermissionGranted) {
        // 验证权限是否仍然有效
        const permissionStatus = await this.getClipboardPermissionStatus();
        if (permissionStatus) {
          this.clipboardPermissionGranted = true;
          this.clipboardPermissionRequested = true;
          console.log('✅ LLM Assistant: 剪切板权限已授予并验证');
          return;
        } else {
          // 权限可能被撤销，重置状态
          console.log('⚠️ 剪切板权限可能被撤销，重置状态');
          this.clipboardPermissionGranted = false;
          this.clipboardPermissionRequested = false;
          await this.saveStorageData({ 
            clipboardPermissionGranted: false,
            clipboardPermissionRequested: false 
          });
        }
      }

      console.log('ℹ️ LLM Assistant: 剪切板权限初始化完成，等待首次使用触发权限请求');
    } catch (error) {
      console.warn('⚠️ LLM Assistant: 剪切板权限初始化失败:', error);
      // 重置为未授权状态
      this.clipboardPermissionGranted = false;
      this.clipboardPermissionRequested = false;
    }
  }

  async getClipboardPermissionStatus() {
    try {
      if (!navigator.permissions) {
        console.log('浏览器不支持权限API，将在实际使用时检测');
        return false;
      }
      
      const permission = await navigator.permissions.query({ name: 'clipboard-read' });
      console.log('🔍 当前剪切板权限状态:', permission.state);
      return permission.state === 'granted';
    } catch (error) {
      console.warn('检查剪切板权限状态失败:', error);
      return false;
    }
  }

  async requestClipboardPermission() {
    try {
      console.log('🔒 开始请求剪切板权限...');
      
      // 检查是否已经在请求中（避免重复弹窗）
      if (this.clipboardPermissionRequested && !this.clipboardPermissionGranted) {
        console.log('⏳ 权限请求已在进行中，等待用户响应');
        return false;
      }

      this.clipboardPermissionRequested = true;
      
      // 保存已请求状态（但不保存授权状态，让用户决定）
      await this.saveStorageData({ clipboardPermissionRequested: true });

      // 显示友好的权限请求提示，等待用户点击
      console.log('📋 显示权限请求对话框');
      return new Promise((resolve) => {
        this.showClipboardPermissionDialog(resolve);
      });
    } catch (error) {
      console.error('❌ LLM Assistant: 请求剪切板权限失败:', error);
      this.hideClipboardPermissionDialog();
      return false;
    }
  }

  showClipboardPermissionDialog(resolveCallback) {
    // 避免重复显示
    if (document.getElementById('llm-clipboard-permission-dialog')) {
      return;
    }

    const dialog = document.createElement('div');
    dialog.id = 'llm-clipboard-permission-dialog';
    dialog.innerHTML = `
      <div class="llm-permission-content">
        <div class="llm-permission-header">
          <div class="llm-logo">🤖</div>
          <h3>欢迎使用 LLM Office Assistant！</h3>
          <p class="llm-subtitle">您的智能办公助手</p>
        </div>
        <div class="llm-permission-body">
          <div class="llm-intro-section">
            <h4>🚀 插件功能介绍</h4>
            <p>LLM Office Assistant 是一款强大的浏览器扩展，为您提供四大核心功能：</p>
            <div class="llm-features-grid">
              <div class="llm-feature-item">
                <span class="feature-icon">🌐</span>
                <div>
                  <strong>智能翻译</strong>
                  <small>支持多种语言互译，准确理解上下文</small>
                </div>
              </div>
              <div class="llm-feature-item">
                <span class="feature-icon">🤖</span>
                <div>
                  <strong>AI 问答</strong>
                  <small>智能回答问题，提供专业解答</small>
                </div>
              </div>
              <div class="llm-feature-item">
                <span class="feature-icon">✏️</span>
                <div>
                  <strong>语法检查</strong>
                  <small>自动检测并修正语法错误</small>
                </div>
              </div>
              <div class="llm-feature-item">
                <span class="feature-icon">✉️</span>
                <div>
                  <strong>邮件润色</strong>
                  <small>优化邮件措辞，提升专业形象</small>
                </div>
              </div>
            </div>
          </div>
          
          <div class="llm-how-to-use">
            <h4>📝 如何使用</h4>
            <div class="llm-usage-steps">
              <div class="step">
                <span class="step-number">1</span>
                <span>复制任意文本内容</span>
              </div>
              <div class="step">
                <span class="step-number">2</span>
                <span>选择需要的功能</span>
              </div>
              <div class="step">
                <span class="step-number">3</span>
                <span>获得AI智能处理结果</span>
              </div>
            </div>
          </div>

          <div class="llm-permission-request">
            <h4>🔒 权限申请</h4>
            <p><strong>为了自动检测您复制的内容，需要获得剪切板访问权限：</strong></p>
            <ul class="permission-reasons">
              <li>📋 实时检测复制操作，无需手动触发</li>
              <li>⚡ 提供流畅的用户体验</li>
              <li>🎯 精准识别文本内容类型</li>
            </ul>
          </div>
          
          <div class="llm-permission-note">
            <strong>🔐 隐私承诺：</strong>
            <ul class="privacy-points">
              <li>✅ 仅在您主动复制时读取剪切板</li>
              <li>✅ 数据仅用于提供智能功能</li>
              <li>✅ 不会存储或上传敏感信息</li>
              <li>✅ 您可随时在浏览器设置中撤销权限</li>
            </ul>
          </div>
          
          <div class="llm-permission-instruction">
            <strong>💡 提示：</strong>点击"立即体验"后，浏览器会弹出权限确认对话框，请选择"允许"以启用所有功能
          </div>
        </div>
        <div class="llm-permission-footer">
          <button class="llm-permission-btn allow">🚀 立即体验</button>
          <button class="llm-permission-btn deny">稍后设置</button>
        </div>
      </div>
    `;

    // 添加样式
    const style = document.createElement('style');
    style.textContent = `
      #llm-clipboard-permission-dialog {
        position: fixed;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: rgba(0, 0, 0, 0.7);
        backdrop-filter: blur(8px);
        z-index: 1000000;
        display: flex;
        align-items: center;
        justify-content: center;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        animation: fadeIn 0.5s ease-out;
      }

      .llm-permission-content {
        background: white;
        border-radius: 20px;
        box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
        max-width: 600px;
        margin: 20px;
        overflow: hidden;
        animation: slideIn 0.5s ease-out;
        border: 3px solid #667eea;
        max-height: 90vh;
        overflow-y: auto;
      }

      .llm-permission-header {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        padding: 25px 20px;
        text-align: center;
      }

      .llm-logo {
        font-size: 32px;
        margin-bottom: 8px;
      }

      .llm-permission-header h3 {
        margin: 0 0 5px 0;
        font-size: 20px;
        font-weight: 600;
      }

      .llm-subtitle {
        margin: 0;
        font-size: 14px;
        opacity: 0.9;
        font-weight: 400;
      }

      .llm-permission-body {
        padding: 20px 24px;
        line-height: 1.6;
        color: #000000;
        font-weight: 500;
      }

      .llm-intro-section {
        margin-bottom: 20px;
      }

      .llm-intro-section h4 {
        margin: 0 0 10px 0;
        color: #000000;
        font-size: 16px;
        font-weight: 600;
      }

      .llm-intro-section p {
        margin: 0 0 15px 0;
        color: #000000;
        font-weight: 500;
      }

      .llm-features-grid {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 12px;
        margin: 15px 0;
      }

      .llm-feature-item {
        display: flex;
        align-items: flex-start;
        gap: 10px;
        padding: 12px;
        background: #f8f9fa;
        border-radius: 8px;
        border: 1px solid #e9ecef;
      }

      .feature-icon {
        font-size: 18px;
        flex-shrink: 0;
      }

      .llm-feature-item strong {
        display: block;
        color: #000000;
        font-weight: 600;
        font-size: 14px;
        margin-bottom: 2px;
      }

      .llm-feature-item small {
        color: #6c757d;
        font-size: 12px;
        line-height: 1.3;
      }

      .llm-how-to-use {
        margin: 20px 0;
        padding: 15px;
        background: #f8f9fa;
        border-radius: 10px;
        border: 1px solid #e9ecef;
      }

      .llm-how-to-use h4 {
        margin: 0 0 12px 0;
        color: #000000;
        font-size: 16px;
        font-weight: 600;
      }

      .llm-usage-steps {
        display: flex;
        gap: 15px;
        align-items: center;
      }

      .step {
        display: flex;
        align-items: center;
        gap: 8px;
        font-size: 13px;
        color: #000000;
        font-weight: 500;
      }

      .step-number {
        background: #667eea;
        color: white;
        width: 20px;
        height: 20px;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        font-weight: 600;
        flex-shrink: 0;
      }

      .llm-permission-request {
        margin: 20px 0;
      }

      .llm-permission-request h4 {
        margin: 0 0 10px 0;
        color: #000000;
        font-size: 16px;
        font-weight: 600;
      }

      .llm-permission-request p {
        margin: 0 0 10px 0;
        color: #000000;
        font-weight: 500;
      }

      .permission-reasons {
        margin: 10px 0;
        padding-left: 20px;
      }

      .permission-reasons li {
        margin: 6px 0;
        color: #000000;
        font-weight: 500;
        font-size: 14px;
      }

      .llm-permission-note {
        background: #f0f9ff;
        border: 1px solid #bae6fd;
        border-radius: 10px;
        padding: 15px;
        margin: 20px 0;
      }

      .llm-permission-note strong {
        color: #0c4a6e;
        font-weight: 600;
        font-size: 14px;
        display: block;
        margin-bottom: 8px;
      }

      .privacy-points {
        margin: 0;
        padding-left: 0;
        list-style: none;
      }

      .privacy-points li {
        margin: 4px 0;
        color: #0c4a6e;
        font-weight: 500;
        font-size: 13px;
      }

      .llm-permission-instruction {
        background: #fef3cd;
        border: 1px solid #fde68a;
        border-radius: 10px;
        padding: 15px;
        margin: 20px 0;
        text-align: center;
      }

      .llm-permission-instruction strong {
        color: #92400e;
        font-weight: 600;
        font-size: 14px;
      }

      .llm-permission-footer {
        padding: 20px 24px;
        display: flex;
        gap: 12px;
        justify-content: flex-end;
        background: #f8f9fa;
      }

      .llm-permission-btn {
        padding: 10px 20px;
        border: none;
        border-radius: 8px;
        font-size: 14px;
        font-weight: 500;
        cursor: pointer;
        transition: all 0.2s;
      }

      .llm-permission-btn.allow {
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
        color: white;
        font-weight: 700;
        font-size: 16px;
        padding: 14px 28px;
        box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        animation: pulse 2s infinite;
        border-radius: 10px;
      }

      .llm-permission-btn.allow:hover {
        transform: translateY(-2px);
        box-shadow: 0 6px 16px rgba(102, 126, 234, 0.5);
      }

      @keyframes pulse {
        0%, 100% {
          box-shadow: 0 4px 12px rgba(102, 126, 234, 0.3);
        }
        50% {
          box-shadow: 0 6px 20px rgba(102, 126, 234, 0.6);
        }
      }

      .llm-permission-btn.deny {
        background: #6c757d;
        color: white;
        font-weight: 500;
        border-radius: 10px;
      }

      .llm-permission-btn.deny:hover {
        background: #5a6268;
      }

      @keyframes fadeIn {
        from { opacity: 0; }
        to { opacity: 1; }
      }

      @keyframes slideIn {
        from { 
          opacity: 0;
          transform: translateY(-20px) scale(0.95);
        }
        to { 
          opacity: 1;
          transform: translateY(0) scale(1);
        }
      }
    `;

    document.head.appendChild(style);
    document.body.appendChild(dialog);

    // 绑定事件
    const allowBtn = dialog.querySelector('.allow');
    const denyBtn = dialog.querySelector('.deny');

    allowBtn.addEventListener('click', async () => {
      try {
        console.log('🔒 用户点击允许剪切板权限');
        // 尝试读取剪切板以触发权限请求
        await navigator.clipboard.readText();
        this.clipboardPermissionGranted = true;
        await this.saveStorageData({ clipboardPermissionGranted: true });
        this.hideClipboardPermissionDialog();
        this.showNotification('✅ 剪切板权限已授予，功能已激活！');
        console.log('✅ 剪切板权限获取成功');
        if (resolveCallback) resolveCallback(true);
      } catch (error) {
        console.warn('⚠️ 剪切板权限被拒绝:', error);
        this.hideClipboardPermissionDialog();
        this.showNotification('⚠️ 未能获取剪切板权限，请在浏览器中手动允许');
        if (resolveCallback) resolveCallback(false);
      }
    });

    denyBtn.addEventListener('click', () => {
      console.log('❌ 用户拒绝剪切板权限');
      this.hideClipboardPermissionDialog();
      this.showNotification('ℹ️ 您可以随时在扩展设置中启用剪切板权限');
      if (resolveCallback) resolveCallback(false);
    });
  }

  hideClipboardPermissionDialog() {
    const dialog = document.getElementById('llm-clipboard-permission-dialog');
    if (dialog) {
      dialog.style.animation = 'fadeOut 0.3s ease-out';
      setTimeout(() => {
        dialog.remove();
      }, 300);
    }
  }

  // 安全的剪切板读取
  async safeReadClipboard() {
    try {
      if (!navigator.clipboard) {
        throw new Error('不支持剪切板API');
      }
      return await navigator.clipboard.readText();
    } catch (error) {
      console.warn('读取剪切板失败:', error);
      // 如果权限被撤销，重置权限状态
      if (error.name === 'NotAllowedError') {
        this.clipboardPermissionGranted = false;
        await this.saveStorageData({ clipboardPermissionGranted: false });
      }
      throw error;
    }
  }

  // 安全的剪切板写入
  async safeWriteClipboard(text) {
    try {
      if (!navigator.clipboard) {
        // 降级方案
        this.fallbackCopyToClipboard(text);
        return;
      }
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.warn('写入剪切板失败，使用降级方案:', error);
      this.fallbackCopyToClipboard(text);
    }
  }

  // 存储辅助方法
  async getStorageData(keys) {
    try {
      if (chrome && chrome.storage && chrome.storage.local) {
        return await chrome.storage.local.get(keys);
      }
      // 降级到localStorage
      const result = {};
      const keyArray = Array.isArray(keys) ? keys : [keys];
      
      for (const key of keyArray) {
        try {
          const value = localStorage.getItem(`llm_assistant_${key}`);
          if (value) {
            result[key] = JSON.parse(value);
          }
        } catch (parseError) {
          console.warn(`解析存储数据失败 ${key}:`, parseError);
        }
      }
      return result;
    } catch (error) {
      console.error('读取存储数据失败:', error);
      return {};
    }
  }

  async saveStorageData(data) {
    try {
      if (chrome && chrome.storage && chrome.storage.local) {
        await chrome.storage.local.set(data);
      } else {
        // 降级到localStorage
        for (const [key, value] of Object.entries(data)) {
          localStorage.setItem(`llm_assistant_${key}`, JSON.stringify(value));
        }
      }
    } catch (error) {
      console.error('保存存储数据失败:', error);
    }
  }

  // 显示通知方法
  showNotification(message) {
    // 创建通知元素
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 20px;
      right: 20px;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      color: white;
      padding: 12px 16px;
      border-radius: 8px;
      box-shadow: 0 4px 16px rgba(0, 0, 0, 0.3);
      z-index: 1000001;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 14px;
      max-width: 320px;
      animation: slideInRight 0.3s ease-out;
    `;
    notification.textContent = message;

    // 添加样式
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideInRight {
        from {
          transform: translateX(100%);
          opacity: 0;
        }
        to {
          transform: translateX(0);
          opacity: 1;
        }
      }
      @keyframes fadeOut {
        from { opacity: 1; }
        to { opacity: 0; }
      }
    `;
    
    if (!document.getElementById('llm-notification-styles')) {
      style.id = 'llm-notification-styles';
      document.head.appendChild(style);
    }

    document.body.appendChild(notification);

    // 3秒后自动消失
    setTimeout(() => {
      notification.style.animation = 'fadeOut 0.3s ease-out';
      setTimeout(() => {
        if (notification.parentNode) {
          notification.remove();
        }
      }, 300);
    }, 3000);
  }

  injectStyles() {
    // 检查是否已经注入过样式
    if (document.getElementById('llm-assistant-styles')) {
      return;
    }

    // 注入CSS样式
    const style = document.createElement('style');
    style.id = 'llm-assistant-styles';
    style.textContent = `
      .llm-assistant-prompt {
        position: fixed !important;
        top: 20px !important;
        right: 20px !important;
        background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
        color: white !important;
        padding: 16px !important;
        border-radius: 12px !important;
        box-shadow: 0 8px 32px rgba(0, 0, 0, 0.3) !important;
        z-index: 999999 !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        font-size: 14px !important;
        max-width: 320px !important;
        backdrop-filter: blur(10px) !important;
        border: 1px solid rgba(255, 255, 255, 0.2) !important;
        animation: llm-slideIn 0.3s ease-out !important;
      }

      @keyframes llm-slideIn {
        from {
          transform: translateX(100%) !important;
          opacity: 0 !important;
        }
        to {
          transform: translateX(0) !important;
          opacity: 1 !important;
        }
      }

      .llm-assistant-prompt h3 {
        margin: 0 0 12px 0 !important;
        font-size: 16px !important;
        font-weight: 600 !important;
        color: white !important;
      }

      .llm-assistant-actions {
        display: flex !important;
        flex-direction: column !important;
        gap: 8px !important;
      }

      .llm-assistant-btn {
        background: rgba(255, 255, 255, 0.2) !important;
        border: 1px solid rgba(255, 255, 255, 0.3) !important;
        color: white !important;
        padding: 10px 16px !important;
        border-radius: 8px !important;
        cursor: pointer !important;
        transition: all 0.2s ease !important;
        font-size: 13px !important;
        text-align: center !important;
      }

      .llm-assistant-btn:hover {
        background: rgba(255, 255, 255, 0.3) !important;
        transform: translateY(-1px) !important;
        box-shadow: 0 4px 16px rgba(0, 0, 0, 0.2) !important;
      }

      .llm-assistant-btn.recommended {
        background: rgba(255, 255, 255, 0.3) !important;
        border: 1px solid rgba(255, 255, 255, 0.5) !important;
        font-weight: 600 !important;
      }

      .llm-assistant-close {
        position: absolute !important;
        top: 8px !important;
        right: 8px !important;
        background: none !important;
        border: none !important;
        color: white !important;
        font-size: 18px !important;
        cursor: pointer !important;
        width: 24px !important;
        height: 24px !important;
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        border-radius: 50% !important;
        transition: background 0.2s ease !important;
      }

      .llm-assistant-close:hover {
        background: rgba(255, 255, 255, 0.2) !important;
      }

      /* 新增：问题编辑框样式 */
      .llm-assistant-question {
        position: fixed !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
        background: #ffffff !important;
        color: #1a202c !important;
        padding: 24px !important;
        border-radius: 16px !important;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3) !important;
        z-index: 999999 !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        max-width: 600px !important;
        width: 90% !important;
        max-height: 80vh !important;
        overflow-y: auto !important;
        border: 1px solid #d1d5db !important;
      }

      .llm-assistant-question h3 {
        margin: 0 0 16px 0 !important;
        color: #667eea !important;
        font-size: 18px !important;
        font-weight: 600 !important;
      }

      .llm-assistant-question-content {
        margin-bottom: 20px !important;
      }

      .llm-assistant-question-reference {
        background: #ffffff !important;
        padding: 16px !important;
        border-radius: 8px !important;
        margin-bottom: 16px !important;
        border-left: 4px solid #667eea !important;
        border: 2px solid #667eea !important;
        font-size: 14px !important;
        color: #000000 !important;
        font-weight: 600 !important;
        line-height: 1.5 !important;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15) !important;
      }

      .llm-assistant-question-input {
        width: 100% !important;
        min-height: 120px !important;
        padding: 16px !important;
        border: 2px solid #667eea !important;
        border-radius: 8px !important;
        font-size: 16px !important;
        font-family: inherit !important;
        font-weight: 600 !important;
        resize: vertical !important;
        outline: none !important;
        transition: all 0.2s ease !important;
        box-sizing: border-box !important;
        background: #ffffff !important;
        color: #000000 !important;
        line-height: 1.5 !important;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15) !important;
      }

      .llm-assistant-question-input:focus {
        border-color: #667eea !important;
        background: #ffffff !important;
        color: #000000 !important;
        box-shadow: 0 0 0 4px rgba(102, 126, 234, 0.25) !important;
      }

      .llm-assistant-question-input::placeholder {
        color: #000000 !important;
        opacity: 0.7 !important;
        font-weight: 500 !important;
      }

      .llm-assistant-question-actions {
        display: flex !important;
        gap: 12px !important;
        justify-content: flex-end !important;
        margin-top: 16px !important;
      }

      .llm-assistant-result {
        position: fixed !important;
        top: 50% !important;
        left: 50% !important;
        transform: translate(-50%, -50%) !important;
        background: #ffffff !important;
        color: #1a202c !important;
        padding: 24px !important;
        border-radius: 16px !important;
        box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3) !important;
        z-index: 999999 !important;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif !important;
        max-width: 600px !important;
        max-height: 80vh !important;
        overflow-y: auto !important;
        border: 1px solid #d1d5db !important;
      }

      .llm-assistant-result h3 {
        margin: 0 0 16px 0 !important;
        color: #667eea !important;
        font-size: 18px !important;
        font-weight: 600 !important;
      }

      .llm-assistant-result-content {
        margin-bottom: 20px !important;
      }

      .llm-assistant-result-original {
        background: #ffffff !important;
        padding: 16px !important;
        border-radius: 8px !important;
        margin-bottom: 16px !important;
        border-left: 4px solid #667eea !important;
        border: 2px solid #667eea !important;
        color: #000000 !important;
        font-weight: 600 !important;
        line-height: 1.5 !important;
        box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15) !important;
      }

      .llm-assistant-result-processed {
        background: #eff6ff !important;
        padding: 16px !important;
        border-radius: 8px !important;
        border-left: 4px solid #667eea !important;
        color: #1e40af !important;
        line-height: 1.5 !important;
        box-shadow: 0 1px 2px rgba(0, 0, 0, 0.05) !important;
      }

      .llm-assistant-result-actions {
        display: flex !important;
        gap: 12px !important;
        justify-content: flex-end !important;
      }

      .llm-assistant-result-btn {
        background: #667eea !important;
        color: white !important;
        border: none !important;
        padding: 10px 20px !important;
        border-radius: 8px !important;
        cursor: pointer !important;
        font-size: 14px !important;
        transition: all 0.2s ease !important;
      }

      .llm-assistant-result-btn:hover {
        background: #5a6fd8 !important;
        transform: translateY(-1px) !important;
      }

      .llm-assistant-result-btn.secondary {
        background: #6c757d !important;
      }

      .llm-assistant-result-btn.secondary:hover {
        background: #5a6268 !important;
      }

      .llm-assistant-loading {
        display: flex !important;
        align-items: center !important;
        justify-content: center !important;
        padding: 40px !important;
      }

      .llm-assistant-spinner {
        width: 40px !important;
        height: 40px !important;
        border: 3px solid #f3f3f3 !important;
        border-top: 3px solid #667eea !important;
        border-radius: 50% !important;
        animation: llm-spin 1s linear infinite !important;
      }

      @keyframes llm-spin {
        0% { transform: rotate(0deg) !important; }
        100% { transform: rotate(360deg) !important; }
      }

      .llm-assistant-overlay {
        position: fixed !important;
        top: 0 !important;
        left: 0 !important;
        width: 100% !important;
        height: 100% !important;
        background: rgba(0, 0, 0, 0.5) !important;
        z-index: 999998 !important;
        backdrop-filter: blur(2px) !important;
      }
    `;
    
    // 将样式插入到head的最前面，确保高优先级
    if (document.head) {
      document.head.insertBefore(style, document.head.firstChild);
    } else {
      // 如果head还没准备好，等待DOM ready
      document.addEventListener('DOMContentLoaded', () => {
        document.head.insertBefore(style, document.head.firstChild);
      });
    }
  }

  async handleCopyEvent(event) {
    try {
      console.log('📋 检测到复制事件');
      
      // 等待剪贴板内容更新
      setTimeout(async () => {
        try {
          console.log('🔍 开始处理复制内容，当前权限状态:', this.clipboardPermissionGranted);
          
          // 检查剪切板权限
          if (!this.clipboardPermissionGranted) {
            console.log('🔒 需要请求剪切板权限');
            // 首次使用时请求权限
            const permissionGranted = await this.requestClipboardPermission();
            if (!permissionGranted) {
              console.log('ℹ️ LLM Assistant: 用户未授予剪切板权限，跳过复制事件处理');
              return;
            }
          }

          console.log('✅ 开始读取剪切板内容');
          const clipboardText = await this.safeReadClipboard();
          console.log('📝 读取到内容长度:', clipboardText ? clipboardText.length : 0);
          
          // 修改：支持任何语言的内容，只要不是空白内容
          if (clipboardText && this.isValidContent(clipboardText)) {
            console.log('✨ 内容有效，显示提示框');
            await this.showPromptBox(clipboardText);
          } else {
            console.log('❌ 内容无效或为空，跳过处理');
          }
        } catch (error) {
          console.warn('⚠️ 无法读取剪贴板内容:', error);
          // 如果是权限错误，重置权限状态
          if (error.name === 'NotAllowedError') {
            this.clipboardPermissionGranted = false;
            console.log('🔄 权限被撤销，重置状态');
          }
        }
      }, 100);
    } catch (error) {
      console.error('❌ 处理复制事件时出错:', error);
    }
  }

  // 新增：检查是否为有效内容（支持任何语言）
  isValidContent(text) {
    const cleanText = text.trim();
    // 最小长度要求（降低门槛）
    if (cleanText.length < 2) return false;
    
    // 排除纯符号或纯空白
    const hasText = /[\w\u4e00-\u9fa5\u0100-\u017f\u0180-\u024f\u1e00-\u1eff]/.test(cleanText);
    if (!hasText) return false;
    
    // 排除过长的内容（可能是代码或其他格式）
    if (cleanText.length > 5000) return false;
    
    // 排除明显是URL、邮箱等格式
    const isUrl = /^https?:\/\//.test(cleanText);
    const isEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanText);
    if (isUrl || isEmail) return false;
    
    return true;
  }

  // 保留：检查是否主要为英文（某些功能仍需要）
  isLikelyEnglish(text) {
    // 移除空白字符进行分析
    const cleanText = text.trim();
    if (cleanText.length < 3) return false;

    const englishCharRegex = /[a-zA-Z]/g;
    const chineseCharRegex = /[\u4e00-\u9fa5]/g;
    const englishMatches = cleanText.match(englishCharRegex);
    const chineseMatches = cleanText.match(chineseCharRegex);

    const englishRatio = englishMatches ? englishMatches.length / cleanText.length : 0;
    const chineseRatio = chineseMatches ? chineseMatches.length / cleanText.length : 0;

    // 英文比例大于50%且中文比例小于10%
    return englishRatio > 0.5 && chineseRatio < 0.1;
  }

  // 新增：检查是否主要为中文
  isLikelyChinese(text) {
    const cleanText = text.trim();
    if (cleanText.length < 2) return false;

    const chineseCharRegex = /[\u4e00-\u9fa5]/g;
    const chineseMatches = cleanText.match(chineseCharRegex);
    const chineseRatio = chineseMatches ? chineseMatches.length / cleanText.length : 0;
    
    // 中文比例大于30%
    return chineseRatio > 0.3;
  }

  async showPromptBox(text) {
    // 移除已存在的提示框
    this.removePromptBox();

    // 智能分析内容类型
    const isEnglish = this.isLikelyEnglish(text);
    const isChinese = this.isLikelyChinese(text);
    
    // 根据内容类型推荐最佳功能
    let recommendedAction = 'ask_ai'; // 默认推荐AI问答
    if (isEnglish && this.isEmailPage) {
      recommendedAction = 'email_refine';
    } else if (isEnglish) {
      recommendedAction = 'translate';
    } else if (isChinese) {
      recommendedAction = 'ask_ai';
    }

    // 动态生成功能按钮配置
    const availableActions = this.getAvailableActions(text, isEnglish, isChinese, recommendedAction);

    const promptBox = document.createElement('div');
    promptBox.className = 'llm-assistant-prompt';
    
    // 获取用户保存的位置，或使用默认位置
    const savedPosition = await this.getSavedPosition();
    promptBox.style.top = savedPosition.top;
    promptBox.style.right = savedPosition.right;
    promptBox.style.left = savedPosition.left || 'auto';
    promptBox.style.bottom = savedPosition.bottom || 'auto';
    
    promptBox.innerHTML = `
      <div class="llm-assistant-header">
      <h3>🤖 智能助手</h3>
        <button class="llm-assistant-close">&times;</button>
      </div>
      <div class="llm-assistant-content">
        <div class="llm-assistant-actions" data-action-count="${availableActions.length}">
          ${availableActions.map(action => action.html).join('')}
        </div>
        <div class="llm-assistant-hint">
          ${isEnglish ? '检测到英文内容' : isChinese ? '检测到中文内容' : '检测到多语言内容'} - 请选择合适的功能
        </div>
      </div>
    `;

    // 添加事件监听器
    promptBox.querySelector('.llm-assistant-close').addEventListener('click', () => {
      this.removePromptBox();
    });

    promptBox.querySelectorAll('.llm-assistant-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const target = e.target;
        const action = target.dataset.action;
        
        // 检查按钮是否被禁用
        if (target.classList.contains('disabled')) {
          // 显示提示而不执行操作
          this.showNotification('此功能仅支持英文内容', 'warning');
          return;
        }
        
        if (action === 'ask_ai') {
          this.showConversationBox(text);
        } else {
          this.processText(action, text);
        }
        this.removePromptBox();
      });
    });

    document.body.appendChild(promptBox);
    this.currentPromptBox = promptBox;

    // 拖拽功能已回退 - 保持固定位置
    
    // 改进的悬停逻辑
    this.setupHoverLogic(promptBox);
  }

  // 新增方法：根据内容类型动态获取可用功能
  getAvailableActions(text, isEnglish, isChinese, recommendedAction) {
    const actions = [];
    
    // 邮件润色 - 对英文内容显示，放宽条件
    const hasEnglishChars = /[a-zA-Z]/.test(text);
    const textLength = text.trim().length;
    if ((isEnglish || (hasEnglishChars && textLength >= 10 && !isChinese)) && textLength >= 10) {
      actions.push({
        action: 'email_refine',
        html: `<button class="llm-assistant-btn ${recommendedAction === 'email_refine' ? 'recommended' : ''}" data-action="email_refine">
          ✉️ 邮件润色 ${recommendedAction === 'email_refine' ? '(推荐)' : ''}
        </button>`
      });
    }
    
    // 翻译功能 - 对所有语言显示，但根据检测语言调整文字
    actions.push({
      action: 'translate',
      html: `<button class="llm-assistant-btn ${recommendedAction === 'translate' ? 'recommended' : ''}" data-action="translate">
        🌐 ${isChinese ? '英文翻译' : '中文翻译'} ${recommendedAction === 'translate' ? '(推荐)' : ''}
      </button>`
    });
    
    // 语法检查 - 仅对英文内容显示
    if (isEnglish) {
      actions.push({
        action: 'grammar_check',
        html: `<button class="llm-assistant-btn" data-action="grammar_check">
          ✅ 语法检查
        </button>`
      });
    }
    
    // AI问答 - 始终显示
    actions.push({
      action: 'ask_ai',
      html: `<button class="llm-assistant-btn ${recommendedAction === 'ask_ai' ? 'recommended' : ''}" data-action="ask_ai">
        🧠 问AI问题 ${recommendedAction === 'ask_ai' ? '(推荐)' : ''}
      </button>`
    });
    
    return actions;
  }

  // 获取保存的位置信息
  async getSavedPosition() {
    try {
      // 检查扩展上下文是否有效
      if (!this.isExtensionContextValid()) {
        console.warn('扩展上下文失效，使用默认位置');
        return this.getDefaultPosition();
      }
      
      const result = await this.getStorageData(['promptBoxPosition']);
      const position = result.promptBoxPosition;
      
      if (position && typeof position === 'object') {
        // 验证位置是否仍然有效（防止屏幕尺寸变化导致的问题）
        const windowWidth = window.innerWidth || 1920;
        const windowHeight = window.innerHeight || 1080;
        
        // 安全转换位置值
        const cleanPosition = {
          top: this.validatePositionValue(position.top, windowHeight - 100),
          right: this.validatePositionValue(position.right, windowWidth - 100),
          left: this.validatePositionValue(position.left, windowWidth - 320),
          bottom: this.validatePositionValue(position.bottom, windowHeight - 100)
        };
        
        return cleanPosition;
      }
    } catch (error) {
      console.warn('获取保存位置失败:', error);
    }
    
    return this.getDefaultPosition();
  }

  // 验证位置值
  validatePositionValue(value, maxValue) {
    if (!value || value === 'auto') return 'auto';
    const numValue = parseInt(value);
    if (isNaN(numValue)) return 'auto';
    return Math.max(0, Math.min(numValue, maxValue)) + 'px';
  }

  // 获取默认位置
  getDefaultPosition() {
    return {
      top: '20px',
      right: '20px',
      left: 'auto',
      bottom: 'auto'
    };
  }

  // 保存位置信息
  async savePosition(position) {
    try {
      // 检查扩展上下文是否有效
      if (!this.isExtensionContextValid()) {
        console.warn('扩展上下文失效，无法保存位置');
        return;
      }

      // 验证位置数据
      if (!position || typeof position !== 'object') {
        console.warn('无效的位置数据:', position);
        return;
      }

      await this.saveStorageData({ promptBoxPosition: position });
      console.log('位置保存成功:', position);
    } catch (error) {
      console.warn('保存位置失败:', error);
    }
  }

  // 拖拽功能已回退 - 保持原有固定位置功能

  removePromptBox() {
    if (this.currentPromptBox) {
      this.currentPromptBox.remove();
      this.currentPromptBox = null;
    }
  }

  // 新增：改进的悬停逻辑
  setupHoverLogic(promptBox) {
    let hoverTimeout = null;
    let isMouseInside = false;
    let hasUserInteracted = false;

    // 初始显示5秒后，如果没有用户交互，则自动隐藏
    const initialTimeout = setTimeout(() => {
      if (!hasUserInteracted && !isMouseInside) {
        this.removePromptBox();
        this.showReturnHint();
      }
    }, 5000);

    // 鼠标进入提示框
    promptBox.addEventListener('mouseenter', () => {
      isMouseInside = true;
      hasUserInteracted = true;
      
      // 清除所有超时
      if (hoverTimeout) {
        clearTimeout(hoverTimeout);
        hoverTimeout = null;
      }
      clearTimeout(initialTimeout);
    });

    // 鼠标离开提示框
    promptBox.addEventListener('mouseleave', () => {
      isMouseInside = false;
      
      // 鼠标离开后5秒自动隐藏
      hoverTimeout = setTimeout(() => {
        this.removePromptBox();
        this.showReturnHint();
      }, 5000);
    });

    // 鼠标点击任意按钮都算作用户交互
    promptBox.addEventListener('click', () => {
      hasUserInteracted = true;
    });
  }

  // 新增：显示返回提示
  showReturnHint() {
    // 避免重复显示提示
    if (document.querySelector('.llm-assistant-return-hint')) {
      return;
    }

    const hint = document.createElement('div');
    hint.className = 'llm-assistant-return-hint';
    hint.innerHTML = `
      <div class="llm-assistant-hint-content">
        💡 复制英文内容可重新唤起助手
      </div>
    `;

    document.body.appendChild(hint);

    // 3秒后自动移除提示
    setTimeout(() => {
      if (document.body.contains(hint)) {
        document.body.removeChild(hint);
      }
    }, 3000);
  }

  // 多轮对话：显示对话界面
  async showConversationBox(referenceText) {
    this.removeQuestionBox();
    
    // 检查扩展上下文
    if (!this.isExtensionContextValid()) {
      this.showError('扩展已更新，请刷新页面后重试');
      return;
    }
    
    // 获取或创建对话历史
    const conversationId = this.getConversationId(referenceText);
    const conversation = await this.getConversation(conversationId);

    const overlay = document.createElement('div');
    overlay.className = 'llm-assistant-overlay';

    const conversationBox = document.createElement('div');
    conversationBox.className = 'llm-assistant-conversation';
    conversationBox.innerHTML = `
      <div class="llm-assistant-minimized-icon">🧠</div>
      
      <div class="llm-assistant-conversation-header">
        <h3>🧠 AI智能对话</h3>
        <div class="llm-assistant-conversation-controls">
          <button class="llm-assistant-btn-small" id="new-conversation" title="开始新对话 (清空当前对话内容)">🆕</button>
          <button class="llm-assistant-btn-small" id="clear-conversation" title="清空对话历史记录">🗑️</button>
          <button class="llm-assistant-btn-small minimize-btn" id="minimize-conversation" title="最小化对话窗口">−</button>
          <button class="llm-assistant-btn-small secondary" id="close-conversation" title="关闭AI对话功能">×</button>
        </div>
      </div>
      
      <div class="llm-assistant-conversation-content">
        <div class="llm-assistant-reference-section">
          <h4>
            📄 参考内容
            <span class="llm-assistant-reference-toggle" id="toggle-reference">收起</span>
          </h4>
          <div class="llm-assistant-reference-text" id="reference-text">${this.escapeHtml(referenceText)}</div>
        </div>
        
        <div class="llm-assistant-conversation-history" id="conversation-history">
          ${this.renderConversationHistory(conversation.messages)}
        </div>
        
        <div class="llm-assistant-conversation-input-area">
          <div class="llm-assistant-input-container">
          <textarea 
              class="llm-assistant-conversation-input" 
              placeholder="💭 输入问题继续对话..."
            autofocus
          ></textarea>
            <button class="llm-assistant-send-btn" id="send-message">
              <span class="send-text">发送</span>
              <span class="send-icon">📤</span>
            </button>
        </div>
      </div>
      </div>
    `;

    // 绑定事件监听器
    this.setupConversationEventListeners(conversationBox, conversationId, referenceText);

    // 添加到页面并显示动画
    document.body.appendChild(conversationBox);
    this.currentQuestionBox = conversationBox;
    
    // 添加显示动画
    setTimeout(() => {
      conversationBox.classList.add('active');
    }, 10);

    // 自动聚焦到输入框并滚动到底部
    setTimeout(() => {
      const textarea = conversationBox.querySelector('.llm-assistant-conversation-input');
      const historyDiv = conversationBox.querySelector('#conversation-history');
      if (textarea) textarea.focus();
      if (historyDiv) historyDiv.scrollTop = historyDiv.scrollHeight;
    }, 300);
  }

  // 设置对话事件监听器
  setupConversationEventListeners(conversationBox, conversationId, referenceContent) {
    const textarea = conversationBox.querySelector('.llm-assistant-conversation-input');
    const sendBtn = conversationBox.querySelector('#send-message');
    const newConversationBtn = conversationBox.querySelector('#new-conversation');
    const clearBtn = conversationBox.querySelector('#clear-conversation');
    const minimizeBtn = conversationBox.querySelector('#minimize-conversation');
    const closeBtn = conversationBox.querySelector('#close-conversation');
    const toggleReferenceBtn = conversationBox.querySelector('#toggle-reference');
    const referenceTextElement = conversationBox.querySelector('#reference-text');

    // 发送消息
    const sendMessage = async () => {
      const question = textarea.value.trim();
      if (!question) {
        textarea.style.borderColor = '#dc3545';
        return;
      }
      
      // 禁用输入和按钮
      textarea.disabled = true;
      sendBtn.disabled = true;
      sendBtn.innerHTML = '<span class="send-text">发送中...</span><span class="send-icon">⏳</span>';
      
      try {
        await this.handleConversationMessage(conversationId, question, referenceContent);
        textarea.value = '';
        textarea.style.borderColor = '#e0e0e0';
      } catch (error) {
        console.error('发送消息失败:', error);
        this.showNotification('发送失败，请重试', 'error');
      } finally {
        // 恢复输入和按钮
        textarea.disabled = false;
        sendBtn.disabled = false;
        sendBtn.innerHTML = '<span class="send-text">发送</span><span class="send-icon">📤</span>';
        textarea.focus();
      }
    };

    // 绑定发送事件
    sendBtn.addEventListener('click', sendMessage);
    
    textarea.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
      }
    });

    // 输入时重置边框颜色
    textarea.addEventListener('input', () => {
      textarea.style.borderColor = '#e0e0e0';
    });

    // 新对话
    newConversationBtn.addEventListener('click', async () => {
      await this.createNewConversation();
      this.removeQuestionBox();
      this.showConversationBox(referenceContent);
    });

    // 清空对话
    clearBtn.addEventListener('click', async () => {
      if (confirm('确定要清空当前对话吗？此操作不可撤销。')) {
        await this.clearConversation(conversationId);
        this.removeQuestionBox();
        this.showConversationBox(referenceContent);
      }
    });

    // 最小化对话
    minimizeBtn.addEventListener('click', () => {
      conversationBox.classList.add('minimized');
    });

    // 点击最小化图标恢复
    const minimizedIcon = conversationBox.querySelector('.llm-assistant-minimized-icon');
    minimizedIcon.addEventListener('click', () => {
      conversationBox.classList.remove('minimized');
    setTimeout(() => {
        if (textarea) textarea.focus();
      }, 300);
    });

    // 切换参考内容显示
    if (toggleReferenceBtn && referenceTextElement) {
      toggleReferenceBtn.addEventListener('click', () => {
        if (referenceTextElement.classList.contains('collapsed')) {
          referenceTextElement.classList.remove('collapsed');
          toggleReferenceBtn.textContent = '收起';
        } else {
          referenceTextElement.classList.add('collapsed');
          toggleReferenceBtn.textContent = '展开';
        }
      });
    }

    // 关闭对话
    closeBtn.addEventListener('click', () => {
      conversationBox.classList.remove('active');
      setTimeout(() => {
        this.removeQuestionBox();
      }, 300);
    });

    // ESC键关闭
    const escHandler = (e) => {
      if (e.key === 'Escape' && !conversationBox.classList.contains('minimized')) {
        closeBtn.click();
      }
    };
    document.addEventListener('keydown', escHandler);
    conversationBox._escHandler = escHandler;
  }

  removeQuestionBox() {
    if (this.currentQuestionBox) {
      // 移除ESC事件监听器
      const escHandler = this.currentQuestionBox._escHandler;
      if (escHandler) {
        document.removeEventListener('keydown', escHandler);
      }
      
      this.currentQuestionBox.remove();
      this.currentQuestionBox = null;
    }
  }

  // === 多轮对话管理功能 ===

  // 生成对话ID（基于参考内容的简短hash）
  getConversationId(referenceText) {
    const shortHash = this.simpleHash(referenceText.substring(0, 200));
    return `conversation_${shortHash}`;
  }

  // 简单hash函数
  simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // 转换为32位整数
    }
    return Math.abs(hash).toString(36);
  }

  // 获取对话历史
  async getConversation(conversationId) {
    return new Promise((resolve, reject) => {
      try {
        if (!this.isExtensionContextValid()) {
          reject(new Error('Extension context invalidated'));
          return;
        }
        
        chrome.storage.local.get([conversationId], (result) => {
          if (chrome.runtime.lastError) {
            console.error('获取对话历史失败:', chrome.runtime.lastError);
            reject(new Error('Extension context invalidated'));
            return;
          }
          
          const conversation = result[conversationId] || {
            id: conversationId,
            messages: [],
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
          };
          resolve(conversation);
        });
      } catch (error) {
        console.error('访问存储失败:', error);
        reject(new Error('Extension context invalidated'));
      }
    });
  }

  // 保存对话
  async saveConversation(conversation) {
    conversation.updatedAt = new Date().toISOString();
    return new Promise((resolve, reject) => {
      try {
        if (!this.isExtensionContextValid()) {
          reject(new Error('Extension context invalidated'));
          return;
        }
        
        chrome.storage.local.set({ [conversation.id]: conversation }, () => {
          if (chrome.runtime.lastError) {
            console.error('保存对话失败:', chrome.runtime.lastError);
            reject(new Error('Extension context invalidated'));
            return;
          }
          resolve();
        });
      } catch (error) {
        console.error('访问存储失败:', error);
        reject(new Error('Extension context invalidated'));
      }
    });
  }

  // 渲染对话历史
  renderConversationHistory(messages) {
    if (!messages || messages.length === 0) {
      return `
        <div class="llm-assistant-empty-conversation">
          <div class="empty-icon">💭</div>
          <p>开始您的第一个问题吧！</p>
          <p class="empty-tip">我会记住我们的对话内容，支持追问和深入讨论</p>
        </div>
      `;
    }

    return messages.map(msg => {
      const time = new Date(msg.timestamp).toLocaleTimeString();
      if (msg.role === 'user') {
        return `
          <div class="llm-assistant-message user-message">
            <div class="message-header">
              <span class="message-role">👤 您</span>
              <span class="message-time">${time}</span>
            </div>
            <div class="message-content">${this.escapeHtml(msg.content)}</div>
          </div>
        `;
      } else {
        return `
          <div class="llm-assistant-message ai-message">
            <div class="message-header">
              <span class="message-role">🤖 AI助手</span>
              <span class="message-time">${time}</span>
            </div>
            <div class="message-content">${this.formatAIResponse(msg.content)}</div>
          </div>
        `;
      }
    }).join('');
  }

  // 格式化AI回复（支持markdown-like格式）
  formatAIResponse(content) {
    return this.escapeHtml(content)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br/>');
  }

  // 处理对话消息
  async handleConversationMessage(conversationId, userMessage, referenceText) {
    try {
      // 检查扩展上下文
      if (!this.isExtensionContextValid()) {
        this.showContextInvalidatedError();
        return;
      }

      // 获取当前对话
      const conversation = await this.getConversation(conversationId);
      
      // 添加用户消息
      const userMsg = {
        role: 'user',
        content: userMessage,
        timestamp: new Date().toISOString()
      };
      conversation.messages.push(userMsg);
      
      // 立即更新UI显示用户消息
      this.appendMessageToHistory(userMsg);
      
      // 显示AI思考状态
      const thinkingMsg = this.showAIThinking();
      
      try {
        // 调用API获取AI回复
        const aiResponse = await this.getAIResponse(conversation.messages, referenceText);
        
        // 移除思考状态
        this.removeAIThinking(thinkingMsg);
        
        // 添加AI消息
        const aiMsg = {
          role: 'assistant',
          content: aiResponse,
          timestamp: new Date().toISOString()
        };
        conversation.messages.push(aiMsg);
        
        // 更新UI显示AI消息
        this.appendMessageToHistory(aiMsg);
        
        // 保存对话
        await this.saveConversation(conversation);
        
        // 滚动到底部
        this.scrollToBottom();
        
      } catch (error) {
        // 移除思考状态
        this.removeAIThinking(thinkingMsg);
        
        // 特殊处理扩展上下文失效错误
        if (error.message.includes('Extension context invalidated')) {
          this.showContextInvalidatedError();
          return;
        }
        
        // 显示一般错误消息
        const errorMsg = {
          role: 'assistant',
          content: `抱歉，处理您的问题时出现错误：${error.message}\n\n💡 您可以：\n• 检查网络连接\n• 确认API Key配置正确\n• 刷新页面重试`,
          timestamp: new Date().toISOString(),
          isError: true
        };
        this.appendMessageToHistory(errorMsg);
        
        throw error;
      }
    } catch (error) {
      console.error('处理对话消息失败:', error);
      // 如果是顶层错误，也检查是否为上下文失效
      if (error.message.includes('Extension context invalidated')) {
        this.showContextInvalidatedError();
      }
    }
  }

  // 显示扩展上下文失效错误
  showContextInvalidatedError() {
    const errorMsg = {
      role: 'assistant',
      content: `⚠️ 扩展上下文已失效\n\n这通常是因为：\n• 扩展被重新加载或更新\n• 浏览器扩展设置被修改\n\n💡 解决方法：\n• 刷新当前页面\n• 重新打开对话`,
      timestamp: new Date().toISOString(),
      isError: true
    };
    this.appendMessageToHistory(errorMsg);
    
    // 额外显示刷新提示
    this.showNotification('扩展已更新，请刷新页面', 'warning');
  }

  // 获取AI回复
  async getAIResponse(conversationHistory, referenceText) {
    // 检查扩展上下文
    if (!this.isExtensionContextValid()) {
      throw new Error('Extension context invalidated - 扩展上下文已失效，请刷新页面');
    }

    // 获取API Key（使用try-catch包装storage调用）
    let config;
    try {
      config = await chrome.storage.sync.get(['apiKey']);
    } catch (error) {
      console.error('无法访问扩展存储:', error);
      throw new Error('Extension context invalidated - 无法访问扩展存储，请刷新页面');
    }
    
    if (!config.apiKey) {
      throw new Error('请先设置API Key');
    }

    // 构建对话消息数组
    const messages = this.buildConversationMessages(conversationHistory, referenceText);
    
    console.log('📡 发送多轮对话API请求:', messages);
    
    const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${config.apiKey}`
      },
      body: JSON.stringify({
        model: 'deepseek-chat',
        messages: messages,
        temperature: 0.7,
        max_tokens: 3000,
        stream: false
      })
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error?.message || `API请求失败: ${response.status}`);
    }
    
    const data = await response.json();
    return data.choices?.[0]?.message?.content || '处理失败';
  }

  // 构建对话消息数组
  buildConversationMessages(conversationHistory, referenceText) {
    const systemPrompt = `你是一个专业的AI助手。用户提供了一段参考内容，并基于这段内容与你进行对话。

参考内容：
${referenceText}

请根据参考内容和对话历史，准确、详细、有帮助地回答用户的问题。要求：
1. 基于参考内容回答，保持准确性
2. 记住对话历史，支持连续追问
3. 回答要详细但不冗余
4. 使用中文回复
5. 如果问题与参考内容无关，请礼貌说明并尽力提供有用信息`;

    const messages = [
      {
        role: 'system',
        content: systemPrompt
      }
    ];
    
    // 添加对话历史（只取最近10轮对话避免token过多）
    const recentHistory = conversationHistory.slice(-20); // 取最近20条消息（用户+AI各10轮）
    messages.push(...recentHistory.map(msg => ({
      role: msg.role,
      content: msg.content
    })));
    
    return messages;
  }

  // 向历史记录添加消息
  appendMessageToHistory(message) {
    const historyDiv = document.querySelector('#conversation-history');
    if (!historyDiv) return;
    
    const time = new Date(message.timestamp).toLocaleTimeString();
    const messageHtml = message.role === 'user' ? `
      <div class="llm-assistant-message user-message">
        <div class="message-header">
          <span class="message-role">👤 您</span>
          <span class="message-time">${time}</span>
        </div>
        <div class="message-content">${this.escapeHtml(message.content)}</div>
      </div>
    ` : `
      <div class="llm-assistant-message ai-message ${message.isError ? 'error-message' : ''}">
        <div class="message-header">
          <span class="message-role">🤖 AI助手</span>
          <span class="message-time">${time}</span>
        </div>
        <div class="message-content">${this.formatAIResponse(message.content)}</div>
      </div>
    `;
    
    historyDiv.insertAdjacentHTML('beforeend', messageHtml);
    this.scrollToBottom();
  }

  // 显示AI思考状态
  showAIThinking() {
    const historyDiv = document.querySelector('#conversation-history');
    if (!historyDiv) return null;
    
    const thinkingHtml = `
      <div class="llm-assistant-message ai-message thinking-message" id="ai-thinking">
        <div class="message-header">
          <span class="message-role">🤖 AI助手</span>
          <span class="message-time">正在思考...</span>
        </div>
        <div class="message-content">
          <div class="thinking-dots">
            <span>●</span><span>●</span><span>●</span>
          </div>
        </div>
      </div>
    `;
    
    historyDiv.insertAdjacentHTML('beforeend', thinkingHtml);
    this.scrollToBottom();
    
    return historyDiv.querySelector('#ai-thinking');
  }

  // 移除AI思考状态
  removeAIThinking(thinkingElement) {
    if (thinkingElement) {
      thinkingElement.remove();
    }
  }

  // 滚动到底部
  scrollToBottom() {
    const historyDiv = document.querySelector('#conversation-history');
    if (historyDiv) {
      setTimeout(() => {
        historyDiv.scrollTop = historyDiv.scrollHeight;
      }, 100);
    }
  }

  // 创建新对话
  async createNewConversation() {
    this.currentConversationId = null;
    this.showNotification('已创建新对话', 'success');
  }

  // 清空对话
  async clearConversation(conversationId) {
    return new Promise((resolve) => {
      chrome.storage.local.remove([conversationId], () => {
        this.showNotification('对话已清空', 'success');
        resolve();
      });
    });
  }

  async processText(actionType, text) {
    this.showLoadingResult();

    try {
      // 检查扩展上下文是否有效
      if (!this.isExtensionContextValid()) {
        console.warn('🔄 扩展上下文已失效，尝试重新加载页面');
        this.showError('扩展已更新，请刷新页面后重试');
        return;
      }

      const response = await this.sendMessageWithRetry({
        action: 'processText',
        action_type: actionType,
        text: text
      });

      if (response.success) {
        this.showResult(text, response.result, actionType);
      } else {
        this.showError(response.error || '处理失败');
      }
    } catch (error) {
      console.error('处理文本时出错:', error);
      
      if (error.message.includes('Extension context invalidated')) {
        this.showError('扩展已更新，请刷新页面后重试');
      } else {
      this.showError('处理失败，请稍后重试');
      }
    }
  }

  showLoadingResult() {
    this.removeResultBox();

    const overlay = document.createElement('div');
    overlay.className = 'llm-assistant-overlay';

    const resultBox = document.createElement('div');
    resultBox.className = 'llm-assistant-result';
    resultBox.innerHTML = `
      <div class="llm-assistant-loading">
        <div class="llm-assistant-spinner"></div>
        <span style="margin-left: 16px;">正在处理中...</span>
      </div>
    `;

    overlay.appendChild(resultBox);
    document.body.appendChild(overlay);
    this.currentResultBox = overlay;

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.removeResultBox();
      }
    });
  }

  // 修改显示结果的函数，为所有功能添加重新生成按钮
  showResult(originalText, processedText, actionType) {
    console.log('📋 显示结果:', { action: actionType, result: processedText.substring(0, 100) });
    
    // 移除现有的结果弹窗
    this.removeResultBox();

    // 创建结果弹窗
    const overlay = document.createElement('div');
    overlay.className = 'llm-assistant-overlay';

    const resultBox = document.createElement('div');
    resultBox.className = 'llm-assistant-result';
    
    // 为所有功能都添加重新生成按钮
    const regenerateButton = '<button class="llm-assistant-result-btn regenerate" title="重新生成AI回答内容">🔄 重新生成</button>';
    
    resultBox.innerHTML = `
      <h3>📝 ${this.getActionTitle(actionType)}结果</h3>
      <div class="llm-assistant-result-content">
        <div style="margin-bottom: 16px;">
          <h4 style="margin: 0 0 8px 0; color: #666; font-size: 14px;">${actionType === 'ask_ai' ? '您的问题：' : '原文：'}</h4>
          <div class="llm-assistant-result-original">${this.escapeHtml(originalText)}</div>
        </div>
        <div>
          <h4 style="margin: 0 0 8px 0; color: #667eea; font-size: 14px;">${this.getResultLabel(actionType)}：</h4>
          <div class="llm-assistant-result-processed">${this.escapeHtml(processedText)}</div>
        </div>
      </div>
      <div class="llm-assistant-result-actions">
        <button class="llm-assistant-result-btn secondary" title="关闭结果窗口">关闭</button>
        ${regenerateButton}
        <button class="llm-assistant-result-btn" title="复制处理结果到剪贴板">复制结果</button>
      </div>
    `;

    // 添加事件监听器
    const closeBtn = resultBox.querySelector('.llm-assistant-result-btn.secondary');
    const copyBtn = resultBox.querySelector('.llm-assistant-result-btn:not(.secondary):not(.regenerate)');
    const regenerateBtn = resultBox.querySelector('.llm-assistant-result-btn.regenerate');

    closeBtn.addEventListener('click', () => {
      this.removeResultBox();
    });

    copyBtn.addEventListener('click', async () => {
      try {
        await this.safeWriteClipboard(processedText);
        copyBtn.textContent = '已复制 ✅';
        setTimeout(() => {
          copyBtn.textContent = '复制结果';
        }, 2000);
      } catch (error) {
        console.error('复制失败:', error);
        copyBtn.textContent = '复制失败';
        setTimeout(() => {
          copyBtn.textContent = '复制结果';
        }, 2000);
      }
    });

    // 添加重新生成功能（支持所有四大功能）
    if (regenerateBtn) {
      regenerateBtn.addEventListener('click', async () => {
        regenerateBtn.textContent = '🔄 生成中...';
        regenerateBtn.disabled = true;
        
        try {
          // 重新调用AI处理，支持所有功能类型
          await this.processText(actionType, originalText);
          console.log(`🔄 ${this.getActionTitle(actionType)}重新生成成功`);
        } catch (error) {
          regenerateBtn.textContent = '🔄 重新生成';
          regenerateBtn.disabled = false;
          console.error(`${this.getActionTitle(actionType)}重新生成失败:`, error);
          // 显示错误提示
          this.showNotification('重新生成失败，请稍后重试', 'error');
        }
      });
    }

    overlay.appendChild(resultBox);
    document.body.appendChild(overlay);
    this.currentResultBox = overlay;

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.removeResultBox();
      }
    });
  }

  showError(errorMessage) {
    this.removeResultBox();

    const overlay = document.createElement('div');
    overlay.className = 'llm-assistant-overlay';

    const resultBox = document.createElement('div');
    resultBox.className = 'llm-assistant-result';
    resultBox.innerHTML = `
      <h3>⚠️ 处理失败</h3>
      <div class="llm-assistant-result-content">
        <div style="color: #dc3545; padding: 16px; background: #f8d7da; border-radius: 8px;">
          ${this.escapeHtml(errorMessage)}
        </div>
      </div>
      <div class="llm-assistant-result-actions">
        <button class="llm-assistant-result-btn secondary" title="关闭错误提示窗口">关闭</button>
      </div>
    `;

    const closeBtn = resultBox.querySelector('.llm-assistant-result-btn');
    closeBtn.addEventListener('click', () => {
      this.removeResultBox();
    });

    overlay.appendChild(resultBox);
    document.body.appendChild(overlay);
    this.currentResultBox = overlay;

    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.removeResultBox();
      }
    });
  }

  removeResultBox() {
    if (this.currentResultBox) {
      this.currentResultBox.remove();
      this.currentResultBox = null;
    }
  }

  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML.replace(/\n/g, '<br>');
  }

  async handleMessage(message, sender, sendResponse) {
    switch (message.action) {
      case 'isEmailPage':
        this.isEmailPage = message.emailDetected;
        break;
      case 'displayPrompt':
        await this.showPromptBox(message.text);
        break;
    }
  }

  // 获取操作图标
  getActionIcon(action) {
    const icons = {
      translate: '🔤',
      question: '🤖', 
      grammar: '✅',
      refine: '✨'
    };
    return icons[action] || '🔧';
  }

  // 检查扩展上下文是否有效
  isExtensionContextValid() {
    try {
      // 尝试访问chrome.runtime.id，如果上下文失效会抛出错误
      if (!chrome || !chrome.runtime) {
        return false;
      }
      
      // 尝试访问runtime.id，这在上下文失效时会报错
      const extensionId = chrome.runtime.id;
      if (!extensionId) {
        return false;
      }
      
      return true;
    } catch (error) {
      console.warn('扩展上下文检查失败:', error.message);
      return false;
    }
  }

  // 带重试机制的消息发送
  async sendMessageWithRetry(message, maxRetries = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        // 检查上下文有效性
        if (!this.isExtensionContextValid()) {
          throw new Error('Extension context invalidated');
        }

        const response = await chrome.runtime.sendMessage(message);
        
        // 检查响应是否有效
        if (response === undefined) {
          throw new Error('Extension context invalidated - no response');
        }
        
        return response;
      } catch (error) {
        console.warn(`🔄 消息发送失败 (尝试 ${attempt}/${maxRetries}):`, error);
        
        // 如果是上下文失效错误，不再重试
        if (error.message.includes('Extension context invalidated')) {
          throw error;
        }
        
        // 最后一次尝试失败，抛出错误
        if (attempt === maxRetries) {
          throw new Error(`消息发送失败: ${error.message}`);
        }
        
        // 短暂延迟后重试
        await new Promise(resolve => setTimeout(resolve, 500 * attempt));
      }
    }
  }

  // 获取操作标题
  getActionTitle(action) {
    const titles = {
      translate: '智能翻译',
      question: 'AI问答',
      grammar: '语法检查', 
      refine: '邮件润色'
    };
    return titles[action] || '处理结果';
  }

  // 获取结果标签
  getResultLabel(action) {
    const labels = {
      translate: '翻译结果',
      question: 'AI回答',
      grammar: '检查结果',
      refine: '润色结果'
    };
    return labels[action] || '处理结果';
  }

  // 格式化结果显示
  formatResult(result, action) {
    // 对不同类型的结果进行格式化
    if (action === 'grammar') {
      // 语法检查结果可能包含多个建议，进行格式化
      return result.replace(/\n/g, '<br>').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');
    } else if (action === 'question') {
      // AI问答结果支持markdown格式
      return this.formatMarkdown(result);
    } else {
      // 翻译和润色结果直接显示
      return this.escapeHtml(result).replace(/\n/g, '<br>');
    }
  }

  // 简单的markdown格式化
  formatMarkdown(text) {
    return this.escapeHtml(text)
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/`(.*?)`/g, '<code>$1</code>')
      .replace(/\n/g, '<br>');
  }

  // 绑定弹窗事件
  bindPopupEvents(popup, result, action, originalText) {
    // 关闭按钮
    const closeBtn = popup.querySelector('.llm-close-btn');
    closeBtn?.addEventListener('click', () => {
      popup.classList.remove('llm-popup-show');
      setTimeout(() => popup.remove(), 300);
    });
    
    // 重新生成按钮 - 这是新增的核心功能！
    const regenerateBtn = popup.querySelector('.llm-regenerate-btn');
    regenerateBtn?.addEventListener('click', async () => {
      console.log('🔄 重新生成请求:', action);
      
      // 显示加载状态
      regenerateBtn.innerHTML = '⏳ 生成中...';
      regenerateBtn.disabled = true;
      
      try {
        // 重新调用API
        const response = await this.callLLMAPI(action, originalText);
        
        if (response.success) {
          // 更新结果显示
          const resultContent = popup.querySelector('.llm-result-content');
          if (resultContent) {
            resultContent.innerHTML = this.formatResult(response.result, action);
          }
          
          // 显示成功提示
          this.showNotification('重新生成完成！', 'success');
        } else {
          throw new Error(response.error || '重新生成失败');
        }
      } catch (error) {
        console.error('重新生成失败:', error);
        this.showNotification('重新生成失败，请稍后重试', 'error');
      } finally {
        // 恢复按钮状态
        regenerateBtn.innerHTML = '🔄 重新生成';
        regenerateBtn.disabled = false;
      }
    });
    
    // 复制按钮
    const copyBtn = popup.querySelector('.llm-copy-btn');
    copyBtn?.addEventListener('click', () => {
      const resultText = popup.querySelector('.llm-result-content')?.textContent || result;
      this.copyToClipboard(resultText);
      this.showNotification('结果已复制到剪贴板！', 'success');
    });
    
    // 保存按钮
    const saveBtn = popup.querySelector('.llm-save-btn');
    saveBtn?.addEventListener('click', () => {
      // 保存到历史记录（如果有历史记录功能）
      this.saveToHistory(action, originalText, result);
      this.showNotification('已保存到历史记录！', 'success');
    });
    
    // 点击空白区域关闭
    popup.addEventListener('click', (e) => {
      if (e.target === popup) {
        closeBtn.click();
      }
    });
  }

  // 调用LLM API的统一函数
  async callLLMAPI(action, text) {
    try {
      // 检查扩展上下文是否有效
      if (!this.isExtensionContextValid()) {
        throw new Error('Extension context invalidated');
      }

      // 从storage获取API Key
      const config = await chrome.storage.sync.get(['apiKey']);
      if (!config.apiKey) {
        throw new Error('请先设置API Key');
      }
      
      console.log('📡 调用API:', action, text.substring(0, 50));
      
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${config.apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'user',
              content: this.getPromptForAction(action, text)
            }
          ],
          temperature: 0.7,
          max_tokens: 2000
        })
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error?.message || `API请求失败: ${response.status}`);
      }
      
      const data = await response.json();
      const result = data.choices?.[0]?.message?.content || '处理失败';
      
      return { success: true, result };
    } catch (error) {
      console.error('API调用失败:', error);
      return { success: false, error: error.message };
    }
  }

  // 根据操作类型生成提示词
  getPromptForAction(action, text) {
    const prompts = {
      translate: `请将以下英文翻译成中文，保持原文的语境和专业术语：\n\n${text}`,
      question: `请基于以下内容回答问题，提供详细和有用的分析：\n\n${text}`,
      grammar: `请检查以下英文的语法错误，包括拼写、语法、标点和时态，并提供修改建议：\n\n${text}`,
      refine: `请润色以下邮件内容，使其更加专业、礼貌和表达清晰：\n\n${text}`
    };
    return prompts[action] || `请处理以下内容：\n\n${text}`;
  }

  // 保存到历史记录
  saveToHistory(action, originalText, result) {
    try {
      chrome.storage.local.get(['history'], (data) => {
        const history = data.history || [];
        const record = {
          id: Date.now(),
          action,
          originalText,
          result,
          timestamp: new Date().toISOString()
        };
        
        history.unshift(record);
        
        // 限制历史记录数量
        if (history.length > 100) {
          history.splice(100);
        }
        
        chrome.storage.local.set({ history });
      });
    } catch (error) {
      console.error('保存历史记录失败:', error);
    }
  }

  // 显示通知
  showNotification(message, type = 'info') {
    // 移除已存在的通知
    const existingNotification = document.querySelector('.llm-notification');
    if (existingNotification) {
      existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = `llm-notification llm-notification-${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    // 显示动画
    setTimeout(() => notification.classList.add('llm-notification-show'), 10);
    
    // 自动隐藏
    setTimeout(() => {
      notification.classList.remove('llm-notification-show');
      setTimeout(() => notification.remove(), 300);
    }, 3000);
  }

  // 复制到剪贴板
  copyToClipboard(text) {
    this.safeWriteClipboard(text);
  }

  fallbackCopyToClipboard(text) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.left = '-999999px';
    textArea.style.top = '-999999px';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
      document.execCommand('copy');
    } catch (err) {
      console.error('复制失败:', err);
    }
    
    document.body.removeChild(textArea);
  }

  // 安全的HTML转义
  escapeHtml(unsafe) {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }
}

// 全局错误处理器 - 专门处理Extension Context错误
window.addEventListener('error', (event) => {
  if (event.error && event.error.message && event.error.message.includes('Extension context invalidated')) {
    console.error('🚨 检测到Extension Context错误:', event.error.message);
    
    // 显示友好的错误提示
    if (window.llmAssistant && typeof window.llmAssistant.showNotification === 'function') {
      window.llmAssistant.showNotification('扩展已更新，请刷新页面', 'error');
    } else {
      // 如果主实例不可用，直接在页面显示提示
      const errorDiv = document.createElement('div');
      errorDiv.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background: #dc3545;
        color: white;
        padding: 12px 16px;
        border-radius: 8px;
        font-size: 14px;
        z-index: 10001;
        box-shadow: 0 4px 12px rgba(220, 53, 69, 0.3);
      `;
      errorDiv.textContent = '🚨 扩展上下文失效，请刷新页面';
      document.body.appendChild(errorDiv);
      
      setTimeout(() => {
        if (errorDiv.parentNode) {
          errorDiv.parentNode.removeChild(errorDiv);
        }
      }, 5000);
    }
    
    // 阻止默认的错误处理
    event.preventDefault();
    return false;
  }
});

// Promise rejection 错误处理器
window.addEventListener('unhandledrejection', (event) => {
  if (event.reason && event.reason.message && event.reason.message.includes('Extension context invalidated')) {
    console.error('🚨 检测到未处理的Extension Context Promise错误:', event.reason.message);
    
    // 显示友好的错误提示
    if (window.llmAssistant && typeof window.llmAssistant.showNotification === 'function') {
      window.llmAssistant.showNotification('扩展连接失效，请刷新页面', 'error');
    }
    
    // 阻止默认的错误处理
    event.preventDefault();
    return false;
  }
});

// 当DOM加载完成后初始化
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', () => {
    try {
      window.llmAssistant = new LLMContentScript();
      console.log('✅ LLM助手实例创建成功');
    } catch (error) {
      console.error('❌ LLM助手实例创建失败:', error);
      if (error.message.includes('Extension context invalidated')) {
        console.log('💡 建议：请刷新页面重新加载扩展');
      }
    }
  });
} else {
  try {
    window.llmAssistant = new LLMContentScript();
    console.log('✅ LLM助手实例创建成功');
  } catch (error) {
    console.error('❌ LLM助手实例创建失败:', error);
    if (error.message.includes('Extension context invalidated')) {
      console.log('💡 建议：请刷新页面重新加载扩展');
    }
  }
} 