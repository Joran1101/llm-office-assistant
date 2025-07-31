// Popup UI 脚本
class PopupManager {
  constructor() {
    this.initElements();
    this.bindEvents();
    // 先绑定事件，再加载配置和预设API Key
    this.loadSavedConfig().then(() => {
      this.presetApiKey();
    });
  }

  initElements() {
    this.apiKeyInput = document.getElementById('apiKey');
    this.saveBtn = document.getElementById('saveConfig');
    this.statusDiv = document.getElementById('configStatus');
  }

  async loadSavedConfig() {
    try {
      const { apiKey } = await chrome.storage.sync.get('apiKey');
      if (apiKey) {
        this.apiKeyInput.value = apiKey;
        this.showStatus('✅ API Key 已配置', 'success');
        return true;
      }
      return false;
    } catch (error) {
      console.error('加载配置失败:', error);
      return false;
    }
  }

  async presetApiKey() {
    // 预设API Key用于快速测试
    const presetKey = 'sk-9cacc18daf0649ad9725312e6a130697';
    try {
      const { apiKey } = await chrome.storage.sync.get('apiKey');
      if (!apiKey) {
        // 自动保存预设的API Key
        await chrome.storage.sync.set({ apiKey: presetKey });
        this.apiKeyInput.value = presetKey;
        this.showStatus('🚀 API Key 已自动配置完成！', 'success');
        
        // 自动测试连接
        setTimeout(() => {
          this.testApiConnection(presetKey);
        }, 1000);
      }
    } catch (error) {
      console.error('预设API Key失败:', error);
      this.showStatus('⚠️ 请手动输入API Key', 'error');
    }
  }

  bindEvents() {
    this.saveBtn.addEventListener('click', () => {
      this.saveConfig();
    });

    this.apiKeyInput.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') {
        this.saveConfig();
      }
    });

    this.apiKeyInput.addEventListener('input', () => {
      this.clearStatus();
    });

    // 添加一个快速配置按钮
    this.addQuickConfigButton();
  }

  addQuickConfigButton() {
    // 检查是否已经添加过按钮
    if (document.getElementById('quickConfigBtn')) return;

    const quickBtn = document.createElement('button');
    quickBtn.id = 'quickConfigBtn';
    quickBtn.className = 'btn';
    quickBtn.style.marginTop = '8px';
    quickBtn.style.background = 'rgba(255, 255, 255, 0.1)';
    quickBtn.textContent = '🚀 一键配置测试API Key';
    
    quickBtn.addEventListener('click', async () => {
      const testKey = 'sk-9cacc18daf0649ad9725312e6a130697';
      this.apiKeyInput.value = testKey;
      await this.saveConfigWithKey(testKey);
    });

    this.saveBtn.parentNode.insertBefore(quickBtn, this.saveBtn.nextSibling);
  }

  async saveConfig() {
    const apiKey = this.apiKeyInput.value.trim();
    await this.saveConfigWithKey(apiKey);
  }

  async saveConfigWithKey(apiKey) {
    if (!apiKey) {
      this.showStatus('❌ 请输入有效的API Key', 'error');
      return;
    }

    // 简单验证API Key格式
    if (!apiKey.startsWith('sk-') || apiKey.length < 20) {
      this.showStatus('❌ API Key格式不正确', 'error');
      return;
    }

    this.saveBtn.disabled = true;
    this.saveBtn.textContent = '保存中...';

    try {
      await chrome.storage.sync.set({ apiKey });
      this.showStatus('✅ 配置保存成功！', 'success');
      
      // 测试API连接
      setTimeout(() => {
        this.testApiConnection(apiKey);
      }, 500);
    } catch (error) {
      console.error('保存配置失败:', error);
      this.showStatus('❌ 保存失败，请重试', 'error');
    } finally {
      this.saveBtn.disabled = false;
      this.saveBtn.textContent = '保存配置';
    }
  }

  async testApiConnection(apiKey) {
    try {
      this.showStatus('🔄 正在测试API连接...', 'success');
      
      const response = await fetch('https://api.deepseek.com/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'deepseek-chat',
          messages: [
            {
              role: 'user',
              content: 'Hello'
            }
          ],
          max_tokens: 10
        })
      });

      if (response.ok) {
        this.showStatus('🎉 API连接测试成功！插件已就绪', 'success');
      } else {
        const errorData = await response.json().catch(() => ({}));
        this.showStatus(`⚠️ API测试失败: ${errorData.error?.message || response.statusText}`, 'error');
      }
    } catch (error) {
      console.error('API测试失败:', error);
      this.showStatus('🔧 配置已保存，请尝试使用功能', 'success');
    }
  }

  showStatus(message, type) {
    this.statusDiv.className = `status ${type}`;
    this.statusDiv.textContent = message;
    this.statusDiv.style.display = 'block';
  }

  clearStatus() {
    this.statusDiv.style.display = 'none';
  }
}

// 初始化
document.addEventListener('DOMContentLoaded', () => {
  new PopupManager();
});